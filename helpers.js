'use strict'
const tftp = require('tftp');
const fs = require('fs');
const fti = require('./fti-flash-node/index.js');
const arloc = fti.ArmFind;
const crypto = require('crypto')

const PASS_SEED1_OFFSET = 68
const PASS_SEED2_OFFSET = 105
const PASS_SEED3_OFFSET = 78
const PASS_SEED4_OFFSET = 111
class Params{
 
  static int64(val){
    var buf = Buffer.alloc(8)
    for(var j = 0; j<4; j++){
      buf.writeUInt16LE(val[j], j*2)
    }
  // var arr = []
   // for (var i = 0; i<2; i++){

    //  arr.push(buf.readInt32LE(i*4))
   // }
    return buf//val[1] << 48 | val[0] << 32 | val[3] << 16 | val[2]
  }
    static fdbk_rate(rate,rate1, mode){
      console.log('fdbk mode', rate, rate1, mode)
    var val = Params.float([rate,rate1])
    if(mode == 0){
      return val
  
    }else if(mode == 1){
      return val + ' grams/sec'
    }else if(mode == 2){
      return val + ' grams/pulse'
    }
    return val;
  }
  static int32_array(val){
    var buf = Buffer.alloc(1200);
    console.log(val.length)
    for(var j = 0; j<val.length; j++){
      buf.writeUInt16LE(val[j],j*2)
    }
    var arr = []
    for(var i = 0; i<300;i++){
      arr.push(buf.readInt32LE(i*4));
    }
    return arr;
  }
  static uint32_array(val){
    var buf = Buffer.alloc(1000);
    console.log(val.length)
    for(var j = 0; j<val.length; j++){
      buf.writeUInt16LE(val[j],j*2)
    }
    var arr = []
    for(var i = 0; i<250;i++){
      arr.push(buf.readUInt32LE(i*4));
    }
    return arr;
  }
  static uint16_array(val){
    var buf = Buffer.alloc(1000);
    console.log(val.length)
    for(var j = 0; j<val.length; j++){
      buf.writeUInt16LE(val[j],j*2)
    }
    var arr = []
    for(var i = 0; i<250;i++){
      arr.push(buf.readUInt16LE(i*4));
    }
    return arr
  }
  static float_array(val){
    var buf = Buffer.alloc(1200);
    console.log(val.length)
    for(var j = 0; j<val.length; j++){
      buf.writeUInt16LE(val[j],j*2)
    }
    var arr = []
    for(var i = 0; i<300;i++){
      arr.push(buf.readFloatLE(i*4));
    }
    return arr;
  }
  static int32(val){
    return val[1] << 16 | val[0]
  }
  static int8(val){
    return val;
  }
  static uint32(val){
    return val[1] << 16 | val[0]
  }
  static int16(val){
    return uintToInt(val,16)
  }
  static float(val){
    var int = val[1] << 16 | val[0]
    var buf = Buffer.alloc(4);
    buf.writeInt32LE(int)
    return buf.readFloatLE(0)
  }
  static float_dist(val1,val2,metric){
    var int = val2 << 16 | val1
    var buf = Buffer.alloc(4);
    buf.writeInt32LE(int)
    return Params.mm(buf.readFloatLE(0),metric)
  }
  static dist_float(val1,val2,metric){
    var int = val2 << 16 | val1
    var buf = Buffer.alloc(4);
    buf.writeInt32LE(int)
    return Params.mm(buf.readFloatLE(0),metric)
  }
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
    ////console.log(sa)
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
    ////console.log(wet);
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
  static cwbeltspeed(speed,metric){
    if(metric==0){
      return (speed*3.281).toFixed(1) + ' ft/min'
    }else{
      return speed.toFixed(1) + ' M/min'
    }
  }
  static belt_speed(tpm0, tpm1, metric, tack,tps=231.0){
    ////console.log(tpm);
    //this is for cw... need to change name
    //return Params.float(tpm)
    var tpm = Params.float([tpm0,tpm1])
    //if(metric == 0)
    return Params.cwbeltspeed(tpm,metric)
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
  //  //console.log(res);
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
    ////console.log(patt)
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
    ////console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16BE(i*2));
    }
    return wArray;

  }

  static convert_word_array_LE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    ////console.log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16LE(i*2));
    }
    ////console.log(wArray)
    return wArray;

  }
  static ipv4_address(words){
    //todo
    ////console.log(ip)
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

function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= (32 - nbit);
    uint >>= 32 - nbit;
    return uint;
}
function getVal(arr, rec, key, pVdef,_deps){
   // console.log([rec,key])
    var param = pVdef[rec][key]
    if(param['@bit_len']>16){
      //pVdef = null;

      return wordValue(arr, param, rec, pVdef,_deps)
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
            
            }else if(param['@type'] == 'int16'){
              val = uintToInt(val,16)
            }else if(param['@name'] == 'Timezone'){
              val = uintToInt(val, 16)
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
function wordValue(arr, p, r, pVdef,_deps){

    var n = Math.floor(p["@bit_len"]/16);

    var sa = [];
    for(var i = 0; i< n; i++){
      //if(Buffer.byteLength(arr) >= (p["@_ivar"]+i+1)*2){
             sa.push(arr.readUInt16LE((p["@i_var"]+i)*2));       
      //}
    }
   // arr = null;
    if(p['@type']){
      if(Params[p['@type']]){
        var deps = []
        if(p['@dep']){
          p['@dep'].forEach(function (d) {
            // body...
            var rec = 0
            if(d.indexOf('ProdRec') != -1){
              rec = 1;
            }
           // console.log(421,p['@name'],d, _deps)
            var dp = 0//getVal(arr,rec,d,pVdef)
            if(typeof _deps != 'undefined'){
              if(typeof _deps[d] != 'undefined'){
                dp = _deps[d]
              }
            }
            deps.push(dp)

          })
           arr = null;
        pVdef = null;
        //console.log(428, deps)
        return Params[p['@type']].apply(this, [].concat.apply([], [sa, deps]));
        }else{
          return Params[p['@type']](sa)
        }

       
      }else{
        console.log(p['@type'])
        return null;
      }
      
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
    }else  if(p['@bit_len'] == 32){
        return sa[1] << 16 | sa[0]
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
    }).join("");
      sa = null;
      p = null;
    return str; 
    }
    
}
function passReset(){
  console.log('in passreset')
  //var randPass = [];
  var randNum = Math.floor(Math.random()*10000)
  var randPass = itoa(randNum,10,4)
  var asciiArr = randPass.split('').map(function(c){
    return c.charCodeAt(0);
  })
  console.log('after itoa')
  return {password:randPass,phash:crypto.createHash('sha1').update(Buffer.from((randPass + '000000').slice(0,6),'ascii')).digest().slice(0,8),seeds:[asciiArr[0]^PASS_SEED1_OFFSET,asciiArr[1]^PASS_SEED2_OFFSET,asciiArr[2]^PASS_SEED3_OFFSET,asciiArr[3]^PASS_SEED4_OFFSET]}

 // return 
  //randPass.push(Math.floor(randNum/1000))
  //randNum
}

function itoa(number, base,len) {

    //Zero is always zero
    if(number == 0)
    {
       // setResult('0');
        return '0000';
    }
    var str = new Array();
    var negative = (number < 0);
    var A = 55; //'A' = 65 in integer - 10 --> so that 10 will be converted to 55 + 10 = A 
    if (negative) { //For base 10 we will just append - at the end
        if (base == 10) {
            number *= -1;
        } else { //For all other bases, we will get the twos complement.
            number = (number >>> 0);
        }
    }

    var remainder = 0;
    var index = 0;
    while ((number > 0)||(len>0)) {

        remainder = number % base;
        if (remainder > 9) //for numbers with base > 10
        {
            str.unshift(String.fromCharCode(remainder + A));
        } else {
            str.unshift(remainder);
        }
        number = (number / base >> 0); //Integer devision
        len--;
    }
    //Only 10 base numbers are preceded with a negative sign, all other numbers are using nth complement
    if (negative) {
        if (base == 10) {
            str.unshift('-');
        }
    }
    return(str.join(''));
}

/**TFTP HELPER START**/
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
   // //console.log(chnk)
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
/**TFTP HELPER END**/

//networking.listInterfaces().then(//console.log).catch(console.error);
/**SYNC, EXPORT HELPERS START**/
function checkAndMkdir(targetpath,i, callback){
  if(i>targetpath.length){
    callback()
  }else{
  fs.access(targetpath.slice(0,i).join('/'), function(err){
    //console.log('109')
      if(err && err.code === 'ENOENT'){
        fs.mkdir(targetpath.slice(0,i).join('/'), function(){
          //console.log('112')
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
      //console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      //console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, filename, fpath,function(){
      //  //console.log(ind,list)
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
      //console.log(fpath)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      //console.log(arr.concat(filename.split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(filename.split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, filename, fpath,function(){
      //  //console.log(ind,list)
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
    //console.log(e)
    getJSONStringTftp(det.ip,'/FtiFiles/ProdRecBackup.fti',function(res){
      //write
      callback(res)
    },function(err){
      //console.log(err)
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
     // //console.log([nr,type,pathlen,pth.toString('ascii')])
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

      //console.log('something went wrong')
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
      
     // //console.log([nr,type,pathlen,pth.toString('ascii')])

    }else if(state == 7){
      arm.rpc_cb([3,9],function(_e){
        arm.clearCB(function(e){
  
       return   recursiveFDDSync(e,arm,paths.slice(0),callBack)
        }, _e)
          })
    }else if(state == 10){
      callBack(paths)
    }else{
      //console.log('state',state)
      //console.log('something went wrong')
      callBack(paths)
    }
    return null;
    //arm.rpc_cb([3,16],function(e){
      //push filename, move on
}
function load_vdef_parameters(json){
 // //console.log(json)
  return json;
}
function writeFtiFilesToUsb(det,list,ind,callback){
  //console.log(['323',ind, list.length])
  ////console.log(list)
  if(ind >= list.length){
    callback('done')
  }else{

   var path = '/mnt/FortressTechnology/Detectors/'+det.mac.split('-').join('').toUpperCase() +'/Sync' + list[ind]
      //console.log(path)
      var arr = ['/mnt','FortressTechnology','Detectors',det.mac.split('-').join('').toUpperCase(),'Sync']
      //console.log(arr.concat(list[ind].split('/').slice(1,-1)))
      checkAndMkdir(arr.concat(list[ind].split('/').slice(1,-1)),0,function(){
     getFileTftp(det.ip, list[ind], path,function(){
        //console.log(ind,list)
        writeFtiFilesToUsb(det,list,ind+1,callback);
      },function(e){throw e})
    })
  }
}
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  buffer = null;
  return ab;
}
function swap16(val){return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);}
function dsp_rpc_paylod_for (n_func, i16_args, byte_data) {
  var rpc = [];
  var n_args = i16_args.length;
  var bytes = [];
  if (n_args > 3) n_args = 3;
  if (typeof byte_data == "string") {
    for(var i=0; i<byte_data.length; i++) {
      bytes.push(byte_data.charCodeAt(i));
    }         
  }else if (byte_data instanceof Array) {
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
module.exports = {}
module.exports.uintToInt = uintToInt;
module.exports.getVal = getVal;
module.exports.wordValue = wordValue;
module.exports.passReset = passReset;
module.exports.itoa = itoa;
module.exports.getBinarySize = getBinarySize;
module.exports.putJSONStringTftp = putJSONStringTftp;
module.exports.getFileTftp = getFileTftp;
module.exports.getJSONStringTftp = getJSONStringTftp;
module.exports.checkAndMkdir = checkAndMkdir;
module.exports.tftpPollForFDDList = tftpPollForFDDList;
module.exports.tftpPollForSCDList = tftpPollForSCDList;
module.exports.buildFDDList = buildFDDList;
module.exports.buildSCDList = buildSCDList;
module.exports.buildSyncList = buildSyncList;
module.exports.getProdRecExport = getProdRecExport;
module.exports.recursiveSync = recursiveSync;
module.exports.recursiveFDDSync = recursiveFDDSync;
module.exports.load_vdef_parameters = load_vdef_parameters;
module.exports.writeFtiFilesToUsb = writeFtiFilesToUsb;
module.exports.toArrayBuffer = toArrayBuffer;
module.exports.swap16 = swap16;
module.exports.dsp_rpc_paylod_for = dsp_rpc_paylod_for;