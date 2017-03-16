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
 nextSock('init')

}
function nextSock(ip){
  if(ip == 'init'){
    if(dsp_ips.length != 0){
      console.log('ws://' + dsp_ips[0] + '/parameters')
      clients[dsp_ips[0]] = null;
      clients[dsp_ips[0]] = []
      clients[dsp_ips[0]].push({socket:new WebSocketClient()});
      clients[dsp_ips[0]][0].socket.connect('ws://' + dsp_ips[0] + '/parameters');
      clients[dsp_ips[0]][0].socket.on('connect', function(conn){
        conn.on('message', function(msg){
                      var ab = toArrayBuffer(msg.binaryData)
                     // console.log(conn.remoteAddress)
                      var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
                      relayParamMsg(packet)

        })
        console.log('connected')
         console.log('ws://'+conn.remoteAddress+'/rpc')
         clients[conn.remoteAddress][1] = {socket:new WebSocketClient()};
        setTimeout(function(){
          console.log(conn.remoteAddress)
          console.log('ws://'+conn.remoteAddress+'/rpc')
          clients[conn.remoteAddress][1].socket.connect('ws://'+conn.remoteAddress+'/rpc');},100) 
         clients[conn.remoteAddress][1].socket.on('connect', function(connn){
          console.log('connected')
                /*    var tclient = tftp.createClient({host:conn.remoteAddress})
                    var get = tclient.createGetStream('/flash/vdef.json')
                    //var str = new PassThrough();
                   // str.headers = {'content-encoding':'gzip'}
                   //get.pipe(unzip).pipe(str)

                   //console.log(get)
                   var rawVdef = [];
                    get.on('data', (chnk)=>{
                      rawVdef.push(chnk)//zlib.gunzipSync(chnk);
                    })
                    get.on('end', ()=>{
                     // console.log(get.headers['content-encoding'])
                     var buffer = Buffer.concat(rawVdef)
                     var buf2 = buffer.slice(160)
                     zlib.unzip(buf2, function(er,b){
                          //console.log(b.toString())
                          var vdef = eval(b.toString())
                          console.log(vdef)
                      
                     })
                    })
                 /*    fs.readFile(__dirname+'/json/vdef160621.json.gz', function(e,d){
                      zlib.unzip(d, function(er,b){
                        console.log(b.toString())
                      })
                    })*/
          /*tclient.get('/flash/vdef.json',__dirname+'/tftpvdef.json',function(e,a){
            console.log('getting vdef json')
            console.log(a)
            console.log('this is e')
            console.log(e)
          });*/
         try{
          HTTP.get('http://'+connn.remoteAddress+'/vdef', (res) =>{
            console.log('receiving response')
            let ip = connn.remoteAddress;
             console.log(ip)
             res = unzipResponse(res)
             let rawData = '';
         //    console.log(res)
  
            res.on('data', (chunk) =>{
              //console.log(typeof chunk)
              rawData += chunk;
            });//
             
            res.on('end', () => {
              try {
                // console.log(rawData.toString('utf8'))
               if(/^load_vdef_parameters/.test(rawData)){
                console.log('this should be alright')
               var vdef = eval(rawData)
               vdefs[ip] = vdef;
               console.log('netpollhandler: ' + ip)
               nphandlers[ip] = new NetPollEvents(ip, vdef, function(_m,_ip){
               // socket.emit('netpoll', {message:_m,ip:_ip});
                write_netpoll_events(_m,_ip)
              //  var msg = {det:{ip:_ip}, msg:_m}
               // relayNetPoll(msg)
              });
               //console.log(nphandlers)
                 nextSock(ip);
        
               }
              } catch (e) {
                console.log(e.message);
              }
            });

          })
        }catch(e){
          console.log(e)
        }
      /*  try{
          HTTP.get('http://'+connn.remoteAddress+'/vdef', (res) =>{
             let ip = connn.remoteAddress;
             console.log(ip)
             res = unzipResponse(res)
             let rawData = '';
         //    console.log(res)
  
            res.on('data', (chunk) =>{
              //console.log(typeof chunk)
              rawData += chunk;
            });// 
            res.on('end', () => {
              try {
                // console.log(rawData.toString('utf8'))
               if(/^load_vdef_parameters/.test(rawData)){
                console.log('this should be alright')
               var vdef = eval(rawData)
               vdefs[ip] = vdef;
                 nextSock(ip);
        
               }
              } catch (e) {
                console.log(e.message);
              }
            });
           })
        } catch(e){
          console.log('vdef error for '+connn.remoteAddress);
          console.log(e);
          nextSock(connn.remoteAddress);
        }*/
     //   nextSock(connn.remoteAddress);
           clients[conn.remoteAddress][1].conn = connn
          connn.on('message', function(msg){
                      var ab = toArrayBuffer(msg.binaryData)
                     // console.log(conn.remoteAddress)
                      var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
                      relayRpcMsg(packet)

            })
         })

          
      })
    }
  }else if(dsp_ips.indexOf(ip) != -1){
    var ind = dsp_ips.indexOf(ip);
    console.log('currently connecting ' + (ind+1))
    if(ind + 1 <dsp_ips.length){
      console.log('ws://'+dsp_ips[ind+1] + '/parameters')
      clients[dsp_ips[ind+1]] = null;
      clients[dsp_ips[ind+1]] = [];
      clients[dsp_ips[ind+1]].push({socket:new WebSocketClient()});
      clients[dsp_ips[ind+1]][0].socket.connect('ws://'+dsp_ips[ind+1] + '/parameters');
      clients[dsp_ips[ind+1]][0].socket.on('connect', function(conn){
          conn.on('message', function(msg){
                      var ab = toArrayBuffer(msg.binaryData)
                     // console.log(conn.remoteAddress)
                      var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
                      relayParamMsg(packet)

        })
        console.log('connected')
         console.log('ws://'+conn.remoteAddress+'/rpc')
         clients[conn.remoteAddress].push({socket:new WebSocketClient()});
       setTimeout(function(){
          console.log('ws://'+conn.remoteAddress+'/rpc')
          clients[conn.remoteAddress][1].socket.connect('ws://'+conn.remoteAddress+'/rpc');
       },100)  
         clients[conn.remoteAddress][1].socket.on('connect', function(connn){
          console.log('connected')
          clients[conn.remoteAddress][1].conn = connn
            connn.on('message', function(msg){
                      var ab = toArrayBuffer(msg.binaryData)
                     // console.log(conn.remoteAddress)
                      var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
                      relayRpcMsg(packet)

            })
        /*  var tclient = tftp.createClient({host:conn.remoteAddress})
          tclient.get('/flash/vdef.json',__dirname+'/tftpvdef.json',function(e,a){
            console.log('getting vdef json')
            console.log(a)
            console.log('this is e')
            console.log(e)
          });*/
          HTTP.get('http://'+conn.remoteAddress+'/vdef', (res) =>{
             let ip = conn.remoteAddress;
               console.log(ip)
           
             res = unzipResponse(res)
             let rawData = '';
            // console.log(res)
  
            res.on('data', (chunk) =>{
              //console.log(typeof chunk)
              rawData += chunk;
            });// 
            res.on('end', () => {
              try {
                // console.log(rawData.toString('utf8'))
               if(/^load_vdef_parameters/.test(rawData)){
                console.log('this should be alright')
               var vdef = eval(rawData)
                     vdefs[connn.remoteAddress] = vdef;

                 nphandlers[connn.remoteAddress] = new NetPollEvents(connn.remoteAddress, vdef, write_netpoll_events);
               
                nextSock(connn.remoteAddress);
         
               }
              } catch (e) {
                console.log(e.message);
              }
            });
           })
          
         })
      })
    }
  }
}
function relayParamMsg(packet){
  for(var pid in passocs){
    passocs[pid].relay(packet);
  }

}
function relayRpcMsg(packet){
  //console.log('relayRpcMsg')
  for(var pid in rassocs){
    // console.log(pid)
    rassocs[pid].relay(packet);
  }
}
function relayNetPoll(packet){
  console.log('relay net poll')
  for(var pid in nassocs){
    nassocs[pid].relay(packet)
  }
}
function sendRpcMsg(packet){
  for(var pid in rassocs){
    rassocs[pid].send(packet)
  }
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

http.listen(app.get('port'), function(){
	console.log('Server started: http://localhost:' + app.get('port') + '/');

});
let clients = {};
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
  //socket = null;
 // clients = null;
  })

   var relayFunc = function(p){
        socket.emit('paramMsg', p)
      }
    var relayRpcFunc = function(p){
      socket.emit('rpcMsg',p)
    }
    var relayNetFunc = function(p){
      socket.emit('netpoll',p)
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
          socket.on('rpc', function(pack){
            console.log(pack)

            if(clients[pack.ip]){
              
              if(clients[pack.ip][1]){
                if(clients[pack.ip][1].conn){
                  console.log('connection live')
                  console.log(clients[pack.ip][1].conn.state)
                  clients[pack.ip][1].conn.send(pack.data)
                }else{
                   console.log(pack.ip)
                }
              }
              //rconns[pack.ip].send(pack.data)
            }else{
              console.log('failed to send rpc')
              console.log(pack.ip)
            }
       })
  socket.on('getPrefs', function (f) {
    if(fs.existsSync(__dirname + '/json/prefData.json')){
    fs.readFile(__dirname + '/json/prefData.json', (err,data) =>{
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
    fs.writeFile(__dirname+'/json/prefData.json', JSON.stringify(f));
  })
  socket.on('hello', function(f){
    socket.emit('connected', "CONNECTION");
  });
});