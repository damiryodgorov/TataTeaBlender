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
var PORT = 3300;
var IFACE = 'eth0'
let _TOUCHSCREEN_ADDR = '192.168.10.20'

if(process.argv.length >= 2){
  console.log('args:',process.argv)
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
        try{
            var msg = JSON.parse(message)
            self.handle(msg.event, msg.data);
        }catch(e){
        } 
        message = null;
    })
    sock.on('close', function () {
      console.log('closing socket')
       // body..
      sock.removeAllListeners();
      passocs[self.id] = null;
      rassocs[self.id] = null;
      nassocs[self.id] = null;
      sockrelays[self.id] = null;
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
/**IMPORTS END**/

let _accounts = {};
let _tempAccounts = {};
let _deps = {}
var prefs = [];
var cwprefs = []
var cur = Date.now()
const VERSION = 'PR2019/07/03'
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
var Helper = new FtiHelper();
var dspip = "192.168.10.59";
var dspips = [];
var nvdspips = [];

/**SYNC, EXPORT HELPERS**/
function initSocks(arr,cw, cb){
    dsp_ips = [];
    vdefs = {};
    nVdfs = {};
    pVdefs = {};
    clients = {};
    nphandlers = {};
    accountJSONs = {};
    //console.log("Inside initSocks function passed array ",arr)
    for(var i = 0; i<arr.length; i++){
     // //console.log(arr)
      dsp_ips.push(arr[i].ip)
    }
    dsp_ips = arr;
    udpCon('init',cw, cb)
}
function relayRpcMsg(packet){
  for(var pid in rassocs){
    rassocs[pid].relay(packet);
  }
  packet = null;
}
function relayParamMsg2(packet){
  for(var pid in passocs){
      passocs[pid].relayParsed(packet);
  }
  packet = null;
}
function relayUserNames(packet){
  console.log('relay User Names')
  for(var pid in passocs){
    passocs[pid].relayUserNames(packet);
  }
  packet = null;
}
function relaySockMsg(ev,arg){
  for(var sid in sockrelays){
    sockrelays[sid].relay(ev,arg)
  }
}
function relayParamMsgCW(packet){
  for(var pid in passocs){
      passocs[pid].relayParsedCW(packet);
  }
  packet = null;
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
function getVdefFromTmp(ip,callback,failed){
    fs.readFile('/tmp/vdef.json', (err, buffer)=>{
  //  var buffer = Buffer.concat(rawVdef)
    zlib.unzip(buffer, function(er,b){
      if(typeof b == 'undefined'){
        return;
      }
      var vdef = JSON.parse(b.toString())
      if(typeof vdef['@defines'] != 'undefined'){
        if(vdef['@defines']['CHECK_WEIGHER']){
          vdefs[ip.ip] = vdef; 
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
          nVdfs[ip.ip] = nvdf
          pVdefs[ip.ip] = pVdef
          vdef = null;
          b = null;
       //   get.abort()     
         // tclient = null; 
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
      //    get.abort()     
       //   tclient = null;   
        } 
      }
      failed(ip)     
    })
    //rawVdef = null;
    buffer = null;
  })
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
function processParamCW(e, _Vdef, nVdf, pVdef, ip) {
  var rec_type = e.readUInt8(0)
  var buf = e.slice(1)
  var n = e.length

  var pack;
  var rec = {};
  var userrec = {};
  if(rec_type == 0){
  console.log('SYS REC CW')
  console.log("nVdf ",nVdf)
  nVdf[0].forEach(function (p) {
    rec[p] = getVal(buf, 0, p, pVdef,_deps[ip])
  })
  for(var p in _Vdef["@deps"]){
    if(_Vdef["@deps"][p]["@rec"] == 0){
      _deps[ip][p] = rec[p]
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
    }
  }
  pack = {type:1, rec:rec}
  }else if(rec_type == 2){
  nVdf[2].forEach(function (p) {
    rec[p] = getVal(buf, 2, p, pVdef,_deps[ip])
    // body...
  })

  pack = {type:2, rec:rec}

  }else if(rec_type == 3){
  nVdf[3].forEach(function (p) {
    //need to account for user objects here. 
    rec[p] = getVal(buf, 3, p, pVdef,_deps[ip])
    // body...
  })

  nVdf[7].forEach(function (p) {
    //need to account for user objects here. 
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

  relayParamMsgCW({det:{ip:ip, mac:macs[ip]}, data:pack});

  nVdf = null;
  pVdef = null;
  e = null;
  rec = null;
  userrec = null;
  buf = null;
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
    /*if(dsp_ips.indexOf(ip) == -1){
    console.log("Here ")
    return;
  }*/
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
      }

    },function(e){
      //console.log('failed getting vdef from ', e)
    })
  }else{
    console.log('should come here!')
    udpClients[ip].refresh();
 

  getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] == 'undefined'){
        console.log('starting netpoll')
      }

    },function(e){
      //console.log('failed getting vdef from ', e)
    })
  }
  console.log("udpClients[ip] ",udpClients[ip])
}
function udpCon(ip,cw, cb){
    if(ip == 'init'){
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
function locateUnicast (addr,cb, cw) {
    var ifaces = os.networkInterfaces();
    var iface = 'eth0.1';
    var nf;
    
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
      var foundBoards = [];
      foundBoards.push(e[0]);
      for(var i = 0; i < foundBoards.length; i++){
        if(foundBoards[i].board_type == 1){
          var ip = foundBoards[i].ip.split('.').map(function(e){return parseInt(e)});
          var nifip = foundBoards[i].nif_ip.split('.').map(function(e){return parseInt(e)});
  
        if(!((ip[0] == nifip[0]) && (ip[1] == nifip[1]) && (ip[2] == nifip[2]))){
          if(cw){
            if(foundBoards[i].app_name == 'FTI_CW'){
              nvdspips.push(foundBoards[i])
            }
          }else{
            nvdspips.push(foundBoards[i])
          }
         
        }else if(foundBoards[i].ver == '20.17.4.27'){
            //Hack, seeing a 170427 on the network seems to cause this to crash. should actually check for versions properly in the future to ignore incompatible version.
            //console.log('ignore this version')
        }else{
            if(cw){
              if(foundBoards[i].app_name == 'FTI_CW'){
                dspip = ip.join('.');
                macs[dspip] = foundBoards[i].mac
                dspips.push(foundBoards[i]);
              }
            }else{
                dspip = ip.join('.');
                macs[dspip] = foundBoards[i].mac
                dspips.push(foundBoards[i]);  
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
        relaySockMsg('notvisible', nvdspips);
      }
      //initSocks(dsps.slice(0),cw, function(){relaySockMsg('locatedResp', dspips);});
      initSocks(foundBoards,cw, function(){relaySockMsg('locatedResp', dspips);});
      if(cb){cb(foundBoards)} 
  
    },addr);
}
function connectLocal(){
	var ifaces = os.networkInterfaces();
	var nf = {netmask:'255.255.0.0'};
    if(ifaces['eth0.1'][0].family == 'IPv4'){
      nf = ifaces['eth0.1'][0]
    }else if(ifaces['eth0.1'][1].family == 'IPv4'){
      nf = ifaces['eth0.1'][1]
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
		if(dets.length == 1){
      console.log("calling prefs");
		 relaySockMsg('prefs',[{name:dets[0].name, type:'single', banks:[dets[0]]}])
		}
	})
}

/** STARTING SERVER **/

app.set('port', 3000);
app.use('/', express.static(path.join(__dirname,'public')));
http.listen(app.get('port'), function(){});

/** START OF WEBSOCKET CONNECTION **/

wss.on('connection', function(scket, req){ 
    let loginLevel = 0;
    let curUser = '';
    var fileVer = 0;
    scket.on('error', function(err){
      scket.close();
    })
    req.on('error', function(err){
    })
    var socket = new FtiSockIOServer(scket)

    socket.on('close',function(){
      socket.destroy();
      socket = null;  
    })
    socket.on('getTimezones', function(){
        socket.emit('timezones',timezones)
    })
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
      if(udpClients[pack.ip]){
        console.log('send rpc')         
        udpClients[pack.ip].send_rpc(new Buffer(pack.data), function(e){
        console.log('Ack from ' + pack.ip)
        relayRpcMsg({det:{ip:pack.ip, mac:macs[pack.ip]},data:{data:toArrayBuffer(e)}});
        e = null;
        })
      }
    })
    socket.on('getVersion', function (cw) {
        socket.emit('version', VERSION)
        var checkw = (true == cw)
        passocs[socket.id].cw = checkw
        rassocs[socket.id].cw = checkw
        nassocs[socket.id].cw = checkw
        sockrelays[socket.id].cw = checkw
      
    })
    socket.on('getPrefsCW', function (cw) {
      connectLocal();
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
    socket.on('connectToUnit', function(u){
      udpConSing(u.ip,u.app)
       if(vdefs[u.ip]){
                  socket.emit('vdef',[vdefs[u.ip],u])
                }else{
                  socket.emit('noVdef', u)
                }
    })
});
/**END OF WEBSOCKET CONNECTION */