'use strict'
/**IMPORTS START**/
const fs = require('fs');
var dgram = require('dgram');
const path = require('path');
const express = require('express');
var aesjs = require('aes-js');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws')
const wss = new WebSocket.Server({server:http})
const fti = require('./fti-flash-node/index.js');
var crypto = require('crypto');
const arloc = fti.ArmFind;
const armRpc = fti.ArmRpc;
/**IMPORT ENDS */

/**CLASSES AND VARIABLE DECLARATIONS */
let passocs = {}
let rassocs = {}
let nassocs = {}
let sockrelays = {}
var PORT = 3300;
var MASTER_KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
var registrationPacket;
var session_key;
var dspip;
var arm;
var dets;
var dspips = [];
var nvdspips = [];
//var dspip = "192.168.10.51";
let macs = {}

class FtiSockIOServer{
    constructor(sock){
      this.sock = sock
      this.open = false;
      this.handlers = {}
      var self = this;
      sock.on('message',function (message) {
        // body...
        //if(message.data){
      try{
          var msg = JSON.parse(message)
          self.handle(msg.event, msg.data);
         // msg = null;
       }catch(e){
          //console.log(message)
          //console.log(e)
       }
      
     
        
        message = null;
       // msg = null;
      })
      sock.on('close', function () {
        console.log('closing socket')
         // body..
        sock.removeAllListeners();
        passocs[self.id] = null;
        rassocs[self.id] = null;
        nassocs[self.id] = null;
        sockrelays[self.id] = null;
       //  self.destroy();
       delete passocs[self.id]
       delete rassocs[self.id]
       delete nassocs[self.id]
       delete sockrelays[self.id]
       self.destroy();
      }) 
      this.id = Date.now();
  
    }
    handle(ev,data){
      if(this.handlers[ev]){
          this.handlers[ev].handler(data)
        }
    }
    on(handle, func){
      this.handlers[handle] = {}
      this.handlers[handle].handler = func
    }
    emit(handle,data){
      if(this.sock.readyState == 1){
        this.sock.send(JSON.stringify({event:handle,data:data}));
        data = null;
      }
    }
    destroy(){
      var self = this;
      passocs[self.id] = null;
      rassocs[self.id] = null;
      nassocs[self.id] = null;
      sockrelays[self.id] = null;
      delete passocs[self.id]
      delete rassocs[self.id]
      delete nassocs[self.id]
      delete sockrelays[self.id]
      delete this;
    }
}
class FtiHelper{
    constructor(ip){  
    }
    scan_for_dsp_board(callback,addr){
      arloc.ArmLocator.scan(1000, function(e){
        var dspBoard;
        console.log("all devices found",e);
        for(var i = 0;i<e.length; i++){
          if(e[i].board_type == 1 && e[i].board_id == 5 && e[i].app_name == 'FTI_APP' && e[i].f_ip == '192.168.10.50')
          {
            dspBoard = e[i];
          }
        }
        dspip = dspBoard.ip;
        session_key = dspBoard.s_key;
        console.log("address",dspip)
        arm = new fti.ArmRpc.ArmRpcBase(dspip);
        callback();
      }, addr)
    }
}
var Helper = new FtiHelper();
/**FUNCTIONS DECLARATIONS */
function hex2bin(hex){
  return ("00000000" + (parseInt(hex, 16)).toString(2)).substr(-8);
}
/**MIDDLEWARE declaration */
app.set('port', (process.env.PORT || PORT));
app.use(express.static("public"))

/**UDP DATAGRAM SOCKET FOR THE DSP COMMUNICATION */
console.log("DSP socket initialization")
var dspSocket = dgram.createSocket('udp4');
dspSocket.bind(5000,'0.0.0.0');

/**RUNNING THE NODE SERVER */
http.listen(app.get('port'), function(){
  console.log("Server is running on PORT "+app.get('port'))
});

/**START OF WEBSOCKET CONNECTION */

wss.on('connection', function(scket, req){ 

    Helper.scan_for_dsp_board(function(){
      registrationPacket = arm.armRpcLcdRegister(session_key)
      setInterval(()=>{
        dspSocket.send(registrationPacket,0,registrationPacket.length,10002,dspip)
      },1000)
    });
    /**Registering the display and sending the registration packet */
   
    scket.on('error', function(err){
        scket.close();
      })
      req.on('error', function(err){
      })
    var socket = new FtiSockIOServer(scket)

    socket.on("buttonClicked",(buttonName)=>{
        var newButtonClickedPacket = arm.armRpcButtonClicked(buttonName,session_key)
        dspSocket.send(newButtonClickedPacket,0,newButtonClickedPacket.length,10002,dspip)
    })
    socket.on('error', (err) => {
        console.log(err.message)
    });

    dspSocket.on('message',function(e,rinfo){
      //Parsing the Meter LED 1st byte of the Received Packet
      var meterLED = e.slice(1,2).toString('hex');
      var binaryValueByte1 = hex2bin(meterLED);
      var productHigh = binaryValueByte1.slice(3,4);   
      var productNormal = binaryValueByte1.slice(2,3);
      var ledDetect = binaryValueByte1.slice(1,2);
      var ledPosition = binaryValueByte1.slice(4,8)
      ledPosition = parseInt(ledPosition, 2);
      //Parsing the Other LED 2nd byte of the Received Packet
      var otherLED = e.slice(2,3).toString('hex');
      var binaryValueByte2 = hex2bin(otherLED);
      var ledFault = binaryValueByte2.slice(3,4);
      var lcdBacklight = binaryValueByte2.slice(5,6);
      //Parsing the Cursor Position 3rd byte of the Received Packet
      var cursorPosition = e.slice(3,4).toString('hex');
      cursorPosition = parseInt(cursorPosition, 16);
 
      /**String lines */
      var textValue = e.slice(5,45).toString();

      var textPacket = [productHigh,productNormal,ledDetect,ledFault,lcdBacklight,textValue,ledPosition,cursorPosition];
      socket.emit("getPackets",textPacket);
		})

})
/**END OF WEBSOCKET CONNECTION */



