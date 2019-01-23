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
const crc = require('crc');

var  NetworkInfo  = require('simple-ifconfig').NetworkInfo;

const VERSION = 'PR2019/01/23'

http.on('error', function(err){
  console.log('this is an http error')
  console.log(err)
})

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
      "belt_speed":"(function(tpm,metric,tack,tps){if(tack!=0){var speed= (tps/tpm)*60;  if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}} var speed= (231.0/tpm)*60; if (metric==0){return (speed*3.281).toFixed(1) + ' ft/min';}else{return speed.toFixed(1) + ' M/min'}})",
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
      "password_hash":"(function(phash){    var buf = Buffer.alloc(8); buf.writeUInt16LE(phash[1],0); buf.writeUInt16LE(phash[0],2); buf.writeUInt16LE(phash[2],6); buf.writeUInt16LE(phash[3],4);return buf;});"
      }
  }

var accounts = {"operator":{"acc":1,"password":"0123"},"engineer":{"acc":2,"password":"0123"},"fortress":{"acc":3,"password":"0123"}}

let _accounts = {};

var prefs = [];

var cur = Date.now()

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

   var fpath = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() +'/Sync' + filename
      console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, filename, fpath,function(){
      //  console.log(ind,list)
        tftpPollForFDDList(det,nr+1,callback);
    },function(e){
      callback(e)
    })
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

  var fpath = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() +'/Sync' + filename
      console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, filename, fpath,function(){
      //  console.log(ind,list)
        tftpPollForSCDList(det,nr+1,callback);
    },function(e){
      callback(e)
    })
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
function getProdRecExport(det,callback){
  var arm = new fti.ArmRpc.ArmRpc(det.ip)
 
  arm.rpc_cb([1,6],function(e){
    console.log(e)
    getJSONStringTftp(det.ip,'/FtiFiles/ProdRecBackup.fti',function(res){
      //write
      callback(res)
    },function(err){
      console.log(err)
    })
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
  _accounts = {};
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
function getVdef(ip, callback,failed){
  var tclient = tftp.createClient({host:ip ,retries:10, timeout:1000})
  console.log('start getting vdef from ' + ip)
  //var put = tclient.createPutStream()
  var get = tclient.createGetStream('/flash/vdef.json')
      var rawVdef = [];
      get.on('data', (chnk)=>{
        rawVdef.push(chnk)//zlib.gunzipSync(chnk);
        chnk = null;
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
        vdef = null;
        b = null;
        get.abort()     
        tclient = null;         
      })
      rawVdef = null;
      buffer = null;
     
    })
     get.on('error',(e)=>{
        console.log(e)
        rawVdef = null;
        tclient = null;
        failed(ip);
      })

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
function getFileTftp(ip,remote,local,callback,enoent){
  var tclient = tftp.createClient({host:ip,retries:10, timeout:1000})
  tclient.get(remote,local,function(err){
    if(err){
      enoent(err);
    }else{
      callback();
    }
  })
}
function getJSONStringTftp(ip, filename, callBack,enoent){
  var tclient = tftp.createClient({host:ip,retries:10, timeout:1000})
 
  var get = tclient.createGetStream(filename) 
  var chunks = [];
  get.on('data', function(chnk){
   // console.log(chnk)
    chunks.push(chnk)
  })
  get.on('end',function(){

    callBack(chunks.join(''));
    chunks = null;
  })
  get.on('error',function(e){
      enoent(e);
      chunks = null;
  })
}
function updateDisplayFiles(files,cnt,callBack){
  if(cnt + 1 > files.length){
     //relaySockMsg('notify', 'End Update Display')
    callBack(true)
  }else{
     // relaySockMsg('notify', 'Start Update Display')
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
      console.log(stdout)
      
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
    console.log(501, paths[cnt])
    relaySockMsg('notify','Updating file ' + (cnt+1) +' of ' + paths.length);
    arm_burn(ip, paths[cnt], function(suc){
      if(suc){
        //var echoed = false;

      setTimeout(function(){
        updateBinaries(paths, ip, cnt+1, callBack)
      },4000)
      
      }else{
        console.log('failed somewhere in arm_burn')
        callBack(false)
      }
    })
  }

}
let udpCallback = function(_ip,e){
      if(e){
 
      if(vdefs[_ip]){
        processParam(e,vdefs[_ip],nVdfs[_ip],pVdefs[_ip],_ip)
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
  console.log(arr)
  arr.slice(1, 1+updateCount).forEach(function(s){

    var a = s.split(',')
    console.log(a)
    if((parseInt(a[0]) == 12)||(parseInt(a[0])==14)||(parseInt(a[0]) == 16)||(parseInt(a[0]) == 18)){
      list.push('/mnt'+a[a.length-1].split('\\').join('/'));
    }else if(parseInt(a[0]) == 13){
      list.push('/mnt'+a[a.length-1].split('\\').join('/'));
    }
    console.log(list)
  })

  callback(list)
}
function parseDisplayUpdate(argument) {
  // body...
}
function parse_display_update(str, callback){
  var array = str.split('\n')
  //relaySockMsg('notify')
  var list = []
  array.forEach(function(st){
    if(st.trim().length > 0){
    list.push(st.trim())
  }
  })
  console.log(list)
  callback(list)
}
function arm_burn(ip, fname, callback){
  var arm = new fti.ArmRpc.ArmRpc(ip)
  try{
  arm.verify_binary_file(fname, function(size,addr,enc_flag){
    if(addr == 0x08000000){
      console.log('bootloader')
        arm.bootloader(function(){
       console.log('reset to bootloader')
       
      })
      var echoed = false
      var cnt = 0
      var interval = setInterval(function(){
        if(echoed == true){
          clearInterval(interval)
        }else if(cnt > 13){
          console.log('Too many tries')
          clearInterval(interval)
          callback(false);
        }else{
          console.log('try ', cnt++)
          arm.prog_start(true, function(){
            clearInterval(interval)
             console.log('prog_start callback')
            echoed = true;
             arm.prog_erase_app(enc_flag,function(){
            console.log('program erased')
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
      console.log('now reset to bootloader')
      arm.bootloader(function(){
       console.log('reset to bootloader')
       
      })
      var echoed = false
      var cnt = 0
      var interval = setInterval(function(){
       if(cnt > 13){
          relaySockMsg('notify','timeout')
          console.log('Too many tries')
          clearInterval(interval)
          callback(false);
        }else{
          cnt++;
          console.log('try ', cnt)
          arm.prog_start(false, function(){
            clearInterval(interval)
             console.log('prog_start callback')
            echoed = true;
             arm.prog_erase_app(enc_flag,function(){
              relaySockMsg('notify','Program Erased...')
            console.log('program erased')
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
  console.log('programming '+ bf)
  arm.prog_start(bl, function(){
    console.log('prog_start callback')
    arm.prog_erase_app(function(){
    console.log('program erased')
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
function writeFtiFilesToUsb(det,list,ind,callback){
  console.log(['323',ind, list.length])
  //console.log(list)
  if(ind >= list.length){
    callback('done')
  }else{

   var path = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() +'/Sync' + list[ind]
      console.log(path)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      console.log(arr.concat(list[ind].split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(list[ind].split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, list[ind], path,function(){
        console.log(ind,list)
        writeFtiFilesToUsb(det,list,ind+1,callback);
      },function(e){throw e})
    })
  }
}
function getAccountsJSON(ip, callback){
  getJSONStringTftp(ip, '/accounts.json', function(str){
    accountJSONs[ip] = JSON.parse(str.toString())
    callback(JSON.parse(str))
  },function(e){
    console.log(e)
  })
}

function processParam(e, Vdef, nVdf, pVdef, ip) {

  var rec_type = e.readUInt8(0)
  var buf = e.slice(1)
  //  console.log(rec_type)
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
    for(var i = 0; i<10; i++){
      usernames.push({username:userrec['UserName'+i], acc:userrec['UserOptions'+i]});
      accArray.push({username:userrec['UserName'+i], opt:userrec['UserOptions'+i], phash:userrec['PasswordHash'+i]})
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

function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= (32 - nbit);
    uint >>= 32 - nbit;
    return uint;
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
        var wd = (arr.readUInt16LE((param['@i_var']+1)*2)<<16) | (arr.readUInt16LE(param['@i_var']*2))
        val = (wd >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
        
      }else{
        val = arr.readUInt16LE(param["@i_var"]*2);
         if(typeof param['@name'] != 'undefined'){
          if((param['@name'].indexOf('HaloPeak') != -1) && (param['@bit_len'] == 16)){

              val = uintToInt(val,16)
            
            }
          }
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

    var sa = [];
    for(var i = 0; i< n; i++){
      sa.push(arr.readUInt16LE((p["@i_var"]+i)*2));
    }
    arr = null;
    if(p['@type']){

      return Params[p['@type']](sa)
    }else if('DateTime' == p['@name']){
     
     var sa0 = sa[0]
     var sa1 = sa[1]
     var month
      var sec = ('0' + ((sa0&0x1f)*2).toString()).slice(-2)
      var min = ('0' + ((sa0>>5)&0b111111).toString()).slice(-2)
      var hr =  ('0' +(sa0>>11).toString()).slice(-2);
      var dd = ('0' +(sa1 & 0x1f).toString()).slice(-2)
      var mm = ('0' + ((sa1 >>5)&0xf).toString()).slice(-2)
      var year = 1980 + (sa1 >> 9)
      return year+'/'+mm+'/'+dd + ' ' +hr +':'+min+':'+sec ;

    }else if('EtherExtPorts' == p['@name']){
      return sa[0]
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
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
      return (String.fromCharCode((e%256),(e>>8)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_serno_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
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
  static belt_speed(tpm, metric, tack,tps=231.0){
    //console.log(tpm);
    if(tack!=0){

     var speed = (tps/tpm) * 60;
    if(metric==0){
      return (speed*3.281).toFixed(1) + ' ft/min'
    }else{
      return speed.toFixed(1) + ' M/min'
    }
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
      return (String.fromCharCode((e%256),(e>>8)));
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
   return words.map(function(w){return [w&0xff,(w>>8)&0xff].join('.')}).join('.');
  }
  static username(sa){
   var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
    }).join("");
    return str.replace("\u0000","").trim();

  }
  static user_opts(opts){
    return opts;
  }
  static password_hash(phash){
    var buf = Buffer.alloc(8);
    buf.writeUInt16BE(phash[1],0);
    buf.writeUInt16BE(phash[0],2);
    buf.writeUInt16BE(phash[2],6);
    buf.writeUInt16BE(phash[3],4);
    return buf;
  }
}

function udpConSing(ip){
  if(dsp_ips.indexOf(ip) == -1){
    return;
  }
  if(typeof udpClients[ip] == 'undefined'){
   
    udpClients[ip] = null;
       udpClients[ip] = new UdpParamServer(ip ,udpCallback)
    getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] == 'undefined'){
        nphandlers[__ip] = new NetPollEvents(__ip,vdef,write_netpoll_events)
      }

    },function(e){
      console.log('failed getting vdef from ', e)
    })
    console.log(udpClients)
  }else{
    console.log('else!')
    udpClients[ip].release_sock();
    udpClients[ip].callback = null;
    udpClients[ip].so.removeAllListeners('message');
    //udpClients[ip].so.off('listening')

    udpClients[ip] = null;
    delete udpClients[ip];
    console.log(udpClients)
         udpClients[ip] = new UdpParamServer(ip, udpCallback)
         setTimeout(function(){
                   console.log('listener count: ', udpClients[ip].so.listenerCount('message').toString())
         },500)

    getVdef(ip, function(__ip,vdef){
      if(typeof nphandlers[__ip] != 'undefined'){
        nphandlers[__ip] = null;
        delete nphandlers[__ip];
       
      }
       nphandlers[__ip] = new NetPollEvents(__ip,vdef,write_netpoll_events)
    },function(e){
      console.log('failed getting vdef from ', e)
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
        vdef = null;
     //   nphandlers[_ip] = new NetPollEvents(_ip,vdef,write_netpoll_events)
        udpCon(_ip, cb)
      },function(_ip){
        console.log('timeout for vdef')
        udpCon(_ip, cb)
      })
      

    }
  }else if(dsp_ips.indexOf(ip) != -1){
    var ind = dsp_ips.indexOf(ip);
    if(ind + 1 <dsp_ips.length){
        console.log('currently grabbing vdef for ' + (ind+1))
  
     
      getVdef(dsp_ips[ind+1], function(_ip,vdef){
        vdef = null;
        udpCon(_ip, cb)
      },function(_ip){
        console.log('timeout for vdef')
        udpCon(_ip,cb)
      })
      
    }else{
      cb();
    }
   
  }
}

function relayParamMsg(packet){

  for(var pid in passocs){
  
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
    buffer = null;
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
         }else if(Buffer.isBuffer( byte_data )){
          for(var i = 0; i<byte_data.length;i++){
            bytes.push(byte_data.readUInt8(i));
          }
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
          console.log(errr);
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
              console.log(arr)
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

function locateUnicast (addr,cb) {


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
     exec('sudo route',function(err, stdout, stderr){
      //console.log(stdout.split('\n')[2][1])
      var rarr = stdout.split('\n')
      console.log(rarr)
      var rin = -1
      for(var i=0; i<rarr.length; i++){
        if(rarr[i].indexOf('default') != -1){
          rin = i;
          //break;
        }
      }
      if(rin != -1){
        var garr = rarr[rin].split(/\s+/);
        console.log(1877, garr)
        var gw = garr[1]
      
        relaySockMsg('gw', gw)
      }
      
    })
    relaySockMsg('nif', nf);
   
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
            relaySockMsg('notvisible', nvdspips);
    
          }
    initSocks(dsps.slice(0), function(){
      console.log('this should be updatings...', dspips)
           relaySockMsg('locatedResp', dspips);
          
        
    });
       
    if(cb){
    cb(e.slice(0))
  }    
  },addr);

}

function autoIP(){
 // var prefData = prefs
 /*
  if(fs.existsSync(path.join(__dirname, 'json/prefData.json'))){
    fs.readFile(path.join(__dirname, 'json/prefData.json'), (err,data) =>{
      try{
         prefs = JSON.parse(data)
         if(prefs.length == 1){
          if(prefs.banks.length == 1){
            var addr = prefs[0].banks[0].ip
            locateUnicast(addr)
          }
         }
      }catch(e){
        
      }
    })
    }else{
      
    }*/
    relaySockMsg('notify', 'Attempting to autoconnect')
    locateUnicast('255.255.255.255', function(dets){
      var x = -1
      var ips = []
      console.log(dets)
      dets.forEach(function(d, i){
        if(d.ip != d.nif_ip){
           ips.push(d.ip)
        if((d.dir_conn != 0) &&(d.board_type ==1)){
          x = i
        }
        }
       
      })
      if(x != -1){
        relaySockMsg('notify', 'Detector Found')
        var det = dets[x]
      
        var addrByte = 14;
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
             console.log(1556, det)
             getVdef(det.ip,function(ip4,vdf){
                if(vdf){
                  console.log(vdf)
                 if(vdf['@defines']['INTERCEPTOR']){
                  det.interceptor = true
                }
                if(vdf['@defines']['INTERCEPTOR_DF']){
                  det.df = true;
                }
                if(vdf['@defines']['FINAL_FRAM_STRUCT_SIZE']){
                  det.ts_login = true;   
                }
                 prefs = [{name:det.name, type:'single', banks:[det]}];
                
                relaySockMsg('prefs',prefs)
                locateUnicast(ip4)
              }
             })
            })
          
        }
      }else{
        relaySockMsg('notify', 'Try adding detector manually')
      }

    })

}
function setNifIp(addr, callback){
    //need to figure out how to determine interface gracefully. maybe specify from onset? 
    console.log(addr)
    var iface = 'eth0'
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
    var ifaces = os.networkInterfaces();  
  
    var nf = {netmask:'255.255.0.0'};// = ifaces[iface];
    console.log(ifaces[iface])
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else if(ifaces[iface][1].family == 'IPv4'){
      nf = ifaces[iface][1]
    }
    console.log(nf)

    networking.applySettings(iface, {active:false, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:addr, netmask:nf.netmask}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface eth0 inet static')
          if(ind != -1){
            arr[ind+1] = '\taddress ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              console.log(err)
            })
          }
          console.log(res.toString().split('\n'));
        })
         callback();
        setTimeout(function(){
         
      relaySockMsg('resetConfirm')
    },300)
    },300)
  
   
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
  	console.log('scan')
    arloc.ArmLocator.scan(1000, function(e){
     // console.log(e)
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

var dets;
process.on('uncaughtException', (err) => {
    
    var errstring = err.toString();
    if(err.stack){
      errstring = err.stack.toString();
    }

     fs.writeFileSync(__dirname +'/error.txt', errstring);
     console.log(err);
    process.abort();
  
 
 
});
app.set('port', (process.env.PORT || 3300));
app.use('/', express.static(path.join(__dirname,'public')));
console.log('dirname:' + __dirname)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.get('/', function(req, res) {
  res.render('rpi.html');
});
app.use(helmet());
app.on('error', function(err){
  console.log(err)
})

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
        self.handle(msg.event, msg.data);
       // msg = null;
     }catch(e){
        console.log(message)
        console.log(e)
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

wss.on('error', function(error){
  console.log("error should be handled here....")
  console.log(error)

 // throw error
})
//wss.on('')
wss.on('connection', function(scket, req){ 
  let loginLevel = 0;
  let curUser = '';
  var fileVer = 0;
  scket.on('error', function(err){
    console.log('this is a socket error', err)
    scket.close();
 //   socket.close();
  })
  req.on('error', function(err){
    console.log('this is a req error', err)
  })
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
    var sockrelay = function(ev, arg){
      socket.emit(ev,arg)
    }
      console.log(socket.id)
      passocs[socket.id] = {relay:relayFunc, relayParsed:relayFuncP, relayUserNames:relayUserNamesFunc}
      rassocs[socket.id] = {relay:relayRpcFunc}
      nassocs[socket.id] = {relay:relayNetFunc}
      sockrelays[socket.id] = {relay:sockrelay}

  socket.on('reset', function (argument) {
    // body...
    clients = null;
    clients = {};
    socket.emit('resetConfirm','locate now')
  })
 /* setInterval(function(){
    cur = Date.now();
    socket.emit('echo')
  },10000)
  socket.on('echoback',function(){
    console.log('time to echo: ', (Date.now() - cur))
  })*/
  socket.on('getVersion', function (argument) {
    // body...
    socket.emit('version', VERSION)
  })
  usb.on('attach', function(dev){
  console.log('usb attached');
  console.log(dev)
  socket.emit('usbdetect')
  setTimeout(function(){
     exec('sudo fdisk -l', function(err,stdout,stderr){
    socket.emit('testusb', stdout)
  })
   }, 500)
 
  
})
usb.on('detach', function(dev){
  console.log('usb detached');
  console.log(dev)
  socket.emit('usbdetach')
})
socket.on('startUpdate', function(det){

      update(det);
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
              //here should be the tftp stuff...
       if(err || stderr){
          socket.emit('notify', 'Update Failed')
        }else{
          fs.readFile('/mnt/FortressDisplayUpdate.txt', (err, res)=>{
          if(err){
            socket.emit('notify', 'issue reading file')
            exec('sudo umount '+ usbdrive, function(er, stdout, stderr){

            });
          }else{

              unzipTar('/mnt/'+res.toString(), function (argument) {
                // body...
                exec('sudo umount '+usbdrive, function(er, stdout, stderr){
                 
                  exec('sudo sh reboot.sh', function (argument) {
                    // body...
                    console.log('reboot')
                    //process.abort()
                  })
                })
              })
           
          }
        })
        }
    })
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
              //here should be the tftp stuff...
       if(err || stderr){
          socket.emit('notify', 'Update Failed')
        }else{
          fs.readFile('/mnt/FortressDisplayUpdate.txt', (err, res)=>{
          if(err){
            socket.emit('notify', 'issue reading file')
            exec('sudo umount '+ usbdrive, function(er, stdout, stderr){

            });
          }else{
            parse_display_update(res.toString(), function(arr){
              console.log(arr)
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
      console.log('how many times am I syncing....')
      console.log(list)
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
              //here should be the tftp stuff...
              if(err || stderr){
                 socket.emit('notify', 'Sync Failed')
                  socket.emit('doneSync');
              }else{
                   var ind = 0;
              console.log('start writing to usb')
              writeFtiFilesToUsb(det,array,0,function(){
                tftpPollForFDDList(det,0,function(fdds){
                  tftpPollForSCDList(det,0,function(scds){
                         console.log('SYNC is COMPLETE')
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
      console.log(1580,e)
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
                console.log('RPC Response', e)
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
   // getProdRecExport(det,function(res){
    var arm = new fti.ArmRpc.ArmRpc(det.ip)
    arm.rpc_cb([1,6],function(e){
      console.log(1580,e)
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
    //  console.log(arr.concat(list[ind].split('/').slice(1,-1)))
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
       
        exec('sudo umount '+ usbdrive,function(err, stdout, stderr){
           socket.emit('notify','Error reading file')
          });
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
  socket.on('logOut', function(arg){
    loginLevel = 0;
    socket.emit('logOut','logged out')
  })


  console.log("connected")
 socket.on('locateUnicast', function (addr) {

  locateUnicast(addr)
});

  socket.on('locateReq', function (argument) {

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
     exec('sudo route',function(err, stdout, stderr){
      //console.log(stdout.split('\n')[2][1])
      var rarr = stdout.split('\n')
      console.log(rarr)
      var rin = -1
      for(var i=0; i<rarr.length; i++){
        if(rarr[i].indexOf('default') != -1){
          rin = i;
          //break;
        }
      }
      if(rin != -1){
        var garr = rarr[rin].split(/\s+/);
        console.log(1877, garr)
        var gw = garr[1]
      
        socket.emit('gw', gw)
      }
      
    })
    socket.emit('nif', nf);
  
    Helper.scan_for_dsp_board(function (e) {
          dets = e
          //console.log(dets)
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
  initSocks(dsps.slice(0), function(){
    console.log('this should be updating....',dspips)
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
      try{
         prefs = JSON.parse(data)
      }catch(e){
        
      }
      if(prefs.length == 0){

        autoIP();
      }else{
        socket.emit('prefs', prefs)  
      }
      
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
    var hash = crypto.createHash('sha1').update(Buffer.from((packet.pswd + '000000').slice(0,6),'ascii')).digest().slice(0,8)
    var ap = _accounts[packet.ip][packet.user].phash
    console.log(hash)
    console.log(_accounts[packet.ip][packet.user].phash)
    if(ap.equals(hash)){
      console.log('success')
      socket.emit('authResp', {user:packet.user,username:_accounts[packet.ip][packet.user].username,level:_accounts[packet.ip][packet.user].opt})
    }else if((packet.user == 0) && ((packet.pswd + '000000').slice(0,6) == '218500')){
      socket.emit('authResp', {user:packet.user,username:_accounts[packet.ip][packet.user].username,level:_accounts[packet.ip][packet.user].opt})
    }else{
      console.log('fail')
      socket.emit('authFail')
    }

  })
  socket.on('writeUserData', function(packet){
    var users = _accounts[packet.ip].slice(0);
    var pswd = users[packet.data.user].phash;
    if(packet.data.password != '*******'){
      pswd = crypto.createHash('sha1').update(Buffer.from(packet.data.password,'ascii')).digest().slice(0,8)
    }
    users[packet.data.user] = {username:packet.data.username, opt:packet.data.acc, phash:pswd}
    console.log('users',users)
    var _users = []
    for(var i = 0; i<10; i++){
      var user = Buffer.from((users[i].username + "          ").slice(0,10),'ascii');
      var _phash = users[i].phash//crypto.createHash('sha1').update(Buffer.from(packet.data[i].password,'ascii')).digest();
      var phash = Buffer.alloc(8)
      phash.writeUInt16BE(_phash.readUInt16LE(2),0);
      phash.writeUInt16BE(_phash.readUInt16LE(0),2);
      phash.writeUInt16BE(_phash.readUInt16LE(6),4);
      phash.writeUInt16BE(_phash.readUInt16LE(4),6);
      var useropt = Buffer.alloc(2);
      useropt.writeUInt16LE(parseInt(users[i].opt),0)
      _users.push(Buffer.concat([user,phash,useropt]))
    }
    var buf = Buffer.concat(_users);
    if(buf.length != vdefs[packet.ip]['@defines']['FINAL_FRAM_STRUCT_SIZE']){
      socket.emit('notify','Error updating users')
    }else{
      var pkt = dsp_rpc_paylod_for(vdefs[packet.ip]['@rpc_map']['KAPI_RPC_FRAMSTRUCTWRITE'][0],vdefs[packet.ip]['@rpc_map']['KAPI_RPC_FRAMSTRUCTWRITE'][1],buf)
      console.log(vdefs[packet.ip]['@rpc_map']['KAPI_RPC_FRAMSTRUCTWRITE'])
      console.log(Buffer.from(pkt))
       udpClients[packet.ip].send_rpc(Buffer.from(pkt), function(e){
                console.log('Ack from ' + packet.ip)

                relayRpcMsg({det:{ip:packet.ip, mac:macs[packet.ip]},data:{data:toArrayBuffer(e)}});
                e = null;

              })
             
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
    var ifaces = os.networkInterfaces();  
  
    var nf;// = ifaces[iface];
    console.log(ifaces[iface])
    if(ifaces[iface][0].family == 'IPv4'){
      nf = ifaces[iface][0]
    }else{
      nf = ifaces[iface][1]
    }
    console.log(nf)
    networking.applySettings(iface, {active:false, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:addr, netmask:nf.netmask}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface eth0 inet static')
          if(ind != -1){
            arr[ind+1] = '\taddress ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              console.log(err)
            })
          }
          console.log(res.toString().split('\n'));
        })
        setTimeout(function(){
      socket.emit('resetConfirm')
    },300)
    },300)
  
   
  })
    socket.on('nifnm', function(addr){
    //need to figure out how to determine interface gracefully. maybe specify from onset? 
    console.log(addr)
    var iface = 'eth0'
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
    console.log(nf)
    var ip = nf.address;
    networking.applySettings(iface, {active:true, ipv4:{address:'0.0.0.0'}})
    setTimeout(function(){
        networking.applySettings(iface, {active:true, ipv4:{address:nf.address, netmask:addr}})
        fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface eth0 inet static')
          if(ind != -1){
            arr[ind+2] = '\tnetmask ' + addr
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              console.log(err)
            })
          }
          console.log(res.toString().split('\n'));
        })
        setTimeout(function(){
      socket.emit('resetConfirm')
    },300)
    },300)
  
   
  })
  socket.on('nifgw',function(gw){
    exec('sudo ip route change default via '+gw+' dev eth0',function(_err, stdout, stderr){
      if(!_err){
        exec('sudo ip route flush cache',function(er, stdout, stderr){
            fs.readFile('/etc/network/interfaces', (err,res)=>{
          if(err){
            console.log(err)
          }
          var arr = res.toString().split('\n')
          var ind = arr.indexOf('iface eth0 inet static')
          if(ind != -1){
            arr[ind+3] = '\tgateway ' + gw
            fs.writeFile('/etc/network/interfaces', arr.join('\n'), function(err){
              console.log(err)
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
    var iface = 'eth0'
    if(os.platform() == 'darwin'){
      iface = 'en4'
    }
     exec('sudo route',function(err, stdout, stderr){
      //console.log(stdout.split('\n')[2][1])
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
    //console.log(ifaces[iface])
   // socket.emit('nif', );
    exec('sudo route',function(err, stdout, stderr){
      console.log(stdout.split('\n'))
    })
  })

});