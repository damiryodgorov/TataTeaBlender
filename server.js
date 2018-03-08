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
const WebSocket = require('ws')
const wss = new WebSocket.Server({server:http})
const stream = require('stream')
const os = require('os');
const usb = require('usb');
const sys = require('sys');
const exec = require('child_process').exec;
//const drivelist = require('drivelist')
const filesystem = require('fs-filesystem');
var db = flatfile('./dbs/users.db')
var  NetworkInfo  = require('simple-ifconfig').NetworkInfo;

db.on('open', function() {
  //db.clear()
  //var hs = crypto.createHash('sha256').update('515151').digest('base64');
  //db.put('admin',{level:5,pw:hs})
  console.log(db.keys())
});

var funcJSON ={
  "@func":{"frac_value":"(function(int){return (int/(1<<15));})",
      "mm":"(function(dist,metric){if(metric==0){return (dist/25.4).toFixed(1) + ' in'}else{ return dist + ' mm'}})",
      "prod_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "dsp_name_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "dsp_serno_u16_le":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "rec_date":"(function(val){var dd = val & 0x1f; var mm = (val >> 5) & 0xf; var yyyy = ((val>>9) & 0x7f) + 1996; return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString()})",
      "phase_spread":"(function(val){return Math.round((val/(1<<15))*45)})",
      "phase":"(function(val,wet){ if(wet == 0){if((((val/(1<<15))*45)+90) <= 135){return (((val/(1<<15))*45)+90).toFixed(2); }else{ return ((val/(1<<15))*45).toFixed(2); }}else{ return ((val/(1<<15))*45).toFixed(2);}})",
      "rej_del":"(function(ticks,tack) { if(tack==0){return (ticks/231.0).toFixed(2);}else{return ticks;}})",
      "belt_speed":"(function(tpm,metric,tack){if(tack!=0){return tpm;} var speed= (231.0/tpm)*60; if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}})",
      "password8":"(function(words){return words.map(function(w){return((w&0xffff).toString(16))}).join(',');})",
      "rej_chk":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "rej_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "rej_latch":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "prod_name":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "peak_mode":"(function(eye,time){if(eye == 0){return(time*2;)}else{return 1;}})",
      "phase_mode":"(function(rc1,rc2){if(rc2==0){return rc1+rc2;}else{return 2;}})",
      "eye_rej":"(function(photo,lead,width){if(photo == 0){return 3;}else{if(lead==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})",
      "bit_array":"(function(val){if(val == 0){return 0;}else{ var i = 0; while(i<16 && ((val>>i) & 1) == 0){ i++; } i++;  return i; } })",
      "patt_frac":"(function(val){return (val/10.0).toFixed(1)})",
      "eye_rej_mode":"(function(val,photo,width){if(photo == 0){return 3;}else{if(val==0){if(width==0){return 0;}else{return 2;}}else{ return 1;}}})",
      "ipv4_address":"(function(words){return words.map(function(w){return [(w>>8)&0xff,w&0xff].join('.')}).join('.');})",
      "username":"(function(sa){ var str = sa.map(function(e){return (String.fromCharCode((e>>8),(e%256)));}).join('');return str.replace('\u0000','').trim();})",
      "user_opts":"(function(opts){return opts});",
      "password_hash":"(function(phash){return phash;});"
      }
  }

const salt = 'fortress'
//const hash = crypto.createHash('sha1')

console.log(crypto.createHash('sha1').update("operator0123"+salt).digest().slice(0,8))
console.log(crypto.createHash('sha1').update("operator0023"+salt).digest().slice(0,8))
console.log(crypto.createHash('sha1').update("engineer0123"+salt).digest().slice(0,8))
//lets just keep it here for now
var accounts = {"operator":{"acc":1,"password":"0123"},"engineer":{"acc":2,"password":"0123"},"fortress":{"acc":3,"password":"0123"}}



var prefs;

var cur = Date.now()

let passocs = {}
let rassocs = {}
let nassocs = {}
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
let networking = new NetworkInfo();

networking.listInterfaces().then(console.log).catch(console.error);
function checkAndMkdir(targetpath,i, callback){
  if(i>targetpath.length){
    callback()
  }else{
  fs.access(targetpath.slice(0,i).join('/'), function(err){
    console.log('109')
      if(err && err.code === 'ENOENT'){
        fs.mkdir(targetpath.slice(0,i).join('/'), function(){
          console.log('112')
          checkAndMkdir(targetpath, i+1, callback)
        })  
      }else{
        checkAndMkdir(targetpath, i+1, callback)        
      }
    })
  }

}

function tftpPollForFDDList(det,nr,callback){
  //path = [1], nr=1 at start
  var num = nr;
  var fn = num%10 + 1;
  var filename = ('0'+fn).slice(-2) + '.FDD'

  num = Math.floor(num/10)
  filename = ('0'+(num%10 + 1)).slice(-2) +'/' + filename;
  while(num > 9){
    num = Math.floor(num/10)
    filename = ('0'+(num%10 + 1)).slice(-2) +'/' + filename;
  }


  filename = '/FDD/'+filename; 

  getJSONStringTftp(det.ip,filename,function(res){
    var fpath = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() + filename
      console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase()]
      console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
         fs.writeFile(fpath,res,(err)=>{
          if(err) throw err
          console.log(nr,filename)
          
          tftpPollForFDDList(det,nr+1,callback);
        })
      })
     
    },function(e){
      callback(e)
    })
}
function tftpPollForSCDList(det,nr,callback){
  //path = [1], nr=1 at start
  var num = nr;
  var fn = num%10 + 1;
  var filename = ('0'+fn).slice(-2) + '.SCD'

  num = Math.floor(num/10)
  filename = ('0'+(num%10 + 1)).slice(-2) +'/' + filename;
  while(num > 9){
    num = Math.floor(num/10)
    filename = ('0'+(num%10 + 1)).slice(-2) +'/' + filename;
  }


  filename = '/SCD/'+filename; 

  getJSONStringTftp(det.ip,filename,function(res){
    var fpath = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() + filename
      console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase()]
      console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
         fs.writeFile(fpath,res,(err)=>{
          if(err) throw err
          console.log(nr,filename)
          
          tftpPollForSCDList(det,nr+1,callback);
        })
      })
     
    },function(e){
      callback(e)
    })
}
function buildFDDList(arm,callBack){
  var paths = []
   arm.rpc_cb([3,0,0],function(_f){
      arm.clearCB(function(f){
          var path = ''
        var buf1 = Buffer.from([3,2,path.length])
        var buf = Buffer.concat([buf1,Buffer.from(path,'ascii'),Buffer.alloc(15)]);

        arm.rpc_cb(buf,function(_e){
           arm.clearCB(function(e){
            return recursiveFDDSync(e,arm,paths,callBack)
            }, _e)
        }, _f)

    })
  })
}
function buildSCDList(arm,callBack){
  var paths = []
  arm.rpc_cb([3,23,0,0,0],function(_e){
      arm.clearCB(function(e){
         return recursiveSync(e,arm,paths,callBack)
       }, _e)
     
    //})
  })
}
function buildSyncList(arm,callBack){
  var paths = []
  //var arm = new fti.ArmRpc.ArmRpc(det.ip)
  arm.rpc_cb([3,0,0],function(_e){
      arm.clearCB(function(e){
         return recursiveSync(e,arm,paths,callBack)
       }, _e)
     
    //})
  })
}
function recursiveSync(pkt,arm,paths,callBack){
  //var msg = pkt.to
  var packt = pkt.slice(2)
   //  var msg = toArrayBuffer(packt)
    // var arr = new Uint8Array(msg)
  var state = packt.readUInt8(1)
    if(state == 1){
      arm.rpc_cb([3,16],function(_e){
        arm.clearCB(function(e){
  
        return  recursiveSync(e,arm,paths.slice(0),callBack)
        }, _e)
     
      })
    }else if(state == 3){
      var pths = paths.slice(0)
      var nr = packt.readUInt16LE(2)
      var type = packt.readUInt8(4)
      var pathlen = packt.readUInt8(7)
      var pth = packt.slice(8,8+pathlen)
     // console.log([nr,type,pathlen,pth.toString('ascii')])
      pths.push(pth.toString('ascii'))
      arm.rpc_cb([3,4,packt.readUInt8(2),packt.readUInt8(3),0], function(_e){
        arm.clearCB(function(e){
  
       return   recursiveSync(e,arm,pths.slice(0),callBack)
        }, _e)
     
      })
    }else if(state == 7){
      arm.rpc_cb([3,9],function(_e){
        arm.clearCB(function(e){
  
       return   recursiveSync(e,arm,paths.slice(0),callBack)
        }, _e)
          })
    }else if(state == 10){
      callBack(paths)
    }else{

      console.log('something went wrong')
      callBack(paths)
    }
    return null;
}

function recursiveFDDSync(pkt,arm,paths,callBack){
  //var msg = pkt.to
  var packt = pkt.slice(2)
   //  var msg = toArrayBuffer(packt)
    // var arr = new Uint8Array(msg)
  var state = packt.readUInt8(1)
    if(state == 3){
      var pths = paths.slice(0)
      var nr = packt.readUInt16LE(2)
      var type = packt.readUInt8(4)
      var pathlen = packt.readUInt8(7)
      var pth = packt.slice(8,8+pathlen)
      var i = 0;
      var templen = 4;
      var pthnr = []
      while((templen+7)<pathlen){
        pthnr.push((pth.readUInt8(i*3+5)-0x30)*10 + pth.readUInt8(i*3+6)-0x30);
        i++;
        templen +=3;
      }
      var path = '/FDD/'
      for(var j=0; j<i; j++){
        path += ('0'+pthnr[j]).slice(-2)
      }
      path += '/'
      path += ('0'+nr).slice(-2)
      path += '.FDD';
        pths.push(path)

        arm.rpc_cb([3,4,packt.readUInt8(2),packt.readUInt8(3),0], function(_e){
        arm.clearCB(function(e){
  
          return   recursiveFDDSync(e,arm,pths.slice(0),callBack)
        }, _e)
     
      })
      
     // console.log([nr,type,pathlen,pth.toString('ascii')])

    }else if(state == 7){
      arm.rpc_cb([3,9],function(_e){
        arm.clearCB(function(e){
  
       return   recursiveFDDSync(e,arm,paths.slice(0),callBack)
        }, _e)
          })
    }else if(state == 10){
      callBack(paths)
    }else{
      console.log('state',state)
      console.log('something went wrong')
      callBack(paths)
    }
    return null;
    //arm.rpc_cb([3,16],function(e){
      //push filename, move on

}
function load_vdef_parameters(json){
 // console.log(json)
  return json;
}
function write_netpoll_events(message, ip){
  console.log("Writing NetpollEvents from " + ip);
 // console.log(message);
  var msg = {det:{ip:ip, mac:macs[ip]}, data:message}
  relayNetPoll(msg)
  msg = null;
  ip = null;
  message = null;
}

function initSocks(arr, cb){
  dsp_ips = [];
  vdefs = {};
  nVdfs = {};
  pVdefs = {};
  clients = {};
  udpClients = {};
  nphandlers = {};
  accountJSONs = {};
  console.log('dsp_ips')
  for(var i = 0; i<arr.length; i++){
   // console.log(arr)
    dsp_ips.push(arr[i].ip)
  }
  console.log('initiating sockets')
  console.log(dsp_ips.length)
 // setTimeout(function(){nextSock('init');},300);
 udpCon('init', cb)
}
function getVdef(ip, callback){
  var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  console.log('start getting vdef from ' + ip)
  //var put = tclient.createPutStream()
  var get = tclient.createGetStream('/flash/vdef.json')
      var rawVdef = [];
      get.on('data', (chnk)=>{
        rawVdef.push(chnk)//zlib.gunzipSync(chnk);
      })
      get.on('end', ()=>{
      console.log('getting vdef tftp end')
      console.log(ip)
                     // console.log(get.headers['content-encoding'])
      var buffer = Buffer.concat(rawVdef)
      zlib.unzip(buffer, function(er,b){
        var vdef = JSON.parse(b.toString())
        vdefs[ip] = vdef; 
        var nvdf = [[],[],[],[],[],[],[]];
        var pVdef = [{},{},{},{},{},{},{}];
        vdef['@params'].forEach(function (p) {
          // body...
          if(("username" == p["@type"])||("user_opts" == p["@type"])||("password_hash" == p["@type"])){
            nvdf[6].push(p['@name'])
            pVdef[6][p['@name']] = p
          }else{


            nvdf[p["@rec"]].push(p['@name'])
            pVdef[p['@rec']][p['@name']] = p
          }
        })
        for(var p in vdef['@deps']){
          //console.log(p)
         // console.log(vdef['@deps'][p]['@rec'])
          nvdf[vdef['@deps'][p]['@rec']].push(p)
          pVdef[vdef['@deps'][p]['@rec']][p] = vdef['@deps'][p]

        }
        pVdef[5] = vdef["@deps"]

        nVdfs[ip] = nvdf
        pVdefs[ip] = pVdef
        callback(ip,vdef) 

        get.abort()     
        tclient = null;         
      })
     
    })
     get.on('error',(e)=>{
        console.log(e)
        tclient = null;
      })
    /*
    fs.readFile(__dirname + '/json/170429.json',(err, data) => {
      // body...
      var vdef = JSON.parse(data);
      vdefs[ip] = vdef
      
      callback(ip,vdef)
    })*/
}
function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}
function putJSONStringTftp(ip, string, filename){
  var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  var rs = new stream.Readable();
  rs.push(string)
  rs.push(null);
  var put = tclient.createPutStream(filename, {size:getBinarySize(string)})
  rs.pipe(put);
}
function getJSONStringTftp(ip, filename, callBack,enoent){
  var tclient = tftp.createClient({host:ip,retries:10, timeout:1000})
 
  var get = tclient.createGetStream(filename) 
  var chunks = [];
  get.on('data', function(chnk){
    chunks.push(chnk.toString())
  })
  get.on('end',function(){

    callBack(chunks.join(''));
  })
  get.on('error',function(e){
      enoent(e);
    
  })
}
/*function writeFtiFilesToUsb(det,list,ind,callback){
  console.log(['323',ind, list.length])
  //console.log(list)
  if(ind >= list.length){
    callback()
  }else{
    getJSONStringTftp(det.ip,list[ind],function(res){
      console.log(list)
      var path = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() + list[ind]
      console.log(path)
      fs.writeFile(path,res,(err)=>{
        if(err) throw err
        console.log(ind,list)

        writeFtiFilesToUsb(det,list,ind+1,callback);
      })
    })
  }
}*/

function writeFtiFilesToUsb(det,list,ind,callback){
  console.log(['323',ind, list.length])
  //console.log(list)
  if(ind >= list.length){
    callback('done')
  }else{
    getJSONStringTftp(det.ip,list[ind],function(res){
      console.log(list)


      var path = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() + list[ind]
      console.log(path)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase()]
      console.log(arr.concat(list[ind].split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(list[ind].split('/').slice(1,-1)),0,function(){
         fs.writeFile(path,res,(err)=>{
          if(err) throw err
          console.log(ind,list)
          writeFtiFilesToUsb(det,list,ind+1,callback);
        })
      })
     
    },function(e){
      callback('DONE!!!')
    })
  }
}
function getAccountsJSON(ip, callback){
  getJSONStringTftp(ip, '/accounts.json', function(str){
    accountJSONs[ip] = JSON.parse(str)
    callback(JSON.parse(str))
  },function(e){
    console.log(e)
  })
}

function processParam(e, Vdef, nVdf, pVdef, ip) {

  var rec_type = e.readUInt8(0)
  //  console.log(rec_type)
  var n = e.length
  var array = []
  for(var i = 0; i<((n-1)/2); i++ ){
    array[i] = e.readUInt16BE(i*2 + 1);
  }
  var pack;
  var rec = {};
   var userrec = {};
  if(rec_type == 0){
    nVdf[0].forEach(function (p) {
      rec[p] = getVal(array, 0, p, pVdef)
      // body...
    })
    /*for(var p in Vdef["@deps"]){
      if(Vdef["@deps"][p]["@rec"] == 0){
        rec[p] = getVal(array,5, p, pVdef);
      }
    }*/

    pack = {type:0, rec:rec}
    //system
  }else if(rec_type == 1){
    nVdf[1].forEach(function (p) {
      rec[p] = getVal(array, 1, p, pVdef)
      // body...
    })
    /*for(var p in Vdef["@deps"]){
      if(Vdef["@deps"][p]["@rec"] == 1){
        rec[p] = getVal(array,5, p, pVdef);
      }
    }*/
     pack = {type:1, rec:rec}
  }else if(rec_type == 2){
    nVdf[2].forEach(function (p) {
      rec[p] = getVal(array, 2, p, pVdef)
      // body...
    })
    /*for(var p in Vdef["@deps"]){
      if(Vdef["@deps"][p]["@rec"] == 2){
        rec[p] = getVal(array,5, p, pVdef);
      }
    }*/
    pack = {type:2, rec:rec}
    
  }else if(rec_type == 3){
     nVdf[3].forEach(function (p) {
      //need to account for user objects here. 
     // if(p)

      rec[p] = getVal(array, 3, p, pVdef)
      // body...
    })
   
    nVdf[6].forEach(function (p) {
      //need to account for user objects here. 
     // if(p)
      userrec[p] = getVal(array, 6, p, pVdef)
      // body...
    })
    relayUserNames({det:{ip:ip, mac:macs[ip], data:{type:5, rec:userrec, array:array.slice(-100)}}})

    pack = {type:3, rec:rec}
    
  }else if(rec_type == 4){
    nVdf[4].forEach(function (p) {
      rec[p] = getVal(array, 4, p, pVdef)
      // body...
    })

    pack = {type:4, rec:rec}
  }
 // data = null;
  relayParamMsg2({det:{ip:ip, mac:macs[ip]}, data:pack});
 
  nVdf = null;
  pVdef = null;
  array = null;
  e = null;
  rec = null;
  userrec = null;
 // pack.det = {ip:ip}
  pack = null;

}
function getVal(arr, rec, key, pVdef){
    //console.log([rec,key])
    var param = pVdef[rec][key]
    if(param['@bit_len']>16){
      pVdef = null;
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
      param = null;
      arr = null;
      pVdef = null;
      return val;
    }
}
function wordValue(arr, p){

    var n = Math.floor(p["@bit_len"]/16);
    var sa = arr.slice(p["@i_var"], p["@i_var"]+n)
    arr = null;
    if(p['@type']){
      //funcJSON['@func'][p['@type']].apply(this, sa)
      return Params[p['@type']](sa)
    //  return eval(funcJSON['@func'][p['@type']])(sa)
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
      sa = null;
      p = null;
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
   return words.map(function(w){return [(w>>8)&0xff,w&0xff].join('.')}).join('.');
  }
  static username(sa){
   var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();

  }
  static user_opts(opts){
    return opts;
  }
  static password_hash(phash){
    return phash;
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

  }else{
    console.log('else!')
    udpClients[ip] = null;
         udpClients[ip] = new UdpParamServer(ip, function(_ip,e){
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
function udpCon(ip, cb){
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
        console.log('this is the first one')
     //   nphandlers[_ip] = new NetPollEvents(_ip,vdef,write_netpoll_events)
        udpCon(_ip, cb)
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
        udpCon(_ip, cb)
      })
      
    }else{
      cb();
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
function relayUserNames(packet){
  //console.log('relay param msg 2')

  for(var pid in passocs){
    //console.log(packet)

    passocs[pid].relayUserNames(packet);
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
var nvdspips = [];

var dets;

app.set('port', (process.env.PORT || 3300));
app.use('/', express.static(path.join(__dirname,'public')));
console.log('dirname:' + __dirname)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', function(req, res) {
  res.render('test.html');
});
app.use(helmet());

http.listen(app.get('port'), function(){
//  console.log(__dirname)

	console.log('Server started: http://localhost:' + app.get('port') + '/');

});


class FtiSockIOServer{
  constructor(sock){
    this.sock = sock
    this.open = false;
    //console.log(sock)
    this.handlers = {}
    var self = this;
    sock.on('message',function (message) {
      // body...
      //if(message.data){
        try{
           var msg = JSON.parse(message)

      //sock.send(JSON.stringify({event:'wtf',data:msg}));
     // console.log(JSON.stringify(message))
      //console.log(msg.event)
       // console.log(msg)
        self.handle(msg.event, msg.data);
       // msg = null;
     }catch(e){
        console.log(message)
        console.log(e)
     }
     /*sock.once('open', function (argument) {
       // body...
       self.open = true;

     })*/
   
      
      message = null;
     // msg = null;
    })
    sock.on('close', function () {
       // body..
       sock.removeAllListeners();
     //  self.destroy();
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
   // this.handlers = {}
  // this.handlers = null;
   //this.sock = null;
   //this = null;
  }
}
//wss.on('')
wss.on('connection', function(scket, req){ 
  let loginLevel = 0;
  let curUser = '';
  var fileVer = 0;
  var socket = new FtiSockIOServer(scket)

  socket.on('close',function(){
    console.log('destroy socket')
    //socket.removeAllListeners();
    socket = null;  
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
       var relayUserNamesFunc = function (p) {
        // body...
        socket.emit('userNames',p)
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
      passocs[socket.id] = {relay:relayFunc, relayParsed:relayFuncP, relayUserNames:relayUserNamesFunc}
      rassocs[socket.id] = {relay:relayRpcFunc}
      nassocs[socket.id] = {relay:relayNetFunc}


  socket.on('reset', function (argument) {
    // body...
    clients = null;
    clients = {};
    socket.emit('resetConfirm','locate now')
  })
  socket.on('resetReq', function(argument){

  })
  socket.on('getUsers', function(ip){
 /*   var keys = db.keys();
    var users = []
    keys.forEach(function(k){
      users.push({id:k, level:db.get(k).level});
    })
    console.log(users)
    console.log(keys)
    socket.emit('userList', users)*/

  })
  usb.on('attach', function(dev){
  console.log('usb attached');
  console.log(dev)
  socket.emit('usbdetect')
  /*setTimeout(function(){
    exec("sudo fdisk -l", function(err, stdout, stderr) {
      console.log(stdout);
      var drives = []

      stdout.split('\n\n\n').forEach(function(l){
        var arr = l.split('\n');
        if(arr.length > 4){
          drives.push(arr)
        }
      });
      if(drives.length >1){
        exec('sudo mount /dev/sda1 /mnt', function(err, stdout, stderr){
          var dirtree = ['/mnt', 'FortressTechnology','Detectors','MAC','FDD']
          checkAndMkdir(dirtree,1,function(){
            var dtree = ['/mnt','FortressTechnology','Detectors','MAC','FtiFiles']
        
            checkAndMkdir(dtree,1,function(){
              //here should be the tftp stuff...
              fs.writeFile('/mnt/FortressTechnology/Detectors/MAC/test.txt', 'testing', function(){
                exec('sudo umount /dev/sda1', function(er, stdout, stderr){
                  socket.emit('testusb', 'sync complete')
                })
              });
            })
          })
        })
      }

      socket.emit('testusb', drives)
    });
   },5000)*/
 
  

  
})
usb.on('detach', function(dev){
  console.log('usb detached');
  console.log(dev)
  socket.emit('testusb',dev)
})
socket.on('syncStart', function(det){
  //check if dir exists
  var arm = new fti.ArmRpc.ArmRpc(det.ip)
    buildSyncList(arm,function(list){
      console.log('how many times am I syncing....')
      console.log(list)
      var array = list.slice(0)
      array.push('/DetectorInfo.did')
       var mac = det.mac.split('-').join('').toUpperCase();
      exec("sudo fdisk -l", function(err, stdout, stderr) {
     // console.log(stdout);
      var drives = []

      stdout.split('\n\n\n').forEach(function(l){
        var arr = l.split('\n');
        if(arr.length > 4){
          drives.push(arr)
        }
      });
      if(drives.length >1){
        exec('sudo mount /dev/sda1 /mnt', function(err, stdout, stderr){
              //here should be the tftp stuff...
              var ind = 0;
              console.log('start writing to usb')
              writeFtiFilesToUsb(det,array,0,function(){
                tftpPollForFDDList(det,0,function(fdds){
                  tftpPollForSCDList(det,0,function(scds){
                         console.log('SYNC is COMPLETE')
                exec('sudo umount /dev/sda1', function(er, stdout, stderr){
                  socket.emit('syncComplete', det)
                })
                  })
           
              });
           })
        })
      }

      socket.emit('testusb', drives)
   
    })
    })
  
    /* drivelist.list((error, drives) => {
  if (error) {
    throw error;
  }

 //socket.emit('testusb',drives)
  console.log('drivelist:')
});*/
  
  //getJSONStringTftp(det.ip, '/FDD/01/01.fdd')
})
  socket.on('login', function(arg){

    /*if(db.has(arg.id)){
      if(crypto.createHash('sha256').update(arg.pw)ç == db.get(arg.id).pw){
        loginLevel = db.get(arg.id).level
        socket.emit('loggedIn', {id:arg.id,level:db.get(arg.id).level})
        console.log('success logging in')
      }else{
        socket.emit('access denied', 'wrong password')
      }
    }else{
      socket.emit('access denied', 'username invalid')
    }*/
    if(arg.password == accounts[arg.user].password){
      socket.emit('loginSucess', {user:arg.user})
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
    var ifaces = os.networkInterfaces();  
    var iface = 'eth0'
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    var nf;// = ifaces[iface];
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else{
      nf = ifaces[iface][1]
    }
    console.log(nf)
    socket.emit('nif', nf);
  
        Helper.scan_for_dsp_board(function (e) {
          dets = e
          console.log(dets)
    dspips = [];
    nvdspips = [];
  for(var i = 0; i < e.length; i++){
    if(e[i].board_type == 1){
      var ip = e[i].ip.split('.').map(function(e){return parseInt(e)});
      var nifip = e[i].nif_ip.split('.').map(function(e){return parseInt(e)});

  if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
    //dsp not visible
    console.log('dsp not visible')
    nvdspips.push(e[i])
   
    }else if(e[i].ver == '20.17.4.27'){
      //Hack, seeing a 170427 on the network seems to cause this to crash. should actually check for versions properly in the future to ignore incompatible version.
      console.log('ignore this version')
    }else{
      console.log('dsp visible')
      dspip = ip.join('.');
      macs[dspip] = e[i].mac
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
   if((dspips.length == 0)&&(nvdspips.length >0)){
          console.log('non visible1186')
          socket.emit('notvisible', nvdspips);
        }
  initSocks(dsps, function(){
         socket.emit('locatedResp', dspips);
      
  });
    
 
});
});
socket.on('getProdList', function (ip) {
  // body...
  getProdList(ip)
})
          socket.on('vdefReq', function(det){
            if(vdefs[det.ip]){
                socket.emit('vdef',[vdefs[det.ip],det])
              }else{
                socket.emit('noVdef', det)
              }
          })
          socket.on('vdefRec', function(){
            socket.emit('vdefDone','done')
          });
          socket.on('rpc', function(pack){
           // console.log(new Buffer(pack.data))

            if(udpClients[pack.ip]){
              
              udpClients[pack.ip].send_rpc(new Buffer(pack.data), function(e){
                console.log('Ack from ' + pack.ip)

                relayRpcMsg({det:{ip:pack.ip, mac:macs[pack.ip]},data:{data:toArrayBuffer(e)}});
                e = null;

              })
              //rconns[pack.ip].send(pack.data)
            }else{
            //  console.log('failed to send rpc')
              //console.log(pack.ip)
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
    console.log('connect sing!! '+ ip)
    udpConSing(ip)
    getAccountsJSON(ip,function(json){
      socket.emit('accounts', {data:json,ip:ip, mac:macs[ip]})
    })
  })
  socket.on('authenticate', function(packet){
    console.log('authenticate this packet')
    console.log(packet)
    if(accountJSONs[packet.ip][packet.user].password == packet.pswd){
      console.log('success')
      socket.emit('authResp', {user:packet.user, level:accountJSONs[packet.ip][packet.user].acc})
    }else{
      console.log('fail')
      socket.emit('authFail')
    }
  })
  socket.on('addAccount', function(pack){

    console.log(pack)
    var accJson = JSON.parse(JSON.stringify(accountJSONs[pack.ip]));
    accJson[pack.user.user] = pack.user
    accountJSONs[pack.ip] = accJson
    console.log(accJson)
    putJSONStringTftp(pack.ip, JSON.stringify(accJson), '/accounts.json')
    setTimeout(function(){
        getAccountsJSON(pack.ip,function(json){
      socket.emit('accounts', {data:json,ip:pack.ip, mac:macs[pack.ip]})
    })
    },500)
  })
  socket.on('removeAccount', function(pack){
    var accJson = JSON.parse(JSON.stringify(accountJSONs[pack.ip]));
    delete accJson[pack.user]
    accountJSONs[pack.ip] = accJson
     putJSONStringTftp(pack.ip, JSON.stringify(accJson), '/accounts.json')
      setTimeout(function(){
        getAccountsJSON(pack.ip,function(json){
      socket.emit('accounts', {data:json,ip:pack.ip, mac:macs[pack.ip]})
    })
    },500)
  })

      

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
  socket.on('nifip', function(addr){
    //need to figure out how to determine interface gracefully. maybe specify from onset? 
    console.log(addr)
    var iface = 'eth0'
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    networking.applySettings(iface, {active:true, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:addr, netmask:'255.255.255.0'}})
      //  socket.emit('onReset')
        setTimeout(function(){
      socket.emit('resetConfirm')
    },300)
    },300)
  
   
  })
  socket.on('getInterface', function(){
    var ifaces = {}
    networking.listInterfaces().forEach(function(nif){
      ifaces[nif.name] = nif;

    })
    var iface = 'eth0'
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    //console.log(ifaces[iface])
    socket.emit('nif', ifaces[iface]);
  })
});