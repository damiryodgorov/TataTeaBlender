const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
import {TrendBar,TickerBox, CanvasElem, SlimGraph, DummyGraph, Modal,GraphModal, AuthfailModal, MessageModal, AlertModal, MessageConsole, ScrollArrow} from './components.jsx'
import {CircularButton, ButtonWrapper, CustomAlertButton, CustomAlertClassedButton} from './buttons.jsx'
import {PopoutWheel} from './popwheel.jsx'
import {CustomKeyboard, KeyboardInputTextButton, EmbeddedKeyboard} from './keyboard.jsx'
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {css} from 'glamor'
import {XYPlot,MarkSeries, LabelSeries, XAxis, YAxis,VerticalGridLines, HorizontalGridLines, LineSeries, HorizontalRectSeries, VerticalRectSeries, HorizontalBarSeries, AreaSeries, VerticalBarSeries} from 'react-vis';
import {Uint64LE, Int64LE, Uint64BE, Int64BE} from 'int64-buffer';
var createReactClass = require('create-react-class');

let inputSrcArr = ["NONE","TACH","EYE","RC1","RC2","ISO_1","IO_PL8_01","IO_PL8_02","IO_PL8_03","IO_PL8_04","IO_PL8_05","IO_PL8_06","IO_PL8_07","IO_PL8_08","IO_PL8_09","IO_PL6_01","IO_PL6_02","IO_PL6_03"];
let outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

const _ioBits = ['TACH','EYE','RC_1','RC_2','REJ_EYE','AIR_PRES','REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP','CIP_TEST','CIP_PLC','PROD_SEL1','PROD_SEL2','PROD_SEL3','PROD_SEL4',
                  'TEST','NONE','REJ_MAIN','REJ_ALT','FAULT','TEST_REQ','HALO_FE', 'HALO_SS', 'LS_RED','LS_YEL','LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']


var liveTimer = {}
var myTimers = {}
//radial-gradient(circle, #30A8E233 34%, #30A8E2);

const SPARCBLUE2 = '#30A8E2'
const SPARCBLUE1 = '#1C3746'
const SPARCBLUE3 = '#475C67'
const FORTRESSPURPLE1 = 'rgb(40, 32, 72)'
const FORTRESSPURPLE2 = '#5d5480'
const FORTRESSPURPLE3 = '#6d6490'
const FORTRESSGRAPH = '#b8860b'

const vdefMapV2 = require('./vdefmap.json')
const funcJSON = require('./funcjson.json')

let vdefByMac = {};
var _Vdef;
var _pVdef;
let isVdefSet = false;
var ftiTouch = true //this.
var _nVdf;

var categories;
var netMap = vdefMapV2['@netpollsmap']

var vMapV2 = vdefMapV2["@vMap"]
var categoriesV2 = [vdefMapV2["@cwsys"]]
var catMapV2 = vdefMapV2["@catmap"]

const FtiSockIo = require('./ftisockio.js')
const FastZoom = cssTransition({ 
	enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 300  
})
Object.defineProperty(Array.prototype, 'chunk', {
    value: function(chunkSize){
        var temporal = [];
        for (var i = 0; i < this.length; i+= chunkSize){
            temporal.push(this.slice(i,i+chunkSize));
        }
        return temporal;
    }
});

const Params = require('./params.js')
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
function getParams3(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, batch){
  var params = []
  //////////console.log(cat)
  //////////console.log(pVdef)
  cat.params.forEach(function(par) {
    if(par.type == 0){

      var p = par.val
      //////////console.log(p)
        var _p = null//{'type':0, '@name':p, '@children':[], acc:par.acc}
        if(typeof pVdef[0][p] != 'undefined'){
          _p = {'type':0, '@name':p, '@data':sysRec[p], '@children':[], acc:par.acc}
        }else if(typeof pVdef[1][p] != 'undefined'){

          var data = prodRec[p]
          if(pVdef[1][p]['@labels'] == "FaultMaskBit"){
            if(prodRec[p.slice(0,-4) + "Warn"]){
              data = data + prodRec[p.slice(0,-4) + "Warn"];
            }
            
          }
          _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
          if(p == 'BeltSpeed'){
            //////console.log('653',par,_p)
          }
        }else if(typeof pVdef[2][p] != 'undefined'){
          _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc}
        }else if(typeof pVdef[3][p] != 'undefined'){
          _p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
        }else if(typeof pVdef[5][p] != 'undefined'){
          _p = {'type':0, '@name':p, '@type':'batch','@data':batch[p], '@children':[], acc:par.acc}
          
        }else if(par.val == 'Nif_ip'){
          _p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
        }else if(par.val == 'Nif_nm'){
          _p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
        }else if(par.val == 'Nif_gw'){
          _p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
        }else if(par.val == 'DCRate_A'){
          _p = {'type':0, '@name':p,'@data':prodRec[p], '@children':[], acc:par.acc}
        }     //////////console.log(_vmap[p])
    //  //console.log(p)
        if(_p != null){
        if(typeof _vmap[p] == 'undefined'){
      //  //console.log(p)
        }
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
          }else if(typeof pVdef[5][ch] != 'undefined'){
          
            _ch = batch[ch]
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
                _p = {'type':0, '@name':p, '@data':sysRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[1][pname] != 'undefined'){

                var data = prodRec[pname]
                
                _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              }else if(typeof pVdef[2][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[3][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'fram','@data':fram[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[5][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'batch','@data':batch[pname], '@children':[], acc:par.acc}
              }else if(par.val == 'DCRate'){
                _p = {'type':0, '@name':p,'@data':prodRec[pname], '@children':[], acc:par.acc}
              }
              if(_p!= null){
                params.push(_p);
              }
          
                 ///
        }else if(_vmap[p]['@test']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[5][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'batch','@data':batch[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              }else if(typeof pVdef[5][ch] != 'undefined'){
              
                _ch = batch[ch]
              }else if(ch == 'DCRate_B'){
                _ch = prodRec[ch]
              }
              _p['@children'].push(_ch)
              _p['@test'] = true; 
              params.push(_p)
          //    //console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@halo']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p['@halo'] = true; 
              params.push(_p)
              ////console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@input']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p['@combo'] = true; 
              params.push(_p)
             // //console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@batch']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[5][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'batch','@data':batch[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              }else if(typeof pVdef[5][ch] != 'undefined'){
              
                _ch = batch[ch]
              }else if(ch == 'DCRate_B'){
                _ch = prodRec[ch]
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
          params.push({type:1, '@data':iterateCats3(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, batch), acc:par.acc, child:par.child})
        }else{


          params.push({type:1, '@data':iterateCats3(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, batch), acc:par.acc})
        }
      }else if(par.type == 2){
          if(typeof par.child != 'undefined'){
          params.push({type:2, '@data':iterateCats3(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, batch), acc:par.acc, child:par.child})
        }else{


          params.push({type:2, '@data':iterateCats3(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram, batch), acc:par.acc})
        }
      }else if(par.type == 3){
        params.push({type:3, '@name':'Accounts', '@data':'get_accounts', acc:0})
      }
              
    })
  return params
}
function getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram){
	var params = []
	//////////console.log(cat)
	//////////console.log(pVdef)
	cat.params.forEach(function(par) {
		if(par.type == 0){

			var p = par.val
			//////////console.log(p)
    		var _p = null//{'type':0, '@name':p, '@children':[], acc:par.acc}
   			if(typeof pVdef[0][p] != 'undefined'){
   				_p = {'type':0, '@name':p, '@data':sysRec[p], '@children':[], acc:par.acc}
   			}else if(typeof pVdef[1][p] != 'undefined'){

   				var data = prodRec[p]
   				if(pVdef[1][p]['@labels'] == "FaultMaskBit"){
   					if(prodRec[p.slice(0,-4) + "Warn"]){
   						data = data + prodRec[p.slice(0,-4) + "Warn"];
   					}
   					
   				}
    			_p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
    			if(p == 'BeltSpeed'){
   					//////console.log('653',par,_p)
   				}
    		}else if(typeof pVdef[2][p] != 'undefined'){
    			_p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[p], '@children':[], acc:par.acc}
    		}else if(typeof pVdef[3][p] != 'undefined'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_ip'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_nm'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'Nif_gw'){
    			_p = {'type':0, '@name':p, '@type':'fram','@data':fram[p], '@children':[], acc:par.acc}
    		}else if(par.val == 'DCRate_A'){
    			_p = {'type':0, '@name':p,'@data':prodRec[p], '@children':[], acc:par.acc}
    		}    	//////////console.log(_vmap[p])
    //	//console.log(p)
    		if(_p != null){
    		if(typeof _vmap[p] == 'undefined'){
    	     console.log(p)
    		}
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
                _p = {'type':0, '@name':p, '@data':sysRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[1][pname] != 'undefined'){

                var data = prodRec[pname]
                
                _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              }else if(typeof pVdef[2][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[3][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'fram','@data':fram[pname], '@children':[], acc:par.acc}
              }else if(par.val == 'DCRate'){
                _p = {'type':0, '@name':p,'@data':prodRec[pname], '@children':[], acc:par.acc}
              }
              if(_p!= null){
                params.push(_p);
              }
          
                 ///
        }else if(_vmap[p]['@test']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
          //    //console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@halo']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p['@halo'] = true; 
              params.push(_p)
              ////console.log(335,_p)
            }
                 ///
        }else if(_vmap[p]['@input']){
          var a = _vmap[p].children[0];
                if(typeof pVdef[0][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p = {'type':0, '@name':p, '@data':sysRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[1][a] != 'undefined'){

              var data = prodRec[a]
              if(pVdef[1][a]['@labels'] == "FaultMaskBit"){
                if(prodRec[a.slice(0,-4) + "Warn"]){
                  data = data + prodRec[a.slice(0,-4) + "Warn"];
                }
                
              }
              _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
              if(p == 'BeltSpeed'){
                //////console.log('653',par,_p)
              }
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_A'){
              _p = {'type':0, '@name':p,'@data':prodRec[a], '@children':[], acc:par.acc}
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
              _p['@combo'] = true; 
              params.push(_p)
             // //console.log(335,_p)
            }
                 ///
        }
    		
    	}else if(par.type == 1){
    		if(typeof par.child != 'undefined'){
    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc})
    		}
    	}else if(par.type == 2){
    			if(typeof par.child != 'undefined'){
    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram), acc:par.acc})
    		}
    	}else if(par.type == 3){
    		params.push({type:3, '@name':'Accounts', '@data':'get_accounts', acc:0})
    	}
    					
    })
	return params
}
function iterateCats2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram){
	//////////console.log(['684',pVdef])
  ////console.log('is int', int)
	cat.params = getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram)
	
	return cat
}
function iterateCats3(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram,batch){
  //////////console.log(['684',pVdef])
  ////console.log('is int', int)
  cat.params = getParams3(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram,batch)
  
  return cat
}
var _wsurl = 'ws://' +location.host 
var socket = new FtiSockIo(_wsurl,true);

socket.on('vdef', function(vdf){
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
   	var nVdf = [[],[],[],[],[],[]];

   

    json["@params"].forEach(function(p ){

      res[p["@rec"]][p["@name"]] = p;
      res[9][p["@name"]] = p;
      nVdf[p["@rec"]].push(p['@name'])

   
    }
    );

     var bob = {}
    bob['@name'] = '@branding'
    bob['@labels'] = 'theme'
    bob['@rpcs'] = {'theme':[0]}
    res[0]['@branding'] =  bob//{'@name':'@branding', '@labels':'theme','@rpcs':{'theme':[0]}}
    res[9]['@branding'] =  bob//{'@name':'@branding', '@labels':'theme','@rpcs':{'theme':[0]}}
    res[6] = json["@deps"];
    res[7] = json["@labels"]
    res[7]['theme'] = {'english':['SPARC','FORTRESS']}
    res[8] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        ////////console.log("fault found")
        res[8].push(par)
      }
    }

    _pVdef = res;
    if(json['@defines']['LOGICAL_OUTPUT_NAMES']){
    	outputSrcArr = json['@defines']['LOGICAL_OUTPUT_NAMES'].slice(0)
      inputSrcArr = json['@defines']['PHYSICAL_INPUT_NAMES'].slice(0)
    }
    //if(json['@defines']['INTERCEPTOR']){
        vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@cwsys"]], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]

    //}else{
      //   vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapST['@categories']], vdefMapST['@vMap'], vdefMapST['@pages']]
       // vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapST["@categories"]], vdefMapST['@vMap'], vdefMapST['@pages']]

    //}

  	console.log('552',vdefByMac)
    isVdefSet = true;
})


function tickFormatter(t,i) {
	var text = t.split(' ').map(function(v,j){
		return <tspan x="0" dy={j+'em'}>{v}</tspan>
	})
  return (<text x="0"  transform='translate(-5,-5)' style={{textAnchor:"end", fontSize:14}}>
    {text}
  </text>);
}

class Container extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return <div><LandingPage/>
				<ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
			pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
			
		</div>
	}
}
class Clock extends React.Component{
	constructor(props){
		super(props)
		var dateStr = new Date().toISOString();
		this.state = {date:dateStr.slice(0,10) + ' '+ dateStr.slice(11,19)}
	}
	componentDidMount(){
		var self = this;
		setInterval(function () {
			// body...
			var dateStr = new Date().toISOString();
			self.setState({date:dateStr.slice(0,10) + ' '+ dateStr.slice(11,19)})
		},1000)
	}
	render(){
		var style = Object.assign({}, this.props.style);

		return <div style={style}>{this.state.date}</div>
	}
}
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
    var self = this;
    this.dtsModal.current.toggle();
    setTimeout(function(){
      self.dts.current.getDT(self.state.date)
      socket.emit('getTimezones')
    },200)
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
    console.log(_date, date, i)
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
      st.width = 546
      st.fontSize = 24
      st.display = 'table-cell';//self.props.vst.display;
      


        
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#000"}} >
      <div style={{display:'inline-block', textAlign:'center'}}>DateTime</div></h2></span>)
    var clr = "#e1e1e1"
 
 var dateItem = (<div style={{margin:2}} onClick={()=>this.dpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:250,textAlign:'center'}}>
        {'Date'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
        <div style={st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</div>
      </div>
      </div>)

    var timeItem = (<div style={{margin:2}} onClick={()=>this.tpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:250,textAlign:'center'}}>
        {'Time'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
        <div style={st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</div>
      </div>
      </div>)
    var dstItem =  (<div style={{margin:2}} onClick={()=>this.dstpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:250,textAlign:'center'}}>
        {'Daylight Savings'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
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
class LandingPage extends React.Component{
	constructor(props){
		super(props)
		this.state = {connectedClients:0,calibState:0,cwgt:0,waitCwgt:false,timezones:[],faultArray:[],language:'english',warningArray:[],ioBITs:{},live:false,timer:null,username:'No User',userid:0,user:-1,loginOpen:false, level:0,stack:[],currentView:'',data:[],cob:{},pcob:{},pList:[],prodListRaw:{},prodNames:[],updateCount:0,connected:false,start:true,x:null,
      branding:'FORTRESS', automode:0,currentPage:'landing',netpolls:{}, curIndex:0, progress:'',srec:{},prec:{},rec:{},crec:{},fram:{},prodList:{},
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'', version:'2018/07/30',pmsg:'',pON:false,percent:0,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'single', banks:[]}, accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''], nifip:'', nifnm:'',nifgw:''}
		this.authenticate = this.authenticate.bind(this);
		this.simulateData = this.simulateData.bind(this);
		this.simStart = this.simStart.bind(this);
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
		this.changeBranding = this.changeBranding.bind(this);
		this.loadPrefs = this.loadPrefs.bind(this)
		this.renderMBGroup = this.renderMBGroup.bind(this);
		this.renderModal = this.renderModal.bind(this);
		this.showDisplaySettings = this.showDisplaySettings.bind(this);
		this.addToTmp = this.addToTmp.bind(this);
		this.connectToUnit = this.connectToUnit.bind(this);
		this.tareWeight = this.tareWeight.bind(this);
		this.calWeight = this.calWeight.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.pModalToggle = this.pModalToggle.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.calWeightSend = this.calWeightSend.bind(this);
		this.getCob = this.getCob.bind(this);
		this.settingClick = this.settingClick.bind(this);
		this.changeView = this.changeView.bind(this);
		this.toggleLogin = this.toggleLogin.bind(this);
		this.login = this.login.bind(this);
		this.loginClosed = this.loginClosed.bind(this);
		this.authenticate = this.authenticate.bind(this);
		this.setAuthAccount = this.setAuthAccount.bind(this);
		this.logout = this.logout.bind(this);
		this.clearFaults = this.clearFaults.bind(this);
		this.saveProductPassThrough = this.saveProductPassThrough.bind(this);
		this.onPmdClose = this.onPmdClose.bind(this);
    this.checkweight = this.checkweight.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.openBatch = this.openBatch.bind(this);
    this.closeCWModal = this.closeCWModal.bind(this);
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
    this.hh = React.createRef();
    this.tb = React.createRef();
    this.pmodal = React.createRef();
    this.settingModal = React.createRef();
    this.locateModal = React.createRef();
    this.batModal = React.createRef();
    this.pmd = React.createRef();
    this.cwc = React.createRef();


	}

	toggleLogin(){
		if(this.state.user == -1){
			this.lgctl.current.login();
			this.setState({loginOpen:true})
		}else{
			this.logout()
		}
	}
	logout(){
		if(this.state.level != 0){

			toast("Logged out")
			var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_RPC_USERLOGOUT']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
		socket.emit('rpc', {ip:this.props.ip, data:packet})
    console.log(pack,668)
		this.setState({level:pack.level, username:pack.username,noupdate:false, update:true, userid:pack.user+1, user:pack.user})	
	}
	authenticate(user,pswd){
		console.log('authenticate here')
		socket.emit('authenticate',{user:parseInt(user) - 1,pswd:pswd, ip:this.state.curDet.ip})
	}
	loginClosed(){
		this.setState({loginOpen:false})//, update:true})
	}
	changeView (d) {
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
		this.setState({currentView:d[0], data:d[1]})
	}
	settingClick (s,n) {
		if((Array.isArray(s))&&(s[0] == 'get_accounts')){
			console.log('get accounts')
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
	onRMsg(e,det){
		console.log('onRMsg',e)
	}
	loadPrefs() {
		console.log('is this ready')
		if(socket.sock.readyState  ==1){
			console.log('load Prefs')
			//socket.emit('locateReq');
			socket.emit('getVersion',true);
			socket.emit('getPrefsCW',true);
      		socket.emit('getDispSettings');

		}
	}
	getCob (sys,prod,dyn, fram) {
  
		var vdef = vdefByMac[this.state.curDet.mac]
		var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
		var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
		vdef = null;
		_cvdf = null;
		return cob
	}
	getPCob (sys,prod,dyn, fram) {
  
		var vdef = vdefByMac[this.state.curDet.mac]
		var _cvdf = JSON.parse(JSON.stringify(vdef[6]['CWProd']))
		var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
		vdef = null;
		_cvdf = null;
		return cob
	}
	shouldComponentUpdate(nextProps, nextState){
		if(true ==  nextState.noupdate){
			return false;
		}
		return true;
	}
	onParamMsg(e,u){
		//console.log('onParamMsg', e.type)
		if(this.state.curDet.ip == u.ip){
			var self = this;
			liveTimer[this.state.curDet.mac] = Date.now()
			if(typeof e != 'undefined'){
				var pVdef = vdefByMac[this.state.curDet.mac][1]
				var vdf = vdefByMac[this.state.curDet.mac][0]
				if(e.type == 0){
					console.log('Sys Rec')
          var language = vdf['@labels']['Language']['english'][e.rec['Language']];
          if(language == 'russian' || language == 'polish' || language == 'chinese'){
            language = 'korean'
          }
          if(this.state.branding == 'SPARC'){
            e.rec['@branding'] = 0
          }else{
            e.rec['@branding'] = 1
          }
          console.log(language)
          if(e.rec['TareWeight']!= this.state.srec['TareWeight']){
           // toast('Taring...')
          }
					this.setState({noupdate:false,srec:e.rec,language:language, cob:this.getCob(e.rec, this.state.prec, this.state.rec,this.state.fram), pcob:this.getPCob(e.rec, this.state.prec, this.state.rec,this.state.fram)})
				}else if(e.type == 1){
					console.log('Prod Rec')
					this.setState({noupdate:false,prec:e.rec, cob:this.getCob(this.state.srec, e.rec, this.state.rec,this.state.fram), pcob:this.getPCob(this.state.srec,e.rec, this.state.rec,this.state.fram)})
				}else if(e.type == 2){
					var iobits = {}
					var noupdate = true
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
						if(isDiff(iobits,this.state.ioBITs)){
    						noupdate = false;
                console.log(1347, iobits)
    					}
    			
					}
          if(e.rec['EditProdNeedToSave'] != self.state.rec['EditProdNeedToSave']){
            noupdate=false;
          }
					/*if(_ioBits){
	   					_ioBits.forEach(function(b){
    						if(typeof e.rec[b] != 'undefined'){
    							iobits[b] = e.rec[b]
    						}
    					})
    				}*/
    				var faultArray = [];
				  	var warningArray = [];

					pVdef[8].forEach(function(f){
					if(e.rec[f] != 0){
						faultArray.push(f)
							if(self.state.prec[f+'Warn'] == 1){
								warningArray.push(f)
							}
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
             //setTimeout(function (argument) {
               // body...
               //this.setState({cw:pw, waiting:false})
             //},150)
              this.setState({waitCwgt:false, noupdate:false})
          
          
            }
          }
          if(e.rec['DateTime'] != this.state.rec['DateTime']){
            this.fclck.current.setDate(e.rec['DateTime'])
          }
					if(this.state.updateCount == 0){
						var lw = 0;
    				if(typeof e.rec['LiveWeight'] != 'undefined'){
    					lw = e.rec['LiveWeight']
    				}
				      this.ss.current.setState({rec:e.rec, crec:this.state.crec, lw:(lw).toFixed(1) + 'g'})
              if(this.sd.current){
                console.log('update Live Weight')
                this.sd.current.updateLiveWeight(lw)
              }
        
					}
          if(e.rec['Calibrating'] != this.state.rec['Calibrating']){
            noupdate = false;
          }
          if(e.rec['BatchRunning'] != this.state.rec['BatchRunning']){
            if(typeof this.state.rec['BatchRunning'] != 'undefined'){
              if(e.rec['BatchRunning'] == 1){
                toast('Batch Started');
              }else{
                 toast('Batch Stopped')
              }
              noupdate = false
            }
          }
          this.setState({calibState:e.rec['Calibrating'],faultArray:faultArray,start:(e.rec['BatchRunning'] == 0), stop:(e.rec['BatchRunning'] == 1),warningArray:warningArray,rec:e.rec,ioBITs:iobits,updateCount:(this.state.updateCount+1)%4, noupdate:noupdate, live:true})
          
					
				}else if(e.type == 3){
					e.rec.Nif_ip = this.state.nifip
					e.rec.Nif_gw = this.state.nifgw
					e.rec.Nif_nm = this.state.nifnm
          e.rec.ConnectedClients = this.state.connectedClients
					this.setState({noupdate:false,fram:e.rec,cob:this.getCob(this.state.srec, this.state.prec, this.state.rec,e.rec)})
				}else if(e.type == 5){
					console.log('checkweighing pack')
					var del = 25
					var dur = 50
					if(typeof this.state.prec["SampDelEnd"] != 'undefined'){
						console.log('This should hit')
						del = this.state.prec['SampDelEnd'];
						dur = this.state.prec['SampDur'];
					}
          var ms = new Uint64LE(e.rec['BatchStartMS'].data)
          var sms = new Uint64LE(e.rec['SampleStartMS'].data)
          console.log(inputSrcArr, outputSrcArr)
          console.log(1217, ms.toString(), Date.now())
					console.log('passed')
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
          

          e.rec['BatchStartDate'] = new Date(parseInt(ms.toString()) + hours + mins)
          e.rec['SampleStartDate'] = new Date(parseInt(sms.toString()) + hours + mins)
          e.rec['BatchStartMS'] = parseInt(ms.toString())
          e.rec['SampleStartMS'] = parseInt(sms.toString())
          this.setState({crec:e.rec, noupdate:true})
					this.lg.current.parseDataset(e.rec['PackSamples'].slice(0), e.rec['SettleWinStart'], e.rec['SettleWinEnd'], e.rec['PackMax'], e.rec['PackMin'], this.state.srec['CalFactor'], 
							this.state.srec['TareWeight'], e.rec['PackWeight'], e.rec['WeightPassed'], e.rec['WeighWinStart'], e.rec['WeighWinEnd']);
					this.hh.current.parseCrec(e.rec)
          if(this.btc.current){
            this.btc.current.parseCrec(e.rec)
          }
					this.ss.current.setState({crec:e.rec})
          this.se.current.setState({crec:e.rec["PackWeight"].toFixed(1) + 'g'})
					this.tb.current.update(e.rec['PackWeight']);
          //cwc check
          if(e.rec['WeightPassed'] == 9){
            this.setState({cwgt:e.rec['PackWeight'], noupdate:false})
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
	sendPacket(n,v){
		//LandingPage.sendPacket
		var self = this;
		console.log(n,v)
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
				socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
			}else if(n== 'getProdList'){
        socket.emit('getProdList', this.state.curDet.ip)
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
      socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
				socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
			
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
        socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
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
        socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
      
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
				socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
			
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
				socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})

			//	if(n['@name'] == 'ProdName'){
				setTimeout(function (argument) {
					socket.emit('getProdList', self.state.curDet.ip)
				},150)
			//}
			}else if( n == 'refresh'){
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      
      }else if( n == 'BatchStart'){
     
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if( n == 'BatchEnd'){
        //toast('Batch Stopped')
      var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STOPBATCH']
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }else if(n=='DateTime'){
        var rpc = vdef[0]['@rpc_map']['LOCF_DATE_TIME_WRITE']
  
      var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],v);
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
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
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
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
      socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
      }
		}else{
			console.log('here')
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
			
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
		}else if(n['@rpcs']['write']){
			console.log('should be here')
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
			}
			console.log(819, strArg, typeof strArg, v)
		
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			console.log(packet)
				
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
			
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
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
		}else if(n['@rpcs']['clear']){
			var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
				
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
		}
		}
	}
	componentDidMount(){
		var self = this;

		this.state.timer = setInterval(function(){
			//////console.log('4596', self.state.rpcResp)
			if(self.state.connected){
				if((Date.now() - liveTimer[self.state.curDet.mac]) > 1500){
					self.setState({live:false, noupdate:false})
				}
			
			}

		}, 1500)

		setTimeout(function (argument) {
			
			self.loadPrefs();
		}, 500)		
		socket.on('userNames', function(p){
			console.log(['808', p])
			self.setState({usernames:p.det.data.array})//, update:true})
			
		})
    socket.on('connectedClients',function (c) {
      var fram = self.state.fram
      fram.ConnectedClients = c
      self.setState({connectedClients:c,fram:fram, noupdate:false})
      // body...
    })
		socket.on('resetConfirm', function (r) {
			//socket.emit('locateReq',true);
		})
		socket.on('nif', function(iface){
			////console.log('811', iface)
			self.setState({nifip:iface.address, nifnm:iface.netmask})
		})
		socket.on('version',function (version) {
			// body...
			self.setState({version:version})
		})
		socket.on('gw', function(gw){
			////console.log('823', gw)
			self.setState({nifgw:gw})
		})
		socket.on('displayUpdate', function(){
		//	self.refs.updateModal.toggle();
		})
		socket.on('updateProgress',function(r){
			self.setState({progress:r})
		})
		socket.on('onReset', function(r){
			self.setState({currentPage:'landing', curDet:''});
	  })
	
		socket.on('netpoll', function(m){
			//////////////console.log(['73',m])
			self.onNetpoll(m.data, m.det)
			m = null;
		})
		socket.on('prefs', function(f) {
			////////////console.log(f)

			console.log('prefs',f)
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
				socket.emit('locateUnicast', _ip, true)
			}else{
				socket.emit('locateReq',true)
			}
			setTimeout(function (argument) {
			// body...
			if(f.length == 1){
				if(!self.state.connected){
					if(f[0].banks.length == 1){
						if(vdefByMac[f[0].banks[0].mac]){
							////console.log('try first here?')
							self.connectToUnit(f[0].banks[0])
						}else{
							console.log('no vdef', vdefByMac)
							setTimeout(function () {
								// body...
								if(!self.state.connected){
									////console.log('switch?')
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
		socket.on('notify',function(msg){
			console.log(msg)
			toast(msg)
		})
		socket.on('progressNotify',function(pk){
			var on = pk.on;
			var msg = pk.msg;
			var percentage = pk.percentage
		})
		socket.on('testusb',function(dev){

			////console.log(['testusb',dev])
		})
		socket.on('noVdef', function(det){
			setTimeout(function(){
				socket.emit('vdefReq', det);
			}, 1000)
		})
		socket.on('notvisible', function(e){
			toast('Detectors located, but network does not match')
		})
		socket.on('prodNames',function (pack) {
			// body...
			console.log('prodNames')
			if(self.state.curDet.ip == pack.ip){
				self.setState({pList:pack.list, prodNames:pack.names, noupdate:false})
			}
		})
		socket.on('locatedResp', function (e) {
			console.log(e,924)
		try{
		if(typeof e[0] != 'undefined'){
			var dets = self.state.detL;
			var macs = self.state.macList.slice(0);
			var nps = self.state.netpolls;
			if(e.length == 1){

			}
			
			var detectors = [];
			e.forEach(function(d){
					
					macs.push(d.mac)
					dets[d.mac] = d;
					if(macs.indexOf(d.mac) == -1){
						macs.push(d.mac)
						dets[d.mac] = d
					}
					////////////console.log(d)
					socket.emit('vdefReq', d);

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
				////console.log(['852',u.banks.slice(0), banks])
				u.banks = banks;
			})
			var curDet = self.state.curDet;

			if(self.state.currentPage != 'landing'){
				if(dets[curDet.mac]){
					curDet = dets[curDet.mac];
				}
				else{
					////console.log(895, 'this is the problem')
				}
			}
			////////////console.log(dets)
			mbunits.forEach(function(u){
				u.banks.forEach(function(b) {

					dets[b.mac] = null;
					if(!nps[b.ip]){
						nps[b.ip] = []
					}
					////////console.log('connectToUnit')
					if(cnt == 1){
					//	socket.emit('connectToUnit', {ip:b.ip, app_name:b.app, app:b.app})
					//	self.setState({curDet:det, connected:true})

					}
								
				})
			})
		
			//socket.emit('savePrefsCW', mbunits)
			var nfip = self.state.nifip;
			if(e.length > 1){
				nfip = e[0].nif_ip
			}
			self.setState({dets:e, detL:dets, mbunits:mbunits,curDet:curDet, macList:macs, netpolls:nps, nifip:nfip})
		}
			}catch(er){
			////console.log(914,er)
			//	toast(er.message)
			}
      socket.emit('getTimezones')
		});
   		socket.on('dispSettings', function(disp){
      	self.setState({automode:disp.mode})
    	})  
		
		socket.on('paramMsgCW', function(data) {
			//console.log(data.data)
			self.onParamMsg(data.data, data.det)
			//self.onParamMsg2(data.data,data.det) 
			data = null;
		})
		socket.on('rpcMsg', function (data) {
			//////console.log(data)
			self.onRMsg(data.data, data.det)
			data = null;
		})
		socket.on('loggedIn', function(data){
			//self.refs.logIn.toggle();
			self.setState({curUser:data.id, level:data.level})
		})

		socket.on('logOut', function(){
			self.setState({curUser:'', level:0})
		})
		socket.on('accounts', function(data){
			////console.log(data)
			self.setState({accounts:data.data})
		})

		socket.on('authResp', function(pack){
			if(pack.reset){
				self.setAuthAccount(pack)
			}else{
				self.setAuthAccount(pack)
	
			}
		})
		socket.on('authFail', function(pack){
			toast('Authentication failed')
			self.setAuthAccount({user:'Not Logged In', level:0, user:-1})
		})
		socket.on('passwordNotify',function(e){
			console.log(1117,e)
			var message = 'Call Fortress with ' + e.join(', ');
			//self.refs.msgm.show(message)
		})
    socket.on('timezones',function (e) {
      // body...
      self.setState({timezones:e})
    })

	}
	tareWeight(){
		if(this.state.connected){
			console.log(this.state.curDet, vdefByMac)
			var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_TARE_WEIGHT_TARE']
				var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})

		}
	}
	calWeight(){
		this.cwModal.current.toggle()
	}	
	calWeightSend(){
		if(this.state.connected){
			console.log(this.state.curDet, vdefByMac)
			var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_CAL_WEIGHT_USE']
				var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})

		}
	}
	simulateData(){
		var data = []

		var skew = (Math.random()-0.5)*0.8
		for(var i=0;i<30;i++){
			var j = (i-15)*0.8 + 15
			var pos = 15 + 0.5*(Math.random() - 0.5);
			var x = (17 - 0.5*(j-pos)*(j-pos))
			if(x<=1){
				x = Math.pow(2,x-1)
			}

			data.push(x + Math.random()*3*(17-x)/15 + skew);
		}
		var pack = Math.random()*100
		this.hh.current.parsePack(pack)
		var max = Math.max(...data)
		this.ss.current.parsePack(max);
		this.tb.current.update(max);
		this.se.current.setState({value:max.toFixed(1)+' g'})
		this.lg.current.parseDataset(data, pack)

	}
	changeBranding(){
		/*
		if(this.state.branding == 'FORTRESS'){
			this.setState({branding:'SPARC'})
		}else{
			this.setState({branding:'FORTRESS'})
		}*/

	}
	start(){
		//if(this.state.start){
		//	this.simStart()
		//}
    this.sendPacket('BatchStart')
	 
    this.setState({start:false})

  }
	stop(){
		//if(!this.state.start){
		//	this.simStart()
		//}
    this.sendPacket('BatchEnd')
	   
    this.setState({start:true})
  }
	simStart(){
		var self = this;
		var x = this.state.x
		if(this.state.start){
			x = setInterval(function(){
				self.simulateData()
			},400)
		}else{
			clearInterval(x)
		}
		this.setState({x:x,start:!this.state.start})
	}
	onNetpoll(){
		console.log('netpoll')
	}
	showDisplaySettings(){
		var self = this;
		if(this.state.connected){
			this.sendPacket('refresh')
		}
		setTimeout(function () {
			self.settingModal.current.toggle()
		},100)
    setTimeout(function () {
        // body...
        socket.emit('getConnectedClients')
      },200)
		socket.emit('locateReq',true)
		
	}
	addToTmpGroup(){

	}
	addToTmp(e, type){
		var cont;
		var dsps = this.state.dets
		var detL = this.state.detL
		var mbUnits;
			cont = this.state.tmpMB.banks;
			mbUnits = this.state.tmpMB
			if(mbUnits.type == 'single'){
			if(cont.length != 0){
				return;
			}
				mbUnits.name = dsps[e].name
			}
			var tmpdsp = dsps[e]
		
		/*if(vdefByMac[dsps[e].mac][0]['@defines']['FINAL_FRAM_STRUCT_SIZE']){
            tmpdsp.ts_login = true;   
        }*/
		socket.emit('connect',tmpdsp.ip)
		cont.push(tmpdsp)
		detL[dsps[e].mac] = null;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})	
	}
	removeFromTmpGroup(e) {
		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		detL[cont[e].mac] = cont[e]
		cont.splice(e,1)
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
	}
	connectToUnit(det){
		var self = this;
		socket.emit('connectToUnit',{ip:det.ip, app:'FTI_CW', app_name:'FTI_CW'})

		var unit = {name:det.name, type:'single', banks:[det]}
		//socket.emit('vdefReq', det);
		setTimeout(function (argument) {
			// body...
			console.log(1308, unit)
			socket.emit('savePrefsCW', [unit])
		},150)
		setTimeout(function (argument) {
			// body...
			self.sendPacket('refresh')
		},300)
	//	setTimeout(function(){socket.emit('getProdList',det.ip)},150)
		this.setState({curDet:det, connected:true})
	}
	renderModal() {
		var self = this;
		
		    	var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

		var detectors = this.state.dets.map(function (det, i) {
			// body...
			return   <div> <CircularButton branding={self.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={det.ip} onClick={()=> self.connectToUnit(det)}/></div>
       
		})
			//var MB = this.renderMBGroup(2)
			return (<div>
				{detectors}
			</div>)

      /*<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
                <button onClick={this.save}>Save Settings</button>
                <button onClick={this.loadPrefs}>Load Saved Settings </button>
                <button onClick={this.reset}>Reset Connections</button>*/
	}
	renderMBGroup(mode) {
		var self = this;
		var submit = (<button onClick={this.submitMB}>Submit</button>)
	
			var detectors = this.state.dets.map(function(det, i){
				if(self.state.detL[det.mac]){
						return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmp}/>)
				}
			})

			var MB = this.state.tmpMB; 
			var type = MB.type;
			var banks = MB.banks.map(function (b,i) {
					return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpGroup}/>)	
			})
			var nameEdit = <CustomKeyboard language={'english'}  onFocus={this.addFocus} onRequestClose={this.addClose} onChange={this.changetMBName} ref='an' value={MB.name} 
									onChange={this.onChange} num={false} label={'AlphaNumeric Keyboard - Hello'}/>
			return (<div><label>Name:</label><CustomLabel onClick={this.editName}>{MB.name}</CustomLabel>
					<table style={{background:'#818a90'}}><tbody><tr>
					<th>Available Detectors</th><th>Banks</th>
					</tr><tr>
					<td style={{width:300, border:'1px solid black', minHeight:50}}>
					<div style={{maxHeight:350, overflowY:'scroll'}}>
						{detectors}
					</div>
					</td><td style={{width:300,  border:'1px solid black', minHeight:50, maxHeight:350, overflowY:'scroll'}}>
					<div style={{maxHeight:350, overflowY:'scroll'}}>
						{banks}
					</div>
					</td><td><div style={{height:30}}/></td></tr></tbody></table>
					{submit}<button onClick={this.cancel}>Cancel</button>
					{nameEdit}
					</div>)
	}
	pModalToggle(){
		if(typeof this.state.curDet.ip != 'undefined'){
				this.pmodal.current.toggle();
		socket.emit('getProdList', this.state.curDet.ip)
		}
	
	}
	imgClick(){
		console.log('clicked')
		location.reload();
	}
	clearFaults(){
		this.sendPacket('clearFaults');

	}
	openBatch(){
    if(typeof this.state.curDet.ip != 'undefined'){
      this.batModal.current.toggle();
    }
	}
	onPmdClose(){
		if(this.state.rec['EditProdNeedToSave'] == 1){
	
		this.pmd.current.show(function () {
			// body...

		});
		}	
	}
  checkweight(){
    this.sendPacket('checkWeight')
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
	render(){
		//LandingPage.render

		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}

		var config = 'config_w'
    	var find = 'find_w'
    	var klass = 'interceptorDynamicView'
    	var pl = 'assets/play-arrow-fti.svg'
    	var stp = 'assets/stop-fti.svg'
    	var backgroundColor;
    	var grbg = '#e1e1e1'
    	var img = 'assets/NewFortressTechnologyLogo-WHT-trans.png'
    	var psbtklass = 'circularButton'
    	var psbtcolor = 'black'
    	var grbrdcolor = '#e1e1e1'
      var raptor = '';

    	var language = this.state.language
    	if(this.state.branding == 'FORTRESS'){
    		backgroundColor = FORTRESSPURPLE1
    		grbrdcolor = '#e1e1e1'
    		psbtcolor = '#1C3746'
    		psbtklass = 'circularButton_sp'
        raptor = <div style={{fontSize:45, color:'#e1e1e1', textAlign:'center'}}><span style={{fontSize:66, verticalAlign:'bottom', lineHeight:'76px'}}>R</span><span>APTOR</span></div>
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
    	var play, stop;
    	if(this.state.start){
    		play = <div onClick={this.start} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
    		stop = <div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    	}else{
    		play = <div onClick={this.start} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#00FF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
			stop = <div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#8B0000', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    	}   

    	var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

      var cont = ''
    	var sd = <div><DisplaySettings nifip={this.state.nifip} nifgw={this.state.nifgw} nifnm={this.state.nifnm} language={language} branding={this.state.branding}/></div>
    	var cald = ''
    	var dets = ''// <div style={{color:'#e1e1e1', fontSize:24}} onClick={() => this.refs.locateModal.toggle()}>Connected to {this.state.curDet.name}</div>
    	if(this.state.srec['SRecordDate']){
    		//language = vdefByMac[this.state.curDet.mac][0]['@labels']['Language']['english'][this.state.srec['Language']]
    		sd =   	<div ><SettingsPageWSB calibState={this.state.calibState} setTheme={this.setTheme} onCal={this.calWeightSend} branding={this.state.branding} int={false} usernames={this.state.usernames} mobile={false} Id={'SD'} language={language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.sd} data={this.state.data} 
      		onHandleClick={this.settingClick} dsp={this.state.curDet.ip} mac={this.state.curDet.mac} cob2={[this.state.cob]} cvdf={vdefByMac[this.state.curDet.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prec} sysSettings={this.state.srec} dynSettings={this.state.rec} framRec={this.state.fram} level={4} accounts={this.state.usernames} />
    		</div>
        cont = sd;
    		cald = (	<div style={{background:'#e1e1e1', padding:10}}>
      		<div style={{marginTop:5}}><ProdSettingEdit language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['CalWeight']['@translations'][this.state.language]['name']} value={this.state.srec['CalWeight']+'g'} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.state.curDet.mac][1][0]['CalWeight']} num={true}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['OverWeightLim']['@translations'][this.state.language]['name']} value={this.state.prec['OverWeightLim']+'g'} param={vdefByMac[this.state.curDet.mac][1][1]['OverWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['UnderWeightLim']['@translations'][this.state.language]['name']} value={this.state.prec['UnderWeightLim']+'g'} param={vdefByMac[this.state.curDet.mac][1][1]['UnderWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
						
					<CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.calWeightSend} lab={'Calibrate'}/>
      		</div>
      	)
    	}else{
    		dets = this.renderModal()
        cont = <div><div style={{display:'table-cell', width:330,backgroundColor:'#e1e1e1',textAlign:'center'}} >
        <div style={{textAlign:'center', fontSize:25, marginTop:5, marginBottom:5}}>Located Units</div>{dets}</div><div style={{display:'table-cell', width:840, paddingLeft:5, paddingRight:5}}>{sd}</div></div>
    	}	

    	var trendBar = [15,16.5,17.5,19,15.5,18.5]//upperbound={19} t1={15.5} t2={18.5} low={16.5} high={17.5} ]
    	var winStart = 0;
    	var winEnd = 300
    	
    	if(typeof this.state.prec['ProdName'] != 'undefined'){
    		trendBar = [this.state.prec['NominalWgt']-(2*this.state.prec['UnderWeightLim']),this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim'], this.state.prec['NominalWgt'] + this.state.prec['OverWeightLim'], this.state.prec['NominalWgt'] + (2*this.state.prec['OverWeightLim']), 165, 200]
 			winStart = this.state.prec['WindowStart'];
 			winEnd = this.state.prec['WindowEnd'];   	
    	}
    	var logklass = 'logout'
    	if(this.state.user == -1){
    		logklass = 'login'
    	}

    	var lw = 0;
    	if(typeof this.state.crec['PackWeight'] != 'undefined'){    		
    		if(this.state.crec['PackWeight']){
          lw = this.state.crec['PackWeight']
        }
      }

		return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
         <div style={{marginLeft:'auto',marginRight:'auto',maxWidth:1280, width:'100%',textAlign:'left'}}>
         <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
            <tbody>
              <tr>
                <td><img style={{height: 67,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:16}} onClick={this.imgClick}  src={img}/></td>
                <td style={{width:600}}>{raptor}</td>
                	<td style={{height:60, width:200, color:'#eee', textAlign:'right'}}><div style={{fontSize:28,paddingRight:6}}>{this.state.username}</div>
                	<FatClock timezones={this.state.timezones} timeZone={this.state.srec['Timezone']} branding={this.state.branding} dst={this.state.srec['DaylightSavings']} sendPacket={this.sendPacket} language={language} ref={this.fclck} style={{fontSize:16, color:'#e1e1e1', paddingRight:6, marginBottom:-17}}/></td>
                	<td className="logbuttCell" style={{height:60}}>
                	<div style={{paddingLeft:3, borderLeft:'2px solid #56697e', borderRight:'2px solid #56697e',height:55, marginTop:16, paddingRight:3}}>
                	<button className={logklass} style={{height:50, marginTop:-7}} onClick={this.toggleLogin} />
                	<div style={{color:'#e1e1e1', marginTop:-17, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Level '+this.state.level}</div>
                	</div></td>
		          <td className="confbuttCell" style={{paddingRight:5}}><button onClick={this.showDisplaySettings} className={config} style={{marginTop:-2, marginLeft:2,marginBottom:-10}}/>
		          <div style={{color:'#e1e1e1', marginTop:-20, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Settings'}</div>
		          </td>
              </tr>
            </tbody>
          </table>
          <table><tbody><tr style={{verticalAlign:'top'}}><td>
         	<StatSummary language={language} branding={this.state.branding} ref={this.ss}/>
          </td><td><div><SparcElem ref={this.se} branding={this.state.branding} value={lw.toFixed(1) + ' g'} name={'Gross Weight'} width={616} font={40}/></div>
          <div>
          </div><div style={{background:grbg,border:'5px solid '+grbrdcolor, borderRadius:20,overflow:'hidden'}}>
          <LineGraph connected={this.state.connected} cwShow={() => this.cwModal.current.show()} language={language} clearFaults={this.clearFaults} det={this.state.curDet} faults={this.state.faultArray} winMode={this.state.prec['WindowMode']} winMax={this.state.prec['WindowMax']} winMin={this.state.prec['WindowMin']} winStart={this.state.prec['WindowStart']} winEnd={this.state.prec['WindowEnd']} max={this.state.prec['NominalWgt']+this.state.prec['OverWeightLim']} min={this.state.prec['NominalWgt']-this.state.prec['UnderWeightLim']} branding={this.state.branding} ref={this.lg} prodName={this.state.prec['ProdName']} nominalWeight={this.state.prec['NominalWgt']}>
          <TrendBar live={this.state.live} prodSettings={this.state.prec} branding={this.state.branding} lowerbound={trendBar[0]} upperbound={trendBar[3]} t1={trendBar[4]} t2={trendBar[5]} low={trendBar[1]} high={trendBar[2]} yellow={false} ref={this.tb}/></LineGraph></div>
          </td><td>
          	<HorizontalHisto language={language} branding={this.state.branding} ref={this.hh}/>
          </td></tr></tbody></table>
          <div style={{display:'inline-block',padding:5, marginRight:10, marginLeft:10}} >{play}{stop}</div>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Batch'} onClick={this.openBatch}/>
          <CircularButton override={true} ref={this.tBut} branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Tare'} onClick={this.tareWeight}/>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Product'} onClick={this.pModalToggle}/>
          <CircularButton override={true} ref={this.chBut} branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Check Weight'} onClick={this.checkweight}/>
      	<Modal ref={this.pmodal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPmdClose}>
      		<ProductSettings  editProd={this.state.srec['EditProdNo']} needSave={this.state.rec['EditProdNeedToSave']} language={language} ip={this.state.curDet.ip} mac={this.state.curDet.mac} curProd={this.state.prec} runningProd={this.state.srec['ProdNo']} srec={this.state.srec} drec={this.state.rec} fram={this.state.fram} sendPacket={this.sendPacket} branding={this.state.branding} prods={this.state.prodList} pList={this.state.pList} pNames={this.state.prodNames}/>
      	</Modal>
      	 <Modal ref={this.settingModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}}>
      		{cont}
          {this.state.connectedClients}
      	</Modal>
      	<Modal ref={this.locateModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650, height:620}}>
      		{this.renderModal()}
      	</Modal> 
        <Modal ref={this.cwModal} Style={{maxWidth:800, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650, height:410}}>
         <CheckWeightControl close={this.closeCWModal} language={language} branding={this.state.branding} sendPacket={this.sendPacket} ref={this.cwc} cw={this.state.cwgt} waiting={this.state.waitCwgt}/>
        </Modal>
        <Modal ref={this.batModal} Style={{maxWidth:800, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650, height:410}}>
         <BatchControl selfProd={this.state.srec['EditProdNo']} prod={this.state.prec} startB={this.start} mac={this.state.curDet.mac} stopB={this.stop} 
                    start={this.state.start} stop={this.state.stop} language={language} branding={this.state.branding} sendPacket={this.sendPacket} ref={this.btc}/>
        </Modal>

      	<PromptModal language={language} branding={this.state.branding} ref={this.pmd} save={this.saveProductPassThrough} discard={this.passThrough}/>
		
      
      	<LogInControl2 language={language} branding={this.state.branding} ref={this.lgctl} onRequestClose={this.loginClosed} isOpen={this.state.loginOpen} 
                pass6={this.state.srec['PasswordLength']} level={this.state.level}  mac={this.state.curDet.mac} ip={this.state.curDet.ip} logout={this.logout} 
                accounts={this.state.usernames} authenticate={this.authenticate} language={'english'} login={this.login} val={this.state.userid}/>
      	</div>
      </div>) 
	}
	saveProductPassThrough(){
		if(this.state.rec['EditProdNeedToSave'] == 1){
			this.sendPacket('saveProduct', this.state.srec['EditProdNo'])	
		}
	}
	passThrough(){

	}
}
class DetItemView extends React.Component{
	constructor(props) {
		super(props)
		this.addClick = this.addClick.bind(this)
	}
	addClick () {
		// body...
		this.props.addClick(this.props.i)
	}
	render () {
		var addText = 'Add'
		if(this.props.type == 1){
			addText = 'Remove'
		}
		return (<div style={{padding:5, lineHeight:1.8, fontSize:25}}>
				<label onClick={this.addClick}>{this.props.det.name}</label>
			</div>)
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

class RotatedArea extends React.Component{
	constructor(props){
		super(props)
	}	
	render(){
		var xDomain = [15,-15]
		var yDomin = [this.props.max, 0]
		var data = [{y: 2, x: 1}, {y: 4, x: 2}, {y: 5, x: 3}, {y: 1, x: 4}, {y: 3, x: 5}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]

		return <div style={{transform:'rotate(270deg) translateX(-120px) translateY(-95px)'}}> <XYPlot style={{fill:'#818a90'}}	height={300} width= {515}>		
  
  <VerticalBarSeries data={data} />
  <XAxis orientation="bottom" tickSizeOuter={0}/>
  <YAxis orientation="right" tickSizeOuter={0}/>
		</XYPlot></div>
	}
}


class HorizontalHisto extends React.Component{
	constructor(props){
		super(props)
    this.toggle = this.toggle.bind(this);
		this.state = {batchData:[0, 0, 0, 0, 0, 0, 0, 0,0], sampleData:[0, 0, 0, 0, 0, 0, 0, 0,0],batch:true, batchStartTime:'', sampleStartTime:''}
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
		data[6] = crec['ImprobableCnt']

    data[7] = crec['CheckWeightCnt']
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    sampleData[6] = crec['SampleImprobableCnt']
    sampleData[7] = crec['SampleCheckWeightCnt']
    this.setState({batchData:data, sampleData:sampleData, batchStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' '),sampleStartTime:crec['BatchStartDate'].toISOString().slice(0,19).split('T').join(' ')})
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
     {x: selData[3], y:vMapV2['LowRejCnt']['@translations'][this.props.language]['name']}, {x:selData[4], y:vMapV2['HighCnt']['@translations'][this.props.language]['name']}, {x:selData[5], y:vMapV2['UnsettledCnt']['@translations'][this.props.language]['name']}, {x:selData[6], y:vMapV2['ImprobableCnt']['@translations'][this.props.language]['name']}
     ,{x:selData[7], y:vMapV2['CheckWeightCnt']['@translations'][this.props.language]['name']}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
		var labelData = data.map(function(d){
			var lax = 'start'
			if(d.x > (data[0].x*0.75)){
				lax = 'end'
				return {x:d.x,y:d.y,label:d.x, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
			}
			return	{x:d.x,y:d.y,label:d.x, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
		})
    var butt = <div onClick={this.toggle} style={{width:77, fontSize:18, textAlign:'center'}}>{bText}</div>
		//var hh = 
		return <div style={{position:'relative',width:380, height:515,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

			<div style={{marginBottom:30}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24,lineHeight:'24px', width:150,paddingLeft:2, fontSize:16, color:fontColor}}>Statistics</div></div>
      <div style={{position:'absolute', left:295, top:0, marginTop:-2,borderTopRightRadius:10, borderBottomLeftRadius:10, border:'5px solid rgb(129, 138, 144)'}}>{butt}</div>
      <div style={{fontSize:16, marginLeft:10, marginTop:-10, height:30}}>{bsttxt}</div>
		<XYPlot	height={430} width= {380} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal'>		
  
  <HorizontalBarSeries data={data} color={graphColor} />
  <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
  <XAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="bottom" tickSizeOuter={0}/>
  <YAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="left" tickSizeOuter={0} tickFormat={tickFormatter}/>
		</XYPlot>
		</div>
	}
}
class LineGraph extends React.Component{
	constructor(props){
		super(props)
		this.parseDataset = this.parseDataset.bind(this);
		this.clearFaults = this.clearFaults.bind(this);
		this.maskFault = this.maskFault.bind(this);
		this.statusClick = this.statusClick.bind(this);
    this.fModal = React.createRef();
    var dtst = []
    for(var i = 0; i < 300; i++){
      dtst.push(0)
    }
		this.state = {weightPassed:0,pmax:2000, pstrt:0,pend:299, pmin:0,calFactor:0.05, tareWeight:0,decisionRange:[12,18],max:20, min:0,dataSets:[dtst,dtst.slice(0), dtst.slice(0)],reject:false,over:false,under:false}
	}
	parseDataset(data, strt, stend, pmax,pmin, calFactor, tareWeight, pweight, weightPassed, pstrt, pend){
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
		this.setState({dataSets:dataSets,pmax:(pmax/calFactor)+tareWeight, pmin:(pmin/calFactor)+tareWeight, pstrt:pstrt, pend:pend, decisionRange:[strt, stend], reject:reject,max:(Math.max(...setMax) + (max*5))/6, min:Math.min(...data), over:(pweight>this.props.max), under:(pweight<this.props.min), calFactor:calFactor, tareWeight:tareWeight, weightPassed:weightPassed})
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
		var opc = [0.8,0.6,0.4,0.3,0.2,0.1]
		var dsl = this.state.dataSets.length;
		var max = 0;
		var min = 0;

		var winLength = this.props.winEnd - this.props.winStart + 1
		if(winLength == 0){
			winLength = 300
		}
		var decMax = 0;
		var decMin = 0;
		var self = this;
		if(dsl != 0){
			var decSet =  this.state.dataSets[dsl-1].slice(this.state.pstrt, this.state.pend)
			decMin = Math.min(...decSet);
			decMax = Math.max(...decSet)
		  max = decMax  + (decMax - decMin)*0.2//Math.max(...decSet);
      min = decMin - (decMax - decMin)*0.2//Math.min(...decSet)
    	
			//console.log('min, max',decMin,decMax)
		}

		var graphs = this.state.dataSets.map(function(set,i){
			var st = set.slice(self.props.winStart,300)
			
			var data = st.map(function(d,j){
				return {y:d, x:j}
			})
			if(i+1 == dsl){
				
				return <AreaSeries curve='curveBasis' opacity={opc[dsl-1-i]} color={graphColor} data={data}/>
			}else{
				
				return <AreaSeries curve='curveBasis' opacity={opc[dsl-1-i]} color="#818a90" data={data}/>
			}
		})
	var bg = 'transparent';
	var str = 'Good Weight'
	var fault = false
	if(this.state.reject){
		bg = 'rgba(255,255,0,0.2)'
		bg2 = 'rgba(255,255,0,0.3)'
	}


	//if(this.)
	if(vdefByMac[this.props.det.mac]){
		str = vdefByMac[this.props.det.mac][0]['@labels']['WeightPassed']['english'][this.state.weightPassed]
	}
	if(this.props.faults.length != 0){
		bg = 'rgba(255,0,0,0.2)'
		bg2 = 'rgba(255,0,0,0.3)'
		if(this.props.faults.length == 1){
			if(typeof vMapV2[this.props.faults[0]+'Mask'] != 'undefined'){
        str = vMapV2[this.props.faults[0]+'Mask']['@translations']['english']['name'] + ' active'
      }else{
        str = this.props.faults[0] + ' active'  
      }
      
		}else{
			str = this.props.faults.length + ' faults active'
		}
		fault == true
	}

	//str = vdefByMac[]

	var nominalLine = <LineSeries color="red" strokeStyle='dashed' data={[{y:this.props.nominalWeight/this.state.calFactor + this.state.tareWeight,x:0},{y:this.props.nominalWeight/this.state.calFactor + this.state.tareWeight,x:winLength}]}/>

	var ydm = [min, max]
	if(((this.props.winMax - this.props.winMin) > 0) && (this.props.winMode == 1)){
			ydm = [this.state.tareWeight + (this.props.winMin)/this.state.calFactor, this.props.winMax/this.state.calFactor + this.state.tareWeight]

	}
  var grng = ydm.map(function (y) {
    return (y - self.state.tareWeight)*self.state.calFactor;
    // body...
  })
  var range = grng[1] - grng[0]
  var divs = 0.1
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
    // body...
    return {x:0, y:t/self.state.calFactor + self.state.tareWeight, label:t.toFixed(1) + 'g', xOffset:10}
  })
	//var ydm = [(Math.max(this.props.min - 3*(this.props.nominalWeight - this.props.min),0)/this.state.calFactor) + this.state.tareWeight, 
		//		((4*this.props.max - 3*this.props.nominalWeight)/this.state.calFactor) - this.state.tareWeight]
		//		<YAxis tickFormat={v => (v-this.state.tareWeight)*this.state.calFactor} tickValues={[min, max]}/>
		/*data.map(function(d){   
			var lax = 'start'
			if(d.x > (data[0].x*0.75)){
				lax = 'end'
				return {x:d.x,y:d.y,label:d.x, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
			}
			return	{x:d.x,y:d.y,label:d.x, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
				<LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
	
		}*/
  if(this.props.connected == false){
    str = 'Not Connected'
  }
	return	<div style={{background:bg, textAlign:'center'}}>
		<div style={{width:580,marginLeft:'auto',marginRight:'auto'}}>{this.props.children}</div>
		<div style={{background:'black',width:580,marginLeft:'auto',marginRight:'auto'}}><div style={{background:bg2,color:'#e1e1e1',marginBottom:-47,marginLeft:'auto',marginRight:'auto',padding:4,width:572, height:75,lineHeight:'35px'}}><div style={{display:'inline-block', width:280}}><div style={{fontSize:16}}>Running Product</div><div style={{fontSize:24}}>{this.props.prodName}</div></div>
		<div style={{display:'inline-block', width:280}} onClick={this.statusClick} ><div style={{fontSize:16}}>Status</div><div style={{fontSize:20}}>{str}</div></div></div>
		</div>
		<div style={{overflow:'hidden', marginTop:48}}>
		<div style={{marginTop:-48}}>
	<XYPlot height={358} width={610} yDomain={ydm} stackBy='y' margin={{left:0,right:0,bottom:0,top:50}}>
		<YAxis/>
		<XAxis hideTicks />
		{graphs}
		{/*nominalLine*/}
		<VerticalRectSeries curve='curveMonotoneX' stack={true} opacity={0.8} stroke="#ff0000" fill='transparent' strokeWidth={3} data={[{y0:this.state.pmin,y:this.state.pmax,x0:this.state.decisionRange[0] - this.props.winStart,x:this.state.decisionRange[1] - this.props.winStart}]}/>
		<VerticalRectSeries curve='curveMonotoneX' strokeStyle='dashed' stack={true} opacity={0.8} stroke="#ffa500" fill='transparent' strokeWidth={3} data={[{y0:decMin,y:decMax,x0:this.state.pstrt - this.props.winStart,x:this.state.pend - this.props.winStart}]}/>
		<LabelSeries data={tickData} labelAnchorY='middle' labelAnchorX='start'/>
  

		</XYPlot>
		</div>
		</div>
			<Modal ref={this.fModal} innerStyle={{background:modBg}}>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.props.faults}/>
				</Modal>
		</div>
	}
}
class StatSummary extends React.Component{
	constructor(props){
		super(props)
		this.parsePack = this.parsePack.bind(this);
		this.state = {count:0, grossWeight:0,currentWeight:0, rec:{},crec:{},lw:'0.0g'}
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
		
		if(this.props.branding == 'SPARC'){ innerbg = SPARCBLUE2
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
		if(!isNaN(this.state.crec['PackWeight'])){
			grswt = this.state.crec['PackWeight'].toFixed(1) + 'g'
			avg = this.state.crec['AvgWeight'].toFixed(1) +'g'
      savg = this.state.crec['SampleAvgWeight'].toFixed(1) + 'g'
			stdev = this.state.crec['StdDev'].toFixed(2)+'g'
      sstdev = this.state.crec['SampleStdDev'].toFixed(2)+'g'
			tot = this.state.crec['TotalWeight'].toFixed(1)+'g'
      stot = this.state.crec['SampleTotalWeight'].toFixed(1)+'g'
			gvb = this.state.crec['GiveawayBatch'].toFixed(1)+'g'
			gvs = this.state.crec['SampleGiveawayBatch'].toFixed(1)+'g'
      ppm = this.state.crec['Batch_PPM'].toFixed(0) + 'ppm'
      sppm = this.state.crec['Sample_PPM'].toFixed(0) + 'ppm'
		}
	return	<div style={{width:240,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0, height:515}}>

			<div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:140,paddingLeft:2, fontSize:16,lineHeight:'24px', color:fontColor}}>Summary</div></div>
			<StatControl name={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={this.state.lw}/>
			<StatControl name={vMapV2['TotalWeight']['@translations'][this.props.language]['name']} value={tot}/>
			<StatControl name={vMapV2['SampleTotalWeight']['@translations'][this.props.language]['name']} value={stot}/>
      <StatControl name='Net Weight' value='0g'/>
			<BatchStatControl name='Average Weight' batch={avg} sample={savg}/>
			<BatchStatControl name='Standard Deviation' batch={stdev} sample={sstdev}/>
			<BatchStatControl name='Giveaway' batch={gvb} sample={gvs}/>
			
			<BatchStatControl name='Production Rate' batch={ppm} sample={sppm}/>

		</div>
	}
}
class StatControl extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		return <div style={{height:61}}>
		<div style={{textAlign:'left', paddingLeft:2, fontSize:16}}>{this.props.name}</div>
		<div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:25}}>{this.props.value}</div></div>
	}
}
class BatchStatControl extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return <div style={{height:61}}>
    <div style={{textAlign:'left', paddingLeft:2, fontSize:16}}>{this.props.name}</div>
    <div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:25}}><div style={{display:'inline-block', width:'50%'}}>{this.props.batch}</div><div style={{display:'inline-block', width:'50%'}}>{this.props.sample}</div></div></div>
  }
}
class ProductSettings extends React.Component{
	constructor(props){
		super(props)
		this.updateFilterString = this.updateFilterString.bind(this);
		this.toggleSearch = this.toggleSearch.bind(this);
		this.selectProd = this.selectProd.bind(this);
		this.copyCurrentProd = this.copyCurrentProd.bind(this);
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
		var prodList = [];
		var prodNames = this.props.pNames
		this.props.pList.forEach(function (pn,i) {
			prodList.push({name:prodNames[i], no:pn})
		})

		this.state ={data:[],showAdvanceSettings:false,searchMode:false, filterString:'', filterList:[],selProd:this.props.editProd,prodList:prodList, showAllProd:false,
		cob2:this.getPCob(this.props.srec, this.props.curProd, this.props.drec, this.props.fram)}
    this.pmd = React.createRef();
    this.cfTo = React.createRef();
    this.cfModal = React.createRef();
    this.dltModal = React.createRef();
    this.arrowBot = React.createRef();
    this.arrowTop = React.createRef();
    this.sd = React.createRef();
	}
	sendPacket(n,v){
		var self = this;
    console.log(n,v)
		this.props.sendPacket(n,v)
	
	}
	onAdvanced(){
		this.setState({showAdvanceSettings:!this.state.showAdvanceSettings})
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
	}
	getPCob (sys,prod,dyn, fram) {
  
		var vdef = vdefByMac[this.props.mac]
		var _cvdf = JSON.parse(JSON.stringify(vdef[6]['CWProd']))
		var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
		vdef = null;
		_cvdf = null;
		return cob
	}
  getBatch(sys,prod,dyn,batch,fram){
    var vdef = vdefByMac[this.props.mac]
    var _cvdf = JSON.parse(JSON.stringify(vdef[6]['Batch']))
    var cob = iterateCats3(_cvdf, vdef[1], sys, prod, vdef[5], dyn, fram, batch)
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
		//console.log(curProd)
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
	selectProd(p){
		var self = this;
		//this.saveProduct();
		if(this.props.needSave == 1){
			this.pmd.current.show(
		function () {
			self.props.sendPacket('getProdSettings',p)
			self.setState({selProd:p, searchMode:false, filterString:''})
		});
		}else{
			self.props.sendPacket('getProdSettings',p)
			self.setState({selProd:p, searchMode:false, filterString:''})
	
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
	onValChange(p,v){
		//var curProd =Object.assign({},this.props.prods[this.state.selProd]) //this.props.prods[this.state.selProd];
		//curProd[p] = v

	}
	selectRunningProd(){
		this.props.sendPacket('switchProd',this.state.selProd)
	}
	saveProduct(){
		console.log('saving ', this.state.selProd)
		this.props.sendPacket('saveProduct',this.state.selProd)
	}
	saveProductPassThrough(f){
		var self = this;
		this.saveProduct();
		setTimeout(function (argument) {
			// body...
			console.log(f)
			f();
		},100);
	}
	passThrough(f){
		f();
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
					var f =	pram["@type"]
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
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(dp){
							var d = dp;
							if(dp.indexOf('[0]') != -1){
								if(pram['@name'].slice(-2) == '_A'){
									d = dp.replace('[0]','[1]')
								}
							}
							if(pVdef[6][d]["@rec"] == 0){
								return self.props.srec[d];
							}else{
								return curProd[d];
							}
						});
						if(pram['@name'] == 'BeltSpeed'){
							deps.push(self.props.drec['EncFreq'])
							//deps.push(1000)
							console.log(3243,deps)
						}else if(pram['@type'] == 'rej_del'){
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
						val = 	uintToInt(val,16)//?? phase is coming in with different format for dyn data
					}
					
				}else if(pram["@name"].indexOf('DetThresh') != -1){
					var dependancies = ['DetMode','PhaseMode','ThresR','ThresX']
					var deps = dependancies.map(function(d) {
						// body...
						if(pram['@name'] == 'DetThresh_A'){
							return curProd[d+'_A']
						}else if(pram['@name'] == 'DetThresh_B'){
							return curProd[d+'_B']
						}
					})
					val = eval(funcJSON['@func']['det_thresh']).apply(this, [].concat.apply([],[val,deps]));
					
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
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
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
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
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
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[6][d]["@rec"] == 0){
								return self.props.srec[d];
							}else if(pVdef[6][d]["@rec"] == 1){
								return curProd[d];
							}else if(pVdef[6][d]["@rec"] == 2){
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
								return self.props.drec[d];
							}else if(pVdef[6][d]["@rec"] == 3){
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
								return self.props.fram[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
					//	////////console.log(f)
						
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
	showAllProd(){
		this.setState({showAllProd:!this.state.showAllProd})
	}
	copyTo(){
		this.cfTo.current.toggle();
	}
	copyConfirm(target){
		var prodNos = this.props.pList.slice(0)
		
		console.log(2322, prodNos, prodNos.indexOf(target), target)

		if(prodNos.indexOf(target) != -1){
			this.copyAlert(target)
		}else{
			this.copyCurrentProd(target)
		}
	}
	copyAlert(target){
		var alertMessage = 'Product '+ target+' will be overwritten. Continue?'

		this.cfModal.current.show(this.copyConfirm, target, alertMessage)
	}
  deleteProd(p){
    this.dltModal.current.show(p)
  }
  deleteProdConfirm(p){
    var self = this;
    this.sendPacket('deleteProd',p)
    setTimeout(function(argument) {
      // body...
      self.sendPacket('getProdList')
    },300)
  }
	render(){
		var self = this;
		var list = [];
		var sp = null;
		var content = ''
			var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}

    var searchColor = SPARCBLUE1;
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
			<EmbeddedKeyboard label={'Search Products'} liveUpdate={this.updateFilterString} language={this.props.language}/></div>
		}else{
			var curProd = {}
			if(this.props.prods[this.state.selProd]){
				curProd = this.props.prods[this.state.selProd]
			}
			var pList = [];
			for(var i=1;i<101;i++){
				pList.push({name:'NULL PROD',no:i, null:true})
			}
			this.state.prodList.forEach(function (p) {
				pList[p.no - 1] = p;
				// body...
			})
			var showText = 'Show All Products'
			if(this.state.showAllProd){
				list = pList.slice(0)
				showText = 'Hide Inactive Products'
			}else{
				list = this.state.prodList.slice(0)
			}
			//this.state.prodList.slice(0);
			
			list.forEach(function (pr) {
				// body...
				if(self.state.selProd == pr.no){
					sp = pr 
				}
			})
			if(sp == null){
				sp = {name:'NULL PROD', no:1, null:true}
			}
			content =( 
			<div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6,height:480}}>
				<div>
				<div style={{display:'inline-block', verticalAlign:'top'}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={60} w2={400} label={'Product Name'} value={curProd['ProdName']} param={vdefByMac[this.props.mac][1][1]['ProdName']}  onEdit={this.sendPacket} editable={true} num={false}/></div>
				<div style={{display:'inline-block', marginLeft:87, marginBottom:-10}}>
					<div style={{position:'relative', verticalAlign:'top'}} onClick={this.toggleSearch}>
						<div style={{height:35, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
						<div style={{height:35, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
						<div style={{position:'absolute',float:'right', marginTop:-70, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:50}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>Search</div></div>
					</div>
				</div>
				</div>
				<div>
					<div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Nominal Weight'} value={curProd['NominalWgt']+'g'} param={vdefByMac[this.props.mac][1][1]['NominalWgt']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Target Weight'} value={'0g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Package Weight'} value={curProd['PkgWeight']+'g'} param={vdefByMac[this.props.mac][1][1]['PkgWeight']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Product Length'} value={this.getValue(curProd['EyePkgLength'], 'EyePkgLength')} param={vdefByMac[this.props.mac][1][1]['EyePkgLength']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={'Belt Speed'} value={this.getValue(curProd['BeltSpeed'],'BeltSpeed')} param={vdefByMac[this.props.mac][1][1]['BeltSpeed']} onEdit={this.sendPacket} editable={true} num={true}/></div>
					</div>

					<div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
						<div style={{width:'90%',padding:'2.5%',margin:'2.5%',background:'linear-gradient(90deg,#919aa0, #e1e1e1)'}}>
							<div><div style={{width:'60%',display:'inline-block'}}>Overweight Accept</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>{curProd['OverWeightAllowed']}</div></div>
							<div style={{display:'none'}}><div style={{width:'60%',display:'inline-block'}}>Product Speed</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>{this.getValue(curProd['BeltSpeed'],'BeltSpeed')}</div></div>
							<div><div style={{width:'60%',display:'inline-block'}}>Feedback Control</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>Pulse</div></div>
							<div><div style={{width:'50%',display:'inline-block', fontSize:15, verticalAlign:'top'}}>
								
								<div style={{width:'70%',display:'inline-block'}}>Correction Rate</div><div style={{width:'25%',display:'inline-block', textAlign:'right', marginRight:'5%'}}>5 g/s</div>
								<div style={{width:'70%',display:'inline-block'}}>Dead Zone</div><div style={{width:'25%',display:'inline-block', textAlign:'right', marginRight:'5%'}}>±10g</div>
								<div style={{width:'70%',display:'inline-block'}}>Sample Count</div><div style={{width:'25%',display:'inline-block', textAlign:'right', marginRight:'5%'}}>6pcs</div>
						
							</div>
							<div style={{width:'50%',display:'inline-block', fontSize:15, verticalAlign:'top'}}>
								
								<div style={{width:'70%',display:'inline-block', marginLeft:'5%'}}>Wait Count</div><div style={{width:'25%',display:'inline-block', textAlign:'right'}}>4pcs</div>
								<div style={{width:'70%',display:'inline-block', marginLeft:'5%'}}>Hi Limit</div><div style={{width:'25%',display:'inline-block', textAlign:'right'}}>140g</div>
								<div style={{width:'70%',display:'inline-block', marginLeft:'5%'}}>Lo Limit</div><div style={{width:'25%',display:'inline-block', textAlign:'right'}}>90g</div>
						
							</div></div>
							<div><div style={{width:'60%',display:'inline-block'}}>Measurement Standard</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>L-Qt</div></div>
							<div><div style={{width:'50%',display:'inline-block', fontSize:15, verticalAlign:'top'}}>
								
								<div style={{width:'70%',display:'inline-block'}}>Number of Packs</div><div style={{width:'25%',display:'inline-block', textAlign:'right', marginRight:'5%'}}>10</div>
							
							</div>
							<div style={{width:'50%',display:'inline-block', fontSize:15, verticalAlign:'top'}}>
								
								<div style={{width:'70%',display:'inline-block', marginLeft:'5%'}}>Hi Limit</div><div style={{width:'25%',display:'inline-block', textAlign:'right'}}>140g</div>
								<div style={{width:'70%',display:'inline-block', marginLeft:'5%'}}>Lo Limit</div><div style={{width:'25%',display:'inline-block', textAlign:'right'}}>90g</div>
						
							</div></div>
						</div>
					</div>
				</div>
				<div>
					<CircularButton onClick={this.onAdvanced} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Advanced'}/>
          			<CircularButton onClick={this.saveProduct} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Save Product'}/>
          
				</div>
				
			</div>)
			if(this.state.showAdvanceSettings){
				content = <div style={{width:813, display:'inline-block', background:'#e1e1e1', padding:5}}>
				<div style={{height:482}}>	<SettingsPage prodPage={true} getBack={this.onAdvanced} black={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={[]} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.sd} data={this.state.data} 
      		onHandleClick={this.settingClick} dsp={this.props.ip} mac={this.props.mac} cob2={[this.state.cob2]} cvdf={vdefByMac[this.props.mac][4]} sendPacket={this.sendPacket} prodSettings={curProd} sysSettings={this.props.srec} dynSettings={this.props.drec} framRec={this.props.fram} level={4}/>
    		</div>
      		<div>
				
				</div>
    		</div>
			}
		}
		
		var scrollInd = 0
		var prods = list.map(function (prd,i) {

			// body...
			if(prd.no == self.state.selProd){
				scrollInd = i;
			}
			return <div> <ProductSelectItem name={prd.name} p={prd.no} isNull={prd.null} deleteProd={self.deleteProd} selectProd={self.selectProd} selected={(self.state.selProd == prd.no)} running={(self.props.runningProd == prd.no)}/>
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
		return <div style={{width:1155}}>
			<div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>Products</div><div style={{display:'inline-block', fontSize:20,textAlign:'right',width:600}}>{'Current Product: '+spstr }</div></div>
			<table style={{borderCollapse:'collapse'}}><tbody>
				<tr>
					<td style={{verticalAlign:'top', width:830}}>{content}<div style={{width:813, padding:5, paddingTop:0, textAlign:'right'}}>			<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Select Product'} onClick={this.selectRunningProd}/>
          </div></td><td style={{verticalAlign:'top',textAlign:'center'}}>
          	<ScrollArrow ref={this.arrowTop} offset={72} width={72} marginTop={-40} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
          <div onScroll={this.onProdScroll} id='prodListScrollBox' style={{height:489, background:'#e1e1e1',overflowY:'scroll'}}>{prods}
          </div>
          <div style={{height:66,lineHeight:'66px', background:'#e1e1e1', borderTop:'1px solid #ccc'}}>
         	<div onClick={this.copyTo} style={{display:'table-cell',height:66, borderRight:'2px solid #ccc', width:150, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>+ Copy Current Product</div>
         	<div onClick={this.showAllProd} style={{display:'table-cell',height:66, borderLeft:'2px solid #ccc',width:150, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>{showText}</div>
          </div>
          <ScrollArrow ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
			
          </td>
				</tr>
			</tbody></table>
			<PromptModal branding={this.props.branding} ref={this.pmd} save={this.saveProductPassThrough} discard={this.passThrough}/>
			<CustomKeyboard branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.cfTo} onRequestClose={this.onRequestClose} onChange={this.copyConfirm} index={0} value={''} num={true} label={'Target Product'}/>

			<CopyModal ref={this.cfModal}  branding={this.props.branding}/>
      <DeleteModal ref={this.dltModal} branding={this.props.branding} deleteProd={this.deleteProdConfirm}/>
		</div>
	}
}
class LiveGraph extends React.Component{
  constructor(props){
    super(props)
    this.cv = React.createRef();
  }
  update(lw){
    this.cv.current.stream({t:Date.now(),val:lw})
  }
  render(){
    return <div>
      <CanvElem ref={this.cv} canvasId='liveGraph' h={400} w={600}/>
    </div>
  }
}

class CanvElem extends React.Component{
  constructor(props){ 
    super(props)
    this.line = new TimeSeries();
    this.smoothie = new SmoothieChart({millisPerPixel:this.props.mpp,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
      horizontalLines:[{color:'#000000',lineWidth:1,value:0}],
      labels:{fillStyle:'#808a90'}, grid:{millisPerLine:2000,fillStyle:'rgba(256,256,256,0)'}, yRangeFunction:yRangeFunc, maxDataSetLength:700, minDataSetLength:300, limitFPS:15});
    
    this.state =  ({update:true})
    this.stream = this.stream.bind(this);
    this.pauseGraph = this.pauseGraph.bind(this);
    this.restart = this.restart.bind(this);
  }
  componentWillUnmount(){
    this.smoothie.stop();
    this.smoothie = null;
    this.line = null;
  }
  shouldComponentUpdate(){
    return false;
  }
  pauseGraph(){
    this.setState({update:false})
    this.smoothie.stop()
    //this.state.smoothie.setTargetFPS(8)
  }
  restart(){
    this.setState({update:true})
    this.smoothie.start()
    //this.state.smoothie.setTargetFPS(15)
  }
  componentDidMount(){
    //comebackhere
    this.smoothie.streamTo(document.getElementById(this.props.canvasId));
      this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'#darkturquoise', fillStyle:'darkturquoise'});
  
  }
  stream(dat) {
    if(this.state.update){
      this.line.append(dat.t, dat.val);
    }

  }

    render(){
      console.log('rendering canvas')
    return(
      <div className="canvElem">
        <canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
      </div>
    );
  }
}
class BatchControl extends React.Component{
  constructor(props){
    super(props)
    this.state = {start:this.props.start,stop:this.props.stop,batchData:[0, 0, 0, 0, 0, 0, 0, 0,0], sampleData:[0, 0, 0, 0, 0, 0, 0, 0,0],batch:true, batchStartTime:'', sampleStartTime:'',batchMin:0,sampleMin:0}
    this.sendPacket = this.sendPacket.bind(this);
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
    data[6] = crec['ImprobableCnt']

    data[7] = crec['CheckWeightCnt']
    sampleData[0] = crec['SampleTotalCnt']
    sampleData[1] = crec['SamplePassWeightCnt']
    sampleData[2] = crec['SampleLowPassCnt']
    sampleData[3] = crec['SampleLowRejCnt']
    sampleData[4] = crec['SampleHighCnt']
    sampleData[5] = crec['SampleUnsettledCnt']
    sampleData[6] = crec['SampleImprobableCnt']
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
  render(){
    // <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalWeight']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalWeight']+'g'} editable={true} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][1][0]['CalWeight']} num={true}/></div>
          
    var pl = 'assets/play-arrow-fti.svg'
      var stp = 'assets/stop-fti.svg'
      var batchInfo = <div style={{height:315}}>
      <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Batch'}</div></h2></span>
      <div style={{padding:5}}>Batch stopped</div></div>
      var play, stop;
      if(this.props.start){
        play = <div onClick={this.props.startB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
        stop = <div onClick={this.props.stopB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#FA2222', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className='circularButton_sp'> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

      }else{
        play = <div onClick={this.props.startB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#00FF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className='circularButton_sp'> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
      stop = <div onClick={this.props.stopB} style={{width:120, lineHeight:'53px',color:'black',font:30, background:'#F04040', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className='circularButton_sp'> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 
      batchInfo =  <div style={{height:315}}>
         <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Batch'}</div></h2></span>
   
      <div style={{padding:5}}>
      <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={250} h2={51} w2={400} label={vMapV2['BatchNumber']['@translations'][this.props.language]['name']} value={this.props.prod['BatchNumber']} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.props.mac][1][1]['BatchNumber']} num={true}/></div>
       <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={250} h2={51} w2={400} label={vMapV2['BatchRef']['@translations'][this.props.language]['name']} value={this.props.prod['BatchRef']} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.props.mac][1][1]['BatchRef']} num={true}/></div>
       
       <div>{'Batch running for '+ this.state.batchMin.toFixed(1) + ' minutes'}</div>
       <div>{'Sample running for '+ this.state.sampleMin.toFixed(1) + ' minutes'}</div>
       <div></div>
       </div>
    </div>
      }   

    return <div style={{background:'#e1e1e1', height:400, padding:5}}>
          {batchInfo}
         <div>{play}{stop}</div>
      
    </div>
  }
}
class ProdSettingEdit extends React.Component{
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
		this.onInput = this.onInput.bind(this);
    this.ed = React.createRef();
	}
	onClick(){
		if(this.props.editable){
			this.ed.current.toggle()
		}
	}
	onInput(v){
		var val = v;
		/*if(this.props.param['@type'] == 'int32'){
			var buf = Buffer.alloc(4)
			buf.writeUInt32LE(parseInt(v),0)
			val = buf;
		}*/
    if(typeof this.props.param['@decimal'] != 'undefined'){
      if(this.props.param['@decimal'] > 0){
          val = val * Math.pow(10,this.props.param['@decimal'])
        
      }
    }
    console.log(val,v)
		this.props.onEdit(this.props.param,val);
	}
	onRequestClose(){

	}
	onFocus(){

	}

	render(){
		var self = this;
		var ckb;
		if(this.props.editable){
			if(this.props.param['@labels']){
				var list = _pVdef[7][this.props.param["@labels"]]['english'].slice(0);

				var lists = [list]

				ckb = <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} mobile={this.props.mobile} params={[this.props.param]} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={this.props.label} ref={this.ed} val={[this.state.value]} options={lists} onChange={this.selectChanged}/>

			}else{
				ckb = <CustomKeyboard preload={this.props.param['@name'] == 'ProdName'} branding={this.props.branding} ref={this.ed} language={this.props.language} tooltip={this.props.tooltip} onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label+': ' + this.props.value}/>

			}
		
		}
    var bgClr = SPARCBLUE2
    var txtClr = '#000'
    if(this.props.branding == 'FORTRESS'){
      bgClr = FORTRESSPURPLE2
      txtClr = '#e1e1e1'
    }
		return <div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative',color:txtClr, fontSize:20,zIndex:1, lineHeight:this.props.h1+'px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:this.props.w1,textAlign:'center'}}>
				{this.props.label}
			</div>
			<div onClick={this.onClick} style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:this.props.h2+'px', borderRadius:15,height:this.props.h2, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:this.props.w2}}>
				{this.props.value}
			</div>
			{ckb}
		</div>
	}
}
class CheckWeightControl extends React.Component{
  constructor(props){
    super(props)
    this.state = {cw:0,cwset:0, waiting:false}
    this.setCW = this.setCW.bind(this);
    this.sendPacket = this.sendPacket.bind(this);
    this.sendCW = this.sendCW.bind(this);
  }
  setCW(n,v){
    var self = this;
    if(typeof v != 'undefined'){


      if(v != null){
        console.log(v)
        this.setState({cwset:parseFloat(v)})
        setTimeout(function (argument) {
          // body...
          self.props.close()
        },150)
      }
    }
  }
  sendCW(){
    this.props.close();
  }
  sendPacket(n,v){
    this.props.sendPacket(n,v)
  }
  render(){
    var cw = this.props.cw.toFixed(1)+'g'
    if(this.props.waiting){
      cw = 'Waiting for Weight'
    }
    return <div>
        <div style={{background:'#e1e1e1', padding:5, height:400}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Check Weight'}</div></h2></span>
       <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={240} h2={51} w2={500} label={'Check Weight'} value={cw} editable={false} onEdit={this.sendPacket} num={true}/></div>
         <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={240} h2={51} w2={500} label={'Measured Value'} value={this.state.cwset.toFixed(1)+'g'} editable={true} onEdit={this.setCW} param={'checkweightmeasure'} num={true}/></div>
        <div style={{marginTop:140,marginLeft:340}}><CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.sendCW} lab={'Confirm'}/>
        </div>
        </div>
    </div>
  }
}
class ProductSelectItem extends React.Component{
	constructor(props){
		super(props)
		this.switchProd = this.switchProd.bind(this);
	  this.deleteProd = this.deleteProd.bind(this); 
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
	render () {
		// body..
		
		var check= ""
     var  del = <img onClick={this.deleteProd} src="assets/trash.svg"/>
	var dsW = 300;
		var stW = 227;
		var ds = {paddingLeft:7, display:'inline-block', width:dsW, background:"transparent"}
		var st = {padding:7,display:'inline-block', width:stW, height:50, lineHeight:'50px',fontSize:22,borderBottom:'2px solid #bbbbbbaa'}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
		//	check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,display:'inline-block', width:dsW,	 background:"#7ccc7c"}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
      del = ""
		}
		if(this.props.running){
			check =  <img src="assets/Check_mark.svg"/>
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
		return (<div style={{background:"transparent", color:color, position:'relative', textAlign:'left'}}><div style={ds} ><div style={{display:'inline-block', width:22}}>{check}</div><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label> <div style={{display:'inline-block', width:22}}>{del}</div></div>
			</div>)
	}
}
class ProdCopy extends React.Component{
	constructor(props){
		super(props);
		this.prodCopy = this.prodCopy.bind(this);
	}
	prodCopy(target){
		this.props.sendPacket('copyCurrentProd',target)
	}
	render(){
		return <div></div>
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
class CatButton extends React.Component{
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick(){
		this.props.onClick(this.props.data, this.props.ind)
	}
	render(){
			var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

		return <CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:300, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.onClick} lab={this.props.data.val.cat}/>
	}
}
class CatSelectItem extends React.Component{
	constructor(props){
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick(){
		this.props.onClick(this.props.data, this.props.ind)
	}
	render () {
		// body..
		
		var check= ""
		var dsW = 300;
		var stW = 227;
		var ds = {paddingLeft:7,paddingRight:7, display:'inline-block', width:dsW, background:"transparent"}
		var st = {padding:7,display:'inline-block', width:stW, height:50, lineHeight:'50px',fontSize:22,borderBottom:'2px solid #bbbbbbaa'}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
    var selBG = SPARCBLUE2

    if(this.props.branding == 'FORTRESS'){
      selBG = FORTRESSPURPLE2
      //st.color = '#e1e1e1'
    }
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,paddingRight:7,display:'inline-block', width:dsW,	 background:selBG}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
      if(this.props.branding == 'FORTRESS'){
     // selBG = FORTRESSPURPLE2
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
class SettingsPageWSB extends React.Component{
	constructor(props){
		super(props);
		this.state = {sel:-1, data:[], path:[],showAccounts:false, cal:false, liveWeight:0, update:true,calib:0,mot:false}
		this.setPath = this.setPath.bind(this);
		this.onHandleClick = this.onHandleClick.bind(this);
		this.backAccount = this.backAccount.bind(this);
    this.onCal = this.onCal.bind(this);
    this.backCal = this.backCal.bind(this);
    this.onMot = this.onMot.bind(this);
    this.updateLiveWeight = this.updateLiveWeight.bind(this);
    this.sd = React.createRef();
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
		}else{
			this.props.onHandleClick(dat,n)
		}
	}
  onCal(){
    this.setState({mot:false,cal:true,sel:-2, showAccounts:false, update:true})
  }  
  onMot(){
    this.setState({cal:false,mot:true,sel:-3, showAccounts:false, update:true})
  }
  backCal(){
    this.setState({cal:false, update:true})
  }
	render(){
		var self = this;
		var calStr = 'Press calibrate to start calibration. Ensure no load is on the loadcell before starting.';
    if(this.props.calibState == 1){
      calStr = 'Taring..'
    }else if(this.props.calibState == 2){
      calStr = 'Place calibration weight on loadcell and press Calibrate'
    }else if(this.props.calibState == 3){
      calStr = 'Calibrating..'
    }else if(this.props.calibState == 4){
      calStr = 'Remove weight and hit Calibrate to tare'
    }else if(this.props.calibState == 5){
      calStr = 'Taring..'
    }else if(this.props.calibState == 6){
      calStr = 'Calibration Successful'
    }else if(this.props.calibState == 7){
      calStr = 'Calibration Failed'
    }

		var cats = [<div><CatSelectItem language={this.props.language} branding={self.props.branding} data={{val:{cat:'Home'}}} selected={this.state.sel == -1} ind={-1} onClick={self.setPath}/></div>]
		this.props.cvdf[0].params.forEach(function (c,i) {
			// body...
			//console.log(c)
			if(c.type == 1){
				cats.push(<div><CatSelectItem language={self.props.language} branding={self.props.branding} data={c} selected={self.state.sel == i} ind={i} onClick={self.setPath}/></div>)
			}
		})
		cats.push(<div><CatSelectItem language={self.props.language} branding={self.props.branding} data={{val:{cat:'Calibrate'}}} selected={this.state.cal} ind={-2} onClick={this.onCal} /></div>)
    cats.push(<div><CatSelectItem language={self.props.language} branding={self.props.branding} data={{val:{cat:'Motor Control'}}} selected={this.state.mot} ind={-3} onClick={this.onMot} /></div>)

		// bkmkthis
		var cob;
		if(this.state.sel == -1){
			cob = this.props.cob2
		}
		var sd =<React.Fragment><div > <SettingsPage setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = {this.sd} data={this.state.data} 
      		onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
			</div>
			<div style={{display:'none'}}> <AccountControl goBack={this.backAccount} mobile={false} level={this.props.level} accounts={this.props.accounts} ip={this.props.dsp} language={this.props.language} branding={this.props.branding} val={this.props.level}/>
</div></React.Fragment>
		if(this.state.showAccounts){
			sd = <React.Fragment><div style={{display:'none'}}> <SettingsPage setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = {this.sd} data={this.state.data} 
      		onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
			</div>
			<div> <AccountControl goBack={this.backAccount} mobile={false} level={this.props.level} accounts={this.props.accounts} ip={this.props.dsp} language={this.props.language} branding={this.props.branding} val={this.props.level}/>
</div></React.Fragment>
		}else if(this.state.cal){
     sd = <React.Fragment><div style={{display:'none'}}> <SettingsPage setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref={this.sd} data={this.state.data} 
          onHandleClick={this.onHandleClick} dsp={this.props.dsp} mac={this.props.mac} cob2={this.props.cob2} cvdf={this.props.cvdf} sendPacket={this.props.sendPacket} prodSettings={this.props.prodSettings} sysSettings={this.props.sysSettings} dynSettings={this.props.dynSettings} framRec={this.props.framRec} level={4}/>
      </div>
      <div>
        <div style={{background:'#e1e1e1', padding:10}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{'Calibrate'}</div></h2></span>
          
         
          <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={this.state.liveWeight.toFixed(1)+'g'} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LiveWeight']} num={true}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalWeight']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalWeight']+'g'} editable={true} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][1][0]['CalWeight']} num={true}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalDur']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalDur']+'ms'} param={vdefByMac[this.props.mac][1][0]['CalDur']} editable={true} onEdit={this.props.sendPacket} num={true}/></div>
          <div style={{marginTop:100, fontSize:20, textAlign:'center'}}>{calStr}</div>
          <div style={{textAlign:'center'}}><CircularButton branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.props.onCal} lab={'Calibrate'}/>
          </div>
          </div>
      </div></React.Fragment>
    }else if(this.state.mot){
      sd = <React.Fragment>
        <div style={{display:'none'}}> <SettingsPage setTheme={this.props.setTheme} black={true} wsb={true} branding={this.props.branding} int={false} usernames={[]} mobile={false} Id={'SD'} language={this.props.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.props.ioBits} goBack={this.props.goBack} accLevel={this.props.accLevel} ws={this.props.ws} ref = 'sd' data={this.state.data} 
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
			<table style={{borderCollapse:'collapse', verticalAlign:'top'}}><tbody><tr style={{verticalAlign:'top'}}><td style={{paddingBottom:0,paddingRight:8}}> <div style={{marginTop:54, height:480, background:'#e1e1e1'}}>{cats}</div></td><td style={{width:813, height:525,padding:5, background:'#e1e1e1'}}>{sd}</td></tr></tbody></table>
		</div>
	}
}
class SettingsPage extends React.Component{
	constructor(props) {
		super(props)

		this.state = ({
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, dynRec:this.props.dynSettings,font:2, data:this.props.data, cob2:this.props.cob2, framRec:this.props.framRec,path:[]
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
	}
	componentWillUnmount(){

	}
	componentWillReceiveProps(newProps){
		this.setState({data:newProps.data, cob2:newProps.cob2, sysRec:newProps.sysSettings, prodRec:newProps.prodSettings, dynRec:newProps.dynSettings, framRec:newProps.framRec})
	}
	handleItemclick(dat, n){		
		//console.log(dat,n,1763)
    if(dat[0] == 'get_accounts'){
      this.props.onHandleClick(dat,n)
    }else{
    var self = this;
    var path = this.state.path;
    path.push(dat[1])
    setTimeout(function(){
      document.getElementById(self.props.Id).scrollTop = 0;
      self.setState({path:path})
   
      self.props.onHandleClick(dat, n);

    },250)
  }

	}
	  setPath(path){
  	document.getElementById(this.props.Id).scrollTop = 0;
  	this.setState({path:path})
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
	
	handleScroll(ev) {
		// body...
		//////////console.log(ev.srcElement.body)
		var lvl = this.props.data.length
		var len = 0;
		if(lvl > 0){
			len = this.props.data[lvl - 1 ][0].params.length
		}
		//	////////console.log(document.getElementById(this.props.Id).scrollTop)
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
		////console.log([n,v])

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
			
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
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
			}
				console.log(strArg, n, 2154)
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
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
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				console.log(strArg, packet, n, 2154)
		
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['clear']){
			var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['theme']){
      this.props.setTheme(v)
    }
	}
	onFocus() {
			this.props.setOverride(true)
	}
	onRequestClose() {
		// body...
		var self = this;
			setTimeout(function () {
				// body...
				self.props.setOverride(false)
			},100)
			
	}
 	goBack(){
   	 var path = this.state.path.slice(0);
    	if(path.length > 0){
    	  	path.pop();
      		this.setState({path:path})
      		this.props.goBack();
    	}
	    ////console.log(this.props.data)
	}
	getBack(){
		this.props.getBack();
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

		var catList = [	]

		var accLevel = 0;
		var len = 0;
		var SA = false;
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem3 branding={this.props.branding} ioBits={this.props.ioBits} int={isInt} mobile={this.props.mobile} mac={this.props.mac} 
          language={self.props.language}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} 
          font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} 
          sysSettings={this.state.sysRec} prodSettings={this.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
				
			}
			len = catList.length;
			nav = nodes;
		}else{

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
		    	if(this.props.prodPage == true){
		    		backBut = (<div className='bbut' onClick={this.getBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
						<label style={{color:titleColor, fontSize:ft}}>{backText}</label></div>)
	
		    	}
		    	//catMap[data[0]]['@translations']['english']
		    }else if(lvl == 2){
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		console.log(pathString)
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
         			var	acc = false;
					if((self.props.level > 3) || (p.acc <= self.props.level)){
						acc = true;
					}
          //console.log(2158, isInt)
					nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
						ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
							children={[vdefByMac[self.props.mac][5][pname].children,ch]} hasChild={false} data={d} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
					
				}else if(par.type == 1){
					var sc = par['@data']
					////console.log('check this too',sc)
          
          			var	acc = false;
					if((self.props.level > 3) || (par.acc <= self.props.level)){
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
							nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
								data={[sc,i]} children={[vdefByMac[self.props.mac][5][spname].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			
					}else{
		      			if(self.props.wsb && lvl == 1){

		      			}else{
		      				nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
							data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
						
		      			}
					}
				}else if(par.type == 2){
					var sc = par['@data']
					var	acc = false;
					
					if((self.props.level > 3)){
						acc = true;
					}
					if(typeof sc['child'] != 'undefined'){
						var spar = sc.params[sc.child]
						var ch = spar['@children'].slice(0)
          				if(spar['@interceptor'] || spar['@test'] || spar['@halo'] || spar['@input']||  spar['@combo']){
            				ch.unshift(spar['@data'])
          				}
          				
          				nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp}
                    font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
							     data={[sc,i]} backdoor={true} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
				
					}else{
			 			nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
              font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
							data={[sc,i]} backdoor={true} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
					}
				}else if(par.type == 3){
					var	acc = false;
					if((self.props.level > 3)){
						acc = true;
					}
					var sc = par['@data']
						
					nodes.push(<SettingItem3 branding={self.props.branding} int={isInt} usernames={self.props.usernames} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
            font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Accounts'} name={'Accounts'} hasChild={false} 
						data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
		
				}
			})

			len = data[lvl - 1 ][0].params.length;
			var ph = ""
			if(len > 6){
					ph = <div style={{display:'block', width:'100%', height:20}}></div>
					SA = true;
			}
			nav = (
					<div className='setNav' style={{maxHeight:maxHeight}} onScroll={this.handleScroll} id={this.props.Id}>
						{nodes}
						{ph}
					</div>)
		}

		var className = "menuCategory expanded";
		var tstl = {display:'inline-block', textAlign:'center'}
		var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
		if (this.state.font == 1){
		    titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
		}else if (this.state.font == 0){
		   	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
		}
		catList = null;

		return(
			<div className='settingsDiv'>
			<ScrollArrow ref={this.arrowTop} offset={72} width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
			<div className={className}>
				{titlediv}{nav}
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
        
	  				if(typeof props.data[0]['child'] != 'undefined'){
             // console.log('parseValues', 4)
        
  						var lkey = props.data[0].params[props.data[0].child]['@name']
              if((props.data[0].params[props.data[0].child]['@children'])&&(props.children[0].length == 2)){
                console.log('parseValues', 5)
        
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
            //console.log('parseValues', 8)
        
            var lkey = props.lkey;
	          if((props.data['@children'])&&(props.children[0].length == 2)){
              console.log('parseValues', 9)
        
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
		var val = v
		if(n['@name'] == 'Nif_ip'){
			socket.emit('nifip', v.toString())
		}else if(n['@name'] == 'Nif_nm'){
			socket.emit('nifnm', v.toString())
		}else if(n['@name'] == 'Nif_gw'){
			socket.emit('nifgw', v.toString())
		}else{
			if(n['@type'] == 'ipv4_address'){
				val = v.split('.').map(function(ip){
					return ("000"+ip).slice(-3);
				}).join('.')
				setTimeout(function(){
					socket.emit('locateReq');
				},200)
			}
		this.props.sendPacket(n,val)	
		}
	}
	componentWillReceiveProps (newProps) {
		// body...
		var values = this.parseValues(newProps);
		
		this.setState({font:newProps.font, val:values[0], pram:values[1], labels:values[2]})
	}
	onItemClick(){

		if(this.props.hasChild || typeof this.props.data == 'object'){
		
			if(this.props.acc){
				this.props.onItemClick(this.props.data, this.props.name)	
			}else{

				toast('Access Denied')	
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

			if(typeof pVdef[0][pname] != 'undefined'){
				pram = pVdef[0][pname]
				var deps = []
				val = rval
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[6][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
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
					var f =	pram["@type"]
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
							}else{
								return self.props.prodSettings[d];
							}
						});
						if(pram['@name'] == 'BeltSpeed'){
							deps.push(self.props.dynSettings['EncFreq'])
							//deps.push(1000)
							console.log(3243,deps)
						}else if(pram['@type'] == 'rej_del'){
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
						val = 	uintToInt(val,16)//?? phase is coming in with different format for dyn data
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
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
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
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
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
					var f =	pram["@type"]
					if(f == 'phase'){
						val = 	(uintToInt(val,16)/100).toFixed(2)//?? phase is coming in with different format for dyn data
					}else{
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[6][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[6][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[6][d]["@rec"] == 2){
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}else if(pVdef[6][d]["@rec"] == 3){
							//		////////console.log(['1521',pVdef[6][d], self.props.dynSettings[d]])
								return self.props.framSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
					//	////////console.log(f)
						
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
		// body...
		this.props.onFocus();
	}
	onRequestClose () {
		// body...
		this.props.onRequestClose();
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
		var sty = {height:60}//, backgroundColor:FORTRESSPURPLE2}
    var klass = 'sItem'
    	 
		if(this.props.mobile){
			sty.height = 45;
			sty.lineHeight = '45px';
		}
			var res = vdefByMac[this.props.mac];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
			//////console.log('2885',pVdef,_pVdef)
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
				////////////console.log('1270')
				namestring = catMapV2[path]['@translations'][this.props.language]
				////////////console.log('1272')

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
          	sty.height = 50
          }
			return (<div className={klass} style={sty} onPointerDown={this.touchStart} onPointerUp={this.touchEnd} onClick={this.onItemClick}><label>{namestring}</label></div>)
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
					namestring = catMapV2[path]['@translations'][this.props.language]
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
				
				if(typeof this.props.data[0]['child'] != 'undefined'){
	        		klass  = 'sprc-prod'//+= ' noChild'

					var lkey = this.props.data[0].params[this.props.data[0].child]['@name']
					var im = <img  style={{position:'absolute', width:36,top:15, left:762, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return_blk.svg'/>
					
					if(this.props.mobile){
						im = <img  style={{position:'absolute', width:'7%',height:'40%',top:'30%', left:'92%', strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return_blk.svg'/>
					}
			
					if(this.props.backdoor){
						im = ''
					}
		

					var medctrl= (<MultiEditControl branding={this.props.branding} nameovr={namestring} combo={(this.props.data['@combo'] == true)} mobile={this.props.mobile} 
	    		            mac={this.props.mac} ov={true} vMap={vMapV2[lkey]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits}
	         				onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} ref='ed' vst={vst} 
	          				lvst={st} param={this.state.pram} size={this.props.font} sendPacket={this.sendPacket} data={this.state.val} 
	          				label={this.state.label} int={false} name={lkey}/>)


	        if(this.props.mobile){
						sty.height = 51
						sty.paddingRight = 5
					}
	        
	        		//sty.paddingBottom = 5
					return (<div className='sprc-prod' style={sty} onClick={this.onItemClick}> {medctrl}
							{im}
						
						</div>)
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
				return (<div className={klass} style={sty} onPointerDown={this.touchStart} onPointerUp={this.touchEnd} onClick={this.onItemClick}><label>{namestring}</label></div>)
			}
		}
		if(this.props.mobile){
			sty.height = 51;
			sty.paddingRight = 5;
		}
		var medctrl= (<MultiEditControl branding={this.props.branding} combo={(this.props.data['@combo'] == true)} mobile={this.props.mobile} mac={this.props.mac} ov={false} vMap={vMapV2[this.props.lkey]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} ref='ed' vst={vst} 
          lvst={st} param={this.state.pram} size={this.props.font} sendPacket={this.sendPacket} data={this.state.val} 
          label={this.state.label} int={false} name={this.props.lkey}/>)

		//sty.paddingBottom = 5
     
      	return (<div className='sprc-prod' style={sty}> {medctrl}
					</div>)
			
		}
	}
}
class MultiEditControl extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size,touchActive:false})
		this.selectChanged = this.selectChanged.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.onClick = this.onClear.bind(this);
		this.openSelector = this.openSelector.bind(this);
		this.valClick = this.valClick.bind(this);
    	this.onPointerDown = this.onPointerDown.bind(this);
    	this.onPointerUp = this.onPointerUp.bind(this);
    for(var i = 0; i<this.props.param.length; i++){
      this['input'+i] = React.createRef();
    	//this.renderSpElem = this.renderSpElem.bind(this);
    }
    this.pw = React.createRef();
	}
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.data.slice(0)})
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
			////console.log('3149',v,val)
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
		this.setState({val:value})
		if(this.props.param[i]['@bit_len'] > 16){
			val = v//              "
	      	if(this.props.param[i]['@type'] == 'dsp_name_u16_le' || this.props.param[i]['@type'] == 'prod_name_u16_le'){
	      		val  = (v + "                    ").slice(0,20)
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
		////console.log(3040,id)
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
	valClick (ind) {
		var self = this;
		if(!this.props.ov){
			if(this.props.param[ind]['@rpcs']){
				if(this.props.param[ind]['@rpcs']['clear']){
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
  	onPointerDown(){
    	this.setState({touchActive:true})
  	}
  	onPointerUp(){
    	if(this.state.touchActive){
        	this.setState({touchActive:false})
      
    	}
  	}
  	render(){
  		var self = this;
		
		var namestring = this.props.name
		
		if(typeof vdefByMac[this.props.mac][5][this.props.name] != 'undefined'){
			if(vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name'] != ''){
				namestring =  vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name']
			}
		}

		var dt = false;
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
		let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee', verticalAlign:'middle', lineHeight:'25px'}
		if(this.props.branding == 'SPARC'){
			lvst.background = SPARCBLUE2
		}

		var labWidth = (546/this.state.val.length)
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480',overflow:'hidden'}
		if(this.props.branding == 'SPARC'){
			lvst.background = SPARCBLUE2
			vlabelStyle.boxShadow = ' -50px 0px 0 0 '+ SPARCBLUE2
		}
		var vlabelswrapperStyle = {width:546, overflow:'hidden', display:'table-cell'}
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
				if(typeof _pVdef[7][self.props.param[i]["@labels"]]['english'] == 'undefined'){
					console.log(self.props.param[i])
				}
				val = _pVdef[7][self.props.param[i]["@labels"]]['english'][d];
				
				if((self.props.language != 'english')&&(typeof list[self.props.language] != 'undefined')&&(typeof list[self.props.language][d] == 'string') &&(list[self.props.language][d].trim().length != 0)){
					val = _pVdef[7][self.props.param[i]["@labels"]][self.props.language][d];
				}
				if((self.props.param[i]['@labels'] == 'InputSrc')){
          iod = true
					
          if(d == 0){
            st.color = '#666'
            iogreen = false;
            
          }else if((self.props.ioBits[inputSrcArr[d]] == 0) && (self.state.val[1] == 0)){
						st.color = '#666'
            iogreen = false;
					}else if((self.props.ioBits[inputSrcArr[d]] != 0) && (self.state.val[1] != 0)){
            st.color = '#666'
            iogreen = false;
          }
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
           iod = true
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = '#666'
            iogreen = false;
					}
				}
			}
	      	if(self.props.param[i]['@units']){
	        	val = val + ' ' + self.props.param[i]['@units']
	      	}
	      	if(self.props.combo){
	        	val = <React.Fragment><div style={{color:'#aaa', fontSize:self.props.vst.fontSize - 4}}>{self.props.vMap['@labels'][i]}</div><div>{val}</div></React.Fragment>
	        	st.lineHeight = '22px'
	        }

	        var _st = Object.assign({},st)
	        if(self.state.touchActive){
	        	_st.background = 'rgba(100,100,100,0.5)'
	        }
			
			return (<CustomLabel index={i} onClick={self.valClick} style={_st}>{val}</CustomLabel>)
		})
    

		var acc = false
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])||(this.props.param[0]['@rpcs']['theme'])){
					acc = true
				}
			}
		}

  if(iod){
      if(iogreen){
        ioindicator = <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#5d5'}}></div>
      }else{
         ioindicator = <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#555'}}></div>
      }
      }
		if(!acc){
        var bgClr = FORTRESSPURPLE2
        var txtClr = '#e1e1e1'
        if(this.props.branding == 'SPARC'){
          bgClr = SPARCBLUE2
          txtClr = '#000'
        }
			return <div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:250,textAlign:'center'}}>
				{namestring}
			</div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
				{vLabels}{ioindicator}
			</div>
			</div>
		}else{

			var multiDropdown = true;
			this.props.param.forEach(function (p) {
				if((typeof p['@labels'] == 'undefined') &&(p['@name'].indexOf('TestConfigCount') == -1)){
					multiDropdown = false;
				}
			})
				
			var options;
			
			if(multiDropdown){
				var lists = this.props.param.map(function (p) {
					if(p['@name'].indexOf('TestConfigCount') != -1){
						return [0,1,2,3,4,5,6,7,8,9]
					}else{
						var list = _pVdef[7][p["@labels"]]['english'].slice(0);
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
				})
				options = <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} mobile={this.props.mobile} params={this.props.param} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={false} name={namestring} ref={this.pw} val={this.state.val} options={lists} onChange={this.selectChanged}/>

			        var bgClr = FORTRESSPURPLE2
        var txtClr = '#e1e1e1'
        if(this.props.branding == 'SPARC'){
          bgClr = SPARCBLUE2
          txtClr = '#000'
        }
				return  <div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative',color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:250,textAlign:'center'}}>
				{namestring}
			</div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
				{vLabels}{ioindicator}
			</div>
			{options}
			</div>
				/*(<div><div  onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerLeave={this.onPointerUp} onClick={this.openSelector}><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>
						<div style={{paddingLeft:this.props.lvst.width}}>
							{options}
						</div></div>)*/
			}else{
				options = this.state.val.map(function(v, i){
					if(typeof self.props.param[i]['@labels'] != 'undefined'){
						if(typeof _pVdef[7][self.props.param[i]["@labels"]]['english'] == 'undefined'){
					console.log(self.props.param[i])
				}
						var labs = _pVdef[7][self.props.param[i]["@labels"]]['english']
						
						return <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={self.props.branding} mobile={self.props.mobile} params={self.props.param}  ioBits={self.props.ioBits} vMap={self.props.vMap} language={self.props.language} interceptor={false} name={namestring} ref={self['input'+i]} val={[v]} options={[_pVdef[7][self.props.param[i]["@labels"]]['english']]} onChange={self.selectChanged} index={i}/>
					}else{
						var num = true
						if(self.props.param[i]['@name'] == 'ProdName' || self.props.param[i]['@name'] == 'DspName'){ num = false }
						if(self.props.param[i]["@name"].indexOf('DateTime') != -1){dt = true;}
						var lbl = namestring
						if(self.props.combo){ lbl = lbl + [' Delay', ' Duration'][i]}
							return <CustomKeyboard branding={self.props.branding} mobile={self.props.mobile}  datetime={dt} language={self.props.language} tooltip={self.props.vMap['@translations'][self.props.language]['description']} vMap={self.props.vMap}  onFocus={self.onFocus} ref={self['input'+i]} onRequestClose={self.onRequestClose} onChange={self.valChanged} index={i} value={v} num={num} label={lbl + ' - ' + v}/>
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
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative',color:txtClr, fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:250,textAlign:'center'}}>
				{namestring}
			</div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
				{vLabels}{ioindicator}
			</div>
			{options}
			</div>
			/*
				return(<div><label style={lvst}>{namestring + ': '}</label>
							<div style={vlabelswrapperStyle} onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp}  onPointerLeave={this.onPointerUp}><div style={vlabelStyle}>{vLabels}</div></div>{options}</div>)
			*/
			}
		}
  		
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
			list.push(ac.username + ' - lv' + ac.acc)
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
	}
	componentWillReceiveProps(props){
		var list = []
		props.accounts.forEach(function(ac){
			list.push(ac.username + ' - lv' + ac.acc)
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
				toast('Password should be 6 characters')
			}
		}else{
			if(v.length == 4){
				this.props.authenticate(this.state.val,v)
			}else{
				toast('Password should be 4 characters')
			}
		}
		
	}
	toggleAccountControl(){
		if(this.props.level > 2){
			this.setState({showAcccountControl:!this.state.showAcccountControl})
		}else{
			toast('Access Denied')
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
		var pw = <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} branding={this.props.branding} mobile={this.props.mobile} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref={this.pw} val={[this.props.val]} options={[list]} onChange={this.selectChanged} onCancel={this.onCancel}/>

		return <React.Fragment>{pw}
			<CustomKeyboard branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.psw} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
		
		</React.Fragment> 
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
		this.setState({show:true,func:func, arg:arg, alertMessage:alertMessage})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	do(){
		this.state.func(this.state.arg)
	}
	render () {
		var	cont = ""
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
	//	this.discard = this.discard.bind(this);
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
	  			{this.props.children}
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
    console.log(p)
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
    cont =  <DeleteModalCont branding={this.props.branding} vMap={this.props.vMap} delete={this.delete} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{'Delete Selected Product?'}</DeleteModalCont>
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
          <div>
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
		console.log(func)
		this.setState({show:true, func:func})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	save(){
		this.props.save(this.state.func);
	}
	render () {
		var	cont = ""
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
			this.props.close();
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
	  			<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>Confirm Action</div>
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
class AccountControl extends React.Component{
	constructor(props){
		super(props)
		this.state = ({accounts:this.props.accounts, curlevel:0, username:'', pswd:'', newUser:false})
		this.selectChanged = this.selectChanged.bind(this);
		this.addAccount = this.addAccount.bind(this);
		this.removeAccount = this.removeAccount.bind(this);
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
	addAccount(){
		socket.emit('addAccount', {user:{user:this.state.username, acc:this.state.curlevel, password:this.state.pswd}, ip:this.props.ip})
	}
	removeAccount(account){
		socket.emit('removeAccount', {ip:this.props.ip, user:account})
	}
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
		var pw 	   =  <PopoutWheel inputs={inputSrcArr} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Filter Events'} ref={this.pw} val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={'Password'}/>
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} ><div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
		var st = {padding:7,display:'inline-block', width:180}
		
		var accTableRows = [];
		
		this.props.accounts.forEach(function(ac,i){
			accTableRows.push(<AccountRow branding={self.props.branding} mobile={self.props.mobile} language={self.props.language} lvl={self.props.level} change={self.props.level > ac.acc} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
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
		this.remove = this.remove.bind(this);
		this.saveChanges = this.saveChanges.bind(this);
		this.addAccount = this.addAccount.bind(this);
		this.valClick = this.valClick.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
    this.ed = React.createRef();
    this.pw = React.createRef();
    this.pswd = React.createRef();
    this.username = React.createRef();
	}
	componentWillReceiveProps(props){
		this.setState({username:props.username, acc:props.acc, password:props.password})
	}
	valClick(){
		//toast('Value Clicked')
	   this.setState({changed:false})
		this.ed.current.toggle();
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
	remove(){
		if(this.props.saved){
			socket.emit('removeAccount', {ip:this.props.ip, user:this.state.username})
		}else{
			this.setState({username:this.props.username, acc:this.props.acc, password:this.props.password})
		}
	}
	saveChanges(){
		this.addAccount();
	
	}
	addAccount(){
    console.log(8200, 'writeUserData', this.props.uid)
		socket.emit('writeUserData', {data:{username:this.state.username, acc:this.state.acc, password:this.state.password, user:this.props.uid}, ip:this.props.ip})
		
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
			var val = d;
			var cst = Object.assign({},st)
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
			var pw = 	<PopoutWheel branding={this.props.branding} inputs={inputSrcArr} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Set Level'} ref={this.pw} val={[this.state.acc]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard branding={this.props.branding} language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard branding={this.props.branding} language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={'Password'}/>
	
			var edit = <Modal mobile={this.props.mobile} ref={this.ed} onClose={this.saveChanges} innerStyle={{background:modBG}}>
			<div style={{textAlign:'center', background:'#e1e1e1', padding:10}}>

				<div style={{marginTop:5}} onClick={() => this.username.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:250,textAlign:'center'}} >{'Username: '}
				</div>		<div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}><label style={st}>{this.state.username}</label></div></div>
				<div style={{marginTop:5}} onClick={() => this.pswd.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:250,textAlign:'center'}} >{'Password: '}
				</div>		<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}><label style={st}>{this.state.password.split("").map(function(c){return '*'}).join('')}</label></div></div>
				<div style={{marginTop:5}} onClick={() => this.pw.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:250,textAlign:'center'}} >{'Level: '}
				</div>		<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}><label style={st}>{this.state.acc}</label></div></div>
						</div>
				{pw}{userkb}{pswdkb}
			</Modal>
				
			var num = true
			var lbl = namestring

//ssl no verify test
			return(<div style={{marginTop:5}}>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:250,textAlign:'center'}}>
				{namestring}
			</div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
				{vLabels}
			</div>
			{edit}
			</div>)
			//return(<div className={'sItem noChild'}><div><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>{edit}</div>)
	}
}
class DisplaySettings extends React.Component{
  constructor(props){
    super(props)

  }
  editIP(v){
    socket.emit('nifip', v.toString())
  }
  editNM(v){
    socket.emit('nifnm', v.toString())
  }
  editGW(v){
    socket.emit('nifgw', v.toString())
  }
  sendPacket(n,v){

  }
  render(){
    var titleColor = '#000'
      var className = "menuCategory expanded";
    var tstl = {display:'inline-block', textAlign:'center'}
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}}>
      <div style={tstl}>{'Display Settings'}</div></h2></span>)

 var nav = (<div className='setNav'>
                <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_ip']['@translations'][this.props.language]['name']} value={this.props.nifip} editable={true} onEdit={this.editIP} param={{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_nm']['@translations'][this.props.language]['name']} value={this.props.nifnm} editable={true} onEdit={this.editNM} param={{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                <div style={{marginTop:5}}><ProdSettingEdit language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_ip']['@translations'][this.props.language]['name']} value={this.props.nifgw} editable={true} onEdit={this.editGW} param={{'@name':'Nif_gw', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
       
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

class FaultDiv extends React.Component{
	constructor(props) {
		super(props)
		this.clearFaults = this.clearFaults.bind(this)
		this.maskFault = this.maskFault.bind(this)
	}
	clearFaults () {
		this.props.clearFaults()
	}
	maskFault (f) {
		this.props.maskFault(f)
	}
	render () {
		var self = this;
		var cont;
		var clButton;
		if(this.props.faults.length == 0){
			cont = (<div style={{color:'#e1e1e1'}}><label>No Faults</label></div>)
		}else{
			    	var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

			clButton =<div> <CircularButton branding={'SPARC'} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Clear Faults'} onClick={this.clearFaults}/></div>
       
			cont = this.props.faults.map(function(f){
				return <FaultItem maskFault={self.maskFault} fault={f}/>
			})
		}
		return(<div>
			{cont}
			{clButton}
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

		return <div><label style={{color:'#e1e1e1'}}>{"Fault type: " + type}</label>
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
    st.width = 546
    st.fontSize = 24
    st.display = 'table-cell';//self.props.vst.display;

    var tz = <PopoutWheel ovWidth={600} branding={this.props.branding} vMap={vMapV2['Timezone']} language={this.props.language} interceptor={false} name={'Timezone'} ref={this.tz} val={[this.state.timeZone]} options={[this.state.tzlist]} onChange={this.onTzChange}/>
  
    var tzTxt = ''
    if(this.props.timezones[this.state.timeZone]){
      tzTxt = this.props.timezones[this.state.timeZone-1].text;
    }
    var tzItem = (<div style={{margin:2}} onClick={()=>this.tz.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:250,textAlign:'center'}}>
        {'Time Zone'}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:546}}>
        <div style={st}>{tzTxt}</div>
      </div>
      </div>)


    return <React.Fragment>{tzItem}{tz}</React.Fragment>
  }
}
var PromptModalCont =  onClickOutside(PromptModalC);
var DeleteModalCont =  onClickOutside(DeleteModalC);
var CopyModalCont =  onClickOutside(CopyModalC);
ReactDOM.render(<Container/>,document.getElementById('content'))