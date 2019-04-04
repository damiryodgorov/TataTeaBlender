'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');

const KAPI_RPC_UDPWEBPARMS = 104;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;
const DRPC_NUMBER = 19;
const WP_RPC = 13;
const UDP_PORT = 10011

class UdpParamServer{
  constructor(ip,callback, vdef){
    var self = this;
    this.ip = ip
    this.vdef = vdef
    this.callback = callback;
    this.busy = false
    this.dsp = null
    self.init_udp_param_server();

  }
  destroy(){
    this.callback = null;

  }
  release_sock(){
     //this.so.bind({address:'0.0.0.0',port:0})
    this.so.unref();
    this.so = null;
  }
  init_udp_param_server(){
    //console.log('init udp param server')
    var self = this;
    if(this.so){
      this.so.removeAllListeners();
      this.so = null;
    }
    this.so = dgram.createSocket({type:'udp4',reuseAddr:true});
    this.so.on("listening", function () {
      self.init_params_stream(self.so.address().port)
      // body...
    } );
    this.so.on('message', function(e,rinfo){
      if(self.ip == rinfo.address){
        if(e){
          self.parse_params(e)
          e = null;
          rinfo = null;
        }
      }
    })
      //this.init_params_stream()
      this.so.bind({address:'0.0.0.0',port:UDP_PORT})


  }
  init_params_stream(port){
    var FtiRpc = Fti.Rpc.FtiRpc;
    var self = this;
    var dsp = FtiRpc.udp(this.ip);
    this.dsp = dsp
    //console.log(port)
   //var arm = new Fti.ArmRpc.ArmRpc(this.ip);
    //arm.dsp_open_cb(function(){
      if(this.vdef){
         dsp.rpc0(DRPC_NUMBER,[this.vdef['@rpc_map']['KAPI_RPC_UDPWEBPARAMS'][1][0],port]);
       }else{
         dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_UDPWEBPARMS,port]);
       }
      
   // });
    
  }
  parse_params(e){
    if(e){
      ////console.log(e)
      if(this.callback){
        this.callback(this.ip,e);
      
      }
     }
    e = null;
  }
  send_rpc(e, cb){
    this.dsp.rpc2(e, cb)
  }
}

module.exports = UdpParamServer;