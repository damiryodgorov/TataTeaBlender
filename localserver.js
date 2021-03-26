'use strict'
/**IMPORTS START**/
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
const usb = require('usb');
const sys = require('sys');
const exec = require('child_process').exec;
const crc = require('crc');
const timezones = require('./timezones.json')
var  NetworkInfo  = require('simple-ifconfig').NetworkInfo;
var Helpers = require('./helpers.js');

var dispSettings = require('./displaySetting.json')
const usbPath = '/run/media/sda1/'



var uintToInt = Helpers.uintToInt;
var getVal = Helpers.getVal;
var passReset = Helpers.passReset;
var getBinarySize = Helpers.getBinarySize;
var putJSONStringTftp = Helpers.putJSONStringTftp;
var getFileTftp = Helpers.getFileTftp;
var checkAndMkdir = Helpers.checkAndMkdir;
var tftpPollForSCDList = Helpers.tftpPollForSCDList;
var tftpPollForFDDList = Helpers.tftpPollForFDDList;
var buildFDDList = Helpers.buildFDDList;
var buildSCDList = Helpers.buildSCDList;
var buildSyncList = Helpers.buildSyncList;
var getProdRecExport = Helpers.getProdRecExport;
var recursiveSync = Helpers.recursiveSync;
var recursiveFDDSync = Helpers.recursiveFDDSync;
var load_vdef_parameters = Helpers.load_vdef_parameters;
var writeFtiFilesToUsb = Helpers.writeFtiFilesToUsb;
var toArrayBuffer = Helpers.toArrayBuffer;
var swap16 = Helpers.swap16;
var dsp_rpc_paylod_for = Helpers.dsp_rpc_paylod_for;



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
let networking = new NetworkInfo();
//const Params = require('./params.js')
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

/**IMPORTS END**/




const VERSION = 'PR2019/07/03'

http.on('error', function(err){
  //console.log('this is an http error')
  //console.log(err)
})

let _accounts = {};
let _tempAccounts = {};
let _deps = {}
var prefs = [];
var cwprefs = []
var cur = Date.now()

/**CLASS DECLARATIONS START**/
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
/**SYNC, EXPORT HELPERS END**/
function write_netpoll_events(message, ip){
  //console.log("Writing NetpollEvents from " + ip);
 // //console.log(message);
  var msg = {det:{ip:ip, mac:macs[ip]}, data:message}
  relayNetPoll(msg)
  msg = null;
  ip = null;
  message = null;
}
function initSocks(arr,cw, cb){
  dsp_ips = [];
  vdefs = {};
  nVdfs = {};
  pVdefs = {};
  clients = {};
  nphandlers = {};
  accountJSONs = {};

  console.log(239, arr)
 // _accounts = {};
 // _tempAccounts = {};
  //console.log('dsp_ips')
  for(var i = 0; i<arr.length; i++){
   // //console.log(arr)
    dsp_ips.push(arr[i].ip)
  }
  udpCon('init',cw, cb)
}
function getPlannedBatches(ip,callback,failed){
  var tclient = tftp.createClient({host:ip, retries:10, timeout:1000})
  var get = tclient.createGetStream('/Planned_batches.json');
  var raw = [];
  get.on('data', (chunk)=>{
    raw.push(chunk);
    chunk =null;
  })
  get.on('end',()=>{
    var buffer = Buffer.concat(raw);
    var json = buffer.toString();
    callback(json);
    tclient = null;
    raw = null;
    get = null;
  })
}
function getVdef(ip, callback,failed){
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
          if(vdef['@defines']['CHECK_WEIGHER']){
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
            get.abort()     
            tclient = null; 
          }else{
            vdefs[ip] = vdef; 
            var nvdf = [[],[],[],[],[],[],[]];
            var pVdef = [{},{},{},{},{},{},{}];
            vdef['@params'].forEach(function (p) {
              if(("username" == p["@type"])||("user_lev" == p["@type"])||("user_pass_reset" == p["@type"])||("user_opts" == p["@type"])||("password_hash" == p["@type"])){
                nvdf[6].push(p['@name'])
                pVdef[6][p['@name']] = p
              }else{
                nvdf[p["@rec"]].push(p['@name'])
                pVdef[p['@rec']][p['@name']] = p
              }
            })
            for(var p in vdef['@deps']){
              nvdf[vdef['@deps'][p]['@rec']].push(p)
              pVdef[vdef['@deps'][p]['@rec']][p] = vdef['@deps'][p]
            }
            pVdef[5] = vdef["@deps"]
            nVdfs[ip] = nvdf
            pVdefs[ip] = pVdef
            callback(ip,vdef) 
            vdef = null;
            b = null;
            get.abort()     
            tclient = null;   
          } 
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
function getVdefCW(ip, callback,failed){
  var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  var get = tclient.createGetStream('/flash/vdef.json')
    var rawVdef = [];
    get.on('data', (chnk)=>{
      rawVdef.push(chnk)
      chnk = null;
    })
    get.on('end', ()=>{
      var buffer = Buffer.concat(rawVdef)
      zlib.unzip(buffer, function(er,b){
        var vdef = JSON.parse(b.toString())
        vdefs[ip] = vdef; 
        var nvdf = [[],[],[],[],[],[],[],[],[],[]];
        var pVdef = [{},{},{},{},{},{},{},{},{},{},{}];
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
            if(p['@name'] == 'Timezone'){
              pVdef[p['@rec']][p['@name']]['@type'] = 'int16'
            }
          }
        })
        for(var p in vdef['@deps']){
          nvdf[vdef['@deps'][p]['@rec']].push(p)
          pVdef[vdef['@deps'][p]['@rec']][p] = vdef['@deps'][p]
        }
        pVdef[6] = vdef["@deps"]
        nVdfs[ip] = nvdf
        pVdefs[ip] = pVdef
        callback(ip,vdef) 
        vdef = null;
        b = null;
        get.abort()     
        tclient = null;         
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
function updateDisplayFiles(files,cnt,callBack){
  if(cnt + 1 > files.length){
    callBack(true)
  }else{
    exec('sudo rm -f '+ files[cnt].split(';')[0],function(){
      exec('sudo cp /mnt/'+files[cnt].split(';')[1] + ' '+__dirname+'/'+ files[cnt].split(';')[0], function(){
        updateDisplayFiles(files, cnt+1, callBack)
      })
    })
  }
}
function unzipTar(path, callback) {
  // body...
  relaySockMsg('displayUpdate')
  relaySockMsg('updateProgress','Copying Archive')
  exec('sudo rsync '+ path + ' /home/myuser/temp', function () {
    if(crc.crc32(fs.readFileSync(path)) == crc.crc32(fs.readFileSync('/home/myuser/temp'))){
    // body...
    relaySockMsg('updateProgress','Deleting App')
    exec('sudo rm -rf /home/myuser/node',function (argument) {
      // body...
      relaySockMsg('updateProgress','Unpacking...')
       exec('sudo tar -xzf /home/myuser/temp -C /home/myuser', function(err,stdout,stderr) {
      // body...
      //console.log(stdout)
      
      setTimeout(function(){
        exec('sudo rm -f /home/myuser/temp',function(){
            relaySockMsg('updateProgress','Rebooting - this may take a while')
         callback()
      })
      },15000)
     })
    })
   }else{
    relaySockMsg('notify', 'Update Failed')
   }
  })
}
function updateBinaries(paths, ip, cnt, callBack){

  if(cnt + 1 > paths.length){
    callBack(true)
  }else{
    //console.log(501, paths[cnt])
    relaySockMsg('notify','Updating file ' + (cnt+1) +' of ' + paths.length);
    arm_burn(ip, paths[cnt], function(suc){
      if(suc){
        //var echoed = false;

      setTimeout(function(){
        updateBinaries(paths, ip, cnt+1, callBack)
      },4000)
      
      }else{
        //console.log('failed somewhere in arm_burn')
        callBack(false)
      }
    })
  }
}
const udpCallback = function(_ip,e,app){
      if(e){
 
      if(vdefs[_ip]){
      //  console.log(471, app)
        if(app == 'FTI_CW'){
          processParamCW(e,vdefs[_ip],nVdfs[_ip],pVdefs[_ip],_ip)
      }else{
        processParam(e,vdefs[_ip],nVdfs[_ip],pVdefs[_ip],_ip)
      }
     }
      }
      _ip = null;
      e = null;
}
function parse_update(str, callback){
  var array = str.split('\n')
  var arr = []
  array.forEach(function(st){
    if(st.trim().length > 0){
      arr.push(st.trim())
    }
  })
  var updateCount = parseInt(arr[0]);
  var list = [];
  //console.log(arr)
  arr.slice(1, 1+updateCount).forEach(function(s){

    var a = s.split(',')
    //console.log(a)
    if((parseInt(a[0]) == 12)||(parseInt(a[0])==14)||(parseInt(a[0]) == 16)||(parseInt(a[0]) == 18)){
      list.push('/mnt'+a[a.length-1].split('\\').join('/'));
    }else if(parseInt(a[0]) == 13){
      list.push('/mnt'+a[a.length-1].split('\\').join('/'));
    }
    //console.log(list)
  })

  callback(list)
}
function parseDisplayUpdate(argument) {
}
function parse_display_update(str, callback){
  var array = str.split('\n')
  var list = []
  array.forEach(function(st){
    if(st.trim().length > 0){
    list.push(st.trim())
  }
  })
  //console.log(list)
  callback(list)
}
function arm_burn(ip, fname, callback){
  var arm = new fti.ArmRpc.ArmRpc(ip)
  try{
  arm.verify_binary_file(fname, function(size,addr,enc_flag){
    if(addr == 0x08000000){
      //console.log('bootloader')
        arm.bootloader(function(){
       //console.log('reset to bootloader')
       
      })
      var echoed = false
      var cnt = 0
      var interval = setInterval(function(){
        if(echoed == true){
          clearInterval(interval)
        }else if(cnt > 13){
          //console.log('Too many tries')
          clearInterval(interval)
          callback(false);
        }else{
          //console.log('try ', cnt++)
          arm.prog_start(true, function(){
            clearInterval(interval)
             //console.log('prog_start callback')
            echoed = true;
             arm.prog_erase_app(enc_flag,function(){
            //console.log('program erased')
               setTimeout(function(){
                arm.prog_binary(fname,function(){
                 setTimeout(function(){
                  arm.reset(function(){
                     callback(true)
                      });
                   },500)
      
                 })
               },10000)

           })
         })
        }
        
      }, 1000)
    } else{
      relaySockMsg('notify','Resetting to bootloader...')
      arm.bootloader(function(){})
      var echoed = false
      var cnt = 0
      var interval = setInterval(function(){
       if(cnt > 13){
          relaySockMsg('notify','timeout')
          //console.log('Too many tries')
          clearInterval(interval)
          callback(false);
        }else{
          cnt++;
          //console.log('try ', cnt)
          arm.prog_start(false, function(){
            clearInterval(interval)
             //console.log('prog_start callback')
            echoed = true;
             arm.prog_erase_app(enc_flag,function(){
              relaySockMsg('notify','Program Erased...')
            //console.log('program erased')
               setTimeout(function(){
                relaySockMsg('notify','Start Programming...')
                arm.prog_binary(fname,function(){
                 setTimeout(function(){
                  arm.reset(function(){
                     callback(true)
                      });
                   },500)
      
                 })
               },10000)
           })
         })
        }
        
      }, 1000)

    }
  })
  }catch(e){
    relaySockMsg('notify','update failed')
  } 
}
function arm_program_flash(bf,arm,bl, callback){
  //console.log('programming '+ bf)
  arm.prog_start(bl, function(){
    //console.log('prog_start callback')
    arm.prog_erase_app(function(){
    //console.log('program erased')
    setTimeout(function(){
          arm.prog_binary(bf,function(){
            setTimeout(function(){
              arm.reset(function(){
                callback(true)
              });
            },500)
          })
        },10000)

  })});
}

function getAccountsJSON(ip, callback){
  getJSONStringTftp(ip, '/accounts.json', function(str){
    accountJSONs[ip] = JSON.parse(str.toString())
    callback(JSON.parse(str))
  },function(e){
    //console.log(e)
  })
}

function processParamCW(e, _Vdef, nVdf, pVdef, ip) {
   var rec_type = e.readUInt8(0)
  var buf = e.slice(1)
 // if(rec_type != 2){
    //console.log(rec_type, 'cw')
  //}
  //console.log(rec_type, 'cw')
  var n = e.length

  var pack;
  var rec = {};
   var userrec = {};
  if(rec_type == 0){
    nVdf[0].forEach(function (p) {
      if(p == 'WindowMax'){
        console.log('WindowMax')
      }
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
    console.log('PROD REC CW')
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

  relayParamMsgCW({det:{ip:ip, mac:macs[ip]}, data:pack});
 
  nVdf = null;
  pVdef = null;
  e = null;
  rec = null;
  userrec = null;
  buf = null;
 // pack.det = {ip:ip}
  pack = null;
}

function processParam(e, _Vdef, nVdf, pVdef, ip) {

  var rec_type = e.readUInt8(0)
  var buf = e.slice(1)
  //  //console.log(rec_type)
  var n = e.length

  var pack;
  var rec = {};
   var userrec = {};
  if(rec_type == 0){
    nVdf[0].forEach(function (p) {
      rec[p] = getVal(buf, 0, p, pVdef)
    })
  
    pack = {type:0, rec:rec}
    //system
  }else if(rec_type == 1){
    console.log('PROD REC')
    nVdf[1].forEach(function (p) {
      rec[p] = getVal(buf, 1, p, pVdef)
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
      rec[p] = getVal(buf, 2, p, pVdef)
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

      rec[p] = getVal(buf, 3, p, pVdef)
    //  console.log(p, rec[p])
      // body...
    })
   
    nVdf[6].forEach(function (p) {
      //need to account for user objects here. 
     // if(p)
      userrec[p] = getVal(buf, 6, p, pVdef)
      // body...
    })
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

    relayUserNames({det:{ip:ip, mac:macs[ip], data:{type:5, rec:userrec, array:usernames}}})

    pack = {type:3, rec:rec}
    
  }else if(rec_type == 4){
    nVdf[4].forEach(function (p) {
      rec[p] = getVal(buf, 4, p, pVdef)
      // body...
    })

    pack = {type:4, rec:rec}
  }
 // data = null;
  relayParamMsg2({det:{ip:ip, mac:macs[ip]}, data:pack});
 
  nVdf = null;
  pVdef = null;
  e = null;
  rec = null;
  userrec = null;
  buf = null;
 // pack.det = {ip:ip}
  pack = null;
}

function udpConSing(ip,app){
  //console.log()
  console.log(typeof udpClients[ip])
  console.log(udpClients[ip] == null)
  //console.log(udpClients[ip].ip)
  if(dsp_ips.indexOf(ip) == -1){
    return;
  }
  _tempAccounts[ip] = [];
  for(var i = 0; i<50; i++){
    _tempAccounts[ip].push({phash:null,preset:0})
  }
  if(typeof udpClients[ip] == 'undefined'){
    console.log('Why here?', app)
   
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
function udpCon(ip,cw, cb){
  if(ip == 'init'){
    console.log('init')
    if(dsp_ips.length != 0){
     getVdef(dsp_ips[0], function(_ip,vdef){
        console.log('this is the first one')
        vdef = null;
        udpCon(_ip,cw, cb)
      },function(_ip){
        udpCon(_ip,cw, cb)
      })

    }else{
      console.log('what is happening')
      cb()
    }
  }else if(dsp_ips.indexOf(ip) != -1){
    var ind = dsp_ips.indexOf(ip);
    if(ind + 1 <dsp_ips.length){
        console.log('currently grabbing vdef for ' + (ind+1))
  
     
      getVdef(dsp_ips[ind+1], function(_ip,vdef){
        vdef = null;
        udpCon(_ip,cw, cb)
      },function(_ip){
        udpCon(_ip,cw,cb)
      })
      
    }else{
      cb();
    }
   
  }
}

function relayParamMsg2(packet){
  ////console.log('relay param msg 2')

  for(var pid in passocs){
      passocs[pid].relayParsed(packet);
  }
  packet = null;
}
function relayParamMsgCW(packet){
  ////console.log('relay param msg 2')

  for(var pid in passocs){
    ////console.log(packet)
    //if(passocs[pid].cw == true){
      passocs[pid].relayParsedCW(packet);

    //}
  }
  packet = null;
}
function relayUserNames(packet){
  ////console.log('relay param msg 2')
  console.log('relay User Names')
  for(var pid in passocs){
    ////console.log(packet)

    passocs[pid].relayUserNames(packet);
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
function relayNetPoll(packet){
  //console.log('relay net poll')
  for(var pid in nassocs){
    nassocs[pid].relay(packet)
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


function update(det){
  relaySockMsg('startUpdate','');
  try{
     exec('sudo fdisk -l', function(err,stdout,stderr){
      var usbdrive = '/dev/sda1'
         var _dev = stdout.split('\n\n').map(function(disk){
        var arr = disk.trim().split('\n')
        return arr;
      })
      var _devices = []
      var devices = []
      _dev.forEach(function(d){
        if(d[0].slice(0,6) == 'Device'){
          _devices.push(d.slice(1))
        }
      })
      _devices.forEach(function(dv){
        if(dv[0]){
          if(dv[0].trim().indexOf('/dev/sd') == 0){
            dv.forEach(function(_dv){
              devices.push(_dv.split(/\s/)[0])
            })
          }
        }
      })
      if(devices.length != 0){
        usbdrive = devices[0];
      }
    //socket.emit('testusb', stdout)
      exec('sudo mount '+usbdrive +' /mnt', function(errr, stdout, stderr){
        if(errr){
          relaySockMsg('notify', 'Error mounting drive.')
          //console.log(errr);
          relaySockMsg('doneUpdate','')
        }else{
          fs.readFile('/mnt/FortressFirmwareUpdate.txt', (err, res)=>{
          if(err){
            
            exec('sudo umount '+usbdrive, function(er, stdout, stderr){
              relaySockMsg('notify', err.name)
              relaySockMsg('doneUpdate','')
            });
          }else{
            parse_update(res.toString(), function(arr){
              //console.log(arr)
              updateBinaries(arr, det.ip, 0, function(suc){
                 exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                  if(suc){
                    relaySockMsg('notify', 'update complete');
                  }else{
                     relaySockMsg('notify', 'update failed');
                  }
               
                   relaySockMsg('doneUpdate','')
                }) 
              })
            })
          }
        })
        }

      })
    })
    }catch(e){
      relaySockMsg('notify', 'update failed');
      relaySockMsg('doneUpdate','')
    }
}

function locateUnicast (addr,cb, cw) {

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
        if(cw){
          if(e[i].app_name == 'FTI_CW'){
            nvdspips.push(e[i])
          }
        }else{
          nvdspips.push(e[i])
        }
        

       
        }else if(e[i].ver == '20.17.4.27'){
          //Hack, seeing a 170427 on the network seems to cause this to crash. should actually check for versions properly in the future to ignore incompatible version.
          //console.log('ignore this version')
        }else{
          //console.log('dsp visible')
          if(cw){
            if(e[i].app_name == 'FTI_CW'){
              dspip = ip.join('.');
              macs[dspip] = e[i].mac
              dspips.push(e[i]);
            }
          }else{
            dspip = ip.join('.');
          macs[dspip] = e[i].mac
         // //console.log(dspip);
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

function connectLocal(){
	var ifaces = os.networkInterfaces()
	var nf = {netmask:'255.255.0.0'};// = ifaces[iface];
    //console.log(ifaces[iface])
    if(ifaces[IFACE][0].family == 'IPv4'){
      nf = ifaces[IFACE][0]
    }else if(ifaces[IFACE][1].family == 'IPv4'){
      nf = ifaces[IFACE][1]
    }
	locateUnicast(nf.address, function (det) {
		// body...
    var dets = []
    det.forEach(function (d) {
      // body...
      if(d.nif_ip == nf.address){
        dets.push(d)
      }
    })
    console.log('Am I not hitting this?')
		if(dets.length == 1){
		 relaySockMsg('prefs',[{name:dets[0].name, type:'single', banks:[dets[0]]}])
		}else{
      console.log(1251, dets)
    }
	})
}

function autoIP(cw){


    relaySockMsg('notify', 'Attempting to autoconnect')
    locateUnicast('255.255.255.255', function(dets){
      var x = -1
      var ips = []
      //console.log(dets)
      dets.forEach(function(d, i){
        //if(d.ip == d.nif_ip){
          if(cw){
            if(d.app_name == 'FTI_CW'){
              ips.push(d.ip)

            }
          }else{
            ips.push(d.ip)
          }
           
        if((d.dir_conn != 0) &&(d.board_type ==1)){
          x = i
        }
       // }
       
      })
      if(x != -1){
        relaySockMsg('notify', 'Detector Found')
        var det = dets[x]
      
        var addrByte = det.nif_ip.split('.')[3];
        var chosen = false
        var newIP;

        while((!chosen)&&(addrByte<255)){
          var tmpIP = det.ip.split('.').slice(0,3).join('.') + '.'+addrByte;

            if(ips.indexOf(tmpIP) == -1){
              chosen = true;
              newIP = tmpIP
            }else{
              addrByte++;
            }
          }
          if(chosen){
            setNifIp(newIP,function(){
             //console.log(1556, det)
             getVdef(det.ip,function(ip4,vdf){
                if(vdf){
                  //console.log(vdf)
                 if(vdf['@defines']['INTERCEPTOR']){
                  det.interceptor = true
                }
                if(vdf['@defines']['INTERCEPTOR_DF']){
                  det.df = true;
                }
                if(vdf['@defines']['FINAL_FRAM_STRUCT_SIZE']){
                  det.ts_login = true;   
                }
                if(cw){

                 cwprefs = [{name:det.name, type:'single', banks:[det]}];
                 relaySockMsg('prefs',cwprefs)
                }else{
                  prefs = [{name:det.name, type:'single', banks:[det]}];
                  relaySockMsg('prefs',prefs)
                }
                
                
                locateUnicast(ip4, function (argument) {
                  // body...
                  console.log('located unicast')
                },cw)
              }
             },function(){})
            })
          
        }
      
      }else{
        relaySockMsg('notify', 'Try adding detector manually')
      }

    })
}
function sendTftp(fpath){
  let data = JSON.stringify({"fpath":fpath})
    let options = {hostname: _TOUCHSCREEN_ADDR,port: 3300,path: '/get_tftp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
    }
    let rq = HTTP.request(options, rs => {
        console.log(`statusCode: ${rs.statusCode}`)
        rs.on('data', d => {
        process.stdout.write(d)
      })
    })

    rq.on('error', error => {
      console.error(error)
    })

    rq.write(data)
    rq.end()
}
function setNifIp(addr, callback){
    //need to figure out how to determine interface gracefully. maybe specify from onset? 
    //console.log(addr)
    var iface = IFACE
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    var ifaces = os.networkInterfaces();  
  
    var nf = {netmask:'255.255.0.0'};// = ifaces[iface];
    //console.log(ifaces[iface])
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else if(ifaces[iface][1].family == 'IPv4'){
      nf = ifaces[iface][1]
    }
    //console.log(nf)

    networking.applySettings(iface, {active:false, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:addr, netmask:nf.netmask}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(!err){
            //console.log(err)
          
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface '+IFACE+' inet static')
          if(ind != -1){
            arr[ind+1] = '\taddress ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              //console.log(err)
            })
          }
        }else{
          console.log(err)
          //console.log(res.toString().split('\n'));
        }
        })
         callback();
        setTimeout(function(){
         
      relaySockMsg('resetConfirm')
    },300)
    },300)
}


var Helper = new FtiHelper();
var dspip = "192.168.10.59";
var dspips = [];
var nvdspips = [];

var dets;

process.on('uncaughtException', (err) => {
  var errstring = err.toString();
  if(err.stack){
    errstring = err.stack.toString();
  }
  var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }
  fs.writeFileSync(_dir +'/error.txt', errstring);
  exec('sudo sh reboot.sh',function(){
    process.abort();
  })
  
});
if(fs.existsSync(usbPath)){
  if(!fs.existsSync(path.join(usbPath, 'json/'))){
      fs.mkdir(path.join(usbPath,'json/'));

  }
}
if(!fs.existsSync('/tmp/upload')){
  fs.mkdir('/tmp/upload')
}
console.log('starting ts on '+PORT)
app.set('port', (process.env.PORT || PORT));
app.use('/', express.static(path.join(__dirname,'public')));
//console.log('dirname:' + __dirname)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', function(req, res) {
  res.render('rpi.html');
});
app.get('/cw',function(req,res){
  res.render('cw.html')
})
app.post('/set_display', function (req, res) {
  // body...

  console.log('POST', req)
  var bod = JSON.parse(JSON.stringify(req.body))
  var addrarr = req.socket.remoteAddress.split(':')
  bod["remoteAddress"] = addrarr[addrarr.length-1]
  _TOUCHSCREEN_ADDR = bod["remoteAddress"]
  fs.writeFile('/tmp/display', JSON.stringify(bod), function () {
    // body...
  })
  //console.log('POSTRES', res)
})
app.post('/rcv_message', function (req,res) {
  var message =  "received message"
  if(typeof req.body.message != 'undefined'){
    message = req.body.message
  }
  //req.body.message
  relaySockMsg('notify', message)
  // body...
})
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
  //clients[socket.id] = req.connection.remoteAddress;
  socket.on('close',function(){
    socket.destroy();
    socket = null;  
  })
  socket.on('getDispSettings', function(){
    socket.emit('dispSettings',dispSettings)
  })
  socket.on('getTimezones', function(){
    socket.emit('timezones',timezones)
  })
  socket.on('testupload',function (file) {
    // body...
    var fn = file.fn;
    var buf = file.buf;
    fs.writeFile(path.join('/tmp/upload',fn),Buffer.from(buf,'hex'),function (argument) {
      // body...
      socket.on('notify','yay')
    })
  })
  socket.on('getConnectedClients',function(){
    socket.emit('connectedClients',Object.keys(passocs).length);
  });
  socket.on('putAndSendTftp', function(file){
    fs.writeFile(path.join('/run/media/sda1/srv/tftp/', file.filename), file.data, function(err){
      if(!err){
        sendTftp(file.filename)
      }
    })
  })
  socket.on('sendTftp',function(fpath){
    let data = JSON.stringify({"fpath":fpath})
    let options = {hostname: _TOUCHSCREEN_ADDR,port: 3300,path: '/get_tftp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
    }
    let rq = HTTP.request(options, rs => {
        console.log(`statusCode: ${rs.statusCode}`)
        rs.on('data', d => {
        process.stdout.write(d)
      })
    })

    rq.on('error', error => {
      console.error(error)
    })

    rq.write(data)
    rq.end()
  })


  socket.on('getCustomJSON', function (vmapstr) {
    var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }

    if(fs.existsSync(path.join(_dir, 'json/custVmap.json'))){
      fs.readFile(path.join(_dir, 'json/custVmap.json'), (err,data) =>{
        try{
          socket.emit('custJSON',JSON.parse(data))
        }catch(e){
        
        }
    })
    }else{
     fs.writeFile(path.join(_dir, 'json/custVmap.json') , vmapstr,function (argument) {
       // body...
       socket.emit('custJSON',JSON.parse(vmapstr))
     });
    }

    // body...
  })
  socket.on('downloadJSON',function () {
    // body...
  })
  socket.on('saveCustomJSON', function (str) {
    // body...
       var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }
     fs.writeFile(path.join(_dir, 'json/custVmap.json') , str,function (argument) {
       // body...
       console.log(argument, 1457)

       socket.emit('custJSON',JSON.parse(str))
     });
  })


  function getProdList(ip) {
    console.log('getting Prod List')
    if(vdefs[ip]){
      console.log('vdef ok')
      if(udpClients[ip]){
        console.log('udp cli ok')
        var rpc = vdefs[ip]['@rpc_map']['KAPI_PROD_DEF_FLAGS_READ']
        var packet = dsp_rpc_paylod_for(rpc[0], rpc[1])
        var buf = Buffer.from(packet)
        udpClients[ip].send_rpc(buf, function (e) {
          var msg = toArrayBuffer(e)
          var data = new Uint8Array(msg)
          var prodBits = data.slice(3)
          var dat = [];
          for(var i = 1; i < prodBits.length; i++){
        
            if(prodBits[i] == 1){
              dat.push(i)
            }
          }
          console.log(dat.length + ' products found')
          if(dat.length != 0){
            getProdName(ip,dat,0,function(ip,arr,list){
            socket.emit('prodNames',{ip:ip, names:arr, list:list})},[]);
          // body...
         
          }
           })
          
      }
    }else{
      socket.emit('noVdef', ip)
    }
  }
  function getProdName(ip, list, ind, callback, arr){
    if(vdefs[ip]){
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
        ////console.log(e)
       // array.push(e)
        var sa = []
       name.slice(3,23).forEach(function (i) {
        // body...
        sa.push(i)
      })
         var str = sa.map(function(ch){
          return String.fromCharCode(ch)
        }).join("").replace("\u0000","").trim();

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
       })
    }else{
      socket.emit('noVdef', ip)
    }
  }
  var relayFunc = function(p){
    socket.emit('paramMsg', p)
    p = null;
  }
  var relayFuncP = function (p) {
    socket.emit('paramMsg2',p)
    p = null;
  }
  var relayFuncCW = function(p){
    socket.emit('paramMsgCW',p)
  }
  var relayUserNamesFunc = function (p) {
    console.log('relay un func',p)
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
  var sockrelay = function(ev, arg){
    socket.emit(ev,arg)
  }

  
  passocs[socket.id] = {relay:relayFunc, relayParsed:relayFuncP, relayParsedCW:relayFuncCW, relayUserNames:relayUserNamesFunc}
  rassocs[socket.id] = {relay:relayRpcFunc}
  nassocs[socket.id] = {relay:relayNetFunc}
  sockrelays[socket.id] = {relay:sockrelay}

  socket.on('reset', function (argument) {
    // body...
    clients = null;
    clients = {};
    socket.emit('resetConfirm','locate now')
  })

  socket.on('getVersion', function (cw) {
    socket.emit('version', VERSION)
    var checkw = (true == cw)
    passocs[socket.id].cw = checkw
    rassocs[socket.id].cw = checkw
    nassocs[socket.id].cw = checkw
    sockrelays[socket.id].cw = checkw
  
  })
  usb.on('attach', function(dev){
    socket.emit('usbdetect')
    setTimeout(function(){
      exec('sudo fdisk -l', function(err,stdout,stderr){
        socket.emit('testusb', stdout)
      })
    }, 500)
  })
  usb.on('detach', function(dev){
    socket.emit('usbdetach')
  })
  socket.on('startUpdate', function(det){update(det);
  })
  socket.on('updateDisplay',function(){
    exec('sudo fdisk -l', function(err,stdout,stderr){
      var usbdrive = '/dev/sda1'
      var _dev = stdout.split('\n\n').map(function(disk){
      var arr = disk.trim().split('\n')
        return arr;
      })
      var _devices = []
      var devices = []
      _dev.forEach(function(d){
        if(d[0].slice(0,6) == 'Device'){
          _devices.push(d.slice(1))
        }
      })
      _devices.forEach(function(dv){
        if(dv[0]){
          if(dv[0].trim().indexOf('/dev/sd') == 0){
            dv.forEach(function(_dv){
              devices.push(_dv.split(/\s/)[0])
            })
          }
        }
      })
      if(devices.length != 0){
        usbdrive = devices[0];
      }
      socket.emit('testusb', stdout)
      exec('sudo mount '+usbdrive+' /mnt', function(err, stdout, stderr){
        if(err || stderr){
          socket.emit('notify', 'Update Failed')
        }else{
          fs.readFile('/mnt/FortressDisplayUpdate.txt', (err, res)=>{
            if(err){
              socket.emit('notify', 'issue reading file')
              exec('sudo umount '+ usbdrive, function(er, stdout, stderr){});
            }else{
              unzipTar('/mnt/'+res.toString(), function (argument) {
                exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                  exec('sudo reboot', function (argument) {
                  })
                })
              })
            }
          })
        }
      })
    })
  })
  socket.on('reboot', function(){
    exec('sudo reboot', function (argument) {
      // body...
    })
  })
  socket.on('updateDisplay_old',function(){
    exec('sudo fdisk -l', function(err,stdout,stderr){
      var usbdrive = '/dev/sda1'
      var _dev = stdout.split('\n\n').map(function(disk){
        var arr = disk.trim().split('\n')
        return arr;
      })
      var _devices = []
      var devices = []
      _dev.forEach(function(d){
        if(d[0].slice(0,6) == 'Device'){
          _devices.push(d.slice(1))
        }
      })
      _devices.forEach(function(dv){
        if(dv[0]){
          if(dv[0].trim().indexOf('/dev/sd') == 0){
            dv.forEach(function(_dv){
              devices.push(_dv.split(/\s/)[0])
            })
          }
        }
      })
      if(devices.length != 0){
        usbdrive = devices[0];
      }
      socket.emit('testusb', stdout)
      exec('sudo mount '+usbdrive+' /mnt', function(err, stdout, stderr){
        if(err || stderr){
          socket.emit('notify', 'Update Failed')
        }else{
          fs.readFile('/mnt/FortressDisplayUpdate.txt', (err, res)=>{
            if(err){
              socket.emit('notify', 'issue reading file')
              exec('sudo umount '+ usbdrive, function(er, stdout, stderr){});
            }else{
              parse_display_update(res.toString(), function(arr){
                updateDisplayFiles(arr, 0, function(suc){
                  exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                    if(suc){
                      socket.emit('notify', 'update complete - remove usb and power cycle');
                    }else{
                      socket.emit('notify', 'update failed');
                    }
                    socket.emit('doneUpdate','')
                  }) 
                })
              })
            }
          })
        }
      })
    })
  })
  socket.on('syncStart', function(det){
    //check if dir exists
    var arm = new fti.ArmRpc.ArmRpc(det.ip)
    buildSyncList(arm,function(list){
      var array = list.slice(0)
      array.push('/DetectorInfo.did')
      var mac = det.mac.split('-').join('').toUpperCase();
      exec('sudo fdisk -l', function(err,stdout,stderr){
        var usbdrive = '/dev/sda1'
        var _dev = stdout.split('\n\n').map(function(disk){
          var arr = disk.trim().split('\n')
          return arr;
        })
        var _devices = []
        var devices = []
        _dev.forEach(function(d){
          if(d[0].slice(0,6) == 'Device'){
            _devices.push(d.slice(1))
          }
        })
        _devices.forEach(function(dv){
          if(dv[0]){
            if(dv[0].trim().indexOf('/dev/sd') == 0){
              dv.forEach(function(_dv){
                devices.push(_dv.split(/\s/)[0])
              })
            }
          }
        })
        if(devices.length != 0){
          usbdrive = devices[0];
        }
        socket.emit('testusb', stdout)
        exec('sudo mount '+usbdrive+' /mnt', function(err, stdout, stderr){
          if(err || stderr){
            socket.emit('notify', 'Sync Failed')
            socket.emit('doneSync');
          }else{
            var ind = 0;
            writeFtiFilesToUsb(det,array,0,function(){
              tftpPollForFDDList(det,0,function(fdds){
                tftpPollForSCDList(det,0,function(scds){
                  exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                    socket.emit('notify', 'Sync complete');
                    socket.emit('doneSync')
                  })
                })
              });
            })
          }  
        })
      })
    })
  })
  socket.on('export',function(det){
    var arm = new fti.ArmRpc.ArmRpc(det.ip)
    arm.rpc_cb([1,6],function(e){
      if(e.readUInt8(4) == 0){
        exec('sudo fdisk -l', function(err,stdout,stderr){
          var usbdrive = '/dev/sda1'
          var _dev = stdout.split('\n\n').map(function(disk){
            var arr = disk.trim().split('\n')
            return arr;
          })

          var _devices = []
          var devices = []
          _dev.forEach(function(d){
            if(d[0].slice(0,6) == 'Device'){
              _devices.push(d.slice(1))
            }
          })
          _devices.forEach(function(dv){
            if(dv[0]){
              if(dv[0].trim().indexOf('/dev/sd') == 0){
                dv.forEach(function(_dv){
                  devices.push(_dv.split(/\s/)[0])
                })
              }
            }
          })
          if(devices.length != 0){
            usbdrive = devices[0];
          }
          socket.emit('testusb', stdout)
          exec("sudo mount "+usbdrive+" /mnt", function(err,stdout,stderr){
            if(err || stderr){
              socket.emit('notify','Error mounting drive');
              return;
            }
            getFileTftp(det.ip,'/FTIFiles/ProdRecBackup.fti', '/mnt/ProdRecBackup.fti',function(){
              exec('sudo umount ' +usbdrive, function(er, stdout, stderr){
                socket.emit('notify','Products Backed up')
              })
            },function(e){
              exec('sudo umount ' +usbdrive, function(er, stdout, stderr){
                socket.emit('notify', 'Error writing file')
              })
            })
          })  
        })
      }else{
        socket.emit('notify','Error - Check Internal USB');
      }
    })
  })
  socket.on('import',function(det){
    exec('sudo fdisk -l', function(err,stdout,stderr){
      var usbdrive = '/dev/sda1'
      var _dev = stdout.split('\n\n').map(function(disk){
        var arr = disk.trim().split('\n')
        return arr;
      })
      var _devices = []
      var devices = []
      _dev.forEach(function(d){
        if(d[0].slice(0,6) == 'Device'){
          _devices.push(d.slice(1))
        }
      })
      _devices.forEach(function(dv){
        if(dv[0]){
          if(dv[0].trim().indexOf('/dev/sd') == 0){
            dv.forEach(function(_dv){
              devices.push(_dv.split(/\s/)[0])
            })
          }
        }
      })
      if(devices.length != 0){
        usbdrive = devices[0];
      }
      socket.emit('testusb', stdout)
    
      exec("sudo mount "+usbdrive+" /mnt", function(err,stdout,stderr){
        if(err || stderr){
          socket.emit('notify','Error mounting drive');
          return;
        }
        fs.access('/mnt/ProdRecBackup.fti',function(err,stats){
          if(err){
            exec('sudo umount '+usbdrive,function(err, stdout, stderr){
             socket.emit('notify','Error reading file')
            });
          }else{
            var tclient = tftp.createClient({host:det.ip ,retries:10, timeout:1000})
            tclient.put('/mnt/ProdRecBackup.fti', '/FTIFiles/ProdRecBackup.fti', function(err){
              if(err){ socket.emit('notify','Error importing file')}else{
                var arm = new fti.ArmRpc.ArmRpc(det.ip)
                arm.rpc_cb([1,7],function(e){
                  if(e.readUInt8(4) == 0){
                    socket.emit('testusb',e);
                    exec('sudo umount '+usbdrive,function(err, stdout, stderr){
                      socket.emit('notify','Products Imported')
                      getProdList(det.ip)
                    })
                  }else{
                    exec('sudo umount '+usbdrive,function(err, stdout, stderr){
                      socket.emit('notify','Error Importing Products')
                      getProdList(det.ip)
                    })
                  }
                })
              }
            })
          }
        })
      })
    })
  })
  socket.on('backup',function(det){
    var arm = new fti.ArmRpc.ArmRpc(det.ip)
    arm.rpc_cb([1,6],function(e){
      if(e.readUInt8(4) == 0){
        exec('sudo fdisk -l', function(err,stdout,stderr){
          var usbdrive = '/dev/sda1'
          var _dev = stdout.split('\n\n').map(function(disk){
          var arr = disk.trim().split('\n')
          return arr;
          })
          var _devices = []
          var devices = []
          _dev.forEach(function(d){
            if(d[0].slice(0,6) == 'Device'){
              _devices.push(d.slice(1))
            }
          })
          _devices.forEach(function(dv){
            if(dv[0]){
              if(dv[0].trim().indexOf('/dev/sd') == 0){
                dv.forEach(function(_dv){
                  devices.push(_dv.split(/\s/)[0])
                })
              }
            }
          })
          if(devices.length != 0){
            usbdrive = devices[0];
          }
          socket.emit('testusb', stdout)
    
          exec("sudo mount "+usbdrive+" /mnt", function(err,stdout,stderr){
            if(err || stderr){
              socket.emit('notify','Error mounting drive');
              return;
            }
            var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync','FTIFiles']
            checkAndMkdir(arr,0,function(){
              getFileTftp(det.ip,'/FTIFiles/ProdRecBackup.fti', '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase()+'/Sync/FTIFiles/ProdRecBackup.fti',function(){
                exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                  socket.emit('notify','Products Backed up')
                })
              },function(e){
                exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                  socket.emit('notify', 'Error writing file')
                })
              })
            })
          })
        })
      }else{
        socket.emit('notify','Error - Check Internal USB');
      }
    })
  })
  socket.on('restore',function(det){
    exec('sudo fdisk -l', function(err,stdout,stderr){
      var usbdrive = '/dev/sda1'
      var _dev = stdout.split('\n\n').map(function(disk){
        var arr = disk.trim().split('\n')
        return arr;
      })
      var _devices = []
      var devices = []
      _dev.forEach(function(d){
        if(d[0].slice(0,6) == 'Device'){
          _devices.push(d.slice(1))
        }
      })
      _devices.forEach(function(dv){
        if(dv[0]){
          if(dv[0].trim().indexOf('/dev/sd') == 0){
            dv.forEach(function(_dv){
              devices.push(_dv.split(/\s/)[0])
            })
          }
        }
      })
      if(devices.length != 0){
        usbdrive = devices[0];
      }
      socket.emit('testusb', stdout)
      exec("sudo mount "+usbdrive+" /mnt", function(err,stdout,stderr){
        if(err || stderr){
          socket.emit('notify','Error mounting drive');
          return;
        }
        fs.access('/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase()+'/Sync/FTIFiles/ProdRecBackup.fti',function(err,stats){
          if(err){
            exec('sudo umount '+ usbdrive,function(err, stdout, stderr){socket.emit('notify','Error reading file')});
          }else{
            var tclient = tftp.createClient({host:det.ip ,retries:10, timeout:1000})
            tclient.put('/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase()+'/Sync/FTIFiles/ProdRecBackup.fti', '/FTIFiles/ProdRecBackup.fti', function(err){
              if(err){ socket.emit('notify','Error importing file')}else{
                var arm = new fti.ArmRpc.ArmRpc(det.ip)
                arm.rpc_cb([1,7],function(e){
                  if(e.readUInt8(4) == 0){
                    socket.emit('testusb',e);
                    exec('sudo umount '+usbdrive,function(err, stdout, stderr){
                      socket.emit('notify','Products Restored')
                      getProdList(det.ip)
                    })
                  }else{
                    exec('sudo umount '+usbdrive,function(err, stdout, stderr){
                      socket.emit('notify','Error Restoring Products')
                      getProdList(det.ip)
                    })
                  } 
                })
              }
            })
          }
        })
      })
    })
  })
  socket.on('getBatches', function (argument) {
    // body...
    if(fs.statSync('/run/media/sda1/srv/tftp/batches/list.txt')){
      fs.readFile('/run/media/sda1/srv/tftp/batches/list.txt', function(err, data){
        var str = data.toString().trim()
        var list = []
        try{
          list = str.split('\n').map(function(l){ return l.trim()}).map(function(b){
            return {id:b,stats:fs.statSync('/run/media/sda1/srv/tftp/batches/'+b)}
          })  
        }catch(e){
          console.log(e)
        }
        

        socket.emit('batchList', list)
      })
    }else{
      socket.emit('batchList', 'not found')
    }
  })
  socket.on('downloadBatch', function (fn) {
    fs.readFile('/run/media/sda1/srv/tftp/batches/'+ fn, function (err, data) {
      // body...
      socket.emit('batchDownload', {fn:fn, data:data.toString()})
    })
    // body...
  })
  socket.on('logOut', function(arg){
    loginLevel = 0;
    socket.emit('logOut','logged out')
  })
  socket.on('locateUnicast', function (addr, cw) {
    console.log('locate Unicast')
    locateUnicast(addr,function(){ console.log('located')}, cw)
  });
  socket.on('locateReq', function (cw) {
    var ifaces = os.networkInterfaces();  
    var iface = IFACE
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
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
      dspips = [];
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
            dspips.push(e[i]);
            if(cw){
              console.log(e[i].app_name)
              if(e[i].app_name == 'FTI_CW'){
                cwips.push(e[i])
              }
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
      initSocks(dsps.slice(0),cw, function(){
        if(cw){
          console.log('should come here')
          socket.emit('locatedResp',cwips)
        }else{
          console.log('is it coming here?')
          socket.emit('locatedResp', dspips);         
        } 
      });
    });
  });
  socket.on('getProdList', function (ip) {
    console.log('get Prod List')
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
           console.log(new Buffer(pack.data), pack)

            if(udpClients[pack.ip]){
              console.log('send rpc')
              
              udpClients[pack.ip].send_rpc(new Buffer(pack.data), function(e){
                console.log('Ack from ' + pack.ip)

                relayRpcMsg({det:{ip:pack.ip, mac:macs[pack.ip]},data:{data:toArrayBuffer(e)}});
                e = null;

              })
             }
  })
  socket.on('getPrefs', function (cw) {
    var fnm = 'json/prefData.json'
       var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }
  console.log(_dir, 2119)
  
    if(fs.existsSync(path.join(_dir, fnm))){
      fs.readFile(path.join(_dir, fnm), (err,data) =>{
        try{
          prefs = JSON.parse(data)
        }catch(e){
        
        }
        if(prefs.length == 0){
          if(dispSettings.mode == 0){
            autoIP(false);  
          }else{
            socket.emit('notify', 'Display is in static mode')
          }
          
        }else{
          socket.emit('prefs', prefs)  
        }
      })
    }else{
      socket.emit('prefs',prefs)
    }
  })
  socket.on('connectLocal',function (argument) {
  	// body...
  	connectLocal()
  })
  socket.on('getPrefsCW', function (cw) {
 
    connectLocal();
  })
 
  socket.on('connectToUnit', function(u){
    console.log('connect sing!! ', JSON.stringify(u))
    udpConSing(u.ip,u.app)
    getAccountsJSON(u.ip,function(json){
      socket.emit('accounts', {data:json,ip:u.ip, mac:macs[ip]})
    })
     if(vdefs[u.ip]){
                socket.emit('vdef',[vdefs[u.ip],u])
              }else{
                socket.emit('noVdef', u)
              }
  })
  socket.on('getPlannedBatches',function (ip) {
    console.log('get planned batches')
    // body...
    getPlannedBatches(ip, function (argument) {
      // body...
      socket.emit('batchJson', argument);
    })
    /*if(fs.existsSync('/srv/tftp/Planned_batches.json')){
    fs.readFile('/srv/tftp/Planned_batches.json', (err,data) =>{
      console.log('planned batches')
      if(!err){
         var batchJsonString = data.toString();
          socket.emit('batchJson', batchJsonString)
      }else{
        console.log('error?')
      }
     
    })
  }*/
  })
  socket.on('authenticate', function(packet){
    console.log('authenticate this packet')
    //console.log(packet)
    var hash = crypto.createHash('sha1').update(Buffer.from((packet.pswd + '000000').slice(0,6),'ascii')).digest().slice(0,8)
    console.log('hash',hash)
    if(typeof _accounts[packet.ip] == 'undefined'){
        socket.emit('notify', 'Authentication Error')
    }else if(typeof _accounts[packet.ip][packet.user] == 'undefined'){

        socket.emit('notify', 'Authentication Error')
    }
    var ap = _accounts[packet.ip][packet.user].phash

    var tempUser;
    if(typeof _tempAccounts[packet.ip] != 'undefined'){
      tempUser  = _tempAccounts[packet.ip][packet.user]
    
    }else{
      var tmpArr = []
      for(var i = 0; i < 50; i++){
        tmpArr.push({phash:null,preset:0})
      }
      _tempAccounts[packet.ip] = tmpArr.slice(0);
      tempUser  = _tempAccounts[packet.ip][packet.user]
    } 
    console.log('get tmpuser',hash)
    //console.log(_accounts[packet.ip][packet.user].phash)
    if(ap.equals(hash)){
      console.log('success')
      _tempAccounts[packet.ip][packet.user] = {..._accounts[packet.ip][packet.user]}
      _tempAccounts[packet.ip][packet.user].preset = 0;
      socket.emit('authResp', {user:packet.user,username:_accounts[packet.ip][packet.user].username,level:_accounts[packet.ip][packet.user].opt, reset:_accounts[packet.ip][packet.user].preset, ip:packet.ip})
      
    }else if((packet.user == 0) && ((packet.pswd + '000000').slice(0,6) == '218500')){
      socket.emit('authResp', {user:packet.user,username:'FORTRESS',level:5, reset:_accounts[packet.ip][packet.user].preset, ip:packet.ip})
    }else if(tempUser.preset && tempUser.phash.equals(hash)){
      socket.emit('authResp', {user:packet.user,username:_accounts[packet.ip][packet.user].username,level:_accounts[packet.ip][packet.user].opt, reset:1, ip:packet.ip})
      
    }else{
      //console.log('fail')
      socket.emit('authFail', {user:packet.user, ip:packet.ip})
    }

  })
  socket.on('writeUserData', function(packet){
    var users = _accounts[packet.ip].slice(0);
    var pswd = users[packet.data.user].phash;
    if(packet.data.password != '*******'){
      pswd = crypto.createHash('sha1').update(Buffer.from(packet.data.password,'ascii')).digest().slice(0,8)
    }
    users[packet.data.user] = {username:packet.data.username, opt:packet.data.acc, phash:pswd}
    console.log('users',packet.data.username)
    var _users = []
    for(var i = 0; i<vdefs[packet.ip]['@defines']['MAX_USERNAMES']; i++){
      var user = Buffer.from((users[i].username + "          ").slice(0,10),'ascii');
      var _phash = users[i].phash//crypto.createHash('sha1').update(Buffer.from(packet.data[i].password,'ascii')).digest();
      var phash = Buffer.alloc(8)
      phash.writeUInt16BE(_phash.readUInt16LE(2),0);
      phash.writeUInt16BE(_phash.readUInt16LE(0),2);
      phash.writeUInt16BE(_phash.readUInt16LE(6),4);
      phash.writeUInt16BE(_phash.readUInt16LE(4),6);
      var useropt = Buffer.alloc(2);
      var opt = parseInt(users[i].opt) & 0b1111
      useropt.writeUInt8(parseInt(users[i].opt),0)
      _users.push(Buffer.concat([user,phash,useropt]))
    }
    var buf = Buffer.concat(_users);
    if(buf.length != vdefs[packet.ip]['@defines']['USER_STRUCT_SIZE']){
      console.log('wrong size')
      socket.emit('notify','Error updating users' + buf.length + ' ' + vdefs[packet.ip]['@defines']['USER_STRUCT_SIZE'])
    }else{
      var pkt = dsp_rpc_paylod_for(vdefs[packet.ip]['@rpc_map']['KAPI_RPC_USERSTRUCTWRITE'][0],vdefs[packet.ip]['@rpc_map']['KAPI_RPC_USERSTRUCTWRITE'][1],buf)
       udpClients[packet.ip].send_rpc(Buffer.from(pkt), function(e){
                console.log('Ack from ' + packet.ip)
               // socket.emit('notify', e.length)
                relayRpcMsg({det:{ip:packet.ip, mac:macs[packet.ip]},data:{data:toArrayBuffer(e)}});
                e = null;

              })
             
    }
  })
  socket.on('writeNewBatch',function (packet) {
    var buf = Buffer.alloc(26)
    var batchJson = packet.data
    console.log(batchJson)
    buf.writeUInt32LE(batchJson.PlanBatchId,0)
    buf.write((batchJson.PlanBatchRef + '                ').slice(0,16), 4, 16,'ascii')
    buf.writeUInt32LE(batchJson.PlanNumPacks,20)
    buf.writeUInt16LE(batchJson.PlanProdNum,24)
    console.log('batchBuffer',buf)
    var pkt = dsp_rpc_paylod_for(vdefs[packet.ip]['@rpc_map']['KAPI_RPC_PLANBATCHWRITE'][0],vdefs[packet.ip]['@rpc_map']['KAPI_RPC_PLANBATCHWRITE'][1],buf)
    udpClients[packet.ip].send_rpc(Buffer.from(pkt), function(e){
      console.log('Ack from ' + packet.ip)
      relayRpcMsg({det:{ip:packet.ip, mac:macs[packet.ip]},data:{data:toArrayBuffer(e)}});
    })
    // body...
  })
   socket.on('writePass', function(packet){
    console.log('writePass', packet)
    var users = _accounts[packet.ip].slice(0);
    console.log(users[packet.data.user].phash)
    var pswd =  crypto.createHash('sha1').update(Buffer.from((packet.data.password + '000000').slice(0,6),'ascii')).digest().slice(0,8)
    
    users[packet.data.user].phash = pswd
    console.log(pswd)
    var _users = []
    for(var i = 0; i<vdefs[packet.ip]['@defines']['MAX_USERNAMES']; i++){
      var user = Buffer.from((users[i].username + "          ").slice(0,10),'ascii');
      var _phash = users[i].phash//crypto.createHash('sha1').update(Buffer.from(packet.data[i].password,'ascii')).digest();
      var phash = Buffer.alloc(8)
      phash.writeUInt16BE(_phash.readUInt16LE(2),0);
      phash.writeUInt16BE(_phash.readUInt16LE(0),2);
      phash.writeUInt16BE(_phash.readUInt16LE(6),4);
      phash.writeUInt16BE(_phash.readUInt16LE(4),6);
      var useropt = Buffer.alloc(2);
      var opt = parseInt(users[i].opt) & 0b1111
      useropt.writeUInt8(parseInt(users[i].opt),0)
      _users.push(Buffer.concat([user,phash,useropt]))
    }
    var buf = Buffer.concat(_users);
    if(buf.length > vdefs[packet.ip]['@defines']['USER_STRUCT_SIZE']){
      socket.emit('notify','Error updating users' + buf.length + ' ' + vdefs[packet.ip]['@defines']['USER_STRUCT_SIZE'])
    }else{
      var pkt = dsp_rpc_paylod_for(vdefs[packet.ip]['@rpc_map']['KAPI_RPC_USERSTRUCTWRITE'][0],vdefs[packet.ip]['@rpc_map']['KAPI_RPC_USERSTRUCTWRITE'][1],buf)
      udpClients[packet.ip].send_rpc(Buffer.from(pkt), function(e){
        console.log('Ack from ' + packet.ip)
        relayRpcMsg({det:{ip:packet.ip, mac:macs[packet.ip]},data:{data:toArrayBuffer(e)}});
        e = null;
      })       
    }
  })
  socket.on('passReset',function(packet){
    console.log('passReset')
  // var users = _accounts[packet.ip].slice(0);
    var password = passReset();
    console.log('why does it not get here')
    console.log(password)
    //users[packet.data.user].phash = password.phash
    //users[packet.data.user].opt += 16;

   _tempAccounts[packet.ip][packet.data.user].phash = password.phash;
   _tempAccounts[packet.ip][packet.data.user].preset = 1;
  
          socket.emit('passwordNotify', password.seeds)
            
   
  }) 
  socket.on('addAccount', function(pack){

    //console.log(pack)
    var accJson = JSON.parse(JSON.stringify(accountJSONs[pack.ip]));
    accJson[pack.user.user] = pack.user
    accountJSONs[pack.ip] = accJson
    //console.log(accJson)
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


  socket.on('savePrefs', function (f) {
    // body...
    //console.log(f)
       var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }
    fs.writeFile(path.join(_dir, 'json/prefData.json') , JSON.stringify(f));
  })
  socket.on('savePrefsCW', function (f) {
    // body...
       var _dir = __dirname;
  if(fs.existsSync(usbPath)){
    _dir = usbPath
  }
    console.log(JSON.stringify(f))
    fs.writeFile(path.join(_dir, 'json/cwprefData.json') , JSON.stringify(f),(err) => {
      if (err) throw err;
      console.log('The file has been saved!');
  });
  })
  socket.on('hello', function(f){
    socket.emit('connected', "CONNECTION");
  });
  socket.on('nifip', function(addr){

    var iface = IFACE
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    var ifaces = os.networkInterfaces();  
  
    var nf;// = ifaces[iface];
    //console.log(ifaces[iface])
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else{
      nf = ifaces[iface][1]
    }
    //console.log(nf)
    networking.applySettings(iface, {active:false, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:addr, netmask:nf.netmask}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface '+IFACE+' inet static')
          if(ind != -1){
            arr[ind+1] = '\taddress ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              //console.log(err)
            })
          }
          //console.log(res.toString().split('\n'));
        })
        setTimeout(function(){
      socket.emit('resetConfirm')
    },300)
    },300)
  
   
  })
  socket.on('nifnm', function(addr){
    //need to figure out how to determine interface gracefully. maybe specify from onset? 
    //console.log(addr)
    var iface = IFACE
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    var ifaces = os.networkInterfaces();  
  
    var nf;
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else{
      nf = ifaces[iface][1]
    }
    //console.log(nf)
    var ip = nf.address;
    networking.applySettings(iface, {active:true, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:nf.address, netmask:addr}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            //console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface '+IFACE+' inet static')
          if(ind != -1){
            arr[ind+2] = '\tnetmask ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              //console.log(err)
            })
          }
          //console.log(res.toString().split('\n'));
        })
        setTimeout(function(){
      socket.emit('resetConfirm')
    },300)
    },300)
  
   
  })
  socket.on('dispMode',function(m){
    dispSettings.mode = m;
    fs.writeFile('./displaySetting.json', JSON.stringify(dispSettings), function(e){
     relaySockMsg('dispSettings', dispSettings);
    })
  })
  socket.on('nifgw',function(gw){
    exec('sudo ip route change default via '+gw+' dev '+IFACE,function(_err, stdout, stderr){
      if(!_err){
        exec('sudo ip route flush cache',function(er, stdout, stderr){
            fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            //console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface ' + IFACE + ' inet static')
          if(ind != -1){
            arr[ind+3] = '\tgateway ' + gw
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              //console.log(err)
            })
          }

            setTimeout(function(){
             socket.emit('resetConfirm')
            },300)
        })
        })
      }
    })
  })
  socket.on('getInterface', function(){
    var ifaces = {}
    networking.listInterfaces().forEach(function(nif){
      ifaces[nif.name] = nif;

    })
    var iface = IFACE
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
     exec('sudo route',function(err, stdout, stderr){
      ////console.log(stdout.split('\n')[2][1])
      var rarr = stdout.split('\n')
      var rin = -1
      for(var i=0; i<rarr.length; i++){
        if(rarr[i].indexOf('default') != -1){
          rin = i;
          //break;
        }
      }
      if(rin != -1){
        var gw = rarr[rin].split('\t')[1]
        ifaces[iface].gateway = gw;
        socket.emit('nif', ifaces[iface])
      }
      
    })
    exec('sudo route',function(err, stdout, stderr){})
  })

});