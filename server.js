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
      console.log(e)
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


app.set('port', (process.env.PORT || 3300));
app.use('/', express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

http.listen(app.get('port'), function(){
	console.log('Server started: http://localhost:' + app.get('port') + '/');
});
io.on('connection', function(socket){ 
var client = new WebSocketClient();

client.connect('ws://192.168.10.2/panel');
client.on('connect', function(conn){
	console.log('ws connected')
	conn.on('message', function(message){
		//console.log(message)
		var ab = toArrayBuffer(message.binaryData)
		//console.log('ab::')
		//console.log(ab)
		//console.log('packet')
		socket.emit('wssss', ab)
	})
	socket.on('wsans', function(e){
		//conn.send(e)
	})
})

  
  console.log("connected")
  socket.on('hello', function(f){
    socket.emit('connected', "CONNECTION");
    Helper.scan_for_dsp_board(function (e) {

  for(var i = 0; i < e.length; i++){
    if(e[i].board_type == 1){
      var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
      var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});

  if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
    //dsp not visible
    console.log('dsp not visible')
    /*Helper.change_dsp_ip(function(){
      
      var n_ip = nifip;
      var n = n_ip[3] + 1;
      if(n==0||n==255){

      n = 50
      }
        dspip = [n_ip[0],n_ip[1],n_ip[2],n].join('.');
      });*/
    }else{
      console.log('dsp visible')
      dspip = ip.join('.');
      }
      console.log(dspip);
      dspips.push(dspip);
      socket.emit('location', dspips)
        fs.readFile(__dirname + "/json/vdef.json", (err, data) => {
      var vdef = JSON.parse(data);
      console.log('vdef')
      console.log(err)
      fs.readFile(__dirname + '/json/new_vdef.json', (er,dat) =>{
        var nVdef = JSON.parse(dat);
        socket.emit('vdef', [vdef, nVdef])
      })
      
    });
    }
  }
  dspips = [];
});
});
});