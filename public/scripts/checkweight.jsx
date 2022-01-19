const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
const timezoneJSON = require('./timezones.json')
//var SmoothieChart = require('./smoothie.js').SmoothieChart;
//var TimeSeries = require('./smoothie.js').TimeSeries;
import { Uint64LE } from 'int64-buffer';
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AreaSeries, Borders, HorizontalBarSeries, LabelSeries, VerticalRectSeries, XAxis, XYPlot, YAxis } from 'react-vis';
import { v4 as uuidv4 } from 'uuid';
import { CircularButton, CircularButton2 } from './buttons.jsx';
import { AlertModal, AuthfailModal, LockModal, MessageModal, Modal, ProgressModal, ScrollArrow, TrendBar } from './components.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { CustomKeyboard, EmbeddedKeyboard } from './keyboard.jsx';
import { PopoutWheel } from './popwheel.jsx';
var onClickOutside = require('react-onclickoutside');
//import {ZoomInIcon, ZoomOutIcon} from '@material-ui/icons';

var createReactClass = require('create-react-class');
var fileDownload = require('js-file-download');

let inputSrcArr = ["NONE","TACH","EYE","RC1","RC2","ISO_1","IO_PL8_01","IO_PL8_02","IO_PL8_03","IO_PL8_04","IO_PL8_05","IO_PL8_06","IO_PL8_07","IO_PL8_08","IO_PL8_09","IO_PL6_01","IO_PL6_02","IO_PL6_03"];
let outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']
// let outputSrcArr = ["NONE","REJ_MAIN","REJ_ALT","FAULT","LS_RED","LS_YEL","LS_GRN","LS_BUZ","DOOR_LOCK","WARNING","FEEDBACK_UP","FEEDBACK_DOWN","BATCH_RUNNING","SAFETY_CIRCUIT","CAN_START_BELTS"]

let fileReader;

const _ioBits = ['TACH','EYE','RC_1','RC_2','REJ_EYE','AIR_PRES','REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP','CIP_TEST','CIP_PLC','PROD_SEL1','PROD_SEL2','PROD_SEL3','PROD_SEL4',
                  'TEST','NONE','REJ_MAIN','REJ_ALT','FAULT','TEST_REQ','HALO_FE', 'HALO_SS', 'LS_RED','LS_YEL','LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']
var liveTimer = {}
var myTimers = {}

const SPARCBLUE2 = '#30A8E2'
const SPARCBLUE1 = '#1C3746'
const SPARCBLUE3 = '#475C67'
const FORTRESSPURPLE1 = 'rgb(40, 32, 72)'
const FORTRESSPURPLE2 = '#5d5480'
const FORTRESSPURPLE3 = '#6d6490'
const FORTRESSGRAPH = '#b8860b'
const DISPLAYVERSION = '2021/12/16'

const vdefMapV2 = require('./vdefmapcw.json')
const funcJSON = require('./funcjson.json')

let vdefByMac = {};
var _Vdef;
var _pVdef;
//let isVdefSet = false;
var _nVdf;

var categories;
var netMap = vdefMapV2['@netpollsmap']

var vMapV2 = vdefMapV2["@vMap"]
var vMapLists = vdefMapV2['@lists']
var categoriesV2 = [vdefMapV2["@pages"]['CWSys']]
var catMapV2 = vdefMapV2["@catmap"]
var labTransV2 = vdefMapV2['@labels']

const FtiSockIo = require('./ftisockio.js')
const Params = require('./params.js')
const FastZoom = cssTransition({ 
	enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 300  
})

let SingletonDataStore = {sysRec:{},prodRec:{}}


/*************Helper functions start**************/
function setBufferBits(buf,v,byte_pos,bit_pos,bit_len){
	if(bit_len == 8){
		buf.writeUInt8(v,byte_pos + bit_pos/8)
	}else if(bit_len == 16){
		buf.writeUInt16LE(v, byte_pos)
	}else if(bit_len > 16){
		var tbuf = Buffer.from(v)

		buf = Buffer.concat(buf.slice(0,byte_pos), tbuf, buf.slice(byte_pos+bit_len/8));
	}else{

	}
}
function ToFixed(v,s){
  if(typeof v == 'undefined'){
    v = 0;
  }else if(v == null){
    v = 0;
  }
  return v.toFixed(s)
}
function roundTo(num, dec) {    
    return +(Math.round(num + "e+" + dec)  + "e-" + dec);
}
function formatLength(l, u){
  
  if(typeof l == 'undefined'){
    l = 0;
  }else if(l == null){
    l = 0;
  }
  if(u==0){
    return (l/25.4).toFixed(1) + " in"
  }
  else{
      return Math.round(l) + " mm";
  }
}
function FormatWeightD(wgt, unit, d){
  if(typeof wgt == 'undefined'){
    wgt = 0;
  }else if(wgt == null){
    wgt = 0;
  }
    if(unit == 1){
      return (wgt/1000).toFixed(3) + ' kg'
    }else if(unit == 2){
      return (wgt/453.59237).toFixed(d+1) + ' lbs'
    }else if (unit == 3){
      return (wgt/28.3495).toFixed(d+1) + ' oz'
    }
    return wgt.toFixed(d) + ' g'
}

function FormatWeight(wgt, unit){
  if(typeof wgt == 'undefined'){
    wgt = 0;
  }else if(wgt == null){
    wgt = 0;
  }
    if(unit == 1){
      if(wgt>=10000000)
      {
        return (wgt/1000000).toFixed(3)+' tonne'
      }
      else{
        return (wgt/1000).toFixed(3) + ' kg'
      }
    }else if(unit == 2){
      if(wgt>=10000000)
      {
        return (((wgt/453.59237).toFixed(1))/2000).toFixed(1) + ' ton'
      }
      else{
        return (wgt/453.59237).toFixed(1) + ' lbs'
      }
    }else if (unit == 3){
      return (wgt/28.3495).toFixed(2) + ' oz'
    }
    return wgt.toFixed(1) + ' g'
    //return wgt.toFixed(2) + ' g'
}

function FormatWeightS(wgt, unit){
  if(typeof wgt == 'undefined'){
    wgt = 0;
  }else if(wgt == null){
    wgt = 0;
  }

    if(unit == 1){
      if(wgt>=10000000)
      {
        return (wgt/1000000).toFixed(3)+' tonne'
      }
      else{
        return (wgt/1000).toFixed(3) + ' kg'
      }
    }else if(unit == 2){
      if(wgt>=10000000)
      {
        return (((wgt/453.59237).toFixed(1))/2000).toFixed(1) + ' US ton'
      }
      else{
        return (wgt/453.59237).toFixed(1) + ' lbs'
      }
        
    }else if (unit == 3){
      return (wgt/28.3495).toFixed(2) + ' oz'
    }
    if(wgt > 10000){
      return (wgt/1000).toFixed(3) + ' kg'
    }
    return wgt.toFixed(1) + ' g'
}
function formatWeight(wgt, unit){
   if(typeof wgt == 'undefined'){
    wgt = 0;
   }
    if(unit == 1){
      return (wgt/1000).toFixed(3) + ' kg'
    }else if(unit == 2){
      return (wgt/453.59237).toFixed(1) + ' lbs'
    }else if (unit == 3){
      return (wgt/28.3495).toFixed(2) + ' oz'
    }
    return wgt.toFixed(1) + ' g'
    
}
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= (32 - nbit);
    uint >>= 32 - nbit;
    return uint;
}
function getVal(arr, rec, key, pVdef){
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

    	return	 eval(funcJSON['@func'][p['@type']])(sa)
    //  return eval(funcJSON['@func'][p['@type']].apply(this, sa))
    }else{
      var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str; 
    }
}
function isDiff(x, y){
    if((typeof x) != (typeof y)){
      //console.log('type mismatch')
      return true;
    }
    for(var p in x){
      if(typeof y[p] != 'undefined'){
        if(!(x[p] == y[p])){
          return true
        }
      }else{
        return true
      }
    }
    return false;
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
         }else if (byte_data instanceof Buffer) {
          for(var i=0; i<byte_data.length; i++) {
              bytes.push(byte_data.readUInt8(i));
          }
         }
        rpc[0] = n_func;
        rpc[1] = n_args;
        if (bytes.length > 0) rpc[1] += 4;
        var j=2;
        for(var i=0; i<n_args; i++) {
        	var i16arg = i16_args[i] 
        	if(i16arg > 0xffff){
        		i16arg = 0xffff
        	}
          rpc[j] = i16arg & 0xff; j+= 1;
          rpc[j] = (i16arg >> 8) & 0xff; j+= 1;
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
function getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, passAcc){
	var params = []
	cat.params.forEach(function(par) {
    var pAcc = 0;

    if(typeof par.passAcc != 'undefined'){
      if(isNaN(par.passAcc)){
        pAcc = sysRec[par.passAcc]
        // console.log("sysRec[par.passAcc]", pAcc)
      }else{
        pAcc = par.passAcc;
        // console.log("par.passAcc", pAcc)
      }
    }

    pAcc = Math.max(passAcc, pAcc);
    // console.log("pAcc", pAcc )
    //console.log("par", par)
		if(par.type == 0){

			var p = par.val
				var _p = null
   			if(typeof pVdef[0][p] != 'undefined'){
   				 var data = sysRec[p]
          if(pVdef[0][p]['@labels'] == "FaultMaskBit"){
            if(sysRec[p.slice(0,-4) + "Warn"]){
              data = data + sysRec[p.slice(0,-4) + "Warn"];
            }
            
          }
          _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
   			}else if(typeof pVdef[1][p] != 'undefined'){

   				  var data = prodRec[p]
          if(pVdef[1][p]['@labels'] == "FaultMaskOverride"){
            if(prodRec[p.slice(0,-12) + "Override"] == 0){
              data = 0
            }else if(prodRec[p.slice(0,-12) + "WarnOverride"] == 1){
              data = 3
            }else{
              data = data + 1;
            }
            
          }
          _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
    		
    		}else if(typeof pVdef[2][p] != 'undefined'){
           if(par.dt){
            _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc, dt:true, passAcc:pAcc}
          }else{
            _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc, passAcc:pAcc}
          }
    			//_p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc, passAcc:pAcc}
    		}else if(typeof pVdef[3][p] != 'undefined'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc, passAcc:pAcc}
    		}else if(par.val == 'Nif_ip'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc, passAcc:pAcc}
    		}else if(par.val == 'Nif_nm'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc, passAcc:pAcc}
    		}else if(par.val == 'Nif_gw'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc, passAcc:pAcc}
    		}else if(par.val == 'Nif_mac'){
          _p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc, passAcc:pAcc}
        }


    		if(_p != null){

    	
    		_vmap[p].children.forEach(function (ch) {
    			var _ch;
    			if(typeof pVdef[0][ch] != 'undefined'){
    			_ch = sysRec[ch]
    			}else if(typeof pVdef[1][ch] != 'undefined'){
    			_ch = prodRec[ch]
    			}else if(typeof pVdef[2][ch] != 'undefined'){
    			
    				_ch = dynRec[ch]
    			}else if(typeof pVdef[3][ch] != 'undefined'){
    			
    				_ch = fram[ch]
    			}else if(ch == 'DCRate_B'){
    				_ch = prodRec[ch]
    			}
    			_p['@children'].push(_ch)	
    		})
    			params.push(_p)
    		}else if(_vmap[p]['@interceptor']){
        
            var pname = p.slice(0,-4)
        //    //console.log(pname, p, 342)
              if(typeof pVdef[0][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@data':sysRec[pname], '@children':[], acc:par.acc, passAcc:pAcc}
              }else if(typeof pVdef[1][pname] != 'undefined'){

                var data = prodRec[pname]
                
                _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
              }else if(typeof pVdef[2][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[pname], '@children':[], acc:par.acc, passAcc:pAcc}
              }else if(typeof pVdef[3][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'fram','@data':fram[pname], '@children':[], acc:par.acc, passAcc:pAcc}
              }else if(par.val == 'DCRate'){
                _p = {'type':0, '@name':p,'@data':prodRec[pname], '@children':[], acc:par.ac, passAcc:pAcc}
              }
              if(_p!= null){
                params.push(_p);
              }
        }else if(_vmap[p]['@test']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
            
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }
            if(_p != null){
              var ch = _vmap[p].children[1];

              var _ch;
              if(typeof pVdef[0][ch] != 'undefined'){
              _ch = sysRec[ch]
              }else if(typeof pVdef[1][ch] != 'undefined'){
              _ch = prodRec[ch]
              }else if(typeof pVdef[2][ch] != 'undefined'){
              
                _ch = dynRec[ch]
              }else if(typeof pVdef[3][ch] != 'undefined'){
              
                _ch = fram[ch]
              }else if(ch == 'DCRate_B'){
                _ch = prodRec[ch]
              }
              _p['@children'].push(_ch)
              _p['@test'] = true; 
              params.push(_p)
            }
                
        }else if(_vmap[p]['@input']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
          
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }
            if(_p != null){
              var ch = _vmap[p].children[1];

              var _ch;
              if(typeof pVdef[0][ch] != 'undefined'){
              _ch = sysRec[ch]
              }else if(typeof pVdef[1][ch] != 'undefined'){
              _ch = prodRec[ch]
              }else if(typeof pVdef[2][ch] != 'undefined'){
              
                _ch = dynRec[ch]
              }else if(typeof pVdef[3][ch] != 'undefined'){
              
                _ch = fram[ch]
              }else if(ch == 'DCRate_B'){
                _ch = prodRec[ch]
              }
              _p['@children'].push(_ch)
              _p['@input'] = true; 
              params.push(_p)
             // //console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@combo']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc, passAcc:pAcc}
              
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc, passAcc:pAcc}
            }
            if(_p != null){
              var ch = _vmap[p].children[1];
              var _ch;
              if(typeof pVdef[0][ch] != 'undefined'){
              _ch = sysRec[ch]
              }else if(typeof pVdef[1][ch] != 'undefined'){
              _ch = prodRec[ch]
              }else if(typeof pVdef[2][ch] != 'undefined'){
              
                _ch = dynRec[ch]
              }else if(typeof pVdef[3][ch] != 'undefined'){
              
                _ch = fram[ch]
              }
              _p['@children'].push(_ch)
              _p['@combo'] = true; 
              params.push(_p)
             // //console.log(335,_p)
            }
                 ///
        }
    		
    	}else if(par.type == 1){
    		if(typeof par.child != 'undefined'){
    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, pAcc), acc:par.acc, child:par.child, passAcc:pAcc})
    		}else{

          if(par.packGraph){
            //console.log('packGraph')
            params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, pAcc), acc:par.acc, packGraph:par.packGraph, passAcc:pAcc})
          }else{
                params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, pAcc), acc:par.acc, passAcc:pAcc})

          }
    	   }
    	}else if(par.type == 2){
    			if(typeof par.child != 'undefined'){
    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, pAcc), acc:par.acc, child:par.child, passAcc:pAcc})
    		}else{


    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, pAcc), acc:par.acc, passAcc:pAcc})
    		}
    	}else if(par.type == 3){
    		params.push({type:3, '@name':'Accounts', '@data':'get_accounts', acc:0, passAcc:pAcc})
    	}else if(par.type == 4){
         if(par.val == 'Reboot'){
          params.push({type:4, '@name':'Reboot','@data':'reboot_display',acc:0, passAcc:pAcc})
        }else if(par.val == 'FormatUSB'){
             params.push({type:4, '@name':'FormatUSB','@data':'format_usb',acc:0, passAcc:pAcc})
          
        }else if(par.val == 'Update'){
             params.push({type:4, '@name':'Update','@data':'update',acc:0, passAcc:pAcc})
          
        }
      }else if(par.type == 5){
        params.push({type:5, '@name':'Unused','@data':'get_unused',acc:0, passAcc:pAcc})
      }
    					
    })
	return params
}
function iterateCats2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, passAcc){
	cat.params = getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, passAcc)	
	return cat
}
function tickFormatter(t,i) {
  var text = t.split(' ').map(function(v,j){
    return <tspan x="0" dy={j+'em'}>{v}</tspan>
  })
  return (<text x="0"  transform='translate(-5,-5)' style={{textAnchor:"end", fontSize:14}}>
    {text}
  </text>);
}
function getFixed(val, d){
  if(isNaN(val) || val == null){
    return ''
  }else{
    return val.toFixed(d)
  }
}
function getLabTrans(name, language){
  var str = name;
  if(labTransV2[name]){
    str = labTransV2[name][language]['name']
  }
  return str
}

/*************Helper functions end**************/

/*******************Initialize Page start********************/
var _wsurl1 = 'ws://' +location.host
const urlParams = new URLSearchParams(location.search)
const ip2 = urlParams.get('lane2')
var external = urlParams.get('ext')
console.log('External: '+external)
if (ip2){
  var _wsurl2 = 'ws://'+ip2
  var socket2 = new FtiSockIo(_wsurl2,true);
  socket2.on('vdef', function(vdf){
    console.log('on vdef')
    var json = vdf[0];
    _Vdef = json
    var res = [];
      res[0] = {};
      res[1] = {};
      res[2] = {};
      res[3] = {};
      res[4] = {};
      res[5] = {}
      res[9] = {};
      res[10] = {};
      res[11] = {};
      res[12] = {};
      var nVdf = [[],[],[],[],[],[],[],[],[]];
      json["@params"].forEach(function(p ){
        var rec = p['@rec']
        if(p['@rec'] > 5){
          rec = rec + 4
        }
        res[rec][p["@name"]] = p;
        res[9][p["@name"]] = p;
        nVdf[p["@rec"]].push(p['@name'])
      }
      );

       var bob = {}
       var rob = {}
       var dob = {}
        dob['@name'] = '@dispversion'
      dob['@rpcs'] = {'dispversion':[0]}
       rob['@name'] = '@customstrn'
      rob['@labels'] = 'usecustom'
      rob['@rpcs'] = {'customstrn':[0]}
      bob['@name'] = '@branding'
      bob['@labels'] = 'theme'
      bob['@rpcs'] = {'theme':[0]}
      res[0]['@branding'] =  bob
      res[9]['@branding'] =  bob
      res[0]['@customstrn'] =  rob
      res[0]['@dispversion'] = dob
      res[9]['@customstrn'] =  rob
      res[6] = json["@deps"];
      res[7] = json["@labels"]
      res[7]['theme'] = {'english':['SPARC','FORTRESS']}
      res[7]['usecustom'] =  {'english':['disabled','enabled']}
      res[8] = [];
      res[9] = [];
     for(var par in res[2]){  
        if(par.indexOf('Fault') != -1){
          res[8].push(par)
        }
      }
      for(var par in res[2]){  
        if(par.indexOf('Warn') != -1){
          res[9].push(par)
        }
      }

      _pVdef = res;
      if(json['@defines']['LOGICAL_OUTPUT_NAMES']){
        outputSrcArr = json['@defines']['LOGICAL_OUTPUT_NAMES'].slice(0)
        inputSrcArr = json['@defines']['PHYSICAL_INPUT_NAMES'].slice(0)
      }
      vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@pages"]['CWSys']], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]
  })
}
var socket1 = new FtiSockIo(_wsurl1,true);
console.log(socket1)
if (!external){
  console.log('Internal Connection')
  var socket3 = new FtiSockIo('ws://192.168.50.52:3300',true)
}
socket1.on('vdef', function(vdf){
  console.log('on vdef')
  var json = vdf[0];
  _Vdef = json
  var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
    res[4] = {};
    res[5] = {}
    res[9] = {};
    res[10] = {};
    res[11] = {};
    res[12] = {};
    var nVdf = [[],[],[],[],[],[],[],[],[]];
    json["@params"].forEach(function(p ){
      var rec = p['@rec']
      if(p['@rec'] > 5){
        rec = rec + 4
      }
      res[rec][p["@name"]] = p;
      res[9][p["@name"]] = p;
      nVdf[p["@rec"]].push(p['@name'])
    }
    );

     var bob = {}
     var rob = {}
     var dob = {}
      dob['@name'] = '@dispversion'
    dob['@rpcs'] = {'dispversion':[0]}
     rob['@name'] = '@customstrn'
    rob['@labels'] = 'usecustom'
    rob['@rpcs'] = {'customstrn':[0]}
    bob['@name'] = '@branding'
    bob['@labels'] = 'theme'
    bob['@rpcs'] = {'theme':[0]}
    res[0]['@branding'] =  bob
    res[9]['@branding'] =  bob
    res[0]['@customstrn'] =  rob
    res[0]['@dispversion'] = dob
    res[9]['@customstrn'] =  rob
    res[6] = json["@deps"];
    res[7] = json["@labels"]
    res[7]['theme'] = {'english':['SPARC','FORTRESS']}
    res[7]['usecustom'] =  {'english':['disabled','enabled']}
    res[8] = [];
    res[9] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        res[8].push(par)
      }
    }
    for(var par in res[2]){  
      if(par.indexOf('Warn') != -1){
        res[9].push(par)
      }
    }

    _pVdef = res;
    if(json['@defines']['LOGICAL_OUTPUT_NAMES']){
      outputSrcArr = json['@defines']['LOGICAL_OUTPUT_NAMES'].slice(0)
      inputSrcArr = json['@defines']['PHYSICAL_INPUT_NAMES'].slice(0)
    }
    vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@pages"]['CWSys']], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]
})

/*******************Initialize Page end********************/

/******************Main Components start********************/
class Container extends React.Component {
	constructor(props){
		super(props)
    this.state = {page:this.props.page,update:false,updateLane1:false,updateLane2:false}
    this.gotoLane1 = this.gotoLane1.bind(this)
    this.gotoLane2 = this.gotoLane2.bind(this)
    this.gotoDual = this.gotoDual.bind(this)
    this.updateDual = this.updateDual.bind(this)
    this.lane1 = React.createRef()
    this.lane2 = React.createRef()
	}
  componentDidMount(){
    var self = this
    setTimeout(function(){
      self.setState({update:true})
    },50)
  }

  shouldComponentUpdate(){
    var page = this.props.page
    if (page == 'dual'){
      return true
    }
    return false
  }

  gotoLane1(){
    if (!external){
      socket3.emit('setIp', location.host)
    }
    this.setState({page:'cw1'})

  }
  gotoLane2(){
    if (!external){
      socket3.emit('setIp', ip2)
    }
    this.setState({page:'cw2'})
  }
  gotoDual(){
    var self = this;
    this.setState({page:'dual'})

  }
  updateDual(lane){
    if (lane==1){
      if (this.state.updateLane1){
        this.setState({updateLane1:false})
      }else{
        this.setState({updateLane1:true})
      }
    }else if (lane==2){
      if (this.state.updateLane2){
        this.setState({updateLane2:false})
      }else{
        this.setState({updateLane2:true})
      }
    }
  }
	render(){
    if (this.state.page === 'single'){
    return <div>
    <ErrorBoundary autoReload={false}>
        <LandingPage ref={this.lane1} soc={socket1}/>

        <ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
      
      pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
      </ErrorBoundary>
    </div>
    }else{
      var dualPage
      if (this.lane1 && this.lane1.current && this.lane2 && this.lane2.current){
        dualPage = <div className='interceptorMainPageUI' style={{background:FORTRESSPURPLE1, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+FORTRESSPURPLE1}}>
                <table class="center">
                <tbody>
                <tr style={{marginLeft:10,textAlign:'center'}}>
                <td>
                <div onClick={this.gotoLane1} style={{borderBottomRightRadius:15, height:700, width:20,fontSize:20, color:'white', lineHeight:'10px', writingMode:'vertical-rl',textOrientation:'upright',textAlign: 'center'}}><b>LANE ONE</b></div>
                </td>
                <td>
                <div onClick={this.gotoLane1}><DualPage lane={this.lane1} update={this.state.updateLane1} page={this.state.page}/></div>
                </td>
                <td>
                <div onClick={this.gotoLane2} style={{borderBottomRightRadius:15, height:700, width:20,fontSize:20, color:'white', lineHeight:'10px', writingMode:'vertical-rl',textOrientation:'upright',textAlign: 'center'}}><b>LANE TWO</b></div>
                </td>
                <td>
                <div onClick={this.gotoLane2}><DualPage lane={this.lane2} update={this.state.updateLane2} page={this.state.page}/></div>
                </td>
                </tr>
                </tbody>
                </table>
                </div>

      }
    return <div>
    <ErrorBoundary autoReload={false}>
      <div style={{ display: (this.state.page === 'cw1') ? null : 'none' }}>
        <LandingPage ref={this.lane1} soc={socket1} toDual={this.gotoDual} lane={1} update={this.updateDual} page={this.state.page}/>
      </div>
      <div style={{ display: (this.state.page === 'cw2') ? null : 'none' }}>
        <LandingPage ref={this.lane2} soc={socket2} toDual={this.gotoDual} lane={2} update={this.updateDual} page={this.state.page}/>
      </div>
      <div style={{ display: (this.state.page === 'dual') ? null : 'none' }}>
        {dualPage}
      </div>

        <ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
      
      pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
      </ErrorBoundary>
    </div>
    }
	}
}

class LandingPage extends React.Component{
  constructor(props){
    super(props)

    this.state = {plannedBatches:[],buckMin:0,batchList:[], buckMax:100, prclosereq:false,histo:true,connectedClients:0,calibState:0,cwgt:0,waitCwgt:false,timezones:[],faultArray:[],language:'english',warningArray:[],ioBITs:{},
      live:false,timer:null,username:'No User',userid:0,user:-1,loginOpen:false, level:0,currentView:'',data:[],unusedList:{},cob:{},pcob:{},pList:[],prodListRaw:{},prodNames:[],updateCount:0,connected:false,start:true,pause:false,x:null,
      branding:'FORTRESS',customMap:true,vMap:vdefMapV2,custMap:vdefMapV2, automode:0,currentPage:'landing',netpolls:{}, curIndex:0, progress:'',srec:{},prec:{},rec:{},crec:{},fram:{},prodList:{},
      curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'', version:'2018/07/30',pmsg:'',pON:false,percent:0, init:false,
      detL:{}, macList:[], tmpMB:{name:'NEW', type:'single', banks:[]}, accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''], nifip:'', nifnm:'',nifgw:'',scpFileSize:0, scpStatus:false,
      checkPrecInterval:null,liveWeight:0.0, packSamples:{}}
    this.exportVmap = this.exportVmap.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.changeBranding = this.changeBranding.bind(this);
    this.loadPrefs = this.loadPrefs.bind(this)
    this.renderModal = this.renderModal.bind(this);
    this.showDisplaySettings = this.showDisplaySettings.bind(this);
    this.connectToUnit = this.connectToUnit.bind(this);
    this.tareWeight = this.tareWeight.bind(this);
    this.calWeight = this.calWeight.bind(this);
    this.onRMsg = this.onRMsg.bind(this);
    this.pModalToggle = this.pModalToggle.bind(this);
    this.sendPacket = this.sendPacket.bind(this);
    this.calWeightSend = this.calWeightSend.bind(this);
    this.calWeightCancelSend = this.calWeightCancelSend.bind(this);
    this.getCob = this.getCob.bind(this);
    this.getUCob = this.getUCob.bind(this);
    this.settingClick = this.settingClick.bind(this);
    this.changeView = this.changeView.bind(this);
    this.toggleLogin = this.toggleLogin.bind(this);
    this.login = this.login.bind(this);
    this.loginClosed = this.loginClosed.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.setAuthAccount = this.setAuthAccount.bind(this);
    this.logout = this.logout.bind(this);
    this.clearFaults = this.clearFaults.bind(this);
    this.clearWarnings = this.clearWarnings.bind(this);
    this.saveProductPassThrough = this.saveProductPassThrough.bind(this);
    this.onPmdClose = this.onPmdClose.bind(this);
    this.checkweight = this.checkweight.bind(this);
    this.checkWeightSend = this.checkWeightSend
    this.setTheme = this.setTheme.bind(this);
    this.openBatch = this.openBatch.bind(this);
    this.closeCWModal = this.closeCWModal.bind(this);
    this.setTrans = this.setTrans.bind(this);
    this.transChange = this.transChange.bind(this);
    this.labChange = this.labChange.bind(this);
    this.listChange = this.listChange.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.toggleGraph = this.toggleGraph.bind(this);
    this.getBuffer = this.getBuffer.bind(this);
    this.getRefBuffer = this.getRefBuffer.bind(this);
    this.testWebView = this.testWebView.bind(this);
    this.pause = this.pause.bind(this);
    this.getBatchList = this.getBatchList.bind(this);
    this.imgClick = this.imgClick.bind(this);
    this.openUnused = this.openUnused.bind(this);
    this.passThrough = this.passThrough.bind(this);
    this.stopConfirmed = this.stopConfirmed.bind(this);
    this.resume = this.resume.bind(this);
    this.getProdList = this.getProdList.bind(this);
    this.startBuf = this.startBuf.bind(this);
    this.getData = this.getData.bind(this);
    this.formatUSB = this.formatUSB.bind(this);
    this.notify = this.notify.bind(this)
    this.goDual = this.goDual.bind(this)
    this.lgctl = React.createRef();
    this.tBut = React.createRef();
    this.cwModal = React.createRef();
    this.chBut = React.createRef();
    this.fclck = React.createRef();
    this.ss = React.createRef();
    this.sd = React.createRef();
    this.lg = React.createRef();
    this.btc = React.createRef();
    this.se = React.createRef();
    this.ste = React.createRef();
    this.hh = React.createRef();
    this.tb = React.createRef();
    this.bhg = React.createRef();
    this.pmodal = React.createRef();
    this.settingModal = React.createRef();
    this.locateModal = React.createRef();
    this.batModal = React.createRef();
    this.pmd = React.createRef();
    this.cwc = React.createRef();
    this.inputMod = React.createRef();
    this.imgMD = React.createRef();
    this.unusedModal = React.createRef();
    this.stopConfirm = React.createRef();
    this.am = React.createRef();
    this.resetPass = React.createRef();
    this.msgm = React.createRef();
    this.lgoModal = React.createRef();
    this.lockModal = React.createRef();
    this.planStart = React.createRef();
    this.manStart = React.createRef();
    this.prgmd = React.createRef();
//    if (ip2){
      this.ssDual = React.createRef();
      this.lgDual = React.createRef();
      this.seDual = React.createRef();
      this.steDual = React.createRef();
      this.hhDual = React.createRef();
//    }
    this.prodSet = React.createRef();
  }

  /*************Lifecycle functions start***************/
  /* Most of the serverside communication will be handled here*/
  componentDidMount(){
    console.log('Component Landing page did mount')
    var self = this;
    this.state.timer = setInterval(function(){
      if(self.state.connected){
        if((Date.now() - liveTimer[self.state.curDet.mac]) > 1500){
          self.setState({live:false, noupdate:false})
        }
      }
    }, 1500)
    ifvisible.setIdleDuration(300);
    ifvisible.on("idle", function(){
      self.logout()
    });
    setTimeout(function (argument) {
      self.loadPrefs();
    }, 100)
//    let socket = this.props.soc;
//    setTimeout(function (argument) {
//      if (JSON.stringify(self.state.prec) === '{}'){
//        console.log('Product Records not loaded')
//        self.loadPrefs();
//      }
//    }, 100)   
   // socket.on('testusb')
    this.props.soc.on('userNames', function(p){
       self.setState({usernames:p.det.data.array})
      
    })
    this.props.soc.on('batchJson',function (json) {
      // body...
      // console.log('batchJson',json.replace(/\s/g, '').replace(/\0/g, ''))
      self.setState({plannedBatches:JSON.parse(json.replace(/\s/g, '').replace(/\0/g, ''))})
    })
    this.props.soc.on('confirmProdImport', function (c) {
      // body...
      if(typeof self.state.fram['InternalIP'] != 'undefined'){
          if((window.location.host === self.state.fram['InternalIP'])||(window.location.host === '192.168.50.50')||(window.location.host === '192.168.50.51')){
            self.sendPacket('importRestore')
            setTimeout(function () {
              // body...
              self.sendPacket('getProdList')
              self.notify('Successfully Imported Settings')
            },2000)      
          }
      }     
    })
    /*****  Update Related Stuff ****/
    this.props.soc.on('confirmUpdate', function(c){
      if(typeof self.state.fram['InternalIP'] != 'undefined'){
        if ((window.location.host === self.state.fram['InternalIP'])||(window.location.host === '192.168.50.50')||(window.location.host === '192.168.50.51')){
          self.prgmd.current.show('Files copied.. Checking display update')
          self.props.soc.emit('updateDisplay')
        }
      }
    })
    this.props.soc.on('confirmDisplayUpdate', function (argument) {
      self.setState({scpStatus:false})
      if(typeof self.state.fram['InternalIP'] != 'undefined'){
        if ((window.location.host === self.state.fram['InternalIP'])||(window.location.host === '192.168.50.50')||(window.location.host === '192.168.50.51')){
          self.prgmd.current.show('Updating Checkweigher')
          self.sendPacket('updateSystem')
        }
      }
    })
    this.props.soc.on('scpFileSize',function (argument) {
      // body...
      // console.log('scpFileSize', argument)
      self.setState({scpFileSize:argument.size, scpStatus:true})

      setTimeout(function () {
        // body...
        self.props.soc.emit('pollFileSize', argument.filename)
      },2000)

    })
    this.props.soc.on('fileSize', function (arg) {
      // body...
        // console.log('fileSize', arg)
        self.prgmd.current.show(arg.filename + ' '+(arg.size*100/self.state.scpFileSize).toFixed(0) + '% transferred')
          
      if(self.state.scpStatus){
          setTimeout(function () {
            // body...
            self.props.soc.emit('pollFileSize', arg.filename)
          }, 1000)
      }
    })
    this.props.soc.on('prgNotify', function (str) {
      // body...
      self.prgmd.current.show(str)
    })

    this.props.soc.on('connectedClients',function (c) {
      var fram = self.state.fram
      fram.ConnectedClients = c
      self.setState({connectedClients:c,fram:fram, noupdate:false})
    })
    this.props.soc.on('custJSON',function (json) {
      if(self.state.customMap){
        vMapV2 = json['@vMap']
        vMapLists = json['@lists']
        catMapV2 = json['@catmap']
        labTransV2 = json['@labels']
        self.setState({custMap:json,vMap:json, noupdate:false})
      }else{
          self.setState({custMap:json, noupdate:false})
      }
      
    })
    this.props.soc.on('resetConfirm', function (r) {
      //socket.emit('locateReq',true);
    })
    this.props.soc.on('nif', function(iface){
      self.setState({nifip:iface.address, nifnm:iface.netmask})
    })
    this.props.soc.on('version',function (version) {
      self.setState({version:version})
    })
    this.props.soc.on('gw', function(gw){
      self.setState({nifgw:gw})
    })
    this.props.soc.on('displayUpdate', function(){
    //  self.refs.updateModal.toggle();
    })
    this.props.soc.on('updateProgress',function(r){
      self.setState({progress:r})
    })
    this.props.soc.on('onReset', function(r){
      self.setState({currentPage:'landing', curDet:''});
    })
  
    this.props.soc.on('netpoll', function(m){
      self.onNetpoll(m.data, m.det)
      m = null;
    })
    this.props.soc.on('prefs', function(f) {
      var detL = self.state.detL
      var cnt = 0;
      var _ip = ''
      f.forEach(function (u) {
        u.banks.forEach(function(b){
          detL[b.mac] = null
          cnt++;
          _ip = b.ip
        })
      })
      if(cnt == 1){
        self.props.soc.emit('locateUnicast', _ip, true)
      }else{
        self.props.soc.emit('locateReq',true)
      }
      setTimeout(function (argument) {
      // body...
      if(f.length == 1){
        console.log(2048)
        if(!self.state.connected){
          console.log(2050)
          if(f[0].banks.length == 1){
            if(vdefByMac[f[0].banks[0].mac]){
               self.connectToUnit(f[0].banks[0])
            }else{
              setTimeout(function () {
                if(!self.state.connected){
                  if(vdefByMac[f[0].banks[0].mac]){
                    self.connectToUnit(f[0].banks[0])
                  }else{
                    console.log('no vdef', vdefByMac)
                  }
                }
              },4000)
            }
          }
          
        } 
      }
    },800)

      self.setState({mbunits:f, detL:detL})
    })
    this.props.soc.on('notify',function(msg){
      self.notify(msg)
    })
    this.props.soc.on('progressNotify',function(pk){
      var on = pk.on;
      var msg = pk.msg;
      var percentage = pk.percentage
    })
    this.props.soc.on('noVdef', function(det){
      setTimeout(function(){
        self.props.soc.emit('vdefReq', det);
      }, 1000)
    })
    this.props.soc.on('notvisible', function(e){
      toast('Detectors located, but network does not match')
    })
    this.props.soc.on('prodNames',function (pack) {
      // body...
      // console.log('prodNames')
      if(self.state.curDet.ip == pack.ip){
        self.setState({pList:pack.list, prodNames:pack.names, noupdate:false})
      }
    })
    this.props.soc.on('locatedResp', function (e) {
      // console.log(e,924)
      try{
        if(typeof e[0] != 'undefined'){
          var dets = self.state.detL;
          var macs = self.state.macList.slice(0);
          
          
          var detectors = [];
          e.forEach(function(d){
          
            macs.push(d.mac)
            dets[d.mac] = d;
            if(macs.indexOf(d.mac) == -1){
              macs.push(d.mac)
              dets[d.mac] = d
            }          
            self.props.soc.emit('vdefReq', d);
          })
          var mbunits = self.state.mbunits;
          var cnt = 0;
          var curbnk 
          mbunits.forEach(function(u){
            var banks = u.banks.map(function(b){
              cnt++;
              if(dets[b.mac]){
                var _bank = dets[b.mac]
                _bank.interceptor = false;
                curbnk = _bank
                return _bank
              }else{
                return b
              }
            })
            u.banks = banks;
          })
          var curDet = self.state.curDet;

          if(self.state.currentPage != 'landing'){
            if(dets[curDet.mac]){
              curDet = dets[curDet.mac];
            }
            else{
            }
      }
  
      var nfip = self.state.nifip;
      if(e.length > 1){
        nfip = e[0].nif_ip
      }
      self.setState({dets:e, detL:dets, mbunits:mbunits,curDet:curDet, macList:macs, nifip:nfip})
    }
      }catch(er){
      }
      self.props.soc.emit('getTimezones')
    });
    this.props.soc.on('dispSettings', function(disp){
        self.setState({automode:disp.mode})
      })  
    
    this.props.soc.on('paramMsgCW', function(data) {
      self.onParamMsg(data.data, data.det)
      data = null;
    })
    this.props.soc.on('rpcMsg', function (data) {
      self.onRMsg(data.data, data.det)
      data = null;
    })
    this.props.soc.on('loggedIn', function(data){
      self.setState({curUser:data.id, level:data.level})
    })

    this.props.soc.on('logOut', function(){
      self.setState({curUser:'', level:0})
    })
    this.props.soc.on('accounts', function(data){
      self.setState({accounts:data.data})
    })


    this.props.soc.on('authResp', function(pack){
      if(pack.reset){
         self.resetPass.current.show(pack)
        self.setAuthAccount(pack)
      }else{
        self.setAuthAccount(pack)
  
      }
    })
    this.props.soc.on('authFail', function(pack){
      self.am.current.show(pack.user, pack.ip)
      self.setAuthAccount({user:'Not Logged In', level:0, user:-1})
    })
    this.props.soc.on('passwordNotify',function(e){
      // console.log(1117,e)
      var message = 'Call Fortress with ' + e.join(', ');
      self.msgm.current.show(message)
    })
    this.props.soc.on('timezones',function (e) {
      // body...
      self.setState({timezones:e})
    })
    this.props.soc.on('batchList', function (list) {
      self.setState({batchList:list.reverse()})
    })
  }
  shouldComponentUpdate(nextProps, nextState){
    //by specifying noupdate in setState, we can hold off on render
    if((true ==  nextState.noupdate)||(nextProps.page == 'dual')){
      return false;
    }else if(nextProps.page == 'cw1'){
      if (nextProps.lane == 1){
        return true;
      }else{
        return false;
      }
    }else if(nextProps.page == 'cw2'){
      if (nextProps.lane == 2){
        return true;
      }else{
        return false;
      }
    }
    return true;
  }
  /*************Lifecycle functions end  ***************/

  /****** Login Functions start******/
  toggleLogin(){
    var self = this;
    if(this.state.user == -1){
      this.lgctl.current.login();
      this.setState({loginOpen:true})
    }else{
      setTimeout(function (argument) {
        // body...
         self.lgoModal.current.show(self.logout, 0, "You will be logged out")
      },100)
     
    }
  }
  logout(){
    if(this.state.level != 0){

     // toast("Logged out")
      var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_RPC_USERLOGOUT']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      this.setState({level:0, userid:0,user:-1, username:'Not Logged In',noupdate:false})

    }
  }
  login(v){
    this.setState({level:v,noupdate:false})
  }
  setAuthAccount(pack){
    var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_RPC_USERLOGIN']
    var pkt = rpc[1].map(function (r) {
      if(!isNaN(r)){
        return r
      }else{
        return pack.user
      }
    });
    var packet = dsp_rpc_paylod_for(rpc[0],pkt);
    this.props.soc.emit('rpc', {ip:this.props.ip, data:packet})
    // console.log(pack,668)
    this.setState({level:pack.level, username:pack.username,noupdate:false, update:true, userid:pack.user+1, user:pack.user}) 
  }
  authenticate(user,pswd){
    // console.log('authenticate here')
    this.props.soc.emit('authenticate',{user:parseInt(user) - 1,pswd:pswd, ip:this.state.curDet.ip})
  }
  loginClosed(){
    this.setState({loginOpen:false});
  }
  resetPassword(pack,v){
    var packet = {ip:pack.ip, data:{user:pack.user, password:v}}
    //console.log('packet',packet)
    this.props.soc.emit('writePass', packet)
  }
  /****** Login Functions end******/

  changeView (d) {
    this.setState({currentView:d[0], data:d[1]})
  }
  settingClick (s,n) {
    if((Array.isArray(s))&&(s[0] == 'get_accounts')){
      console.log('get accounts')
    }else if((Array.isArray(s))&&(s[0] == 'reboot_display')){

    }else if((Array.isArray(s))&&(s[0] == 'format_usb')){

    }else{
      var set = this.state.data.slice(0)
      if(Array.isArray(s)){
        set.push(s)
      }else{
        set.push(s)
        set.push(n)
      }
      var self = this;
      setTimeout(function () {
        self.changeView(['SettingsDisplay',set]);
      },100)
    }
  }

  loadPrefs() {
    if(this.props.soc.sock.readyState  ==1){
      this.props.soc.emit('getVersion',true);
      this.props.soc.emit('getPrefsCW',true);
      this.props.soc.emit('getDispSettings');
      this.props.soc.emit('getCustomJSON',JSON.stringify(vdefMapV2))
    }
  }
  getCob (sys,prod,dyn, fram) {
    var vdef = vdefByMac[this.state.curDet.mac]
    var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
    var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram,0)
    vdef = null;
    _cvdf = null;
    return cob
  }
  getPCob (sys,prod,dyn, fram) {
    var vdef = vdefByMac[this.state.curDet.mac]
    var _cvdf = JSON.parse(JSON.stringify(vdef[6]['CWProd']))
    var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram,sys['PassAccAdvProdEdit'])
    vdef = null;
    _cvdf = null;
    return cob
  }
  getUCob (sys,prod,dyn, fram) {
    // console.log('getUCob')
    var vdef = vdefByMac[this.state.curDet.mac]
    var _cvdf = JSON.parse(JSON.stringify(vdef[6]['Unused']))
    // console.log(_cvdf)
    var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
    vdef = null;
    _cvdf = null;
    return cob
  }
  notify(msg){
      if(this.batModal.current.state.show){
        this.batModal.current.showMsg(msg)
      }else if(this.pmodal.current.state.show){
        this.pmodal.current.showMsg(msg)
      }else if(this.settingModal.current.state.show){
        this.settingModal.current.showMsg(msg)
      }else if(this.cwModal.current.state.show){
        this.cwModal.current.showMsg(msg)
      }else{
        this.msgm.current.show(msg)
      

      }
  }
  /******************Parse Packets start*******************/
  onParamMsg(e,u){
     if(this.state.curDet.ip == u.ip){
      var self = this;
      liveTimer[this.state.curDet.mac] = Date.now()
      if(typeof e != 'undefined'){
        var pVdef = vdefByMac[this.state.curDet.mac][1]
        var vdf = vdefByMac[this.state.curDet.mac][0]
        if(e.type == 0){
          SingletonDataStore.sysRec = e.rec;
          var language = vdf['@labels']['Language']['english'][e.rec['Language']];
          if(language == 'russian' || language == 'polish' || language == 'chinese'){
            //language = 'korean'
          }
          if(e.rec['RemoteDisplayLock'] == 1){
            if(typeof this.state.fram['InternalIP'] != 'undefined'){
              if(window.location.host != this.state.fram['InternalIP']){
                this.lockModal.current.show('This display has been locked for remote use. Please contact system adminstrator.')
              }
            }
            
          }
          if(this.state.branding == 'SPARC'){
            e.rec['@branding'] = 0;
          }else{
            e.rec['@branding'] = 1;
          }
          e.rec['@dispversion'] = DISPLAYVERSION;
          if(this.state.customMap){
            e.rec['@customstrn'] = 1;
          }else{
            e.rec['@customstrn'] = 0;
          }
          var lcms = new Uint64LE(e.rec['LastCalTime'].data)
          e.rec['LastCalTime'] = lcms
           e.rec['LastCalTimeStr'] = new Date(parseInt(lcms.toString())).toISOString().split('T')[0]
          if(e.rec['AutoLogoutMinutes'] != this.state.srec['AutoLogoutMinutes']){
            ifvisible.setIdleDuration(e.rec['AutoLogoutMinutes']*60)
          }
          this.setState({noupdate:false,srec:e.rec,language:language, cob:this.getCob(e.rec, this.state.prec, this.state.rec,this.state.fram), unusedList:this.getUCob(e.rec, this.state.prec, this.state.rec,this.state.fram), pcob:this.getPCob(e.rec, this.state.prec, this.state.rec,this.state.fram)})
          if (this.props.lane){
            this.props.update(this.props.lane)
          }
        }else if(e.type == 1){
          this.getProdList()
          SingletonDataStore.prodRec = e.rec;
          setTimeout(function (argument) {
            // body...
            if(!self.state.init){
              self.getRefBuffer(7)
            }
          },200)
          this.setState({noupdate:false,prec:e.rec, cob:this.getCob(this.state.srec, e.rec, this.state.rec,this.state.fram), unusedList:this.getUCob(this.state.srec, e.rec, this.state.rec,this.state.fram), pcob:this.getPCob(this.state.srec,e.rec, this.state.rec,this.state.fram)})
          if (this.props.lane){
            this.props.update(this.props.lane)
          }
        }else if(e.type == 2){
          var iobits = {}
          var noupdate = true
          SingletonDataStore.dynRec = e.rec;
          if (vdf['@defines']['PHYSICAL_INPUT_NAMES']){
            vdf['@defines']['PHYSICAL_INPUT_NAMES'].forEach(function (b) {
              // body...
            if(typeof e.rec[b] != 'undefined'){
                  iobits[b] = e.rec[b]
                }
            })
            vdf['@defines']['LOGICAL_OUTPUT_NAMES'].forEach(function (b) {
              // body...
            if(typeof e.rec[b] != 'undefined'){
                  iobits[b] = e.rec[b]
                }
            })
/*            
            if(isDiff(iobits,this.state.ioBITs)){
                noupdate = false;
               // console.log(1347, iobits)
              }
*/          
          }
          if(e.rec['EditProdNeedToSave'] != self.state.rec['EditProdNeedToSave']){
            noupdate=false;
          }
            var faultArray = [];
            var warningArray = [];

          pVdef[8].forEach(function(f){
          if(e.rec[f] != 0){
            faultArray.push(f)
              if(self.state.prec[f+'Warn'] == 1){
                //warningArray.push(f)
              }
            }
          });
          pVdef[9].forEach(function(f){
          if(e.rec[f] != 0){
            warningArray.push(f)
            }
          });
          
            if(this.state.faultArray.length != faultArray.length){
              noupdate = false;
            }else if(this.state.warningArray.length != warningArray.length){
              noupdate = false;
            }else{
              faultArray.forEach(function (f) {
                if(self.state.faultArray.indexOf(f) == -1){
                  noupdate = false; 
                }
              })
              warningArray.forEach(function (w) {
                // body...
                if(self.state.warningArray.indexOf(w) == -1){
                  noupdate = false;
                }
              })
            }
          if(e.rec['Taring'] != this.state.rec['Taring']){
            if(e.rec['Taring'] == 1){
              //toast('Taring..')
              this.tBut.current.tStart('Taring');
            }else if(e.rec['Taring'] == 2){
              this.tBut.current.tDone('Tared')
            }else{
              this.tBut.current.tEnd();
            }
          }
          var pw = 0;
          if(typeof this.state.crec['PackWeight'] != 'undefined'){
            pw = this.state.crec['PackWeight']
          }
           if((e.rec['CheckingWeight'] != this.state.rec['CheckingWeight']) && (typeof this.state.rec['CheckingWeight'] != 'undefined')){
            if(e.rec['CheckingWeight'] == 1){
              //toast('Taring..')
              this.chBut.current.tStart('Check Weight');
              this.cwModal.current.show();
           //  setTimeout(function (argument) {
               // body...
              this.setState({waitCwgt:true, noupdate:false})
            //},150)
            }else{
              this.chBut.current.tEnd();

             this.cwModal.current.show();

              this.setState({waitCwgt:false, noupdate:false})
          
          
            }
          }
           if((e.rec['RejSetupInvalid'] != this.state.rec['RejSetupInvalid'])){
            if(e.rec['RejSetupInvalid'] == 1){
              //toast('Taring..')
              this.notify('Reject Setup is invalid!')
          
            }
          }
          if(e.rec['DateTime'] != this.state.rec['DateTime']){
            if (typeof this.fclck != 'undefined'){
              this.fclck.current.setDate(e.rec['DateTime'])
            }
          }
          var cob = this.state.cob
          var pcob = this.state.pcob
          if(this.state.updateCount == 0){
            var lw = 0;
            if(typeof e.rec['LiveWeight'] != 'undefined'){
              lw = e.rec['LiveWeight']
            }
          

              this.ss.current.setState({rec:e.rec, crec:this.state.crec, lw:FormatWeight(lw,this.state.srec['WeightUnits'])})
              if (this.ssDual && this.ssDual.current){
                this.ssDual.current.setState({rec:e.rec, crec:this.state.crec, lw:FormatWeight(lw,this.state.srec['WeightUnits'])})
              }
              if(this.sd.current){
//                console.log('update Live Weight')
                this.sd.current.updateLiveWeight(lw)
              }
              cob = this.getCob(this.state.srec, this.state.prec, e.rec,this.state.fram);
              pcob = this.getPCob(this.state.srec, this.state.prec, e.rec,this.state.fram)
              if (this.props.lane){
                this.props.update(this.props.lane)
              }
            noupdate = false
            this.setState({liveWeight:e.rec['LiveWeight'],rec:e.rec,ioBITs:iobits})
          }

          if(e.rec['Calibrating'] != this.state.rec['Calibrating']){
            noupdate = false;
          }
          if(e.rec['BatchRunning'] != this.state.rec['BatchRunning']){
            if(typeof this.state.rec['BatchRunning'] != 'undefined'){
              if(e.rec['BatchRunning'] == 1){
                //toast('Batch Started');
                this.ste.current.showMsg('Batch Started')
                if (this.steDual && this.steDual.current){
                  this.steDual.current.showMsg('Batch Started')
                }
                //this.lg.current.clearHisto();
                setTimeout(function () {
                  self.getRefBuffer(7)
                  // body...
                },100)
              }else if(e.rec['BatchRunning'] == 2){
               // toast('Batch Paused')
                this.ste.current.showMsg('Batch Paused')
                if (this.steDual && this.steDual.current){
                  this.steDual.current.showMsg('Batch Paused')
                }
              }else{
                //this.msgm.current.show('Batch Stopped')
                this.ste.current.showMsg('Batch Stopped')
                if (this.steDual && this.steDual.current){
                  this.steDual.current.showMsg('Batch Stopped')
                }
               //  toast('Batch Stopped')
              }
              noupdate = false
              if (this.props.lane){
                this.props.update(this.props.lane)
              }
            }
            if(e.rec['BatchRunComplete'] != this.state.rec['BatchRunComplete']){
              if(typeof this.state.rec['BatchRunComplete'] != 'undefined'){
                if(e.rec['BatchRunComplete'] == 1){
                  this.msgm.current.show('Batch Completed')
                  this.ste.current.showMsg('Batch Completed')
                  if (this.steDual && this.steDual.current){
                    this.steDual.current.showMsg('Batch Completed')
                  }
                  if (this.props.lane){
                    this.props.update(this.props.lane)
                  }
                }
              }
            }
          }
          this.setState({calibState:e.rec['Calibrating'],faultArray:faultArray,start:(e.rec['BatchRunning'] != 1),pcob:pcob,cob:cob, stop:(e.rec['BatchRunning'] != 0), pause:(e.rec['BatchRunning'] == 1),warningArray:warningArray,updateCount:(this.state.updateCount+1)%4, noupdate:noupdate, live:true})
          
        }else if(e.type == 3){
          e.rec.Nif_ip = this.state.nifip
          e.rec.Nif_gw = this.state.nifgw
          e.rec.Nif_nm = this.state.nifnm
          e.rec.Nif_mac = this.state.curDet.mac
          e.rec.ConnectedClients = this.state.connectedClients
          SingletonDataStore.framRec = e.rec;
          if(this.state.srec['RemoteDisplayLock'] == 1){
            if(typeof e.rec['InternalIP'] != 'undefined'){
              if(window.location.host != e.rec['InternalIP']){
                this.lockModal.current.show('This display has been locked for remote use. Please contact system adminstrator.')
              }
            }
            
          }
          this.setState({noupdate:false,fram:e.rec,cob:this.getCob(this.state.srec, this.state.prec, this.state.rec,e.rec)})
        }else if(e.type == 5){
          //toast('Weight Record - this message will be removed')
          // console.log('checkweighing pack')
          var packms = new Uint64LE(e.rec['PackTime'].data)
          e.rec['PackTime'] = packms
          if((e.rec['PackTime'] != this.state.crec['PackTime']) ||(e.rec['TotalCnt'] != this.state.crec['TotalCnt']) ||(e.rec['CheckWeightCnt'] != this.state.crec['CheckWeightCnt'])){
          // console.log('firstpack')
          var del = 25
          var dur = 50
          if(typeof this.state.prec["SampDelEnd"] != 'undefined'){
            // console.log('This should hit')
            del = this.state.prec['SampDelEnd'];
            dur = this.state.prec['SampDur'];
          }
          var ms = new Uint64LE(e.rec['BatchStartMS'].data)
          var sms = new Uint64LE(e.rec['SampleStartMS'].data)
          // console.log(inputSrcArr, outputSrcArr)
          // console.log(1217, ms.toString(), Date.now())
          // console.log('passed')
          var tz = -500
          var tzms = (tz/100)*60*60*1000
          var neg = true
          if(typeof this.state.srec['Timezone'] != 'undefined'){
            tz = uintToInt(this.state.srec['Timezone'], 16)
            var neg = (tz < 0)
          }
          
          var hours = Math.floor(Math.abs(tz)/100)*60*60*1000
          var mins = ((Math.abs(tz)%100)/100)*60*60*1000

          if(neg){
            hours = hours * -1
            mins = mins * -1
          }
          

          e.rec['BatchStartDate'] = new Date(parseInt(ms.toString())) //+ hours + mins)
          e.rec['SampleStartDate'] = new Date(parseInt(sms.toString())) //+ hours + mins)
          e.rec['BatchStartMS'] = parseInt(ms.toString())
          e.rec['SampleStartMS'] = parseInt(sms.toString())
          e.rec['packTare'] = this.state.srec['TareWeight'];
          e.rec['packCal'] = this.state.srec['CalFactor']
          SingletonDataStore.crec = e.rec;
          this.setState({crec:e.rec, noupdate:true})
          if(this.state.packSamples.length > 0){
            this.lg.current.parseDataset(e.rec['PackSamples'].slice(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
              this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
          }else{
            this.lg.current.parseDataset(new Array(100).fill(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
            this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
          }
          
          if (this.lgDual && this.lgDual.current){
            if(this.state.packSamples.length > 0){
              this.lg.current.parseDataset(e.rec['PackSamples'].slice(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
                this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
            }else{
            this.lgDual.current.parseDataset(new Array(100).fill(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
              this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
            }
          }
          this.hh.current.parseCrec(e.rec)
          if (this.hhDual && this.hhDual.current){
            this.hhDual.current.parseCrec(e.rec)
          }
          if(this.btc.current){
            this.btc.current.parseCrec(e.rec)
          }
          var pkgwgt = 0;
          if(typeof this.state.prec['PkgWeight'] != 'undefined'){
            pkgwgt = this.state.prec['PkgWeight']
          }
          this.ss.current.setState({crec:e.rec, pkgwgt:pkgwgt})
          if (this.ssDual && this.ssDual.current){
            this.ssDual.current.setState({crec:e.rec, pkgwgt:pkgwgt})
          }
          this.se.current.setState({crec:e.rec["PackWeight"].toFixed(1) + 'g'})
          if (this.seDual && this.seDual.current){
            this.seDual.current.setState({crec:e.rec["PackWeight"].toFixed(1) + 'g'})
          }
          this.tb.current.update(e.rec['PackWeight']);
          //cwc check
          if(e.rec['WeightPassed'] == 9){
            this.setState({cwgt:e.rec['PackWeight'], noupdate:false})
          }
          }else{
            console.log('repeated pack')
          }
          if (this.props.lane){
            this.props.update(this.props.lane)
          }


        }else if(e.type == 6){
          var cnt = 0;
          if(typeof this.state.crec['TotalCnt'] != 'undefined'){
            cnt = this.state.crec['TotalCnt']
          }
          this.setState({packSamples:e.rec,noupdate:true})
          this.lg.current.parseDataset(e.rec['PackSamples'].slice(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
            this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
          if (this.lgDual && this.lgDual.current){
            this.lgDual.current.parseDataset(e.rec['PackSamples'].slice(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
              this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd'], new Uint64LE(e.rec['PackTime']));
          }
          // console.log('Histogram Buffer',e)
          //if(cnt != 0){
          //  this.lg.current.pushWeight(e.rec['HistogramPacks'].slice(0-cnt))
          //}
            //this.setState({init:true})
        }else if(e.type == 7){
          // console.log('Histogram Batch?', e)
          if(this.btc.current){
              var buckets = 100;
              var bucketSize = 1;
              if(typeof this.state.prec['ProdName'] != 'undefined'){
                  bucketSize = this.state.prec['HistogramBucketSize'];
                  buckets = this.state.prec['HistogramBuckets']
              }    
              this.btc.current.parseHisto(e.rec['HistogramBatch'], bucketSize, buckets, e.rec['BucketMax'], e.rec['BucketMin'])
          }
          this.lg.current.pushBin(e.rec['HistogramBatch'], this.state.prec['HistogramBuckets'])
          if (this.lgDual && this.lgDual.current){
            this.lgDual.current.pushBin(e.rec['HistogramBatch'], this.state.prec['HistogramBuckets'])
          }
          this.setState({buckMin:e.rec['BucketMin'], buckMax:e.rec['BucketMax'], init:true})
          if (this.props.lane){
            this.props.update(this.props.lane)
          }
        }else if(e.type == 15){
          var prodList = this.state.prodList;
          var prodListRaw = this.state.prodListRaw
          prodList[e.prodNo] = Object.assign({},e.rec);
          prodListRaw[e.prodNo] = e.raw
          this.setState({prodList:prodList, prodListRaw:prodListRaw, noupdate:false})
        }
      }
    }
  }
  onRMsg(e,det){
    console.log('onRMsg',e)
  }
  getProdList(){
    this.sendPacket('getProdList')
  }
  /******************Parse Packets end*******************/
  
  sendPacket(n,v){
    //LandingPage.sendPacket
    var self = this;
    // console.log(n,v)
    var vdef = vdefByMac[this.state.curDet.mac]
    if(typeof n == 'string'){
      if(n == 'switchProd'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NO_APIWRITE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      }else if(n== 'getProdList'){
        this.props.soc.emit('getProdList', this.state.curDet.ip)
      }else if(n=='deleteProd'){
      var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEL_NO_WRITE']
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }else if(n == 'copyCurrentProd'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_COPY_NO_WRITE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }else if(n == 'copyDefProd'){
      var rpc = vdef[0]['@rpc_map']['KAPI_PROD_COPY_NO_DEFAULT']
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }else if(n == 'copyFacProd'){
      var rpc = vdef[0]['@rpc_map']['KAPI_PROD_COPY_NO_FACTORY']
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'deleteAll'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_DELETEALL']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'deleteBatch'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_PLANBATCHDELETE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            return 0;
          }
        })
         var buf = Buffer.alloc(4)
        buf.writeUInt32LE(parseInt(v),0)
     //  var strArg = buf; 
        var packet = dsp_rpc_paylod_for(rpc[0],pkt, buf);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'clearFaults'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARFAULTS']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'clearWarnings'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARWARNINGS']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'checkWeight'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CHECKWEIGHT']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'checkWeightSend'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CHECKWEIGHT']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            return 0
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt,v);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'cancelCW'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CHECKWEIGHTCANCEL']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            return 0
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt,v);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'updateSystem'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_UPDATESYSTEM']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'importRestore'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_IMPORTRESTORE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'restoreDefault'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_RESTORE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'restoreBackup'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_RESTORE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'backupProduct'){
        var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_SAVE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'getProdSettings'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_PRODRECORDREAD']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
      }else if(n == 'saveProduct'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_PRODRECORDWRITE']
        var pkt = rpc[1].map(function (r) {
          if(!isNaN(r)){
            return r
          }else{
            if(isNaN(v)){
              return 0
            }else{
              return parseInt(v)
            }
          }
        })
        var packet = dsp_rpc_paylod_for(rpc[0],pkt);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
        setTimeout(function (argument) {
          self.props.soc.emit('getProdList', self.state.curDet.ip)
        },150)
      }else if( n == 'refresh'){
        var rec = 0;
        if(v){
          rec = v
        }
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
        var packet = dsp_rpc_paylod_for(rpc[0],[rpc[1][0],rec,0])
        this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      
      }else if( n == 'refresh_buffer'){
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
      var packet = dsp_rpc_paylod_for(rpc[0],[rpc[1][0],v,0])
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      
      }else if( n == 'BatchStart'){
     
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if( n == 'BatchStartSel'){
     
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
      var buf = Buffer.alloc(4)
      buf.writeUInt32LE(v,0)
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1], buf)
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if( n == 'BatchStartNew'){
     
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
    
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1], v)
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if( n == 'BatchPause'){
     
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_PAUSEBATCH']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if( n == 'BatchEnd'){
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STOPBATCH']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if(n=='DateTime'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_DATETIMEWRITE']
  
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],v);
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      // console.log('DATE TIME SENT', this.state.curDet.ip)
      }else if(n=='DaylightSavings'){
        var rpc = vdef[0]['@rpc_map']['KAPI_DAYLIGHT_SAVINGS_WRITE']
  
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if(n=='Timezone'){
        var rpc = vdef[0]['@rpc_map']['KAPI_TIMEZONE_WRITE']
  
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }
    }else{
      // console.log('here')
      if(n['@rpcs']['toggle']){

        var arg1 = n['@rpcs']['toggle'][0];
        var arg2 = [];
        for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
          if(!isNaN(n['@rpcs']['toggle'][1][i])){
            arg2.push(n['@rpcs']['toggle'][1][i])
          }else{
            arg2.push(v)
          }
        }
        var packet = dsp_rpc_paylod_for(arg1, arg2);
      
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }else if(n['@rpcs']['write']){
      // console.log('should be here')
      var arg1 = n['@rpcs']['write'][0];
      var arg2 = [];
      var strArg = null;
      var flag = false
      for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
        if(!isNaN(n['@rpcs']['write'][1][i])){
          ////console.log('where')
          arg2.push(n['@rpcs']['write'][1][i])
        }else if(n['@rpcs']['write'][1][i] == n['@name']){
          ////console.log('the')
          if(!isNaN(v) && (n['@type'] != 'int32')){
            arg2.push(v)
          }
          else{
            arg2.push(0)
            strArg=v
          }
          flag = true;
        }else{
          ////console.log('fuck')
          var dep = n['@rpcs']['write'][1][i]
          if(dep.charAt(0) == '%'){

          }
        }
      }
      if(n['@rpcs']['write'][2]){
        if(Array.isArray(n['@rpcs']['write'][2])){
          strArg = n['@rpcs']['write'][2]
        }
        else if(typeof n['@rpcs']['write'][2] == 'string'){
          strArg = v
        }
        flag = true;
      }
      if(!flag){
        strArg = v;
      }
      if(n['@type'] == 'int32'){
        var buf = Buffer.alloc(4)
        buf.writeUInt32LE(parseInt(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'weight'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float_dist'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'belt_speed'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }
      // console.log(819, strArg, typeof strArg, v)
    
      var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
      // console.log(packet)
        
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
    }else if(n['@rpcs']['vfdwrite']){
      var arg1 = n['@rpcs']['vfdwrite'][0];
      var arg2 = [];
      var ind = n['@rpcs']['vfdwrite'][2][0];
      var strArg = null;
      
      for(var i = 0; i<n['@rpcs']['vfdwrite'][1].length;i++){
        if(!isNaN(n['@rpcs']['vfdwrite'][1][i])){
          arg2.push(n['@rpcs']['vfdwrite'][1][i])
        }else if(n['@rpcs']['vfdwrite'][1][i] == n['@name']){
          if(!isNaN(v)){
            arg2.push(v)
          }else{
            strArg=v
            
          }
        }
       
    }
     var buf = Buffer.alloc(5)
        buf.writeUInt8(ind,0)
        if((n['@type'] == 'float')||(n['@type'] == 'weight')||(n['@type'] == 'float_dist')||(n['@type'] == 'belt_speed')||(n['@type'] == 'fdbk_rate')){
          buf.writeFloatLE(parseFloat(v),1)
        }else{
          buf.writeUInt32LE(parseInt(v),1);
        }
        
        var packet = dsp_rpc_paylod_for(arg1, arg2,buf);
        this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      }else if(n['@rpcs']['apiwrite']){
      var arg1 = n['@rpcs']['apiwrite'][0];
      var arg2 = [];
      var strArg = null;
      for(var i = 0; i<n['@rpcs']['apiwrite'][1].length;i++){
        if(!isNaN(n['@rpcs']['apiwrite'][1][i])){
          arg2.push(n['@rpcs']['apiwrite'][1][i])
        }else if(n['@rpcs']['apiwrite'][1][i] == n['@name']){
          if(!isNaN(v)){
            arg2.push(v)
          }else{
            strArg=v
          }
        }
      }
      if(n['@type'] == 'int32'){
        var buf = Buffer.alloc(4)
        buf.writeUInt32LE(parseInt(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'weight'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float_dist'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }
      var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }else if(n['@rpcs']['clear']){
      var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }
    }
  }
  tareWeight(){
    if(this.state.connected){
      var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_TARE_WEIGHT_TARE']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }
  }
  calWeight(){
    this.cwModal.current.toggle()
  } 
  calWeightSend(){
    if(this.state.connected){
      var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_CAL_WEIGHT_USE']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }
  }
  calWeightCancelSend(){
    if(this.state.connected){
      var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_CAL_WEIGHT_CANCEL']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
      this.props.soc.emit('rpc', {ip:this.state.curDet.ip, data:packet})
    }
  }
  changeBranding(){}

  /**************Batch control******************/
  start(){
    var self = this;
    if((this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccStartStopBatch'])){
      if(this.state.srec['BatchMode'] == 0){
        this.sendPacket('BatchStart')
        this.setState({start:false, pause:true})
      }else if(this.state.srec['BatchMode'] == 1){
        this.props.soc.emit('getPlannedBatches', self.state.curDet.ip)
        setTimeout(function(argument) {
          self.planStart.current.toggle();


          // body...
        },200)
        
      }else if(this.state.srec['BatchMode'] == 2){
          this.manStart.current.toggle();


          // body...
        
      }
    }else{
      this.msgm.current.show('Access Denied')
    }
    
  }
  resume(){
    //if(this.state.srec['BatchMode'] == 0){
      this.sendPacket('BatchStart')
      this.setState({start:false, pause:true})
   // }
  }
  startSel(n){ this.sendPacket('BatchStartSel',n); }
  startBuf(b){ this.sendPacket('BatchStartNew',b); }
  pause(){
    this.sendPacket('BatchPause')
    this.setState({start:true, pause:false, stop:true})
  }
  stop(){
    var self =this;
    this.sendPacket('BatchPause')
    this.setState({start:true, pause:false, stop:true})
    setTimeout(function(){
      self.stopConfirm.current.show()
    }, 150)
    
  }
  stopConfirmed(){
    if((this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccStartStopBatch'])){
      this.sendPacket('BatchEnd')
      this.setState({start:true, pause:false})
     }else{
      this.msgm.current.show('Access Denied')
    }
  }
  /****************Batch control end**************/
  onNetpoll(){
    console.log('netpoll')
  }
  showDisplaySettings(){
    // console.log('why is this looping')
    var self = this;
    if(this.state.connected){
      this.sendPacket('refresh')
    }else{
      this.props.soc.emit('locateReq',true)
    }
    setTimeout(function () {
      self.settingModal.current.toggle()
    },100)
    setTimeout(function () {
        self.props.soc.emit('getConnectedClients')
    },200)
 
  }
  connectToUnit(det){
    // console.log('connect To Unit')
    var self = this;
    this.props.soc.emit('connectToUnit',{ip:det.ip, app:'FTI_CW', app_name:'FTI_CW'})
    var unit = {name:det.name, type:'single', banks:[det]}
    setTimeout(function (argument) {
      // body...
      // console.log(1308, unit)
      self.props.soc.emit('savePrefsCW', [unit])
    },150)
    setTimeout(function (argument) {
      // body...
      self.sendPacket('refresh')
    },300)
    if (this.state.checkPrecInterval == null){
      var interval = setInterval(function(){
        if (JSON.stringify(self.state.prec) === '{}'){
          self.sendPacket('refresh',1)
        }else{
          clearInterval(self.state.checkPrecInterval)
        }
      },500)
      this.setState({checkPrecInterval:interval})
    }
  //  setTimeout(function(){socket.emit('getProdList',det.ip)},150)
    this.setState({curDet:det, connected:true})
    if (this.props.lane){
      this.props.update(this.props.lane)
    }

  }

  pModalToggle(){
    var self = this;
    if(typeof this.state.curDet.ip != 'undefined'){
        this.pmodal.current.toggle();
      this.props.soc.emit('getProdList', this.state.curDet.ip)
      setTimeout(function (argument) {
        // body...
        self.sendPacket('getProdSettings',self.state.srec['ProdNo'])
      },500)
    }
  }
  imgClick(){
    // console.log('clicked')
    this.imgMD.current.toggle();
    //location.reload();
  }
  getBuffer(){
    this.sendPacket('refresh_buffer',6)
  }
  getRefBuffer(){
    this.sendPacket('refresh_buffer',7)
  }
  clearFaults(){
    this.sendPacket('clearFaults');

  }
  clearWarnings(){
    this.sendPacket('clearWarnings')
  }
  openBatch(){
    var self = this;
    if((typeof this.state.curDet.ip != 'undefined')&&(typeof this.state.crec['TotalWeight'] != 'undefined')){
      this.sendPacket('refresh', 7)

      this.batModal.current.toggle();
      setTimeout(function (argument) {
        // body...
        // console.log('send getPlannedBatches', self.state.curDet.ip)
        self.props.soc.emit('getPlannedBatches', self.state.curDet.ip)
        self.props.soc.emit('getProdList', self.state.curDet.ip)
        self.props.soc.emit('getBatches')
      },100)

    }
  }
  getBatchList(){
    // console.log('getting planned batch list')
    this.props.soc.emit('getPlannedBatches', this.state.curDet.ip)
  }
  onPmdClose(){
    if(this.state.rec['EditProdNeedToSave'] == 1){
        this.pmd.current.show(function () {});
        this.setState({prclosereq:true})
    }
  }
  checkweight(){
    if((this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccCheckWeight'])){
      this.sendPacket('checkWeight')
    }else{
      this.msgm.current.show('Access Denied');
      this.chBut.current.tEnd();
    }
    
  }
  checkWeightSend(cw,mv){
    var buf = Buffer.alloc(8)
    buf.writeFloatLE(cw,0)
    buf.writeFloatLE(mv,4)
    this.sendPacket('checkWeightSend', buf)
  }
  setTrans(v){
    var srec = this.state.srec
    srec['@customstrn'] = v
    if(v == 0){
      vMapV2 = vdefMapV2['@vMap']
      vMapLists = vdefMapV2['@lists']
      catMapV2 = vdefMapV2['@catmap']
      labTransV2 = vdefMapV2['@labels']
      this.setState({customMap:false, vmap:vdefMapV2,noupdate:false, srec:srec,cob:this.getCob(srec, this.state.prec, this.state.rec,this.state.fram)})
    }else if(v == 1){

      vMapV2 = this.state.custMap['@vMap']
      vMapLists = this.state.custMap['@lists']
      catMapV2 = this.state.custMap['@catmap']
      labTransV2 = this.state.custMap['@labels']

      this.setState({customMap:true, vmap:this.state.custMap,noupdate:false, srec:srec,cob:this.getCob(srec, this.state.prec, this.state.rec,this.state.fram)})
    }
  }
  setTheme(v){
    var srec = this.state.srec

      srec['@branding'] = v
    if(v == 0){
      this.setState({branding:'SPARC',noupdate:false, srec:srec,cob:this.getCob(srec, this.state.prec, this.state.rec,this.state.fram)})
    }else if(v == 1){
      this.setState({branding:'FORTRESS',noupdate:false, srec:srec,cob:this.getCob(srec, this.state.prec, this.state.rec,this.state.fram)})
    }
  }
  closeCWModal(){
    if(this.cwModal.current){
      this.cwModal.current.close();
    }
  }
  reboot(){
    this.props.soc.emit('reboot')
  }
  update(){
    //toast('Update in progress..')
    this.props.soc.emit('updateCW')
  }
  formatUSB(){
    this.props.soc.emit('formatInternalUsb')
    //this.sendPacket('formatUSB',0)
  }

  /**** Update Translations****/
  transChange(n,l,v){
    var custMap = this.state.custMap
    custMap['@vMap'][n]['@translations'][l]['name'] = v
    this.props.soc.emit('saveCustomJSON',JSON.stringify(custMap));
  }
  labChange(n,l,v){
    var custMap = this.state.custMap
    custMap['@labels'][n][l]['name'] = v
    this.props.soc.emit('saveCustomJSON',JSON.stringify(custMap));
  }
  submitTooltip(n,l,v){
    var custMap = this.state.custMap
    custMap['@vMap'][n]['@translations'][l]['description'] = v
    this.props.soc.emit('saveCustomJSON',JSON.stringify(custMap));
  }
  listChange(n,l,v){
    var custMap = this.state.custMap
    custMap['@lists'][n][l] = v
    this.props.soc.emit('saveCustomJSON',JSON.stringify(custMap));
  }
  exportVmap(){
    fileDownload(JSON.stringify(this.state.custMap),'custMap.json')//socket.emit('downloadJSON')
  }
  /**** Update Translations****/

  getData(){
    // console.log('get Batches')
   this.props.soc.emit('getBatches') 
  }
  resetVmap(){
    this.props.soc.emit('saveCustomJSON', JSON.stringify(vdefMapV2));
  }
  toggleGraph(){
    this.setState({histo:!this.state.histo})
  }
  testWebView(){
    this.webviewModal.current.toggle();
  }
  openUnused(){
    this.unusedModal.current.toggle();
  }
  forgot(id,ip){
    //console.log('passReset')
    this.props.soc.emit('passReset',{ip:ip,data:{user:id}})
  }
  getMMdep(d){
     if(d == 'MaxBeltSpeed'){
      //this is a hack, due to error in vdef
      d = 'MaxBeltSpeed0'//+= this.props.params[0]['@name'].slice(-1)
      // console.log(d,this.props.params[0]['@name'])
    }
      var pVdef = _pVdef;
      
      if(typeof pVdef[0][d] != 'undefined'){
        return this.state.srec[d]
      }else if(typeof pVdef[1][d] != 'undefined'){
        return this.state.prec[d]
      }else if(typeof pVdef[2][d] != 'undefined'){
        return this.state.rec[d]
      }
  }
  saveProductPassThrough(){
    if(this.state.rec['EditProdNeedToSave'] == 1){
      this.sendPacket('saveProduct', this.state.srec['EditProdNo']) 
      if(this.state.prclosereq){

      this.pmodal.current.forceclose();
      this.setState({prclosereq:false})
    }
    }
  }
  passThrough(){
    if(this.state.prclosereq){

      this.pmodal.current.forceclose();
      this.setState({prclosereq:false})
    }
  }
  goDual(){
    this.props.toDual()
  }
  renderModal() {
    var self = this;
    var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

    var detectors = this.state.dets.map(function (det, i) {
      // body...
      return   <div> <CircularButton branding={self.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={det.ip} onClick={()=> self.connectToUnit(det)}/></div>
       
    })
      return (<div>
        {detectors}
      </div>)
  }
  render(){
    //LandingPage.render
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
    var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}
    var config = 'config_w'
    var find = 'find_w'
    var klass = 'interceptorDynamicView'
    var pl = 'assets/play-arrow-fti.svg'
    var pauseb = 'assets/pause.svg'
    var stp = 'assets/stop-fti.svg'
    var backgroundColor;
    var grbg = '#e1e1e1'
    var img = 'assets/NewFortressTechnologyLogo-WHT-trans.png'
    var psbtklass = 'circularButton'
    var psbtcolor = 'black'
    var grbrdcolor = '#e1e1e1'
    var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'57px'}
    
    var raptor = <div style={{textAlign:'center'}}><img style={{width:219, marginTop:5, marginBottom:-5}} src={'assets/RaptorLogo.svg'}/></div>;
    var language = this.state.language
    
    if(this.state.branding == 'FORTRESS'){
      backgroundColor = FORTRESSPURPLE1
      grbrdcolor = '#e1e1e1'
      psbtcolor = '#1C3746'
      psbtklass = 'circularButton_sp'
    }else{
      grbrdcolor = '#e1e1e1'
      psbtcolor = '#1C3746'
      psbtklass = 'circularButton_sp'
      backgroundColor = SPARCBLUE1
      grbg = '#e1e1e1'
      img = 'assets/sparc-logo-rgb-reversed.svg'
      pl = 'assets/play-arrow-sp.svg'
      stp = 'assets/stop-sp.svg'
    }
    // var play, stop;
    // var sttxt = 'Start'
    // play = <div onClick={this.start} style={{width:250, lineHeight:'60px',color:psbtcolor,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
    // stop = ''
    // if(this.state.rec['BatchRunning'] == 2){
    //   sttxt = 'Resume'
    //   play = <div onClick={this.resume} style={{width:114, lineHeight:'60px',color:psbtcolor,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
    //   stop = <div onClick={this.stop} style={{width:114, lineHeight:'60px',color:psbtcolor,font:30, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block',width:50, alignItems:'center', verticalAlign:'middle', lineHeight:'25px', height:50}}>End Batch</div></div> 
    // }else if(this.state.rec['BatchRunning'] == 1){
    //   play = <div onClick={this.pause} style={{width:250, lineHeight:'60px',color:psbtcolor,font:30, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pauseb} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Pause/Stop</div></div>
    //   stop = ''
    // }

    // New Changes to add with greyed out functionality on startup 
    var play, stop;
    var sttxt = 'Start'
    
    // if CanStartBelts == 0
    play = <div style={{width:250, lineHeight:'60px',color:psbtcolor,font:30, background:'#a9a9a9', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
    stop = ''
    if(this.state.rec['BatchRunning'] == 0){
      if(this.state.rec['CanStartBelts'] == 1){
        play = <div onClick={this.start} style={{width:250, lineHeight:'60px',color:psbtcolor,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
        }
    }
    else if(this.state.rec['BatchRunning'] == 1){
      play = <div onClick={this.pause} style={{width:250, lineHeight:'60px',color:psbtcolor,font:30, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pauseb} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Pause/Stop</div></div>
      stop = ''
    }
    else if(this.state.rec['BatchRunning'] == 2){
      sttxt = 'Resume'
      play = <div onClick={this.resume} style={{width:114, lineHeight:'60px',color:psbtcolor,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
      stop = <div onClick={this.stop} style={{width:114, lineHeight:'60px',color:psbtcolor,font:30, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block',width:50, alignItems:'center', verticalAlign:'middle', lineHeight:'25px', height:50}}>End Batch</div></div> 
      if(this.state.rec['CanStartBelts'] == 0){
        play = <div  style={{width:114, lineHeight:'60px',color:psbtcolor,font:30, background:'#a9a9a9', display:'inline-block',marginLeft:5, borderWidth:5,height:60}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
      }

    }
    

    var cont = ''
    var sd = <div><DisplaySettings soc={this.props.soc} nifip={this.state.nifip} nifgw={this.state.nifgw} nifnm={this.state.nifnm} language={language} branding={this.state.branding}/>
      <button onClick={this.reboot}>Reboot</button><button onClick={this.formatUSB}>Format USB and Reboot</button></div>
    var unused = ''
    
    var cald = ''
    var dets = ''

    var lw = 0;
    var statusStr = 'Good Weight'
    if(typeof this.state.crec['PackWeight'] != 'undefined'){        
      if(this.state.crec['PackWeight']){
        lw = this.state.crec['PackWeight']
      }
      if(typeof this.state.crec['WindowStart'] != 'undefined'){
        winStart = this.state.crec['WindowStart']
        winEnd = this.state.crec['WindowEnd']
      }
      statusStr = vMapLists['WeightPassed']['english'][this.state.crec['WeightPassed']]
    }
    
    var statusLed = '';
    if(this.state.faultArray.length + this.state.warningArray.length> 0){
      statusLed = <img src="assets/led_circle_red.png"/>
    if(this.state.faultArray.length == 1){
      if(typeof vMapV2[this.state.faultArray[0]+'Mask'] != 'undefined'){
        statusStr = vMapV2[this.state.faultArray[0]+'Mask']['@translations']['english']['name'] + ' fault active'
      }else{
         statusStr = this.state.faultArray[0] + ' active'  
      }
    }else{
      statusStr = this.state.faultArray.length + ' faults active'
    }
    }else if(this.state.crec['WeightPassed']%2 == 1){
      statusLed = <img src="assets/led_circle_yellow.png"/>
    }


    if(this.state.srec['SRecordDate']){
        sd = <div><div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>System Settings</div></div>
        <SettingsPageWSB  packSamples={this.state.packSamples} soc={this.props.soc} timezones={this.state.timezones} timeZone={this.state.srec['Timezone']} dst={this.state.srec['DaylightSavings']} openUnused={this.openUnused} submitList={this.listChange} submitChange={this.transChange} submitTooltip={this.submitTooltip} calibState={this.state.calibState} setTrans={this.setTrans} setTheme={this.setTheme} onCal={this.calWeightSend} onCalCancel={this.calWeightCancelSend} branding={this.state.branding} int={false} usernames={this.state.usernames} mobile={false} Id={'SD'} language={language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.sd} data={this.state.data} 
          onHandleClick={this.settingClick} dsp={this.state.curDet.ip} mac={this.state.curDet.mac} cob2={[this.state.cob]} cvdf={vdefByMac[this.state.curDet.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prec} sysSettings={this.state.srec} crec={this.state.crec} dynSettings={this.state.rec} framRec={this.state.fram} level={this.state.level} accounts={this.state.usernames} vdefMap={this.state.vmap}/>
        <BatchWidget acc={(this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccStartStopBatch'])} sendPacket={this.sendPacket} liveWeight={FormatWeight(this.state.liveWeight,this.state.srec['WeightUnits'])} batchRunning={this.state.rec['BatchRunning']} canStartBelts={this.state.rec['CanStartBelts']} onStart={this.start} onResume={this.resume} pause={this.pause} start={this.state.start} stopB={this.stop} status={statusStr} netWeight={formatWeight(this.state.crec['PackWeight'], this.state.srec['WeightUnits'])}/>  
        </div>

        cont = sd;
        cald = (<div style={{background:'#e1e1e1', padding:10}}>
          <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'CalWeight'} vMap={vMapV2['CalWeight']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['CalWeight']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.srec['CalWeight'], this.state.srec['WeightUnits'])} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.state.curDet.mac][1][0]['CalWeight']} num={true}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'OverWeightLim'} vMap={vMapV2['OverWeightLim']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['OverWeightLim']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.prec['OverWeightLim'], this.state.srec['WeightUnits'])} param={vdefByMac[this.state.curDet.mac][1][1]['OverWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'UnderWeightLim'} vMap={vMapV2['UnderWeightLim']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['UnderWeightLim']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.prec['UnderWeightLim'], this.state.srec['WeightUnits'])} param={vdefByMac[this.state.curDet.mac][1][1]['UnderWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.calWeightSend} lab={'Calibrate'}/>
          </div>)

        unused = <div style={{background:'#e1e1e1', padding:10}}><SettingsPage soc={this.props.soc} black={true} submitList={this.listChange} submitChange={this.transChange} submitTooltip={this.submitTooltip} calibState={this.state.calibState} setTrans={this.setTrans} setTheme={this.setTheme} onCal={this.calWeightSend} branding={this.state.branding} int={false} usernames={this.state.usernames} mobile={false} Id={'uSD'} language={language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.usd} data={this.state.data} 
          onHandleClick={this.settingClick} dsp={this.state.curDet.ip} mac={this.state.curDet.mac} cob2={[this.state.unusedList]} cvdf={vdefByMac[this.state.curDet.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prec} sysSettings={this.state.srec} dynSettings={this.state.rec} framRec={this.state.fram} level={4} accounts={this.state.usernames} vdefMap={this.state.vmap}/></div>
    }else{
      dets = this.renderModal()
      cont = <div><div style={{display:'table-cell', width:330,backgroundColor:'#e1e1e1',textAlign:'center'}} >
        <div style={{textAlign:'center', fontSize:25, marginTop:5, marginBottom:5}}>Located Units</div>{dets}</div><div style={{display:'table-cell', width:840, paddingLeft:5, paddingRight:5}}>{sd}</div></div>
    } 

    var trendBar = [15,16.5,17.5,19,15.5,18.5]
    var winStart = 0;
    var winEnd = 300
    var bucketSize = 4
    var buckets = 100
    var pkgWeight = 0

    if(typeof this.state.prec['ProdName'] != 'undefined'){
      // trendBar = [this.state.prec['NominalWgt']-(1.1*this.state.prec['UnderWeightLim']),this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim'], this.state.prec['NominalWgt'] + this.state.prec['OverWeightLim'], this.state.prec['NominalWgt'] + (1.1*this.state.prec['OverWeightLim']), 165, 200]
      trendBar = [this.state.prec['NominalWgt']-(1.1*this.state.prec['UnderWeightLim']),this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim'], this.state.prec['NominalWgt'] + this.state.prec['OverWeightLim'], this.state.prec['NominalWgt'] + (1.1*this.state.prec['OverWeightLim']), this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim'], this.state.prec['NominalWgt']-this.state.prec['TolNegErrorX2'], this.state.prec['NominalWgt']]
      bucketSize = this.state.prec['HistogramBucketSize'];
      buckets = this.state.prec['HistogramBuckets']
      pkgWeight = this.state.prec['PkgWeight']
      // if(this.state.prec['WeighingMode'] == 1){
      //   trendBar = [this.state.prec['NominalWgt']-(1.1*this.state.prec['UnderWeightLim']),this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim'], this.state.prec['NominalWgt'] + this.state.prec['OverWeightLim'], this.state.prec['NominalWgt'] + (1.1*this.state.prec['OverWeightLim']), 165, 200]
      // }
      if(this.state.init){
        trendBar[0] = this.state.buckMin
        trendBar[3] = this.state.buckMax
      }
    }
    
    var logklass = 'logout'
    if(this.state.user == -1){
      logklass = 'login'
    }

    
    var wu = 0
    if(typeof this.state.srec['WeightUnits'] != 'undefined'){
      wu = this.state.srec['WeightUnits']
    }
    var batchPerm = (this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccBatchSetup'])
     
    // statusStr = 
    var home;
    var lane
    var raptorLogoWidth = 550
//    var laneNumber = new URLSearchParams(location.search).get('lane')
//    var laneStr = 'LANE '+laneNumber
    if (this.props.lane){
      var laneStr = 'LANE '+this.props.lane
      
      home = <td>
              <div style={{paddingLeft:3, borderRight:'2px solid #56697e',height:55, marginTop:16, paddingRight:3}} onClick={this.goDual}><div style={{textAlign:'center'}}><img style={{width:60, marginTop:-15, marginBottom:-7}} src={'assets/home.png'}/></div>
              <div style={{color:'#e1e1e1', marginTop:-17, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Home'}</div></div>
              </td>

      raptorLogoWidth = 300
      lane = <td style={{color:'white',fontSize:30}}>{laneStr}</td>
    }
    return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
         <div style={{marginLeft:'auto',marginRight:'auto',maxWidth:1280, width:'100%',textAlign:'left'}}>
         <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
            <tbody>
              <tr>
                <td><img style={{height: 67,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:16}} onClick={this.imgClick}  src={img}/></td>
                <td style={{width:raptorLogoWidth}}><ContextMenuTrigger id='raptorlogo'>{raptor}</ContextMenuTrigger>
                <ContextMenu id='raptorlogo'>
                  <MenuItem onClick={this.exportVmap}>Export Translations</MenuItem>
                  <MenuItem onClick={this.resetVmap}>Reset Translations</MenuItem>
                </ContextMenu>
                </td>
                {lane}
                {home}
                  <td style={{height:60, width:190, color:'#eee', textAlign:'right'}}><div style={{fontSize:28,paddingRight:6}}>{this.state.username}</div>
                  <FatClock timezones={this.state.timezones} timeZone={this.state.srec['Timezone']} branding={this.state.branding} dst={this.state.srec['DaylightSavings']} sendPacket={this.sendPacket} language={language} ref={this.fclck} style={{fontSize:16, color:'#e1e1e1', paddingRight:6, marginBottom:-17}}/></td>
                  <td className="logbuttCell" style={{height:60}}  onClick={this.toggleLogin}>
                  <div style={{paddingLeft:3, borderLeft:'2px solid #56697e', borderRight:'2px solid #56697e',height:55, marginTop:16, paddingRight:3}}>
                  <button className={logklass} style={{height:50, marginTop:-7}} onClick={this.toggleLogin} />
                  <div style={{color:'#e1e1e1', marginTop:-17, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Level '+this.state.level}</div>
                  </div></td>
                  <td className="confbuttCell" style={{paddingRight:5}}  onClick={this.showDisplaySettings}><button onClick={this.showDisplaySettings} className={config} style={{marginTop:-2, marginLeft:2,marginBottom:-10}}/>
                  <div style={{color:'#e1e1e1', marginTop:-20, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Settings'}</div>
                  </td>
              </tr>
            </tbody>
          </table>
          <table><tbody><tr style={{verticalAlign:'top'}}><td>
          <StatSummary language={language} unit={this.state.srec['WeightUnits']} branding={this.state.branding} ref={this.ss} submitChange={this.transChange} submitLabChange={this.labChange} pkgWeight={pkgWeight}/>
          </td><td><div><SparcElem ref={this.se} branding={this.state.branding} value={FormatWeight(lw, wu)} name={'Net Weight'} width={596} font={72}/></div>
          <div><StatusElem connected={this.state.connected} pAcc={(this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccClrFaultWarn'])} clearWarnings={this.clearWarnings} clearFaults={this.clearFaults} prodName={this.state.prec['ProdName']} weighingMode={this.state.prec['WeighingMode']} warnings={this.state.warningArray} weightPassed={this.state.crec['WeightPassed']} faults={this.state.faultArray} 
              ref={this.ste} branding={this.state.branding} value={'g'} name={'Status'} width={596} font={36} language={language} clearFaults={this.clearFaults} /></div>
          <div>
          </div><div style={{background:grbg,border:'5px solid '+grbrdcolor, borderRadius:20,overflow:'hidden'}}>
          <MainHistogram weightUnits={this.state.srec['WeightUnits']} getBuffer={this.getBuffer} histo={true} connected={this.state.connected} cwShow={() => this.cwModal.current.show()} language={language} clearFaults={this.clearFaults} det={this.state.curDet} faults={this.state.faultArray} warnings={this.state.warningArray} 
                    winMode={this.state.prec['WindowMode']} winMax={this.state.prec['WindowMax']} winMin={this.state.prec['WindowMin']} winStart={winStart} winEnd={winEnd} stdev={1} max={this.state.prec['NominalWgt']+this.state.prec['OverWeightLim']} min={this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim']} 
                    branding={this.state.branding} ref={this.lg} prodName={this.state.prec['ProdName']} nominalWeight={this.state.prec['NominalWgt']} bucketSize={bucketSize} buckets={buckets} buckMin={this.state.buckMin} buckMax={this.state.buckMax}>
          <TrendBar weightPassed={this.state.crec['WeightPassed']} weightUnits={this.state.srec['WeightUnits']} live={this.state.live} prodSettings={this.state.prec} branding={this.state.branding} lowerbound={trendBar[0]} upperbound={trendBar[3]} t1={trendBar[4]} t2={trendBar[5]} low={trendBar[1]} high={trendBar[2]} nominal={trendBar[6]} yellow={false} ref={this.tb} allowOverweight={this.state.prec['OverWeightAllowed']}/></MainHistogram></div>
          </td><td>
            <BatchPackCountGraph language={language} branding={this.state.branding} ref={this.hh} bCount={this.state.prec['BatchCount']} bRunning={this.state.rec['BatchRunning']}/>
          </td></tr></tbody></table>
          <div style={{display:'inline-block',paddingTop:5, paddingBottom:5, width:275}} >{play}{stop}</div>
          <CircularButton ctm={true} branding={this.state.branding} innerStyle={innerStyle} style={{width:220, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} onClick={this.openBatch} lab={labTransV2['Batch'][language]['name']} pram={'Batch'} language={language} vMap={labTransV2['Batch']} submit={this.labChange}/>
          <CircularButton override={true} ref={this.tBut} branding={this.state.branding} innerStyle={innerStyle} style={{width:220, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} lab={'Tare'} onClick={this.tareWeight}/>
          <CircularButton ctm={true} branding={this.state.branding} innerStyle={innerStyle} style={{width:220, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} onClick={this.pModalToggle} lab={labTransV2['Product'][language]['name']} pram={'Product'} language={language} vMap={labTransV2['Product']} submit={this.labChange}/>
          <CircularButton override={true} onAltClick={() => this.cwModal.current.toggle()} ref={this.chBut} branding={this.state.branding} innerStyle={innerStyle} style={{width:220, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} lab={'Check Weight'} onClick={this.checkweight}/>
        <Modal  x={true} ref={this.pmodal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPmdClose} closeOv={this.state.rec['EditProdNeedToSave'] == 1}>
          <PromptModal language={language} branding={this.state.branding} ref={this.pmd} save={this.saveProductPassThrough} discard={this.passThrough}/>
          <ProductSettings packSamples={this.state.packSamples} soc={this.props.soc} usb={this.state.rec['ExtUsbConnected'] == true} sendPacket={this.sendPacket} getProdList={this.getProdList} level={this.state.level} liveWeight={FormatWeight(this.state.liveWeight,this.state.srec['WeightUnits'])} startB={this.start} resume={this.resume} statusStr={statusStr} weightUnits={this.state.srec['WeightUnits']}  start={this.state.start} stop={this.state.stop} stopB={this.stop} pause={this.pause} submitList={this.listChange} 
          submitChange={this.transChange} submitTooltip={this.submitTooltip} vdefMap={this.state.vmap} onClose={()=>this.setState({prclosereq:false})}  editProd={this.state.srec['EditProdNo']} needSave={this.state.rec['EditProdNeedToSave']} language={language} ip={this.state.curDet.ip} mac={this.state.curDet.mac} 
          curProd={this.state.prec} runningProd={this.state.srec['ProdNo']} srec={this.state.srec} drec={this.state.rec} crec={this.state.crec} fram={this.state.fram} sendPacket={this.sendPacket} branding={this.state.branding} prods={this.state.prodList} pList={this.state.pList} pNames={this.state.prodNames}/>
        </Modal>
         <Modal x={true} ref={this.settingModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:660}}>
          {cont}
          <div>{this.state.connectedClients}</div>
        </Modal>
        <Modal  x={true} ref={this.locateModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:660, height:620}}>
          {this.renderModal()}
        </Modal> 
        <Modal  x={true} ref={this.cwModal} Style={{maxWidth:800, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:660, height:410}}>
         <CheckWeightControl close={this.closeCWModal} language={language} branding={this.state.branding} sendPacket={this.sendPacket} ref={this.cwc} cw={this.state.cwgt} waiting={this.state.waitCwgt}/>
        </Modal>
        <Modal  x={true} ref={this.batModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:660}}>
         <div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>Batch</div></div>
         <BatchControl soc={this.props.soc} bstartTime={this.state.crec['BatchStartDate']} plannedBatches={this.state.plannedBatches} pBatches={this.state.batchList} batchPerm={batchPerm} usb={this.state.rec['ExtUsbConnected'] == true} onResume={this.resume} startStopAcc={(this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccStartStopBatch'])} sendPacket={this.sendPacket}
          liveWeight={FormatWeight(this.state.liveWeight,this.state.srec['WeightUnits'])} statusStr={statusStr} getBatchList={this.getBatchList} batchMode={this.state.srec['BatchMode']} selfProd={this.state.srec['EditProdNo']} drec={this.state.rec} prod={this.state.prec} crec={this.state.crec} srec={this.state.srec} startNew={this.startBuf}
           startP={this.startSel} startB={this.start} mac={this.state.curDet.mac} stopB={this.stop} pause={this.pause} 
                   weightUnits={this.state.srec['WeightUnits']}  start={this.state.start} stop={this.state.stop} language={language} branding={this.state.branding} sendPacket={this.sendPacket} ref={this.btc} ip={this.state.curDet.ip}  pList={this.state.pList} pNames={this.state.prodNames} batchRunning={this.state.rec["BatchRunning"]} canStartBelts={this.state.rec['CanStartBelts']}/>
        </Modal>
        <Modal  x={true} ref={this.unuProductSettingssedModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:660}}>
        {unused}   
        </Modal>
        <AlertModal ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{"This will end the current batch. Confirm?"}</div></AlertModal>
        <Modal ref={this.imgMD}>
        <div style={{height:600}}>
            <button onClick={()=>location.reload()}>Refresh Page</button>
            <button onClick={()=> window.history.back()}>Go Back</button>
          </div>
          </Modal>
          <PlanBatchStart sendPacket={this.sendPacket} pList={this.state.pList} pNames={this.state.prodNames} ref={this.planStart} plannedBatches={this.state.plannedBatches} startP={this.startSel}/>
          <ManBatchStart branding={this.state.branding} pList={this.state.pList} pNames={this.state.prodNames} ref={this.manStart} ip={this.state.curDet.ip} language={language} mac={this.state.curDet.mac} startNew={this.startBuf}/>
         
        <LogInControl2 language={language} branding={this.state.branding} ref={this.lgctl} onRequestClose={this.loginClosed} isOpen={this.state.loginOpen} 
                pass6={this.state.srec['PasswordLength']} level={this.state.level}  mac={this.state.curDet.mac} ip={this.state.curDet.ip} logout={this.logout} 
                accounts={this.state.usernames} authenticate={this.authenticate} language={'english'} login={this.login} val={this.state.userid}/>
        <AuthfailModal ref={this.am} forgot={this.forgot}/>
      <UserPassReset language={'english'} ref={this.resetPass} mobile={!this.state.brPoint} resetPassword={this.resetPassword}/>
            <ProgressModal ref={this.prgmd}/><MessageModal ref={this.msgm}/>
        <LogoutModal ref={this.lgoModal} branding={this.state.branding}/>
        <LockModal ref={this.lockModal} branding={this.state.branding}/>
        </div>
      </div>) 
  }

}

class DualPage extends React.Component{
  constructor(props){
    super(props)
//    this.state = {updating:false}
  }

  componentDidMount(){
//    var self = this
//    this.setState({updating:true})
//    setInterval(function(){
//      self.setState({updating:true})
//    },1000)
    
  }

  shouldComponentUpdate(nextProps,nextState){
    if (nextProps.update && (nextProps.page == 'dual')){
      return true
    }
    return false
  }

  render(){
    var backgroundColor
    var grbg = '#e1e1e1'
    var psbtcolor = 'black'
    var grbrdcolor = '#e1e1e1'
    var language = 'english'
    var wu = 0
    var lw = 0;
    
    var laneState = this.props.lane.current.state
    if (laneState){
      language = laneState.language
      if(typeof laneState.srec['WeightUnits'] != 'undefined'){
        wu = laneState.srec['WeightUnits']
      }
      if(laneState.branding == 'FORTRESS'){
        backgroundColor = FORTRESSPURPLE1
        grbrdcolor = '#e1e1e1'
        psbtcolor = '#1C3746'
      }else{
        backgroundColor = SPARCBLUE1
        grbrdcolor = '#e1e1e1'
        psbtcolor = '#1C3746'
        grbg = '#e1e1e1'
      }
      var trendBar = [15,16.5,17.5,19,15.5,18.5]
      var winStart = 0;
      var winEnd = 300
      var bucketSize = 4
      var buckets = 100
      var pkgWeight = 0

      if(typeof laneState.crec['PackWeight'] != 'undefined'){        
        if(laneState.crec['PackWeight']){
          lw = laneState.crec['PackWeight']
        }
        if(typeof laneState.crec['WindowStart'] != 'undefined'){
          winStart = laneState.crec['WindowStart']
          winEnd = laneState.crec['WindowEnd']
        }
      }

      if(typeof laneState.prec['ProdName'] != 'undefined'){
        trendBar = [laneState.prec['NominalWgt']-(1.1*laneState.prec['UnderWeightLim']),laneState.prec['NominalWgt']-laneState.prec['UnderWeightLim'], laneState.prec['NominalWgt'] + laneState.prec['OverWeightLim'], laneState.prec['NominalWgt'] + (1.1*laneState.prec['OverWeightLim']), 165, 200]
        bucketSize = laneState.prec['HistogramBucketSize'];
        buckets = laneState.prec['HistogramBuckets']
        pkgWeight = laneState.prec['PkgWeight']
        if(laneState.init){
          trendBar[0] = laneState.buckMin
          trendBar[3] = laneState.buckMax
        }
      }

      return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
           <div style={{marginLeft:'auto',marginRight:'auto',maxWidth:1280, width:'100%',textAlign:'left'}}>
            <table>
            <tbody>
            <tr style={{verticalAlign:'top'}}>
            <td>
              <table>
              <tbody>
              <tr>
              <td>
                <div><StatusElemDual connected={laneState.connected} pAcc={(laneState.srec['PassOn'] == 0) || (laneState.level >= laneState.rec['PassAccClrFaultWarn'])} prodName={laneState.prec['ProdName']} warnings={laneState.warningArray} weightPassed={laneState.crec['WeightPassed']} faults={laneState.faultArray} 
                ref={this.props.lane.current.steDual} branding={laneState.branding} value={'g'} name={'Status'} width={425} font={25} language={language} /></div>
              </td>
              <td>
                <div><SparcElemDual ref={this.props.lane.current.seDual} branding={laneState.branding} value={FormatWeight(lw, wu)} name={'Net Weight'} width={163} font={25}/></div>
              </td>
              </tr>
              </tbody>
              </table>
            </td>
            </tr>

            <tr style={{verticalAlign:'top'}}>
            <td>
            <div style={{background:grbg,border:'1px solid '+grbrdcolor, borderRadius:10,overflow:'hidden', margin: '1px 1px 0px', width:600}}>
            <MainHistogramDual weightUnits={laneState.srec['WeightUnits']} getBuffer={this.getBuffer} histo={true} connected={laneState.connected} language={language} det={laneState.curDet} faults={laneState.faultArray} warnings={laneState.warningArray} 
                      winMode={laneState.prec['WindowMode']} winMax={laneState.prec['WindowMax']} winMin={laneState.prec['WindowMin']} winStart={winStart} winEnd={winEnd} stdev={1} max={laneState.prec['NominalWgt']+laneState.prec['OverWeightLim']} min={laneState.prec['NominalWgt']-laneState.prec['UnderWeightLim']} 
                      branding={laneState.branding} ref={this.props.lane.current.lgDual} prodName={laneState.prec['ProdName']} nominalWeight={laneState.prec['NominalWgt']} bucketSize={bucketSize} buckets={buckets} buckMin={laneState.buckMin} buckMax={laneState.buckMax}>
            </MainHistogramDual></div>
            </td>
            </tr>

            <tr style={{verticalAlign:'top'}}>
              <table><tbody>
              <tr>
              <td>
              <StatSummaryDual language={language} unit={laneState.srec['WeightUnits']} branding={laneState.branding} ref={this.props.lane.current.ssDual} pkgWeight={pkgWeight}/>
              </td>
              <td>
              <BatchPackCountGraphDual language={language} branding={laneState.branding} ref={this.props.lane.current.hhDual} bCount={laneState.prec['BatchCount']} bRunning={laneState.rec['BatchRunning']}/>
              </td>
              </tr>
              </tbody></table>
            </tr>
            <tr>
            <td><div style={{height:30}}>
            </div>
            </td>
            </tr>
            </tbody></table>
          </div>
        </div>) 
    }else{
      return (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
              </div>)
    }
  }
}

/******************Main Components end********************/

/******************Stats Dual Components Start *************/
class StatSummaryDual extends React.Component{
  constructor(props){
    super(props)
    this.parsePack = this.parsePack.bind(this);
    this.state = {count:0, grossWeight:0,currentWeight:0, rec:{},crec:{},lw:'0.0 g', pkgwgt:0}
  }
  parsePack(max){
    this.setState({count:this.state.count+1,grossWeight:this.state.grossWeight + max,currentWeight:max})

  }
  render(){
    var outerbg = '#818a90'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'

    //if(this.props.branding == 'SPARC'){
      outerbg = '#e1e1e1'
    
    if(this.props.branding == 'SPARC'){ 
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    //}

    var av = 0;
    if(this.state.count != 0){
      av = (this.state.grossWeight/this.state.count)
    }
    var grstr;
    if(this.state.grossWeight < 10000){
      grstr = this.state.grossWeight.toFixed(1)+'g'
    }else if(this.state.grossWeight < 10000000){
      grstr = (this.state.grossWeight/1000).toFixed(3)+'kg'
    }else{
      grstr = (this.state.grossWeight/1000000).toFixed(3)+'t'
    }
    var grswt = 0;
    var avg = 0;
    var stdev = 0;
    var tot = 0;
    var gvb = 0;
    var gvs = 0;
    var savg = 0;
    var sstdev = 0;
    var stot = 0;
    var ppm = 0;
    var sppm = 0;
    var unit = 0;
    var pkgwgt = this.state.pkgwgt
    if(typeof this.props.unit != 'undefined'){
      unit = this.props.unit
    }
    if(!isNaN(this.state.crec['PackWeight'])){
      grswt = FormatWeight(this.state.crec['PackWeight']+pkgwgt, unit)//this.state.crec['PackWeight'].toFixed(1) + 'g'
      avg = FormatWeight(this.state.crec['AvgWeight'], unit)//this.state.crec['AvgWeight'].toFixed(1) +'g'
      savg = FormatWeight(this.state.crec['SampleAvgWeight'], unit)//this.state.crec['SampleAvgWeight'].toFixed(1) + 'g'
      stdev = FormatWeightD(this.state.crec['StdDev'], unit, 2)
      sstdev = FormatWeightD(this.state.crec['SampleStdDev'], unit, 2)
      tot = FormatWeightS(this.state.crec['TotalWeight'], unit)//this.state.crec['TotalWeight'].toFixed(1)+'g'
      stot = FormatWeightS(this.state.crec['SampleTotalWeight'], unit)//this.state.crec['SampleTotalWeight'].toFixed(1)+'g'
      gvb = FormatWeightS(this.state.crec['GiveawayBatch'], unit)//this.state.crec['GiveawayBatch'].toFixed(1)+'g'
      gvs = FormatWeightS(this.state.crec['SampleGiveawayBatch'], unit)//this.state.crec['SampleGiveawayBatch'].toFixed(1)+'g'
      pkgwgt = FormatWeight(pkgwgt, unit)
     // if(this.state.crec['Batch_PPM']){
        ppm = this.state.crec['Batch_PPM'].toFixed(0) + 'ppm'
      //}
      sppm = this.state.crec['Sample_PPM'].toFixed(0) + 'ppm'
      
    }
  return  <div style={{width:295,background:outerbg, borderRadius:10, margin:1, marginBottom:0, border:'1px '+outerbg+' solid', borderTopLeftRadius:0, height:425}}>
      <div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:140,paddingLeft:2, fontSize:16,lineHeight:'24px', color:fontColor}}>Summary</div></div>
      <StatControlDual language={this.props.language} vMap={vMapV2['LiveWeight']['@translations']} pram={'LiveWeight'} name={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={this.state.lw} submitChange={this.props.submitChange}/>
      <StatControlDual language={this.props.language} vMap={vMapV2['NetWeight']['@translations']} pram={'NetWeight'} name={'Gross Weight'}  submitChange={this.props.submitChange} value={grswt}/>
      <StatControlDual language={this.props.language} vMap={vMapV2['PkgWeight']['@translations']} pram={'PkgWeight'} name={vMapV2['PkgWeight']['@translations'][this.props.language]['name']}  submitChange={this.props.submitChange} value={pkgwgt}/>
      <BatchStatControlDual name={labTransV2['@TotalWeightBS'][this.props.language]['name']} pram={'@TotalWeightBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={tot} sample={stot}/>
      <BatchStatControlDual name={labTransV2['@AvgWeightBS'][this.props.language]['name']} pram={'@AvgWeightBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={avg} sample={savg}/>
      <BatchStatControlDual name={labTransV2['@StdDevBS'][this.props.language]['name']} pram={'@StdDevBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={stdev} sample={sstdev}/>
      <BatchStatControlDual name={labTransV2['@GiveAwayBS'][this.props.language]['name']} pram={'@GiveAwayBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={gvb} sample={gvs}/>
      <BatchStatControlDual name={labTransV2['@ProductionRateBS'][this.props.language]['name']} pram={'@ProductionRateBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={ppm} sample={sppm}/>

    </div>
  }
}
class StatControlDual extends React.Component{
  constructor(props){
    super(props)
    this.state = {curtrns:this.props.name}
    this.translateModal = React.createRef();
    this.translate = this.translate.bind(this)
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
  }
  onChange(e){
    this.setState({curtrns:e.target.value})
  }
  translate(){
    this.translateModal.current.toggle();
  }
  submit(){
    this.props.submitChange(this.props.pram, this.props.language, this.state.curtrns)
  }
  render(){
    var uid = uuidv4()
    return <div style={{height:50}}>
    <div style={{textAlign:'left', paddingLeft:2, fontSize:16}}><ContextMenuTrigger id={uid}>{this.props.name}</ContextMenuTrigger>
    <ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu>
    </div>
    <div style={{textAlign:'center', marginTop:-4,lineHeight:0.8, fontSize:22}}>{this.props.value}</div>
    <Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
        <div>{this.props.vMap['english']['name']}</div>
        <div>
          Current Language: {this.props.language}
        </div>
         <input type='text' style={{fontSize:20, width:300}} value={this.state.curtrns} onChange={this.onChange}/>
         <button onClick={this.submit}>Submit Change</button>
        </Modal>
    </div>
  }
}
class BatchStatControlDual extends React.Component{
  constructor(props){
    super(props)
      this.state = {curtrns:this.props.name}
    this.translateModal = React.createRef();
    this.translate = this.translate.bind(this)
    this.onChange = this.onChange.bind(this);  
    this.submit = this.submit.bind(this);
  }
  onChange(e){
    this.setState({curtrns:e.target.value})
  }
  translate(){
    this.translateModal.current.toggle();
  }
  submit(){
    this.props.submitChange(this.props.pram, this.props.language, this.state.curtrns)
  }
  render(){
    var uid = uuidv4()
    var batchFont = 22
    if(this.props.batch.length > 9){
      batchFont = 20;
    }
    var sampleFont = 22;
    if(this.props.sample.length >9){
      sampleFont = 20;
    }
    if(this.props.batch.length > 12){
      batchFont = 18
    }
    if(this.props.sample.lenght > 12){
      sampleFont = 18;
    }
    return <div style={{height:50}}>
    <div style={{textAlign:'left', paddingLeft:2, fontSize:16}}><ContextMenuTrigger id={uid}>{this.props.name}</ContextMenuTrigger>
    <ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu></div>
    <div style={{textAlign:'center', marginTop:-4,lineHeight:0.8, fontSize:batchFont, whiteSpace:'nowrap'}}><div style={{display:'inline-block', width:'50%'}}>{this.props.batch}</div><div style={{display:'inline-block', width:'50%'}}>{this.props.sample}</div></div>
     <Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
         <input type='text' style={{fontSize:20, width:300}} value={this.state.curtrns} onChange={this.onChange}/>
         <button onClick={this.submit}>Submit Change</button>
        </Modal>
    </div>
  }
}

class SparcElemDual extends React.Component{
  constructor(props){
    super(props)
    this.state = {value:this.props.value}
  }
  componentWillReceiveProps(newProps){
    this.setState({value:newProps.value})
  }

  render(){
    var outerbg ='#e1e1e1'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'

    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    var innerWidth = Math.min((this.props.width*0.55),160);
    var innerFont = Math.min(Math.floor(this.props.font/2), 16);
    return(<div style={{width:this.props.width,background:outerbg, borderRadius:10, marginTop:5,marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:fontColor, lineHeight:'24px'}}>{this.props.name}</div></div><div style={{textAlign:'center', marginTop:-3,lineHeight:39+'px',height:39, fontSize:this.props.font}}>{this.state.value}</div>
    </div>)
  }
}
class StatusElemDual extends React.Component{
  constructor(props){
    super(props)
    this.state = {value:this.props.value, reject:false, msg:'', showMsg:false}
    this.fModal = React.createRef();
    this.toggleFault = this.toggleFault.bind(this);
    this.clearFaults = this.clearFaults.bind(this);
    this.clearWarnings = this.clearWarnings.bind(this);
    this.showMsg = this.showMsg.bind(this);
  }
  componentWillReceiveProps(newProps){
    this.setState({value:newProps.value})
  }
  showMsg(m){
    var self = this;
    this.setState({showMsg:true, msg:m})
    setTimeout(function () {
      // body...
      self.setState({showMsg:false, msg:''})
    }, 1500)

  }
  maskFault(){

  }
  clearFaults(){
    this.props.clearFaults();
    this.fModal.current.toggle();
  }
  clearWarnings(){
     this.props.clearWarnings();
    this.fModal.current.toggle();
  }
  toggleFault(f){
    if(f){
      this.fModal.current.toggle();
    }
  }
  render(){
    var outerbg ='#e1e1e1'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    var bg2 = 'rgba(150,150,150,0.5)'
   var modBg = FORTRESSPURPLE1
    if(this.props.branding == 'SPARC'){
      outerbg = '#e1e1e1'
      innerbg = SPARCBLUE2
      modBg = SPARCBLUE2
      fontColor = 'black'
    //  graphColor = SPARCBLUE2;
      bg2 = 'rgba(150,150,150,0.5)'
    }
    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    var innerWidth = Math.min((this.props.width*0.55),160);
    var innerFont = Math.min(Math.floor(this.props.font/2), 16);
      var bg = 'transparent';
  var str = 'Connecting...'
  var fault = false

var prodFont = 25;
var prodName = ''
if(typeof this.props.prodName != 'undefined'){
  prodName = this.props.prodName
   
}
if(prodName.length > 17){
    prodFont = 20
  } 


  //if(this.)
  if(this.props.connected){
  if(vMapLists){
    str = vMapLists['WeightPassed']['english'][this.props.weightPassed]
    if(this.props.weightPassed%2 == 0){
      outerbg = '#39ff14' //neon green
    }else if(this.props.weightPassed == 9){
      outerbg = 'royalblue'
    }else if(this.props.weightPassed%2 == 1){
      outerbg = '#ff9300'
    }
  }
  if(this.state.reject){

    outerbg = 'ff9300'
  }
  if(this.props.warnings.length != 0){
    if(this.props.warnings.length == 1){
      if(typeof vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask'] != 'undefined'){
        str = vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask']['@translations']['english']['name'] + ' active'
      }else{
        str = this.props.warnings[0] + ' active'  
      }
      
    }else{
      str = this.props.warnings.length + ' warnings active'
    }
    fault = true
    outerbg = 'orange'
  }
  if(this.props.faults.length != 0){
     if(this.props.faults.length == 1){
      if(typeof vMapV2[this.props.faults[0]+'Mask'] != 'undefined'){
        str = vMapV2[this.props.faults[0]+'Mask']['@translations']['english']['name'] + ' fault active'
      }else{
        str = this.props.faults[0] + ' active'  
      }
      
    }else{
      str = this.props.faults.length + ' faults active'
    }
    fault = true
    outerbg = 'red'
  }
  
  if(this.state.showMsg){
    str = this.state.msg;
  }

  

  }
    return(<div style={{width:this.props.width,background:outerbg, borderRadius:10, marginTop:5,marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div style={{display:'grid', gridTemplateColumns:'160px auto'}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:fontColor, lineHeight:'24px'}}>{this.props.name}</div><div style={{display:'inline-block', fontSize:prodFont, textAlign:'center', lineHeight:'25px', verticalAlign:'top'}}>{prodName}</div></div>
       <div style={{textAlign:'center', marginTop:-3,lineHeight:39+'px',height:39, fontSize:20, whiteSpace:'nowrap',display:'grid', gridTemplateColumns:'160px auto'}}><div></div><div style={{display:'inline-block', textAlign:'middle'}} onClick={()=>this.toggleFault(fault)}>{str}</div></div>
          <Modal ref={this.fModal} innerStyle={{background:modBg}}>
            <div style={{color:'#e1e1e1'}}><div style={{display:'block', fontSize:30, textAlign:'left', paddingLeft:10}}>Faults</div></div>
     
          <FaultDiv branding={this.props.branding} pAcc={this.props.pAcc} maskFault={this.maskFault} clearFaults={this.clearFaults} clearWarnings={this.clearWarnings} faults={this.props.faults} warnings={this.props.warnings}/>
        </Modal>

    </div>)
  }
}
/******************Stats Dual Components end*********************/

/********************Graphs Dual Start********************/
class BatchPackCountGraphDual extends React.Component{
  constructor(props){
    super(props)
    this.toggle = this.toggle.bind(this);
    this.state = {batchData:[0, 0, 0, 0, 0, 0, 0, 0], sampleData:[0, 0, 0, 0, 0, 0, 0, 0],batch:true, batchStartTime:'', sampleStartTime:''}
  }
  parseCrec(crec){
    var data = this.state.batchData.slice(0);
    var sampleData = this.state.sampleData.slice(0);
    data[0] = crec['TotalCnt']
    data[1] = crec['PassWeightCnt'];
    data[2] = crec['LowPassCnt'];
    data[3] = crec['LowRejCnt']; 
    data[4] = crec['HighCnt'];
    data[5] = crec['UnsettledCnt']
    //data[6] = crec['ImprobableCnt']

    data[6] = crec['CheckWeightCnt']
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    //sampleData[6] = crec['SampleImprobableCnt']
    sampleData[6] = crec['SampleCheckWeightCnt']

    var bst = ''
    var sst = ''
    if(crec['BatchStartMS'] != 0){
      bst = crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' ')
    }
    if(crec['SampleStartMS'] != 0){
      sst = crec['SampleStartDate'].toISOString().slice(0,19).split('T').join(' ')
    }

    this.setState({batchData:data, sampleData:sampleData, batchStartTime:bst,sampleStartTime:sst})
  }
  parsePack(pack){
    var data = [0,0,0,0,0,0,0]//this.state.data.slice(0)
    data[0]++;
    if(pack<85){
      data[1]++;
    }else if(pack<88){
      data[2]++
    }else if(pack<92){
      data[3]++
    }else if(pack<94){
      data[4]++
    }else if(pack<96){
      data[5]++
    }else if(pack<100){
      data[6]++
    }
    //this.setState({data:data})
  } 
  toggle(){
    this.setState({batch:!this.state.batch})
  }
  translateCounts(){

  }
  render(){
    var outerbg = '#e1e1e1'
    var self = this;
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    var graphColor = FORTRESSPURPLE2
    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
      graphColor = SPARCBLUE2;
    }
    
    var xDomain = [0,15]
    var yDomin = [0, 5]
    var selData;
    var bText;
    var bsttxt = 'Batch Started at: '+this.state.batchStartTime
    var max = 0;
    var showCount = false
    if(this.state.batch){
      bText = 'Batch'
      showCount = ((this.props.bRunning != 0) && (this.props.bCount != 0) && (this.state.batchData[0] > 0))
      selData = this.state.batchData.slice(0)
    }else{
      bText = 'Sample'
      bsttxt = 'Sample Started at: '+this.state.sampleStartTime
      selData = this.state.sampleData.slice(0)
    }
    
    max = Math.max(...selData)
    var xDm = [0,max]
    if(max == 0){
      xDm = [0,1]
    }
    var data = [{x: selData[0], y:vMapV2['TotalCnt']['@translations'][this.props.language]['name']}, {x: selData[1], y:vMapV2['PassWeightCnt']['@translations'][this.props.language]['name']}, {x: selData[2], y:vMapV2['LowPassCnt']['@translations'][this.props.language]['name']},
     {x: selData[3], y:vMapV2['LowRejCnt']['@translations'][this.props.language]['name']}, {x:selData[4], y:vMapV2['HighCnt']['@translations'][this.props.language]['name']}, {x:selData[5], y:vMapV2['UnsettledCnt']['@translations'][this.props.language]['name']}, {x:selData[6], y:vMapV2['CheckWeightCnt']['@translations'][this.props.language]['name']}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
    var labelData = data.map(function(d, i){
      var lax = 'start'
      var label = d.x
      var ofs = 0
      if(showCount && i == 1){
        if ( typeof self.props.bCount != 'undefined' ){
          label = label + '/' + self.props.bCount
        }
       // lax = 'end'
       // ofs = -20
      }
      if(d.x > (data[0].x*0.66)){
        lax = 'end'
        return {x:d.x,y:d.y,label:label, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
      }
      return  {x:d.x,y:d.y,label:label, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
    })
    var butt = <div onClick={this.toggle} style={{width:77, fontSize:18, textAlign:'center'}}>{bText}</div>
    //var hh = 
    return <div style={{position:'relative',width:295, height:425,background:outerbg, borderRadius:10, margin:1, marginBottom:0, border:'1px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div style={{marginBottom:30}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24,lineHeight:'24px', width:150,paddingLeft:2, fontSize:16, color:fontColor}}>Statistics</div></div>
      <div style={{position:'absolute', left:209, top:0, marginTop:-2,borderTopRightRadius:10, borderBottomLeftRadius:10, border:'5px solid rgb(129, 138, 144)'}}>{butt}</div>
      <div style={{fontSize:16, marginLeft:10, marginTop:-10, height:30}}>{bsttxt}</div>
    <XYPlot height={370} width= {292} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal' xDomain={xDm}>    
  
  <HorizontalBarSeries data={data} color={graphColor} />
  <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
  <XAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} hideTicks={max<1} orientation="bottom" tickSizeOuter={0} tickFormat={val => Math.round(val) === val ? val : ""}/>
  <YAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="left" tickSizeOuter={0} tickFormat={tickFormatter}/>
    </XYPlot>
    </div>
  }
}

class MainHistogramDual extends React.Component{
  constructor(props){
    super(props)
    this.parseDataset = this.parseDataset.bind(this);
    this.clearFaults = this.clearFaults.bind(this);
    this.maskFault = this.maskFault.bind(this);
    this.statusClick = this.statusClick.bind(this);
    this.pushWeight = this.pushWeight.bind(this);
    this.pushBin  = this.pushBin.bind(this);
    this.clearHisto = this.clearHisto.bind(this);
    this.fModal = React.createRef();
    this.histo = React.createRef();
    var dtst = []
    for(var i = 0; i < 300; i++){
      dtst.push(0)
    }
    this.state = {pTime:0,weightPassed:0,pmax:2000, pstrt:0,pend:299, pmin:0,calFactor:0.05, tareWeight:0,decisionRange:[12,18],max:20, min:0,dataSets:[dtst,dtst.slice(0), dtst.slice(0)],reject:false,over:false,under:false}
  }
  pushBin(x,y){
    this.histo.current.pushBin(x,y);
  }
  clearHisto(){
    console.log('clear Histo')
    this.histo.current.clearHisto();
  }
  parseDataset(data, strt, stend, pmax,pmin, calFactor, tareWeight, pweight, weightPassed, pstrt, pend,pTime){
    var dataSets = this.state.dataSets;
    if(dataSets.length > 5){
      dataSets = dataSets.slice(-5)
    }

    dataSets.push(data)
    var setMax = []
    dataSets.forEach(function (d) {
      // body...
      setMax.push(Math.max(...d))
    })

    var max = Math.max(...data)
    var reject = false;
    if((pweight > this.props.max) || (pweight < this.props.min)){
      reject = true;
  
    }
    if(this.props.histo && this.state.pTime != pTime){
      this.histo.current.pushWeight(pweight)
    }
    //this.histo.current
    this.setState({dataSets:dataSets,pmax:(pmax/calFactor)+tareWeight, pmin:(pmin/calFactor)+tareWeight, pstrt:pstrt, pend:pend, decisionRange:[strt, stend], reject:reject,max:(Math.max(...setMax) + (max*5))/6, min:Math.min(...data), over:(pweight>this.props.max), under:(pweight<this.props.min), calFactor:calFactor, tareWeight:tareWeight, weightPassed:weightPassed,pTime:pTime})
  }
  pushWeight(e){
    this.histo.current.pushWeight(e)
  }
  clearFaults(){
    this.props.clearFaults();
        this.fModal.current.toggle();
  }
  maskFault(){
    this.props.maskFault();
  }
  statusClick(){
    if(this.props.faults.length != 0){
      this.fModal.current.toggle();
    }else if(this.state.weightPassed == 9){
      this.props.cwShow()
    }
  }
  render(){
    var outerbg = '#818a90'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    var graphColor = 'darkturquoise'//FORTRESSGRAPH
    var bg2 = 'rgba(150,150,150,0.5)'
   var modBg = FORTRESSPURPLE1
    if(this.props.branding == 'SPARC'){
      outerbg = '#e1e1e1'
      innerbg = SPARCBLUE2
      modBg = SPARCBLUE2
      fontColor = 'black'
      graphColor = SPARCBLUE2;
      bg2 = 'rgba(150,150,150,0.5)'
    }



  var bg = 'transparent';
  var str = 'Good Weight'
  var fault = false

  if(vdefByMac[this.props.det.mac]){
    str = vdefByMac[this.props.det.mac][0]['@labels']['WeightPassed']['english'][this.state.weightPassed]
  }
  if(this.props.faults.length != 0){

    if(this.props.faults.length == 1){
      if(typeof vMapV2[this.props.faults[0]+'Mask'] != 'undefined'){
        str = vMapV2[this.props.faults[0]+'Mask']['@translations']['english']['name'] + ' fault active'
      }else{
        str = this.props.faults[0] + ' active'  
      }
      
    }else{
      str = this.props.faults.length + ' faults active'
    }
    fault == true
  }
  if(this.props.warnings.length != 0){

    if(this.props.warnings.length == 1){
      if(typeof vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask'] != 'undefined'){
        str = vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask']['@translations']['english']['name'] + ' active'
      }else{
        str = this.props.warnings[0] + ' active'  
      }
      
    }else{
      str = this.props.warnings.length + ' warnings active'
    }
    fault == true
  }


  if(this.props.connected == false){
    str = 'Not Connected'
  }
  var  xyplot = <WeightHistogramDual buckMin={this.props.buckMin} buckMax={this.props.buckMax} buckets={this.props.buckets} bucketSize={this.props.bucketSize} unit={this.props.weightUnits} ref={this.histo} nom={this.props.nominalWeight} stdev={this.props.stdev}/>
  
  return  <div style={{background:bg, textAlign:'center', position:'relative'}}>
    <div style={{width:550,marginLeft:'auto',marginRight:'auto'}}>{this.props.children}</div>

 {xyplot}
      <Modal ref={this.fModal} innerStyle={{background:modBg}}>
          <FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.props.faults} warnings={this.props.warnings}/>
        </Modal>
    </div>
  }
}
/*    <div style={{overflow:'hidden', marginTop:14}}>
    <div style={{marginTop:-10}}>
    </div>
    </div>
*/
class WeightHistogramDual extends React.Component{
  constructor(props){
    super(props)
    var divs = []
    var bins = []
    var range0 = this.props.buckMin
    var range1 = this.props.buckMax
    var div = (range1-range0)/this.props.buckets
    
    for(var i = 0; i<this.props.buckets; i++){
      divs.push([range0+(div*i), range0+ (div* (i+1))])
      bins.push(0);
    }
    
    this.pushWeight = this.pushWeight.bind(this);
    this.clearHisto = this.clearHisto.bind(this);
    this.pushBin = this.pushBin.bind(this);
    this.state ={bins:bins,divs:divs,range:[range0,range1]}
  }
  componentWillReceiveProps(props){
    if(props.nom != this.props.nom || props.bucketSize != this.props.bucketSize || props.buckets != this.props.buckets || props.buckMin != this.props.buckMin || props.buckMax != this.props.buckMax){
      console.log('get props')
      var divs = []
      var bins = []
      var range0 = props.buckMin
      var range1 = props.buckMax
      var div = (range1-range0)/props.buckets
      if(props.bucketSize){
        div = props.bucketSize
      }
      for(var i = 0; i<props.buckets; i++){
        divs.push([range0+(div*i), Math.min(range0+ (div*(i+1)), range1)])
        bins.push(0)
      }
  
    this.setState({divs:divs,range:[range0,range1]})
    }
  }
  clearHisto(){
    var divs = []
    var bins = []
    var range0 = this.props.buckMin
    var range1 = this.props.buckMax
    var div = (range1-range0)/this.props.buckets
    for(var i = 0; i<this.props.buckets; i++){
      divs.push([range0+(div*i), range0+ (div* (i+1))])
      bins.push(0)
    }
    this.state ={bins:bins,divs:divs,range:[range0,range1]}
  }
  pushBin(batch, bins){
    console.log('get bins')
    this.setState({bins:batch.slice(0,bins)})
  }
  pushWeight(w){
    console.log('array', w)
    var bins = this.state.bins.slice(0)
    var divs = this.state.divs.slice(0)
    if(Array.isArray(w)){

      bins = [];
      for(var j= 0; j<this.props.buckets; j++){
        // divs.push([range0+(div*i), range0+ (div* (i+1))])
        bins.push(0)
        //bins.push(64-Math.pow((8-i),2))
      }
      w.forEach(function (wgt) {
        var i = 0;
        while((i < divs.length - 1)&&(wgt > divs[i][1])){
          i++;
        }
        bins[i]++;
      })
    }else{
      if(w < this.props.buckMin || w> this.props.buckMax){
        //disregard out of range packs
      }else{
        var i = 0;
      while((i < divs.length - 1)&&(w > divs[i][1])){
        i++;
      }
      bins[i]++;
      }
      
    }
    this.setState({bins:bins})
  }
  render(){
    var self = this;
    var divs = this.state.divs
    var max = 0
    var data = this.state.bins.map(function(d,i){
      max = Math.max(d,max);
     // console.log(divs.length, i)
     if(divs.length > i){
      return {y0:0, y:d, x0:divs[i][0], x:divs[i][1]}
     }else{
      return {y0:0, y:d, x0:0, x:0}
     }
      
    })
    var ticks = 1
    while((max/ticks)>10){
      if(ticks<5){
        ticks*=5
      }else{
        ticks*=2
      }
    }
    var labDat = [];
    var tick = 0;
    if(divs.length > 0){
    while(tick <= max){
      labDat.push({x:divs[0][0],y:tick})
      tick += ticks
    }
  }
  var u = 0;
  if(this.props.unit){
    u = this.props.unit
  }
  var factors = [1, 0.001, 0.002201, 0.035274]
  var sigfigs = [1, 2, 2, 1]
    var labelData = labDat.map(function(d){
      var lax = 'end'
      return  {x:d.x,y:d.y,label:d.y, xOffset:-15, yOffset:0, size:0.5, labelAnchorX:lax, style:{fill:'#888', fontSize:14}}
    })



    return <XYPlot xDomain={this.state.range} yDomain={[0,max*1.1]} height={150} width={540} margin={{left:50,right:0,bottom:30,top:20}}>
     <XAxis tickFormat={val => roundTo(val*factors[u],sigfigs[u])} tickTotal={10} style={{line:{stroke:'#888'}, ticks:{stroke:"#888"}}}/>
     <YAxis tickFormat={val => Math.round(val) === val ? val : ""} hideTicks={max<1} style={{line:{stroke:'#e1e1e1'}, ticks:{stroke:"#888"}}}/>
        <VerticalRectSeries data={data} color={'darkturquoise'}/>
    </XYPlot>
  }
}

/******************Graphs Dual Components Ends **************/



/******************Settings Components start********************/
class ProductSettings extends React.Component{
  constructor(props){
    super(props)
    var prodList = [];
    var prodNames = this.props.pNames
    this.props.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.state ={data:[],copyMode:0,showAdvanceSettings:false,searchMode:false, filterString:'', filterList:[],selProd:this.props.editProd,prodList:prodList, showAllProd:false,
    cob2:this.getPCob(this.props.srec, this.props.curProd, this.props.drec, this.props.fram)}

    this.updateFilterString = this.updateFilterString.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.selectProd = this.selectProd.bind(this);
    this.copyCurrentProd = this.copyCurrentProd.bind(this);
    this.copyDefProd = this.copyDefProd.bind(this);
    this.copyFacProd = this.copyFacProd.bind(this);
    this.onProdScroll = this.onProdScroll.bind(this);
    this.selectRunningProd = this.selectRunningProd.bind(this);
    this.getPCob = this.getPCob.bind(this);
    this.onAdvanced = this.onAdvanced.bind(this);
    this.sendPacket = this.sendPacket.bind(this);
    this.saveProduct = this.saveProduct.bind(this);
    this.saveProductPassThrough = this.saveProductPassThrough.bind(this);
    this.getValue = this.getValue.bind(this);
    this.showAllProd = this.showAllProd.bind(this);
    this.copyTo = this.copyTo.bind(this);
    this.copyAlert = this.copyAlert.bind(this);
    this.copyConfirm = this.copyConfirm.bind(this);
    this.deleteProd = this.deleteProd.bind(this);
    this.deleteProdConfirm = this.deleteProdConfirm.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.onShortcut = this.onShortcut.bind(this);
    this.passThrough = this.passThrough.bind(this);    
    this.prodMgmt = this.prodMgmt.bind(this);
    this.submitChange = this.submitChange.bind(this);
    this.closeKeyboard = this.closeKeyboard.bind(this);
    this.toggleGraph = this.toggleGraph.bind(this);
    this.getBuffer = this.getBuffer.bind(this);
    this.onPromptCancel = this.onPromptCancel.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.onProdImportExport = this.onProdImportExport.bind(this);
    this.onImport = this.onImport.bind(this);
    this.onExport = this.onExport.bind(this);
    this.onRestore = this.onRestore.bind(this);
    this.onBackup = this.onBackup.bind(this);
    this.copyFromFt = this.copyFromFt.bind(this);
    this.deleteAllProducts = this.deleteAllProducts.bind(this);
    this.advProdMgmt = this.advProdMgmt.bind(this);
    this.copyFromDef = this.copyFromDef.bind(this);
    this.showProdMgmtTooltip = this.showProdMgmtTooltip.bind(this);
    this.stopConfirmed = this.stopConfirmed.bind(this);
    this.msgm = React.createRef();
    this.stopConfirm = React.createRef();
    this.prImEx = React.createRef();
    this.pmd = React.createRef();
    this.pmd2 = React.createRef();
    this.cfTo = React.createRef();
    this.cfModal = React.createRef();
    this.dltModal = React.createRef();
    this.arrowBot = React.createRef();
    this.arrowTop = React.createRef();
    this.sd = React.createRef();
    this.pg = React.createRef();
    this.pgm = React.createRef();
    this.pmgmt = React.createRef();
    this.apmgmt = React.createRef();
    this.prodMgmtTooltip = React.createRef();
  }
  componentWillReceiveProps(newProps){
    if(this.state.selProd != newProps.editProd){
      this.setState({selProd:newProps.editProd})
    }
    
  }
  componentDidMount(){
    var self = this;
    var scrollInd = 0;
    this.state.prodList.forEach(function(prd,i){
      if(prd.no == self.state.selProd){
        scrollInd = i;
      }
    });
    setTimeout(function(argument) {
      self.props.sendPacket('getProdSettings', self.props.editProd)
    },300)
    var el = document.getElementById('prodListScrollBox')
    el.scrollTop = scrollInd*66
    this.props.sendPacket("refresh_buffer",6)
  }
  shouldComponentUpdate(newProps, newState){
    //console.log('Component Will Receive')

    if(newProps.needSave != this.props.needSave){
      if(newProps.needSave == 1){
       if(this.pgm.current.state.show){
        this.pmd2.current.show();
       }else{
         this.pmd.current.show()
       }
       
      }
    }
    return true;
  }
  prodMgmt(){
    //Open Product Management Modal
    var advProdEditAcc = this.props.level >= this.props.srec['PassAccAdvProdEdit'];
      if(this.props.srec['PassOn'] == 0){
        advProdEditAcc = true;
      }
    if(advProdEditAcc){
      this.pmgmt.current.toggle();  
    }else{
      this.msgm.current.show('Access Denied')
    }
    
  }
  toggleGraph(){
    //Toggle Pack Graph
    this.pgm.current.toggle();
  }
  getBuffer(){

  }
  submitTooltip(n,l,v){
    //Add tool tips
    this.props.submitTooltip(n,l,v)
  }
  sendPacket(n,v){
    if(this.props.drec['BatchRunning'] != 0){
      if(n['@locked_by_batch']){
        this.msgm.current.show('Changes not permitted until batch is stopped.')
      }
    }
    var self = this;
    this.props.sendPacket(n,v)
  }
  onAdvanced(){
    //Show SettingsPage
    if(this.state.prodList.length > 0){
      this.setState({showAdvanceSettings:!this.state.showAdvanceSettings})
    }else{
      toast('Products need to be fetched')
    }
  }
  getPCob (sys,prod,dyn, fram) {
    //Get  
    var vdef = vdefByMac[this.props.mac]
    var _cvdf = JSON.parse(JSON.stringify(vdef[6]['CWProd']))
    var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram,sys['PassAccAdvProdEdit'])
    vdef = null;
    _cvdf = null;
   
    return cob
  }
  componentWillReceiveProps(newProps){
    var prodList = [];
    var prodNames = newProps.pNames
    newProps.pList.forEach(function (pn,i) {
      // body...
      prodList.push({name:prodNames[i], no:pn})
    })
    var curProd = newProps.curProd
    if(newProps.prods[this.state.selProd]){
      curProd = newProps.prods[this.state.selProd]
      
    }
    
    this.setState({prodList:prodList, cob2:this.getPCob(newProps.srec, curProd, newProps.drec, newProps.fram),selProd:newProps.editProd});
  }
  updateFilterString(str){
    var list = []
    var self = this;
    this.state.prodList.forEach(function(prod) {
    
        if(str.trim() == ''){
          list.push(prod)
        }else if(prod.name.toUpperCase().indexOf(str.toUpperCase()) != -1){
          list.push(prod)
        }
      }) 
    var scrollInd = 0;
    list.forEach(function(prd,i){
      if(prd.no == self.state.selProd){
        scrollInd = i;
      }
    });

    var el = document.getElementById('prodListScrollBox')
    el.scrollTop = scrollInd*66
    
    this.setState({filterString:str, filterList:list})
  }
  toggleSearch(){
    this.setState({searchMode:!this.state.searchMode})
  }
  closeKeyboard(){
    this.updateFilterString('');
    this.toggleSearch();
  }
  copyCurrentProd(target=-1){
    var self = this;
    var nextNum = this.props.pList[this.props.pList.length - 1] + 1;
    if(target != -1){
      nextNum = target;
    }
    this.props.sendPacket('copyCurrentProd',nextNum)
    setTimeout(function (argument) {
      // body...
      self.props.sendPacket('getProdList')
    },300)
  }
  copyDefProd(target=-1){
    var self = this;
    var nextNum = this.props.pList[this.props.pList.length - 1] + 1;
    if(target != -1){
      nextNum = target;
    }
    this.props.sendPacket('copyDefProd',nextNum)
    setTimeout(function (argument) {
      // body...
      self.props.sendPacket('getProdList')
    },300)
  }
  copyFacProd(target=-1){
    var self = this;
    var nextNum = this.props.pList[this.props.pList.length - 1] + 1;
    if(target != -1){
      nextNum = target;
    }
    this.props.sendPacket('copyFacProd',nextNum)
    setTimeout(function (argument) {
      // body...
      self.props.sendPacket('getProdList')
    },300)
  }
  onPromptCancel(){
      this.props.sendPacket('getProdSettings',this.state.selProd)
  }
  selectProd(p){
    var self = this;
    //this.saveProduct();
    if(this.props.needSave == 1){
      this.pmd.current.show(
      function () {
        self.props.sendPacket('getProdSettings',p)
        self.setState({searchMode:false, filterString:''})
      });
    }else{
      self.props.sendPacket('getProdSettings',p)
      self.setState({searchMode:false, filterString:''})
    }
  }
  onProdScroll(){
   var el = document.getElementById('prodListScrollBox')   
      if(el){
          if(el.scrollTop > 5){
            this.arrowTop.current.show();
          }else{
            this.arrowTop.current.hide();
          }
          if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
            this.arrowBot.current.show();
          }else{
            this.arrowBot.current.hide();
          }
      }
  }
  onValChange(p,v){}
  stop(){
    var self =this;
    setTimeout(function(){
      self.stopConfirm.current.show()
    }, 150)
  }
  stopConfirmed(){
    var prodEditAcc = this.props.level >= this.props.srec['PassAccSelectProduct'];
    if(this.props.srec['PassOn'] == 0){
      prodEditAcc = true;
    }
    if(prodEditAcc){
      this.props.sendPacket('switchProd',this.state.selProd)
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  selectRunningProd(){
    var prodEditAcc = this.props.level >= this.props.srec['PassAccSelectProduct'];
    if(this.props.drec['BatchRunning']==1 || this.props.drec['BatchRunning']==2){
      this.stop();
    }else{
      if(this.props.srec['PassOn'] == 0){
        prodEditAcc = true;
      }
      if(prodEditAcc){
        this.props.sendPacket('switchProd',this.state.selProd)
      }else{
        this.msgm.current.show('Access Denied')
      }
    }    
  }
  saveProduct(){
    // console.log('saving ', this.state.selProd)
    this.props.sendPacket('saveProduct',this.state.selProd)
  }
  saveProductPassThrough(f){
    var self = this;
    this.saveProduct();
    setTimeout(function (argument) {
      // body...
      // console.log(f)
      //f();
    },100);
  }
  passThrough(f){
   this.props.sendPacket('getProdSettings', this.props.editProd);
   this.pmd.current.close();
  }

  getValue(rval, pname){
    var curProd = {}
    if(this.props.prods[this.state.selProd]){
      curProd = this.props.prods[this.state.selProd]
    }
    var pram;
    var val;
    var label = false
    var res = vdefByMac[this.props.mac];
    var pVdef = _pVdef;
    var dec = 0;
    var self = this;
    
    if(res){
      pVdef = res[1];
    }

    if(typeof pVdef[0][pname] != 'undefined'){
      pram = pVdef[0][pname]
      var deps = []
      val = rval
      if(pram["@type"]){
        var f = pram["@type"]
        if(pram["@dep"]){
          deps = pram["@dep"].map(function(d){
            if(pVdef[6][d]["@rec"] == 0){
              return self.props.srec[d];
            }else{
              return curProd[d];
            }
          });
          
          if(f == 'mm'){
            if(deps[0] == 0){
              dec = 1
            }
          }
        } 
        if(pram['@bit_len']<=16){
          val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
        }
      }else if(typeof pram['@decimal'] != 'undefined'){
        val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
      }
        
      if(pram["@labels"]){
        label = true
      }
    }else if(typeof pVdef[1][pname] != 'undefined'){
        
      pram = pVdef[1][pname]  
      var deps = []
      val = rval
      if(pram["@type"]){
        var f = pram["@type"]
        if(pram["@dep"]){
          deps = pram["@dep"].map(function(dp){
            var d = dp;
             
            if(pVdef[6][d]["@rec"] == 0){
              return self.props.srec[d];
            }else if(pVdef[6][d]["@rec"] == 1){
              return curProd[d];
            }else if(pVdef[6][d]["@rec"] == 2){
              return self.props.drec[d]
            }
          });
          if(pram['@type'] == 'rej_del'){
            deps.push(1000)
          }
        }
        if(f == 'mm'){
          if(deps[0] == 0){
            dec = 1
          }
        }
        if(pram['@bit_len']<=16){
          val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
        }
        if(f == 'phase_offset'){
          val = uintToInt(val,16)
        }
          
      }else if(typeof pram['@decimal'] != 'undefined'){
        val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
      }
      if(pram["@labels"]){
        label = true
      }
    }else if(typeof pVdef[2][pname] != 'undefined'){
        
      pram = pVdef[2][pname]
        
      var deps = []
      val = rval
      if(pram["@type"]){
        var f = pram["@type"]
        if(f == 'phase'){
          val =   (uintToInt(val,16)/100).toFixed(2)
        }else{
          if(pram["@dep"]){
            deps = pram["@dep"].map(function(dp){
              var d = dp;
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.srec[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return curProd[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                return self.props.drec[d];
              }
            });
          }
          if(f == 'mm'){
              if(deps[0] == 0){
                dec = 1
            }
          }
          if(pram['@bit_len']<=16){
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }
        }
          
        }else if(pram['@name'] == 'RejExitDistEst'){
          var dependancies = ['SysRec.MetricUnits']
          deps = dependancies.map(function(d){
            if(pVdef[6][d]["@rec"] == 0){
                return self.props.srec[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return curProd[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                return self.props.drec[d];
              }
          })
          dec = 1
          val = eval(funcJSON['@func']['mm']).apply(this, [].concat.apply([], [val, deps]));

        }else if(typeof pram['@decimal'] != 'undefined'){
          val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
        }
        if(pram["@labels"]){
          label = true
        }
      }else if(typeof pVdef[3][pname] != 'undefined'){
        
        pram = pVdef[3][pname]
        
        var deps = []
        val = rval
        if(pram["@type"]){
          var f = pram["@type"]

          if(pram["@dep"]){
            deps = pram["@dep"].map(function(d){
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.srec[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return curProd[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                 return self.props.drec[d];
              }else if(pVdef[6][d]["@rec"] == 3){
                return self.props.fram[d];
              }
            });
          }
          if(pram['@bit_len']<=16){
             val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }
  
      }else if(typeof pram['@decimal'] != 'undefined'){
        val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
      }
      if(pram["@labels"]){
        label = true
      }
    }else{
      val = rval
    }
    return val;
  }
  showAllProd(){
    this.setState({showAllProd:!this.state.showAllProd})
  }
  copyTo(){
    if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
          this.cfTo.current.toggle();
          this.setState({copyMode:0})
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  copyFromFt(){
     if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
          this.cfTo.current.toggle();
          this.setState({copyMode:2})
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  copyFromDef(){
     if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
          this.cfTo.current.toggle();
          this.setState({copyMode:1})
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  copyConfirm(target){
    var t = parseInt(target)
    var prodNos = this.props.pList.slice(0)
    // console.log('copyConfirm', t, prodNos)
    if(t == this.props.srec['ProdNo']){
      this.msgm.current.show('Cannot overwrite current running product.')
    }else{
      if(prodNos.indexOf(t) != -1){
        this.copyAlert(t)
      }else{
        if(this.state.copyMode == 0){
          this.copyCurrentProd(t)
          
        }else if(this.state.copyMode == 1){
          this.copyDefProd(t)
        }else if(this.state.copyMode == 2){
          this.copyFacProd(t)
        }
      }
    }

    
  }
  copyAlert(target){
    var alertMessage = 'Product '+ target+' will be overwritten. Continue?'

    this.cfModal.current.show(this.copyCurrentProd, target, alertMessage)
  }
  deleteProd(p){
    if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
      this.dltModal.current.show(p)
    }else{
      this.msgm.current.show('Access Denied')
    }

  }
  deleteProdConfirm(p){
    var self = this;
    this.sendPacket('deleteProd',p)
    setTimeout(function(argument) {
      // body...
      self.sendPacket('getProdList')
    },300)
  }
  submitChange(n,l,v){
    this.props.submitChange(n,l,v);
  }
  onShortcut(p){
    var self = this;
    this.setState({showAdvanceSettings:true})
    setTimeout(function () {
      // body...
      self.sd.current.goToShortcut(p)
    },200)
  }
  getMMdep(d){
    if(d == 'MaxBeltSpeed'){
      d = 'MaxBeltSpeed0'
    }
    var res = vdefByMac[this.props.mac];
      var pVdef = _pVdef;
      var dec = 0;
      var self = this;
      if(res){
        pVdef = res[1];
      }
      var curProd = {}
      if(this.props.runningProd == this.props.editProd){
        curProd = this.props.curProd
      }else if(this.props.prods[this.state.selProd]){
        curProd = this.props.prods[this.state.selProd]
      }
      if(typeof pVdef[0][d] != 'undefined'){
        return this.props.srec[d]
      }else if(typeof pVdef[1][d] != 'undefined'){
        return curProd[d]
      }else if(typeof pVdef[2][d] != 'undefined'){
        return this.props.drec[d]
      }
  }
  onProdImportExport(){
    this.prImEx.current.show();
  }
  onImport(){
    if(this.props.usb){
       this.props.soc.emit('importProds', this.props.mac)
  
    }else{
      //this.msgm.current.show('Plug in USB drive and try again')
    }
  }
  onExport(){
    if(this.props.usb){
    this.props.soc.emit('exportProds', this.props.mac)
      
    }else{
   //   this.msgm.current.show('Plug in USB drive and try again')
    }
  }
  onBackup(){
    if(this.props.usb){
    this.props.soc.emit('backupProds', this.props.mac)
      
    }else{
   //   this.msgm.current.show('Plug in USB drive and try again')
    }
  }
  onRestore(){
    if(this.props.usb){
          this.props.soc.emit('restoreProds', this.props.mac)

    }else{
     
   //   this.msgm.current.show('Plug in USB drive and try again')
    }
  }
  deleteAllProducts(){
    if((this.props.srec['PassOn'] == 0) || (this.props.level >= 4 )){
      this.sendPacket('deleteAll')
    }else{
      this.msgm.current.show('Access Denied')}
  }
  advProdMgmt(){
    this.apmgmt.current.show();
  }
  showProdMgmtTooltip(){
    this.prodMgmtTooltip.current.show();
  }
  render(){
    var self = this;
    var list = [];
    var sp = null;
    var content = ''
    var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    var selStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:25,lineHeight:'47px'}
    var searchColor = SPARCBLUE1;
    var newFeedbackCorRate="";
    
    if(this.props.branding == 'FORTRESS'){
      searchColor = FORTRESSPURPLE2
    }
    if(this.state.searchMode){
      var filterString = this.state.filterString
      this.state.prodList.forEach(function(prod) {
    
        if(self.state.selProd == prod.no){
          sp = prod 
        }

      })
      list = this.state.filterList.slice(0)
      content = <div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6, height:480}}>
      <EmbeddedKeyboard label={'Search Products'} liveUpdate={this.updateFilterString} language={this.props.language} onAccept={this.toggleSearch} onCancel={this.closeKeyboard}/></div>
    }else{
      var curProd = {}
      var pList = [];
      var showText = 'Show All Products'
      if(this.props.runningProd == this.props.editProd){
        curProd = this.props.curProd
      }

      if(this.props.prods[this.state.selProd]){
        curProd = this.props.prods[this.state.selProd]
      }
      for(var i=1;i<501;i++){
        pList.push({name:'NULL PROD',no:i, null:true})
      }
      this.state.prodList.forEach(function (p) {
        pList[p.no - 1] = p;
      })
      if(this.state.showAllProd){
        list = pList.slice(0)
        showText = 'Hide Inactive Products'
      }else{
        list = this.state.prodList.slice(0)
      }
      list.forEach(function (pr) {
        if(self.state.selProd == pr.no){
          sp = pr 
        }
      })
      if(sp == null){
        sp = {name:'NULL PROD', no:1, null:true}
      }
      var unit = 'g'
      var weightUnits = this.props.srec['WeightUnits']
      var factor = 1;
      var nwgt = ''
      var fdtwgt = ''
      var pkgwgt = ''
      var ovwgt = ''
      var udwgt = ''



      if(typeof curProd['NominalWgt'] != 'undefined'){
        nwgt = FormatWeight(curProd['NominalWgt'], weightUnits);
        ovwgt = FormatWeight(curProd['OverWeightLim'], weightUnits);
        udwgt = FormatWeight(curProd['UnderWeightLim'], weightUnits);
        fdtwgt = FormatWeight(curProd['FeedbackTarWgt'],weightUnits);
        pkgwgt = FormatWeight(curProd['PkgWeight'],weightUnits);
      }
      var grphBut = <img src='assets/graph.svg' style={{position:'absolute', width:30, left:780}} onClick={this.props.toggleGraph}/>

      var prodEditAcc = this.props.level >= this.props.srec['PassAccProdEdit'];
      var advProdEditAcc = this.props.level >= this.props.srec['PassAccAdvProdEdit'];
      if(this.props.srec['PassOn'] == 0){
        prodEditAcc = true;
        advProdEditAcc = true;
      }
      
      if(typeof curProd['FeedbackCorRate']!='undefined' && typeof curProd['FeedbackCorRate']=='string'){
        if(curProd['FeedbackCorRate'].includes('grams/pulse'))
        {
          newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/pulse","g/pls");
        }else if(curProd['FeedbackCorRate'].includes('grams/sec')){
          newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/sec","g/s");
        }
      }else{
        newFeedbackCorRate = curProd['FeedbackCorRate'];
      }
      /**Fetching the current product name */
      var rp = {}
      if(this.props.runningProd){
        this.state.prodList.forEach(function(prod) {   
          if(self.props.runningProd == prod.no){
            rp = prod 
          }
        })
      }

      content =( 
      <div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6,height:480}}>
        <div>
        <div style={{display:'inline-block', verticalAlign:'top'}}>
        <ProdSettingEdit afterEdit={this.props.getProdList} acc={prodEditAcc} trans={true} name={'ProdName'} vMap={vMapV2['ProdName']}  language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={60} w2={300} label={'Product Name'} value={rp.name} param={vdefByMac[this.props.mac][1][1]['ProdName']} tooltip={vMapV2['ProdName']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={false}/></div>
        <div style={{display:'inline-block', marginLeft:5, marginTop:-5}}><CircularButton onClick={this.selectRunningProd} branding={this.props.branding} innerStyle={selStyle} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:50, borderRadius:15, boxShadow:'none'}} lab={'Select Product'}/>
        <img src='assets/graph.svg' style={{position:'absolute', width:40, left:770, marginTop:15}} onClick={this.toggleGraph}/>
        
        </div>
        <div style={{display:'none', marginBottom:-10}}>
          <div style={{display:'none', position:'relative', verticalAlign:'top'}} onClick={this.toggleSearch}>
            <div style={{height:35, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{height:35, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{position:'absolute',float:'right', marginTop:-70, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:50}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>Search</div></div>
          </div>
        </div>
        </div>
        <div style={{height:339}}>
          <div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'NominalWgt'} vMap={vMapV2['NominalWgt']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Nominal Weight'} value={nwgt} param={vdefByMac[this.props.mac][1][1]['NominalWgt']} tooltip={vMapV2['NominalWgt']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'OverWeightLim'} vMap={vMapV2['OverWeightLim']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Over Weight Limit'} value={ovwgt} param={vdefByMac[this.props.mac][1][1]['OverWeightLim']} tooltip={vMapV2['OverWeightLim']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            {this.props.curProd['WeighingMode'] != 1 &&
              <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'UnderWeightLim'} vMap={vMapV2['UnderWeightLim']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Under Weight Limit'} value={udwgt} param={vdefByMac[this.props.mac][1][1]['UnderWeightLim']} tooltip={vMapV2['UnderWeightLim']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            }
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'PkgWeight'} vMap={vMapV2['PkgWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Packaging Weight'} value={pkgwgt} param={vdefByMac[this.props.mac][1][1]['PkgWeight']}  tooltip={vMapV2['PkgWeight']['@translations'][this.props.language]['description']} onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'EyePkgLength'} vMap={vMapV2['EyePkgLength']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Product Length'} value={this.getValue(curProd['EyePkgLength'], 'EyePkgLength')} tooltip={vMapV2['EyePkgLength']['@translations'][this.props.language]['description']} param={vdefByMac[this.props.mac][1][1]['EyePkgLength']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'VfdBeltSpeed1'} vMap={vMapV2['VfdBeltSpeed1']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Belt Speed'} value={this.getValue(curProd['VfdBeltSpeed1'],'VfdBeltSpeed1')}  tooltip={vMapV2['VfdBeltSpeed1']['@translations'][this.props.language]['description']} param={vdefByMac[this.props.mac][1][1]['VfdBeltSpeed1']} onEdit={this.sendPacket} editable={true} num={true} shortcut={[4]} onShortcut={this.onShortcut} /></div>
          </div>
          
          <div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
            <div style={{width:'90%',padding:'2.5%',margin:'2.5%',background:'linear-gradient(90deg,#919aa0, #e1e1e1)', height:285, overflowY:'scroll'}}>
              <div><div style={{width:'60%',display:'inline-block',fontSize:17}}>Overweight Accept</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>{vMapLists['OverWeightAllowed'][this.props.language][curProd['OverWeightAllowed']]}</div></div>
              <div><div style={{width:'60%',display:'inline-block',fontSize:17}}>Product Speed</div><div style={{width:'40%',display:'inline-block', textAlign:'right',fontSize:17}}>{this.getValue(curProd['VfdBeltSpeed1'],'VfdBeltSpeed1')}</div></div>
              {
                this.props.curProd['FeedbackMode'] != 0 && 
                <React.Fragment>
                  <div><div style={{width:'60%',display:'inline-block',fontSize:17}}>Feedback Control</div><div style={{width:'40%',display:'inline-block', textAlign:'right',fontSize:17}}>{vMapLists['FeedbackMode'][this.props.language][curProd['FeedbackMode']]}</div></div>
                    <div><div style={{width:'55%',display:'inline-block', fontSize:14, verticalAlign:'top'}}>
                      
                      <div style={{width:'63%',display:'inline-block'}}>Correction Rate</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>{newFeedbackCorRate}</div>
                      <div style={{width:'63%',display:'inline-block'}}>Dead Zone</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>±{FormatWeight(curProd['FeedbackDeadZone'],weightUnits)}</div>
                      <div style={{width:'63%',display:'inline-block'}}>Sample Count</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>{curProd['FeedbackSampCnt']}</div>
                  
                    </div>
                    <div style={{width:'45%',display:'inline-block', fontSize:14, verticalAlign:'top'}}>
                      
                      <div style={{width:'63%',display:'inline-block', marginLeft:'2%'}}>Wait Count</div><div style={{width:'35%',display:'inline-block', textAlign:'right'}}>{curProd['FeedbackWaitCnt']}</div>
                      <div style={{width:'63%',display:'inline-block', marginLeft:'2%'}}>Hi Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right'}}>{FormatWeight(curProd['FeedbackHiLim'],weightUnits)}</div>
                      <div style={{width:'63%',display:'inline-block', marginLeft:'2%'}}>Lo Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right'}}>{FormatWeight(curProd['FeedbackLoLim'], weightUnits)}</div>
                  
                    </div></div>
                  </React.Fragment>
              }
              <div><div style={{width:'53%',display:'inline-block', fontSize:17}}>Weighing Mode</div><div style={{width:'47%',display:'inline-block', textAlign:'right',fontSize:17}}>{vMapLists['WeighingMode'][this.props.language][curProd['WeighingMode']]}</div></div>
              <div><div style={{width: this.props.curProd['WeighingMode'] == 1 ? '60%' : '50%',display:'inline-block', fontSize:14, verticalAlign:'top'}}>
                {/*<div style={{width:'63%',display:'inline-block'}}>Number of Packs</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>10</div>*/}
              </div>
              <div style={{width:this.props.curProd['WeighingMode'] == 1 ? '40%' : '50%',display:'inline-block', fontSize:14, verticalAlign:'top'}}>
                {
                 this.props.curProd['WeighingMode'] == 1 ?
                  <React.Fragment>
                    <div style={{width:'63%',display:'inline-block'}}>T1 Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>{FormatWeight(curProd['T1Lim'], weightUnits)}</div> 
                    <div style={{width:'63%',display:'inline-block'}}>T2 Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right', marginRight:'2%'}}>{FormatWeight(curProd['TolNegErrorX2'], weightUnits)}</div> 
                  </React.Fragment>
                  :
                  <React.Fragment>
                    <div style={{width:'63%',display:'inline-block', marginLeft:'2%'}}>Overweight Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right'}}>{FormatWeight(curProd['OverWeightLim'], weightUnits)}</div>
                    <div style={{width:'63%',display:'inline-block', marginLeft:'2%'}}>Underweight Limit</div><div style={{width:'35%',display:'inline-block', textAlign:'right'}}>{FormatWeight(curProd['UnderWeightLim'], weightUnits)}</div>
                  </React.Fragment>
                } 
              </div></div>
            </div>
            <CircularButton onClick={this.onAdvanced} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Advanced'}/>
         
          </div>

        </div>
        <div>
                
          
        </div>
        
      </div>)
      if(this.state.showAdvanceSettings){
        content = <div style={{width:813, display:'inline-block', background:'#e1e1e1', padding:5}}>
        <div style={{height:482}}>  <SettingsPage soc={this.props.soc} toggleGraph={this.toggleGraph} submitList={this.props.submitList} submitChange={this.props.submitChange} submitTooltip={this.props.submitTooltip} vdefMap={this.props.vdefMap} prodPage={true} getBack={this.onAdvanced} black={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={[]} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.sd} data={this.state.data} 
          onHandleClick={this.settingClick} dsp={this.props.ip} mac={this.props.mac} cob2={[this.state.cob2]} cvdf={vdefByMac[this.props.mac][4]} sendPacket={this.sendPacket} prodSettings={curProd} sysSettings={this.props.srec} dynSettings={this.props.drec} framRec={this.props.fram} level={this.props.level}/>
        </div>
          <div>
        
        </div>
        </div>
      }
    }
    
    var scrollInd = 0
    var prods = list.map(function (prd,i) {
      if(prd.no == self.state.selProd){
        scrollInd = i;
      }
      
      return <div> <ProductSelectItem advAcc={advProdEditAcc} sendPacket={self.props.sendPacket} branding={self.props.branding} name={prd.name} p={prd.no} isNull={prd.null} deleteProd={self.deleteProd} selectProd={self.selectProd} selected={(self.state.selProd == prd.no)} running={(self.props.runningProd == prd.no)}/>
         </div>
    })

    if(list.length == 0){
      prods = <div style={{textAlign:'center', width:297,padding:5}}>No Matching Products</div>
    }
    var spstr = ''
    if(this.props.runningProd){
      var rp = {}
      this.state.prodList.forEach(function(prod) {
    
        if(self.props.runningProd == prod.no){
          rp = prod 
        }

      })
      spstr = this.props.runningProd + '. '+rp.name;
    }
    var SA = (list.length > 8)

    var createNew = <div>
       <div style={{color:'#e1e1e1', fontSize:25}}><div style={{display:'inline-block'}}>Create New Product:</div>  <div  style={{float:'right', display:'inline-block',marginRight:20}}><img src='assets/help.svg' onClick={this.showProdMgmtTooltip} width={30}/></div>
      </div>
       <div style={{textAlign:'center'}}>
            <CircularButton onClick={this.copyTo} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'From Selected Product'}/>
            <CircularButton onClick={this.copyFromDef} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'From Base Product'}/>
         
            <CircularButton onClick={this.copyFromFt} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'From Factory Product'}/>
            <CircularButton onClick={this.advProdMgmt} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Product Records Management'}/>
         
         
          </div>
          <Modal ref={this.prodMgmtTooltip}>
            <div style={{color:'#e1e1e1', whiteSpace:'break-spaces'}}>
              {vdefMapV2['@tooltips']['ProductManagement'][this.props.language]}
            </div>
          </Modal>
    </div>

    var usbMsg = ''
    var usbButStyle = innerStyle;
    if(!this.props.usb){
      usbMsg = <div style={{color:'#ff0000', textAlign:'center'}}>** Plug in USB Key for import and export! **</div>
      usbButStyle.color = '#aaa'
    }

    var advProdMgmt = <div>
       <div style={{color:'#e1e1e1', fontSize:25}}>Advanced Options</div>
       {usbMsg}
          <div>
            <CircularButton onClick={this.onImport} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Import'}/>
            <CircularButton onClick={this.onExport} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Export'}/>
          </div>
          <div>
            <CircularButton onClick={this.onRestore} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Restore'}/>
            <CircularButton onClick={this.onBackup} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Backup'}/>
          </div>
          <div>
            <CircularButton onClick={this.deleteAllProducts} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={'Delete All'}/>
          </div>
    </div>

    //   <div onClick={this.copyTo} style={{display:'table-cell',height:85, borderRight:'2px solid #ccc', width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>+ Copy Current Product</div>
       
    return <div style={{width:1155}}>
      <div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:720, paddingLeft:10}}>Product</div><div style={{display:'inline-block', fontSize:20,textAlign:'right',width:400}}>{'Current Product: '+spstr }</div></div>
      <table style={{borderCollapse:'collapse'}}><tbody>
        <tr>
          <td style={{verticalAlign:'top', width:830}}>{content}<div style={{width:819, paddingTop:0}}>  
          <BatchWidget acc={(this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccStartStopBatch'])} sendPacket={this.props.sendPacket} liveWeight={this.props.liveWeight} batchRunning={this.props.drec['BatchRunning']} canStartBelts={this.props.drec['CanStartBelts']} onStart={this.props.startB} onResume={this.props.resume} pause={this.props.pause} start={this.props.start} stopB={this.props.stopB} status={this.props.statusStr} netWeight={FormatWeight(this.props.crec['PackWeight'], this.props.weightUnits)}/>
          </div></td><td style={{verticalAlign:'top',textAlign:'center'}}>
          <ScrollArrow ref={this.arrowTop} offset={72} width={72} marginTop={-40} active={SA} mode={'top'} onClick={this.scrollUp}/>
          <div style={{display:'none', background:'#e1e1e1', padding:2}}>
             <div style={{position:'relative', verticalAlign:'top', marginLeft:180}} onClick={this.toggleSearch}>
            <div style={{height:25, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{height:25, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{position:'absolute',float:'right', marginTop:-53, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:40}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>Search</div></div>
          </div>
          </div>
          <div onScroll={this.onProdScroll} id='prodListScrollBox' style={{height:490, background:'#e1e1e1',overflowY:'scroll'}}>{prods}
          </div>
          <div style={{height:85,lineHeight:'85px', background:'#e1e1e1', borderTop:'1px solid #362c66'}}>
          <div onClick={this.prodMgmt} style={{display:'table-cell',height:85, borderRight:'1px solid #362c66', width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>Product Management</div>
          
          <div onClick={this.toggleSearch} style={{display:'table-cell',height:85, borderLeft:'1px solid #362c66',width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}><img src='assets/search.svg' style={{width:40}}/><div style={{marginTop:-10, fontSize:16}}>Search</div></div>
          </div>
          <ScrollArrow ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
      
          </td>
        </tr>
      </tbody></table>
      <PromptModal branding={this.props.branding} ref={this.pmd} save={this.saveProductPassThrough} discard={this.passThrough} onClose={this.onPromptCancel}/>
      <CustomKeyboard branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.cfTo} onRequestClose={this.onRequestClose} onChange={this.copyConfirm} index={0} value={''} num={true} label={'Target Product'}/>
      
      <CopyModal ref={this.cfModal}  branding={this.props.branding}/>
      <DeleteModal ref={this.dltModal} branding={this.props.branding} deleteProd={this.deleteProdConfirm}/>
      <Modal x={true} Style={{maxWidth:1100}} innerStyle={{maxHeight:600}} ref={this.pgm} branding={this.props.branding}>
        <PackGraph packSamples={this.props.packSamples} onEdit={this.sendPacket} branding={this.props.branding} getMMdep={this.getMMdep} rec={1} acc={advProdEditAcc} language={this.props.language} crec={this.props.crec} prec={this.props.curProd} srec={this.props.srec}/>
        <PromptModal branding={this.props.branding} ref={this.pmd2} save={this.saveProductPassThrough} discard={this.passThrough} onClose={this.onPromptCancel}/>
      
      </Modal>
      <Modal x={true} Style={{width:870, marginTop:50}} ref={this.pmgmt} branding={this.props.branding}>
        {createNew}
        <Modal x={true} Style={{width:870, marginTop:50}} ref={this.apmgmt} branding={this.props.branding}>{advProdMgmt}</Modal>
      </Modal>
      <AlertModal ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{"This will end the current batch. Confirm?"}</div></AlertModal>
      <MessageModal ref={this.msgm}/>
    </div>
    //<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Select Product'} onClick={this.selectRunningProd}/>
          
  }
}
class ProductSelectItem extends React.Component{
  constructor(props){
    super(props)
    this.confModal = React.createRef();
    this.msgm = React.createRef();
    this.switchProd = this.switchProd.bind(this);
    this.deleteProd = this.deleteProd.bind(this); 
    this.advChanges = this.advChanges.bind(this);
    this.restoreDefault = this.restoreDefault.bind(this);
    this.restoreBackup = this.restoreBackup.bind(this);
    this.backupProduct = this.backupProduct.bind(this);
  }
  switchProd(){
    var self = this;
    setTimeout(function(){
      if(!self.props.isNull){
      self.props.selectProd(self.props.p)
        
      }
    },150)
  }
  deleteProd(){
    var self = this;
    setTimeout(function(){
      if(!self.props.isNull){
      self.props.deleteProd(self.props.p)
        
      }
    },150)
  }
  advChanges(){
    var self = this;
    setTimeout(function (argument) {
      // body...
      if(self.props.advAcc){
             self.confModal.current.toggle()
        
      }else{
        self.msgm.current.show('Access Denied')
      }
    },100)
    
  }
  restoreDefault(){
    var self = this;
    this.props.sendPacket('restoreDefault')
    setTimeout(function(){
      self.props.sendPacket('getProdList')
      self.switchProd();
      self.confModal.current.close();
    },1000)
  }
  restoreBackup(){
    var self = this;
    this.props.sendPacket('restoreBackup')
        setTimeout(function(){
      self.props.sendPacket('getProdList')
      self.switchProd();
      self.confModal.current.close();
    },1000)


  }
  backupProduct(){
    this.props.sendPacket('backupProduct')
    this.confModal.current.close();
  }
  render () {
    
    var check= ""
    var  del = <img style={{width:22, height:22, marginTop:20}} onClick={this.deleteProd} src="assets/trash.svg"/>
    var config = ""
    var dsW = 308;
    var stW = 208;
        var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    
    var ds = {paddingLeft:7, display:'grid',gridTemplateColumns:'22px 43px 210px 22px', width:dsW, background:"transparent"}
    var st = {paddingTop:7, paddingBottom:7,display:'inline-flex',alignItems:'center', width:stW, height:50, lineHeight:'25px',fontSize:22,borderBottom:'2px solid #bbbbbbaa', overflowWrap:'break-word'}
    var mgl = -90
    var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
    if(this.props.selected){
      ds = {paddingLeft:7,display:'grid',gridTemplateColumns:'22px 43px 210px 22px',width:dsW,   background:"#7ccc7c"}
      mgl = -160
      del = ""
      config = <img style={{width:22, height:22, marginTop:20}} onClick={this.advChanges} src="assets/config.svg"/>
    }
    if(this.props.running){
      check =  <img style={{height:22}} src="assets/Check_mark.svg"/>
      del = ""
    }
    var name = 'Product '+this.props.p
    if(this.props.name.length > 0){
      name = this.props.name
    }
    var color = '#000'
    if (this.props.isNull){
      color = '#aaa'
    }
    if(name.length > 14){
      //st.fontSize = 18
    }
    return (<div style={{background:"transparent", color:color, position:'relative', textAlign:'left'}}><div style={ds} ><div style={{display:'inline-flex', alignItems:'center', width:22}}>{check}</div><div style={{fontSize:22, verticalAlign:'top',display:'inline-block', width:40, paddingRight:3, height:65, lineHeight:'65px', textAlign:'right'}}>{this.props.p + '.  '}</div><div onClick={this.switchProd} style={st}><div style={{display:'block', width:'inherit'}}>{name}</div></div> <div style={{display:'inline-flex', width:22}}>{del}{config}</div></div>
        <Modal ref={this.confModal} Style={{color:'#e1e1e1',width:800, maxWidth:800}}>
               <div style={{textAlign:'center'}}>
               <div style={{fontSize:25, padding:10}}>Save and Restore</div>
               <CircularButton onClick={this.restoreDefault} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={'Restore selected product to factory settings'}/>
              <CircularButton onClick={this.restoreBackup} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={'Restore selected product to base product'}/>
       <CircularButton onClick={this.backupProduct} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={'Save selected product to base product'}/>
        </div>
          </Modal>
        <MessageModal ref={this.msgm}/>
      </div>)
  }
}

class ProdSettingEdit extends React.Component{
  constructor(props){
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onInput = this.onInput.bind(this);
    this.curtrnChange = this.curtrnChange.bind(this);
    this.ed = React.createRef();
    this.trnsmdl = React.createRef();
    this.state = {curtrn:this.props.label}
    this.submitChange = this.submitChange.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.translatePopup = this.translatePopup.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.msgm = React.createRef();
  }
  submitChange(){
    if(this.props.submitChange){
      this.props.submitChange(this.props.name, this.props.language, this.state.curtrn)
    }
  }
  submitTooltip(txt){
    // console.log(4467, this.props.name, this.props.language)
    this.props.submitTooltip(this.props.name, this.props.language,txt)
  }
  componentDidMount(){
    this.setState({curtrn:this.props.label})
  }
  onClick(){
    if(this.props.acc === false){
      this.msgm.current.show('Access Denied')
      //toast('Access Denied')
    }else if(typeof this.props.shortcut != 'undefined'){
      this.props.onShortcut(this.props.shortcut)
    }else if(this.props.editable){
      this.ed.current.toggle()
    }
  }    
  onInput(v){
    var self = this;
    // console.log('onInput',v)
    var val = v;
    if(val != null && val.toString() != ''){
  
      if(this.props.num){
        val = parseFloat(val)
      }
     if(this.props.param['@type'] == 'mm'){
      if(this.props.value.indexOf('in') != -1){
        val = val*10;
      }
    }else if(this.props.param['@decimal']){
      val = val*Math.pow(10,this.props.param['@decimal'])
      // console.log('3149',v,val)
    }else if(this.props.param['@type'] == 'belt_speed'){
      if(v.indexOf('.') != -1){
        val = val*10
      }
    }
       this.props.onEdit(this.props.param,val);
       if(typeof this.props.afterEdit != 'undefined'){
        setTimeout(function(){
          self.props.afterEdit();
        },1000)
       }
    }
    
  }
  onRequestClose(){

  }
  onFocus(){

  }
  curtrnChange(e){
    this.setState({curtrn:e.target.value})
  }
  translatePopup(){
    // console.log('translatePopup', this.props.trans)
    if(this.props.trans){
      this.trnsmdl.current.toggle();
    }
  }
  getMMdep(d){
    return this.props.getMMdep(d)
  }
  render(){



    var self = this;
    var ckb;
    var dispVal = this.props.value
    if(this.props.editable){
      if(this.props.param['@labels']){
        //vmapLists

        var list 
        if(vMapLists[this.props.param['@labels']]){

          list = vMapLists[this.props.param['@labels']]['english'].slice(0);
        }else{
          list = []
        }
        var lists = [list]
        ckb = <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} ovWidth={290} mobile={this.props.mobile} params={[this.props.param]} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={this.props.label} ref={this.ed} val={[this.state.value]} options={lists} onChange={this.onInput}/>
        dispVal = list[dispVal]
      }else if(this.props.listOverride){
        var lists = [this.props.ovList]
        ckb = <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} ovWidth={290} mobile={this.props.mobile} params={[this.props.param]} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={this.props.label} ref={this.ed} val={[this.state.value]} options={lists} onChange={this.onInput}/>

      }else{
        var minBool = false; 
        var min = 0;
        var maxBool = false;
        var max = 0;
        if(typeof self.props.param['@min'] != 'undefined'){
              if(!isNaN(self.props.param['@min'])){
                minBool = true;
                min = self.props.param['@min'];
              }else if(Array.isArray(self.props.param['@min'])){
               //var dep = 
                var dep = self.getMMdep(self.props.param['@min'][1])
                min = eval(self.props.param['@min'][0])(dep)
                minBool = true;
              }else{
                min = self.getMMdep(self.props.param['@min'])
                minBool = true;
              }
              if(self.props.param['@type'] == 'mm' || self.props.param['@type'] == 'float_dist'){
                if(self.getMMdep('AppUnitDist') == 0){
                  min = min/25.4
                }
              }else if(self.props.param['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  min = min/1000
                }else if(wunit == 2){
                  min = min/453.592
                }else if(wunit == 3){
                  min = min/28.3495
                }
              }
            }
            if(typeof self.props.param['@max'] != 'undefined'){
              if(!isNaN(self.props.param['@max'])){
                maxBool = true;
                max = self.props.param['@max'];
              }else if(Array.isArray(self.props.param['@max'])){
               //var dep = 
                var dep = self.getMMdep(self.props.param['@max'][1])
                max = eval(self.props.param['@max'][0])(dep)
                maxBool = true;
              }else{
                max = self.getMMdep(self.props.param['@max'])
                maxBool = true;
              }
              if(self.props.param['@type'] == 'mm'  || self.props.param['@type'] == 'float_dist'){
                if(self.getMMdep('AppUnitDist') == 0){
                  max = max/25.4
                }
              }else if(self.props.param['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  max = max/1000
                }else if(wunit == 2){
                  max = max/453.592
                }else if(wunit == 3){
                  max = max/28.3495
                }
              }
            }
            //var labVal = this.props.value
            var fDec = 0;
            if(self.props.param['@float_dec']){
              fDec = self.props.param['@float_dec']
            }
        ckb = <CustomKeyboard floatDec={fDec} sendAlert={msg => this.msgm.current.show(msg)} min={[minBool,min]} max={[maxBool,max]} preload={this.props.param['@name'] == 'ProdName'} 
                    branding={this.props.branding} ref={this.ed} language={this.props.language} tooltip={this.props.tooltip} onRequestClose={this.onRequestClose} onFocus={this.onFocus} 
                    num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label+': ' + this.props.value} submitTooltip={this.submitTooltip}/>

      }
    
    }
    var bgClr = SPARCBLUE2
    var modBG = SPARCBLUE1
    var txtClr = '#000'
    if(this.props.branding == 'FORTRESS'){
      modBG = FORTRESSPURPLE1
      bgClr = FORTRESSPURPLE2
      txtClr = '#e1e1e1'
    }

      var trnsmdl =   ''
      if(this.props.trans){
        trnsmdl = <Modal ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>Parameter Name: { this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>Current Language: {this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitChange}>Submit Translation</button>
        </Modal>
      }
       
    var titleFont = 20;
    if(this.props.w1/this.props.label.length < 10){
      titleFont = 20*this.props.w1/(10*this.props.label.length) 
    }
    return <div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative',color:txtClr, fontSize:titleFont,zIndex:1, lineHeight:this.props.h1+'px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:this.props.w1,textAlign:'center'}}>
         <ContextMenuTrigger id={this.props.name + '_ctmid'}>
        {this.props.label}   </ContextMenuTrigger>
      
      </div>
      <div onClick={this.onClick} style={{display:'inline-flex',alignItems:'center',overflowWrap:'anywhere', justifyContent:'center', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:this.props.h2/2+'px', borderRadius:15,height:this.props.h2, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:this.props.w2}}>
        {dispVal}
      </div>
      {ckb}
       <ContextMenu id={this.props.name + '_ctmid'}>
        <MenuItem onClick={this.translatePopup}>
          Translate Setting
        </MenuItem>
      </ContextMenu>
       {trnsmdl}
       <MessageModal ref={this.msgm}/>
    </div>
  }
}
class SettingsPageWSB extends React.Component{
  constructor(props){
    super(props);
    this.state = {calButtonPressed:false,sel:0, data:[], path:[],showAccounts:false, cal:false, liveWeight:0, update:true,calib:0,mot:false}
    this.setPath = this.setPath.bind(this);
    this.onHandleClick = this.onHandleClick.bind(this);
    this.backAccount = this.backAccount.bind(this);
    this.onCal = this.onCal.bind(this);
    this.onCalib = this.onCalib.bind(this);
    this.backCal = this.backCal.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.updateLiveWeight = this.updateLiveWeight.bind(this);
    this.toggleGraph = this.toggleGraph.bind(this)
    this.sendPacket = this.sendPacket.bind(this);
    this.showCalibrationSteps = this.showCalibrationSteps.bind(this);
    this.sd = React.createRef();
    this.pgm = React.createRef();
    this.msgm = React.createRef();
  }
  toggleGraph(){
    this.pgm.current.toggle();
  }
  sendPacket(n,v){
    this.props.sendPacket(n,v)
  }
  componentDidMount(){
    this.sd.current.setPath([0]);
    this.props.sendPacket("refresh_buffer",6);
  }
  componentWillReceiveProps(newProps){
    this.setState({update:true})
  }
  shouldComponentUpdate(nextProps, nextState){
    return  (nextState.update == true)
  }
  updateLiveWeight(lv){
    if(this.state.cal){
      this.setState({liveWeight:lv, update:true})
    }else{
      this.setState({liveWeight:lv, update:false})
    }
  }
  setPath(dat,i){
    if(i < 0){
      this.sd.current.setPath([])
    }else{
      this.sd.current.setPath([i])

    }
    this.setState({sel:i, showAccounts:false, cal:false, update:true,mot:false})
  }
  backAccount(){
    this.setState({showAccounts:false, update:true})
  }
  onHandleClick(dat, n){
    if(dat[0] == 'get_accounts'){
      this.setState({showAccounts:true, cal:false, update:true,mot:false})
    }else if(dat[0] == 'reboot_display'){
      toast('Restarting Display')
      this.props.soc.emit('reboot')
    }else if(dat[0] == 'format_usb'){
      //toast('Restarting Display')
      //socket.emit('reboot')
      this.sendPacket('format_usb',0)
    }else if(dat[0] == 'get_unused'){
      //toast('Restarting Display')
      //socket.emit('reboot')
      this.props.openUnused();
    }else{
      if(typeof this.props.onHandleClick != 'undefined'){
          this.props.onHandleClick(dat,n)
      }
    
    }
  }
  onCal(){
    this.setState({mot:false,cal:true,sel:-2, showAccounts:false, update:true})
  }
  backCal(){
    this.setState({cal:false, update:true})
  }
  getMMdep(d){
    if(d == 'MaxBeltSpeed'){
      d = 'MaxBeltSpeed0'
    }
     var res = vdefByMac[this.props.mac];
      var pVdef = _pVdef;
      var dec = 0;
      var self = this;
      if(res){
        pVdef = res[1];
      }
      if(typeof pVdef[0][d] != 'undefined'){
        return this.props.sysSettings[d]
      }else if(typeof pVdef[1][d] != 'undefined'){
        return this.props.prodSettings[d]
      }else if(typeof pVdef[2][d] != 'undefined'){
        return this.props.dynSettings[d]
      }
    // getMMdep={this.getMMdep} return this.props.getMMdep(v)
  }
  onCalib(str){
    if((this.props.sysSettings['PassOn'] == 0)||(this.props.level >= this.props.sysSettings['PassAccCalMenu'])){
      if((this.props.dynSettings['BatchRunning'] == 0))
      {
        this.props.onCal()
        this.setState({calButtonPressed:true})
      }else{
        this.msgm.current.show('Batch needs to be ended');
      }
    }else{
      this.msgm.current.show('Access Denied');
    }
  }
  showCalibrationSteps(){
    var calStr = '';
        if(this.props.calibState == 1){
          calStr = 'Taring..'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 2){
          calStr = 'Place calibration weight on weight conveyor and press Calibrate.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 3){
          calStr = 'Calibrating..'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 4){
          calStr = 'Remove weight and press Calibrate to tare.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 5){
          calStr = 'Taring..'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 6){
          calStr = 'Calibration Successful.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 7){
          calStr = 'Calibration Failed.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 8){
          calStr = 'Place calibration weight on position 1 and press Calibrate.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 9){
          calStr = 'Calibrating loadcell 1..'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 10){
          calStr = 'Place calibration weight on position 2 and press Calibrate.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 11){
          calStr = 'Calibrating loadcell 2..'
          this.msgm.current.show(calStr);
        }else if(this.props.calibState == 12){
          calStr = 'Place calibration weight on position 3 and press Calibrate.'
          this.msgm.current.show(calStr);
          this.setState({calButtonPressed:false})
        }else if(this.props.calibState == 13){
          calStr = 'Calibrating loadcell 3..'
          this.msgm.current.show(calStr);
        }else if(this.props.calibState == 14){
          calStr = 'Calibration cancelled.'
          this.msgm.current.show(calStr);
        }
  }
  render(){
    var self = this;
    var weightUnits = this.props.sysSettings['WeightUnits'];

    var calStr = 'Press calibrate to start calibration. \n Ensure weight conveyor is empty before starting.'

    if(this.props.calibState == 1){
      calStr = 'Taring..'
    }else if(this.props.calibState == 2){
      calStr = 'Place calibration weight on weight conveyor and press Calibrate.'
    }else if(this.props.calibState == 3){
      calStr = 'Calibrating..'
    }else if(this.props.calibState == 4){
      calStr = 'Remove weight and press Calibrate to tare.'
    }else if(this.props.calibState == 5){
      calStr = 'Taring..'
    }else if(this.props.calibState == 6){
      calStr = 'Calibration Successful.'
    }else if(this.props.calibState == 7){
      calStr = 'Calibration Failed.'
    }else if(this.props.calibState == 8){
      calStr = 'Place calibration weight on position 1 and press Calibrate.'
    }else if(this.props.calibState == 9){
      calStr = 'Calibrating loadcell 1..'
    }else if(this.props.calibState == 10){
      calStr = 'Place calibration weight on position 2 and press Calibrate.'
    }else if(this.props.calibState == 11){
      calStr = 'Calibrating loadcell 2..'
    }else if(this.props.calibState == 12){
      calStr = 'Place calibration weight on position 3 and press Calibrate.'
    }else if(this.props.calibState == 13){
      calStr = 'Calibrating loadcell 3..'
    }else if(this.props.calibState == 14){
      calStr = 'Calibration cancelled.'
    }

    //if(this.state.calButtonPressed){this.showCalibrationSteps();}
    var calAcc = (this.props.sysSettings['PassOn'] == 0) || (this.props.level >= this.props.sysSettings['PassAccCalMenu']);

    var cats = []
    this.props.cvdf[0].params.forEach(function (c,i) {
      if(c.type == 1){
        cats.push(<div><CatSelectItem language={self.props.language} branding={self.props.branding} data={c} selected={self.state.sel == i} ind={i} onClick={self.setPath}/></div>)
      }
    })
    //<CatSelectItem language={self.props.language} branding={self.props.branding} data={{val:{cat:'Calibrate'}}} selected={this.state.cal} ind={-2} onClick={this.onCal} />
    cats.push(<div><CatSelectItem language={self.props.language} branding={self.props.branding} data={{val:{cat:'Calibrate'}}} selected={this.state.cal} ind={-2} onClick={this.onCal} /></div>)
   
    var cob;
    if(this.state.sel == -1){
      cob = this.props.cob2
    }
    var sd =<React.Fragment><div > <SettingsPage soc={this.props.soc} timezones={this.props.timezones} timeZone={this.props.timeZone} dst={this.props.dst} toggleGraph={this.toggleGraph} openUnused={this.props.openUnused} submitList={this.props.submitList} submitChange={this.props.submitChange}  submitTooltip={this.props.submitTooltip} vdefMap={this.props.vdefMap} setTrans={this.props.setTrans} setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} 
      int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = {this.sd} data={this.state.data} 
          onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={this.props.level}/>
      </div>
      <div style={{display:'none'}}> <AccountControl soc={this.props.soc} goBack={this.backAccount} mobile={false} level={this.props.level} accounts={this.props.accounts} ip={this.props.dsp} language={this.props.language} branding={this.props.branding} val={this.props.level}/>
      </div></React.Fragment>
    if(this.state.showAccounts){
      sd = <React.Fragment><div style={{display:'none'}}> <SettingsPage soc={this.props.soc} submitList={this.props.submitList} submitChange={this.props.submitChange} submitTooltip={this.props.submitTooltip}   vdefMap={this.props.vdefMap}  setTrans={this.props.setTrans} setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = {this.sd} data={this.state.data} 
          onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
      </div>
      <div> <AccountControl soc={this.props.soc} goBack={this.backAccount} mobile={false} level={this.props.level} accounts={this.props.accounts} ip={this.props.dsp} language={this.props.language} branding={this.props.branding} val={this.props.level}/>
      </div></React.Fragment>
    }else if(this.state.cal){
      var calBut = <div style={{textAlign:'center'}}><CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.onCalib} lab={'Calibrate'}/>
          </div>
          
    if((this.props.calibState != 0) && (this.props.calibState != 7) && (this.props.dynSettings['BatchRunning'] == 0)){
      calBut = <div style={{textAlign:'center'}}><CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.onCalib} lab={'Calibrate'}/>
                    <CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.props.onCalCancel} lab={'Cancel'}/>
          </div>
          
    }
    var calStuff = (  <div style={{background:'#e1e1e1', padding:10}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Calibrate'}</div></h2></span>
          
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LiveWeight'} vMap={vMapV2['LiveWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200}  label={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.state.liveWeight, weightUnits)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LiveWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTime'} vMap={vMapV2['LastCalTime']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['LastCalTime']['@translations'][this.props.language]['name']} value={this.props.sysSettings['LastCalTimeStr']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTime']} num={true}/></div>
          
          </div>
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'RawWeight'} vMap={vMapV2['RawWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['RawWeight']['@translations'][this.props.language]['name']} value={this.props.dynSettings['RawWeight']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['RawWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTare'} vMap={vMapV2['LastCalTare']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['LastCalTare']['@translations'][this.props.language]['name']} value={this.props.sysSettings['LastCalTare'].toFixed(1)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTare']} num={true}/></div>
          </div>
          <div style={{marginTop:5}}><ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalWeight'} vMap={vMapV2['CalWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.props.sysSettings['CalWeight'], weightUnits)} editable={true} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][1][0]['CalWeight']} num={true}  submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalWeight']['@translations'][this.props.language]['description']}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalDur'} vMap={vMapV2['CalDur']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalDur']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalDur']+'ms'} param={vdefByMac[this.props.mac][1][0]['CalDur']} editable={true} onEdit={this.props.sendPacket} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalDur']['@translations'][this.props.language]['description']}/></div>
          <div style={{marginTop:44, fontSize:24, textAlign:'center'}}>{calStr}</div>
          {calBut}
          </div>)
      if(this.props.sysSettings['CheckWeigherType'] == 1){
        calStuff =  <div style={{background:'#e1e1e1', padding:10}}>
        <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Calibrate'}</div></h2></span>
          
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LiveWeight'} vMap={vMapV2['LiveWeight']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200}  label={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.state.liveWeight, weightUnits)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LiveWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTime'} vMap={vMapV2['LastCalTime']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['LastCalTime']['@translations'][this.props.language]['name']} value={this.props.sysSettings['LastCalTimeStr']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTime']} num={true}/></div>
          
          </div>
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'RawWeight'} vMap={vMapV2['RawWeight']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['RawWeight']['@translations'][this.props.language]['name'] + ' 1'} value={this.props.dynSettings['RawWeight']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['RawWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTare'} vMap={vMapV2['LastCalTare']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['LastCalTare']['@translations'][this.props.language]['name'] + ' 1'} value={this.props.sysSettings['LastCalTare'].toFixed(1)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTare']} num={true}/></div>
          </div>
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'RawWeight2'} vMap={vMapV2['RawWeight2']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['RawWeight2']['@translations'][this.props.language]['name']} value={this.props.dynSettings['RawWeight2']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['RawWeight2']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTare2'} vMap={vMapV2['LastCalTare']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['LastCalTare']['@translations'][this.props.language]['name'] + ' 2'} value={this.props.sysSettings['LastCalTare2'].toFixed(1)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTare2']} num={true}/></div>
          </div>
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'RawWeight3'} vMap={vMapV2['RawWeight']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['RawWeight3']['@translations'][this.props.language]['name']} value={this.props.dynSettings['RawWeight3']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['RawWeight3']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTare3'} vMap={vMapV2['LastCalTare']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['LastCalTare']['@translations'][this.props.language]['name'] + ' 3'} value={this.props.sysSettings['LastCalTare3'].toFixed(1)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTare3']} num={true}/></div>
          </div>
          
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}>
          <ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalWeight'} vMap={vMapV2['CalWeight']} language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['CalWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.props.sysSettings['CalWeight'], weightUnits)} editable={true} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][1][0]['CalWeight']} num={true}  submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalWeight']['@translations'][this.props.language]['description']}/>
          </div>
          <div style={{display:'inline-block', width:395}}>
          <ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalDur'} vMap={vMapV2['CalDur']}  language={this.props.language} branding={this.props.branding} h1={36} w1={180} h2={47} w2={200} label={vMapV2['CalDur']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalDur']+'ms'} param={vdefByMac[this.props.mac][1][0]['CalDur']} editable={true} onEdit={this.props.sendPacket} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalDur']['@translations'][this.props.language]['description']}/>
          </div>
        </div>
          
          <div style={{marginTop:0, fontSize:24, textAlign:'center'}}>{calStr}</div>
          {calBut}
          </div>
      }

     sd = <React.Fragment><div style={{display:'none'}}> <SettingsPage soc={this.props.soc} submitList={this.props.submitList} submitChange={this.props.submitChange} submitTooltip={this.props.submitTooltip}   vdefMap={this.props.vdefMap} setTrans={this.props.setTrans} setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref={this.sd} data={this.state.data} 
          onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
      </div>
      <div>
      {calStuff}
      </div></React.Fragment>
    }else if(this.state.mot){
      sd = <React.Fragment>
        <div style={{display:'none'}}> <SettingsPage soc={this.props.soc} submitList={this.props.submitList} submitChange={this.props.submitChange} submitTooltip={this.props.submitTooltip}  vdefMap={this.props.vdefMap} setTrans={this.props.setTrans} setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = 'sd' data={this.state.data} 
          onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
      </div>

      <div>
        <div style={{background:'#e1e1e1', padding:10}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Motor Control'}</div></h2></span>
          
        <div style={{marginTop:5}}>
          <MotorControl motors={[{name:'Infeed Belt'},{name:'Weigh Table Belt'},{name:'Reject Belt'},{name:'Exit Belt'}]}/>
        </div>

         </div>

         </div>
      </React.Fragment>
    }

    return <div>
      <table style={{borderCollapse:'collapse', verticalAlign:'top'}}><tbody><tr style={{verticalAlign:'top'}}><td style={{paddingBottom:0,paddingRight:8}}> <div style={{ height:525, background:'#e1e1e1', paddingBottom:10}}>{cats}</div></td><td style={{width:813, height:525,padding:5, background:'#e1e1e1'}}>{sd}</td></tr></tbody></table>
     <Modal x={true} Style={{maxWidth:1100}} innerStyle={{maxHeight:600}} ref={this.pgm} branding={this.props.branding}>
        <PackGraph packSamples={this.props.packSamples} onEdit={this.props.sendPacket} branding={this.props.branding} getMMdep={this.getMMdep} rec={0} acc={(this.props.sysSettings['PassOn'] == 0) || (this.props.level >= this.props.sysSettings['PassAccAdvSys'])} language={this.props.language} crec={this.props.crec} prec={this.props.prodSettings} srec={this.props.sysSettings}/>
       </Modal>
      <MessageModal ref={this.msgm}/>
    </div>
  }
}
class CatSelectItem extends React.Component{
  constructor(props){
    super(props)
    this.onClick = this.onClick.bind(this);
  }
  onClick(){
    console.log("Data props ",this.props.data);
    console.log("props ind ",this.props.ind);
    this.props.onClick(this.props.data, this.props.ind)
  }
  render () {
    
    var check= ""
    var dsW = 300;
    var stW = 227;
    var ds = {paddingLeft:7,paddingRight:7, display:'inline-block', width:dsW, background:"transparent"}
    var st = {padding:7,display:'inline-block', width:stW, height:50, lineHeight:'50px',fontSize:22,borderBottom:'2px solid #bbbbbbaa'}
    var mgl = -90
    var buttons;
    var selBG = SPARCBLUE2

    if(this.props.branding == 'FORTRESS'){
      selBG = FORTRESSPURPLE2
    }
    if(this.props.selected){
      check = <img src="assets/Check_mark.svg"/>
      ds = {paddingLeft:7,paddingRight:7,display:'inline-block', width:dsW,  background:selBG}
      mgl = -160
      if(this.props.branding == 'FORTRESS'){
        st.color = '#e1e1e1'
      }
    }
    var catSt = this.props.data.val.cat
    if(vdefMapV2['@catmap'][catSt]){
     catSt =  vdefMapV2['@catmap'][catSt]['@translations'][this.props.language]
    }

    return (<div style={{background:"transparent", color:"#000", position:'relative', textAlign:'center'}}><div style={ds} ><label onClick={this.onClick} style={st}>{catSt}</label></div>
      </div>)
  }
}
class SettingsPage extends React.Component{
  constructor(props) {
    super(props)

    this.state = ({
     sysRec:this.props.sysSettings,curtrn:'Settings', prodRec:this.props.prodSettings, dynRec:this.props.dynSettings,font:2, data:this.props.data, cob2:this.props.cob2, framRec:this.props.framRec,path:[]
    });
    this.handleItemclick = this.handleItemclick.bind(this);
    this.scrollUp = this.scrollUp.bind(this);
    this.scrollDown = this.scrollDown.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.sendPacket = this.sendPacket.bind(this);
    this.parseInfo = this.parseInfo.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onRequestClose = this.onRequestClose.bind(this);
    this.goBack = this.goBack.bind(this);
    this.getBack = this.getBack.bind(this);
    this.arrowTop = React.createRef();
    this.arrowBot = React.createRef();
    this.submitChange = this.submitChange.bind(this)
    this.submitList = this.submitList.bind(this);
    this.trnsmdl = React.createRef();
    this.translatePopup = this.translatePopup.bind(this);
    this.curtrnChange = this.curtrnChange.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.openUnused = this.openUnused.bind(this);
    this.goToShortcut = this.goToShortcut.bind(this);
    this.formatUSB = this.formatUSB.bind(this);
    this.update = this.update.bind(this);
  }
  update(){
    // console.log('update CW Clicked')
    this.props.soc.emit('updateCW')
  }
  goToShortcut(path){
    this.setState({path:path})
  }
  submitChange(n,l,v){
    this.props.submitChange(n,l,v)
  }
  submitTooltip(n,l,v){
    this.props.submitTooltip(n,l,v)
  }
  submitList(n,l,v){
    this.props.submitList(n,l,v)
  }
  componentWillUnmount(){

  }
  openUnused(){
    this.props.openUnused()
  }
  componentWillReceiveProps(newProps){

      var data = [];
      //  var path = [];
      var lab = vdefMapV2['@labels']['Settings'][this.props.language]['name']
      if(this.props.data[0] == 'get_accounts'){
        data = this.props.data
      }else{
        data.push([this.props.cob2[0],0])
        if(typeof this.props.cob2[0].params != 'undefined'){
          var _par = this.state.cob2[0].params.slice(0);
            this.state.path.forEach(function (x,i) {
           // console.log(x)
            data.push([_par[x]['@data'],x])
            _par = _par[x]['@data'].params.slice(0);
            // body...
          })  
        }
   
      }
      var label =vdefMapV2['@labels']['Settings'][newProps.language]['name']
      var lvl = data.length;

      if(lvl > 0){

      var cat = data[lvl - 1 ][0].cat;
      var pathString = ''
      lab = cat//catMap[cat]['@translations']['english']
      if(lvl == 1){
          
          if(this.props.mode == 'config'){
            label = vdefMapV2['@labels']['Settings'][newProps.language]['name']
            pathString = ''
          }else{
            label = catMapV2[data[0][0].cat]['@translations'][newProps.language]
            pathString = data[0][0].cat
          }
        }else if(lvl == 2){
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][newProps.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')

            label = catMapV2[pathString]['@translations'][newProps.language];
          }
          
      
        }else{
          var bblab = ''
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            //////console.log(pathString)
            label = catMapV2[pathString]['@translations'][newProps.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][newProps.language];
          }
        }
      }
      this.setState({data:newProps.data, cob2:newProps.cob2, sysRec:newProps.sysSettings, prodRec:newProps.prodSettings, dynRec:newProps.dynSettings, framRec:newProps.framRec})
  }
  handleItemclick(dat, n){    
    //console.log(dat,n,1763)
         var data = [];
     var lab = vdefMapV2['@labels']['Settings'][this.props.language]['name']
      //  var path = [];
      if(this.props.data[0] == 'get_accounts'){
        data = this.props.data
      }else{
        data.push([this.props.cob2[0],0])
        if(typeof this.props.cob2[0].params != 'undefined'){
          var _par = this.state.cob2[0].params.slice(0);
            this.state.path.forEach(function (x,i) {
           // console.log(x)
            data.push([_par[x]['@data'],x])
            _par = _par[x]['@data'].params.slice(0);
            // body...
          })  
        }
   
      }
      var label =vdefMapV2['@labels']['Settings'][this.props.language]['name']
      var lvl = data.length;

      if(lvl > 0){

      var cat = data[lvl - 1 ][0].cat;
      var pathString = ''
      lab = cat//catMap[cat]['@translations']['english']
      if(lvl == 1){
          
          if(this.props.mode == 'config'){
            label = vdefMapV2['@labels']['Settings'][this.props.language]['name']
            pathString = ''
          }else{
            label = catMapV2[data[0][0].cat]['@translations'][this.props.language]
            pathString = data[0][0].cat
          }
        }else if(lvl == 2){
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][this.props.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')

            label = catMapV2[pathString]['@translations'][this.props.language];
          }
          
      
        }else{
          var bblab = ''
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            //////console.log(pathString)
            label = catMapV2[pathString]['@translations'][this.props.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][this.props.language];
          }
        }
      }
    if(dat[0] == 'get_accounts'){
      this.props.onHandleClick(dat,n)
    }else{
    var self = this;
    var path = this.state.path;
    path.push(dat[1])
    setTimeout(function(){
      document.getElementById(self.props.Id).scrollTop = 0;
      self.setState({path:path, curtrn:label})
      if(typeof self.props.onHandleClick != 'undefined'){
          self.props.onHandleClick(dat,n)
      }
      //self.props.onHandleClick(dat, n);

    },250)
  }

  }
  setPath(path){
     var data = [];
     var lab = vdefMapV2['@labels']['Settings'][this.props.language]['name']
      //  var path = [];
      if(this.props.data[0] == 'get_accounts'){
        data = this.props.data
      }else{
        data.push([this.props.cob2[0],0])
        if(typeof this.props.cob2[0].params != 'undefined'){
          var _par = this.state.cob2[0].params.slice(0);
            this.state.path.forEach(function (x,i) {
           // console.log(x)
            data.push([_par[x]['@data'],x])
            _par = _par[x]['@data'].params.slice(0);
            // body...
          })  
        }
   
      }
      var label =vdefMapV2['@labels']['Settings'][this.props.language]['name']
      var lvl = data.length;

      if(lvl > 0){

      var cat = data[lvl - 1 ][0].cat;
      var pathString = ''
      lab = cat//catMap[cat]['@translations']['english']
      if(lvl == 1){
          
          if(this.props.mode == 'config'){
            label = vdefMapV2['@labels']['Settings'][this.props.language]['name']
            pathString = ''
          }else{
            label = catMapV2[data[0][0].cat]['@translations'][this.props.language]
            pathString = data[0][0].cat
          }
        }else if(lvl == 2){
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][this.props.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')

            label = catMapV2[pathString]['@translations'][this.props.language];
          }
          
      
        }else{
          var bblab = ''
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            //////console.log(pathString)
            label = catMapV2[pathString]['@translations'][this.props.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][this.props.language];
          }
        }
      }
    document.getElementById(this.props.Id).scrollTop = 0;
    this.setState({path:path,curtrn:label})
  }
  parseInfo(sys, prd){
    if((typeof sys != 'undefined') && (typeof prd != 'undefined')){
      if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
        this.setState({sysRec:sys, prodRec:prd})
      }
    }
  }
  componentDidMount() {
    this.props.sendPacket('refresh',0);
    //window.addEventListener('scroll', this.handleScroll)
  }
  curtrnChange(e){
    this.setState({curtrn:e.target.value})
  }
  submitCatChange(){
    //this.props.submitCatChange()
  }
  handleScroll(ev) {
    // body...
    //////////console.log(ev.srcElement.body)
    var lvl = this.props.data.length
    var len = 0;
    if(lvl > 0){
      len = this.props.data[lvl - 1 ][0].params.length
    }
    //  ////////console.log(document.getElementById(this.props.Id).scrollTop)
     var el = document.getElementById(this.props.Id)   
       if(el){
      if(el.scrollTop > 5){
        this.arrowTop.current.show();
      }else{
        this.arrowTop.current.hide();
      }
      if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
        this.arrowBot.current.show();
      }else{
        this.arrowBot.current.hide();
      }
    }

  }
  scrollUp() {
    _scrollById(this.props.Id,-260,300);
  }
  scrollDown() {
    _scrollById(this.props.Id,260,300);
  }
  sendPacket(n,v) {
    var self = this;
    var vdef = vdefByMac[this.props.mac]
    // console.log([n,v])
    if(n == 'format_usb'){

      this.props.soc.emit('sendReboot')
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_FORMATUSB']
            var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],rpc[2]);
      this.props.soc.emit('rpc',{ip:this.props.dsp, data:packet}) 
 
    }else if(n == 'vfdChange'){
      // console.log('vfdChange')
      var packet = dsp_rpc_paylod_for(v['@rpcs']['changevfdwrite'][0], v['@rpcs']['changevfdwrite'][1],v['@rpcs']['changevfdwrite'][2]);
       this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n=='DateTime'){
        var rpc = vdef[0]['@rpc_map']['KAPI_RPC_DATETIMEWRITE']
  
        var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],v);
      this.props.soc.emit('rpc',{ip:this.props.dsp, data:packet})
      //  console.log('DATE TIME SENT', this.props.dsp) 
    }else if(n=='DaylightSavings'){
        var rpc = vdef[0]['@rpc_map']['KAPI_DAYLIGHT_SAVINGS_WRITE']
  
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc',{ip:this.props.dsp, data:packet}) 
      }else if(n=='Timezone'){
        var rpc = vdef[0]['@rpc_map']['KAPI_TIMEZONE_WRITE']
  
      var pkt = rpc[1].map(function (r) {
        if(!isNaN(r)){
          return r
        }else{
          if(isNaN(v)){
            return 0
          }else{
            return parseInt(v)
          }
        }
      })
      var packet = dsp_rpc_paylod_for(rpc[0],pkt);
      this.props.soc.emit('rpc',{ip:this.props.dsp, data:packet}) 
      }else if(n['@rpcs']['vfdstart']){
    if(v == 1){
     // n['@rpcs']['vfdstart'][0]
    //  console.log('vfdstart')
      var packet = dsp_rpc_paylod_for(n['@rpcs']['vfdstart'][0], n['@rpcs']['vfdstart'][1],n['@rpcs']['vfdstart'][2]);
        this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else{
      // console.log('vfdstop')
       var packet = dsp_rpc_paylod_for(n['@rpcs']['vfdstop'][0], n['@rpcs']['vfdstop'][1],n['@rpcs']['vfdstop'][2]);
        this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})

    }

   }else if(n['@rpcs']['vfdwrite']){
      var arg1 = n['@rpcs']['vfdwrite'][0];
      var arg2 = [];
      var ind = n['@rpcs']['vfdwrite'][2][0];
      var strArg = null;
      
      for(var i = 0; i<n['@rpcs']['vfdwrite'][1].length;i++){
        if(!isNaN(n['@rpcs']['vfdwrite'][1][i])){
          arg2.push(n['@rpcs']['vfdwrite'][1][i])
        }else if(n['@rpcs']['vfdwrite'][1][i] == n['@name']){
          if(!isNaN(v)){
            arg2.push(v)
          }else{
            strArg=v
            
          }
        }
       
    }
     var buf = Buffer.alloc(5)
        buf.writeUInt8(ind,0)
        if((n['@type'] == 'float')||(n['@type'] == 'weight')||(n['@type'] == 'float_dist')||(n['@type'] == 'belt_speed')||(n['@type'] == 'fdbk_rate')){
          buf.writeFloatLE(parseFloat(v),1)
        }else{
          buf.writeUInt32LE(parseInt(v),1);
        }
        
        var packet = dsp_rpc_paylod_for(arg1, arg2,buf);
        this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n['@rpcs']['toggle']){

      var arg1 = n['@rpcs']['toggle'][0];
      var arg2 = [];
      for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
        if(!isNaN(n['@rpcs']['toggle'][1][i])){
          arg2.push(n['@rpcs']['toggle'][1][i])
        }else{
          arg2.push(v)
        }
      }
      var packet = dsp_rpc_paylod_for(arg1, arg2);
      
      this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n['@rpcs']['apiwrite']){
      var arg1 = n['@rpcs']['apiwrite'][0];
      var arg2 = [];
      var strArg = null;
      
      for(var i = 0; i<n['@rpcs']['apiwrite'][1].length;i++){
        if(!isNaN(n['@rpcs']['apiwrite'][1][i])){
          arg2.push(n['@rpcs']['apiwrite'][1][i])
        }else if(n['@rpcs']['apiwrite'][1][i] == n['@name']){
          if(!isNaN(v)){
            arg2.push(v)
          }else{
            strArg=v
            
          }
        }
      }
      if(n['@type'] == 'int32'){
        var buf = Buffer.alloc(4)
        buf.writeUInt32LE(parseInt(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'weight'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float_dist'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'belt_speed'){
        // console.log('change belt speed')
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }
        // console.log(strArg, n, 2154)
      var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
        
      this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n['@rpcs']['write']){
      var arg1 = n['@rpcs']['write'][0];
      var arg2 = [];
      var strArg = null;
      var flag = false
        ////console.log('2281',v, n['@rpcs']['write'][1], n["@name"])
      for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
        if(!isNaN(n['@rpcs']['write'][1][i])){
          ////console.log('where')
          arg2.push(n['@rpcs']['write'][1][i])
        }else if(n['@rpcs']['write'][1][i] == n['@name']){
          ////console.log('the')
          if(!isNaN(v)){
            arg2.push(v)
          }
          else{
            arg2.push(0)
            strArg=v
          }
          flag = true;
        }else{
          ////console.log('fuck')
          var dep = n['@rpcs']['write'][1][i]
          if(dep.charAt(0) == '%'){

          }
        }
      }
      if(n['@rpcs']['write'][2]){
        if(Array.isArray(n['@rpcs']['write'][2])){
          strArg = n['@rpcs']['write'][2]
        }
        else if(typeof n['@rpcs']['write'][2] == 'string'){
          strArg = v
        }
        flag = true;
      }
      if(!flag){
        strArg = v;
      }
      if(n['@type'] == 'int32'){
        var buf = Buffer.alloc(4)
        buf.writeUInt32LE(parseInt(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
        console.log("alert strArg "+strArg);
      }else if(n['@type'] == 'weight'){
        // console.log('should get here', 'sendPacket', v)
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'float_dist'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'belt_speed'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }else if(n['@type'] == 'fdbk_rate'){
        var buf = Buffer.alloc(4)
        buf.writeFloatLE(parseFloat(v),0)
        strArg = buf;
      }
      var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
      //var packet = dsp_rpc_paylod_for(21, [6,17,0],null);
        // console.log(strArg, packet, n, 2154)
      this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n['@rpcs']['clear']){
      var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
        
      this.props.soc.emit('rpc', {ip:this.props.dsp, data:packet})
    }else if(n['@rpcs']['theme']){
      this.props.setTheme(v)
    }else if(n['@rpcs']['customstrn']){
      this.props.setTrans(v)
    }
  }
  onFocus() {
      //this.props.setOverride(true)
  }
  onRequestClose() {
    // body...
    var self = this;
      setTimeout(function () {
        // body...
        //self.props.setOverride(false)
      },100)
      
  }
  goBack(){
     var path = this.state.path.slice(0);
      if(path.length > 0){
          path.pop();
          this.setState({path:path})
          //this.props.goBack();
      }
      ////console.log(this.props.data)
  }
  getBack(){
    this.props.getBack();
  }
  reboot(){
    this.props.soc.emit('reboot')
  }
  formatUSB(){
    this.sendPacket('format_usb',0)
  }
  translatePopup(){
    this.trnsmdl.current.toggle();
  }
  render(){
    var self = this;
      var isInt = this.props.int
    var data = [];

      if(this.props.data[0] == 'get_accounts'){
        data = this.props.data
      }else{
        data.push([this.state.cob2[0],0])
        if(typeof this.state.cob2[0].params != 'undefined'){
          var _par = this.state.cob2[0].params.slice(0);
            this.state.path.forEach(function (x,i) {
           // console.log(x)
            data.push([_par[x]['@data'],x])
            _par = _par[x]['@data'].params.slice(0);
            // body...
          })  
        }
   
      }
      var titleColor = '#eee'
      if(this.props.black){
        titleColor = '#000'
      }
      var maxHeight = 419;
      if(this.props.wsb){
        maxHeight = 462;
      }
    var lvl = data.length 
    var handler = this.handleItemclick;
    var lab = vdefMapV2['@labels']['Settings'][this.props.language]['name']
    var cvdf = this.props.cvdf
    ////////////console.log(lvl)
    var label =vdefMapV2['@labels']['Settings'][this.props.language]['name']

    var nodes;
    var ft = 25;
    if(this.state.font == 1){
      ft = 20
    }else if(this.state.font == 0){
      ft = 18
    }
    var backText = vdefMapV2['@labels']['Back'][this.props.language].name
    if(this.props.mobile){
      backText = ''
    }
    var nav =''
    var backBut = ''
    var packGraph = false;
    var grphBut = ''
    var catList = [ ]
    var lenOffset = 0;
    var accLevel = 0;
    var len = 0;
    var SA = false;

    if(lvl == 0){
      nodes = [];
      for(var i = 0; i < catList.length; i++){
        var ct = catList[i]
        nodes.push(<SettingItem3 soc={this.props.soc} submitList={this.submitList} submitTooltip={this.submitTooltip} submitChange={this.submitChange} vMap={vMapV2} branding={this.props.branding} ioBits={this.props.ioBits} int={isInt} mobile={this.props.mobile} mac={this.props.mac} 
          language={self.props.language}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} 
          font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} 
          sysSettings={this.state.sysRec} prodSettings={this.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
        
      }
      len = catList.length;
      nav = nodes;
    }else{

      var cat = data[lvl - 1 ][0].cat;
      if(data[lvl-1][0].packGraph){
     //console.log(5143,data[lvl-1])
      grphBut = <img src='assets/graph.svg' style={{position:'absolute', width:30, left:780}} onClick={this.props.toggleGraph}/>
    }
      var pathString = ''
      lab = cat//catMap[cat]['@translations']['english']
      if(lvl == 1){
          
          if(this.props.mode == 'config'){
            label = vdefMapV2['@labels']['Settings'][this.props.language]['name']
            pathString = ''
          }else{
            label = catMapV2[data[0][0].cat]['@translations'][this.props.language]
            pathString = data[0][0].cat
          }
          if(this.props.prodPage == true){
            backBut = (<div className='bbut' onClick={this.getBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
            <label style={{color:titleColor, fontSize:ft}}>{backText}</label></div>)
  
          }
          //catMap[data[0]]['@translations']['english']
        }else if(lvl == 2){
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            //console.log(pathString)
            label = catMapV2[pathString]['@translations'][this.props.language];
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')

            label = catMapV2[pathString]['@translations'][this.props.language];
          }
          if(this.props.wsb != true){
          backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
            <label style={{color:titleColor, fontSize:ft}}>{backText}</label></div>)
          }
      
        }else{
          var bblab = ''
          if(this.props.mode == 'config'){
            pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
            //////console.log(pathString)
            label = catMapV2[pathString]['@translations'][this.props.language];
            bblab = catMapV2[data.slice(1,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
          }else{
            pathString = data.map(function (d) {return d[0].cat}).join('/')
            label = catMapV2[pathString]['@translations'][this.props.language];
            bblab = catMapV2[data.slice(0,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations'][this.props.language]; 
          }
          backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
            <label style={{color:'titleColor', fontSize:ft}}>{backText}</label></div>)
      }
      
      nodes = []
      data[lvl - 1 ][0].params.forEach(function (par,i) {
        
        if(par.type == 0){
                var p = par
                var pname = par['@name']

              if(!self.props.int){
                 if(pname.slice(-4) == '_INT'){
                  pname = pname.slice(0,-4)
                 }
              }

          var ind = 0;
          var prms = self.props.cob2[ind].params;
          
          while(ind < lvl - 1){
            ind = ind + 1
            prms = prms[data[ind][1]]['@data'].params
          }
          var d = prms[i]
            var ch = d['@children'].slice(0)

                if(d['@interceptor'] || d['@test'] || d['@halo'] || d['@input'] || d['@combo']){
                  ch.unshift(d['@data'])
                }
              var acc = false;
              var passAcc = false;
          if((self.props.level > 3) || (p.acc <= self.props.level) || (self.state.sysRec['PassOn'] == 0)){
            acc = true;
          }
          if((self.props.level>4) || (p.passAcc <= self.props.level) || (self.state.sysRec['PassOn'] == 0)){
            passAcc = true;
          }
          if(par.dt){
            
            nodes.push(<SettingItem3 soc={self.props.soc} timezones={self.props.timezones} timeZone={self.props.timeZone} dst={self.props.dst} dt={true} submitList={self.submitList} submitTooltip={self.submitTooltip} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
            ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
              children={[vdefByMac[self.props.mac][5][pname].children,ch]} hasChild={false} data={d} onItemClick={handler} passAcc={passAcc} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
       
           }else{
          //console.log(2158, isInt)
          nodes.push(<SettingItem3 soc={self.props.soc} submitList={self.submitList} submitTooltip={self.submitTooltip} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
            ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
              children={[vdefByMac[self.props.mac][5][pname].children,ch]} hasChild={false} data={d} onItemClick={handler} passAcc={passAcc} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
         }
        }else if(par.type == 1){
          var sc = par['@data']
          //console.log('check this too',par)
          
                var acc = false;
          if((self.props.level > 3) || (par.acc <= self.props.level)  || (self.state.sysRec['PassOn'] == 0)){
            acc = true;
          }
          if(typeof sc['child'] != 'undefined'){
            var spar = sc.params[sc.child]
                  var ch = spar['@children'].slice(0)
                  if(spar['@interceptor'] || spar['@test'] || spar['@halo'] || spar['@input'] || spar['@combo']){
                    ch.unshift(spar['@data'])
                  } 
                    var spname = spar['@name']

                if(!isInt){
                    if(spname.slice(-4) == '_INT'){
                        spname = spname.slice(0,-4)
                    }
                  }
              nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language}
               onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
                data={[sc,i]} children={[vdefByMac[self.props.mac][5][spname].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
      
          }else{
                if(self.props.wsb && lvl == 1){
                  lenOffset++;
                }else{
                  nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
              data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
            
                }
          }
        }else if(par.type == 2){
          var sc = par['@data']
          var acc = false;
          
          if((self.props.level > 4)){
            acc = true;
          }
          if(typeof sc['child'] != 'undefined'){
            var spar = sc.params[sc.child]
            var ch = spar['@children'].slice(0)
                  if(spar['@interceptor'] || spar['@test'] || spar['@halo'] || spar['@input']||  spar['@combo']){
                    ch.unshift(spar['@data'])
                  }
                  
                  nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp}
                    font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} backdoor={true}
                   data={[sc,i]} backdoor={true} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
        
          }else{
            nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}   vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
              font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false}  backdoor={true}
              data={[sc,i]} backdoor={true} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
          }
        }else if(par.type == 3){
          var acc = true;
         
          var sc = par['@data']
            
          nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} usernames={self.props.usernames} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
            font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Accounts'} name={'Accounts'} hasChild={false} 
            data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
    
        }else if(par.type == 4){
          var acc = false;
          if((self.props.level > 3) || (self.state.sysRec['PassOn'] == 0)){
            acc = true;
          }
          var sc = par['@data']
          if(par['@data'] == 'format_usb'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton branding={self.props.branding} onClick={self.formatUSB} lab={"Format USB"}/></div>)
          }else if(par['@data'] == 'reboot_display'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton branding={self.props.branding} onClick={self.reboot} lab={"Reboot"}/></div>)
          }else if(par['@data'] == 'update'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton branding={self.props.branding} onClick={self.update} lab={"Update"}/></div>)
          }

         
        }else if(par.type == 5){
          nodes.push(<SettingItem3 soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Unused'} name={'Unused'} hasChild={true} 
              data={{}} onItemClick={self.openUnused} hasContent={true} acc={true} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
      
          //nodes.push(<CircularButton branding={self.props.branding} onClick={self.openUnused} lab={"Get Unused Settings"}/>)
        }
      })

      len = data[lvl - 1 ][0].params.length;
      var ph = ""
      if((len - lenOffset) > 6){
          ph = <div style={{display:'block', width:'100%', height:20}}></div>
          SA = true;
      }
      nav = (
          <div className='setNav' style={{maxHeight:maxHeight}} onScroll={this.handleScroll} id={this.props.Id}>
            {nodes}
            {ph}
          </div>)
    }

    var bgClr = FORTRESSPURPLE2
        var modBG = FORTRESSPURPLE1
        var txtClr = '#e1e1e1'
        var plArr = 'assets/play-arrow-fti.svg'
        var plStop = 'assets/stop-fti.svg'
        var vfdbutts = ''
        if(this.props.branding == 'SPARC'){
          modBG = SPARCBLUE1
          bgClr = SPARCBLUE2
          txtClr = '#000'
          plArr = 'assets/play-arrow-sp.svg'
          plStop = 'assets/stop-sp.svg'
        }
      var catname  = 'Settings'
    if(pathString != ''){
      catname = catMapV2[pathString]['@translations'][this.props.language]
    }
    var trnsmdl =    <Modal ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>Parameter Name: { catname}</div> 
              <div style={{color:txtClr}}>Current Language: {this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitCatChange}>Submit Translation</button>
        </Modal>

    var className = "menuCategory expanded";
    var tstl = {display:'inline-block', textAlign:'center'}
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}</div></h2></span>)
    if (this.state.font == 1){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}</div></h2></span>)
    }else if (this.state.font == 0){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}</div></h2></span>)
    }
    catList = null;
    //console.log(4713,SA)

    return(
      <div className='settingsDiv'>
      <ScrollArrow ref={this.arrowTop} offset={72} width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
    
      <div className={className}>
        <ContextMenuTrigger id={pathString+'_titleCTMID'}>
        {titlediv}
        </ContextMenuTrigger>
        <ContextMenu id={pathString+'_titleCTMID'}>
        <MenuItem onClick={this.translatePopup}>
          Translate Setting
        </MenuItem>
        </ContextMenu>

      {trnsmdl}{nav}

      </div>
      <ScrollArrow ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
      </div>
    );
  }
}
class SettingItem3 extends React.Component{
  constructor(props) {
    super(props)

    this.sendPacket = this.sendPacket.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.getValue = this.getValue.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onRequestClose =this.onRequestClose.bind(this);
    this.parseValues = this.parseValues.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.ed = React.createRef();
    var values = this.parseValues(this.props);
    this.state = ({mode:0,font:this.props.font, val:values[0], pram:values[1], labels:values[2], touchActive:false})
    this.submitChange = this.submitChange.bind(this);
    this.submitList = this.submitList.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.getToolTip = this.getToolTip.bind(this);
    this.msgm = React.createRef();
    

  }
  getToolTip(t){

  }
  touchStart(){
    this.setState({touchActive:true})
  }
  touchEnd(){
    this.setState({touchActive:false})
  }
  parseValues(props){
      var res = vdefByMac[props.mac];
      var pVdef = _pVdef;
      if(res){
       pVdef = res[1];
      }
      var val = [], pram = [], label = false;
      if(!props.hasChild){
        //console.log('parseValues', 1)
        if(typeof props.data == 'object'){
          //console.log('parseValues', 2)
        
          if(typeof props.data['@data'] == 'undefined'){
            //console.log('parseValues', 3)
            //console.log(props.lkey)
            if(typeof props.data[0] != 'undefined'){
            if(typeof props.data[0]['child'] != 'undefined'){
             // console.log('parseValues', 4)
        
              var lkey = props.data[0].params[props.data[0].child]['@name']
              if((props.data[0].params[props.data[0].child]['@children'])&&(props.children[0].length == 2)){
                for(var i=0;i<props.children[0].length; i++){
                  val.push(this.getValue(props.children[1][i], props.children[0][i]))
                  if(typeof pVdef[0][props.children[0][i]] != 'undefined'){
                    pram.push(pVdef[0][props.children[0][i]])
                  }else if(typeof pVdef[1][props.children[0][i]] != 'undefined'){
                    pram.push(pVdef[1][props.children[0][i]])
                  }else if(typeof pVdef[2][props.children[0][i]] != 'undefined'){
                    pram.push(pVdef[2][props.children[0][i]])
                  }else if(typeof pVdef[3][props.children[0][i]] != 'undefined'){
                    pram.push(pVdef[3][props.children[0][i]])
                  }else if(lkey == 'Nif_ip'){
                    pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                  }else if(lkey == 'Nif_nm'){
                    pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                  }else if(lkey == 'Nif_gw'){
                    pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                  }else if(lkey == 'Nif_mac'){
                    pram = [{'@name':'Nif_mac', '@type':'mac_address','@bit_len':32, '@rpcs':{}}]
                  }
                }
              }else{
            
                val  = [this.getValue(props.data[0].params[props.data[0].child]['@data'], lkey)]
                if(typeof pVdef[0][lkey] != 'undefined'){
                  pram = [pVdef[0][lkey]]
                }else if(typeof pVdef[1][lkey] != 'undefined'){
                  pram = [pVdef[1][lkey]]
                }else if(typeof pVdef[2][lkey] != 'undefined'){
                  pram = [pVdef[2][lkey]]
                }else if(typeof pVdef[3][lkey] != 'undefined'){
                  pram = [pVdef[3][lkey]]
                }else if(lkey == 'Nif_ip'){
                  pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                }else if(lkey == 'Nif_nm'){
                  pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                }else if(lkey == 'Nif_gw'){
                  pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
                }else if(lkey == 'Nif_mac'){
                  pram = [{'@name':'Nif_mac', '@type':'mac_address','@bit_len':32, '@rpcs':{}}]
                }

                if(props.data[0].params[props.data[0].child]['@children']){
                 // console.log('parseValues', 7)
        
                  for(var i=0;i<props.children[0].length; i++){
                    val.push(this.getValue(props.children[1][i], props.children[0][i]))
                    if(typeof pVdef[0][props.children[0][i]] != 'undefined'){
                      pram.push(pVdef[0][props.children[0][i]])
                    }else if(typeof pVdef[1][props.children[0][i]] != 'undefined'){
                      pram.push(pVdef[1][props.children[0][i]])
                    }else if(typeof pVdef[2][props.children[0][i]] != 'undefined'){
                      pram.push(pVdef[2][props.children[0][i]])
                    }else if(typeof pVdef[3][props.children[0][i]] != 'undefined'){
                      pram.push(pVdef[3][props.children[0][i]])
                    }
                  }
                   
                }
              }
      
              if(pram[0]['@labels']){
                label = true
              }
            }
          }else{

          }
          }else{
            //console.log('parseValues', 8)
        
            var lkey = props.lkey;
            if((props.data['@children'])&&(props.children[0].length == 2)){
        
              for(var i=0;i<props.children[0].length;i++){
                val.push(this.getValue(props.children[1][i], props.children[0][i]))
                if(typeof pVdef[0][props.children[0][i]] != 'undefined'){
                  pram.push(pVdef[0][props.children[0][i]])
                }else if(typeof pVdef[1][props.children[0][i]] != 'undefined'){
                  pram.push(pVdef[1][props.children[0][i]])
                }else if(typeof pVdef[2][props.children[0][i]] != 'undefined'){
                  pram.push(pVdef[2][props.children[0][i]])
                }else if(typeof pVdef[3][props.children[0][i]] != 'undefined'){
                  pram.push(pVdef[3][props.children[0][i]])
                }
              }
            }else{
              //console.log('parseValues', 10)
        

              val = [this.getValue(props.data['@data'], lkey)]
              if(typeof pVdef[0][lkey] != 'undefined'){
                pram = [pVdef[0][lkey]]
              }else if(typeof pVdef[1][lkey] != 'undefined'){
                pram = [pVdef[1][lkey]]
              }else if(typeof pVdef[2][lkey] != 'undefined'){
                pram = [pVdef[2][lkey]]
              }else if(typeof pVdef[3][lkey] != 'undefined'){
                pram = [pVdef[3][lkey]]
              }else if(lkey == 'Nif_ip'){
                pram = [{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
              }else if(lkey == 'Nif_nm'){
                pram = [{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
              }else if(lkey == 'Nif_gw'){
                pram = [{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}]
              }else if(lkey == 'Nif_mac'){
                pram = [{'@name':'Nif_mac', '@type':'mac_address','@bit_len':32, '@rpcs':{}}]
              }
            }     
          }
        }
      }
      if(pram.length == 0){

      }else if(pram[0]['@labels']){
        label = true
      }
      return [val,pram,label]
  }
  sendPacket(n,v) {
    //
    var self = this
    if(this.props.dynSettings['BatchRunning'] != 0){
      if(n['@locked_by_batch']){
        this.msgm.current.show('Changes will not take effect until batch is stopped.')
      }
    }


    var val = v
    if(n['@name'] == 'Nif_ip'){
      this.props.soc.emit('nifip', v.toString())
    }else if(n['@name'] == 'Nif_nm'){
      this.props.soc.emit('nifnm', v.toString())
    }else if(n['@name'] == 'Nif_gw'){
      this.props.soc.emit('nifgw', v.toString())
    }else{
      if(n['@type'] == 'ipv4_address'){
        val = v.split('.').map(function(ip){
          return ("000"+ip).slice(-3);
        }).join('.')
        setTimeout(function(){
          self.props.soc.emit('locateReq');
        },200)
      }
    
    this.props.sendPacket(n,val)  

    //  console.log('this should execute', n, v)

    }
  }
  componentWillReceiveProps (newProps) {
    // body...
    var values = this.parseValues(newProps);
    
    this.setState({font:newProps.font, val:values[0], pram:values[1], labels:values[2]})
  }
  onItemClick(v){
    if(v == true){
      toast('Not Configurable')
    }else{



      if(this.props.hasChild || typeof this.props.data == 'object'){
    
        if(this.props.acc){
          this.props.onItemClick(this.props.data, this.props.name)  
        }else{
          if(this.props.backdoor == true ){

          }else{
            this.msgm.current.show('Access Denied')
          }
          //toast('Access Denied')  
        }   
      }
    }
  }
  getValue(rval, pname){
    var pram;
      var val;
      var label = false
      var res = vdefByMac[this.props.mac];
      var pVdef = _pVdef;
      var dec = 0;
      var self = this;
      if(res){
        pVdef = res[1];
      }
     // console.log(pname)

      if(typeof pVdef[0][pname] != 'undefined'){
        pram = pVdef[0][pname]
        var deps = []
        val = rval
        if(pram["@type"]){
          var f = pram["@type"]
          if(pram["@dep"]){
            deps = pram["@dep"].map(function(d){
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.sysSettings[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return self.props.prodSettings[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                return self.props.dynSettings[d]
              }
            });
            if((f == 'mm')||(f == 'float_dist')){
              if(deps[0] == 0){
                dec = 1
              }
            }
          } 
          if(pram['@bit_len']<=16){
           
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }else if(f == 'float_dist'){
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
    
          }
        }else if(typeof pram['@decimal'] != 'undefined'){
          val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
        }
        
        if(pram["@labels"]){
          label = true
        }
      }else if(typeof pVdef[1][pname] != 'undefined'){
        
        pram = pVdef[1][pname]
        
        var deps = []
        val = rval
        if(pram["@type"]){
          var f = pram["@type"]
          if(pram["@dep"]){
            deps = pram["@dep"].map(function(dp){
              var d = dp;
              if(dp.indexOf('[0]') != -1){
                if(pram['@name'].slice(-2) == '_A'){
                  d = dp.replace('[0]','[1]')
                }
              }
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.sysSettings[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return self.props.prodSettings[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                return self.props.dynSettings[d]
              }
            });
           
            if(pram['@name'] == 'BeltSpeed'){
            //  deps.push(self.props.dynSettings['EncFreq'])
              //deps.push(1000)
            //  console.log(3243,deps)
            }else if(pram['@type'] == 'rej_del'){
              deps.push(1000)
            }
          }
          if((f == 'mm') || (f == 'float_dist')){
              if(deps[0] == 0){
                dec = 1
              }
            }
          if(pram['@bit_len']<=16){
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }
          if(f == 'float_dist'){
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
    
          }
          if(f == 'phase_offset'){
            val =   uintToInt(val,16)//?? phase is coming in with different format for dyn data
          }
          
        }else if(typeof pram['@decimal'] != 'undefined'){
          val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
        }
        if(pram["@labels"]){
          label = true
        }
      }else if(typeof pVdef[2][pname] != 'undefined'){
        
        pram = pVdef[2][pname]
        
        var deps = []
        val = rval
        if(pram["@type"]){
          var f = pram["@type"]
          if(f == 'phase'){
            val =   (uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
          }else{
          if(pram["@dep"]){
            deps = pram["@dep"].map(function(dp){
              var d = dp;
              if(dp.indexOf('[0]') != -1){
                if(pram['@name'].slice(-2) == '_A'){
                  d = dp.replace('[0]','[1]')
                }
              } 
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.sysSettings[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return self.props.prodSettings[d];
              }else if(pVdef[6][d]["@rec"] == 2){
                return self.props.dynSettings[d];
              }
            });
          }
          if(f == 'mm'){
              if(deps[0] == 0){
                dec = 1
            }
          }
          if(f == 'belt_speed'){
            //need to get belt_speed as raw value
          }
          if(pram['@bit_len']<=16){
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }
        }
          
        }else if(pram['@name'] == 'RejExitDistEst'){
          var dependancies = ['SysRec.MetricUnits']
          deps = dependancies.map(function(d){
            if(pVdef[6][d]["@rec"] == 0){
                return self.props.sysSettings[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return self.props.prodSettings[d];
              }else if(pVdef[6][d]["@rec"] == 2){
              //    ////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
                return self.props.dynSettings[d];
              }
          })
          dec = 1
          val = eval(funcJSON['@func']['mm']).apply(this, [].concat.apply([], [val, deps]));

        }else if(pram['@name'] == 'DateTime'){
          val = val;
        }else if(typeof pram['@decimal'] != 'undefined'){
          val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
        }
        if(pram["@labels"]){
          label = true
        }
      }else if(typeof pVdef[3][pname] != 'undefined'){
        
        pram = pVdef[3][pname]
        
        var deps = []
        val = rval
        if(pram["@type"]){
          var f = pram["@type"]
          if(f == 'phase'){
            val =   (uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
          }else{
          if(pram["@dep"]){
            deps = pram["@dep"].map(function(d){
              if(pVdef[6][d]["@rec"] == 0){
                return self.props.sysSettings[d];
              }else if(pVdef[6][d]["@rec"] == 1){
                return self.props.prodSettings[d];
              }else if(pVdef[6][d]["@rec"] == 2){
              //    ////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
                return self.props.dynSettings[d];
              }else if(pVdef[6][d]["@rec"] == 3){
              //    ////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
                return self.props.framSettings[d];
              }
            });
          }
          if(pram['@bit_len']<=16){
          //  ////////console.log(f)
            
            val = eval(funcJSON['@func'][f]).apply(this, [].concat.apply([], [val, deps]));
          }
        }
          
        }else if(typeof pram['@decimal'] != 'undefined'){
          val = (val/Math.pow(10,pram['@decimal'])).toFixed(pram['@decimal'])
        }
        if(pram["@labels"]){
          label = true
        }
      }else{
        val = rval
      }
      return val;
  }
  onFocus () {
    this.props.onFocus();
  }
  onRequestClose () {
    this.props.onRequestClose();
  }
  submitChange(n,l,v){
    this.props.submitChange(n,l,v)
  }
  submitList(n,l,v){
    this.props.submitList(n,l,v)
  }
  getMMdep(d){
    if(Array.isArray(d)){
      var deps = []
      for(var i = 0; i < d.length; i++){
         deps.push(this.getMMdep(d[i]));
      }
      return deps;
    }
      if(d == 'MaxBeltSpeed'){
        d += '0' //this.state.pram[0]['@name'].slice(-1)
        //hack to make it not crash
      }
     var res = vdefByMac[this.props.mac];
      var pVdef = _pVdef;
      var dec = 0;
      var self = this;
      if(res){
        pVdef = res[1];
      }
      if(typeof pVdef[0][d] != 'undefined'){
        return this.props.sysSettings[d]
      }else if(typeof pVdef[1][d] != 'undefined'){
        return this.props.prodSettings[d]
      }else if(typeof pVdef[2][d] != 'undefined'){
        return this.props.dynSettings[d]
      }
  }
  alertAccept(){

  }
  render(){
    var ft = [16,20,24];
    var wd = [150,260,297]
    var vwd = [75,125,169]
    var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
    var vst = {display:'inline-block', fontSize:ft[this.state.font], width:vwd[this.state.font]}
    var self = this;
    var fSize = 24;
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
    var sty = {height:60};
    var klass = 'sItem'
    var display = true;
    var disable = false;

    var accModal = <MessageModal ref={this.msgm}/>
    if(vMapV2[this.props.lkey]){
      if(vMapV2[this.props.lkey]['display']){
        var dispRef = this.getMMdep(vMapV2[this.props.lkey]['display'][1]);
        display = eval(vMapV2[this.props.lkey]['display'][0])(dispRef)
      }
      if(vMapV2[this.props.lkey]['disable']){
       /* if(Array.isArray(vMapV2[this.props.lkey]['disable'][1])){
           var disaRef = []
           for(var i = 0; i < vMapV2[this.props.lkey]['disable'][1]; i++){
            disaRef.push(this.getMMdep(vMapV2[this.props.lkey]['disable'][1][i]))
           }
           //this.getMMdep(vMapV2[this.props.lkey]['disable'][1]);
            disable = eval(vMapV2[this.props.lkey]['disable'][0]).apply(this, [].concat.apply([], [disaRef]));
        }else{*/
          var disaRef = this.getMMdep(vMapV2[this.props.lkey]['disable'][1]);
          disable = eval(vMapV2[this.props.lkey]['disable'][0]).apply(this, [].concat.apply([], [disaRef]));
          // console.log("disable", disable)
       // }
       
      }

    }
    // if(this.props.lkey == 'MavTable'){
    //   // console.log('Mav', display)
    // }
    // if(this.props.lkey == 'SetTolNegErr'){
    //   // console.log('SetTolNegErr', display)
    // }
       
    if(this.props.mobile){
      sty.height = 45;
      sty.lineHeight = '45px';
    }
      var res = vdefByMac[this.props.mac];
      var pVdef = _pVdef;
      if(res){
        pVdef = res[1];
      }
        var label = false;
    if(this.props.hasChild){
      var namestring = this.props.name;
      var path = ""
      if(this.props.path.length == 0){
        path = namestring
      }else{
        path = this.props.path + '/'+ namestring
      }
      
      if(typeof catMapV2[path] != 'undefined'){
          namestring = catMapV2[path]['@translations'][this.props.language]
          if(catMapV2[path]['display']){
            var dispRef = this.getMMdep(catMapV2[path]['display'][1])
            display = eval(catMapV2[path]['display'][0])(dispRef)
          }
      
      }
      if(namestring.length > 28){
        fSize = 18
      }
      else if(namestring.length > 24){
        fSize= 20
      }else if(namestring.length > 18){
        fSize = 22
      }
      
        var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
        if(this.props.mobile){
          _st.lineHeight = '51px'
          _st.height = 45
        }
        klass += ' hasChild'
        if(this.state.touchActive){
          klass += ' touchDown'
        }
        sty.backgroundColor = FORTRESSPURPLE2;
          if(this.props.branding == 'SPARC'){
            sty.backgroundColor = SPARCBLUE2
            sty.color = 'black'
            sty.height = 50;

          }
          if(!display){
            sty.display = 'none'
          }
      return (<div className={klass} style={sty} onPointerDown={this.touchStart} onPointerUp={this.touchEnd} onClick={this.onItemClick}><label>{namestring}</label>{accModal}</div>)
    }else{
      var val, pram;
      var namestring = this.props.name;

    if(typeof this.props.data == 'object'){

      if(typeof this.props.data['@data'] == 'undefined'){
        var path = ""
        if(this.props.path.length == 0){
          path = namestring
        }else{
          path = this.props.path + '/'+ namestring
        }
         if(typeof catMapV2[path] != 'undefined'){
        if(typeof catMapV2[path] != 'undefined'){
          namestring = catMapV2[path]['@translations'][this.props.language]
        }
         if(catMapV2[path]['display']){
            var dispRef = this.getMMdep(catMapV2[path]['display'][1])
            display = eval(catMapV2[path]['display'][0])(dispRef)
          }
        }
        if(namestring.length > 28){
          fSize = 18
        }
        else if(namestring.length > 24){
          fSize= 20
        }else if(namestring.length > 18){
          fSize = 22
        }
        var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
        if(this.props.mobile){
          _st.lineHeight = '51px'
          _st.height = 45
        }
        
        if(typeof this.props.data[0] != 'undefined'){
        if(typeof this.props.data[0]['child'] != 'undefined'){

              klass  = 'sprc-prod'//+= ' noChild'

          var lkey = this.props.data[0].params[this.props.data[0].child]['@name']

          if(vMapV2[lkey]){
            if(vMapV2[lkey]['display']){
              var dispRef = this.getMMdep(vMapV2[lkey]['display'][1]);
              display = eval(vMapV2[lkey]['display'][0])(dispRef)
            }
          }
          var im = <img  style={{position:'absolute', width:36,top:15, left:762, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return_blk.svg'/>
          
          if(this.props.mobile){
            im = <img  style={{position:'absolute', width:'7%',height:'40%',top:'30%', left:'92%', strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return_blk.svg'/>
          }
      
          if(this.props.backdoor){
            im = ''
          }
    

          var medctrl= (<MultiEditControl  timezones={this.props.timezones} timeZone={this.props.timeZone} dst={this.props.dst}  dt={this.props.dt} disabled={disable} getMMdep={this.getMMdep} weightUnits={this.props.sysSettings['WeightUnits']} branding={this.props.branding} submitList={this.submitList} submitChange={this.submitChange} submitTooltip={this.props.submitTooltip} combo={(this.props.data['@combo'] == true)} mobile={this.props.mobile} 
                      mac={this.props.mac} ov={true} vMap={vMapV2[lkey]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits}
                    onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} pAcc={this.props.passAcc} ref='ed' vst={vst} 
                    lvst={st} param={this.state.pram} size={this.props.font} sendPacket={this.sendPacket} data={this.state.val} 
                    label={this.state.label} int={false} name={lkey}/>)


          if(this.props.mobile){
            sty.height = 51
            sty.paddingRight = 5
          }
          if(!display){
            sty.display = 'none'
          }
              //sty.paddingBottom = 5
          return (<div className='sprc-prod' style={sty} onClick={this.onItemClick}> {medctrl}
              {im}
            {accModal}
            </div>)
        }
      }else{
     
        return ""
      }

          klass = 'sItem hasChild'
          sty.backgroundColor = FORTRESSPURPLE2
          if(this.props.branding == 'SPARC'){
                klass = 'sItem hasChildSparc'
                sty.color = 'black'
                sty.background = SPARCBLUE2
                sty.height = 50;
              }
          if(this.state.touchActive){
                klass += ' touchDown'
            }
          if(!display){
           // sty.display = 'none'
          }
        return (<div  className={klass} style={sty} onPointerDown={this.touchStart} onPointerUp={this.touchEnd} onClick={() => this.onItemClick(!display)}><label>{namestring}</label>{accModal}</div>)
      }

    }
    if(this.props.mobile){
      sty.height = 51;
      sty.paddingRight = 5;
    }
              if(!display){
            sty.display = 'none'
          }
    var medctrl= (<MultiEditControl dt={this.props.dt} disabled={disable}  getToolTip={this.getToolTip} getMMdep={this.getMMdep} weightUnits={this.props.sysSettings['WeightUnits']} branding={this.props.branding} submitTooltip={this.props.submitTooltip} submitList={this.submitList} 
      submitChange={this.submitChange} combo={(this.props.data['@combo'] == true)} mobile={this.props.mobile} mac={this.props.mac} ov={false} vMap={vMapV2[this.props.lkey]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} onFocus={this.onFocus}
       onRequestClose={this.onRequestClose} pAcc={this.props.passAcc} acc={this.props.acc} ref='ed' vst={vst} 
          lvst={st} param={this.state.pram} size={this.props.font} sendPacket={this.sendPacket} data={this.state.val} 
          label={this.state.label} int={false} name={this.props.lkey}/>)

          return (<div hidden={!display} className='sprc-prod' style={sty}> {medctrl}{accModal}
          </div>)
      
    }
  }
}
class MultiEditControl extends React.Component{
  constructor(props) {
    super(props)
    var tlist = []
    var elist = []
    var liststring = ''
    // console.log('constructing MEC')
    if(typeof this.props.param[0]['@labels'] != 'undefined'){
      var labname = this.props.param[0]['@labels'] 
      if(typeof vMapLists[this.props.param[0]['@labels']] != 'undefined'){
        // console.log(vMapLists[this.props.param[0]['@labels']], 'THIS IS WEIRD')
        liststring = vMapLists[this.props.param[0]['@labels']][this.props.language].join(',')
        tlist = vMapLists[this.props.param[0]['@labels']][this.props.language].slice(0);
        elist = vMapLists[this.props.param[0]['@labels']]['english'].slice(0);
      }else{
      //  console.log('WOW', this.props.param)
        liststring = vdefByMac[this.props.mac][0]['@labels'][this.props.param[0]['@labels']][this.props.language].join(',');
        vMapLists[this.props.param[0]['@labels']] = JSON.parse(JSON.stringify(vdefByMac[this.props.mac][0]['@labels'][this.props.param[0]['@labels']]))
        vdefMapV2['@languages'].forEach(function (l) {
          if(typeof vMapLists[labname][l] == 'undefined'){
             vMapLists[labname][l] = vMapLists[labname]['english'].slice(0)
          }
        })
         tlist = vMapLists[this.props.param[0]['@labels']][this.props.language].slice(0);
        elist = vMapLists[this.props.param[0]['@labels']]['english'].slice(0);
      }
      
    }
    if(typeof this.props.vMap == 'undefined'){
      console.log(this.props.param, 5679)
    }
    this.state = ({val:this.props.data.slice(0), changed:false,tlist:tlist,elist:elist,liststring:liststring, mode:0, size:this.props.size,touchActive:false, curtrn:this.props.vMap['@translations'][this.props.language]['name']})
    this.selectChanged = this.selectChanged.bind(this);
    this.valChanged = this.valChanged.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onRequestClose = this.onRequestClose.bind(this);
    this.onClick = this.onClear.bind(this);
    this.openSelector = this.openSelector.bind(this);
    this.valClick = this.valClick.bind(this);
      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.vfdStart = this.vfdStart.bind(this);
      this.vfdStop = this.vfdStop.bind(this);
      this.vfdSetup = this.vfdSetup.bind(this);
      this.curtrnChange = this.curtrnChange.bind(this);
      this.submitChange = this.submitChange.bind(this);
      this.submitList = this.submitList.bind(this);
    for(var i = 0; i<this.props.param.length; i++){
      this['input'+i] = React.createRef();
    }
    this.vfdModal = React.createRef();
    this.vfdSModal = React.createRef();
    this.trnsmdl = React.createRef();
    this.listmdl = React.createRef();
    this.translatePopup = this.translatePopup.bind(this);
    this.translateLists = this.translateLists.bind(this);
    this.pw = React.createRef();
    this.listChange = this.listChange.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.lChange = this.lChange.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.msgm = React.createRef();
    this.getToolTip = this.getToolTip.bind(this);
    this.setTz = this.setTz.bind(this);
    this.setDST = this.setDST.bind(this);
    this.changeDT = this.changeDT.bind(this);
  }
  componentWillReceiveProps(newProps){
    if(this.props.param[0]['@name'] != newProps.param[0]['@name']){
       var tlist = []
    var elist = []
    var liststring = ''
    // console.log('constructing MEC')
    if(typeof newProps.param[0]['@labels'] != 'undefined' || newProps.language != this.props.language){
      var labname = newProps.param[0]['@labels'] 
      if(typeof vMapLists[newProps.param[0]['@labels']] != 'undefined'){
        // console.log(vMapLists[newProps.param[0]['@labels']], 'THIS IS WEIRD')
        liststring = vMapLists[newProps.param[0]['@labels']][newProps.language].join(',')
        tlist = vMapLists[newProps.param[0]['@labels']][newProps.language].slice(0);
        elist = vMapLists[newProps.param[0]['@labels']]['english'].slice(0);
      }else{
      //  console.log('WOW', newProps.param)
        liststring = vdefByMac[newProps.mac][0]['@labels'][newProps.param[0]['@labels']][newProps.language].join(',');
        vMapLists[newProps.param[0]['@labels']] = JSON.parse(JSON.stringify(vdefByMac[newProps.mac][0]['@labels'][newProps.param[0]['@labels']]))
        vdefMapV2['@languages'].forEach(function (l) {
          if(typeof vMapLists[labname][l] == 'undefined'){
             vMapLists[labname][l] = vMapLists[labname]['english'].slice(0)
          }
        })
         tlist = vMapLists[newProps.param[0]['@labels']][newProps.language].slice(0);
        elist = vMapLists[newProps.param[0]['@labels']]['english'].slice(0);
      }
          
    }
      this.setState({val:newProps.data.slice(0), tlist:tlist, elist:elist, liststring:liststring})
    }else{
       this.setState({val:newProps.data.slice(0)})
     
    }
    
  }
  componentDidMount(){
    this.setState({curtrn:this.props.vMap['@translations'][this.props.language]['name']})
  }
  submitList(){
    this.props.submitList(this.props.param[0]['@labels'], this.props.language, this.state.tlist.slice(0))
  }
  submitTooltip(txt){
    this.props.submitTooltip(this.props.name, this.props.language,txt)
  }
  vfdSetup(){
    var self = this;
    setTimeout(function(argument) {
      // body...
      self.vfdSModal.current.toggle();
    },100)
     this.props.sendPacket('vfdChange',this.props.param[0])
  }
  selectChanged(v,i){
    var val = v//e.target.value//e.target.value;
    if(this.props.bitLen == 16){
      val = Params.swap16(parseInt(val))
    }
    this.props.sendPacket(this.props.param[i], parseInt(val));
    var value = this.state.val;
    value[i] = v// e.target.value
  }
  valChanged(v,i){
    if(v == ""){
      return;
    }
    //console.log(['2734',v,i,this.props.param[i]])
    var val;
    if(!isNaN(v)){
      val = parseFloat(v)
    }else{ 
      val = v;

    }
    if(this.props.param[i]['@type'] == 'mm'){
      if(this.state.val[i].indexOf('in') != -1){
        val = val*10;
      }
    }else if(this.props.param[i]['@name'].indexOf('PhaseAngleAuto') != -1){
      val = val*Math.pow(10,this.props.param[i]['@decimal'])
    }else if(this.props.param[i]['@decimal']){
      val = val*Math.pow(10,this.props.param[i]['@decimal'])
      // console.log('3149',v,val)
    }else if(this.props.param[i]['@type'] == 'belt_speed'){
      if(v.indexOf('.') != -1){
        val = val*10
      }
    }
    
    if(this.props.bitLen == 16){
      val = Params.swap16(parseFloat(val))
    }
    var value = this.state.val; 
    value[i] = val;
    //this.setState({val:value})
    if(this.props.param[i]['@bit_len'] > 16){
      val = v//              "
      if(this.props.param[i]['@type'] == 'dsp_name_u16_le' || this.props.param[i]['@type'] == 'prod_name_u16_le' || this.props.param[i]['@type'] == 'string'){
        val  = (v + "                    ").slice(0,this.props.param[i]['@bit_len']/8)
      }
      this.props.sendPacket(this.props.param[i], val)
    }else if(!Number.isNaN(val)){
      this.props.sendPacket(this.props.param[i], parseFloat(val));
    }
  }
  onFocus () {
    this.props.onFocus();
  }
  onRequestClose () {
    this.props.onRequestClose();
  }
  onClear (id) {
    this.props.sendPacket(this.props.param[id])
  }
  openSelector () {
    if(!this.props.ov){
  
      var self = this;
      if(this.pw.current){
        setTimeout(function () {
          self.pw.current.toggleCont();
        },100)
        
      }
    }
    
  }
  getToolTip(t){
    if(typeof vdefMapV2['@tooltips'] != 'undefined'){
     return vdefMapV2['@tooltips'][t][this.props.language]
    }else{
      return 'N/A'
    }
    
    //return this.props.getToolTip(t)
  }
  valClick (ind) {
    var self = this;
     var acc = false
    var vfdcont = false
    var vfdsetup = false
      if(this.props.param[0]['@rpcs']){
        if((this.props.param[0]['@rpcs']['vfdwrite'])||(this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])||(this.props.param[0]['@rpcs']['theme'])||(this.props.param[0]['@rpcs']['customstrn'])){
          acc = true
        }else if(this.props.param[0]['@rpcs']['vfdstart']){
          vfdcont = true
        }
        if(this.props.param[0]['@rpcs']['changevfdwrite']){
          vfdsetup = true
        }
      }
    
    if(this.props.disabled){
      this.msgm.current.show('This setting is currently disabled')
    }else if(this.props.pAcc === false){
      //toast('Access Denied')
      if(acc){
        this.msgm.current.show('Access Denied')
      }
      
    }else if(!this.props.ov){
      if(this.props.param[ind]['@rpcs']){
        if(this.props.param[ind]['@rpcs']['vfdstart']){
          this.vfdModal.current.toggle();
        }else if(this.props.param[ind]['@rpcs']['clear']){
          this.onClear(ind)
        }else if(this.props.param[ind]['@rpcs']['start']){
          this.onClear(ind)
        }else if(this['input' + ind].current){
          setTimeout(function (argument) {
            // body...
            self['input' + ind].current.toggle();
          }, 100);
          //this.refs['input' + ind].toggle();
        }else if(this.pw.current){
         // console.log("val", val);
          /*if(this.props.name == "ManRejState")
          {
            
          }*/
            setTimeout(function(){
              self.pw.current.toggle();
            },100)
          
        }
      }else if(this['input' + ind].current){
          setTimeout(function (argument) {
            // body...
            self['input' + ind].current.toggle();
          }, 100);
      }else if(this.pw.current){
        setTimeout(function(){
            self.pw.current.toggle();
      
          },100)
      }
    }
  }
  vfdStart(){
    // console.log('start clicked')
    this.props.sendPacket(this.props.param[0],1)
  }
  vfdStop(){
    // console.log('stop clicked')
    this.props.sendPacket(this.props.param[0],2)
  }
    onPointerDown(){
      this.setState({touchActive:true})
    }
    onPointerUp(){
      if(this.state.touchActive){
        this.setState({touchActive:false})
      
      }
    }
    listChange(e){
      this.setState({liststring:e.target.value})
    }
    translatePopup(){
      this.setState({curtrn:this.props.vMap['@translations'][this.props.language]['name']})
      this.trnsmdl.current.toggle();
      //toast('translate')
    }
    translateLists(){
      var liststring = ''
    if(typeof this.props.param[0]['@labels'] != 'undefined'){
      liststring = vMapLists[this.props.param[0]['@labels']][this.props.language].join(',')
    }
      this.setState({liststring:liststring})
      this.listmdl.current.toggle();
      //toast('translate')
    }
    curtrnChange(v){
      this.setState({curtrn:v.target.value})
    }
    submitChange(){
      this.props.submitChange(this.props.name, this.props.language, this.state.curtrn)
    }
    lChange(e,i){
      var list = this.state.tlist.slice(0);
      list[i] = e.target.value;
      this.setState({tlist:list})
    }
    getMMdep(v){
      return this.props.getMMdep(v)
    }
    sendAlert(msg){
     //  <AlertModal ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{"This will end the current batch. Confirm?"}</div></AlertModal>
    }
    setTz(tz){
      this.props.sendPacket('Timezone',tz)
    }
    setDST(dst){
      this.props.sendPacket('DaylightSavings',dst)
    }
    changeDT(dt){
      // console.log('changeDT', dt)
      this.props.sendPacket('DateTime', dt)
    //  this.dtsModal.current.close();
    }
    
    
    render(){
      var self = this;
    var popupmenu = ''
    var namestring = this.props.name
    
    if(typeof vdefByMac[this.props.mac][5][this.props.name] != 'undefined'){
      if(vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name'] != ''){
        namestring =  vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name']
      }
    }
    namestring = this.props.vMap['@translations'][this.props.language]['name']
   
    var dt = false;
    var fSize = 20;
    if(namestring.length > 30){
      fSize = 14
    }
    else if(namestring.length > 24){
      fSize= 16
    }else if(namestring.length > 18){
      fSize = 18
    }
    if(this.props.mobile){
      fSize -= 7;
      fSize = Math.max(13, fSize)
    }
    let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee', verticalAlign:'middle', lineHeight:'25px'}
    if(this.props.branding == 'SPARC'){
      lvst.background = SPARCBLUE2
    }

    var labWidth = (496/this.state.val.length)
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480',overflow:'hidden'}
    if(this.props.branding == 'SPARC'){
      lvst.background = SPARCBLUE2
      vlabelStyle.boxShadow = ' -50px 0px 0 0 '+ SPARCBLUE2
    }
    var vlabelswrapperStyle = {width:496, overflow:'hidden', display:'table-cell'}
    if(this.props.mobile){
      labWidth = parseInt(100/this.state.val.length) + '%'
      vlabelswrapperStyle.width = '60%'
      lvst.verticalAlign = 'middle'
      lvst.lineHeight = '25px'
    }
      if(this.state.touchActive){
          lvst.background = '#56526c'
          vlabelStyle.boxShadow = ' -50px 0px 0 0 #56526c'

          if(this.props.branding == 'SPARC'){
            lvst.background = '#2098d2'
            vlabelStyle.boxShadow = ' -50px 0px 0 0 #2098d2'
          }
      }
      var iod = false;
      var iogreen = true;
      var ioindicator = '';
      var vLabels = this.state.val.map(function(d,i){  
      var val = d;
      var units = self.props.param[i]['@units']
      if(units == 'grams'){
        if(self.props.weightUnits == 1){
          val = val/1000 
          units = 'kg'
        }else if(self.props.weightUnits == 2){
          val = val/453.592
          units = 'lbs'
        }else if(self.props.weightUnits == 3){
          val = val/28.3495
          units = 'oz'
        }else{
          units = 'g'
        }
      }
      if(self.props.param[i]['@type'] == 'float' || self.props.param[i]['@type'] == 'weight'){
        if(val == null){
          val = 0;
        }
        if(typeof self.props.param[i]['@float_dec'] != 'undefined'){
          val = val.toFixed(self.props.param[i]['@float_dec'])
        }else if(val.toString().length > val.toFixed(5).length){
          val = val.toFixed(5)
        }
        
      }
      var st = {textAlign:'center',lineHeight:'51px', verticalAlign:'middle', height:51}
      st.width = labWidth
      st.fontSize = self.props.vst.fontSize;
      st.display = 'table-cell';//self.props.vst.display;
      
      if(self.props.mobile){
        st.height = 51
        st.lineHeight = '51px'
        st.display = 'inline-block'
      }
          if(typeof self.props.param[i]['@labels'] != 'undefined'){
        var list =  _pVdef[7][self.props.param[i]["@labels"]];
        if(typeof vMapLists[self.props.param[i]['@labels']]!= 'undefined'){
          list = vMapLists[self.props.param[i]['@labels']]
        }
        if(typeof list['english'] == 'undefined'){
          console.log(self.props.param[i])
        }
        val = list['english'][d];
        
        if((self.props.language != 'english')&&(typeof list[self.props.language] != 'undefined')&&(typeof list[self.props.language][d] == 'string') &&(list[self.props.language][d].trim().length != 0)){
          val = list[self.props.language][d];
        }
        if((self.props.param[i]['@labels'] == 'InputSrc')){
          iod = true
          
          if(d == 0){
            //st.color = '#666'
            iogreen = false;
            
          }else if((self.props.ioBits[inputSrcArr[d]] == 0) && (self.state.val[1] == 0)){
           // st.color = '#666'
            iogreen = false;
          }else if((self.props.ioBits[inputSrcArr[d]] != 0) && (self.state.val[1] != 0)){
           // st.color = '#666'
            iogreen = false;
          }
        }else if((self.props.param[i]['@labels'] == 'OutputSrc')){
           iod = true
          if(self.props.ioBits[outputSrcArr[d]] == 0){            
            //st.color = '#666'
            iogreen = false;
          }
        }
      }else if(self.props.param[i]['@name'] == 'Timezone'){
        st.lineHeight = '24px'
        if(val == 0){
          val = 1;
        }
        val = timezoneJSON[val-1].text;
      }
          if(self.props.param[i]['@units']){
        
            val = val + ' ' + units
          }
          if(self.props.combo){
            val = <React.Fragment><div style={{color:'#aaa', fontSize:self.props.vst.fontSize - 4}}>{self.props.vMap['@labels'][i]}</div><div>{val}</div></React.Fragment>
            st.lineHeight = '22px'
          }

          var _st = Object.assign({},st)
          if(self.state.touchActive){
            _st.background = 'rgba(100,100,100,0.5)'
          }
      
      if(iod && i == 1){
        _st.width = 190
      }
      return (<CustomLabel index={i} onClick={self.valClick} style={_st}>{val == '0.00 seconds' ? 'Default' : val}</CustomLabel>)
    })
    

    var acc = false
    var vfdcont = false
    var vfdsetup = false
    if(this.props.acc){
      if(this.props.param[0]['@rpcs']){
        if((this.props.param[0]['@rpcs']['vfdwrite'])||(this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])||(this.props.param[0]['@rpcs']['theme'])||(this.props.param[0]['@rpcs']['customstrn'])){
          acc = true
        }else if(this.props.param[0]['@rpcs']['vfdstart']){
          vfdcont = true
        }
        if(this.props.param[0]['@rpcs']['changevfdwrite']){
          vfdsetup = true
        }
      }
    }
    var vfdsetupbutt = ''
      var bgClr = FORTRESSPURPLE2
        var modBG = FORTRESSPURPLE1
        var txtClr = '#e1e1e1'
        var plArr = 'assets/play-arrow-fti.svg'
        var plStop = 'assets/stop-fti.svg'
        var vfdbutts = ''
        if(this.props.branding == 'SPARC'){
          modBG = SPARCBLUE1
          bgClr = SPARCBLUE2
          txtClr = '#000'
          plArr = 'assets/play-arrow-sp.svg'
          plStop = 'assets/stop-sp.svg'
        }

       var trnsmdl =    <Modal ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>Parameter Name: { this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>Current Language: {this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitChange}>Submit Translation</button>
        </Modal>
        var lsedit = this.state.tlist.map(function (l,i) {
          return <tr><td style={{color:"#e1e1e1"}}>{self.state.elist[i]}</td><td><input type='text' value={l} onChange={(e) => self.lChange(e,i)}/></td></tr>
          // body...
        })
        var listmdl = <Modal ref={this.listmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>List Name: { this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>Current Language: {this.props.language}</div>
        <table><tbody style={{maxHeight:400, overflow:'scroll', display:'block'}}>{lsedit}</tbody></table>
              <button onClick={this.submitList}>Submit Translation</button>
        </Modal>
  if(iod){
      if(iogreen){
        ioindicator = <div style={{position:'relative', width:50, display:'table-cell'}}><div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#5d5'}}></div></div>
      }else{
         ioindicator =<div style={{position:'relative', width:50, display:'table-cell'}}> <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#555'}}></div></div>
      }
      }
      if(vfdsetup){
        ioindicator = <img onClick={()=>this.vfdSModal.current.toggle()} src='assets/config.svg' style={{position:'absolute', width:30, height:30, left:15, top:10}}/>
        vfdsetupbutt =<Modal ref={this.vfdSModal} mobile={this.props.mobile} innerStyle={{background:modBG}}>

        <div>
          <div style={{color:txtClr}}>To set up this VFD unit, make sure all other VFD units are disconnected first. Press confirm to carry on with the setup.</div>
        <div onPointerUp={this.vfdSetup} style={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',margin:10,color:'#1C3746',fontSize:30,lineHeight:'40px'}} className={'circularButton_sp'}> <div style={{display:'inline-block'}}>Confirm</div></div>
        <div onPointerUp={()=>this.vfdSModal.current.toggle()} style={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',margin:10,color:'#1C3746',fontSize:30,lineHeight:'40px'}} className={'circularButton_sp'}><div style={{display:'inline-block'}}>Cancel</div></div> 
    </div></Modal>
      }
    if(!acc){
      
       if(vfdcont){
        vfdbutts = <Modal ref={this.vfdModal}  mobile={this.props.mobile} innerStyle={{background:modBG}}>

        <div>
          <div style={{color:txtClr}}>VFD Test</div>
        <div onPointerUp={this.vfdStart} style={{width:120, lineHeight:'60px',color:txtClr,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={'circularButton_sp'}> <img src={plArr} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
        <div onPointerUp={this.vfdStop} style={{width:120, lineHeight:'60px',color:txtClr,font:30, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={'circularButton_sp'}> <img src={plStop} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 
      </div></Modal>
       } 

      return <div>
     <div style={{display:'grid', gridTemplateColumns:"300px auto"}}>
     <div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:300,textAlign:'center'}}>
       <ContextMenuTrigger id={this.props.name + 'ctmid'}>
        {namestring}
         </ContextMenuTrigger>
      </div>
     </div>
     
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        {ioindicator}{vLabels}
      </div>
      </div>
      {vfdbutts}
      <div style={{zIndex:3}}>
       <ContextMenu id={this.props.name + 'ctmid'}>
        <MenuItem onClick={this.translatePopup}>
          Translate Setting
        </MenuItem>
       </ContextMenu>
      </div>
      {trnsmdl}
      {listmdl}
       <MessageModal ref={this.msgm}/>

      </div>
    }else{

      var multiDropdown = true;
      this.props.param.forEach(function (p) {
        if((typeof p['@labels'] == 'undefined') &&(p['@name'].indexOf('TestConfigCount') == -1)){
          multiDropdown = false;
        }
      })
        
      var options;
      //TODO - TRANSLATE LISTS
      if(multiDropdown){
         popupmenu = <MenuItem onClick={this.translateLists}>Translate List</MenuItem>
        var lists = this.props.param.map(function (p) {
          if(p['@name'].indexOf('TestConfigCount') != -1){
            return [0,1,2,3,4,5,6,7,8,9]
          }else{
            var list = []//
            if(typeof _pVdef[7][p["@labels"]] == 'undefined'){
              console.log(p, 6235)
            }
            if(typeof _pVdef[7][p["@labels"]]['english'] != 'undefined'){
              list =  _pVdef[7][p["@labels"]]['english'].slice(0)
            }

            if(typeof vMapLists[p['@labels']] != 'undefined'){
              list = vMapLists[p['@labels']]['english'].slice(0);
              if(self.props.language != 'english'){
              if(typeof vMapLists[p["@labels"]][self.props.language] != 'undefined'){
                list.forEach(function(lb,i){
                  if((typeof vMapLists[p["@labels"]][self.props.language][i] == 'string') &&(vMapLists[p["@labels"]][self.props.language][i].trim().length != 0)){
                    list[i] = vMapLists[p["@labels"]][self.props.language][i]
                  }
                })
              }
            }
            return list
            }else{
            if(self.props.language != 'english'){
              if(typeof _pVdef[7][p["@labels"]][self.props.language] != 'undefined'){
                list.forEach(function(lb,i){
                  if((typeof _pVdef[7][p["@labels"]][self.props.language][i] == 'string') &&(_pVdef[7][p["@labels"]][self.props.language][i].trim().length != 0)){
                    list[i] = _pVdef[7][p["@labels"]][self.props.language][i]
                  }
                })
              }
            }
            return list
          }
          }
        })
        lsedit = this.state.tlist.map(function (l,i) {
          return <tr><td  style={{color:"#e1e1e1"}}>{self.state.elist[i]}</td><td><input type='text' value={l} onChange={(e) => self.lChange(e,i)}/></td></tr>
          // body...
        })
      listmdl =  (<Modal ref={this.listmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>List Name: { this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>Current Language: {this.props.language}</div>
        <table><tbody style={{maxHeight:400, overflow:'scroll', display:'block'}}>{lsedit}</tbody></table>
              <button onClick={this.submitList}>Submit Translation</button>
        </Modal>)
        options = <PopoutWheel getToolTip={this.getToolTip} submitTooltip={this.submitTooltip} ovWidth={290} inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} mobile={this.props.mobile} params={this.props.param} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={namestring} ref={this.pw} val={this.state.val} options={lists} onChange={this.selectChanged}/>

        var bgClr = FORTRESSPURPLE2
        var txtClr = '#e1e1e1'
        if(this.props.branding == 'SPARC'){
          bgClr = SPARCBLUE2
          txtClr = '#000'
        }
        return  <div>
         <div style={{display:'grid', gridTemplateColumns:"300px auto"}}>
         <div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:300,textAlign:'center'}}>
         <ContextMenuTrigger id={this.props.name + 'ctmid'}>
        {namestring}
        </ContextMenuTrigger>
      </div></div>
      
      
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        {ioindicator}{vLabels}
      </div>
      </div>
      {options}
      {vfdsetupbutt}
      <div style={{zIndex:3}}>
       <ContextMenu id={this.props.name + 'ctmid'}>
        <MenuItem onClick={this.translatePopup}>
          Translate Setting
        </MenuItem>
        {popupmenu}
      </ContextMenu>
      </div>

      {trnsmdl}
      {listmdl}
       <MessageModal ref={this.msgm}/>
      </div>
      }else{
        options = this.state.val.map(function(v, i){
          if(typeof self.props.param[i]['@labels'] != 'undefined'){
            popupmenu = <MenuItem onClick={this.translateLists}>Translate List</MenuItem>

            var labs = _pVdef[7][self.props.param[i]["@labels"]]['english']
            
            return <PopoutWheel submitTooltip={self.submitTooltip} inputs={inputSrcArr} ovWidth={290} outputs={outputSrcArr} branding={self.props.branding} mobile={self.props.mobile} params={self.props.param}  ioBits={self.props.ioBits} vMap={self.props.vMap} language={self.props.language} interceptor={false} name={namestring} ref={self['input'+i]} val={[v]} options={[_pVdef[7][self.props.param[i]["@labels"]]['english']]} onChange={self.selectChanged} index={i}/>
          }else if(self.props.param[i]['@name'] == 'Timezone'){
            var labs = timezoneJSON.map(function(tz) {
              // body...
              return tz.text;
            })
            labs.unshift('')
                return <PopoutWheel submitTooltip={self.submitTooltip} inputs={inputSrcArr} ovWidth={500} outputs={outputSrcArr} branding={self.props.branding} mobile={self.props.mobile} params={self.props.param}  ioBits={self.props.ioBits} vMap={self.props.vMap} language={self.props.language} interceptor={false} name={namestring} ref={self['input'+i]} val={[v]} options={[labs]} onChange={self.selectChanged} index={i}/>
        
          }else{
            var num = true
            var minBool = false;
            var maxBool = false;
            var min = 0; 
            var max = 0;
            var float_dec = null;
            if(typeof self.props.param[i]['@float_dec'] != 'undefined'){
              float_dec = self.props.param[i]['@float_dec']
            }

            if(self.props.param[i]['@name'] == 'ProdName' || self.props.param[i]['@name'] == 'DspName'){ num = false }
            if(self.props.param[i]["@name"].indexOf('DateTime') != -1){dt = true;}
            if(typeof self.props.param[i]['@min'] != 'undefined'){
              if(!isNaN(self.props.param[i]['@min'])){
                minBool = true;
                min = self.props.param[i]['@min'];
              }else if(Array.isArray(self.props.param[i]['@min'])){
                var dep;
                if(self.props.param[i]['@min'].length == 2){
                  dep = self.getMMdep(self.props.param[i]['@min'][1])
                  min = eval(self.props.param[i]['@min'][0])(dep)
                  minBool = true;
                
                }else{
                  dep = self.props.param[i]['@min'].slice(1).map(function(d){
                    return self.getMMdep(d)
                  })
                    min = eval(self.props.param[i]['@min'][0]).apply(this, [].concat.apply([], [dep]));
                    minBool = true;
                }
                }else{
                min = self.getMMdep(self.props.param[i]['@min'])
                minBool = true;
              }
              if(self.props.param[i]['@type'] == 'mm' || self.props.param[i]['@type'] == 'float_dist' ){
                if(self.getMMdep('AppUnitDist') == 0){
                  min = min/25.4
                }
              }
              else if(self.props.param[i]['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  min = min/1000
                }else if(wunit == 2){
                  min = min/453.592
                }else if(wunit == 3){
                  min = min/28.3495
                }
              }
            }
            if(typeof self.props.param[i]['@max'] != 'undefined'){
              if(!isNaN(self.props.param[i]['@max'])){
                maxBool = true;
                max = self.props.param[i]['@max'];
              }else if(Array.isArray(self.props.param[i]['@max'])){
                var dep = self.getMMdep(self.props.param[i]['@max'][1])
                max = eval(self.props.param[i]['@max'][0])(dep)
                maxBool = true;
              }else{
                max = self.getMMdep(self.props.param[i]['@max'])
                maxBool = true;
              }
              if(self.props.param[i]['@type'] == 'mm' || self.props.param[i]['@type'] == 'float_dist' ){
                if(self.getMMdep('AppUnitDist') == 0){
                  max = max/25.4
                }
              }
              else if(self.props.param[i]['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  max = max/1000
                }else if(wunit == 2){
                  max = max/453.592
                }else if(wunit == 3){
                  max = max/28.3495
                }
              }
            }

            var lbl = namestring
            if(self.props.combo){ lbl = lbl + [' Delay', ' Duration'][i]}
              if(self.props.dt){
                return <DateTimeModal language={self.props.language} branding={self.props.branding} value={v} ref={self['input'+i]} onEdit={self.changeDT}/>
              }
              var dispV = v
              if(float_dec && !isNaN(dispV)){
                dispV = dispV.toFixed(float_dec)
              }

              return <CustomKeyboard floatDec={float_dec} sendAlert={msg => self.msgm.current.show(msg)} min={[minBool, min]} max={[maxBool, max]} submitTooltip={self.submitTooltip} branding={self.props.branding} mobile={self.props.mobile} 
               datetime={self.props.dt} language={self.props.language} tooltip={self.props.vMap['@translations'][self.props.language]['description']} vMap={self.props.vMap}  onFocus={self.onFocus} ref={self['input'+i]} onRequestClose={self.onRequestClose}
                onChange={self.valChanged} index={i} value={v} num={num} label={lbl + ' - ' + dispV}/>
            }
        })
              if(this.props.nameovr){
                namestring = this.props.nameovr
              }
               var bgClr = FORTRESSPURPLE2
        var txtClr = '#e1e1e1'
        if(this.props.branding == 'SPARC'){
          bgClr = SPARCBLUE2
          txtClr = '#000'
        }
     
     return <div>
     <div style={{display:'grid', gridTemplateColumns:"300px auto"}}>
      <div><div style={{display:'inline-block', verticalAlign:'top', position:'relative', color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:300,textAlign:'center'}}>
        <ContextMenuTrigger id={this.props.name + 'ctmid'}>
          {namestring}
        </ContextMenuTrigger>
      </div>
      </div>
     
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        {ioindicator}{vLabels}
      </div>
      </div>
      {options}
      {vfdsetupbutt}
      <div style={{zIndex:3}}>
       <ContextMenu id={this.props.name + 'ctmid'}>
        <MenuItem onClick={this.translatePopup}>
          Translate Setting
        </MenuItem>
        {popupmenu}
      </ContextMenu>
      </div>

      {trnsmdl}
      {listmdl}
      <MessageModal ref={this.msgm}/>
      </div>
    
      }
    }
      
    } 
}
class DisplaySettings extends React.Component{
  constructor(props){
    super(props)

  }
  editIP(v){
    this.props.soc.emit('nifip', v.toString())
  }
  editNM(v){
    this.props.soc.emit('nifnm', v.toString())
  }
  editGW(v){
    this.props.soc.emit('nifgw', v.toString())
  }
  sendPacket(n,v){

  }
  onSubmit(n,l,v){

  }
  render(){
    var titleColor = '#000'
      var className = "menuCategory expanded";
    var tstl = {display:'inline-block', textAlign:'center'}
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}}>
      <div style={tstl}>{'Display Settings'}</div></h2></span>)

 var nav = (<div className='setNav'>
                <div style={{marginTop:5}}><ProdSettingEdit trans={true} name={'Nif_ip'} vMap={vMapV2['Nif_ip']} submitChange={this.onSubmit} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_ip']['@translations'][this.props.language]['name']} value={this.props.nifip} editable={true} onEdit={this.editIP} param={{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                <div style={{marginTop:5}}><ProdSettingEdit trans={true} name={'Nif_nm'} vMap={vMapV2['Nif_nm']} submitChange={this.onSubmit} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_nm']['@translations'][this.props.language]['name']} value={this.props.nifnm} editable={true} onEdit={this.editNM} param={{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                
       
          </div>)

    return(
      <div className='settingsDiv' style={{backgroundColor:"#e1e1e1"}}>
     
      <div className={className}>
        {titlediv}{nav}
      </div>
      </div>
    );

  }
}
//Need something here for unused settings



/******************Settings Components end********************/

/******************Accounts start***********************/
class AccountControl extends React.Component{
  constructor(props){
    super(props)
    this.state = ({accounts:this.props.accounts, curlevel:0, username:'', pswd:'', newUser:false})
    this.selectChanged = this.selectChanged.bind(this);
//    this.addAccount = this.addAccount.bind(this);
//    this.removeAccount = this.removeAccount.bind(this);
    this.goBack = this.goBack.bind(this);
    this.pw = React.createRef();
    this.username = React.createRef();
    this.pswd = React.createRef();
  }
  goBack(){
    this.props.goBack();
  }
  selectChanged(v){
    this.setState({curlevel:v})
  }
//  addAccount(){
//    this.props.soc.emit('addAccount', {user:{user:this.state.username, acc:this.state.curlevel, password:this.state.pswd}, ip:this.props.ip})
//  }
//  removeAccount(account){
//    this.props.soc.emit('removeAccount', {ip:this.props.ip, user:account})
//  }
  onFocus(){

  }
  onUserChange(v){
    this.setState({username:v})
  }
  onPswdChange(v){
    this.setState({pswd:v})
  }
  onRequestClose(){

  }
  setLevel(){
    this.pw.current.toggle();
  }
  setUserName(){
    this.username.current.toggle();
  }
  setPassword(){
    this.pswd.current.toggle();
  }
  render(){
    var self = this;
    var levels = ['none','operator','technician','engineer']
    var pw     =  <PopoutWheel inputs={inputSrcArr} ovWidth={290} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Filter Events'} ref={this.pw} val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
    var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
    var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={'Password'}/>
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
    var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} ><div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
    var st = {padding:7,display:'inline-block', width:180}
    
    var accTableRows = [];
    
    this.props.accounts.forEach(function(ac,i){
      accTableRows.push(<AccountRow soc={self.props.soc} branding={self.props.branding} mobile={self.props.mobile} language={self.props.language} lvl={self.props.level} change={self.props.level > 3} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
    })
    
    var backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
            <label style={{color:'#000', fontSize:24}}>{'Back'}</label></div>)
    var tstl = {display:'inline-block', textAlign:'center'}
      var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
      
      if (this.state.font == 1){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
      }else if (this.state.font == 0){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
      }

    return <div>
      {userkb}
      {pswdkb}
      {pw}
    
    <div style={{height:525,background:'#e1e1e1'}}> 
    {titlediv}
    <div style={{ overflowY:'scroll',maxHeight:475}}>
    {accTableRows}
      </div>
      </div>  
    </div>
  }
}
class AccountRow extends React.Component{
  constructor(props){
    super(props);
    this.state = {username:this.props.username, acc:this.props.acc, password:this.props.password, changed:false}
    this.onUserChange = this.onUserChange.bind(this);
    this.onPswdChange = this.onPswdChange.bind(this);
    this.setLevel = this.setLevel.bind(this);
    this.setUserName = this.setUserName.bind(this);
    this.setPassword = this.setPassword.bind(this);
//    this.remove = this.remove.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.addAccount = this.addAccount.bind(this);
    this.valClick = this.valClick.bind(this);
    this.selectChanged = this.selectChanged.bind(this);
    this.msgm = React.createRef();
    this.ed = React.createRef();
    this.pw = React.createRef();
    this.pswd = React.createRef();
    this.username = React.createRef();
  }
  componentWillReceiveProps(props){
    if(!this.ed.current.state.show){
      this.setState({username:props.username, acc:props.acc, password:props.password})
    }
    
  }
  valClick(){
    //toast('Value Clicked')
    if(this.props.lvl >= 4){
      this.setState({changed:false})
      this.ed.current.toggle();
    }else{
      this.msgm.current.show('Access Denied')
    }
   
  }
  onUserChange(v){
    this.setState({username:v})
  }
  onPswdChange(v){
    var pswd = (v+'000000').slice(0,6)
    this.setState({password:pswd})//, changed:true})
  }
  setLevel(){
    if(this.props.change){
    
      var self = this;
      setTimeout(function(){
    
      self.pw.current.toggleCont();
      },80);
    }
  }
  selectChanged(v){
    this.setState({acc:v})//, changed:true})
  }
  setUserName(){
    if(this.props.change){
    
    var self = this;
    setTimeout(function(){
      self.username.current.toggle();
    },80)
    }
  }
  setPassword(){
    if(this.props.change){
      var self = this;
      setTimeout(function(){
        self.pswd.current.toggle();
      },80)
    }
  }
/*
  remove(){
    if(this.props.saved){
      this.props.soc.emit('removeAccount', {ip:this.props.ip, user:this.state.username})
    }else{
      this.setState({username:this.props.username, acc:this.props.acc, password:this.props.password})
    }
  }
*/
  saveChanges(){
    this.addAccount();
  
  }
  addAccount(){
    // console.log(8200, 'writeUserData', this.props.uid)
    this.props.soc.emit('writeUserData', {data:{username:this.state.username, acc:this.state.acc, password:this.state.password, user:this.props.uid}, ip:this.props.ip})
    
    //this.setState({changed:false})
  }
  render() {
    //////console.log(3243, this.props.mobile)
    var levels = ['0','1','2','3','4']
    
    var namestring = 'User'+ this.props.uid
    //////////console.log(['2692',namestring])
      
    var dt = false;
    var self = this;
    var fSize = 20;
    if(namestring.length > 24){
      fSize = 14
    }
    else if(namestring.length > 20){
      fSize= 16
    }else if(namestring.length > 12){
      fSize = 18
    }
    if(this.props.mobile){
      fSize -= 7;
      fSize = Math.max(13, fSize)
    }
    let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}

    var labWidth = (536/2)

    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
      var st = {textAlign:'center',lineHeight:'51px', height:60, width:536}

      
      st.fontSize = fSize//self.props.vst.fontSize;
      st.display = 'table-cell';//self.props.vst.display;
      
    if(this.props.mobile){
      labWidth = parseInt(100/2) + '%'
      vlabelswrapperStyle.width = '60%'
      lvst.verticalAlign = 'middle'
      lvst.lineHeight = '25px'
      st.height = 51
      st.lineHeight = '51px'
      st.display = 'inline-block'
      st.width = '100%'
      
    }
    //st.width = '100%'
    
    var valArray = [this.state.username, this.state.acc]
    
      var vLabels = valArray.map(function(d,i){
      var val = ""
      if(typeof d != 'undefined'){
        val = d
      }
      var cst = Object.assign({},st)
      if(val.length > 40){
        cst.fontSize = 20
      }
      cst.width = labWidth
      return (<CustomLabel index={i} onClick={self.valClick} style={cst}>{val}</CustomLabel>)
    })


     var bgClr = FORTRESSPURPLE2
     var modBG = FORTRESSPURPLE1
        var txtClr = '#e1e1e1'
        if(this.props.branding == 'SPARC'){
          modBG = SPARCBLUE1
          bgClr = SPARCBLUE2
          txtClr = '#000'
        }
      
      var pw = this.state.username!='ADMIN' && <PopoutWheel branding={this.props.branding} ovWidth={290} inputs={inputSrcArr} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Set Level'} ref={this.pw} val={[this.state.acc]} options={[levels]} onChange={this.selectChanged}/>
    var userkb = this.state.username!='ADMIN' && <CustomKeyboard branding={this.props.branding} language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
    var pswdkb = <CustomKeyboard branding={this.props.branding} language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={'Password'}/>
      
      var edit = <Modal mobile={this.props.mobile} ref={this.ed} onClose={this.saveChanges} innerStyle={{background:modBG}}>
      <div style={{textAlign:'center', background:'#e1e1e1', padding:10}}>

        <div style={{marginTop:5}} onClick={() => this.username.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{'Username: '}
        </div>    <div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}><label style={st}>{this.state.username}</label></div></div>
        <div style={{marginTop:5}} onClick={() => this.pswd.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{'Password: '}
        </div>    <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}><label style={st}>{this.state.password.split("").map(function(c){return '*'}).join('')}</label></div></div>
        <div style={{marginTop:5}} onClick={() => this.pw.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{'Level: '}
        </div>    <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}><label style={st}>{this.state.acc}</label></div></div>
      </div>
        {pw}{userkb}{pswdkb}
      </Modal>
  
      var num = true
      var lbl = namestring


      return(<div style={{marginTop:5}}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}}>
        {namestring}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        {vLabels}
      </div>
      {edit}

      <MessageModal ref={this.msgm}/>
      </div>)
      //return(<div className={'sItem noChild'}><div><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>{edit}</div>)
  }
}
class LogInControl2 extends React.Component{
  constructor(props){
    super(props)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this);
    this.selectChanged = this.selectChanged.bind(this);
    var list = []
    this.props.accounts.forEach(function(ac){
      list.push(ac.username + ' (level ' + ac.acc+')')
    })
    list.unshift('Not Logged In')
    this.state = {val:0, list:list, showAcccountControl:false, open:false}
    this.enterPIN = this.enterPIN.bind(this);
    this.valChanged = this.valChanged.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onRequestClose = this.onRequestClose.bind(this);
    this.toggleAccountControl = this.toggleAccountControl.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.pw = React.createRef();
    this.psw = React.createRef();
    this.msgm = React.createRef();
  }
  componentWillReceiveProps(props){
    var list = []
    props.accounts.forEach(function(ac){
      list.push(ac.username +' (level ' + ac.acc+')')
    })
    list.unshift('Not Logged In')
    if(!this.props.isOpen){

      this.setState({val:props.val, list:list})
    }else{
      ////console.log('this was the issue... why Though?')
      this.setState({list:list})
    }
    
  }
  componentDidMount(){
    this.setState({showAcccountControl:false})
  }
  login(){
    var self = this;
    setTimeout(function(){
      self.pw.current.toggleCont();
      self.setState({open:true})
    },100)
    
  }
  logout(){
    this.props.logout();
  }
  selectChanged(v,i){
    ////console.log(['1531',v])
    var self = this;
    setTimeout(function(){
      if(v != 0){
      self.psw.current.toggle();      
    }

    }, 100)
    self.setState({val:v})
    

    //this.props.login(v)
  }
  enterPIN(){
    this.psw.current.toggle();
  }
  onFocus(){
    this.setState({open:true})
  }
  onRequestClose(){
    var self = this;
    this.setState({open:false})
    setTimeout(function(){
      self.props.onRequestClose();
    },100)
      
  }
  valChanged(v){
    //////console.log(v)
    //this.props.authenticate(this.state.list[this.state.val], v)
    ////console.log(this.state.val)
    if(this.props.pass6 == 0){
      if(v.length == 6){
        this.props.authenticate(this.state.val,v)
      }else{
        this.msgm.current.show('Password should be 6 characters')
      }
    }else{
      if(v.length == 4){
        this.props.authenticate(this.state.val,v)
      }else{
        this.msgm.current.show('Password should be 4 characters')
      }
    }
    
  }
  toggleAccountControl(){
    if(this.props.level > 2){
      this.setState({showAcccountControl:!this.state.showAcccountControl})
    }else{
      this.msgm.current.show('Access Denied')
    }
    
  }
  onCancel(){
    ////console.log('on cancel')
    var self = this;
    this.setState({open:false})
    setTimeout(function(){
      self.props.onRequestClose();
    },100)
      
  }

  render(){
    var list = this.state.list
    var namestring = 'Select User'
    var pw = <PopoutWheel inputs={inputSrcArr} tooltipOv={true} tooltip={vdefMapV2['@tooltips']['Select User'][this.props.language]} outputs={outputSrcArr} ovWidth={290} branding={this.props.branding} mobile={this.props.mobile} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref={this.pw} val={[this.props.val]} options={[list]} onChange={this.selectChanged} onCancel={this.onCancel}/>

    return <React.Fragment>{pw}
      <CustomKeyboard branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.psw} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
    <MessageModal ref={this.msgm}/>
    </React.Fragment> 
  }
}
class UserPassReset extends React.Component{
  constructor(props){
    super(props)
    this.state = {pack:{}}
    this.show = this.show.bind(this);
    this.psw = React.createRef();     
    this.msgm = React.createRef();
    this.valChanged = this.valChanged.bind(this);
  }
  show(pack){
    var self = this;
    this.setState({pack:pack})
    setTimeout(function(){
      self.psw.current.toggle()
    },150)
  }
  onFocus(){

  }
  onRequestClose(){

  }
  valChanged(v){
    if(this.props.pass6 == 0){
      if(v.length == 6){
        this.props.resetPassword(this.state.pack,v)
      }else{
        this.msgm.current.show('Password should be 6 characters')
      }
    }else{
      if(v.length == 4){
        this.props.resetPassword(this.state.pack,v)
      }else{
        this.msgm.current.show('Password should be 4 characters')
      }
    }
  }
  render(){
    return <React.Fragment><CustomKeyboard mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.psw} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Reset Password'}/>
    <MessageModal ref={this.msgm} />
    </React.Fragment>
  }
}
/******************Accounts end***********************/

/******************Stats Components start*******************/
class StatSummary extends React.Component{
  constructor(props){
    super(props)
    this.parsePack = this.parsePack.bind(this);
    this.state = {count:0, grossWeight:0,currentWeight:0, rec:{},crec:{},lw:'0.0 g', pkgwgt:0}
  }
  parsePack(max){
    this.setState({count:this.state.count+1,grossWeight:this.state.grossWeight + max,currentWeight:max})

  }
  render(){
    var outerbg = '#818a90'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    //if(this.props.branding == 'SPARC'){
      outerbg = '#e1e1e1'
    
    if(this.props.branding == 'SPARC'){ 
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    //}

    var av = 0;
    if(this.state.count != 0){
      av = (this.state.grossWeight/this.state.count)
    }
    var grstr;
    if(this.state.grossWeight < 10000){
      grstr = this.state.grossWeight.toFixed(1)+'g'
    }else if(this.state.grossWeight < 10000000){
      grstr = (this.state.grossWeight/1000).toFixed(3)+'kg'
    }else{
      grstr = (this.state.grossWeight/1000000).toFixed(3)+'t'
    }
    var grswt = 0;
    var avg = 0;
    var stdev = 0;
    var tot = 0;
    var gvb = 0;
    var gvs = 0;
    var savg = 0;
    var sstdev = 0;
    var stot = 0;
    var ppm = 0;
    var sppm = 0;
    var unit = 0;
    var pkgwgt = this.state.pkgwgt
    if(typeof this.props.unit != 'undefined'){
      unit = this.props.unit
    }
    if(!isNaN(this.state.crec['PackWeight'])){
      grswt = FormatWeight(this.state.crec['PackWeight']+pkgwgt, unit)//this.state.crec['PackWeight'].toFixed(1) + 'g'
      avg = FormatWeight(this.state.crec['AvgWeight'], unit)//this.state.crec['AvgWeight'].toFixed(1) +'g'
      savg = FormatWeight(this.state.crec['SampleAvgWeight'], unit)//this.state.crec['SampleAvgWeight'].toFixed(1) + 'g'
      stdev = FormatWeightD(this.state.crec['StdDev'], unit, 2)
      sstdev = FormatWeightD(this.state.crec['SampleStdDev'], unit, 2)
      tot = FormatWeightS(this.state.crec['TotalWeight'], unit)//this.state.crec['TotalWeight'].toFixed(1)+'g'
      stot = FormatWeightS(this.state.crec['SampleTotalWeight'], unit)//this.state.crec['SampleTotalWeight'].toFixed(1)+'g'
      gvb = FormatWeightS(this.state.crec['GiveawayBatch'], unit)//this.state.crec['GiveawayBatch'].toFixed(1)+'g'
      gvs = FormatWeightS(this.state.crec['SampleGiveawayBatch'], unit)//this.state.crec['SampleGiveawayBatch'].toFixed(1)+'g'
      pkgwgt = FormatWeight(pkgwgt, unit)
     // if(this.state.crec['Batch_PPM']){
        ppm = this.state.crec['Batch_PPM'].toFixed(0) + 'ppm'
      //}
      sppm = this.state.crec['Sample_PPM'].toFixed(0) + 'ppm'
      
    }
  return  <div style={{width:260,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0, height:515}}>
      <div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:140,paddingLeft:2, fontSize:16,lineHeight:'24px', color:fontColor}}>Summary</div></div>
      <StatControl language={this.props.language} vMap={vMapV2['LiveWeight']['@translations']} pram={'LiveWeight'} name={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={this.state.lw} submitChange={this.props.submitChange}/>
      <StatControl language={this.props.language} vMap={vMapV2['NetWeight']['@translations']} pram={'NetWeight'} name={'Gross Weight'}  submitChange={this.props.submitChange} value={grswt}/>
      <StatControl language={this.props.language} vMap={vMapV2['PkgWeight']['@translations']} pram={'PkgWeight'} name={vMapV2['PkgWeight']['@translations'][this.props.language]['name']}  submitChange={this.props.submitChange} value={pkgwgt}/>
      <BatchStatControl name={labTransV2['@TotalWeightBS'][this.props.language]['name']} pram={'@TotalWeightBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={tot} sample={stot}/>
      <BatchStatControl name={labTransV2['@AvgWeightBS'][this.props.language]['name']} pram={'@AvgWeightBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={avg} sample={savg}/>
      <BatchStatControl name={labTransV2['@StdDevBS'][this.props.language]['name']} pram={'@StdDevBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={stdev} sample={sstdev}/>
      <BatchStatControl name={labTransV2['@GiveAwayBS'][this.props.language]['name']} pram={'@GiveAwayBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={gvb} sample={gvs}/>
      <BatchStatControl name={labTransV2['@ProductionRateBS'][this.props.language]['name']} pram={'@ProductionRateBS'} submitChange={this.props.submitLabChange} language={this.props.language} batch={ppm} sample={sppm}/>

    </div>
  }
}
class StatControl extends React.Component{
  constructor(props){
    super(props)
    this.state = {curtrns:this.props.name}
    this.translateModal = React.createRef();
    this.translate = this.translate.bind(this)
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
  }
  onChange(e){
    this.setState({curtrns:e.target.value})
  }
  translate(){
    this.translateModal.current.toggle();
  }
  submit(){
    this.props.submitChange(this.props.pram, this.props.language, this.state.curtrns)
  }
  render(){
    var uid = uuidv4()
    return <div style={{height:61}}>
    <div style={{textAlign:'left', paddingLeft:2, fontSize:16}}><ContextMenuTrigger id={uid}>{this.props.name}</ContextMenuTrigger>
    <ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu>
    </div>
    <div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:25}}>{this.props.value}</div>
    <Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
        <div>{this.props.vMap['english']['name']}</div>
        <div>
          Current Language: {this.props.language}
        </div>
         <input type='text' style={{fontSize:20, width:300}} value={this.state.curtrns} onChange={this.onChange}/>
         <button onClick={this.submit}>Submit Change</button>
        </Modal>
    </div>
  }
}
class StatDisplay extends React.Component{
  constructor(props){
    super(props)
    var rec = 0;
    if(typeof _pVdef[0][this.props.pram] != 'undefined'){
      rec = 0;
    }else if(typeof _pVdef[1][this.props.pram] != 'undefined'){
      rec = 1;
    }
    var pram = _pVdef[rec][this.props.pram];

    this.state = {curtrns:this.props.name, param:pram}
    this.translateModal = React.createRef();
    this.translate = this.translate.bind(this)
    this.onChange = this.onChange.bind(this);
    this.submit = this.submit.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.msgm = React.createRef();
    this.ed = React.createRef();
    this.editSetting = this.editSetting.bind(this);
    this.onInput = this.onInput.bind(this); 
  }
  onChange(e){
    this.setState({curtrns:e.target.value})
  }
  translate(){
    this.translateModal.current.toggle();
  }
  submit(){
   // this.props.submitChange(this.props.pram, this.props.language, this.state.curtrns)
  }
  getMMdep(d){
    //var res = vdefByMac[this.props.mac];
    return this.props.getMMdep(d)
  
  }
  onInput(v){
    var self = this;
    // console.log('onInput',v)
    var val = v;
    if(val != null && val.toString() != ''){
  
    if(typeof this.state.param['@decimal'] != 'undefined'){
      if(this.state.param['@decimal'] > 0){
          val = val * Math.pow(10,this.state.param['@decimal'])
        
      }
    }
    if(this.state.param['@bit_len'] > 16){
      val = v//
    }
       this.props.onEdit(this.state.param,val);
       if(typeof this.props.afterEdit != 'undefined'){
        setTimeout(function(){
          self.props.afterEdit();
        },1000)
       }
    }
  }
  editSetting(){
    var self = this;
    if(this.props.acc){
      if(this.props.pAcc){
          setTimeout(function(){
             self.ed.current.toggle();
       
          },100)
     
          }else{
            this.msgm.current.show('Access Denied')
          }      
    }
  }
  render(){
    var self = this;
    var uid = uuidv4()
     var ckb;
     var num =true;
    if(this.props.acc){
      if(this.state.param['@labels']){
        var list = _pVdef[7][this.state.param["@labels"]]['english'].slice(0);
        var lists = [list]
        ckb = <PopoutWheel inputs={[]} outputs={[]} branding={this.props.branding} ovWidth={290} mobile={this.props.mobile} params={[this.state.param]} ioBits={{}} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={this.props.name} ref={this.ed} val={[this.props.rVal]} options={lists} onChange={this.onInput}/>

      }else{
        var minBool = false; 
        var min = 0;
        var maxBool = false;
        var max = 0;
        if(typeof self.state.param['@min'] != 'undefined'){
              if(!isNaN(self.state.param['@min'])){
                minBool = true;
                min = self.state.param['@min'];
              }else if(Array.isArray(self.state.param['@min'])){
               //var dep = 
                var dep = self.getMMdep(self.state.param['@min'][1])
                min = eval(self.state.param['@min'][0])(dep)
                minBool = true;
              }else{
                min = self.getMMdep(self.state.param['@min'])
                minBool = true;
              }
              if(self.state.param['@type'] == 'mm' || self.state.param['@type'] == 'float_dist'){
                if(self.getMMdep('AppUnitDist') == 0){
                  min = min/25.4
                }
              }else if(self.state.param['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  min = min/1000
                }else if(wunit == 2){
                  min = min/453.592
                }else if(wunit == 3){
                  min = min/28.3495
                }
              }
            }
            if(typeof self.state.param['@max'] != 'undefined'){
              if(!isNaN(self.state.param['@max'])){
                maxBool = true;
                max = self.state.param['@max'];
              }else if(Array.isArray(self.state.param['@max'])){
               //var dep = 
                var dep = self.getMMdep(self.state.param['@max'][1])
                max = eval(self.state.param['@max'][0])(dep)
                maxBool = true;
              }else{
                max = self.getMMdep(self.state.param['@max'])
                maxBool = true;
              }
              if(self.state.param['@type'] == 'mm'  || self.state.param['@type'] == 'float_dist'){
                if(self.getMMdep('AppUnitDist') == 0){
                  max = max/25.4
                }
              }else if(self.state.param['@type'] == 'weight'){
                var wunit = self.getMMdep('WeightUnits')
                if(wunit == 1){
                  max = max/1000
                }else if(wunit == 2){
                  max = max/453.592
                }else if(wunit == 3){
                  max = max/28.3495
                }
              }
            }


        ckb = <CustomKeyboard sendAlert={msg => this.msgm.current.show(msg)} min={[minBool,min]} max={[maxBool,max]} preload={this.state.param['@name'] == 'ProdName'} 
                    branding={this.props.branding} ref={this.ed} language={this.props.language} tooltip={this.props.tooltip} onRequestClose={this.onRequestClose} onFocus={this.onFocus} 
                    num={num} onChange={this.onInput} value={this.props.value} label={this.props.name+': ' + this.props.value} submitTooltip={this.submitTooltip}/>

      }
    
    }
    var unEditableContent = this.props.name=='Weigh Conveyor Length' || this.props.name=='Weight Photoeye Distance';
    return <div style={{height:55, paddingTop:10, width:'100%', borderBottom:"2px solid #888", backgroundColor: unEditableContent && "#ccc"}} >
    <div onClick={this.editSetting}><div style={{textAlign:'center',fontSize:14}}>{this.props.name}</div>
    <div style={{textAlign:'center',lineHeight:1.4, fontSize:14}} >{this.props.value}</div></div>
      {ckb}
      <MessageModal ref={this.msgm}/>
    </div>
  }
}
class BatchStatControl extends React.Component{
  constructor(props){
    super(props)
      this.state = {curtrns:this.props.name}
    this.translateModal = React.createRef();
    this.translate = this.translate.bind(this)
    this.onChange = this.onChange.bind(this);  
    this.submit = this.submit.bind(this);
  }
  onChange(e){
    this.setState({curtrns:e.target.value})
  }
  translate(){
    this.translateModal.current.toggle();
  }
  submit(){
    this.props.submitChange(this.props.pram, this.props.language, this.state.curtrns)
  }
  render(){
    var uid = uuidv4()
    var batchFont = 25
    if(this.props.batch.length > 9){
      batchFont = 20;
    }
    var sampleFont = 25;
    if(this.props.sample.length >9){
      sampleFont = 20;
    }
    if(this.props.batch.length > 12){
      batchFont = 18
    }
    if(this.props.sample.lenght > 12){
      sampleFont = 18;
    }
    return <div style={{height:61}}>
    <div style={{textAlign:'left', paddingLeft:2, fontSize:16}}><ContextMenuTrigger id={uid}>{this.props.name}</ContextMenuTrigger>
    <ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu></div>
    <div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:batchFont, whiteSpace:'nowrap'}}><div style={{display:'inline-block', width:'50%'}}>{this.props.batch}</div><div style={{display:'inline-block', width:'50%'}}>{this.props.sample}</div></div>
     <Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
         <input type='text' style={{fontSize:20, width:300}} value={this.state.curtrns} onChange={this.onChange}/>
         <button onClick={this.submit}>Submit Change</button>
        </Modal>
    </div>
  }
}
class SparcElem extends React.Component{
  constructor(props){
    super(props)
    this.state = {value:this.props.value}
  }
  componentWillReceiveProps(newProps){
    this.setState({value:newProps.value})
  }

  render(){
    var outerbg ='#e1e1e1'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'

    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    var innerWidth = Math.min((this.props.width*0.55),160);
    var innerFont = Math.min(Math.floor(this.props.font/2), 16);
    return(<div style={{width:this.props.width,background:outerbg, borderRadius:10, marginTop:5,marginBottom:5, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:fontColor, lineHeight:'24px'}}>{this.props.name}</div></div><div style={{textAlign:'center', marginTop:-10,lineHeight:this.props.font*1.3+'px',height:this.props.font*1.3, fontSize:this.props.font}}>{this.state.value}</div>
    </div>)
  }
}
class StatusElem extends React.Component{
  constructor(props){
    super(props)
    this.state = {value:this.props.value, reject:false, msg:'', showMsg:false}
    this.fModal = React.createRef();
    this.toggleFault = this.toggleFault.bind(this);
    this.clearFaults = this.clearFaults.bind(this);
    this.clearWarnings = this.clearWarnings.bind(this);
    this.showMsg = this.showMsg.bind(this);
  }
  componentWillReceiveProps(newProps){
    this.setState({value:newProps.value})
  }
  showMsg(m){
    var self = this;
    this.setState({showMsg:true, msg:m})
    setTimeout(function () {
      // body...
      self.setState({showMsg:false, msg:''})
    }, 1500)

  }
  maskFault(){

  }
  clearFaults(){
    this.props.clearFaults();
    this.fModal.current.toggle();
  }
  clearWarnings(){
     this.props.clearWarnings();
    this.fModal.current.toggle();
  }
  toggleFault(f){
    if(f){
      this.fModal.current.toggle();
    }
  }
  render(){
    var outerbg ='#e1e1e1'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    var bg2 = 'rgba(150,150,150,0.5)'
   var modBg = FORTRESSPURPLE1
    if(this.props.branding == 'SPARC'){
      outerbg = '#e1e1e1'
      innerbg = SPARCBLUE2
      modBg = SPARCBLUE2
      fontColor = 'black'
    //  graphColor = SPARCBLUE2;
      bg2 = 'rgba(150,150,150,0.5)'
    }
    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    var innerWidth = Math.min((this.props.width*0.55),160);
    var innerFont = Math.min(Math.floor(this.props.font/2), 16);
      var bg = 'transparent';
  var str = 'Connecting...'
  var fault = false

var prodFont = 25;
var prodName = ''
if(typeof this.props.prodName != 'undefined'){
  prodName = this.props.prodName
   
}
if(prodName.length > 17){
    prodFont = 22
  } 


  //if(this.)
  if(this.props.connected){
  if(vMapLists){
    str = vMapLists['WeightPassed']['english'][this.props.weightPassed]
    if(this.props.weightPassed%2 == 0){
      outerbg = '#39ff14' //neon green
    }else if(this.props.weightPassed == 9){
      outerbg = 'royalblue'
    }else if(this.props.weightPassed%2 == 1){
      outerbg = '#ff9300'
    }
  }
  if(this.state.reject){

    outerbg = 'ff9300'
  }
  if(this.props.warnings.length != 0){
    if(this.props.warnings.length == 1){
      if(typeof vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask'] != 'undefined'){
        str = vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask']['@translations']['english']['name'] + ' active'
      }else{
        str = this.props.warnings[0] + ' active'  
      }
      
    }else{
      str = this.props.warnings.length + ' warnings active'
    }
    fault = true
    outerbg = 'orange'
  }
  if(this.props.faults.length != 0){
     if(this.props.faults.length == 1){
      if(typeof vMapV2[this.props.faults[0]+'Mask'] != 'undefined'){
        str = vMapV2[this.props.faults[0]+'Mask']['@translations']['english']['name'] + ' fault active'
      }else{
        str = this.props.faults[0] + ' active'  
      }
      
    }else{
      str = this.props.faults.length + ' faults active'
    }
    fault = true
    outerbg = 'red'
  }
  
  if(this.state.showMsg){
    str = this.state.msg;
  }

  

  }
    return(<div style={{width:this.props.width,background:outerbg, borderRadius:10, marginTop:5,marginBottom:5, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div style={{display:'grid', gridTemplateColumns:'160px auto'}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:fontColor, lineHeight:'24px'}}>{this.props.name}</div><div style={{display:'inline-block', fontSize:prodFont, textAlign:'center', lineHeight:'25px', verticalAlign:'top'}}>{this.props.prodName}</div></div>
       <div style={{textAlign:'center', marginTop:-3,lineHeight:39+'px',height:39, fontSize:25, whiteSpace:'nowrap',display:'grid', gridTemplateColumns:'160px auto'}}><div></div><div style={{display:'inline-block', textAlign:'middle'}} onClick={()=>this.toggleFault(fault)}>{this.props.weighingMode==1 && str==='Low Pass' ? 'between T1/T2':str}</div></div>
          <Modal ref={this.fModal} innerStyle={{background:modBg}}>
            <div style={{color:'#e1e1e1'}}><div style={{display:'block', fontSize:30, textAlign:'left', paddingLeft:10}}>Faults</div></div>
     
          <FaultDiv branding={this.props.branding} pAcc={this.props.pAcc} maskFault={this.maskFault} clearFaults={this.clearFaults} clearWarnings={this.clearWarnings} faults={this.props.faults} warnings={this.props.warnings}/>
        </Modal>

    </div>)
  }
}
/******************Stats Components end*********************/


/********************Graphs Start********************/
class BatchPackCountGraph extends React.Component{
	constructor(props){
		super(props)
    this.toggle = this.toggle.bind(this);
		this.state = {batchData:[0, 0, 0, 0, 0, 0, 0, 0], sampleData:[0, 0, 0, 0, 0, 0, 0, 0],batch:true, batchStartTime:'', sampleStartTime:''}
	}
	parseCrec(crec){
		var data = this.state.batchData.slice(0);
    var sampleData = this.state.sampleData.slice(0);
		data[0] = crec['TotalCnt']
		data[1] = crec['PassWeightCnt'];
		data[2] = crec['LowPassCnt'];
		data[3] = crec['LowRejCnt']; 
		data[4] = crec['HighCnt'];
		data[5] = crec['UnsettledCnt']
		//data[6] = crec['ImprobableCnt']
    data[6] = crec['MetalRejectCnt']
    data[7] = crec['CheckWeightCnt']
    
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    //sampleData[6] = crec['SampleImprobableCnt']
    sampleData[6] = crec['SampleMetalRejectCnt']
    sampleData[7] = crec['SampleCheckWeightCnt']

    var bst = ''
    var sst = ''
    if(crec['BatchStartMS'] != 0){
      bst = crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' ')
    }
    if(crec['SampleStartMS'] != 0){
      sst = crec['SampleStartDate'].toISOString().slice(0,19).split('T').join(' ')
    }

    // this.setState({batchData:data, sampleData:sampleData, batchStartTime:bst,sampleStartTime:sst})
    this.setState({batchData:data, sampleData:sampleData, batchStartTime:bst,sampleStartTime:sst, weighingMode2:crec["WeighingMode2"]})

	}
	parsePack(pack){
		var data = [0,0,0,0,0,0,0,0]//this.state.data.slice(0)
		data[0]++;
		if(pack<85){
			data[1]++;
		}else if(pack<88){
			data[2]++
		}else if(pack<92){
			data[3]++
		}else if(pack<94){
			data[4]++
		}else if(pack<96){
			data[5]++
		}else if(pack<100){
			data[6]++
		}
		//this.setState({data:data})
	}	
  toggle(){
    this.setState({batch:!this.state.batch})
  }
  translateCounts(){

  }
	render(){
		var outerbg = '#e1e1e1'
		var self = this;
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'
		var graphColor = FORTRESSPURPLE2
		if(this.props.branding == 'SPARC'){
			innerbg = SPARCBLUE2
			fontColor = 'black'
			graphColor = SPARCBLUE2;
		}
		var xDomain = [0,15]
		var yDomin = [0, 5]
    var selData;
    var bText;
    var bsttxt = 'Batch Started at: '+this.state.batchStartTime
    var max = 0;
    var showCount = false
    if(this.state.batch){
      bText = 'Batch'
      showCount = ((this.props.bRunning != 0) && (this.props.bCount != 0) && (this.state.batchData[0] > 0))
      selData = this.state.batchData.slice(0)
    }else{
      bText = 'Sample'
      bsttxt = 'Sample Started at: '+this.state.sampleStartTime
      selData = this.state.sampleData.slice(0)
    }
    
    max = Math.max(...selData)
    var xDm = [0,max]
    if(max == 0){
      xDm = [0,1]
    }
    
		var data = [{x: selData[0], y:vMapV2['TotalCnt']['@translations'][this.props.language]['name']}, {x: selData[1], y:vMapV2['PassWeightCnt']['@translations'][this.props.language]['name']}, {x: selData[2], y:vMapV2['LowPassCnt']['@translations'][this.props.language]['name']},
     {x: selData[3], y:vMapV2['LowRejCnt']['@translations'][this.props.language]['name']}, {x:selData[4], y:vMapV2['HighCnt']['@translations'][this.props.language]['name']}, {x:selData[5], y:vMapV2['UnsettledCnt']['@translations'][this.props.language]['name']}, {x:selData[6], y:vMapV2['MetalRejectCnt']['@translations'][this.props.language]['name']},{x:selData[7], y:vMapV2['CheckWeightCnt']['@translations'][this.props.language]['name']}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
		
    if (this.state.weighingMode2 == 1){
    var data = [{x: selData[0], y:vMapV2['TotalCnt']['@translations'][this.props.language]['name']}, {x: selData[1], y:vMapV2['PassWeightCnt']['@translations'][this.props.language]['name']}, {x: selData[2], y:vMapV2['BetweenT1T2']['@translations'][this.props.language]['name']},
    {x: selData[3], y:vMapV2['LowRejCnt']['@translations'][this.props.language]['name']}, {x:selData[4], y:vMapV2['HighCnt']['@translations'][this.props.language]['name']}, {x:selData[5], y:vMapV2['UnsettledCnt']['@translations'][this.props.language]['name']}, {x:selData[6], y:vMapV2['MetalRejectCnt']['@translations'][this.props.language]['name']},{x:selData[7], y:vMapV2['CheckWeightCnt']['@translations'][this.props.language]['name']}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
    }
    var labelData = data.map(function(d, i){
			var lax = 'start'
      var label = d.x
      var ofs = 0
      if(showCount && i == 1){
        if ( typeof self.props.bCount != 'undefined' ){
          label = label + '/' + self.props.bCount
        }
       // lax = 'end'
       // ofs = -20
      }
			if(d.x > (data[0].x*0.66)){
				lax = 'end'
				return {x:d.x,y:d.y,label:label, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
			}
			return	{x:d.x,y:d.y,label:label, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
		})
    var butt = <div onClick={this.toggle} style={{width:77, fontSize:18, textAlign:'center'}}>{bText}</div>
		//var hh = 
		return <div style={{position:'relative',width:380, height:515,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

			<div style={{marginBottom:30}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24,lineHeight:'24px', width:150,paddingLeft:2, fontSize:16, color:fontColor}}>Statistics</div></div>
      <div style={{position:'absolute', left:295, top:0, marginTop:-2,borderTopRightRadius:10, borderBottomLeftRadius:10, border:'5px solid rgb(129, 138, 144)'}}>{butt}</div>
      <div style={{fontSize:16, marginLeft:10, marginTop:-10, height:30}}>{bsttxt}</div>
		<XYPlot	height={430} width= {380} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal' xDomain={xDm}>		
  
    <HorizontalBarSeries data={data} color={graphColor} />
    <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
  <XAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} hideTicks={max<1} orientation="bottom" tickSizeOuter={0} tickFormat={val => Math.round(val) === val ? val : ""}/>
  <YAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="left" tickSizeOuter={0} tickFormat={tickFormatter}/>
		</XYPlot>
		</div>
	}
}
class BatchBarGraph extends React.Component{
  constructor(props){
    super(props)
    this.toggle = this.toggle.bind(this);
    var data = [0, 0, 0, 0, 0, 0, 0, 0,0];
    var sampleData = [0, 0, 0, 0, 0, 0, 0, 0,0];
    var crec = this.props.crec
    if(this.props.crec['TotalCnt']){
      data[0] = crec['TotalCnt']
    data[1] = crec['PassWeightCnt'];
    data[2] = crec['LowPassCnt'];
    data[3] = crec['LowRejCnt']; 
    data[4] = crec['HighCnt'];
    data[5] = crec['UnsettledCnt']
    //data[6] = crec['ImprobableCnt']

    data[6] = crec['CheckWeightCnt']
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    //sampleData[6] = crec['SampleImprobableCnt']
    sampleData[6] = crec['SampleCheckWeightCnt'] 
    }
    this.state = {batchData:data, sampleData:sampleData,batch:true, batchStartTime:'', sampleStartTime:''}
  }
 componentWillReceiveProps(newProps){
  var data = this.state.batchData.slice(0);
    var sampleData = this.state.sampleData.slice(0);
    var crec = newProps.crec;
    data[0] = crec['TotalCnt']
    data[1] = crec['PassWeightCnt'];
    data[2] = crec['LowPassCnt'];
    data[3] = crec['LowRejCnt']; 
    data[4] = crec['HighCnt'];
    data[5] = crec['UnsettledCnt']
   // data[6] = crec['ImprobableCnt']

    data[6] = crec['CheckWeightCnt']
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    //sampleData[6] = crec['SampleImprobableCnt']
    sampleData[6] = crec['SampleCheckWeightCnt']
    this.setState({batchData:data, sampleData:sampleData, batchStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' '),sampleStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' ')})
  }

  
  toggle(){
    this.setState({batch:!this.state.batch})
  }
  translateCounts(){

  }
  render(){
    var outerbg = '#e1e1e1'
      
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'
    var graphColor = FORTRESSPURPLE2
    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
      graphColor = SPARCBLUE2;
    }
    var xDomain = [0,15]
    var yDomin = [0, 5]
    var selData;
    var bText;
    var bsttxt = 'Batch Started at: '+this.state.batchStartTime
    if(this.state.batch){
      bText = 'Batch'

      selData = this.state.batchData.slice(0)
    }else{
      bText = 'Sample'
      bsttxt = 'Sample Started at: '+this.state.sampleStartTime
      selData = this.state.sampleData.slice(0)
    }
    var data = [{x: selData[0], y:vMapV2['TotalCnt']['@translations'][this.props.language]['name']}, {x: selData[1], y:vMapV2['PassWeightCnt']['@translations'][this.props.language]['name']}, {x: selData[2], y:vMapV2['LowPassCnt']['@translations'][this.props.language]['name']},
     {x: selData[3], y:vMapV2['LowRejCnt']['@translations'][this.props.language]['name']}, {x:selData[4], y:vMapV2['HighCnt']['@translations'][this.props.language]['name']}, {x:selData[5], y:vMapV2['UnsettledCnt']['@translations'][this.props.language]['name']}, {x:selData[6], y:vMapV2['CheckWeightCnt']['@translations'][this.props.language]['name']}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
    var labelData = data.map(function(d){
      var lax = 'start'
      if(d.x > (data[0].x*0.75)){
        lax = 'end'
        return {x:d.x,y:d.y,label:d.x, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
      }
      return  {x:d.x,y:d.y,label:d.x, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
    })
    var butt = <div onClick={this.toggle} style={{width:77, fontSize:18, textAlign:'center'}}>{bText}</div>
    //var hh = 
    return <div style={{position:'relative',width:380, height:515,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

      <div style={{marginBottom:30}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24,lineHeight:'24px', width:150,paddingLeft:2, fontSize:16, color:fontColor}}>Statistics</div></div>
      <div style={{position:'absolute', left:295, top:0, marginTop:-2,borderTopRightRadius:10, borderBottomLeftRadius:10, border:'5px solid rgb(129, 138, 144)'}}>{butt}</div>
      <div style={{fontSize:16, marginLeft:10, marginTop:-10, height:30}}>{bsttxt}</div>
    <XYPlot height={430} width= {380} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal'>    
  
  <HorizontalBarSeries data={data} color={graphColor} />
  <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
  <XAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="bottom" tickSizeOuter={0}/>
  <YAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="left" tickSizeOuter={0} tickFormat={tickFormatter}/>
    </XYPlot>
    </div>
  }
}
class MainHistogram extends React.Component{
	constructor(props){
		super(props)
		this.parseDataset = this.parseDataset.bind(this);
		this.clearFaults = this.clearFaults.bind(this);
		this.maskFault = this.maskFault.bind(this);
		this.statusClick = this.statusClick.bind(this);
    this.pushWeight = this.pushWeight.bind(this);
    this.pushBin  = this.pushBin.bind(this);
    this.clearHisto = this.clearHisto.bind(this);
    this.fModal = React.createRef();
    this.histo = React.createRef();
    var dtst = []
    for(var i = 0; i < 300; i++){
      dtst.push(0)
    }
		this.state = {pTime:0,weightPassed:0,pmax:2000, pstrt:0,pend:299, pmin:0,calFactor:0.05, tareWeight:0,decisionRange:[12,18],max:20, min:0,dataSets:[dtst,dtst.slice(0), dtst.slice(0)],reject:false,over:false,under:false}
	}
  pushBin(x,y){
    this.histo.current.pushBin(x,y);
  }
  clearHisto(){
    // console.log('clear Histo')
    this.histo.current.clearHisto();
  }
	parseDataset(data, strt, stend, pmax,pmin, calFactor, tareWeight, pweight, weightPassed, pstrt, pend,pTime){
		var dataSets = this.state.dataSets;
		if(dataSets.length > 5){
			dataSets = dataSets.slice(-5)
		}

		dataSets.push(data)
		var setMax = []
		dataSets.forEach(function (d) {
			// body...
			setMax.push(Math.max(...d))
		})

		var max = Math.max(...data)
		var reject = false;
		if((pweight > this.props.max) || (pweight < this.props.min)){
			reject = true;
	
		}
    if(this.props.histo && this.state.pTime != pTime){
      this.histo.current.pushWeight(pweight)
    }
    //this.histo.current
		this.setState({dataSets:dataSets,pmax:(pmax/calFactor)+tareWeight, pmin:(pmin/calFactor)+tareWeight, pstrt:pstrt, pend:pend, decisionRange:[strt, stend], reject:reject,max:(Math.max(...setMax) + (max*5))/6, min:Math.min(...data), over:(pweight>this.props.max), under:(pweight<this.props.min), calFactor:calFactor, tareWeight:tareWeight, weightPassed:weightPassed,pTime:pTime})
	}
  pushWeight(e){
    this.histo.current.pushWeight(e)
  }
	clearFaults(){
		this.props.clearFaults();
        this.fModal.current.toggle();
	}
	maskFault(){
		this.props.maskFault();
	}
	statusClick(){
		if(this.props.faults.length != 0){
			this.fModal.current.toggle();
		}else if(this.state.weightPassed == 9){
      this.props.cwShow()
    }
	}
	render(){
		var outerbg = '#818a90'
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'
		var graphColor = 'darkturquoise'//FORTRESSGRAPH
		var bg2 = 'rgba(150,150,150,0.5)'
	 var modBg = FORTRESSPURPLE1
		if(this.props.branding == 'SPARC'){
			outerbg = '#e1e1e1'
			innerbg = SPARCBLUE2
      modBg = SPARCBLUE2
			fontColor = 'black'
			graphColor = SPARCBLUE2;
			bg2 = 'rgba(150,150,150,0.5)'
		}



	var bg = 'transparent';
	var str = 'Good Weight'
	var fault = false

	if(vdefByMac[this.props.det.mac]){
		str = vdefByMac[this.props.det.mac][0]['@labels']['WeightPassed']['english'][this.state.weightPassed]
	}
	if(this.props.faults.length != 0){

		if(this.props.faults.length == 1){
			if(typeof vMapV2[this.props.faults[0]+'Mask'] != 'undefined'){
        str = vMapV2[this.props.faults[0]+'Mask']['@translations']['english']['name'] + ' fault active'
      }else{
        str = this.props.faults[0] + ' active'  
      }
      
		}else{
			str = this.props.faults.length + ' faults active'
		}
		fault == true
	}
  if(this.props.warnings.length != 0){

    if(this.props.warnings.length == 1){
      if(typeof vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask'] != 'undefined'){
        str = vMapV2[this.props.warnings[0].slice(0,-4)+'FaultMask']['@translations']['english']['name'] + ' active'
      }else{
        str = this.props.warnings[0] + ' active'  
      }
      
    }else{
      str = this.props.warnings.length + ' warnings active'
    }
    fault == true
  }


  if(this.props.connected == false){
    str = 'Not Connected'
  }
  var  xyplot = <WeightHistogram buckMin={this.props.buckMin} buckMax={this.props.buckMax} buckets={this.props.buckets} bucketSize={this.props.bucketSize} unit={this.props.weightUnits} ref={this.histo} nom={this.props.nominalWeight} stdev={this.props.stdev}/>
  
	return	<div style={{background:bg, textAlign:'center', position:'relative'}}>
 		<div style={{width:560,marginLeft:'auto',marginRight:'auto'}}>{this.props.children}</div>

		<div style={{overflow:'hidden', marginTop:14}}>
		<div style={{marginTop:-48}}>
 {xyplot}
		</div>
		</div>
			<Modal ref={this.fModal} innerStyle={{background:modBg}}>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.props.faults} warnings={this.props.warnings}/>
				</Modal>
		</div>
	}
}
class PackGraph extends React.Component{
  constructor(props){
    super(props)
     var settleWin = this.props.packSamples['SettleWinEnd']-this.props.packSamples['SettleWinStart']
     var timeFactor = 1
     if(settleWin>0){
      timeFactor = this.props.prec['SettleDur']/settleWin
     }
    // var timeFactor = this.props.prec['SettleDur']/settleWin
    this.state = {timeFactor:timeFactor, zoom:false}
    this.toggleZoom = this.toggleZoom.bind(this);
    this.getMMdep = this.getMMdep.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onEditPackageLength = this.onEditPackageLength.bind(this);
    //this.state = {tare:this.props.srec['TareWeight']}
  }
  componentDidMount(){
    this.setState({zoom:false})
  }
  componentWillReceiveProps(newProps){
     var settleWin = newProps.packSamples['SettleWinEnd'] - newProps.packSamples['SettleWinStart'];
     var timeFactor = 1
     if(settleWin>0){
      timeFactor = newProps.prec['SettleDur']/settleWin
      this.setState({timeFactor:timeFactor})
     }
 

    
  }
  toggleZoom(){
    //toast('zoom')
    this.setState({zoom:!this.state.zoom})
  }
  getMMdep(d){
    return this.props.getMMdep(d)
  }
  onEdit(p, v){
    this.props.onEdit(p,v)
  }
  onEditPackageLength(p,v)
  {
    if(this.props.srec['AppUnitDist'] === 1)
    {
      v=(v/10);
      this.props.onEdit(p,v);
    }
    else{
      this.props.onEdit(p,v);
    }
  }
  render(){
    this.props.onEdit("refresh_buffer",6)
    var winL = this.props.packSamples['WindowEnd'] - this.props.packSamples['WindowStart']
    var data = this.props.packSamples['PackSamples']
    if(typeof data != 'undefined'){
      data = data.slice(0);
    }else{
      data = Array(300).fill(0)
    }
    var settleWin = [this.props.packSamples['SettleWinStart'],this.props.packSamples['SettleWinEnd']]
    var packRange = [this.props.crec['PackMin']+this.props.prec['PkgWeight'],this.props.crec['PackMax']+this.props.prec['PkgWeight']]
    var calFactor = this.props.crec['packCal']
    var tare = this.props.crec['packTare']
    var weighWin = [this.props.packSamples['WeighWinStart'],this.props.packSamples['WeighWinEnd']]
    var timeFactor = this.state.timeFactor

    if(typeof tare == 'undefined'){
      tare = this.props.srec['TareWeight']
    }
    if(typeof calFactor == 'undefined'){
      calFactor = this.props.srec['CalFactor']
    }

    var decMax = 0;
    var decMin = 0;
    var self = this;
    //(dsl != 0){
      //var decSet =  this.state.dataSets[dsl-1].slice(this.state.pstrt, this.state.pend)
      var decSet = data.slice(this.props.packSamples['WeighWinStart'], this.props.packSamples['WeighWinEnd'])
      decMin = Math.min(...decSet);
      decMax = Math.max(...decSet);

     

      var ydm = [decMin - (decMax - decMin)*0.2,decMax  + (decMax - decMin)*0.2]
      //console.log('min, max',decMin,decMax)

      if(((this.props.srec['WindowMax'] - this.props.srec['WindowMin']) > 0) && (this.props.srec['WindowMode'] == 1)){
         ydm = [this.props.srec['WindowMin'], this.props.srec['WindowMax']]

    }


  var zoombut = 'assets/zoom.svg'
    //}
  // console.log(decMin,decMax) 
  var dM = decMax*1;
  var dm = decMin*1     
  const yellowBox = {y:dM,y0:dm,x0:weighWin[0] - this.props.packSamples['WindowStart'],x:weighWin[1] - this.props.packSamples['WindowStart']} 
  var xdm = [0,winL]
  
  if(this.state.zoom){
    xdm = [settleWin[0] - this.props.packSamples['WindowStart'],settleWin[1] - this.props.packSamples['WindowStart']]
    ydm = [packRange[0],packRange[1]]
    zoombut ='assets/zoom-out-lens.svg'
  }
  var grng = ydm.map(function (y) {
    return y;
  })

  var range = grng[1] - grng[0]
  var divs = 0.001
  while(range/divs > 5){

    if((((divs < 1) && ((divs*10)%2 == 0))||(divs%2 == 0)) &&(range/divs > 20)){
      divs *= 5
    }else{
      divs *= 2
    }
  }
  var tcks = []
  if(grng[0]%divs == 0){
    grng[0] += 1
  }
  var strttick = Math.ceil(grng[0]/divs)*divs;
  while(strttick < grng[1]){
    tcks.push(strttick);
    strttick += divs;
  }


  var tickData = tcks.map(function(t) {
    var fd = 1
    if(divs<0.1){
      fd = 3
    }
    // body...<LabelSeries data={[{x:(xdm[0]+xdm[1])/2, y:ydm[0], label:'ms'}]} labelAnchorY='middle' labelAnchorX='start'/>
    return {x:xdm[0], y:t, label:t.toFixed(fd) + 'g', xOffset:10}
  })


    return  (
<div><div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>Pack Graph</div></div>
      
      <div style={{display:'grid', gridTemplateColumns:'auto auto'}}>
      
        <div style={{background:'#e1e1e1', paddingTop:5, marginRight:5}}>
      
      <img onClick={this.toggleZoom} src={zoombut} style={{width:32, marginLeft:815}}/>
    <XYPlot height={400} width={850} yDomain={ydm} xDomain={xdm} margin={{left:20,right:0,bottom:30,top:10}}>
     <AreaSeries data={data.slice(this.props.packSamples['WindowStart'], this.props.packSamples['WindowEnd']).map(function (y,x) {
      // body...
      return {y:y, x:x}
    })}/>
     <Borders style={{all: {fill: '#e1e1e1'}}} />
      <YAxis hideTicks/>
    <XAxis tickFormat={val => val%10 == 0 ? val*timeFactor.toFixed(0) : ""} hideTicks={winL == 0} style={{line:{stroke:'#e1e1e1'}, ticks:{stroke:"#888"}}}/>
  
    <VerticalRectSeries curve='curveMonotoneX' strokeStyle='dashed' stack={true} opacity={0.8} stroke="#ffa500" fill='transparent' strokeWidth={3} data={[yellowBox]}/>
    <VerticalRectSeries onSeriesClick={this.toggleZoom} curve='curveMonotoneX' stack={true} opacity={0.8} stroke="#ff0000" fill='transparent' strokeWidth={3} data={[{y0:packRange[0],y:packRange[1],x0:settleWin[0] - this.props.packSamples['WindowStart'],x:settleWin[1] - this.props.packSamples['WindowStart']}]}/>
    
    <LabelSeries data={tickData} labelAnchorY='middle' labelAnchorX='start'/>
    

    </XYPlot>
    <div style={{textAlign:'center'}}>ms</div>
    </div>
    <div  style={{background:'#e1e1e1', paddingTop:5, marginLeft:5, overflowY:'scroll'}}>
    
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 1} vMap={vMapV2['FilterFreq']} pram={'FilterFreq'} name={vMapV2['FilterFreq']['@translations'][this.props.language]['name']} value={this.props.prec['FilterFreq'].toFixed(1)+ ' Hz'} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 1} vMap={vMapV2['SettleDur']} pram={'SettleDur'} name={vMapV2['SettleDur']['@translations'][this.props.language]['name']} value={this.props.prec['SettleDur']+ ' ms'} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 1} vMap={vMapV2['VfdBeltSpeed1']} pram={'VfdBeltSpeed1'} name={vMapV2['VfdBeltSpeed1']['@translations'][this.props.language]['name']} value={this.props.prec['VfdBeltSpeed1']} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 1} vMap={vMapV2['WeightAvgMode']} pram={'WeightAvgMode'} name={vMapV2['WeightAvgMode']['@translations'][this.props.language]['name']} rVal={this.props.prec['WeightAvgMode']} value={vMapLists['WeightAvgMode'][this.props.language][this.props.prec['WeightAvgMode']]} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEditPackageLength} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 1} vMap={vMapV2['EyePkgLength']} pram={'EyePkgLength'} name={vMapV2['EyePkgLength']['@translations'][this.props.language]['name']} value={formatLength(this.props.prec['EyePkgLength'],this.props.srec['AppUnitDist'])} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 0} vMap={vMapV2['WeighLength']} pram={'WeighLength'} name={vMapV2['WeighLength']['@translations'][this.props.language]['name']} value={formatLength(this.props.srec['WeighLength'],this.props.srec['AppUnitDist'])} submitChange={this.props.submitChange}/>
    <StatDisplay onEdit={this.onEdit} branding={this.props.branding} getMMdep={this.getMMdep} language={this.props.language} pAcc={this.props.acc} acc={this.props.rec == 0} vMap={vMapV2['EyeDist']} pram={'EyeDist'} name={vMapV2['EyeDist']['@translations'][this.props.language]['name']} value={formatLength(this.props.srec['EyeDist'],this.props.srec['AppUnitDist'])} submitChange={this.props.submitChange}/>
      </div>
    </div>
    </div>)
    
  }
}
class WeightHistogram extends React.Component{
  constructor(props){
    super(props)
    var divs = []
    var bins = []
    var range0 = this.props.buckMin
    var range1 = this.props.buckMax
    var div = (range1-range0)/this.props.buckets
    
    for(var i = 0; i<this.props.buckets; i++){
      divs.push([range0+(div*i), range0+ (div* (i+1))])
      bins.push(0);
    }
    
    this.pushWeight = this.pushWeight.bind(this);
    this.clearHisto = this.clearHisto.bind(this);
    this.pushBin = this.pushBin.bind(this);
    this.state ={bins:bins,divs:divs,range:[range0,range1]}
    // console.log("this.state.range", this.state.range)
  }
  componentWillReceiveProps(props){
    if(props.nom != this.props.nom || props.bucketSize != this.props.bucketSize || props.buckets != this.props.buckets || props.buckMin != this.props.buckMin || props.buckMax != this.props.buckMax){
      // console.log('get props')
      var divs = []
      var bins = []
      var range0 = props.buckMin
      var range1 = props.buckMax
      var div = (range1-range0)/props.buckets
      if(props.bucketSize){
        div = props.bucketSize
      }
      for(var i = 0; i<props.buckets; i++){
        divs.push([range0+(div*i), Math.min(range0+ (div*(i+1)), range1)])
        bins.push(0)
      }
  
    this.setState({divs:divs,range:[range0,range1]})
    }
  }
  clearHisto(){
    var divs = []
    var bins = []
    var range0 = this.props.buckMin
    var range1 = this.props.buckMax
    var div = (range1-range0)/this.props.buckets
    for(var i = 0; i<this.props.buckets; i++){
      divs.push([range0+(div*i), range0+ (div* (i+1))])
      bins.push(0)
    }
    this.state ={bins:bins,divs:divs,range:[range0,range1]}
  }
  pushBin(batch, bins){
    // console.log('get bins')
    this.setState({bins:batch.slice(0,bins)})
  }
  pushWeight(w){
    // console.log('array', w)
    var bins = this.state.bins.slice(0)
    var divs = this.state.divs.slice(0)
    if(Array.isArray(w)){

      bins = [];
      for(var j= 0; j<this.props.buckets; j++){
        // divs.push([range0+(div*i), range0+ (div* (i+1))])
        bins.push(0)
        //bins.push(64-Math.pow((8-i),2))
      }
      w.forEach(function (wgt) {
        var i = 0;
        while((i < divs.length - 1)&&(wgt > divs[i][1])){
          i++;
        }
        bins[i]++;
      })
    }else{
      if(w < this.props.buckMin || w> this.props.buckMax){
        //disregard out of range packs
      }else{
        var i = 0;
      while((i < divs.length - 1)&&(w > divs[i][1])){
        i++;
      }
      bins[i]++;
      }
      
    }
    this.setState({bins:bins})
  }
  render(){
    var self = this;
    var divs = this.state.divs
    var max = 0
    var data = this.state.bins.map(function(d,i){
      max = Math.max(d,max);
     // console.log(divs.length, i)
     if(divs.length > i){
      return {y0:0, y:d, x0:divs[i][0], x:divs[i][1]}
     }else{
      return {y0:0, y:d, x0:0, x:0}
     }
      
    })
    var ticks = 1
    while((max/ticks)>10){
      if(ticks<5){
        ticks*=5
      }else{
        ticks*=2
      }
    }
    var labDat = [];
    var tick = 0;
    if(divs.length > 0){
    while(tick <= max){
      labDat.push({x:divs[0][0],y:tick})
      tick += ticks
    }
  }
  var u = 0;
  if(this.props.unit){
    u = this.props.unit
  }
  var factors = [1, 0.001, 0.002201, 0.035274]
  var sigfigs = [1, 2, 2, 1]
    var labelData = labDat.map(function(d){
      var lax = 'end'
      return  {x:d.x,y:d.y,label:d.y, xOffset:-15, yOffset:0, size:0.5, labelAnchorX:lax, style:{fill:'#888', fontSize:14}}
    })



    return <XYPlot xDomain={this.state.range} yDomain={[0,max*1.1]} height={317} width={540} margin={{left:50,right:0,bottom:50,top:65}}>
     <XAxis tickFormat={val => roundTo(val*factors[u],sigfigs[u])} tickTotal={10} style={{line:{stroke:'#888'}, ticks:{stroke:"#888"}}}/>
     <YAxis tickFormat={val => Math.round(val) === val ? val : ""} hideTicks={max<1} style={{line:{stroke:'#e1e1e1'}, ticks:{stroke:"#888"}}}/>
        <VerticalRectSeries data={data} color={'darkturquoise'}/>
    </XYPlot>
  }
}
class BatchHistogram extends React.Component{
  constructor(props){
    super(props)
    var histo = []
    for(var i = 0; i<250;i++){
      histo.push(0)
    }
    this.state = {histo:histo, bucketSize:1, bucketNum:100, bucketMin:0, bucketMax:100}
  }
  componentWillReceiveProps(props){
    if(props.ovHisto){
      this.setState({histo:props.histo})
    }else{
      this.props.refreshHisto()
      /*if(this.props.ovHisto != props.ovHisto){
        this.props.refreshHisto()
      }*/
    }
  }
  parseHisto(histo, bucketSize, bucketNum, bucketMin, bucketMax){
    // console.log('parseHisto', histo, bucketSize, bucketNum)
    if(this.props.ovHisto != true){
        this.setState({histo:histo, bucketSize:bucketSize, bucketNum:bucketNum, bucketMin:bucketMin, bucketMax:bucketMax})

    }
  }
  render(){
    var max = 0;
    var data = this.state.histo.slice(0,this.state.bucketNum).map(function (d,i) {
      // body...
      max = Math.max(d,max);
      return {y0:0, y:d, x0:i, x:i+1}
    })
    var factors = [1, 0.001, 0.002201, 0.035274]
  var sigfigs = [2, 4, 4, 3]
    var u = 0;
  if(this.props.unit){
    u = this.props.unit
  }
  var width = 420
  if(this.props.width){
    width = this.props.width
  }
    var labelData = [{x:0,y:0, xOffset:10, yOffset:-5, label:this.state.bucketMin},{x:this.state.bucketNum, y:0, xOffset:-10, yOffset:-5, label:this.state.bucketMax}]
    //   <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
     

    return <div>
    <div style={{marginBottom:10, textAlign:'center'}}>{'Batch Histogram'}
    </div>
    <XYPlot xDomain={[0,this.state.bucketNum]} height={180} width={width} margin={{left:50,right:20,bottom:50,top:50}}>
         <XAxis tickFormat={val => ToFixed(val*factors[u],sigfigs[u])} style={{line:{stroke:'#888'}, ticks:{stroke:"#888"}}}/>
     <YAxis tickFormat={val => Math.round(val) === val ? val : ""} hideTicks={max<1} style={{line:{stroke:'#e1e1e1'}, ticks:{stroke:"#888"}}}/>
  <VerticalRectSeries data={data} color={'darkturquoise'}/>
      </XYPlot>
      </div>
  }
}
/**********************Graphs End***********************/

/*****Batch stuff starts *****/
class PlanBatchStart extends React.Component{
  constructor(props){
    super(props)
      var prodList = [];
    var prodNames = this.props.pNames
    this.props.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.md = React.createRef();
    this.onStartBatchClick = this.onStartBatchClick.bind(this);
    this.state = {prodList:prodList, ind:0}
    this.onConfirm = this.onConfirm.bind(this);
  }
  componentWillReceiveProps(newProps){
    var prodList = [];
    var prodNames = newProps.pNames
    newProps.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.setState({prodList:prodList})
  }
  toggle(){
    this.md.current.toggle()
  }
  onStartBatchClick(ind){
    this.setState({ind:ind})
  }
  onConfirm(){
     this.props.startP(this.props.plannedBatches[this.state.ind]['PlanBatchId'])
    this.md.current.toggle()
  }
  render(){
    var self = this;
    var prMap = {}
    var prodnames = this.state.prodList.map(function (p) {
      // body...
      prMap[p.no] = p.name
      return p.no + '. '+ p.name;
    })
    var plannedBatchesStart = this.props.plannedBatches.map(function (bat, i) {
      var bgc = '#e1e1e1'
      if(self.state.ind == i){
        bgc = '#7ccc7c'
      }
      return  <div onClick={() => self.onStartBatchClick(i)} style={{fontSize:18, borderBottom:'2px solid #362c66', background:bgc}}>
        <div>Batch Id: {bat['PlanBatchId']}</div>
        <div>Batch Ref: {bat['PlanBatchRef']}</div>
       <div>Product: {prMap[bat['PlanProdNum']]}</div>
        </div>
      // body...
    })
    if(this.props.plannedBatches.length == 0){
      plannedBatchesStart = <div style={{color:'#e1e1e1'}}>
        No Planned Batches found
      </div>
    }
    return (
    <Modal x ref={this.md}>
    <div>
    <div style={{font:25, color:'#e1e1e1'}}>Select Batch</div>
    <div style={{overflowY:'scroll', maxHeight:396}}>{plannedBatchesStart}</div></div>
    <div style={{mmarginLeft:340}}>
     <div onClick={this.onConfirm} style={{width:250, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={'assets/play-arrow-fti.svg'} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Start Batch'}</div></div></div>
    </Modal>)
  }
}
class ManBatchStart extends React.Component{
    constructor(props){
    super(props);
    var prodList = [];
    var prodNames = this.props.pNames
    this.props.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.addBatch = this.addBatch.bind(this);
    this.md = React.createRef()
    this.state = {PlanBatchId:0,PlanBatchRef:'',PlanBatchProdNum:1,PlanBatchNumPacks:100, prodList:prodList}
  }
   componentWillReceiveProps(newProps){
    var prodList = [];
    var prodNames = newProps.pNames
    newProps.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.setState({prodList:prodList})
  }
  toggle(){
    this.md.current.toggle()
  }
  addBatch(){
        var buf = Buffer.alloc(26)
    buf.writeUInt32LE(this.state.PlanBatchId,0)
    buf.write((this.state.PlanBatchRef + '                ').slice(0,16), 4, 16,'ascii')
    buf.writeUInt32LE(this.state.PlanBatchNumPacks,20)
    buf.writeUInt16LE(this.state.PlanBatchProdNum,24)
    this.props.startNew(buf)
    //socket.emit('writeNewBatch',{data:{PlanBatchId:this.state.PlanBatchId,PlanBatchRef:this.state.PlanBatchRef,PlanProdNum:this.state.PlanBatchProdNum,PlanNumPacks:this.state.PlanBatchNumPacks}, ip:this.props.ip})
    this.md.current.toggle()
  }
  render(){
    var self = this;

    var selProdName = '';
    var selVal = 0
    var prodnames = this.state.prodList.map(function (p) {
      
      return p.no + '. '+p.name;
      // body...
    })
    this.state.prodList.forEach(function (p,i) {
      // body...
      if(p.no == self.state.PlanBatchProdNum){
        selProdName = p.name;
        selVal = i
      }
    })
  //  console.log(this.props.mac)
    if(vdefByMac[this.props.mac]){
      return <Modal x ref={this.md}>
    <div style={{background:'#e1e1e1',padding:10}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Start New Batch'}</div></h2></span>
     
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchRef'} vMap={vMapV2['PlanBatchRef']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchRef']['@translations'][this.props.language]['name']} value={this.state.PlanBatchRef} param={vdefByMac[this.props.mac][1][12]['PlanBatchRef']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchRef:v})} num={false} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchRef']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchNumPacks'} vMap={vMapV2['PlanBatchNumPacks']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['name']} value={this.state.PlanBatchNumPacks} param={vdefByMac[this.props.mac][1][12]['PlanNumPacks']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchNumPacks:parseInt(v)})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['description']}/></div>
    <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchProdNum'} vMap={vMapV2['PlanBatchProdNum']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['ProdName']['@translations'][this.props.language]['name']} value={selProdName} param={vdefByMac[this.props.mac][1][12]['PlanProdNum']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchProdNum:this.state.prodList[v].no})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchProdNum']['@translations'][this.props.language]['description']} listOverride={true} ovList={prodnames}/></div>      
    <div style={{marginTop:140,marginLeft:340}}>
    <div onClick={this.addBatch} style={{width:250, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={'assets/play-arrow-fti.svg'} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Start Batch'}</div></div>  
    </div>
    </div>
    </Modal>
    }else{
      return ""
    }

    //<CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.addBatch} lab={'Start Batch'}/>
  }
}
class BatchControl extends React.Component{

  /*********************            TODOS

      start, pause, resume, stop
      prompt for batchID, auto
      need to delete batch?
      add prodlist to this -> should create new batch on prodchange?
      

  *******************************************************************/
  constructor(props){
    super(props)
    var prodList = [];
    var prodNames = this.props.pNames
    this.props.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.bhg = React.createRef();
    this.addModal = React.createRef();
    this.startModal = React.createRef();
    this.manModal = React.createRef();
    this.ed = React.createRef();
    this.msgm = React.createRef();
    this.pastBatches = React.createRef();
    this.plannedBatches = React.createRef();
    this.bSettings = React.createRef();
    this.state = {selBatch:0,selID:-1,bRec:{},startBatch:0,showMode:0,prodList:prodList, startMode:this.props.batchMode,start:this.props.start,stop:this.props.stop,batchData:[0, 0, 0, 0, 0, 0, 0, 0,0], sampleData:[0, 0, 0, 0, 0, 0, 0, 0,0],batch:true, batchStartTime:'', sampleStartTime:'',batchMin:0,sampleMin:0,plannedBatches:this.props.plannedBatches}
    this.sendPacket = this.sendPacket.bind(this);
    this.parseHisto = this.parseHisto.bind(this);
    this.addBatch = this.addBatch.bind(this);
    this.addnewBatch = this.addnewBatch.bind(this);
    this.onBatchClick = this.onBatchClick.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.selectChanged = this.selectChanged.bind(this);
    this.onStartBatchClick = this.onStartBatchClick.bind(this);
    this.onStartClick = this.onStartClick.bind(this);
    this.startPlannedBatch = this.startPlannedBatch.bind(this);
    this.runnewBatch = this.runnewBatch.bind(this);
    this.getPastBatches = this.getPastBatches.bind(this);
    this.onPastBatchClick = this.onPastBatchClick.bind(this);
    this.downloadBatch = this.downloadBatch.bind(this);
    this.refreshHisto = this.refreshHisto.bind(this);
    this.deleteBatch = this.deleteBatch.bind(this);
    this.batchSettings = this.batchSettings.bind(this);
    this.showPlannedBatches = this.showPlannedBatches.bind(this);
  }
  componentWillReceiveProps(newProps){
    var prodList = [];
    var prodNames = newProps.pNames
    newProps.pList.forEach(function (pn,i) {
      prodList.push({name:prodNames[i], no:pn})
    })
    this.setState({startMode:newProps.batchMode,prodList:prodList, plannedBatches:newProps.plannedBatches})
  }
  startPlannedBatch(){
    this.props.startP(this.state.plannedBatches[this.state.startBatch]['PlanBatchId'])
    this.startModal.current.close();
  }
  onBatchClick(i){
    this.setState({selBatch:i})
  }
  onStartBatchClick(i){
    this.setState({startBatch:i})
    this.startModal.current.close();
    //this.props.sendPacket(vdefByMac[this.props.mac][1][0]['BatchMode'],i)
  }
  onStartClick(){
    if(this.state.startMode == 0){
      this.props.startB()
    }else if(this.state.startMode == 1){
      this.startModal.current.toggle();
    }else{
      this.manModal.current.toggle();
    }
  }
 
  componentDidMount(){
    var self = this;

    this.props.soc.on('batchDownload', function (batchFile) {
       var bjson = JSON.parse(batchFile.data);
       self.setState({bRec:bjson})
    })
  }
  startBatchToggle(){
    this.startModal.current.toggle();

  }
  changeMode(){
    var self = this;
    if(this.props.batchPerm){
      setTimeout(function () {
        // body...
      self.ed.current.toggle();
    },100)
      
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  refreshHisto(){
    this.props.sendPacket('refresh', 7)
  }
  parseHisto(h,b,n){
    this.bhg.current.parseHisto(h,b,n)
  }
  parseCrec(crec){
    var data = this.state.batchData.slice(0);
    var sampleData = this.state.sampleData.slice(0);
    data[0] = crec['TotalCnt']
    data[1] = crec['PassWeightCnt'];
    data[2] = crec['LowPassCnt'];
    data[3] = crec['LowRejCnt']; 
    data[4] = crec['HighCnt'];
    data[5] = crec['UnsettledCnt']
    //data[6] = crec['ImprobableCnt']
    data[6] = crec['CheckWeightCnt']
    data[7] = crec['CheckWeightCnt']

    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
   // sampleData[6] = crec['SampleImprobableCnt']
    sampleData[6] = crec['SampleCheckWeightCnt']
    sampleData[7] = crec['SampleCheckWeightCnt']
    this.setState({batchData:data, sampleData:sampleData, batchStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' '),sampleStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' '),batchMin:crec['BatchMinutes'], sampleMin:crec['SampleMinutes']})
  }
  sendPacket(n,v){
    var self = this;
    this.props.sendPacket(n,parseInt(v))
    setTimeout(function (argument) {
      // body...
      self.props.sendPacket('saveProduct',self.props.selProd)
    }, 1000)
  }
  addBatch(){
    if(this.props.batchPerm){
    
      this.addModal.current.toggle();
     }else{
      this.msgm.current.show('Access Denied')
    }
  }
  addnewBatch(bat){
    var self = this;
      this.props.soc.emit('writeNewBatch',{data:bat, ip:this.props.ip})
    this.addModal.current.close();
    setTimeout(function () {
      // body...
      self.props.getBatchList();
    },1500)
 
    
  }
  runnewBatch(batchJson){
    // console.log('run')
    //socket.emit('writeNewBatch',{data:bat, ip:this.props.ip})
    var buf = Buffer.alloc(26)
    buf.writeUInt32LE(batchJson.PlanBatchId,0)
    buf.write((batchJson.PlanBatchRef + '                ').slice(0,16), 4, 16,'ascii')
    buf.writeUInt32LE(batchJson.PlanNumPacks,20)
    buf.writeUInt16LE(batchJson.PlanProdNum,24)

    this.props.startNew(buf)
    this.manModal.current.close();
  }
  selectChanged(p,v){
    this.props.sendPacket(vdefByMac[this.props.mac][1][0]['BatchMode'],v)
 
    //this.setState({startMode:v})
  }
  getPastBatches(){
    var self = this;
    this.props.soc.emit('getBatches')
    //this.pastBatches.current.toggle();
    this.setState({showMode:(this.state.showMode+1)%2})
    setTimeout(function () {
      // body...
      if(self.props.pBatches.length > 0){
        self.onPastBatchClick(self.props.pBatches[0].id)
      }
    })
  }
  onPastBatchClick(id){
    this.props.soc.emit('downloadBatch', id)
    this.setState({selID:id})
  }
  deleteBatch(id){
    var self = this;
    this.props.sendPacket('deleteBatch', id)
    setTimeout(function(){
      self.props.getBatchList()
    },1500)
  }
  downloadBatch(){
    var strZeros = ""
    for (var n=0; n < (11-this.state.bRec['Batch ID'].value.toString().length); n++){
      strZeros+="0"
    }
    var batchIdStr = strZeros+this.state.bRec['Batch ID'].value.toString()
    if(this.state.selID.split('%')[0] === batchIdStr){
      var bjson = this.state.bRec//JSON.parse(batchFile.data);
       var csvstr = 'Name, Value, Units'.toUpperCase()+'\n';
       for(var b in bjson){
        if(b.indexOf('Histogram Buckets') == -1){
          csvstr += b +','+bjson[b].value.toString().split(',').join(' ')+', '+bjson[b].units.toString().split(',').join(' ') + '\n';
        }
        //bjson[b].toString().split(',').join(' ')
       }
        if(this.props.usb){
          this.props.soc.emit('putAndSendTftp', {data:csvstr, filename:this.state.selID.replace(/\^+/g,"_").replace('.json','')+'.csv', opts:{mac:this.props.mac.split('-').join('').toUpperCase()}})
        }else{
        //fileDownload(csvstr, this.state.selID.replace('.json','')+'.csv') 
        }
    }
  }
  batchSettings(){
    this.bSettings.current.toggle()
  }
  showPlannedBatches(){
    this.plannedBatches.current.toggle()
    this.bSettings.current.toggle()
  }
  render(){
    var self = this;
    var backgroundColor = FORTRESSPURPLE1;
    if(this.props.branding == 'SPARC'){
      backgroundColor = SPARCBLUE1
    }
    var prMap = {}
    var prodnames = this.state.prodList.map(function (p) {
      // body...
      prMap[p.no] = p.name
      return p.no + '. '+ p.name;
    })

    
    var pastBatches = []
    var plannedBatchesStart = this.state.plannedBatches.map(function (bat, i) {
      var bgc = '#e1e1e1'
      if(self.state.startBatch == i){
        bgc = '#7ccc7c'
      } 
      return <div  style={{fontSize:18, borderBottom:'2px solid #362c66', background:bgc}}>
        <div>Batch Id: {bat['PlanBatchId']}</div>
        <div>Batch Ref: {bat['PlanBatchRef']}</div>
       <div>Product: {prMap[bat['PlanProdNum']]}</div>
        </div>
      // body...
    })

    var pl = 'assets/play-arrow-fti.svg'
    var stp = 'assets/stop-fti.svg'
    var batchInfo = <div style={{height:315}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Batch'}</div></h2></span>
      <div style={{padding:5}}>Batch stopped</div></div>
    var play, stop;

    if(this.props.start){
      var sttxt = 'Start'
        
      play = <div onClick={this.onStartClick} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{sttxt}</div></div>
      stop = <div onClick={this.props.stopB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#FA2222', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className='circularButton_sp'> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    }else{
      play = <div onClick={this.props.pause} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className='circularButton_sp'> <img src={'assets/pause.svg'} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Pause</div></div>
      stop = <div onClick={this.props.stopB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#F04040', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 
      batchInfo = <div style={{height:315}}>
         <span><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Batch'}</div></h2></span>
         <div style={{padding:5}}>
          <div style={{marginTop:5}}><ProdSettingEdit trans={true} name={'BatchNumber'} vMap={vMapV2['BatchNumber']} language={this.props.language} branding={this.props.branding} h1={40} w1={250} h2={51} w2={400} label={vMapV2['BatchNumber']['@translations'][this.props.language]['name']} value={this.props.prod['BatchNumber']} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.props.mac][1][1]['BatchNumber']} num={true}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit trans={true} name={'BatchRef'} vMap={vMapV2['BatchRef']} language={this.props.language} branding={this.props.branding} h1={40} w1={250} h2={51} w2={400} label={vMapV2['BatchRef']['@translations'][this.props.language]['name']} value={this.props.prod['BatchRef']} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.props.mac][1][1]['BatchRef']} num={true}/></div>
              <div>{'Batch running for '+ this.state.batchMin.toFixed(1) + ' minutes'}</div>
              <div>{'Sample running for '+ this.state.sampleMin.toFixed(1) + ' minutes'}</div><div></div></div></div>
      }
      var batback = '#e1e1e1' 
      var batNum = this.props.prod['BatchNumber']
      var batRef = this.props.prod['BatchRef']
      var packNum = this.props.crec['PassWeightCnt']
      var batchCount = this.props.prod['BatchCount']
      var prodName = this.props.prod['ProdName']  
      var weighingMode = this.props.prod['WeighingMode'];
      if(this.state.selBatch == 0){
        batback = '#7ccc7c'
      }else{
        var batch = this.state.plannedBatches[this.state.selBatch - 1]
        batNum = batch['PlanBatchId']
        batRef = batch['PlanBatchRef']
        prodName = batch['PlanProdNum']
        packNum = batch['PlanNumPacks']
      } 

      var batchList = ""

    var titleSt = {display:'table-cell', paddingRight:1}
    var valSt = {display:'table-cell', paddingLeft:5}
    var midSt = {display:'table-cell', width:'100%'}
    var dots = {borderBottom:'1px dotted', marginBottom:3}
    var bmodes = ['Auto','Planned Batch', 'Manual Entry']
    // console.log('vMapLists', vMapLists)
    var passPer = 0;
    if(typeof this.props.crec['PassWeightPer'] != 'undefined'){
      passPer = this.props.crec['PassWeightPer']
    }
    var bstartTime = this.state.batchStartTime
    if(this.props.bstartTime){
      bstartTime = this.props.bstartTime.toISOString().slice(0,19).split('T').join(' ')
    }

    var fSize = 20
    
    if(batchCount != 0){
      if(typeof this.props.crec['PassWeightCnt'] != 'undefined'){
        // packNum = this.props.crec['PassWeightCnt']+'/' +batchCount
        if ( typeof batchCount != 'undefined' ){
          packNum = this.props.crec['PassWeightCnt']+'/' +batchCount
        }

      }
    }

    if (weighingMode == 1) {   
      var lowPass = "Between T1/T2"
      }
      else {
        var lowPass = "Low Pass"
      }

    var batchSummary = this.state.showMode == 1 && typeof this.state.bRec['Batch ID']!='undefined' ? 
        <div style={{whiteSpace:'nowrap', margin:5, padding:5}}>
          <div><div style={titleSt}>Batch</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Batch ID'].value}</div></div>
          <div><div style={titleSt}>Batch Ref</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Batch Ref'].value}</div></div>
          <div><div style={titleSt}>Product</div><div style={midSt}><div style={dots}/></div><div style={valSt}><div style={{fontSize:fontSize}}>{this.state.bRec['Product Name'].value.trim()}</div></div></div>
          <div><div style={titleSt}>Start Time</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Batch Start Time'].value}</div></div>
        </div>
        :
        <div style={{whiteSpace:'nowrap', margin:5, padding:5}}>
          <div><div style={titleSt}>Batch</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{batNum}</div></div>
          <div><div style={titleSt}>Batch Ref</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{batRef}</div></div>
          <div><div style={titleSt}>Product</div><div style={midSt}><div style={dots}/></div><div style={valSt}><div style={{fontSize:fSize}}>{prodName}</div></div></div>
          <div><div style={titleSt}>Start Time</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{bstartTime}</div></div>
        </div>

    var batchInfo = this.state.showMode == 1 && typeof this.state.bRec['Batch ID']!='undefined' ? 
        <div style={{display:'inline-block',verticalAlign:'top', margin:5, padding:5, whiteSpace:'nowrap'}}>
          <div style={{textAlign:'center'}}>Batch Information</div>
          <div style={{fontSize:15}}>
          <div><div style={titleSt}>Total Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Total Weight'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Passed Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Good Weights'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Passed Weight Percentage</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Percentage weight passed'].value}</div></div>
          <div><div style={titleSt}>Lowest Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Lowest Good Weight'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Highest Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Highest Good Weight'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Nominal Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.prod['NominalWgt'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Average Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Avg Good Weight'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Standard Deviation</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Std Dev Good Weights'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Total Giveaway</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(parseFloat(this.state.bRec['Total Giveaway'].value), this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Packs Per Minute</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{ToFixed(this.state.bRec['Packs Per Minute'].value,1)}</div></div>
        </div></div>
        :
        <div style={{display:'inline-block',verticalAlign:'top', margin:5, padding:5, whiteSpace:'nowrap'}}>
          <div style={{textAlign:'center'}}>Batch Information</div>
          <div style={{fontSize:15}}>
          <div><div style={titleSt}>Total Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['TotalWeight'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Passed Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['PassedWeight'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Passed Weight Percentage</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{passPer.toFixed(1)+ '%'}</div></div>
          <div><div style={titleSt}>Lowest Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['LowestWeight'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Highest Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['HighestWeight'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Nominal Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.prod['NominalWgt'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Average Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['AvgWeight'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Standard Deviation</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['StdDev'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Total Giveaway</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{FormatWeight(this.props.crec['GiveawayBatch'], this.props.srec['WeightUnits'])}</div></div>
          <div><div style={titleSt}>Packs Per Minute</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{ToFixed(this.props.crec['Batch_PPM'],1)}</div></div>
        </div></div>

      var batchWeights = this.state.showMode == 1 && typeof this.state.bRec['Batch ID']!='undefined' ?
        <div style={{display:'inline-block',verticalAlign:'top', margin:5, padding:5}}><div>Batch Weights</div>
          <div>
          <div style={{fontSize:17, whiteSpace:'nowrap'}}>
          <div><div style={titleSt}>Good</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Good Weights'].value}</div></div>
          <div><div style={titleSt}>Low Reject</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Under Weights'].value}</div></div>
          <div><div style={titleSt}>High</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Over Weights'].value}</div></div>
          <div><div style={titleSt}>Unsettled</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Unsettled Weights'].value}</div></div>
          <div><div style={titleSt}>Check Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.state.bRec['Check Weights'].value}</div></div>
          </div> 
          </div>
        </div>
        :
        <div style={{display:'inline-block',verticalAlign:'top', margin:5, padding:5}}><div>Batch Weights</div>
          <div>
           <div style={{fontSize:17, whiteSpace:'nowrap'}}>
          <div><div style={titleSt}>Check Weight</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['CheckWeightCnt']}</div></div>
          <div><div style={titleSt}>Metal Reject</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['MetalRejectCnt']}</div></div>
          <div><div style={titleSt}>Unsettled</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['UnsettledCnt']}</div></div>
          <div><div style={titleSt}>High</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['HighCnt']}</div></div>
          <div><div style={titleSt}>Low Reject</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['LowRejCnt']}</div></div>
          <div><div style={titleSt}>{lowPass}</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['LowPassCnt']}</div></div>
          <div><div style={titleSt}>Good</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{packNum}</div></div>
          <div><div style={titleSt}>Total</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{this.props.crec['TotalCnt']}</div></div>
          </div> 
          </div>
        </div>
         
    var bmodeSelect =  <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} ovWidth={290} mobile={this.props.mobile} params={[vdefByMac[this.props.mac][1][0]['BatchMode']]} ioBits={this.props.ioBits} vMap={vMapV2['BatchMode']} language={this.props.language}  interceptor={false} name={'Batch Mode'} ref={this.ed} val={[this.state.startMode]} options={[bmodes]} onChange={this.selectChanged}/>
    var changeModeBut = <div onClick={this.batchSettings} style={{display:'table-cell',height:80, borderRight:'2px solid #362c66', width:156, fontSize:18, lineHeight:'20px', verticalAlign:'middle'}}>Batch Settings</div>
    var bHisto = this.state.showMode == 1 && typeof this.state.bRec['Batch ID']!='undefined' ? 
        <BatchHistogram unit={this.props.weightUnits} ref={this.bhg} ovHisto={true} histo={this.state.bRec['Histogram Buckets']} refreshHisto={this.refreshHisto}/>
        :
        <BatchHistogram unit={this.props.weightUnits} ref={this.bhg} refreshHisto={this.refreshHisto} width={620}/>
    var batchDetails =           <div >
          <div style={{display:'grid',verticalAlign:'top', gridTemplateRows:'200px 2px auto', backgroundColor:'#e1e1e1'}}>
            <div style={{display:'grid', gridTemplateColumns:'500px 2px auto'}}>
              {batchSummary}
              <div style={{background:'#ccc'}}></div>
              <div style={{overflow:'hidden', margin:5, padding:5}}>{bHisto}</div>
            </div>
            <div style={{background:'#ccc'}}></div>
            <div style={{display:'grid', gridTemplateColumns:'500px 2px auto', height:317}}>
              {batchInfo}          
              <div style={{background:'#ccc'}}></div>
              {batchWeights}
            </div>
          </div>
          </div>

    if(this.state.showMode == 1){
      
      if(typeof this.props.pBatches != 'undefined'){
        pastBatches = this.props.pBatches.map(function (bat) {
          var bgc = '#e1e1e1'
          var info = bat.id.split('%').map(function (c) {
            return c.replace(/\^/g," ")
          // body...
          })
          if(self.state.selID == bat.id){
           bgc = '#7ccc7c'
          }
          //bat.stats.birthtime.slice(0,-1).split('T').join(' ')
          return <div onClick={() => self.onPastBatchClick(bat.id)} style={{fontSize:18, borderBottom:'2px solid #ccc', background:bgc}}>
            <div>Batch Id: {info[0]}</div>
            <div>Batch Ref: {info[1]}</div>
            <div>Product: {info[2].replace('.json','')}</div>
            </div>
     
        }) 
      }

   
        batchList = <div style={{width:300, background:'#e1e1e1', border:'2px solid #e1e1e1', height:515, marginLeft:5, marginRight:5, marginBottom:0}}>
          <div style={{height:450}}><div style={{borderBottom:'2px solid #362c66', lineHeight:'60px', height:60, textAlign:'center'}}>Past Batches</div><div style={{height:388, overflowY:'scroll'}}>{pastBatches}</div></div>
          <div style={{height:66,lineHeight:'66px', background:'#e1e1e1', borderTop:'1px solid #362c66'}}>
          <div onClick={this.downloadBatch} style={{display:'table-cell',color:(this.props.usb ? '#000': '#888'),height:66, width:300, fontSize:15, lineHeight:'20px', verticalAlign:'middle', textAlign:'center'}}>Download CSV</div>
          </div></div>
          if(this.state.selID.length > 0){
            if(typeof this.state.bRec['Batch ID']!='undefined')
            {
              var strZeros = ""
              for (var n=0; n < (11-this.state.bRec['Batch ID'].value.toString().length); n++){
              strZeros+="0"
              }
              var batchIdStr = strZeros+this.state.bRec['Batch ID'].value.toString()

              if(this.state.selID.split('%')[0] === batchIdStr){
              //if(this.state.bRec['Batch ID'] == this.state.selID.split('%')[0]){
                var fontSize = 20
                if(this.state.bRec['Product Name'].value.trim().length > 16){
                  fontSize = 16;
                }
              } 
            }
          }
          batchDetails = <div style={{display:'grid', gridTemplateColumns:'315px auto'}}><div style={{display:'inline-block',verticalAlign:'top'}}>{batchList}</div>
          <div style={{display:'grid',verticalAlign:'top', gridTemplateRows:'200px 2px auto', backgroundColor:'#e1e1e1'}}>
            <div style={{display:'grid', gridTemplateColumns:'400px 2px auto'}}>
              {batchSummary}
              <div style={{background:'#ccc'}}></div>
              <div style={{overflow:'hidden', margin:5, padding:5}}>{bHisto}</div>
            </div>
            <div style={{background:'#ccc'}}></div>
            <div style={{display:'grid', gridTemplateColumns:'400px 2px auto'}}>
              {batchInfo}          
              <div style={{background:'#ccc'}}></div>
              {batchWeights}
            </div>
          </div>
          </div>

    }
    
    return <div style={{minHeight:400, padding:5}}>
          {batchDetails}
          <div><div style={{display:'inline-block'}}><BatchWidget acc={this.props.startStopAcc} sendPacket={this.props.sendPacket} liveWeight={this.props.liveWeight} batchRunning={this.props.batchRunning} canStartBelts={this.props.canStartBelts} onStart={this.onStartClick} onResume={this.props.onResume} pause={this.props.pause} start={this.props.start} stopB={this.props.stopB} status={this.props.statusStr} netWeight={FormatWeight(this.props.crec['PackWeight'], this.props.weightUnits)}/></div>
            <div style={{display:'inline-block', float:'right'}}>
              <div style={{display:'none'}}>    
              <CircularButton2  branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.changeMode}><div style={{fontSize:20, lineHeight:'25px'}}><div>Batch Mode</div><div>{bmodes[this.state.startMode]}</div></div></CircularButton2>
                  <CircularButton  branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.pastBatches} lab={'Past Batches'}/>
              </div>
               <div style={{height:80,lineHeight:'80px', background:'#e1e1e1', borderTop:'1px solid #ccc', marginTop:5, textAlign:'center'}}>
          {changeModeBut}
         <div onClick={this.getPastBatches} style={{display:'table-cell',height:80, borderLeft:'2px solid #362c66',width:156, fontSize:18, lineHeight:'20px', verticalAlign:'middle'}}><div style={{fontSize:18}}>{this.state.showMode == 0 ? 'Past Batches' : 'Current Batch'}</div></div>
          </div>
            </div>

          </div>
          <Modal x ref={this.bSettings}>
              <div style={{background:'#e1e1e1', padding:5}}>
              <div style={{marginTop:5}}>
              <ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'BatchMode'} vMap={vMapV2['BatchMode']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} 
              label={vMapV2['BatchMode']['@translations'][this.props.language]['name']} value={this.props.batchMode} param={vdefByMac[this.props.mac][1][0]['BatchMode']}
               editable={true} onEdit={this.selectChanged} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['BatchMode']['@translations'][this.props.language]['description']} listOverride={true} ovList={bmodes}/></div>
              <CircularButton  branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:400, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.showPlannedBatches} lab={'Show Planned Batches'}/>
            </div>
            </Modal>
            
            <Modal x={true} ref={this.startModal} Style={{width:900}} innerStyle={{background:backgroundColor, maxHeight:650}}>
            <div style={{height:400, overflowY:'scroll'}}>{plannedBatchesStart}</div>
            <div> <div onClick={this.startPlannedBatch} style={{width:250, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={'assets/play-arrow-fti.svg'} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Start Batch'}</div></div></div>
    
            </Modal>
            <Modal x={true} ref={this.manModal} Style={{width:900}} innerStyle={{background:backgroundColor, maxHeight:650}}>
            <ManBatch branding={this.props.branding} language={this.props.language} mac={this.props.mac} addBatch={this.runnewBatch} prodList={this.state.prodList}/>
            </Modal>
            <Modal x={true} ref={this.pastBatches} Style={{width:900, marginTop:40}} innerStyle={{background:backgroundColor, maxHeight:650}}>
              <PastBatches soc={this.props.soc} branding={this.props.branding} language={this.props.language} mac={this.props.mac} batches={this.props.pBatches}/>
            </Modal>
            <PlannedBatches soc={this.props.soc} deleteBatch={this.deleteBatch} getBatchList={this.props.getBatchList} branding={this.props.branding} language={this.props.language} ip={this.props.ip} mac={this.props.mac} ref={this.plannedBatches} plannedBatches={this.state.plannedBatches} prMap={prMap} prodList={this.state.prodList}/>
            
            {bmodeSelect}
            <MessageModal ref={this.msgm}/>
            
      </div>
  }
}
class PlannedBatches extends React.Component{
  constructor(props){
    super(props)
    this.state = {selBatch:0}
    this.onBatchClick = this.onBatchClick.bind(this);
    this.deleteBatch = this.deleteBatch.bind(this);
    this.editBatch = this.editBatch.bind(this);
    this.toggle = this.toggle.bind(this)//React.createRef();
    this.md = React.createRef();
    this.editMD = React.createRef();
    this.addModal = React.createRef();
    this.addBatch = this.addBatch.bind(this);
    this.editCurrentBatch = this.editCurrentBatch.bind(this);
    this.addnewBatch = this.addnewBatch.bind(this);

  }
  toggle(){
    this.md.current.toggle()
  }
  onBatchClick(i){
    this.setState({selBatch:i})
  }
  deleteBatch(id){
    this.props.deleteBatch(id)
  }
  editBatch(){
    if(this.props.plannedBatches[this.state.selBatch]){
      this.editMD.current.toggle();
    }
  }
  addBatch(){
    this.addModal.current.toggle();

  }
  editCurrentBatch(bat){
    var self = this;
    bat.PlanBatchId = this.props.plannedBatches[this.state.selBatch].PlanBatchId

    // console.log(bat, this.props.ip)
      this.props.soc.emit('writeNewBatch',{data:bat, ip:this.props.ip})
    this.editMD.current.close();
    setTimeout(function () {
      // body...
      self.props.getBatchList();
    },1500)
 
    
  }
  addnewBatch(bat){
    var self = this;
    // console.log(bat, this.props.ip)
      this.props.soc.emit('writeNewBatch',{data:bat, ip:this.props.ip})
    this.addModal.current.close();
    setTimeout(function () {
      // body...
      self.props.getBatchList();
    },1500)
 
    
  }

  render(){    
     var self = this;    
     //var batback = '#e1e1e1' 
      var batNum = ""//this.props.prod['BatchNumber']
      var batRef = ""//this.props.prod['BatchRef']
      var packNum = ""//this.props.drec['PackCount']
      var prodName = ""//this.props.prod['ProdName']  
      var batch = this.props.plannedBatches[this.state.selBatch]
        var titleSt = {display:'table-cell', paddingRight:1}
    var valSt = {display:'table-cell', paddingLeft:5}
    var midSt = {display:'table-cell', width:'100%'}
    var dots = {borderBottom:'1px dotted', marginBottom:3}
    
     var fSize = 20
              if(prodName.length > 16){
                fSize = 16;
              }

          
    var plannedBatches = this.props.plannedBatches.map(function (bat, i) {
      var bgc = '#e1e1e1'
      var del = ''
      if(self.state.selBatch == i){
        bgc = '#7ccc7c'
      }
        del =  <img src='assets/trash.svg' style={{width:30}} onClick={()=>self.deleteBatch(bat['PlanBatchId'])}/>
      
      return  <div style={{fontSize:18, borderBottom:'2px solid #362c66', background:bgc, display:'grid', gridTemplateColumns:'260px 40px'}}>
        <div  onClick={() => self.onBatchClick(i)}><div>Batch Id: {bat['PlanBatchId']}</div>
        <div>Batch Ref: {bat['PlanBatchRef']}</div>
        <div>Product: {self.props.prMap[bat['PlanProdNum']]}</div>
        </div><div style={{display:'flex', textAlign:'center'}}>
         {del}
        </div>
        </div>
      // body...
    })
    var editCont = ""
    var batchInfo = ""
    if(batch){
        batNum = batch['PlanBatchId']
        batRef = batch['PlanBatchRef']
        prodName = this.props.prMap[batch['PlanProdNum']]
        packNum = batch['PlanNumPacks']

        batchInfo = <div style={{whiteSpace:'nowrap', margin:5, padding:5}}>
          <div><div style={titleSt}>Batch</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{batNum}</div></div>
          <div><div style={titleSt}>Batch Ref</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{batRef}</div></div>
          <div><div style={titleSt}>Product</div><div style={midSt}><div style={dots}/></div><div style={valSt}><div style={{fontSize:fSize}}>{prodName}</div></div></div>
          <div><div style={titleSt}>Number of Packs</div><div style={midSt}><div style={dots}/></div><div style={valSt}>{packNum}</div></div>
          
         </div>
        
        editCont = <EditBatch curBatch={batch} branding={this.props.branding} language={this.props.language} mac={this.props.mac} addBatch={this.editCurrentBatch} prodList={this.props.prodList}/>

    }else{
      if(this.props.plannedBatches.length == 0){
        plannedBatches = <div>No Planned Batches</div>
      }
    }


   // if(this.props.plannedBatches.length > 0){
      return <Modal x ref={this.md}>
      <div style={{display:'grid', gridTemplateColumns:'315px auto'}}>
        <div style={{margin:1, background:"#e1e1e1"}}>
        <div style={{height:426}}><div style={{borderBottom:'2px solid #362c66', lineHeight:'60px', height:60, textAlign:'center'}}>Planned Batches</div><div style={{height:362, overflowY:'scroll'}}>{plannedBatches}</div>
        </div>
          <div style={{height:66,lineHeight:'66px', background:'#e1e1e1', borderTop:'1px solid #362c66'}}>
          <div onClick={this.addBatch} style={{display:'table-cell',height:66, borderRight:'2px solid #362c66', width:150, fontSize:15, lineHeight:'20px', verticalAlign:'middle', textAlign:'center'}}>+ Add New Batch</div>
          <div onClick={this.editBatch} style={{display:'table-cell',height:66, borderLeft:'2px solid #362c66',width:150, fontSize:15, lineHeight:'20px', verticalAlign:'middle', textAlign:'center'}}>Edit Batch</div>
           </div>          
        </div>
        <div style={{margin:1, background:"#e1e1e1"}}>
          {batchInfo}
        </div>
      </div>
        <Modal x ref={this.editMD}>
          {editCont}
        </Modal>
         <Modal x={true} ref={this.addModal} Style={{width:900}} innerStyle={{maxHeight:650}}>
              <AddBatch branding={this.props.branding} language={this.props.language} mac={this.props.mac} addBatch={this.addnewBatch} prodList={this.props.prodList}/>
            </Modal>
      </Modal>
    //}else{
      //return <div></div>
    //}
  }
}
class PastBatches extends React.Component{
  constructor(props){
    super(props)
  }
  downloadBatch(id){
    this.props.soc.emit('downloadBatch', id)
  }
  render(){
    var self = this;

    return <div>{this.props.batches.map(function (batch) {
      // body...
      return <div style={{color:'#e1e1e1'}} onClick={()=>self.downloadBatch(batch.id)}>{batch.id + ' Timestamp:'+ batch.stats.birthtime}</div>
    })}</div>
  }
}
class BatchWidget extends React.Component{
  constructor(props){
    super(props)
    this.onStartClick = this.onStartClick.bind(this);
    this.onResumeClick = this.onResumeClick.bind(this);
    this.stopConfirm = React.createRef();
    this.stop = this.stop.bind(this);
    this.pause = this.pause.bind(this);
    this.stopConfirmed = this.stopConfirmed.bind(this);
    this.msgm = React.createRef();
  }
  onStartClick(){
    if(this.props.acc){
      this.props.onStart()
    }else{
      this.msgm.current.show('Access Denied')
      //this.setState({start:true, pause:false})
    }
  }
  onResumeClick(){
    this.props.onResume()
  }
  pause(){
    this.props.sendPacket('BatchPause')
    //this.setState({start:true, pause:false, stop:true})
  }
  stop(){
    

    
    var self =this;
    this.props.sendPacket('BatchPause')
   // this.setState({start:true, pause:false, stop:true})
    setTimeout(function(){
      self.stopConfirm.current.show()
    }, 150)
    
  }
  stopConfirmed(){
    if(this.props.acc){
      this.props.sendPacket('BatchEnd')
    }else{
      this.msgm.current.show('Access Denied')
      //this.setState({start:true, pause:false})
    }
  }
  render(){
    //comebackhere
    var play = '';
    var stop = ''; 
    var pl = 'assets/play-arrow-fti.svg'
    var stp = 'assets/stop-fti.svg'
    var psbtcolor = 'black'
    var psbtklass = 'circularButton_sp'
    var pauseb = 'assets/pause.svg'
    
   // if(this.props.batchRunning == 0){
    //   var sttxt = 'Start'
    //     play = <div onClick={this.onStartClick} style={{width:250, borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
    //     stop = ''
    // if(this.props.batchRunning == 2){
    //       sttxt = 'Resume'
        

    //     play = <div onClick={this.onResumeClick} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
    //     stop = <div onClick={this.stop} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18, width:50, alignItems:'center', verticalAlign:'middle', lineHeight:'25px', height:50}}>End Batch</div></div> 

      
    // }else if(this.props.batchRunning == 1){
    //   play = <div onClick={this.pause} style={{width:250,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pauseb} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>Pause/Stop</div></div>
    //   stop = ''//<div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#8B0000', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    // }
  
    // if CanStartBelts == 0
    var sttxt = 'Start'
    play = <div  style={{width:250, borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#a9a9a9', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
    stop = ''
    if(this.props.batchRunning == 0){
      if(this.props.canStartBelts == 1){
        play = <div onClick={this.onStartClick} style={{width:250, borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
      }
    }
    else if(this.props.batchRunning == 2){
        sttxt = 'Resume'
        play = <div onClick={this.onResumeClick} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
        stop = <div onClick={this.stop} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18, width:50, alignItems:'center', verticalAlign:'middle', lineHeight:'25px', height:50}}>End Batch</div></div> 
        if(this.props.canStartBelts == 0){
          play = <div style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#a9a9a9', display:'inline-block',marginLeft:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
        }
      
    }
    
    else if(this.props.batchRunning == 1){
      play = <div onClick={this.pause} style={{width:250,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pauseb} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>Pause/Stop</div></div>
      stop = ''//<div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#8B0000', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    }

    var outerbg ='#e1e1e1'
    var innerbg = '#5d5480'
    var fontColor = '#e1e1e1'

    if(this.props.branding == 'SPARC'){
      innerbg = SPARCBLUE2
      fontColor = 'black'
    }
    var innerWidth = 100;
    var innerFont = 14;
    var status = (<div style={{width:500}}>
    <div style={{textAlign:'center', marginTop:5, fontSize:20}}><div><div style={{display:'inline-block', width:250}}>Net Weight: {this.props.netWeight}</div>
    <div style={{display:'inline-block', width:250}}>Live Weight: {this.props.liveWeight}</div>
    </div>
    <div>{this.props.status}</div></div>
    </div>)

    //var status = <div style={{display:'inline-block', color:'#e1e1e1', textAlign:'center',}}></div>

    return <div style={{display:'grid', gridTemplateColumns:"285px auto", background:'#e1e1e1', borderRadius:20,paddingLeft:5, marginTop:5, width:819}}>
      <div>{play}{stop} </div><div> {status}</div>
        <AlertModal ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{"This will end the current batch. Confirm?"}</div></AlertModal>
        <MessageModal ref={this.msgm}/>
    </div>
  }
}

class BatchStart extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
  }
}
class AddBatch extends React.Component{
  constructor(props){
    super(props);
    this.addBatch = this.addBatch.bind(this);
    this.state = {PlanBatchId:0,PlanBatchRef:'',PlanBatchProdNum:1,PlanBatchNumPacks:100}
  }
  addBatch(){
    this.props.addBatch({PlanBatchId:this.state.PlanBatchId,PlanBatchRef:this.state.PlanBatchRef,PlanProdNum:this.state.PlanBatchProdNum,PlanNumPacks:this.state.PlanBatchNumPacks})
  }
  render(){
    var self = this;
   // console.log('param',vdefByMac[this.props.mac][1][12]['PlanBatchId'], vdefByMac[this.props.mac][1][12]['PlanBatchRef'],vdefByMac[this.props.mac][1][12]['PlanNumPacks'], vdefByMac[this.props.mac][1][12]['PlanProdNum'])
    var selProdName = '';
    var selVal = 0
    var prodnames = this.props.prodList.map(function (p) {
      
      return p.no + '. '+p.name;
      // body...
    })
    this.props.prodList.forEach(function (p,i) {
      // body...
      if(p.no == self.state.PlanBatchProdNum){
        selProdName = p.name;
        selVal = i
      }
    })
   // console.log(6992, prodnames)
    return <div style={{background:'#e1e1e1',padding:10}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Add New Batch'}</div></h2></span>
     
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchRef'} vMap={vMapV2['PlanBatchRef']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchRef']['@translations'][this.props.language]['name']} value={this.state.PlanBatchRef} param={vdefByMac[this.props.mac][1][12]['PlanBatchRef']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchRef:v})} num={false} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchRef']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchNumPacks'} vMap={vMapV2['PlanBatchNumPacks']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['name']} value={this.state.PlanBatchNumPacks} param={vdefByMac[this.props.mac][1][12]['PlanNumPacks']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchNumPacks:parseInt(v)})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchProdNum'} vMap={vMapV2['PlanBatchProdNum']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['ProdName']['@translations'][this.props.language]['name']} value={selProdName} param={vdefByMac[this.props.mac][1][12]['PlanProdNum']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchProdNum:this.props.prodList[v].no})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchProdNum']['@translations'][this.props.language]['description']} listOverride={true} ovList={prodnames}/></div>   
        <div style={{marginTop:140,marginLeft:340}}>

        <CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.addBatch} lab={'Add'}/></div>
      
    </div>
  }
}
class EditBatch extends React.Component{
  constructor(props){
    super(props);
    this.addBatch = this.addBatch.bind(this);

    this.state = {PlanBatchId:this.props.curBatch['PlanBatchId'],PlanBatchRef:this.props.curBatch['PlanBatchRef'],PlanBatchProdNum:this.props.curBatch['PlanProdNum'],PlanBatchNumPacks:this.props.curBatch['PlanNumPacks']}
  }
  addBatch(){
    this.props.addBatch({PlanBatchId:this.state.PlanBatchId,PlanBatchRef:this.state.PlanBatchRef,PlanProdNum:this.state.PlanBatchProdNum,PlanNumPacks:this.state.PlanBatchNumPacks})
  }
  render(){
    var self = this;
   // console.log('param',vdefByMac[this.props.mac][1][12]['PlanBatchId'], vdefByMac[this.props.mac][1][12]['PlanBatchRef'],vdefByMac[this.props.mac][1][12]['PlanNumPacks'], vdefByMac[this.props.mac][1][12]['PlanProdNum'])
    var selProdName = '';
    var selVal = 0
    var prodnames = this.props.prodList.map(function (p) {
      
      return p.no + '. '+p.name;
      // body...
    })
    this.props.prodList.forEach(function (p,i) {
      // body...
      if(p.no == self.state.PlanBatchProdNum){
        selProdName = p.name;
        selVal = i
      }
    })
   // console.log(6992, prodnames)
    return <div style={{background:'#e1e1e1',padding:10}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Edit Batch'}</div></h2></span>
     
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchRef'} vMap={vMapV2['PlanBatchRef']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchRef']['@translations'][this.props.language]['name']} value={this.state.PlanBatchRef} param={vdefByMac[this.props.mac][1][12]['PlanBatchRef']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchRef:v})} num={false} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchRef']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchNumPacks'} vMap={vMapV2['PlanBatchNumPacks']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['name']} value={this.state.PlanBatchNumPacks} param={vdefByMac[this.props.mac][1][12]['PlanNumPacks']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchNumPacks:parseInt(v)})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchProdNum'} vMap={vMapV2['PlanBatchProdNum']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['ProdName']['@translations'][this.props.language]['name']} value={selProdName} param={vdefByMac[this.props.mac][1][12]['PlanProdNum']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchProdNum:this.props.prodList[v].no})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchProdNum']['@translations'][this.props.language]['description']} listOverride={true} ovList={prodnames}/></div>   
        <div style={{marginTop:140,marginLeft:340}}><CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.addBatch} lab={'Confirm'}/></div>
      
    </div>
  }
}
class ManBatch extends React.Component{
  constructor(props){
    super(props);
    this.addBatch = this.addBatch.bind(this);
    this.state = {PlanBatchId:0,PlanBatchRef:'',PlanBatchProdNum:1,PlanBatchNumPacks:100}
  }
  addBatch(){
    this.props.addBatch({PlanBatchId:this.state.PlanBatchId,PlanBatchRef:this.state.PlanBatchRef,PlanProdNum:this.state.PlanBatchProdNum,PlanNumPacks:this.state.PlanBatchNumPacks})
  }
  render(){
    // console.log('param',vdefByMac[this.props.mac][1][12]['PlanBatchId'], vdefByMac[this.props.mac][1][12]['PlanBatchRef'],vdefByMac[this.props.mac][1][12]['PlanNumPacks'], vdefByMac[this.props.mac][1][12]['PlanProdNum'])
    var self = this;

    var selProdName = '';
    var selVal = 0
    var prodnames = this.props.prodList.map(function (p) {
      
      return p.no + '. '+p.name;
      // body...
    })
    this.props.prodList.forEach(function (p,i) {
      // body...
      if(p.no == self.state.PlanBatchProdNum){
        selProdName = p.name;
        selVal = i
      }
    })
   // console.log(this.props.mac)
    if(vdefByMac[this.props.mac]){
      return <div style={{background:'#e1e1e1',padding:10}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Start New Batch'}</div></h2></span>
     
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchRef'} vMap={vMapV2['PlanBatchRef']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchRef']['@translations'][this.props.language]['name']} value={this.state.PlanBatchRef} param={vdefByMac[this.props.mac][1][12]['PlanBatchRef']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchRef:v})} num={false} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchRef']['@translations'][this.props.language]['description']}/></div>
      <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchNumPacks'} vMap={vMapV2['PlanBatchNumPacks']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['name']} value={this.state.PlanBatchNumPacks} param={vdefByMac[this.props.mac][1][12]['PlanNumPacks']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchNumPacks:parseInt(v)})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchNumPacks']['@translations'][this.props.language]['description']}/></div>
    <div style={{marginTop:5}}><ProdSettingEdit submitChange={this.props.submitChange} trans={true} name={'PlanBatchProdNum'} vMap={vMapV2['PlanBatchProdNum']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['ProdName']['@translations'][this.props.language]['name']} value={selProdName} param={vdefByMac[this.props.mac][1][12]['PlanProdNum']} editable={true} onEdit={(p,v)=>this.setState({PlanBatchProdNum:this.props.prodList[v].no})} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['PlanBatchProdNum']['@translations'][this.props.language]['description']} listOverride={true} ovList={prodnames}/></div>      
    <div style={{marginTop:140,marginLeft:340}}>
     <div onClick={this.addBatch} style={{width:250, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={'assets/play-arrow-fti.svg'} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Start Batch'}</div></div>
    </div>
      
    </div>
  }else{
    return ""
    
  }
  }
}
/*******Batch stuff ends*******/

/******************Motor Controls start***************/
class MotorControl extends React.Component{
  constructor(props){
    super(props);
    this.testMotor = this.testMotor.bind(this);
  }
  testMotor(i){
    this.props.testMotor(i)
  }
  render(){
    var self = this;
    var motors = this.props.motors.map(function (m,i) {
      // body...
      return <MotorItem testMotor={self.testMotor} name={m.name} index={i} />
    })
    return <div>
      {motors}  
    </div>
  }
}
class MotorItem extends React.Component{
  constructor(props){
    super(props)
  }
  testMotor(){
    this.props.testMotor(this.props.index)
  }
  render(){
    var motorIcon = <img src='assets/motor.svg' width={40} style={{verticalAlign:'bottom'}}/>
    return <div><div style={{display:'inline-block', width:50}}>{motorIcon}</div><div style={{display:'inline-block', width:200}}>{this.props.name}</div><div style={{display:'inline-block', width:200}}>Start/Stop</div> </div>

  }
}
/******************Motor Controls end*****************/

/******************Datetime start*********************/
class FatClock extends React.Component{
  constructor(props){
    super(props)
    var dateStr = new Date().toISOString();
    this.setDate = this.setDate.bind(this);
    this.state = {date:dateStr.slice(0,10) + ' '+ dateStr.slice(11,19)}
    this.changeDT = this.changeDT.bind(this);
    this.toggleCK = this.toggleCK.bind(this);
    this.setDT = this.setDT.bind(this);
    this.setDST = this.setDST.bind(this);
    this.setTz = this.setTz.bind(this);
    this.dtsModal = React.createRef();
    this.dts = React.createRef();
  }
  componentDidMount(){
    //socket.emit('getTimezones')
  }
  setTz(tz){
    this.props.sendPacket('Timezone',tz)
  }
  setDST(dst){
    this.props.sendPacket('DaylightSavings',dst)
    this.dtsModal.current.close();
  }
  setDT(dt){
    var self = this;
    this.setState({dt:dt, tick:0})
    setTimeout(function(){
      self.setState({tick:1})
    },1000)
  }
  changeDT(dt){
    this.props.sendPacket('DateTime', dt)
    this.dtsModal.current.close();
  }
  toggleCK(){
   /* var self = this;
    this.dtsModal.current.toggle();
    setTimeout(function(){
      self.dts.current.getDT(self.state.date)
      socket.emit('getTimezones')
    },200)
  */
  }
  setDate(date){
    var self = this;
    this.setState({date:date})

    setTimeout(function () {
      // body...
      var sec = parseInt(date.slice(-1)) + 1;
      self.setState({date:date.slice(0,-1)+sec.toString()})
    },1000)
  }
  //componentDidMount(){
    //var self = this;
    //setInterval(function () {
      // body...
     // var dateStr = new Date().toISOString();
      //self.setState({date:dateStr.slice(0,10) + ' '+ dateStr.slice(11,19)})
    //},1000)
  //}
  render(){
    var style = Object.assign({}, this.props.style);

    return <React.Fragment>
    <div style={style} onClick={this.toggleCK}>{this.state.date}</div>
      <Modal ref={this.dtsModal} innerStyle={{background:'#e1e1e1'}}>
        <DateTimeSelect setTz={this.setTz} timezones={this.props.timezones} timeZone={this.props.timeZone} branding={this.props.branding} setDST={this.setDST} dst={this.props.dst} language={this.props.language} setDT={this.changeDT} ref={this.dts}/>
      </Modal>
      </React.Fragment>
  }
}

class DateTimeSelector extends React.Component{
  constructor(props){
    super(props)
    this.state = {year:'1996',month:'01',day:'01', hour:'00',minute:'00',sec:'00'}
    this.getDT = this.getDT.bind(this);
    this.setDT = this.setDT.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.cancel = this.cancel.bind(this);
    this.dstpw = React.createRef();
    this.dpw = React.createRef();
    this.tpw = React.createRef();
  }
  componentDidMount(){
    if(this.props.dtstr){
      this.getDT(this.props.dtstr);
    }
    
  }
  getDT(dtstring='1996/01/01 00:00:00'){
    var dtarray = dtstring.split(' ');
    var date = dtarray[0].split('/');
    var time = dtarray[1].split(':')
    this.setState({year:date[0],month:date[1],day:date[2],hour:time[0],minute:time[1],sec:time[2]})
  }
  setDT(){
    var dt = this.state.year +'/'+this.state.month+'/'+this.state.day + ' ' + this.state.hour +':'+this.state.minute+':'+this.state.sec
    this.props.setDT(dt)
  }
  onDateChange(_date,i){
    var date = [parseInt(this.state.year)-1996,parseInt(this.state.month),parseInt(this.state.day)]
    if(i != 0){
      _date ++
    }
    date[i] = _date;
    // console.log(_date, date, i)
    this.setState({year:(date[0] + 1996).toString(), month:('00'+ date[1]).slice(-2).toString(), day:('00'+ date[2]).slice(-2).toString()})
  }
  onTimeChange(_time,i){
    var time = [parseInt(this.state.hour),parseInt(this.state.minute),parseInt(this.state.sec)]
    time[i] = _time;
    ////console.log(1532131312, [_time,i])
    this.setState({hour:('00'+ time[0]).slice(-2).toString(), minute:('00'+ time[1]).slice(-2).toString(), sec:('00'+ time[2]).slice(-2).toString()})
  }
  cancel(){
    this.props.cancel();
  }
  render(){
    var bgClr = FORTRESSPURPLE2
    var txtClr = '#e1e1e1'
    if(this.props.branding == 'SPARC'){
      bgClr = SPARCBLUE2
      txtClr = '#000'
    }
    var years = [];
    var months = [];
    var days = [];
    var hours = [];
    var minutes = [];
    var secs = [];
           var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
 

    for(var i = 0; i < 40; i++){
      years.push( (1996+i).toString());
    }
    for(var i=0; i<12;i++){
      months.push(('00'+(i+1)).slice(-2));
    }
    for(var i=0; i<31;i++){
      days.push(('00'+(i+1)).slice(-2));
    }
    for(var i=0; i<24;i++){
      hours.push(('00'+i).slice(-2));
    }
    for(var i=0; i<60;i++){
      minutes.push(('00'+i).slice(-2));
    }
    for(var i=0; i<60;i++){
      secs.push(('00'+i).slice(-2));
    }
    var date = [years.indexOf(this.state.year), months.indexOf(this.state.month), days.indexOf(this.state.day)];
    var time = [hours.indexOf(this.state.hour), minutes.indexOf(this.state.minute), secs.indexOf(this.state.sec)]
    var tg = ['off','on']
    var namestring = 'Select User'
    var dpw = <PopoutWheel branding={this.props.branding} vMap={vMapV2['Date']} language={this.props.language} interceptor={false} name={'Date'} ref={this.dpw} val={date} options={[years,months,days]} onChange={this.onDateChange}/>
    var tpw = <PopoutWheel branding={this.props.branding} vMap={vMapV2['Time']} language={this.props.language} interceptor={false} name={'Time'} ref={this.tpw} val={time} options={[hours,minutes,secs]} onChange={this.onTimeChange}/>
    
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 '+ SPARCBLUE1}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
      var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

      var st = {textAlign:'center',lineHeight:'51px', verticalAlign:'middle', height:51}
      st.width = 496
      st.fontSize = 24
      st.display = 'table-cell';//self.props.vst.display;
      


        
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#000"}} >
      <div style={{display:'inline-block', textAlign:'center'}}>Device Time</div></h2></span>)
    var clr = "#e1e1e1"
 
    var dateItem = (<div style={{margin:2}} onClick={()=>this.dpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {'Date'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</div>
      </div>
      </div>)

    var timeItem = (<div style={{margin:2}} onClick={()=>this.tpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {'Time'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</div>
      </div>
      </div>)
 
    return <div style={{position:'relative', color:'black'}}>{tpw}{dpw}
    <div>
    {titlediv}
    
    </div>
      {dateItem}
      {timeItem}
             <CircularButton onClick={this.setDT} branding={this.props.branding} innerStyle={innerStyle} style={{width:280, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Confirm'}/>
                <CircularButton onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:280, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Cancel'}/>
   
      </div> 
  }
}

class DateTimeModal extends React.Component{
  constructor(props){
    super(props);
    this.toggle = this.toggle.bind(this);
    this.changeDT = this.changeDT.bind(this);
    this.dts = React.createRef();
    this.dtsModal = React.createRef();
  }
  changeDT(v){
    var self = this;
    this.props.onEdit(v)
    setTimeout(function () {
      // body...
      self.dtsModal.current.close();
    },100)
  }
  toggle(){
    var self = this;
    this.dtsModal.current.toggle();
    setTimeout(function (argument) {
      // body...
      self.dts.current.getDT(self.props.value)
    },100)
  }
  render(){
    return <Modal ref={this.dtsModal} innerStyle={{background:'#e1e1e1'}}>
        <DateTimeSelector cancel={() => this.dtsModal.current.close()} branding={this.props.branding} language={this.props.language} setDT={this.changeDT} ref={this.dts}/>
      </Modal>
  }
}

class DateTimeSelect extends React.Component{
  constructor(props){
    super(props)
    this.state = {year:'1996',month:'01',day:'01', hour:'00',minute:'00',sec:'00'}
    this.getDT = this.getDT.bind(this);
    this.setDT = this.setDT.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onTimeChange = this.onTimeChange.bind(this);
    this.onDSTChange = this.onDSTChange.bind(this);
    this.onTzChange = this.onTzChange.bind(this);
    this.dstpw = React.createRef();
    this.dpw = React.createRef();
    this.tpw = React.createRef();
  }
  componentDidMount(){
    if(this.props.dtstr){
      this.getDT(this.props.dtstr);
    }
    
  }
  getDT(dtstring='1996/01/01 00:00:00'){
    var dtarray = dtstring.split(' ');
    var date = dtarray[0].split('/');
    var time = dtarray[1].split(':')
    this.setState({year:date[0],month:date[1],day:date[2],hour:time[0],minute:time[1],sec:time[2]})
  }
  setDT(){
    var dt = this.state.year +'/'+this.state.month+'/'+this.state.day + ' ' + this.state.hour +':'+this.state.minute+':'+this.state.sec
    this.props.setDT(dt)
  }
  onDateChange(_date,i){
    var date = [parseInt(this.state.year)-1996,parseInt(this.state.month),parseInt(this.state.day)]
    if(i != 0){
      _date ++
    }
    date[i] = _date;
    // console.log(_date, date, i)
    this.setState({year:(date[0] + 1996).toString(), month:('00'+ date[1]).slice(-2).toString(), day:('00'+ date[2]).slice(-2).toString()})
  }
  onTimeChange(_time,i){
    var time = [parseInt(this.state.hour),parseInt(this.state.minute),parseInt(this.state.sec)]
    time[i] = _time;
    ////console.log(1532131312, [_time,i])
    this.setState({hour:('00'+ time[0]).slice(-2).toString(), minute:('00'+ time[1]).slice(-2).toString(), sec:('00'+ time[2]).slice(-2).toString()})
  }
  onDSTChange(dst,i){
    ////console.log(dst)
    this.props.setDST(dst)
  }
  onTzChange(tz){
    this.props.setTz(tz)
  }
  render(){
    var bgClr = FORTRESSPURPLE2
    var txtClr = '#e1e1e1'
    if(this.props.branding == 'SPARC'){
      bgClr = SPARCBLUE2
      txtClr = '#000'
    }
    var years = [];
    var months = [];
    var days = [];
    var hours = [];
    var minutes = [];
    var secs = [];

    for(var i = 0; i < 40; i++){
      years.push( (1996+i).toString());
    }
    for(var i=0; i<12;i++){
      months.push(('00'+(i+1)).slice(-2));
    }
    for(var i=0; i<31;i++){
      days.push(('00'+(i+1)).slice(-2));
    }
    for(var i=0; i<24;i++){
      hours.push(('00'+i).slice(-2));
    }
    for(var i=0; i<60;i++){
      minutes.push(('00'+i).slice(-2));
    }
    for(var i=0; i<60;i++){
      secs.push(('00'+i).slice(-2));
    }
    var date = [years.indexOf(this.state.year), months.indexOf(this.state.month), days.indexOf(this.state.day)];
    var time = [hours.indexOf(this.state.hour), minutes.indexOf(this.state.minute), secs.indexOf(this.state.sec)]
    var tg = ['off','on']
    var namestring = 'Select User'
    var dpw = <PopoutWheel branding={this.props.branding} vMap={vMapV2['Date']} language={this.props.language} interceptor={false} name={'Date'} ref={this.dpw} val={date} options={[years,months,days]} onChange={this.onDateChange}/>
    var tpw = <PopoutWheel branding={this.props.branding} vMap={vMapV2['Time']} language={this.props.language} interceptor={false} name={'Time'} ref={this.tpw} val={time} options={[hours,minutes,secs]} onChange={this.onTimeChange}/>
    var dstpw = <PopoutWheel branding={this.props.branding} vMap={vMapV2['DST']} language={this.props.language} interceptor={false} name={'Daylight Savings'} ref={this.dstpw} val={[this.props.dst]} options={[['off','on']]} onChange={this.onDSTChange}/>
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 '+ SPARCBLUE1}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
      var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

      var st = {textAlign:'center',lineHeight:'51px', verticalAlign:'middle', height:51}
      st.width = 496
      st.fontSize = 24
      st.display = 'table-cell';//self.props.vst.display;
      


        
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#000"}} >
      <div style={{display:'inline-block', textAlign:'center'}}>DateTime</div></h2></span>)
    var clr = "#e1e1e1"
 
    var dateItem = (<div style={{margin:2}} onClick={()=>this.dpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {'Date'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</div>
      </div>
      </div>)

    var timeItem = (<div style={{margin:2}} onClick={()=>this.tpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {'Time'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</div>
      </div>
      </div>)
    var dstItem =  (<div style={{margin:2}} onClick={()=>this.dstpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {'Daylight Savings'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{tg[this.props.dst]}</div>
      </div>
      </div>)

    return <div style={{position:'relative', color:'black'}}>{tpw}{dpw}{dstpw}
    <div>
    {titlediv}
    
    </div>
      {dateItem}
      {timeItem}
      {dstItem}
      <TimezoneControl timezones={this.props.timezones} timeZone={this.props.timeZone} onTzChange={this.onTzChange} language={this.props.language} branding={this.props.branding}/>
      <button className='customAlertButton' onClick={this.setDT}>Set DateTime</button>
    </div> 
  }
}
class TimezoneControl extends React.Component{
  constructor(props){
    super(props);
    this.onTzChange = this.onTzChange.bind(this);
    this.tz = React.createRef();
    this.state = {timeZone:props.timeZone, tzlist:props.timezones.map(function (tz) {
      // body...
      return tz.text;
    })}
  }
  componentWillReceiveProps(newProps){
    this.setState({timeZone:newProps.timeZone, tzlist:newProps.timezones.map(function(tz) {
      // body...
      return tz.text
    })})
  }
  onTzChange(v){
    this.props.onTzChange(this.props.timezones[v].index)
  }
  render(){
    var bgClr = FORTRESSPURPLE2
    var txtClr = '#e1e1e1'
    if(this.props.branding == 'SPARC'){
      bgClr = SPARCBLUE2
      txtClr = '#000'
    }

    var st = {textAlign:'center',lineHeight:'51px', verticalAlign:'middle', height:51}
    st.width = 496
    st.fontSize = 24
    st.display = 'table-cell';//self.props.vst.display;

    var tz = <PopoutWheel ovWidth={600} branding={this.props.branding} vMap={vMapV2['Timezone']} language={this.props.language} interceptor={false} name={'Timezone'} ref={this.tz} val={[this.state.timeZone]} options={[this.state.tzlist]} onChange={this.onTzChange}/>
  
    var tzTxt = ''
    if(this.props.timezones[this.state.timeZone]){
      tzTxt = this.props.timezones[this.state.timeZone-1].text;
    }
    var tzItem = (<div style={{margin:2}} onClick={()=>this.tz.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}}>
        {'Time Zone'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{tzTxt}</div>
      </div>
      </div>)


    return <React.Fragment>{tzItem}{tz}</React.Fragment>
  }
}
/******************Datetime end***********************/

/******************Modals start **********************/
class LogoutModal extends React.Component{
  constructor(props){
    super(props)
    var klass = 'custom-modal'
    if(this.props.className){
      klass = this.props.className
    }
    this.state = ({className:klass, show:false, override:false ,keyboardVisible:false, func: (function () {}),arg:-1, alertMessage:''});
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.do = this.do.bind(this);
  }
  show(func, arg, alertMessage){
    // console.log('show copy modal')
    this.setState({show:true,func:func, arg:arg, alertMessage:alertMessage})
  }
  close () {
    var self = this;
    setTimeout(function () {
      self.setState({show:false})
    },100)
    
  }
  do(){
    // console.log('THis SHould DO')
    this.state.func(this.state.arg)
  }
  render () {
    var cont = ""
    if(this.state.show){
    cont =  <LogoutModalCont branding={this.props.branding} vMap={this.props.vMap} do={this.do} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.state.alertMessage}</LogoutModalCont>
    }
    return <div hidden={!this.state.show} className= 'pop-modal'>
      {cont}
    </div>
  }
}
class LogoutModalC extends React.Component{
  constructor(props){
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.close = this.close.bind(this);
    this.do = this.do.bind(this);
  //  this.discard = this.discard.bind(this);
    this.cancel = this.cancel.bind(this);
  }
  componentDidMount() {
    // body...
  }
  handleClickOutside(e) {
    // body...
    if(this.props.show){
      this.props.close();
    }
    
  }
  close() {
    // body...
    if(this.props.show){
      this.props.close();
    }
  }
  do(){
    var self = this;
    this.props.do();
    setTimeout(function(){
      if(self.props.show){
      self.props.close();
      }
    }, 100)
    
  }
  cancel(){
    var self = this;
    setTimeout(function(){
      self.close();
      
    }, 100)
  }
  render () {
    // body...
    var self = this;
        var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    var klass = 'alertmodal-outer'
    var clr = '#fefefe'
    if(this.props.branding == 'SPARC'){
      klass = 'alertmodal-outer-sp'
      clr = '#a1a1a1'
    }
    
    return( <div className={klass}>
          <div style={{padding:10}}>
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>Confirm Action</div>
          <div style={{color:clr}}> {this.props.children}</div>
        <div>
          <CircularButton onClick={this.do} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Confirm'}/>
                <CircularButton onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Cancel'}/>
          
  </div>
        </div>
      </div>)

  }
}
class CopyModal extends React.Component{
  constructor(props){
    super(props)
    var klass = 'custom-modal'
    if(this.props.className){
      klass = this.props.className
    }
    this.state = ({className:klass, show:false, override:false ,keyboardVisible:false, func: (function () {}),arg:-1, alertMessage:''});
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.do = this.do.bind(this);
  }
  show(func, arg, alertMessage){
    // console.log('show copy modal')
    this.setState({show:true,func:func, arg:arg, alertMessage:alertMessage})
  }
  close () {
    var self = this;
    setTimeout(function () {
      self.setState({show:false})
    },100)
    
  }
  do(){
    // console.log('THis SHould DO')
    this.state.func(this.state.arg)
  }
  render () {
    var cont = ""
    if(this.state.show){
    cont =  <CopyModalCont branding={this.props.branding} vMap={this.props.vMap} do={this.do} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.state.alertMessage}</CopyModalCont>
    }
    return <div hidden={!this.state.show} className= 'pop-modal'>
      {cont}
    </div>
  }
}
class CopyModalC extends React.Component{
  constructor(props){
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.close = this.close.bind(this);
    this.do = this.do.bind(this);
  //  this.discard = this.discard.bind(this);
    this.cancel = this.cancel.bind(this);
  }
  componentDidMount() {
    // body...
  }
  handleClickOutside(e) {
    // body...
    if(this.props.show){
      this.props.close();
    }
    
  }
  close() {
    // body...
    if(this.props.show){
      this.props.close();
    }
  }
  do(){
    var self = this;
    this.props.do();
    setTimeout(function(){
      if(self.props.show){
      self.props.close();
      }
    }, 100)
    
  }
  cancel(){
    var self = this;
    setTimeout(function(){
      self.close();
      
    }, 100)
  }
  render () {
    // body... getfromhere
    var self = this;
        var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    var klass = 'alertmodal-outer'
    var clr = '#fefefe'
    if(this.props.branding == 'SPARC'){
      klass = 'alertmodal-outer-sp'
      clr = '#a1a1a1'
    }
    
    return( <div className={klass}>
          <div style={{padding:10}}>
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>Confirm Action</div>
          <div style={{color:clr}}> {this.props.children}</div>
        <div>
          <CircularButton onClick={this.do} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Confirm'}/>
                <CircularButton onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Cancel'}/>
          
  </div>
        </div>
      </div>)

  }
}
class DeleteModal extends React.Component{
  constructor(props){
    super(props)
    var klass = 'custom-modal'
    if(this.props.className){
      klass = this.props.className
    }
    this.state = ({className:klass, show:false, override:false ,keyboardVisible:false, p:-1});
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.delete = this.delete.bind(this);
    //this.discard = this.discard.bind(this);
  }
  show (p) {
    // console.log(p)
    this.setState({show:true, p:p})
  }
  close () {
    var self = this;
    setTimeout(function () {
      self.setState({show:false})
    },100)
    
  }
  delete(){
    this.props.deleteProd(this.state.p);
  }
  render () {
    var cont = ""
    if(this.state.show){
    cont =  <DeleteModalCont branding={this.props.branding} vMap={this.props.vMap} delete={this.delete} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}><div style={{width:400}}>Delete Selected Product? This will also delete all associated planned batches.</div></DeleteModalCont>
    }
    return <div hidden={!this.state.show} className= 'pop-modal'>
      {cont}
    </div>
  }
}
class DeleteModalC extends React.Component{
  constructor(props){
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.close = this.close.bind(this);
    this.delete = this.delete.bind(this);
    this.cancel = this.cancel.bind(this);
  }
  componentDidMount() {
    // body...
  }
  handleClickOutside(e) {
    // body...
    if(this.props.show){
      this.props.close();
    }
    
  }
  close() {
    // body...
    if(this.props.show){
      this.props.close();
    }
  }
  delete(){
    var self = this;
    this.props.delete();
    setTimeout(function(){
      if(self.props.show){
      self.props.close();
      }
    }, 100)
    
  }
  cancel(){
    var self = this;
    setTimeout(function(){
      self.close();
      
    }, 100)
  }
  render () {
    // body...
    var self = this;
        var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    var klass = 'alertmodal-outer'
    var clr = '#fefefe'
    if(this.props.branding == 'SPARC'){
      klass = 'alertmodal-outer-sp'
      clr = '#a1a1a1'
    }
    
    return( <div className={klass}>
          <div style={{padding:10}}>
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>Confirm Action</div>
          <div style={{color:clr}}>
          {this.props.children}
          </div>
        <div>
                <CircularButton onClick={this.delete} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Delete Product'}/>
                <CircularButton onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Cancel'}/>
          
  </div>
        </div>
      </div>)

  }
}
class PromptModal extends React.Component{
  constructor(props){
    super(props)
    var klass = 'custom-modal'
    if(this.props.className){
      klass = this.props.className
    }
    this.state = ({className:klass, show:false, override:false ,keyboardVisible:false, func: (function () {})});
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.save = this.save.bind(this);
    this.discard = this.discard.bind(this);
  }
  discard(){
    this.props.discard(this.state.func);

  }
  show (func) {
    // console.log(func)
    this.setState({show:true, func:func})
  }
  close () {
    var self = this;
    setTimeout(function () {
      setTimeout(function () {
        // body...
        if(self.props.onClose){
          self.props.onClose();
        }
      },200)
      self.setState({show:false})
    },100)
    
  }
  save(){
    this.props.save(this.state.func);
  }
  render () {
    var cont = ""
    if(this.state.show){
    cont =  <PromptModalCont branding={this.props.branding} vMap={this.props.vMap} discard={this.discard} save={this.save} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.props.children}</PromptModalCont>
    }
    return <div hidden={!this.state.show} className= 'pop-modal'>
      {cont}
    </div>
  }
}
class PromptModalC extends React.Component{
  constructor(props){
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.close = this.close.bind(this);
    this.save = this.save.bind(this);
    this.discard = this.discard.bind(this);
    this.cancel = this.cancel.bind(this);
  }
  componentDidMount() {
    // body...
  }
  handleClickOutside(e) {
    // body...
    if(this.props.show){
     // this.props.close();
    }
    
  }
  close() {
    // body...
    if(this.props.show){
      this.props.close();
    }
  }
  discard(){
    var self = this;
    this.props.discard();
    setTimeout(function(){
      if(self.props.show){
      self.props.close();
      }
    }, 100)
    
  }
  save(){
    var self = this;
    this.props.save();
    setTimeout(function(){
      if(self.props.show){
      self.props.close();
      }
    }, 100)
    
  }
  cancel(){
    var self = this;
    setTimeout(function(){
      self.close();
      
    }, 100)
  }
  render () {
    // body...
    var self = this;
        var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}
    var klass = 'alertmodal-outer'
    var clr = '#fefefe'
    if(this.props.branding == 'SPARC'){
      klass = 'alertmodal-outer-sp'
      clr = '#a1a1a1'
    }
    
    return( <div className={klass}>
          <div style={{padding:10}}>
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}><div>Warning</div><div style={{fontSize:24}}>This will make changes to current batch</div></div>
          {this.props.children}
        <div>
          <CircularButton onClick={this.discard} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Discard Changes'}/>
                <CircularButton onClick={this.save} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Save Changes'}/>
                <CircularButton onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Cancel'}/>
          
  </div>
        </div>
      </div>)

  }
}
var PromptModalCont =  onClickOutside(PromptModalC);
var DeleteModalCont =  onClickOutside(DeleteModalC);
var CopyModalCont =  onClickOutside(CopyModalC);
var LogoutModalCont =  onClickOutside(LogoutModalC);
/******************Modals end   **********************/

/*******************Faults start *********************/
class FaultDiv extends React.Component{
  constructor(props) {
    super(props)
    this.clearFaults = this.clearFaults.bind(this)
    this.clearWarnings = this.clearWarnings.bind(this)
    this.maskFault = this.maskFault.bind(this)
    this.msgm = React.createRef();
  }
  clearFaults () {
    if(this.props.pAcc){
      this.props.clearFaults()
    }else{
      this.msgm.current.show('Access Denied')
    }
    
  }
  clearWarnings(){
    if(this.props.pAcc){
    this.props.clearWarnings()
    }else{
      this.msgm.current.show('Access Denied')
    }
  }
  maskFault (f) {
    this.props.maskFault(f)
  }
  render () {
    var self = this;
    var cont;
    var wcont;
    var clButton;
    var wclButton;
    if((this.props.faults.length == 0) && (this.props.warnings.length == 0)){
      cont = (<div ><label>No Faults or Warnings</label></div>)
    }else{
            var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}
    if(this.props.faults.length != 0){
      clButton =<div> <CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Clear Faults'} onClick={this.clearFaults}/></div>
      cont = this.props.faults.map(function(f){
        return <FaultItem maskFault={self.maskFault} fault={f}/>
      })
    }
    if(this.props.warnings.length != 0){
      wclButton =<div> <CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Clear Warnings'} onClick={this.clearWarnings}/></div>
      wcont = this.props.warnings.map(function(f){
        return <FaultItem maskFault={self.maskFault} fault={f}/>
      })
    }
       
      
    }
    return(<div style={{backgroundColor:'#e1e1e1', padding:5}}>
      {cont}
      {wcont}
      {clButton}
      {wclButton}
      <MessageModal ref={this.msgm} />
    </div>)
  }
}
class FaultItem extends React.Component{
  constructor(props) {
    super(props)
  }
  render(){
    var type = this.props.fault
    if(typeof vMapV2[this.props.fault+'Mask'] != 'undefined'){
        type = vMapV2[this.props.fault+'Mask']['@translations']['english']['name'];
      }

    return <div><label>{"Fault type: " + type}</label>
    </div>
  }
}
/*******************Faults end   *********************/
class CheckWeightControl extends React.Component{
  constructor(props){
    super(props)
    this.state = {cw:0,cwset:0, waiting:false}
    this.setCW = this.setCW.bind(this);
    this.sendPacket = this.sendPacket.bind(this);
    this.sendCW = this.sendCW.bind(this);
    this.cancelCW = this.cancelCW.bind(this);
  }
  setCW(n,v){
    var self = this;
    // console.log('cwset',n,v)
    if(typeof v != 'undefined'){


      if(v != null){
        // console.log(v)
        this.setState({cwset:parseFloat(v)})
        setTimeout(function (argument) {
          // body...
          var buf = Buffer.alloc(8)
          buf.writeFloatLE(this.props.cw,0)
          buf.writeFloatLE(this.state.cwset,4)
          this.sendPacket('checkWeightSend', buf)

          //self.props.close()
        },150)
      }
    }
  }
  sendCW(){
     var buf = Buffer.alloc(8)
          buf.writeFloatLE(this.props.cw,0)
          buf.writeFloatLE(this.state.cwset,4)
          this.sendPacket('checkWeightSend', buf)
    this.props.close();
  }
  sendPacket(n,v){
    this.props.sendPacket(n,v)
  }
  cancelCW(){
    var self = this;
    this.sendPacket('cancelCW',0)
    this.setState({cwset:0})
   setTimeout(function (argument) {
          // body...
          //self.sendCW();

          self.props.close()
        },500)
  }
  render(){
    var cw = this.props.cw.toFixed(1)+'g'
    if(this.props.waiting){
      cw = 'Waiting for Weight'
    }

    return <div>
        <div style={{background:'#e1e1e1', padding:5, height:400}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Check Weight'}</div></h2></span>
       <div style={{marginTop:5}}><ProdSettingEdit trans={false} language={this.props.language} branding={this.props.branding} h1={40} w1={240} h2={51} w2={500} label={'Check Weight'} value={cw} editable={false} onEdit={this.sendPacket} num={true}/></div>
       <div style={{marginTop:5}}><ProdSettingEdit trans={false} language={this.props.language} branding={this.props.branding} h1={40} w1={240} h2={51} w2={500} label={'Measured Value'} value={this.state.cwset.toFixed(1)+'g'} editable={true} onEdit={this.setCW} param={{'@name':'checkweightmeasure'}} num={true}/></div>
        <div style={{marginTop:140}}>
        <CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:340, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.cancelCW} lab={'Cancel'}/>
        {
          cw!='Waiting for Weight' && this.state.cwset != 0 ?
          <CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:340, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.sendCW} lab={'Confirm'}/>
          :
          <CircularButton disabled={true} branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',fontSize:30,lineHeight:'50px'}} style={{width:340, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Confirm'}/>
        }
        
        </div>
        </div>
    </div>
  }
}
class CustomLabel extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		if(this.props.onClick){
			this.props.onClick(this.props.index)
		}
		
	}
	render () {
		var style = this.props.style || {}
		return <div onClick={this.onClick} style={style}>{this.props.children}</div>
	}
}

if (ip2){
  ReactDOM.render(<Container page={'dual'}/>,document.getElementById('content'))
}else{
  ReactDOM.render(<Container page={'single'}/>,document.getElementById('content'))
}
