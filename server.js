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
const cp = require('child_process')
//const processor = cp.fork('./processor.js')

var db = flatfile('./dbs/users.db')



db.on('open', function() {
  //db.clear()
  //var hs = crypto.createHash('sha256').update('515151').digest('base64');
  //db.put('admin',{level:5,pw:hs})
  console.log(db.keys())
});
//processor.on('message',(m)=>{
  //relayParamMsg2(m)
//})

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
 // console.log(message);
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
  var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  var get = tclient.createGetStream('/flash/vdef.json')
      var rawVdef = [];
      get.on('data', (chnk)=>{
        rawVdef.push(chnk)//zlib.gunzipSync(chnk);
      })
      get.on('end', ()=>{
      console.log('getting vdef tftp end')
                     // console.log(get.headers['content-encoding'])
      var buffer = Buffer.concat(rawVdef)
      zlib.unzip(buffer, function(er,b){
        var vdef = JSON.parse(b.toString())
        vdefs[ip] = vdef; 
        var nvdf = [[],[],[],[],[]];
        var pVdef = [{},{},{},{},{}];
        vdef['@params'].forEach(function (p) {
          // body...
          nvdf[p["@rec"]].push(p['@name'])
          pVdef[p['@rec']][p['@name']] = p
        })
        pVdef[5] = vdef["@deps"]

        nVdfs[ip] = nvdf
        pVdefs[ip] = pVdef
        callback(ip,vdef) 
        get.abort()              
      })
      get.on('error',(e)=>{
        console.log(e)
      })
    })
    /*
    fs.readFile(__dirname + '/json/170429.json',(err, data) => {
      // body...
      var vdef = JSON.parse(data);
      vdefs[ip] = vdef
      
      callback(ip,vdef)
    })*/
}

function processParam(e, Vdef, nVdf, pVdef, ip) {
  // body...
 // console.log(e)
 // var data = new Uint8Array(e.data);
 // var dv = new DataView(toArrayBuffer(e))
  //console.log(e.data)
  //console.log(dv)
  var dv = e
  var rec_type = dv.readUInt8(0)
  //  console.log(rec_type)
  var n = e.length
  var array = []
  for(var i = 0; i<((n-1)/2); i++ ){
    array[i] = dv.readUInt16BE(i*2 + 1);
  }
  var pack;
  if(rec_type == 0){
    var sysRec = {}
    nVdf[0].forEach(function (p) {
      sysRec[p] = getVal(array, 0, p, pVdef)
      // body...
    })
    for(var p in Vdef["@deps"]){
      if(Vdef["@deps"][p]["@rec"] == 0){
        sysRec[p] = getVal(array,5, p, pVdef);
      }
    }

    pack = {type:0, rec:sysRec}
    //system
  }else if(rec_type == 1){
    var prodRec = {}
    nVdf[1].forEach(function (p) {
      prodRec[p] = getVal(array, 1, p, pVdef)
      // body...
    })
    for(var p in Vdef["@deps"]){
      if(Vdef["@deps"][p]["@rec"] == 1){
        prodRec[p] = getVal(array,5, p, pVdef);
      }
    }
     pack = {type:1, rec:prodRec}
  }else if(rec_type == 2){
    var dynRec = {}
    nVdf[2].forEach(function (p) {
      dynRec[p] = getVal(array, 2, p, pVdef)
      // body...
    })

    pack = {type:2, rec:dynRec}
    
  }else if(rec_type == 3){
    var framRec = {}
    nVdf[3].forEach(function (p) {
      framRec[p] = getVal(array, 3, p, pVdef)
      // body...
    })

    pack = {type:3, rec:framRec}
    
  }else if(rec_type == 4){
    var testRec = {}
    nVdf[4].forEach(function (p) {
      testRec[p] = getVal(array, 4, p, pVdef)
      // body...
    })

    pack = {type:4, rec:testRec}
  }
 // data = null;
  dv = null;
  array = null;
  e = null;
 // pack.det = {ip:ip}
  relayParamMsg2({det:{ip:ip}, data:pack});
}
function getVal(arr, rec, key, pVdef){
    //console.log([rec,key])
    var param = pVdef[rec][key]
    if(param['@bit_len']>16){

      return wordValue(arr, param)
    }else{
      var val;
      if((param['@bit_pos'] + param['@bit_len']) > 16){
        var wd = (Params.swap16(arr[param['@i_var']+1])<<16) | Params.swap16((arr[param['@i_var']]))
        val = (wd >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
        
      }else{
        val = Params.swap16(arr[param["@i_var"]]);
      } 
      if(param["@bit_len"] < 16){
        val = (val >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
      }
      return val;
    }
}
function wordValue(arr, p){

    var n = Math.floor(p["@bit_len"]/16);
    var sa = arr.slice(p["@i_var"], p["@i_var"]+n)
    if(p['@type']){
      return Params[p['@type']](sa)
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str; 
    }
    
}

class Params{
  static frac_value(int){
    return (int/(1<<15))
  }
  static mm(dist, metric){
    if(metric==0){
      return (dist/25.4).toFixed(1) + " in"

    }
    else{
      return dist + " mm";
    }

  }
  static prod_name_u16_le(sa){
    //console.log(sa)
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_serno_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static rec_date(val){
    //needs to be swapped..
    //0xac26 -> 0x26ac
    var dd = val & 0x1f;
    var mm = (val >> 5) & 0xf
    var yyyy = ((val>>9) & 0x7f) + 1996
    return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString();
  }
  static phase_spread(val){
    return Math.round(Params.frac_value(val)*45)
  }
  static phase_wet(val){
    return ((Params.frac_value(val) * 45)).toFixed(2);
  }
  static phase_dry(val){
    if(((Params.frac_value(val) * 45)+90) <= 135){
      return ((Params.frac_value(val) * 45)+90).toFixed(2); 
    }
    else{
      return ((Params.frac_value(val) * 45)).toFixed(2);
      
    }

  }
  static phase(val, wet){
    //console.log(wet);
    if(wet==0){
      return Params.phase_dry(val);
    }else{
      return Params.phase_wet(val);
    }
  }
  static rej_del(ticks, tack){
    if(tack==0){
      return (ticks/231.0).toFixed(2); //2 decimal float
    }else{
      return ticks;
    }
  }
  static belt_speed(tpm, metric, tack){
    //console.log(tpm);
    if(tack!=0){

      return tpm;
    }
    var speed = (231.0/tpm) * 60;
    if(metric==0){
      return (speed*3.281).toFixed(1) + ' ft/min'
    }else{
      return speed.toFixed(1) + ' M/min'
    }
  
  }
  static password8(words){
  
    var res = words.map(function(w){
      return ((w & 0xffff).toString(16)) //hex format string
    }).join(',')
  //  console.log(res);
    return(res)

  }
  static rej_chk(rc1, rc2){
    if (rc2==0){
      if(rc1==0){
        return 0
      }else{
        return 1
      }
    }else{
      return 2
    }
  }
  static rej_mode(photo, rev){
    if (rev==0){
      if (photo==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }

  static rej_latch(latch, toggle){
    if (toggle==0){
      if (latch==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  static prod_name(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val;
  }


  static peak_mode(eye, time){
    if (eye==0){
      if (time==0){
        return 0;
      }else{
        return 2;
      }
    }else{
      return 1;
    }
  }


  static eye_rej(photo, lead, width){
    if (photo==0){
      return 3;
    }else{
      if(lead==0){
        if(width==0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
  }
  static phase_mode(wet, patt){
    //console.log(patt)
    if (patt==0){
      if (wet==0){
        return 0;
      }
      else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  
  static bit_array(val){
    if(val == 0){
      return 0;
    }else{
      var i = 0;
      while(i<16 && ((val>>i) & 1) == 0){
        i++;
      }
      i++; //1 based index
      return i;
    }
  }

  static patt_frac(val){
    return (val/10.0).toFixed(1);
  }

  static eye_rej_mode(val, photo, width){
    if(photo == 0){
      return 3;
    }else{
      if (val == 0){
        if (width == 0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
    
  }

  static  swap16(val){
      return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
  }

  static  convert_word_array_BE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    //console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16BE(i*2));
    }
    //console.log(wArray)
    return wArray;

  }

  static convert_word_array_LE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    //console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16LE(i*2));
    }
    //console.log(wArray)
    return wArray;

  }
  static ipv4_address(words){
    //todo
    //console.log(ip)
    //return ip
    var str_Words = words.map(function(w){
      return [(w>>8)&0xff,w&0xff].join('.')
    })
    return str_Words.join('.')
  }
}
function udpConSing(ip){
  if(dsp_ips.indexOf(ip) == -1){
    return;
  }
  if(typeof udpClients[ip] == 'undefined'){
   
    udpClients[ip] = null;
       udpClients[ip] = new UdpParamServer(ip , function(_ip,e){
      if(e){
     //   var ab = toArrayBuffer(e.data)
      //  console.log(ab)
      if(vdefs[_ip]){
        processParam(e,vdefs[_ip],nVdfs[_ip],pVdefs[_ip],ip)
        //processor.send({e:e,vdef:vdefs[_ip],nVdf:nVdfs[_ip],pVdef:pVdefs[_ip],ip:_ip})
      }
       // 
      //  relayParamMsg({det:{ip:_ip},data:{data:ab}})
      }
      _ip = null;
      e = null;
      //ab = null;
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
function relayParamMsg2(packet){
  //console.log('relay param msg 2')

  for(var pid in passocs){
    //console.log(packet)

    passocs[pid].relayParsed(packet);
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
function dsp_rpc_paylod_for (n_func, i16_args, byte_data) {
        var rpc = [];
        var n_args = i16_args.length;
        var bytes = [];
        if (n_args > 3) n_args = 3;
        if (typeof byte_data == "string") {
          for(var i=0; i<byte_data.length; i++) {
              bytes.push(byte_data.charCodeAt(i));
          }         
        } else if (byte_data instanceof Array) {
          bytes = byte_data;
         }
        rpc[0] = n_func;
        rpc[1] = n_args;
        if (bytes.length > 0) rpc[1] += 4;
        var j=2;
        for(var i=0; i<n_args; i++) {
          rpc[j] = i16_args[i] & 0xff; j+= 1;
          rpc[j] = (i16_args[i] >> 8) & 0xff; j+= 1;
        }
        if (bytes.length > 0) rpc = rpc.concat(bytes);
        
        var cs = fletcherCheckBytes(rpc);
        var cs1=255-((cs[0]+cs[1])%255); 
        var cs2=255-((cs[0]+cs1)%255);
        rpc.push(cs1);
        rpc.push(cs2);
        return rpc;
}
function fletcherCheckBytes (data) {
        var c1=0, c2=0;
        for(var i=0; i<data.length; i++) {
          c1 += data[i]; if (c1 >=255) c1 -= 255;
          c2 += c1;      if (c2 >=255) c2 -= 255;
        }
        return [c1,c2];
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
let nVdfs = {};
let pVdefs = {};
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
  function getProdList(ip) {
  // body...
  console.log('get Prod List')
  if(vdefs[ip]){
    if(udpClients[ip]){
    var rpc = vdefs[ip]['@rpc_map']['KAPI_PROD_DEF_FLAGS_READ']
    var packet = dsp_rpc_paylod_for(rpc[0], rpc[1])
    var buf = Buffer.from(packet)
    udpClients[ip].send_rpc(buf, function (e) {
      var msg = toArrayBuffer(e)
      var data = new Uint8Array(msg)
      var prodBits = data.slice(3)
      var dat = [];
      for(var i = 0; i < 99; i++){
    
        if(prodBits[i] ==2){
          dat.push(i+1)
        }
      
      }
      console.log(dat.length + ' products found')
      getProdName(ip,dat,0,function(ip,arr,list){
        socket.emit('prodNames',{ip:ip, names:arr, list:list})},[]);
      // body...
    })

    }
  }else{
    socket.emit('noVdef', ip)
  }

}
function getProdName(ip, list, ind, callback, arr){
  var rpc = vdefs[ip]['@rpc_map']['KAPI_PROD_NAME_APIREAD']
  var pkt = rpc[1].map(function (r) {
    if(!isNaN(r)){
      return r
    }else{
      if(isNaN(list[ind])){
          return 0
        }else{
          return parseInt(list[ind])
        }
      }
    })
    var packet = dsp_rpc_paylod_for(rpc[0], pkt)
    var buf = Buffer.from(packet);
    //var array = arr;

    udpClients[ip].send_rpc(buf, function (e) {
      // body...
      var array = arr;
      var msg = toArrayBuffer(e)
      var name = new Uint8Array(msg)
      //console.log(e)
     // array.push(e)
      var sa = []
     name.slice(3,23).forEach(function (i) {
      // body...
      sa.push(i)
    })
   // var self = this;
      var str = sa.map(function(ch){
        return String.fromCharCode(ch)
      }).join("").replace("\u0000","").trim();
   // console.log(['5888',str])
   // var prodNames = this.state.prodNames;
   // prodNames[ind] = str
      array.push(str)
      if(ind + 1< list.length){
        getProdName(ip, list, ind+1, callback, array)
      }else{
        if(list.length > 0){
          callback(ip, array,list)
        }else{
          getProdList(ip)
        }
        
      }
      //callback(e, ip, list, ind)
    })
}


   var relayFunc = function(p){
        socket.emit('paramMsg', p)
        p = null;
      }
      var relayFuncP = function (p) {
        // body...
        socket.emit('paramMsg2',p)
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
      passocs[socket.id] = {relay:relayFunc, relayParsed:relayFuncP}
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
socket.on('getProdList', function (ip) {
  // body...
  getProdList(ip)
})
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