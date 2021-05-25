'use strict'

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);
const HTTP = require('http')
const net = require('net')
const fti = require('./fti-flash-node/index.js');
const arloc = fti.ArmFind;
const crypto = require('crypto')
const parser = require('http-string-parser')
const zlib = require('zlib')
const unzip = zlib.createGunzip();

const NetPollEvents = require('./netpoll_sandbox.js')
const tftp = require('tftp');
const PassThrough = require('stream').PassThrough;
const UdpParamServer = require('./udpserver.js')
const helmet = require('helmet');
const cp = require('child_process')
const WebSocket = require('ws')
const wss = new WebSocket.Server({server:http})
const stream = require('stream')
const os = require('os');
const sys = require('sys');
const exec = require('child_process').exec;
const crc = require('crc');
var  NetworkInfo  = require('simple-ifconfig').NetworkInfo;
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

function locateUnicast (addr,cb, appName) {

  var ifaces = os.networkInterfaces();
  var iface = IFACE
  var nf;// = ifaces[iface];
  if(ifaces[iface][0].family == 'IPv4'){
    nf = ifaces[iface][0]
  }else{
    nf = ifaces[iface][1]
  }
  exec('sudo route',function(err, stdout, stderr){
    var rarr = stdout.split('\n')
    var rin = -1
    for(var i=0; i<rarr.length; i++){
      if(rarr[i].indexOf('default') != -1){
        rin = i;
      }
    }
    if(rin != -1){
      var garr = rarr[rin].split(/\s+/);
      var gw = garr[1]
      relaySockMsg('gw', gw)
    }    
  })
  relaySockMsg('nif', nf);
   
  Helper.scan_for_dsp_board(function (e){
    dets = e
    dspips = [];
    nvdspips = [];
    for(var i = 0; i < e.length; i++){
      if(e[i].board_type == 1){
        var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
        var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});

      if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
        //dsp not visible
        //console.log('dsp not visible')
        //if(cw){
          if(e[i].app_name == appName){
            nvdspips.push(e[i])
          }
        //}else{
          //nvdspips.push(e[i])
       // }
        

       
        }else if(e[i].ver == '20.17.4.27'){
          //Hack, seeing a 170427 on the network seems to cause this to crash. should actually check for versions properly in the future to ignore incompatible version.
          //console.log('ignore this version')
        }else{
          //console.log('dsp visible')
            if(e[i].app_name == appName){
              dspip = ip.join('.');
              macs[dspip] = e[i].mac
              dspips.push(e[i]);
            }
          
        }
       }
     }

    var dsps = []
    for(var i = 0; i < dspips.length;i++){
      //console.log(dspips[i].ip)

     if(!clients[dspips[i].ip]){
        dsps.push(dspips[i])
     }
    }
    if((dspips.length == 0)&&(nvdspips.length >0)){
      relaySockMsg('notvisible', nvdspips);
    }
    console.log('')
    initSocks(dsps.slice(0),cw, function(){relaySockMsg('locatedResp', dspips);});
       
    if(cb){cb(e.slice(0))} 

  },addr);
}

function initSocks(arr,cb){
  dsp_ips = [];
  vdefs = {};
  nVdfs = {};
  pVdefs = {};
  clients = {};
  nphandlers = {};
  accountJSONs = {};


  for(var i = 0; i<arr.length; i++){
    dsp_ips.push(arr[i].ip)
  }
  udpCon('init', cb)
}
function udpCon(ip, cb){
  if(ip == 'init'){
    console.log('init')
    if(dsp_ips.length != 0){
     getVdef(dsp_ips[0], function(_ip,vdef){
        console.log('this is the first one')
        vdef = null;
        udpCon(_ip, cb)
      },function(_ip){
        udpCon(_ip, cb)
      })

    }else{
      cb()
    }
  }else if(dsp_ips.indexOf(ip) != -1){
    var ind = dsp_ips.indexOf(ip);
    if(ind + 1 <dsp_ips.length){
      getVdef(dsp_ips[ind+1], function(_ip,vdef){
        vdef = null;
        udpCon(_ip, cb)
      },function(_ip){
        udpCon(_ip,cb)
      })
      
    }else{
      cb();
    }
   
  }
}

function udpConSing(ip,app){
  if(dsp_ips.indexOf(ip) == -1){
    return;
  }
  if(typeof udpClients[ip] == 'undefined'){
   
    udpClients[ip] = null;
    udpClients[ip] = new UdpParamServer(ip ,udpCallback, vdefs[ip], app)
       _deps[ip] = {}

          getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] == 'undefined'){
        console.log('starting netpoll')
       // nphandlers[__ip] = new NetPollEvents([{'ip':__ip,'detector_name':"DET"}],[vdef],write_netpoll_events, relaySockMsg)
      }

    },function(e){
      //console.log('failed getting vdef from ', e)
    })
        
       
    //console.log(udpClients)
  }else{
    console.log('should come here!')
  //  console.log(Objects.keys(udpClients));
    udpClients[ip].refresh();
 

  getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] == 'undefined'){
        console.log('starting netpoll')
      }

    },function(e){
      //console.log('failed getting vdef from ', e)
    })
  }
}

function relayParamMsg(packet) {
	for(var pid in passocs){
      passocs[pid].relayParsed(packet);
  	}
  	packet = null;
}
function relayRpcMsg(packet){
  //console.log('relayRpcMsg')
  for(var pid in rassocs){
    // //console.log(pid)
    rassocs[pid].relay(packet);
  }
  packet = null;
}
function relaySockMsg(ev,arg){
  for(var sid in sockrelays){
    sockrelays[sid].relay(ev,arg)
  }
}
function sendRpcMsg(packet){
  for(var pid in rassocs){
    rassocs[pid].send(packet)
  }
  packet = null;
}

function getVdef(ip, callback,failed){
  if(fs.existsSync('/tmp/vdef.json')){
    getVdefFromTmp(ip, callback, failed)
  }else{
    var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  	var get = tclient.createGetStream('/flash/vdef.json')
      var rawVdef = [];
      get.on('data', (chnk)=>{
        rawVdef.push(chnk)//zlib.gunzipSync(chnk);
        chnk = null;
      })
      get.on('end', ()=>{
      var buffer = Buffer.concat(rawVdef)
      zlib.unzip(buffer, function(er,b){
        if(typeof b == 'undefined'){
          return;
        }
        var vdef = JSON.parse(b.toString())
        if(typeof vdef['@defines'] != 'undefined'){
            vdefs[ip] = vdef; 
            //this part will depend on the number of records we have in our vdef for xray
            var nvdf = [[],[],[],[],[],[],[],[],[],[],[],[]];
            var pVdef = [{},{},{},{},{},{},{},{},{},{},{},{}];
            vdef['@params'].forEach(function (p) {
              if(("username" == p["@type"])||("user_lev" == p["@type"])||("user_pass_reset" == p["@type"])||("user_opts" == p["@type"])||("password_hash" == p["@type"])){
                nvdf[7].push(p['@name'])
                pVdef[7][p['@name']] = p
              }else if(p["@rec"] > 5){
                nvdf[p["@rec"]+2].push(p['@name'])
                pVdef[p['@rec']+2][p['@name']] = p
              }else{
                nvdf[p["@rec"]].push(p['@name'])
                pVdef[p['@rec']][p['@name']] = p
              }
            })
            for(var p in vdef['@deps']){
              nvdf[vdef['@deps'][p]['@rec']].push(p)
              pVdef[vdef['@deps'][p]['@rec']][p] = vdef['@deps'][p]
            }
            pVdef[6] = vdef["@deps"]
            nVdfs[ip] = nvdf
            pVdefs[ip] = pVdef
            vdef = null;
            b = null;
            get.abort()     
            tclient = null; 

        }
        failed(ip)     
      })
      rawVdef = null;
      buffer = null;
    })
    
    get.on('error',(e)=>{
      rawVdef = null;
      tclient = null;
      if(failed){
        failed(ip);
      }
    })
  }
}
function getVdefFromTmp(ip,callback,failed){
    fs.readFile('/tmp/vdef.json', (err, buffer)=>{
	    zlib.unzip(buffer, function(er,b){
	        if(typeof b == 'undefined'){
	          return;
	        }
	        var vdef = JSON.parse(b.toString())
	        if(typeof vdef['@defines'] != 'undefined'){
	             vdefs[ip] = vdef; 
	            var nvdf = [[],[],[],[],[],[],[],[],[],[],[],[]];
	            var pVdef = [{},{},{},{},{},{},{},{},{},{},{},{}];
	            vdef['@params'].forEach(function (p) {
	              if(("username" == p["@type"])||("user_lev" == p["@type"])||("user_pass_reset" == p["@type"])||("user_opts" == p["@type"])||("password_hash" == p["@type"])){
	                nvdf[7].push(p['@name'])
	                pVdef[7][p['@name']] = p
	              }else if(p["@rec"] > 5){
	                nvdf[p["@rec"]+2].push(p['@name'])
	                pVdef[p['@rec']+2][p['@name']] = p
	              }else{
	                nvdf[p["@rec"]].push(p['@name'])
	                pVdef[p['@rec']][p['@name']] = p
	              }
	            })
	            for(var p in vdef['@deps']){
	              nvdf[vdef['@deps'][p]['@rec']].push(p)
	              pVdef[vdef['@deps'][p]['@rec']][p] = vdef['@deps'][p]
	            }
	            pVdef[6] = vdef["@deps"]
	            nVdfs[ip] = nvdf
	            pVdefs[ip] = pVdef
	            vdef = null;
	            b = null;
	           
	        }
	        failed(ip)     
	    })
	    buffer = null;
   	})
}
function processParam(e, _Vdef, nVdf, pVdef, ip) {
  var rec_type = e.readUInt8(0)
  var buf = e.slice(1)
  var n = e.length

  var pack;
  var rec = {};
   var userrec = {};
  if(rec_type == 0){
    nVdf[0].forEach(function (p) {
      rec[p] = getVal(buf, 0, p, pVdef,_deps[ip])
    })
    for(var p in _Vdef["@deps"]){
      //console.log('deps 0 ',p)
      if(_Vdef["@deps"][p]["@rec"] == 0){
        _deps[ip][p] = rec[p]
       //rec[p] = getVal(buf,0, p, pVdef);
      }
    }
    pack = {type:0, rec:rec}



    //system
  }else if(rec_type == 1){
    nVdf[1].forEach(function (p) {
      rec[p] = getVal(buf, 1, p, pVdef,_deps[ip])
      // body...
    })
    for(var p in _Vdef["@deps"]){
      if(_Vdef["@deps"][p]["@rec"] == 1){
        _deps[ip][p] = rec[p]
       //rec[p] = getVal(buf,0, p, pVdef);
      }
    }
     pack = {type:1, rec:rec}
  }else if(rec_type == 2){
    nVdf[2].forEach(function (p) {
     // console.log(p)
      rec[p] = getVal(buf, 2, p, pVdef,_deps[ip])
      // body...
    })
   
    pack = {type:2, rec:rec}
    
  }else if(rec_type == 3){
     nVdf[3].forEach(function (p) {
      //need to account for user objects here. 
     // if(p)

      rec[p] = getVal(buf, 3, p, pVdef,_deps[ip])
    //  console.log(p, rec[p])
      // body...
    })
   
    nVdf[7].forEach(function (p) {
      //need to account for user objects here. 
     // if(p)
      userrec[p] = getVal(buf, 7, p, pVdef,_deps[ip])
      // body...
    })
    console.log('user rec', userrec)
    var usernames = []
    var accArray = []
    for(var i = 0; i< _Vdef['@defines']['MAX_USERNAMES']; i++){
      usernames.push({username:userrec['UserName'+i], acc:userrec['UserOptions'+i],preset:userrec['UserPassReset'+i]});
      accArray.push({username:userrec['UserName'+i], opt:userrec['UserOptions'+i], phash:userrec['PasswordHash'+i],preset:userrec['UserPassReset'+i]})
    }
    if(typeof _tempAccounts[ip] == 'undefined'){
     _tempAccounts[ip] = accArray.slice(0)     
    }

    _accounts[ip] = accArray.slice(0)

    relayUserNames({det:{ip:ip, mac:macs[ip], data:{type:6, rec:userrec, array:usernames}}})

    pack = {type:3, rec:rec}
    
  }else if(rec_type == 4){
    nVdf[4].forEach(function (p) {
      rec[p] = getVal(buf, 4, p, pVdef,_deps[ip])
      // body...
    })

    pack = {type:4, rec:rec}
  }else if(rec_type == 5){
     nVdf[5].forEach(function (p) {
      rec[p] = getVal(buf, 5, p, pVdef,_deps[ip])
      // body...
    })

    pack = {type:5, rec:rec}
  }else if(rec_type == 6){
     nVdf[8].forEach(function (p) {
      rec[p] = getVal(buf, 8, p, pVdef,_deps[ip])
      // body...
    })

    pack = {type:6, rec:rec}
  }else if(rec_type == 7){
     nVdf[9].forEach(function (p) {
      rec[p] = getVal(buf, 9, p, pVdef,_deps[ip])
      // body...
    })

    pack = {type:7, rec:rec}
  }else if(rec_type == 8){
     nVdf[10].forEach(function (p) {
      rec[p] = getVal(buf, 10, p, pVdef,_deps[ip])
      // body...
    })

    pack = {type:8, rec:rec}
  }else if(rec_type == 15){
    console.log(rec_type,'Prod Rec')
    var prodNo = buf.readUInt16LE(0);
    var pbuf = buf.slice(2)
    nVdf[1].forEach(function(p) {
      // body...
      rec[p] = getVal(pbuf, 1, p, pVdef,_deps[ip])
    })
    pack = {type:15,rec:rec,prodNo:prodNo, raw:pbuf}
  }
 // data = null;

  relayParamMsg({det:{ip:ip, mac:macs[ip]}, data:pack});
 
  nVdf = null;
  pVdef = null;
  e = null;
  rec = null;
  userrec = null;
  buf = null;
 // pack.det = {ip:ip}
  pack = null;
}

const udpCallback = function(_ip,e,app){
    if(e){
    	if(vdefs[_ip]){
    		processParamCW(e,vdefs[_ip],nVdfs[_ip],pVdefs[_ip],_ip)
    	}
    }
    _ip = null;
    e = null;
}


var PORT = 3300;
var IFACE = 'eth0'
let _TOUCHSCREEN_ADDR = '192.168.10.20'


if(process.argv.length >= 2){
  console.log('args: ',process.argv)
  var args = process.argv.slice(-2)
 PORT =  parseInt(args[0]);
 IFACE = args[1]
}else{
  console.log('process argv length ', process.argv.length)
}

app.set('port', (process.env.PORT || PORT));
app.use('/', express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

app.get('/xray',function(req,res){
  res.render('xray.html') 
})

http.listen(app.get('port'), function () {
	// body...
})

wss.on('error',function(error){})

wss.on('connection', function(scket,req){
	scket.on('error', function () {
		// body...
		scket.close();
	})
	req.on('error', function(err){
  	})
  	var socket = new FtiSockIOServer(scket)
  	socket.on('close',function(){
    	socket.destroy();
    	socket = null;  
  	})
  	 socket.on('locateUnicast', function (addr) {
    	var APP_NAME = 'FTI_XRAY'
    	// APP_NAME should match the app name returned via fti arm 
    	locateUnicast(addr,function(){ console.log('located')}, APP_NAME)
	});
  	socket.on('locateReq',function(APP_NAME){
  	 	var ifaces = os.networkInterfaces();  
    	var iface = IFACE
        var nf;// = ifaces[iface];
	    if(ifaces[iface][0].family == 'IPv4'){
	      nf = ifaces[iface][0]
	    }else{
	      nf = ifaces[iface][1]
	    }
	    exec('sudo route',function(err, stdout, stderr){
	      var rarr = stdout.split('\n')
	      var rin = -1
	      for(var i=0; i<rarr.length; i++){
	        if(rarr[i].indexOf('default') != -1){
	          rin = i;
	        }
	      }
	      if(rin != -1){
	        var garr = rarr[rin].split(/\s+/);
	        var gw = garr[1]
	        socket.emit('gw', gw)
	      }
	    })
	    socket.emit('nif', nf);
	    Helper.scan_for_dsp_board(function (e) {
	      dets = e
	      nvdspips = [];
	      var cwips = []
	      for(var i = 0; i < e.length; i++){
	       
	        if(e[i].board_type == 1){
	          var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
	          var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});
	          if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
	            nvdspips.push(e[i])
	          }else if(e[i].ver == '20.17.4.27'){

	          }else{
	            dspip = ip.join('.');
	            macs[dspip] = e[i].mac
	            if(e[i].app_name == APP_NAME){
	              cwips.push(e[i])
	            }
	          }
	        }
	      }
	      var dsps = []
	      for(var i = 0; i < dspips.length;i++){
	        if(!clients[dspips[i].ip]){
	          dsps.push(dspips[i])
	        }
	      }
	      if((dspips.length == 0)&&(nvdspips.length >0)){
	        socket.emit('notvisible', nvdspips);
	      }
	      initSocks(dsps.slice(0), function(){
	      socket.emit('locatedResp',cwips)
	         
	      });
	    });
  	})
  	socket.on('connectToUnit', function(u){
	   udpConSing(u.ip,u.app)
    
     	if(vdefs[u.ip]){
            socket.emit('vdef',[vdefs[u.ip],u])
        }else{
            socket.emit('noVdef', u)
        }
  })
})