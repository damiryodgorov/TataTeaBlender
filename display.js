'use strict'

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const HTTP = require('http')
const net = require('net')
const WebSocket = require('ws')
const wss = new WebSocket.Server({server:http})
const fti = require('./fti-flash-node/index.js');
const helmet = require('helmet');
const cp = require('child_process')
const sys = require('sys');
const exec = require('child_process').exec;
var  NetworkInfo  = require('simple-ifconfig').NetworkInfo;
const arloc = fti.ArmFind;

var PORT = 3300;
var IFACE = 'eth0'

let passocs = {}
let rassocs = {}
let nassocs = {}
let sockrelays = {}
let rconns = {}
let dsp_ips = []
let clients = {};
let udpClients = {};
let vdefs = {};
let nVdfs = {};
let pVdefs = {};
let nphandlers = {};
let accountJSONs = {};
let macs = {}
//let networking = new NetworkInfo();

if(process.argv.length >= 2){
  console.log('args: ',process.argv)
  var args = process.argv.slice(-2)
 PORT =  parseInt(args[0]);
 IFACE = args[1]
}else{
  console.log('process argv length ', process.argv.length)
}
class FtiHelper{
  constructor(ip){
 

  }

  get_interface_ip(mac){
    var host_mac = mac.split(/[-]|[:]/).map(function(e){
      return parseInt("0x"+e);
    }) 
  }
  change_dsp_ip(callBack){
    var self = this;
    this.scan_for_dsp_board(function(e){
      callBack(e);
      self.send_ip_change(e)
    })
  }
  scan_for_dsp_board(callBack,addr){
    //console.log('scan')
    arloc.ArmLocator.scan(1000, function(e){
     // //console.log(e)
      callBack(e)
    }, addr)
  }
  send_ip_change(e){
    var ds;
    e.forEach(function(board){
      if(board.board_type==1){
        ds = board
      }
    })
    var nifip = ds.nif_ip
    var ip = nifip.split('.').map(function(e){return parseInt(e)});
    var n = ip[3] + 1;
    if(n==0||n==255){
      n = 50
    }
    var new_ip = [ip[0],ip[1],ip[2],n].join('.');
    var querystring = "mac:" + e[0].mac+ ", mode:static, ip:" + new_ip + ", nm:255.255.255.0"
    ArmConfig.parse(querystring);

  }
}
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
    //  clients[self.id] = null;
      rassocs[self.id] = null;
      nassocs[self.id] = null;
      sockrelays[self.id] = null;
     //  self.destroy();
     delete passocs[self.id]
  //   delete clients[self.id]
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
     //   clients[self.id] = null;
        rassocs[self.id] = null;
      nassocs[self.id] = null;
      sockrelays[self.id] = null;
     //  self.destroy();
     delete passocs[self.id]
 //    delete clients[self.id]
     delete rassocs[self.id]

     delete nassocs[self.id]

     delete sockrelays[self.id]
     delete this;
   }
}

process.on('uncaughtException', (err) => {
  var errstring = err.toString();
  if(err.stack){
    errstring = err.stack.toString();
  }
  fs.writeFileSync(__dirname +'/error.txt', errstring);
  exec('sudo sh reboot.sh',function(){
    process.abort();
  })
  
});
console.log('starting ts on '+PORT)
var Helper = new FtiHelper();
app.set('port', (process.env.PORT || PORT));
app.use('/', express.static(path.join(__dirname,'public')));
//console.log('dirname:' + __dirname)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', function(req, res) {
  res.render('index.html');
});
app.use(helmet());
app.on('error', function(err){
  //console.log(err)
})

http.listen(app.get('port'), function(){});




wss.on('error', function(error){

})
//wss.on('')
wss.on('connection', function(scket, req){ 
  //console.log(1360, scket)
  let loginLevel = 0;
  let curUser = '';
  var fileVer = 0;
  scket.on('error', function(err){
    //console.log('this is a socket error', err)
    scket.close();
  })
  req.on('error', function(err){
  })
  var socket = new FtiSockIOServer(scket)
  socket.on('locateReq',function(cw) {
  	// body...

  	//    socket.emit('nif', nf);
    var dets;
    Helper.scan_for_dsp_board(function (e) {
      dets = e
      var cwips = []
      for(var i = 0; i < e.length; i++){
      	var dspip;
        if(cw){
          console.log(e[i])
        }
        if(e[i].board_type == 1){
          var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
          var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});
          if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
           }else if(e[i].ver == '20.17.4.27'){

          }else{
            dspip = ip.join('.');
           // macs[dspip] = e[i].mac
            //dspips.push(e[i]);
            if(cw){
              console.log(e[i].app_name)
              if(e[i].app_name == 'FTI_CW'){
                console.log(1804, JSON.stringify(e[i]))
                cwips.push(e[i])
              }
            }
          }
        }
      }
     
        if(cw){
          console.log('should come here')
          socket.emit('locateResp',cwips)
         
        }
 
      });
    });
  	socket.on('getLink', function () {
  		var link = ''
  		var linkJSON = {'link':link}
  		var fnm = 'json/lastLink.json'
  		if(fs.existsSync(path.join(__dirname, fnm))){
      		fs.readFile(path.join(__dirname, fnm), (err,data) =>{
        	try{
          		linkJSON = JSON.parse(data)
          		link = linkJSON.link
          		socket.emit('lastLink',link)
        	}catch(e){
        	
        	}});
        }
  		// body...
  	})
  	socket.on('saveLink', function (link) {
  		// body...
  		console.log('saveLink', link)
  		var linkJSON = {'link':link}
  		var fnm = 'json/lastLink.json'
  		fs.writeFile(path.join(__dirname, fnm) , JSON.stringify(linkJSON), function (e) {
  			// body...
  			console.log('file should be written?')
  			console.log(e)
  		});
  	})
  })

