'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');

const KAPI_RPC_UDPWEBPARMS = 104;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;

const DRPC_NUMBER = 19;
const WP_RPC = 13;

class UdpParamServer{
  constructor(ip,callback){
    var self = this;
    this.ip = ip
    this.callback = callback;
    this.busy = false
    this.dsp = null
    self.init_udp_param_server();

  }
  init_udp_param_server(){
    var self = this;
    var so = dgram.createSocket('udp4');
    so.on("listening", function () {
      self.init_params_stream(so.address().port)
      // body...
    } );
    so.on('message', function(e,rinfo){
      if(self.ip == rinfo.address){
        if(e){
          self.parse_params(e)
        }
      }
    })
    so.bind({address:'0.0.0.0',port:0,exclusive:true})
  }
  init_params_stream(port){
    var FtiRpc = Fti.Rpc.FtiRpc;
    var self = this;
    var dsp = FtiRpc.udp(this.ip);
    this.dsp = dsp
    console.log(port)
    var arm = new Fti.ArmRpc.ArmRpc(this.ip);
    arm.dsp_open_cb(function(){
         dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_UDPWEBPARMS,port]);
      
    });
    
  }
  parse_params(e){
    if(e){
      //console.log(e)
      this.callback(this.ip,e)
    }
  }
  send_rpc(e, cb){
    this.dsp.rpc2(e, cb)
  }
}

module.exports = UdpParamServer;