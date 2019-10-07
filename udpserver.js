'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');

const KAPI_RPC_UDPWEBPARMS = 520;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;
const DRPC_NUMBER = 19;
const WP_RPC = 13;
const UDP_PORT = 10011

class UdpParamServer{
  constructor(ip,callback, vdef, app){
    console.log('creating udp param server')
    var self = this;
    this.ip = ip
    this.vdef = vdef
    this.app = app
    this.callback = callback;
    this.busy = false
    this.dsp = null
    self.init_udp_param_server();

  }
  destroy(){
    this.callback = null;

  }
  refresh(){
    this.init_params_stream(this.so.address().port)
  }
  release_sock(){
     //this.so.bind({address:'0.0.0.0',port:0})
    this.so.removeAllListeners("listening");
    this.so.removeAllListeners("message");  
    this.so.unref();
    this.so = null;
  }
  init_udp_param_server(){
    //console.log('init udp param server')
    var self = this;
    if(this.so){
      this.so.removeAllListeners("listening");
      this.so.removeAllListeners("message")
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
          //console.log('come on')
          self.parse_params(e)
          e = null;
          rinfo = null;
        }
      }
    })
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
        console.log('Here is the vdef')
         dsp.rpc0(DRPC_NUMBER,[this.vdef['@rpc_map']['KAPI_RPC_UDPWEBPARAMS'][1][0],port]);
       }else{
        console.log('No VDef')
         dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_UDPWEBPARMS,port]);
       }
      
   // });
    
  }
  parse_params(e){
    if(e){
      ////console.log(e)
      if(this.callback){

        this.callback(this.ip,e, this.app);
      
      }
     }
    e = null;
  }
  send_rpc(e, cb){
    this.dsp.rpc2(e, cb)
  }
}

module.exports = UdpParamServer;