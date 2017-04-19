'use strict'

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const HTTP = require('http')
const net = require('net')
const io = require('socket.io')(http);
const fti = require('./fti-flash-node/index.js');
const arloc = fti.ArmFind;
const flatfile = require('flat-file-db')
const crypto = require('crypto')
const parser = require('http-string-parser')
const zlib = require('zlib')
const unzip = zlib.createGunzip();
const unzipResponse = require('unzip-response')
const NetPollEvents = require('./netpoll_events_server.js')
const tftp = require('tftp');
const PassThrough = require('stream').PassThrough;
const UdpParamServer = require('./udpserver.js')
const helmet = require('helmet');

var db = flatfile('./dbs/users.db')



db.on('open', function() {
  //db.clear()
  //var hs = crypto.createHash('sha256').update('515151').digest('base64');
  //db.put('admin',{level:5,pw:hs})
  console.log(db.keys())
});


var WebSocket = require('websocket')
var WebSocketClient = WebSocket.client
var W3CWebSocket = WebSocket.w3cwebsocket;


var prefs;

var cur = Date.now()

let passocs = {}
let rassocs = {}
let nassocs = {}
let rconns = {}
let dsp_ips = []

function load_vdef_parameters(json){
 // console.log(json)
  return json;
}
function write_netpoll_events(message, ip){
  console.log("Writing NetpollEvents from " + ip);
  console.log(message);
  var msg = {det:{ip:ip}, data:message}
  relayNetPoll(msg)
  msg = null;
  ip = null;
  message = null;
}

function initSocks(arr){
  dsp_ips = []
  console.log('dsp_ips')
  for(var i = 0; i<arr.length; i++){
   // console.log(arr)
    dsp_ips.push(arr[i].ip)
  }
  console.log('initiating sockets')
  console.log(dsp_ips.length)
 // setTimeout(function(){nextSock('init');},300);
 udpCon('init')

}
function getVdef(ip, callback){
  var tclient = tftp.createClient({host:ip})
  var get = tclient.createGetStream('/flash/vdef.json')
      var rawVdef = [];
      get.on('data', (chnk)=>{
        rawVdef.push(chnk)//zlib.gunzipSync(chnk);
      })
      get.on('end', ()=>{
                     // console.log(get.headers['content-encoding'])
      var buffer = Buffer.concat(rawVdef)
      zlib.unzip(buffer, function(er,b){
        var vdef = JSON.parse(b.toString())
        vdefs[ip] = vdef; 
        callback(ip,vdef)               
      })
    })
}
function udpConSing(ip){
  if(dsp_ips.indexOf(ip) == -1){
    return;
  }
  if(typeof udpClients[ip] == 'undefined'){
    udpClients[ip] = null;
    udpClients[ip] = new UdpParamServer(ip , function(_ip,e){
      if(e){
        var ab = toArrayBuffer(e)
        relayParamMsg({det:{ip:_ip},data:{data:ab}})
      }
      _ip = null;
      e = null;
      ab = null;
    })
    getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] == 'undefined'){
        nphandlers[__ip] = new NetPollEvents(__ip,vdef,write_netpoll_events)
      }
    })

  }
  
}
function udpCon(ip){
  if(ip == 'init'){
    if(dsp_ips.length != 0){
      /*console.log('udp://'+ dsp_ips[0])
      udpClients[dsp_ips[0]] = null;
      udpClients[dsp_ips[0]] = new UdpParamServer(dsp_ips[0], function(__ip,e){
        if(e){
          var ab = toArrayBuffer(e)
          relayParamMsg({det:{ip:__ip},data:{data:ab}})
        }
        
      })*/
      getVdef(dsp_ips[0], function(_ip,vdef){
     //   nphandlers[_ip] = new NetPollEvents(_ip,vdef,write_netpoll_events)
        udpCon(_ip)
      })
      

    }
  }else if(dsp_ips.indexOf(ip) != -1){
    var ind = dsp_ips.indexOf(ip);
    if(ind + 1 <dsp_ips.length){
        console.log('currently grabbing vdef for ' + (ind+1))
  
     /* console.log('udp://'+ dsp_ips[ind + 1])
      udpClients[dsp_ips[ind+1]] = null;
      udpClients[dsp_ips[ind+1]] = new UdpParamServer(dsp_ips[0], function(__ip,e){
        if(e){
          var ab = toArrayBuffer(e)
          relayParamMsg({det:{ip:__ip},data:{data:ab}})
        }
        
      })*/
      getVdef(dsp_ips[ind+1], function(_ip,vdef){
     //   nphandlers[_ip] = new NetPollEvents(_ip,vdef,write_netpoll_events)
        udpCon(_ip)
      })
      
    }
   
  }
}

function relayParamMsg(packet){

  for(var pid in passocs){
    //console.log(packet)

    passocs[pid].relay(packet);
  }
  packet = null;
}
function relayRpcMsg(packet){
  console.log('relayRpcMsg')
  for(var pid in rassocs){
    // console.log(pid)
    rassocs[pid].relay(packet);
  }
  packet = null;
}
function relayNetPoll(packet){
  console.log('relay net poll')
  for(var pid in nassocs){
    nassocs[pid].relay(packet)
  }
  packet = null;
}
function sendRpcMsg(packet){
  for(var pid in rassocs){
    rassocs[pid].send(packet)
  }
  packet = null;
}

function toArrayBuffer(buffer) {
//	console.log('toArrayBuffer')
//	console.log(buffer)
    var ab = new ArrayBuffer(buffer.byteLength);
  //  console.log(buffer.byteLength)
    //console.log('why')
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function swap16(val){
      return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
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
  scan_for_dsp_board(callBack){
  	console.log('scan')
    arloc.ArmLocator.scan(1000, function(e){
     // console.log(e)
      callBack(e)
    })
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

var Helper = new FtiHelper();
var dspip = "192.168.10.59";
var dspips = [];

var dets;

app.set('port', (process.env.PORT || 3300));
app.use('/', express.static(path.join(__dirname,'public')));
console.log('dirname:' + __dirname)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', function(req, res) {
  res.render('index.html');
});
app.use(helmet());

http.listen(app.get('port'), function(){
//  console.log(__dirname)

	console.log('Server started: http://localhost:' + app.get('port') + '/');

});
let clients = {};
let udpClients = {};
let vdefs = {};
let nphandlers = {}
io.on('connection', function(socket){ 
  let loginLevel = 0;
  let curUser = '';
  var fileVer = 0;
  socket.on('disconnect',function(){
    console.log('destroy socket')
   // console.log(socket)
  socket.removeAllListeners();
  //passocs[socket.id] = null;
  //rassocs[socket.id] = null;
  //nassocs[socket.id] = null;
  //socket = null;
 // clients = null;
  })

   var relayFunc = function(p){
        socket.emit('paramMsg', p)
        p = null;
      }
    var relayRpcFunc = function(p){
      socket.emit('rpcMsg',p)
      p = null;
    }
    var relayNetFunc = function(p){
      socket.emit('netpoll',p)
      p = null;
    }
      console.log(socket.id)
      passocs[socket.id] = {relay:relayFunc}
      rassocs[socket.id] = {relay:relayRpcFunc}
      nassocs[socket.id] = {relay:relayNetFunc}

//console.log(socket)
//var client = new WebSocketClient();

//client.connect('ws://192.168.10.2/panel');

  socket.on('reset', function (argument) {
    // body...
    clients = null;
    clients = {};
    socket.emit('resetConfirm','locate now')
  })
  socket.on('getUsers', function(arg){
    var keys = db.keys();
    var users = []
    keys.forEach(function(k){
      users.push({id:k, level:db.get(k).level});
    })
    console.log(users)
    console.log(keys)
    socket.emit('userList', users)
  })
  socket.on('login', function(arg){

    if(db.has(arg.id)){
      if(crypto.createHash('sha256').update(arg.pw).digest('base64') == db.get(arg.id).pw){
        loginLevel = db.get(arg.id).level
        socket.emit('loggedIn', {id:arg.id,level:db.get(arg.id).level})
        console.log('success logging in')
      }else{
        socket.emit('access denied', 'wrong password')
      }
    }else{
      socket.emit('access denied', 'username invalid')
    }
  })
  socket.on('logOut', function(arg){
    loginLevel = 0;
    socket.emit('logOut','logged out')
  })
  socket.on('addUser', function(args){
    if(loginLevel == 5){
      db.put(args.id, {level:args.level,pw:crypto.createHash('sha256').update(args.pw).digest('base64')})
       var keys = db.keys();
    var users = []
    keys.forEach(function(k){
      users.push({id:k, level:db.get(k).level});
    })
    console.log(users)
    console.log(keys)
    socket.emit('userList', users)
    }
  })

  socket.on('delUser', function(uid){
    console.log('del ' +uid )
  })
  console.log("connected")
  socket.on('locateReq', function (argument) {
    // body...
    console.log('locate req')
        Helper.scan_for_dsp_board(function (e) {
          dets = e
          console.log(dets)
    dspips = [];
  for(var i = 0; i < e.length; i++){
    if(e[i].board_type == 1){
      var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
      var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});

  if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
    //dsp not visible
    console.log('dsp not visible')
   
    }else{
      console.log('dsp visible')
      dspip = ip.join('.');
     
     // console.log(dspip);
      dspips.push(e[i]);

    
    



     }
   }
 }
var dsps = []
for(var i = 0; i < dspips.length;i++){
    console.log(dspips[i].ip)

   if(!clients[dspips[i].ip]){
      dsps.push(dspips[i])
   }

  }
  console.log('dsp ips')
 // console.log(dspips)
  initSocks(dsps);
       socket.emit('locatedResp', dspips)

 
});
});
          socket.on('vdefReq', function(ip){
            if(vdefs[ip]){
                socket.emit('vdef',[vdefs[ip],ip])
              }else{
                socket.emit('noVdef', ip)
              }
          })
          socket.on('vdefRec', function(){
            socket.emit('vdefDone','done')
          });
          socket.on('rpc', function(pack){
            console.log(pack)

            if(udpClients[pack.ip]){
              
              udpClients[pack.ip].send_rpc(pack.data, function(e){
                console.log('Ack from ' + pack.ip)

                relayRpcMsg({det:{ip:pack.ip},data:{data:toArrayBuffer(e)}});
                e = null;

              })
              //rconns[pack.ip].send(pack.data)
            }else{
              console.log('failed to send rpc')
              console.log(pack.ip)
            }
            //pack = null;
       })
  socket.on('getPrefs', function (f) {
    if(fs.existsSync(path.join(__dirname, 'json/prefData.json'))){
    fs.readFile(path.join(__dirname, 'json/prefData.json'), (err,data) =>{
      prefs = JSON.parse(data)
      socket.emit('prefs', prefs)
    })
    }else{
      socket.emit('prefs',prefs)
    }
    // body...
  })
  socket.on('getTestFss', function(f){
      fs.readFile(__dirname + '/json/test/testfss.json', (err,data) =>{
    var testFss = JSON.parse(data)
      socket.emit('testFss', testFss)
    })
  })
  socket.on('connectToUnit', function(ip){
    console.log('connect!! '+ ip)
    udpConSing(ip)
  })
    /*   var vdef_script_tag = document.createElement('script');
          vdef_script_tag.src = "http://"+d.ip+"/vdef"; // can change the ip here
          vdef_script_tag.type = "application/javascript";
          document.body.appendChild(vdef_script_tag); 
          console.log(vdef_script_tag)*/
      

  socket.on('initTestStream', function(f){
  //  var testFiles = ['/json/test/testAlt.json','/json/test/testAlt2.json','/json/test/testAlt3.json','/json/test/testAlt4.json','/json/test/testAlt5.json','/json/test/testAlt6.json' ];
    var testFiles = ['/json/test/wipes1.fss','/json/test/wipes2.fss','/json/test/wipes3.fss','/json/test/wipes4.fss','/json/test/wipes5.fss']
    var fName = testFiles[fileVer]
    fileVer = (fileVer+1)%5;
    fs.readFile(__dirname + fName, (err,data) =>{
      var testFss = JSON.parse(data)
      var length = testFss.Channels.R.length;
      var testind = 0;
     var testInterval = setInterval(function(){
       if(testind < length){
         socket.emit('testXR', {x:testFss.Channels.X[testind],r:testFss.Channels.R[testind]})
          testind++;

         }else{
          clearInterval(testInterval);
          testind = 0;
         }
      },4)
     
    })
  })
  
  socket.on('savePrefs', function (f) {
    // body...
    console.log(f)
    fs.writeFile(path.join(__dirname, 'json/prefData.json') , JSON.stringify(f));
  })
  socket.on('hello', function(f){
    socket.emit('connected', "CONNECTION");
  });
});