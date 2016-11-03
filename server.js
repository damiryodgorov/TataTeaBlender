'use strict'

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fti = require('./fti-flash-node/index.js');
var arloc = fti.ArmFind;

var WebSocket = require('websocket')
var WebSocketClient = WebSocket.client
var W3CWebSocket = WebSocket.w3cwebsocket;

var prefs;

var cur = Date.now()

var passocs = {}
var rassocs = {}
var rconns = {}
var dsp_ips = []

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
          nextSock(connn.remoteAddress);
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
          nextSock(connn.remoteAddress);
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
var clients = {};
io.on('connection', function(socket){ 
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
      console.log(socket.id)
      passocs[socket.id] = {relay:relayFunc}
      rassocs[socket.id] = {relay:relayRpcFunc}

//console.log(socket)
//var client = new WebSocketClient();

//client.connect('ws://192.168.10.2/panel');

  socket.on('reset', function (argument) {
    // body...
    clients = null;
    clients = {};
    socket.emit('resetConfirm','locate now')
  })
  
  console.log("connected")
  socket.on('locateReq', function (argument) {
    // body...
    console.log('locate req')
        Helper.scan_for_dsp_board(function (e) {
          dets = e
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
  /*    console.log('init')
      var ip = dspips[i].ip

     clients[ip] = null;
     clients[ip] = []; 
     clients[ip].push({socket:new WebSocketClient()});
     clients[ip].push({socket:new WebSocketClient()});
     
    // clients[ip][0].socket.connect('ws://' + ip + '/parameters');
    // clients[ip][1].socket.connect('ws://' + ip + '/rpc');
     
     clients[dspips[i].ip][0].socket.on('connect',function(conn){
      setTimeout( function(){
          console.log('ws://'+conn.remoteAddress+'/rpc')
      clients[conn.remoteAddress][1].socket.connect('ws://'+conn.remoteAddress+'/rpc');
    
    },100)
      conn.on('disconnect',function(){
        console.log('clean up connection')
        conn.removeAllListeners();
        conn = null;
        //clients[e.]
       // clients = null;
        //clients = {}
      })
     
     // console.log(conn)
      //console.log(dets)
      //console.log(i)
      if(conn){
       // console.log('conn')
       // console.log(conn)
    //  clients[dets[i].ip][0]['conn'] = conn
         conn.on('message', function(msg){
          var ab = toArrayBuffer(msg.binaryData)
         // console.log(conn.remoteAddress)
          var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
          relayParamMsg(packet)
        
                         
       })
    }
  });
     // console.log(clients[e[i].ip])
     
      clients[dspips[i].ip][1].socket.on('connect',function(conn){
          console.log('rpc socket')
          console.log(conn.remoteAddress)
          rconns[conn.remoteAddress] = conn
         // console.log(rconns)
         nextSock(conn.remoteAddress);
     conn.on('disconnect',function(){
        console.log('clean up connection')
        conn.removeAllListeners();
        conn = null;
        //clients[e.]
       // clients = null;
        //clients = {}
      })
     
     // console.log(conn)
      //console.log(dets)
      //console.log(i)
      if(conn){
      
       // console.log('conn')
       // console.log(conn)
    //  clients[dets[i].ip][0]['conn'] = conn
         conn.on('message', function(msg){
          var ab = toArrayBuffer(msg.binaryData)
         // console.log(conn.remoteAddress)
          var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
          relayRpcMsg(packet)

          })
           
    }
     });
  }else{
    console.log('existing')
    
  }*/
  }
  console.log('dsp ips')
 // console.log(dspips)
  initSocks(dsps);
       socket.emit('locatedResp', dspips)
        fs.readFile(__dirname + "/json/vdef160621.json", (err, data) => {
      var vdef = JSON.parse(data);
     // console.log('vdef')
      //console.log(err)
      fs.readFile(__dirname + '/json/new_vdef.json', (er,dat) =>{
        var nVdef = JSON.parse(dat);
        socket.emit('vdef', [vdef, nVdef])
      });
      
    });

 
});
});
          socket.on('rpc', function(pack){
            console.log(pack)

            if(clients[pack.ip]){
              
              if(clients[pack.ip][1]){
                if(clients[pack.ip][1].conn){
                  console.log('connection live')
                  console.log(clients[pack.ip][1].conn.state)
                  clients[pack.ip][1].conn.send(pack.data)
                }else{
                   console.log('failed to send rpc - 383')
                   console.log(pack.ip)
                }
              }
              //rconns[pack.ip].send(pack.data)
            }else{
              console.log('failed to send rpc')
              console.log(pack.ip)
             /* clients[pack.ip][1].socket = new WebSocketClient();
              clients[pack.ip][1].socket.connect('ws://' + pack.ip + '/rpc')
              clients[pack.ip][1].socket.on('connect', function(conn){
                        console.log('rpc socket')
                     console.log(conn.remoteAddress)
                 rconns[conn.remoteAddress] = conn
                     // console.log(rconns)
                 conn.on('disconnect',function(){
                    console.log('clean up connection')
                    conn.removeAllListeners();
                    conn = null;
                    //clients[e.]
                   // clients = null;
                    //clients = {}
                  })
                 
                 // console.log(conn)
                  //console.log(dets)
                  //console.log(i)
                  if(conn){
                  
                   // console.log('conn')
                   // console.log(conn)
                //  clients[dets[i].ip][0]['conn'] = conn
                     conn.on('message', function(msg){
                      var ab = toArrayBuffer(msg.binaryData)
                     // console.log(conn.remoteAddress)
                      var packet = {det:{ip:conn.remoteAddress}, data:{data:ab}}
                      relayRpcMsg(packet)

                      })
                       
                }
              })
              console.log('not connected - retrying')
              //console.log(rconns)
              console.log(pack.ip)*/
             /* setTimeout(function(){
                if(rconns[pack.ip]){
                  console.log('retry success')
                //  rconns[pack.ip].send(pack.data)
                }else{
                 // console.log('retry fail')
                }
              }, 200)*/
             // console.log(clients[pack.ip][1].socket)
            }

              
            
                         
       })
  socket.on('getPrefs', function (f) {
    fs.readFile(__dirname + '/json/prefData.json', (err,data) =>{
      prefs = JSON.parse(data)
      socket.emit('prefs', prefs)
    })
    // body...
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