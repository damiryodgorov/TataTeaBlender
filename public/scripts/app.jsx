const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
import {TickerBox, CanvasElem, SlimGraph, DummyGraph, Modal,GraphModal, AuthfailModal, MessageModal, AlertModal, MessageConsole, ScrollArrow} from './components.jsx'
import {CircularButton, ButtonWrapper, CustomAlertButton, CustomAlertClassedButton} from './buttons.jsx'
import {PopoutWheel} from './popwheel.jsx'
import {CustomKeyboard, KeyboardInputTextButton} from './keyboard.jsx'
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {css} from 'glamor'
var createReactClass = require('create-react-class');

const FtiSockIo = require('./ftisockio.js')

const vdefMapV2 = require('./vdefmap.json')
const funcJSON = require('./funcjson.json')

const inputSrcArr = ['NONE','TACH','EYE','RC_1','RC_2','REJ_EYE', 'AIR_PRES' ,'REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP_TEST','CIP_PLC','PROD_SEL1', 'PROD_SEL2', 'PROD_SEL3','PROD_SEL4']
const outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

var vdefMapST = {};

var categories;
var netMap = vdefMapV2['@netpollsmap']

var vMapV2 = vdefMapV2["@vMap"]
var categoriesV2 = [vdefMapV2["@categories"]]
var catMapV2 = vdefMapV2["@catmap"]


let vdefList ={};
let vdefByMac = {};
var _Vdef;
var _pVdef;
let isVdefSet = false;
var ftiTouch = true //this.
var _nVdf;

const _ioBits = ['TACH','EYE','RC_1','RC_2','REJ_EYE','AIR_PRES','REJ_LATCH','BIN_FULL','REJ_PRESENT','DOOR1_OPEN','DOOR2_OPEN','CLEAR_FAULTS','CLEAR_WARNINGS','PHASE_HOLD','CIP','CIP_TEST','CIP_PLC','PROD_SEL1','PROD_SEL2','PROD_SEL3','PROD_SEL4',
                  'TEST','NONE','REJ_MAIN','REJ_ALT','FAULT','TEST_REQ','HALO_FE', 'HALO_SS', 'LS_RED','LS_YEL','LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

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
var _wsurl = 'ws://' +location.host 
var socket = new FtiSockIo(_wsurl);
var liveTimer = {}
var myTimers = {}

var located = false;
var cnt = 0;

socket.on('vdef', function(vdf){
	//////console.log('on vdef')
	var json = vdf[0];
	_Vdef = json
	var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
    res[4] = {};
    res[8] = {};
   	var nVdf = [[],[],[],[],[]];

   

    json["@params"].forEach(function(p ){

      res[p["@rec"]][p["@name"]] = p;
      res[8][p["@name"]] = p;
      nVdf[p["@rec"]].push(p['@name'])

   
    }
    );
    res[5] = json["@deps"];
    res[6] = json["@labels"]
    res[7] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        ////////console.log("fault found")
        res[7].push(par)
      }
    }

    _pVdef = res;
    //if(json['@defines']['INTERCEPTOR']){
         vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapV2['@categories']], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]
        vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@categories"]], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]

    //}else{
      //   vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapST['@categories']], vdefMapST['@vMap'], vdefMapST['@pages']]
       // vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapST["@categories"]], vdefMapST['@vMap'], vdefMapST['@pages']]

    //}
   ////console.log('552',vdefByMac)
    isVdefSet = true;
})
socket.on('echo',function(){
	setTimeout(function(){
		socket.emit('echoback')
	},100)
})
/*******************************************/


function _scrollById(id,distance) {

	var elem = document.getElementById(id)
   
    elem.scrollTop = elem.scrollTop + distance
}

function getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, int){
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
    	//	//console.log(p)
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
          if(int==true){
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
             
            }else if(typeof pVdef[2][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[a], '@children':[], acc:par.acc}
            }else if(typeof pVdef[3][a] != 'undefined'){
              _p = {'type':0, '@name':p, '@type':'fram','@data':fram[a], '@children':[], acc:par.acc}
            }else if(par.val == 'DCRate_INT'){
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
              _p['@interceptor'] = true; 
              params.push(_p)
              ////console.log(335,_p)
            }
          }else{
            var pname = p.slice(0,-4)
        //    //console.log(pname, p, 342)
              if(typeof pVdef[0][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@data':sysRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[1][pname] != 'undefined'){

                var data = prodRec[pname]
                
                _p = {'type':0, '@name':p, '@data':data, '@children':[], acc:par.acc}
                if(p == 'BeltSpeed'){
                  //////console.log('653',par,_p)
                }
              }else if(typeof pVdef[2][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'dyn','@data':dynRec[pname], '@children':[], acc:par.acc}
              }else if(typeof pVdef[3][pname] != 'undefined'){
                _p = {'type':0, '@name':p, '@type':'fram','@data':fram[pname], '@children':[], acc:par.acc}
              }else if(par.val == 'DCRate'){
                _p = {'type':0, '@name':p,'@data':prodRec[pname], '@children':[], acc:par.acc}
              }
              if(_p!= null){
                           params.push(_p)   
                
              }
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
        }
    		
    	}else if(par.type == 1){
    		if(typeof par.child != 'undefined'){
    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram,int), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:1, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram,int), acc:par.acc})
    		}
    	}else if(par.type == 2){
    			if(typeof par.child != 'undefined'){
    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram,int), acc:par.acc, child:par.child})
    		}else{


    			params.push({type:2, '@data':iterateCats2(par.val, pVdef, sysRec, prodRec, _vmap, dynRec, fram,int), acc:par.acc})
    		}
    	}else if(par.type == 3){
    		params.push({type:3, '@name':'Accounts', '@data':'get_accounts', acc:0})
    	}
    					
    })
	return params
}
function iterateCats2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, int){
	//////////console.log(['684',pVdef])
  ////console.log('is int', int)
	cat.params = getParams2(cat, pVdef, sysRec, prodRec, _vmap, dynRec, fram, int)
	
	return cat
}
const FastZoom = cssTransition({ 
	enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 300  
})
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });

    // You can also log the error to an error reporting service
    //logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
class Container extends React.Component{
 constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
   componentDidCatch(error, info) {
    this.setState({ hasError: true });
	toast('error')
  }

	render(){
		return (<div style={{background:"#362c66"}}>
		<LandingPage/>	
		<ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
			pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
			</div>)
	}
}
class LandingPage extends React.Component{
	constructor(props) {
		super(props)
		var minMq = window.matchMedia("(min-width: 400px)");
		var mq = window.matchMedia("(min-width: 1000px)");
		var mqls = window.matchMedia("(orientation: landscape)")
			
		this.state =  ({automode:0,currentPage:'landing',netpolls:{}, mqls:mqls,curIndex:0, minMq:minMq,landScape:mqls.matches, minW:minMq.matches, mq:mq, brPoint:mq.matches, progress:'',
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:5, version:'2018/07/30',pmsg:'',pON:false,percent:0,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]}, accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''], nifip:'', nifnm:'',nifgw:''})
		this.listenToMq = this.listenToMq.bind(this);
		mq.addListener(this.listenToMq)
		minMq.addListener(this.listenToMq)
		mqls.addListener(this.listenToMq);
		this.locateUnits = this.locateUnits.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
		this.ipChanged = this.ipChanged.bind(this);
		this.renderDetectors = this.renderDetectors.bind(this);
		this.renderDetector = this.renderDetector.bind(this);
		this.showFinder = this.showFinder.bind(this);
		this.switchUnit = this.switchUnit.bind(this);
		this.addMBUnit = this.addMBUnit.bind(this);
		this.editMb = this.editMb.bind(this);
		this.addToTmp = this.addToTmp.bind(this);
		this.addToTmpGroup = this.addToTmpGroup.bind(this);
		this.addToTmpSingle = this.addToTmpSingle.bind(this);
		this.removeFromTmpGroup = this.removeFromTmpGroup.bind(this);
		this.cancel = this.cancel.bind(this);
		this.submitMB = this.submitMB.bind(this);
		this.submitMBe = this.submitMBe.bind(this);
		this.move = this.move.bind(this)
		this.removeMb = this.removeMb.bind(this)
		this.renderModal = this.renderModal.bind(this);
		this.changetMBName =this.changetMBName.bind(this);
		this.editName =this.editName.bind(this);
		this.renderMBGroup = this.renderMBGroup.bind(this)
		this.logoClick = this.logoClick.bind(this);
		this.save = this.save.bind(this);
		this.addNewSingleUnit = this.addNewSingleUnit.bind(this);
		this.addMBUnit = this.addMBUnit.bind(this);
		this.setAuthAccount = this.setAuthAccount.bind(this);
		this.showDisplaySettings = this.showDisplaySettings.bind(this);

	}
	listenToMq(argument) {
		if(this.refs.dv){
			this.refs.dv.setState({br:this.state.mq.matches,landScape:this.state.mqls.matches, update:true})
		}
		this.setState({brPoint:this.state.mq.matches, landScape:this.state.mqls.matches})
	}
	locateUnits(callback) {
		located = false;
		socket.emit('hello','landing')
		this.refs.findDetModal.toggle();
	}
	locateB(){
		socket.emit('locateReq', 'b')
	}
	componentDidMount() {
		var self = this;
		this.loadPrefs();
		//socket.on()
		socket.on('resetConfirm', function (r) {
			socket.emit('locateReq');
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
			self.refs.updateModal.toggle();
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
				socket.emit('locateUnicast', _ip)
			}else{
				socket.emit('locateReq')
			}
			setTimeout(function (argument) {
			// body...
			if(self.state.mbunits.length == 1){
				if(self.state.currentPage == 'landing'){
					if(self.state.mbunits[0].banks.length == 1){
						if(vdefByMac[self.state.mbunits[0].banks[0].mac]){
							////console.log('try first here?')
							self.switchUnit(self.state.mbunits[0].banks[0])
						}else{
							setTimeout(function () {
								// body...
								if(self.state.currentPage == 'landing'){
									////console.log('switch?')
									if(vdefByMac[self.state.mbunits[0].banks[0].mac]){
										self.switchUnit(self.state.mbunits[0].banks[0])
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
		socket.on('locatedResp', function (e) {
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
			mbunits.forEach(function(u){
				var banks = u.banks.map(function(b){
					if(dets[b.mac]){
						var _bank = dets[b.mac]
            _bank.interceptor = false;
            if(b.interceptor){
              _bank.interceptor = true;
            }
					//	_bank.interceptor = b.interceptor
						return dets[b.mac]
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
					socket.emit('connectToUnit', b.ip)
				})
			})
		
			socket.emit('savePrefs', mbunits)
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
		});
    socket.on('dispSettings', function(disp){
      self.setState({automode:disp.mode})
    })  
		
		socket.on('paramMsg2', function(data) {
			self.onParamMsg2(data.data,data.det) 
			data = null;
		})
		socket.on('rpcMsg', function (data) {
			//////console.log(data)
			self.onRMsg(data.data, data.det)
			data = null;
		})
		socket.on('loggedIn', function(data){
			self.refs.logIn.toggle();
			self.setState({curUser:data.id, level:data.level})
		})

		socket.on('logOut', function(){
			self.setState({curUser:'', level:0})
		})
		socket.on('accounts', function(data){
			////console.log(data)
			self.setState({accounts:data.data})
		})
		socket.on('userNames', function(p){
			//////console.log(['808', p])
			if(self.refs.dv){
				self.refs.dv.setState({usernames:p.det.data.array, update:true})
			}
			
		})
		socket.on('authResp', function(pack){
			if(pack.reset){
				self.refs.resetPass.show(pack)
				self.setAuthAccount(pack)
			}else{
				self.setAuthAccount(pack)
	
			}
		})
		socket.on('authFail', function(pack){
			//toast('Authentication failed')
			self.refs.am.show(pack.user, pack.ip)
			self.setAuthAccount({user:'Not Logged In', level:0, user:-1})
		})
		socket.on('passwordNotify',function(e){
			console.log(1117,e)
			var message = 'Call Fortress with ' + e.join(', ');
			self.refs.msgm.show(message)
		})
	}
	setAuthAccount(pack){
		if(this.refs.dv){
			this.refs.dv.setAuthAccount(pack)
		}
	}
	resetPassword(pack,v){
		var packet = {ip:pack.ip, data:{user:pack.user, password:v}}
		//console.log('packet',packet)
		socket.emit('writePass', packet)
	}
	onNetpoll(e,d){
		////////////console.log([e,d])
		var nps = this.state.netpolls
		if(nps[d.ip]){
			if(nps[d.ip].length == 15){
				nps[d.ip].splice(-1,1);
		
			}
			if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')|| (e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				e.parameters = e.parameters.slice(0,1)
			}
			
			nps[d.ip].unshift(e)
			if(e.net_poll_h == 'NET_POLL_OPERATOR_NO'){
				////////console.log('test started: ' + d.ip)
			}else if(e.net_poll_h == 'NET_POLL_TEST_REQ_PASS'){
				////////console.log('test passed: ' + d.ip)
				//toast('Test Passed')
			}

			this.setState({netpolls:nps})
		}
		
	}
	onRMsg(e,d) {
		////////////console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);

		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.mac]){
			this.refs[d.mac].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  					if(b.mac == d.mac){
  						ind = i;
  					}
  				})
  			}) 
  			if(ind != -1){
  				if(this.refs['mbu' + ind]){
  					this.refs['mbu'+ind].onRMsg(e,d)
  				}
  			}
		}
		msg = null;
		data = null;
		e = null;
		d = null;
	}
	onParamMsg2(e,d) {
		//////console.log(vdefByMac[d.mac])
		if(vdefByMac[d.mac]){
		//	////console.log(d)
			if(this.refs[d.mac]){
				this.refs[d.mac].onParamMsg2(e);
			}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  					m.banks.forEach(function (b) {
  						if(b.mac == d.mac){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].onParamMsg2(e,d);
  					}
  				}
  			}
  			
		
			if(this.refs.dv){
				this.refs.dv.onParamMsg3(e,d)
			}
		}
		e = null;
		d = null;
	}
	onAccounts(data){

	}	
	ipChanged(e) {
		e.preventDefault();
		this.setState({ipToAdd:e.target.value})
	}
	renderDetectors () {
		var self = this;
		var units = this.state.detectors.map(function (u) {
			return <SingleUnit mobile={!self.state.brPoint} ref={u.mac} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
	}
	showFinder() {
		this.refs.findDetModal.toggle();
		this.locateB()
	}
	logoClick() {this.setState({currentPage:'landing'})}
	switchUnit(u) {
		////////////console.log(u)
		var self = this;
		setTimeout(function () {
			// body...
			if(self.state.currentPage == 'landing'){
				self.setState({curDet:u, currentPage:'detector'})
			}
		},100)	
	}
	addNewMBUnit(){
		var self = this;
		setTimeout(function (argument) {
			// body...
		
		self.setState({curModal:'newMB', tmpMB:{name:'NEW', type:'mb', banks:[]}})
		},100)
	}
	addNewSingleUnit() {
		var self = this;
		setTimeout(function (argument) {
			// body...
			self.setState({curModal:'newSingle', tmpMB:{name:'NEW', type:'single', banks:[]}})
		},100)	
	}
	addMBUnit(mb) {
		var mbunits = this.state.mbunits
		var nps = this.state.netpolls
		mbunits.push(mb)
		mb.banks.forEach(function(b){
			if(!nps[b.ip]){
				nps[b.ip] = []
			}
		})
		this.setState({mbunits:mbunits, netpolls:nps})
	}
	editMb(i) {
		
		var mbunits = this.state.mbunits;

		var mbunit ={}
		mbunit.type = mbunits[i].type;
		mbunit.name = mbunits[i].name;
		mbunit.banks = mbunits[i].banks;
		this.setState({curIndex:i, curModal:'edit', tmpMB:mbunit})
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
		if(vdefByMac[dsps[e].mac][0]['@defines']['INTERCEPTOR']){
			tmpdsp.interceptor = true
		}else{
			tmpdsp.interceptor = false
		}
		if(true || vdefByMac[dsps[e].mac][0]['@defines']['INTERCEPTOR_DF']){
			tmpdsp.df = true;
		}
		if(vdefByMac[dsps[e].mac][0]['@defines']['FINAL_FRAM_STRUCT_SIZE']){
            tmpdsp.ts_login = true;   
        }
		socket.emit('connect',tmpdsp.ip)
		cont.push(tmpdsp)
		detL[dsps[e].mac] = null;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})	
	}
	addToTmpGroup(e) {
		this.addToTmp(e,'multi')
	}
	addToTmpSingle(e) {
		this.addToTmp(e,'single')
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
	cancel() {
		////////////console.log(['268', 'cancel'])
		var detL = this.state.detL;
		this.state.tmpMB.banks.forEach(function (b) {
			detL[b.mac]= b
		})
		this.setState({curModal:'add',detL:detL, tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	submitMB(){
		var mbunits = this.state.mbunits;
		mbunits.push(this.state.tmpMB)

		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	submitMBe(){
		var mbunits = this.state.mbunits;
		mbunits[this.state.curIndex]= this.state.tmpMB 
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	}
	changeModalMode() {
		this.setState({curModal:'add'})
	}
	move(i,d) {
		var mbunits = this.state.mbunits
		if(d == 'up'){
			if(i != 0){
				var punit = mbunits[i-1];
				var unit = mbunits[i];
				mbunits[i] = punit;
				mbunits[i-1] = unit;
			}
		}else{
			if(i != (mbunits.length - 1)){
				var nunit = mbunits[i+1];
				var unit = mbunits[i];
				mbunits[i+1] = unit;
				mbunits[i] = nunit;
			}
		}
		this.setState({mbunits:mbunits});
	}
	saveSend(mbunits) {
		socket.emit('savePrefs', mbunits)
	}
	save() {
		socket.emit('savePrefs', this.state.mbunits)
	}
	loadPrefs() {
		if(socket.sock.readyState  ==1){
			//socket.emit('locateReq');
			socket.emit('getVersion');
			socket.emit('getPrefs');
      socket.emit('getDispSettings');

		}
	}
	removeMb(i) {
		var mbunits = this.state.mbunits;
		var detL = this.state.detL
		mbunits[i].banks.forEach(function(b){
			detL[b.mac] = b
		})
		mbunits.splice(i,1);
		this.saveSend(mbunits)
		this.setState({mbunits:mbunits, detL:detL})
	}
	reset() {
		socket.emit('reset', 'reset requested')
	}
	renderModal() {
		var self = this;
		var mbSetup = this.state.mbunits.map(function(mb,ind) {
			////////////console.log(ind)
			return <MbSetup remove={self.removeMb} move={self.move} mb={mb} edit={self.editMb} index={ind} singleUnits={self.state.single}/>	// body...
		})
		var detList = this.state.dets.map(function(d){
			return d.name
		})
		
		if(this.state.curModal == 'edit'){
			var MB = this.renderMBGroup(0)
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newMB'){
			var MB = this.renderMBGroup(1)
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newSingle'){
			var MB = this.renderMBGroup(2)
			return (<div>
				{MB}
			</div>)
		}else{
			return (<div>
						<div>
            <div style={{display:'inline-block', width:300, textAlign:'center'}}><CircularButton style={{width:220, lineHeight:'60px', height:60, marginRight:'auto', marginLeft:'auto'}} lab={'Add Detector'} onClick={this.addNewSingleUnit}/></div>
					  <div style={{display:'inline-block', width:300, textAlign:'center'}}><CircularButton style={{width:220, lineHeight:'60px', height:60, marginRight:'auto', marginLeft:'auto'}} lab={'Reset Connections'} onClick={this.reset}/></div>
          
          			
								<div className='mbManager'>
								{mbSetup}
						</div>
						</div>
						</div>)

      /*<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
                <button onClick={this.save}>Save Settings</button>
                <button onClick={this.loadPrefs}>Load Saved Settings </button>
                <button onClick={this.reset}>Reset Connections</button>*/
		}
	}
	changetMBName(e) {
		e.preventDefault();
		if(this.state.mbunits)
		var MB = this.state.tmpMB
		if(typeof e == 'string'){
			MB.name = e
		}else{
			MB.name = e.target.value;
		
		}
		this.setState({tmpMB:MB})
	}
	editName(){
		this.refs.an.toggle();
	}
	renderMBGroup(mode) {
		var self = this;
		var submit;
		if(mode == 0){
			submit = (<button onClick={this.submitMBe}>Submit</button>)
		}else{
			submit = (<button onClick={this.submitMB}>Submit</button>)
		}

			var detectors = this.state.dets.map(function(det, i){
				if(self.state.detL[det.mac]){
						return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}/>)
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
	showLogin(){
		this.refs.logIn.toggle();
	}
	onChange(argument) {
	
	}
	showDisplaySettings(){
		this.refs.dispModal.toggle();
	}
	updateDisply(){
		socket.emit('updateDisplay')
	}
  rebootDisply(){
    socket.emit('reboot')
  }
	renderLanding() {
    var self = this;
    var detectors = this.renderDetectors()
    var config = 'config_w'
    var find = 'find_w'
    var login = 'login'

    var lstyle = {height: 72,marginRight: 20}
    if(!this.state.minW){
      lstyle = { height: 60, marginRight: 15}
    }
    var mbunits = this.state.mbunits.map(function(mb,i){
      //if(mb.type == 'mb'){
        //return <MultiBankUnit onSelect={self.switchUnit} ref={'mbu' + i} name={mb.name} data={mb.banks}/> 
      //}else{
        if(mb.banks[0]){
          ////////////console.log('457')
          return <SingleUnit mobile={!self.state.brPoint} ref={mb.banks[0].mac} onSelect={self.switchUnit} unit={mb.banks[0]}/>  
        }           
      //}
      
    })
    /*
                    <td hidden={this.props.mobile}>
                <img style={{height:45, marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src='assets/Interceptor-white-01.svg'/>
                </td>
    */
    
    var modalContent = this.renderModal();
    return (<div className='interceptorMainPageUI' style={{background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}}>
         <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
            <tbody>
              <tr>
                <td><img style={{height: 50,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td>

                  <td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
                <td className="buttCell"><button onClick={this.showDisplaySettings} className={config}/></td>
              </tr>
            </tbody>
          </table>
          <Modal ref='findDetModal'>
            {modalContent}
          </Modal>
          <Modal ref='dispModal'>
            <DispSettings nif={this.state.nifip} nm={this.state.nifnm} gw={this.state.nifgw} version={this.state.version} automode={this.state.automode}/>
            <CustomAlertButton alertMessage={'Update display?'} style={{height:50,display:'inline-block',marginRight:5, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:180, borderRadius:20, textAlign:'center', lineHeight:'50px'}} onClick={this.updateDisply}>Update Display</CustomAlertButton>
              <CustomAlertButton alertMessage={'Reboot display?'} style={{height:50, border:'5px solid #808a90',display:'inline-block', color:'#e1e1e1', background:'#5d5480', width:180, borderRadius:20, textAlign:'center', lineHeight:'50px'}} onClick={this.rebootDisply}>Reboot Display</CustomAlertButton>
          
          </Modal>
          <div style={{textAlign:'center'}}>
          {detectors}
          {mbunits}
          </div>
          <Modal ref='updateModal'>
            <div style={{color:'#e1e1e1'}}>
              <div>Updating Display...</div>
              <div>{this.state.progress}</div>
            </div> 
          </Modal>
      </div>) 
  }
  renderLanding2() {
    var self = this;
    var detectors = this.renderDetectors()
    var config = 'config'
    var find = 'find'
    var login = 'login'

    var lstyle = {height: 72,marginRight: 20}
    if(!this.state.minW){
      lstyle = { height: 60, marginRight: 15}
    }
    var mbunits = this.state.mbunits.map(function(mb,i){
      if(mb.type == 'mb'){
        return <MultiBankUnit onSelect={self.switchUnit} ref={'mbu' + i} name={mb.name} data={mb.banks}/> 
      }else{
        if(mb.banks[0]){
          ////////////console.log('457')
          return <SingleUnit ref={mb.banks[0].mac} onSelect={self.switchUnit} unit={mb.banks[0]}/>  
        }           
      }
      
    })
    
    var modalContent = this.renderModal();
    return (<div className='landingPage'>
          <table className='landingMenuTable'>
            <tbody>
              <tr>
                <td><img style={lstyle} onClick={this.showNKeyboard}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
                <td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
                <td className="buttCell"><button onClick={this.showDisplaySettings} className={config}/></td>
              </tr>
            </tbody>
          </table>
          <Modal ref='findDetModal' innerStyle={{background:'#e1e1e1'}}>
            {modalContent}
          </Modal>
          <Modal ref='dispModal' innerStyle={{background:'#e1e1e1'}}>
            <DispSettings nif={this.state.nifip} nm={this.state.nifnm} gw={this.state.nifgw} version={this.state.version}/>
            <CustomAlertButton alertMessage={'Update display?'} style={{color:'#000000'}} onClick={this.updateDisply}>Update Display</CustomAlertButton>
          </Modal>
          {detectors}
          {mbunits}

          <Modal ref='updateModal'>
            <div style={{color:'#e1e1e1'}}>
              <div>Updating Display...</div>
              <div>{this.state.progress}</div>
            </div> 
          </Modal>
      </div>) 
  }
	renderDetector() {
		//for kraft CIP
		var kraft = false;
		if(vdefByMac[this.state.curDet.mac][0]['@defines']['KRAFT_CIP']){
			kraft = true;
		}
		return (<DetectorView kraft={kraft}  nifip={this.state.nifip} nifnm={this.state.nifnm} nifgw={this.state.nifgw} br={this.state.brPoint} ref='dv' acc={this.state.level} accounts={this.state.accounts} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip} mac={this.state.curDet.mac} netpolls={this.state.netpolls[this.state.curDet.ip]}/>)
		
	}
	
	
	onLoginFocus(){
		this.refs.logIn.setState({override:true})
	}
	onLoginClose(){
		var self = this;
		setTimeout(function(){
			self.refs.logIn.setState({override:false})	
		}, 100)
		
	}
	addFocus(){
		this.refs.findDetModal.setState({override:true})
	}
	addClose(){
		var self = this;
		setTimeout(function(){
			self.refs.findDetModal.setState({override:false})	
		}, 100)
	}
	dummy() {
		// body...
		////////console.log('dummy')
	}
	forgot(id,ip){
		//console.log('passReset')
		socket.emit('passReset',{ip:ip,data:{user:id}})
	}
	render() {
		var cont;
		var style = {minWidth: 290,userSelect: 'none', maxWidth: 1028,marginLeft: 'auto', marginRight:'auto', backgroundColor:"#362c66"}
		//var hd = window.matchMedia("(min-width:1900px)").matches;


		if(this.state.currentPage == 'landing'){
			////////////console.log('here')
			cont = this.renderLanding();


		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
			style =  {backgroundColor:"#362c66", boxShadow:"0px 19px #362c66"}
		}
		
		return (
			
			<div style={style}>
		
			{cont}
			<AuthfailModal ref='am' forgot={this.forgot}/>
			<UserPassReset language={'english'} ref='resetPass' mobile={!this.state.brPoint} resetPassword={this.resetPassword}/>
			<MessageModal ref='msgm'/>
		</div>
		)
	}
}
class DispSettings extends React.Component{
	constructor(props){
		super(props)
		this.onChange = this.onChange.bind(this);
		this.onChangeNM = this.onChangeNM.bind(this);
		this.onChangeGW = this.onChangeGW.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onClickNM = this.onClickNM.bind(this);
		this.onClickGW = this.onClickGW.bind(this);
    this.onChangeAuto = this.onChangeAuto.bind(this);
    this.onClickAuto = this.onClickAuto.bind(this);
	}
  onChangeAuto(d){
    socket.emit('dispMode',d)
  }
  onClickAuto(){
    var self = this;
    setTimeout(function(){
         self.refs.auto.toggle();
 
    },150)
  }
	onChange(v){
		socket.emit('nifip', v);
	}
	onChangeNM(v){
		socket.emit('nifnm', v);
	}
	onChangeGW(v){
		socket.emit('nifgw', v);
	}
	onRequestClose(){

	}
	onFocus(){

	}
	onClick(){
		this.refs.ip.toggle();
	}
	onClickNM(){
		this.refs.nm.toggle();
	}
	onClickGW(){
		this.refs.gw.toggle();
	}
	render(){
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}
      var disp = ['auto','static'];
		return <div>
		<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#e1e1e1"}} >
		<div style={{display:'inline-block', textAlign:'center'}}>Display Settings</div></h2></span>
		
			 <div className='sItem noChild' onClick={this.onClick}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display IP'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.nif}</label></div></div>
			</div>
			 <div className='sItem noChild' onClick={this.onClickNM}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Netmask'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.nm}</label></div></div>
			</div>
			 <div className='sItem noChild' onClick={this.onClickGW}>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Gateway'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.gw}</label></div></div>
			</div>
      <div className='sItem noChild' onClick={this.onClickAuto}>
       <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Auto IP'}</label>
      <div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{disp[this.props.automode]}</label></div></div>
      </div>
			<div className='sItem noChild'>
			 <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Display Version'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.version}</label></div></div>
			</div>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'ip'} onRequestClose={this.onRequestClose} onChange={this.onChange} index={0} value={this.props.nif} num={true} label={'Address'}/>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'nm'} onRequestClose={this.onRequestClose} onChange={this.onChangeNM} index={0} value={this.props.nm} num={true} label={'Address'}/>
			<CustomKeyboard language={'english'} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'gw'} onRequestClose={this.onRequestClose} onChange={this.onChangeGW} index={0} value={this.props.gw} num={true} label={'Address'}/>
      <PopoutWheel mobile={this.props.mobile} vMap={this.props.vMap} language={'english'} index={0} interceptor={false} name={'Auto IP'} ref='auto' val={[this.props.automode]} options={[disp]} onChange={this.onChangeAuto} onCancel={this.onRequestClose}/>

		</div>
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
			self.refs.pw.toggleCont();
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
			self.refs.psw.toggle();			
		}

		}, 100)
		self.setState({val:v})
		

		//this.props.login(v)
	}
	enterPIN(){
		this.refs.psw.toggle();
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
		var pw = <PopoutWheel mobile={this.props.mobile} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref='pw' val={[this.props.val]} options={[list]} onChange={this.selectChanged} onCancel={this.onCancel}/>

		return <React.Fragment>{pw}
			<CustomKeyboard mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'psw'} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
		
		</React.Fragment> 
	}
}
class UserPassReset extends React.Component{
	constructor(props){
		super(props)
		this.state = {pack:{}}
		this.show = this.show.bind(this);
		this.valChanged = this.valChanged.bind(this);
	}
	show(pack){
		var self = this;
		this.setState({pack:pack})
		setTimeout(function(){
			self.refs.psw.toggle()
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
				toast('Password should be 6 characters')
			}
		}else{
			if(v.length == 4){
				this.props.resetPassword(this.state.pack,v)
			}else{
				toast('Password should be 4 characters')
			}
		}
	}
	render(){
		return <CustomKeyboard mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'psw'} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Reset Password'}/>
	}
}
class LEDBar extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({pled:0, dled:0})
		this.update = this.update.bind(this)
	}
	update(p,d) {
		if((this.state.pled != p) || (this.state.dled != d)){
			this.setState({pled:p, dled:d})
		}
	}
	render(){
		var rej = 'black';
		var prod = 'black';
		var fault = 'black';
			if(this.state.pled == 1){
			prod = 'green';
		}else if(this.state.pled == 2){
			prod = 'red'
		}
		if(this.state.dled == 1){
			rej = 'red'
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LEDi color={rej}/><LEDi color={rej}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LEDi color={prod}/><LEDi color={prod}/></td></tr></tbody></table>
			</div>
			)
	}
}
class LEDBarInt extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({pled_a:0, dled_a:0,pled_b:0, dled_b:0})
		this.update = this.update.bind(this)
	
	}
	update(pa,pb,da,db) {
		// body...
		if((this.state.pled_a != pa) || (this.state.dled_a != da)||(this.state.pled_b != pb) || (this.state.dled_b != db)){
			this.setState({pled_a:pa, dled_a:da,pled_b:pb, dled_b:db})
		}
	}
	render(){
		var rej_a = 'black';
		var rej_b = 'black';
		
		var prod_a = 'black';
		var prod_b = 'black';
		
		var fault = 'black';
			if(this.state.pled_a == 1){
			prod_a = 'green';
		}else if(this.state.pled_a == 2){
			prod_a = 'red'
		}
		if(this.state.dled_a == 1){
			rej_a = 'red'
		}
			if(this.state.pled_b == 1){
			prod_b = 'green';
		}else if(this.state.pled_b == 2){
			prod_b = 'red'
		}
		if(this.state.dled_b == 1){
			rej_b = 'red'
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LEDi color={rej_a}/><LEDi color={rej_b}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LEDi color={prod_a}/><LEDi color={prod_b}/></td></tr></tbody></table>
			</div>
			)
	}
}
class LEDi extends React.Component{
	constructor(props) {
		super(props)
	}
	render(){
		return(<div className='ledi' style={{ backgroundColor:this.props.color}}/>)
	}
}

class SettingsDisplay2 extends React.Component{
	constructor(props) {
		super(props)
		this.mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		for (var i=0; i<3; i++){
			this.mqls[i].addListener(this.listenToMq)
		}
		var font = 0;
		if(this.mqls[2].matches){
			font = 2
		}else if(this.mqls[1].matches){
			font = 1
		}

		this.state = ({
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, dynRec:this.props.dynSettings,font:font, data:this.props.data, cob2:this.props.cob2, framRec:this.props.framRec,path:[]
		});
		this.handleItemclick = this.handleItemclick.bind(this);
		this.scrollUp = this.scrollUp.bind(this);
		this.scrollDown = this.scrollDown.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.activate = this.activate.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
    this.goBack = this.goBack.bind(this);
		//this.componentDidMount = this.component
	}
	componentWillUnmount(){
		
		for (var i=0; i<3; i++){
			this.mqls[i].removeListener(this.listenToMq)
		}
	}
	componentWillReceiveProps(newProps){
		this.setState({data:newProps.data, cob2:newProps.cob2, sysRec:newProps.sysSettings, prodRec:newProps.prodSettings, dynRec:newProps.dynSettings, framRec:newProps.framRec})
	}
	listenToMq() {
		if(this.mqls[2].matches){
			this.setState({font:2})
		}else if(this.mqls[1].matches){
			this.setState({font:1})
			
		}else if(this.mqls[0].matches){
			this.setState({font:0})
		}
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
        this.refs.arrowTop.show();
      }else{
        this.refs.arrowTop.hide();
      }
      if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
        this.refs.arrowBot.show();
      }else{
        this.refs.arrowBot.hide();
      }
    }

		/*if(len > 6){
			if((document.getElementById(this.props.Id).scrollTop) + 390 < len*65){
				this.refs.arrowBot.show();
				//////////console.log(['show arrow',document.getElementById(this.props.Id).scrollTop])
			}else{
				this.refs.arrowBot.hide();	
				//////////console.log(document.getElementById(this.props.Id).scrollTop)
			} 
			if(document.getElementById(this.props.Id).scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
		}	*/
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
			////console.log(['1917',arg1, arg2,strArg,v])
		
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}else if(n['@rpcs']['clear']){
			var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
				
			socket.emit('rpc', {ip:this.props.dsp, data:packet})
		}
	}
	activate(n) {
		// body...
		var self = this;
		////////console.log(['1466',n,this.props.cob2,this.props.data])
		var list; 
		if(this.props.data.length > 1){
			list 	= this.props.data[this.props.data.length - 1][0].params
		}else{
			list = this.props.data[0][0].params
		}
	
		list.forEach(function(p){
			if(p['@name'] != n['@name']){
				if(self.refs[p['@name']]){
					self.refs[p['@name']].deactivate();
				}
			}
		});
	}
	onFocus() {
		// body...
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
	render(){
		var self = this;

	//	var data = this.props.data
		var data = [];
    if(this.props.data[0] == 'get_accounts'){
      data = this.props.data
    }else{
    data.push([this.state.cob2[0],0])
    var _par = this.state.cob2[0].params.slice(0);
    this.state.path.forEach(function (x,i) {
      
      data.push([_par[x]['@data'],x])
      _par = _par[x]['@data'].params.slice(0);
      // body...
    })
  }
   // //console.log(data,data2,this.state.path)
    //////console.log(2366,'render')
		//var catMap = vdefByMac[this.props.dsp][]
		////////////console.log(data)
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
		var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej'}
		var len = 0;
		var SA = false;
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem3 int={self.props.int} mobile={this.props.mobile} mac={this.props.mac} language={self.props.language}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
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
		    	//catMap[data[0]]['@translations']['english']
		    }else if(lvl == 2){
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations'][this.props.language];
		    	}
		    
					backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return.svg'/>
						<label style={{color:'#ccc', fontSize:ft}}>{backText}</label></div>)
			
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
		    	backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return.svg'/>
		    		<label style={{color:'#ccc', fontSize:ft}}>{backText}</label></div>)
				
		    	 
		    	
		    }
			nodes = []
	
			data[lvl - 1 ][0].params.forEach(function (par,i) {
				// body...
				if(par.type == 0){
          
          //console.log(2091, par)

			//		//////console.log("Is this the problem")
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
				  //console.log('check this',d)
        	var ch = d['@children'].slice(0)

          if(d['@interceptor'] || d['@test'] || d['@halo'] || d['@input']){
            ch.unshift(d['@data'])
          }
         	var	acc = false;
					if((self.props.level > 3) || (p.acc <= self.props.level)){
						acc = true;
					}
					nodes.push(<SettingItem3 int={self.props.int} mobile={self.props.mobile} mac={self.props.mac} language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
						ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={p['@name']} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
							children={[vdefByMac[self.props.mac][5][pname].children,ch]} hasChild={false} data={d} onItemClick={handler} hasContent={true}  acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
					
				}else if(par.type == 1){
					var sc = par['@data']
					////console.log('check this too',sc)
          
          var	acc = false;
					if((self.props.level > 3) || (par.acc <= self.props.level)){
						acc = true;
					}
					if(typeof sc['child'] != 'undefined'){
						var spar = sc.params[sc.child]
            //console.log(sc,2115)
						var ch = spar['@children'].slice(0)
          if(spar['@interceptor'] || spar['@test'] || spar['@halo'] || spar['@input']){
            ch.unshift(spar['@data'])
          } 
                 var spname = spar['@name']

          if(!self.props.int){
            if(spname.slice(-4) == '_INT'){
              spname = spname.slice(0,-4)
            }
          }
							nodes.push(<SettingItem3 int={self.props.int} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} children={[vdefByMac[self.props.mac][5][spname].children,ch]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			
					}else{
		
						nodes.push(<SettingItem3 int={self.props.int} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
						data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
					}
				}else if(par.type == 2){
					var sc = par['@data']
            ////console.log('check this too',sc)
        
							var	acc = false;
							////console.log(['2146',par])
				
					if((self.props.level > 3)){
						acc = true;
					}
					if(typeof sc['child'] != 'undefined'){
						var spar = sc.params[sc.child]
						var ch = spar['@children'].slice(0)
          if(spar['@interceptor'] || spar['@test'] || spar['@halo'] || spar['@input']){
            ch.unshift(spar['@data'])
          }
							nodes.push(<SettingItem3 int={self.props.int} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} backdoor={true} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
			
					}else{
		
						nodes.push(<SettingItem3 int={self.props.int} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
						data={[sc,i]} backdoor={true} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
					}
				}else if(par.type == 3){
					//This 
								var	acc = false;
							////console.log(['2146',par])
				
					if((self.props.level > 3)){
						acc = true;
					}
					var sc = par['@data']
						nodes.push(<SettingItem3 int={self.props.int} usernames={self.props.usernames} mobile={self.props.mobile} mac={self.props.mac}  language={self.props.language} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={'Accounts'} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Accounts'} name={'Accounts'} hasChild={false} 
						data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
		
				}
			})
			len = data[lvl - 1 ][0].params.length;
			var ph = ""
			if(len > 6){
				ph = <div style={{display:'block', width:'100%', height:20}}></div>
				SA = true;
			}
			nav = (
				<div className='setNav' onScroll={this.handleScroll} id={this.props.Id}>
					{nodes}
					{ph}
				</div>)
		}

		var className = "menuCategory expanded";
	   	var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }
	    catList = null;

		return(
			<div className='settingsDiv'>
			<ScrollArrow ref='arrowTop' offset={72} width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
			<div className={className}>
				{titlediv}{nav}
			</div>
			<ScrollArrow ref='arrowBot' offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
			</div>
		);
	}
}
class SettingItem3 extends React.Component{
	constructor(props) {
		super(props)

		this.sendPacket = this.sendPacket.bind(this);
		this.onItemClick = this.onItemClick.bind(this);
		this.activate = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.getValue = this.getValue.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose =this.onRequestClose.bind(this);
		this.parseValues = this.parseValues.bind(this);
		var values = this.parseValues(this.props);
		this.state = ({mode:0,font:this.props.font, val:values[0], pram:values[1], labels:values[2]})
		

	}
	parseValues(props){
		var res = vdefByMac[props.mac];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
		var val = [], pram = [], label = false;
		if(!props.hasChild){
			
      ////console.log(props)
		if(typeof props.data == 'object'){

			if(typeof props.data['@data'] == 'undefined'){
			
  			if(typeof props.data[0]['child'] != 'undefined'){
  				var lkey = props.data[0].params[props.data[0].child]['@name']
          if(this.props.int != true){
            if(lkey.slice(-4) == '_INT'){
              lkey = lkey.slice(0,-4)
            }
          }
          //came here
          //console.log(lkey,2238)
  				
          if((props.data[0].params[props.data[0].child]['@children'])&&(props.children[0].length == 2)){
            //console.log(2269)
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
              }else if(lkey == 'DCRate_INT'){
                pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
              }
            }
          }else{
            //here
            //console.log(lkey, 2275)
            
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
    				}else if(lkey == 'DCRate_INT'){
    					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
    				  //label = true;
            }else if(lkey == 'DCRate'){
              pram = [{'@name':'DCRate', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate",0],null]}}]
              //label = true;
            }

           if(props.data[0].params[props.data[0].child]['@children']){

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
            if(lkey == 'DCRate_INT'){
              pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
             // //console.log(2230,lkey)
            }
          }
        }
        if(pram.length == 0){
          //console.log(lkey)
        }
        if(pram[0]['@labels']){
					label = true
				}	
				
				}

			}else{
          var lkey = props.lkey;
          if(this.props.int != true){
            if(lkey.slice(-4) == '_INT'){
              lkey = lkey.slice(0,-4)
            }
          }
        if((props.data['@children'])&&(props.children[0].length == 2)){
          //also came here
         //console.log(lkey, 2340, props.children)
         // //console.log('are we here instead?', props.children)
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
            if(lkey == 'DCRate_INT'){
              pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
            }
        }else{
          //came here
          //console.log(2357, lkey)

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
    			}else if(lkey == 'DCRate_INT'){
    				pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
    			}else if(lkey == 'DCRate'){
            pram = [{'@name':'DCRate', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate",0],null]}}]
            //label = true;
          }else{
    					//console.log(2629,props.lkey, lkey)
    			}
          //came here
          //console.log(pram, 2383)
          if(props.data['@children']){
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
          }
          if(lkey == 'DCRate_INT'){
            pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
          }
        }
        if(pram.length == 0){
          //console.log(2311, props.lkey, lkey)
          if(lkey == 'DCRate_INT'){
            pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
          }
        }
        if(pram[0]['@labels']){ label = true }	
  		}
		}else{
        //console.log('here??????')
				val = [this.getValue(props.data['@data'], props.lkey)]
				if(typeof pVdef[0][props.lkey] != 'undefined'){
					pram = [pVdef[0][props.lkey]]
				}else if(typeof pVdef[1][props.lkey] != 'undefined'){
					pram = [pVdef[1][props.lkey]]
				}else if(typeof pVdef[2][props.lkey] != 'undefined'){
					pram = [pVdef[2][props.lkey]]
				}else if(typeof pVdef[3][props.lkey] != 'undefined'){
					pram = [pVdef[3][props.lkey]]
				}else if(props.lkey == 'Nif_ip'){
					pram = [{'@name':'Nif_ip', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_nm'){
					pram = [{'@name':'Nif_nm', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'Nif_gw'){
					pram = [{'@name':'Nif_gw', '@type':'ipv4_address', '@bit_len':32,'@rpcs':{'write':[0,[0,0,0],null]}}]
				}else if(props.lkey == 'DCRate_INT'){
					pram = [{'@name':'DCRate_A', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_A",0],[1]]}},{'@name':'DCRate_B', '@labels':'DCRate','@bit_len':32, '@rpcs':{'write':[19,[192,"DCRate_B",0],[0]]}}]
				}
				if(props.data['@children']){
					////////////console.log(['1346', props.data.children])
					for(var ch in props.data['@children']){
						val.push(this.getValue(props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}else if(typeof pVdef[2][ch] != 'undefined'){
							pram.push(pVdef[2][ch])
						}else if(typeof pVdef[3][ch] != 'undefined'){
							pram.push(pVdef[3][ch])
						}
					}
				}
				if(pram[0]['@labels']){
					label = true
				}
		}	
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
			}else if(n['@decimal']){}
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
			////////console.log([this.props.data])
			// accessControl
			if(this.props.acc){
				this.props.onItemClick(this.props.data, this.props.name)	
			}else{

				toast('Access Denied')	
				}		
			}
	}
	activate () {
		this.props.activate(this.props.data)
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			this.refs.ed.deactivate()
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
							if(pVdef[5][d]["@rec"] == 0){
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
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
							}
						});
						if(pram['@name'] == 'BeltSpeed'){
							deps.push(self.props.dynSettings['EncFreq'])
						}
					}
					if(f == 'mm'){
							if(deps[0] == 0){
								dec = 1
							}
						}
					if(pram['@bit_len']<=16){
						//////console.log(f)
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
							return self.props.prodSettings[d+'_A']
						}else if(pram['@name'] == 'DetThresh_B'){
							return self.props.prodSettings[d+'_B']
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
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
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
						if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		////////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
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
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else if(pVdef[5][d]["@rec"] == 1){
								return self.props.prodSettings[d];
							}else if(pVdef[5][d]["@rec"] == 2){
							//		////////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
								return self.props.dynSettings[d];
							}else if(pVdef[5][d]["@rec"] == 3){
							//		////////console.log(['1521',pVdef[5][d], self.props.dynSettings[d]])
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
		var sty = {height:60}
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
				
			return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
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
				var lkey = this.props.data[0].params[this.props.data[0].child]['@name']
				var im = <img  style={{position:'absolute', width:36,top:15, left:815, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				
				if(this.props.mobile){
					im = <img  style={{position:'absolute', width:'7%',height:'40%',top:'30%', left:'92%', strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/return.svg'/>
				}
		
				if(this.props.backdoor){
					im = ''
				}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={true} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={this.state.pram} size={this.state.font} sendPacket={this.sendPacket} data={this.state.val} label={this.state.label} int={false} name={lkey}/>
				if(this.props.mobile){
					sty.height = 51
					sty.paddingRight = 5
				}
				return (<div className='sItem noChild' style={sty} onClick={this.onItemClick}> {edctrl}
						{im}
					
					</div>)
				}

		
				return (<div className='sItem hasChild' style={sty} onClick={this.onItemClick}><label>{namestring}</label></div>)
			}
			}
			if(this.props.mobile){
				sty.height = 51;
				sty.paddingRight = 5;
			}
				var edctrl = <EditControl mobile={this.props.mobile} mac={this.props.mac}  ov={false} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={this.state.pram} size={this.state.font} sendPacket={this.sendPacket} data={this.state.val} label={this.state.label} int={false} name={this.props.lkey}/>
				return (<div className='sItem noChild' style={sty}> {edctrl}
					</div>)
			
		}
	}
}
class EditControl extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
		this.sendPacket = this.sendPacket.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.valChangedl = this.valChangedl.bind(this);
		this.valChangedb = this.valChangedb.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.valChangedlb = this.valChangedlb.bind(this);
		this.switchMode = this.switchMode.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	sendPacket(){
		var self = this;
		this.props.sendPacket(this.props.param[0], this.state.val[0])
		if(this.props.int){
			setTimeout(function () {
				// body...
				self.props.sendPacket(self.props.param[1], self.state.val[1])
			},100)
			
		}
		this.setState({mode:0})
	}
	valChanged(e){
		
		var val = e//e.target.value;
		if(this.props.bitLen == 16){
			val = Params.swap16(parseInt(val))
		}
    if(this.props.param[0]['@type'] == 'dsp_name_u16_le' || this.props.param[0]['@type'] == 'prod_name_u16_le'){
      val  = (val + "                    ").slice(0,20)
    }
		var value = this.state.val;
		value[0] = e
		if(this.props.param[0]['@type'] =='ipv4_address'){
			this.props.sendPacket(this.props.param[0], val);
	
		}else{
			this.props.sendPacket(this.props.param[0], parseInt(val));
		
		}
		
		////////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedl(e){
		
		var val = e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = Params.swap16(parseInt(val))
		}
			//////////////console.log(val)
			this.props.sendPacket(this.props.param[0], parseInt(val));
		var value = this.state.val;
		value[0] = e.target.value
		////////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedb(e){
		////////////console.log(e)
		var val = e;
		if(this.props.bitLen == 16){
			val = Params.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[1] = e
		////////////console.log(this.props.data)
		this.setState({val:value})
	}
	valChangedlb(e){
	//	////////////console.log(e)
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = Params.swap16(parseInt(val))
		}
			this.props.sendPacket(this.props.param[1], parseInt(val));
		var value = this.state.val;
		value[1] = e.target.value
		////////////console.log(this.props.data)
		this.setState({val:value})
	}
	componentWillReceiveProps (newProps) {
		this.setState({size:newProps.size, val:newProps.data.slice(0)})
	}
	deactivate () {
		// body...
		if(this.refs.ed){
			////////////console.log(['1511', 'this the prob'])
			this.refs.ed.setState({mode:0})
		}else{
			this.setState({mode:0})	
		}		
	}
	_handleKeyPress (e) {
		// body...
		if(e.key === 'Enter'){
			this.sendPacket();
		}
	}
	switchMode () {
		// body...
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	}
	onSubmit(e){
		e.preventDefault();
		var valA = this.state.value[0];
		var valB = this.state.value[1];
		var self = this;
		if(this.props.bitLen == 16){
			valA = Params.swap16(valA)
			valB = Params.swap16(valB)

		}
		this.props.sendPacket(this.props.param[0], parseInt(valA));
		setTimeout(function(){
			self.props.sendPacket(self.props.param[1], parseInt(valB))
			
		}, 100)
		this.setState({editMode:false})
	}
	onFocus () {
		// body...
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose()	
	}
	render(){
		var lab = (<label>{this.state.val}</label>)
		var num = true;
		var dt = false;
		var style = {display:'inline-block',fontSize:24}
		if((this.state.size == 1)||(this.props.mobile)){
			style = {display:'inline-block',fontSize:20}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:16}
		}

		var namestring = this.props.name;
		if(namestring.indexOf('INPUT_')!= -1){
			////////////console.log(namestring)
			namestring = namestring.slice(6);
		}else if(namestring.indexOf('OUT_')!=-1){
			namestring = namestring.slice(4)
		}
		if(namestring.indexOf('PHY_')!= -1){
			namestring = namestring.slice(4)
		}
		if(this.props.param[0]["@name"].indexOf('ProdName')!=-1){
			num = false
		}
		else if(this.props.param[0]["@name"].indexOf('DateTime') != -1){
			dt = true;
		}
		////////////console.log(['1720',this.props.name, this.props.data])
		if(typeof vMapV2[this.props.name] != 'undefined'){
				if(vMapV2[this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vMapV2[this.props.name]['@translations'][this.props.language]['name']
				}
			}
		if(this.props.data.length > 0	){
			//if(Array.isArray(this.props.data[0])){
				////////////console.log('1728')
			//	return (<NestedEditControl mac={this.props.mac} language={this.props.language}  ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
			//		lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
		//	}else{
				////////////console.log('1732')
				return (<MultiEditControl mobile={this.props.mobile} mac={this.props.mac} ov={this.props.ov} vMap={vMapV2[this.props.name]} language={this.props.language} ip={this.props.ip} ioBits={this.props.ioBits}
				 onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
		//	}	
		}
		var fSize = 24;
			if(namestring.length > 28){
				fSize = 18
			}
			else if(namestring.length > 24){
				fSize= 20
			}else if(namestring.length > 18){
				fSize = 22
			}
		var lvst = {display: 'inline-block',fontSize: fSize,width: '310',background: '#5d5480',borderRadius: 20,textAlign: 'center', color: '#eee'}
		var st = this.props.vst;
			st.width = 536
			if(this.props.mobile){
				st.height = 45
				st.paddingRight = 5;
				st.lineHeight = '51px'
				lvst.lineHeight = '25px'
				lvst.verticalAlign = 'middle'
			}
		
		var dval = this.props.data[0]
		if(this.props.label){
      if(this.props.param.length == 0){
        //console.log(this.props, 3054)
      }
			if(this.props.param[0]["@labels"] == 'DCRate'){
				var dclab = ['fastest','fast','med','slow'];
				dval = dclab[this.props.data[0]];
			}else if(_pVdef[6][this.props.param[0]["@labels"]][this.props.language]){
				if(_pVdef[6][this.props.param[0]["@labels"]][this.props.language][this.props.data[0]]){
					dval = _pVdef[6][this.props.param[0]["@labels"]][this.props.language][this.props.data[0]]
				}else{
					dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
				}
			}else{
				dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
			}
		}
		
			
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={lvst}>{namestring + ": "}</label><label style={st}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					////////////console.log(selected)
					if (this.props.param[0]["@labels"] == 'InputSrc'){
			//			////////console.log(['1795', 'Input Source bits'])
					}else if(this.props.param[0]["@labels"] == 'OutputSrc'){
			//			////////console.log(['1797', 'Output Source bits'])
					}
					var options = _pVdef[6][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
				//	var lvst = this.props.lvst
				/*	if((this.props.param[0]['@labels'] == 'FaultMaskBit')){
						if(this.props.faultBits.indexOf(this.props.param[0]['@name'].slice(0,-4)) != -1){
							lvst.color= '#ffa500'
						}
					}*/
					return(
						<div>
						<div onClick={this.switchMode}>
							<label style={lvst}>{namestring + ': '}</label><label style={st}> {dval}</label>
							</div>
							<div style={{marginLeft:this.props.lvst.width, width:this.props.vst.width}} className='customSelect'>
							<select onChange={this.valChangedl}>
							{options}
							</select>
							</div>
							</div>)

				}else{
					/*<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0]}></input>*/
					var input = (<CustomKeyboard datetime={dt} language={this.props.language} ref={'keyboard'} tooltip={vMapV2[this.props.name]['@translations'][this.props.language]['description']} onInput={this.valChanged} label={this.state.val[0].toString()} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} onFocus={this.onFocus} onRequestClose={this.onRequestClose} />)//
					
					return (<div> <div onClick={this.switchMode}><label style={lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
					{input}
					</div>)	
			}
		}
	
	}
}
class MultiEditControl extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
		this.switchMode = this.switchMode.bind(this)
		this.deactivate = this.deactivate.bind(this)
		this.selectChanged = this.selectChanged.bind(this);
		this.valChanged = this.valChanged.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.onClick = this.onClear.bind(this);
		this.openSelector = this.openSelector.bind(this);
		this.valClick = this.valClick.bind(this);
	}
	componentWillReceiveProps(newProps){
		this.setState({val:newProps.data.slice(0)})
	}
	switchMode () {
		// body...
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	}
	deactivate () {
		this.setState({mode:0})
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
		console.log('2735', val)
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
			//val = v + "      
      val = v//              "
      if(this.props.param[i]['@type'] == 'dsp_name_u16_le' || this.props.param[i]['@type'] == 'prod_name_u16_le'){

        val  = (v + "                    ").slice(0,20)
        console.log(3177, val)
      }
			this.props.sendPacket(this.props.param[i], val)
		}else if(!Number.isNaN(val)){
			////console.log('why')
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
			if(this.refs.pw){
				setTimeout(function () {
					self.refs.pw.toggleCont();
				},100)
				
			}
		}
		
	}
	valClick (ind) {
		if(!this.props.ov){
			if(this.props.param[ind]['@rpcs']){
				if(this.props.param[ind]['@rpcs']['clear']){
					this.onClear(ind)
				}else if(this.props.param[ind]['@rpcs']['start']){
					this.onClear(ind)
				}else if(this.refs['input' + ind]){
					this.refs['input' + ind].toggle();
				}
			}else if(this.refs['input' + ind]){
					this.refs['input' + ind].toggle();
			}
		}
	}
	render() {
		//////console.log(3243, this.props.mobile)
		var namestring = this.props.name
		//////////console.log(['2692',namestring])
			if(typeof vdefByMac[this.props.mac][5][this.props.name] != 'undefined'){
				if(vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name'] != ''){
					namestring = vdefByMac[this.props.mac][5][this.props.name]['@translations'][this.props.language]['name']
				}
			}
		var dt = false;
		var self = this;
		var fSize = 24;
		if(namestring.length > 24){
			fSize = 18
		}
		else if(namestring.length > 20){
			fSize= 20
		}else if(namestring.length > 12){
			fSize = 22
		}
		if(this.props.mobile){
			fSize -= 7;
			fSize = Math.max(13, fSize)
		}
		let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}

		var isInt = false
		var colors = ['#000','#eee']
		var regexA = /_A$/
		var regexB = /_B$/
		if(this.state.val.length == 2){
			if(this.props.param[0]['@name'].search(regexA) != -1){
				if(this.props.param[1]['@name'].search(regexB) != -1){
					if(this.props.param[0]['@name'].slice(0,-2) == this.props.param[1]['@name'].slice(0,-2)  ){
						isInt = true;
					}
				}
			}
		}
		var labWidth = (536/this.state.val.length)
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		if(this.props.mobile){
			labWidth = parseInt(100/this.state.val.length) + '%'
			vlabelswrapperStyle.width = '60%'
			lvst.verticalAlign = 'middle'
			lvst.lineHeight = '25px'
		}
    ////console.log(this.props.param, this.state.val)
			var vLabels = this.state.val.map(function(d,i){  
			var val = d;
			var st = {textAlign:'center',lineHeight:'60px', height:60}

			st.width = labWidth
			st.fontSize = self.props.vst.fontSize;
			st.display = 'table-cell';//self.props.vst.display;
			if(self.props.mobile){
				st.height = 51
				st.lineHeight = '51px'
				st.display = 'inline-block'
				//labWidth = (50/this.state.val.length)+'%'
			}
			if(isInt){ st.color = colors[i] }
        ////console.log(self.props.param, i)
			
      //if(self.props.param.length == 0){
     //   //console.log(self.props, 3303, self.state)
      //}
      if(typeof self.props.param[i]['@labels'] != 'undefined'){
				var list =  _pVdef[6][self.props.param[i]["@labels"]];
				if(self.props.param[i]["@labels"] == 'DCRate'){
					var dclab = ['fastest','fast','med','slow'];
					list = {'english':dclab}
					val = dclab[d];
				}else{
					val = _pVdef[6][self.props.param[i]["@labels"]]['english'][d];
				
				}
				

				if((self.props.language != 'english')&&(typeof list[self.props.language] != 'undefined')&&(typeof list[self.props.language][d] == 'string') &&(list[self.props.language][d].trim().length != 0)){
					val = _pVdef[6][self.props.param[i]["@labels"]][self.props.language][d];
				}
				if((self.props.param[i]['@labels'] == 'InputSrc')){
					if(self.props.ioBits[self.props.param[i]['@name'].slice(6)] == 0){
						st.color = '#666'
					}
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = '#666'
					}
				}
			}
      if(self.props.param[i]['@units']){
        val = val + ' ' + self.props.param[i]['@units']
      }
			return (<CustomLabel index={i} onClick={self.valClick} style={st}>{val}</CustomLabel>)
		})

	
		if(isInt){
			vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480', background:'linear-gradient(75deg, rgb(129, 138, 144), rgb(129, 138, 144) 49.7%, rgb(72, 64, 116) 50.3%, rgb(72, 64, 116))'}
		
		}
		var acc = false
		if(this.props.acc){
			if(this.props.param[0]['@rpcs']){
				if((this.props.param[0]['@rpcs']['write'])||(this.props.param[0]['@rpcs']['toggle'])||(this.props.param[0]['@rpcs']['clear'])){
			acc = true
		}}}
		if(!acc){
			return(<div><label style={lvst}>{namestring + ': '}</label>
				<div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>)

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
						// body...
						if(p['@name'].indexOf('TestConfigCount') != -1){
							return [0,1,2,3,4,5,6,7,8,9]
						}else if(p['@name'].indexOf('DCRate') != -1){
							return ['fastest','fast','med','slow'];
						}else{
							var list = _pVdef[6][p["@labels"]]['english'].slice(0);
							if(self.props.language != 'english'){
								if(typeof _pVdef[6][p["@labels"]][self.props.language] != 'undefined'){
									list.forEach(function(lb,i){
										if((typeof _pVdef[6][p["@labels"]][self.props.language][i] == 'string') &&(_pVdef[6][p["@labels"]][self.props.language][i].trim().length != 0)){
											list[i] = _pVdef[6][p["@labels"]][self.props.language][i]
										}
									})
								}
							}
							return list//_pVdef[6][p["@labels"]]['english']
						}
					})
					options = <PopoutWheel mobile={this.props.mobile} params={this.props.param} ioBits={this.props.ioBits} vMap={this.props.vMap} language={this.props.language}  interceptor={isInt} name={namestring} ref='pw' val={this.state.val} options={lists} onChange={this.selectChanged}/>

					return(<div><div onClick={this.openSelector}><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>
					<div style={{paddingLeft:this.props.lvst.width}}>
						{options}
					</div></div>)
				}else{
					options = this.state.val.map(function(v, i){
						if(typeof self.props.param[i]['@labels'] != 'undefined'){

							var labs;
							if(self.props.param[i]['@labels'] == 'DCRate'){
								labs = ['fastest','fast','med','slow'];
							}else{
								labs = _pVdef[6][self.props.param[i]["@labels"]]['english']
					
							}
							var opts = labs.map(function(e,i){
								if(i == v){
									return (<option selected value={i}>{e}</option>)

								}else{
									return (<option value={i}>{e}</option>)

								}
							})

							return <PopoutWheel mobile={this.props.mobile} params={this.props.param}  ioBits={this.props.ioBits} vMap={self.props.vMap} language={this.props.language} interceptor={isInt} name={namestring} ref={'input'+i} val={[v]} options={[_pVdef[6][self.props.param[i]["@labels"]]['english']]} onChange={self.selectChanged} index={i}/>
						}else{
							var num = true
							if(self.props.param[i]['@name'] == 'ProdName' || self.props.param[i]['@name'] == 'DspName'){
								num = false
							}
							 if(self.props.param[i]["@name"].indexOf('DateTime') != -1){
								dt = true;
							}
							var lbl = namestring
							if(isInt){
								lbl = lbl + [' A',' B'][i];
							}
							
							return <CustomKeyboard mobile={self.props.mobile}  datetime={dt} language={self.props.language} tooltip={self.props.vMap['@translations'][self.props.language]['description']} vMap={self.props.vMap}  onFocus={self.onFocus} ref={'input'+i} onRequestClose={self.onRequestClose} onChange={self.valChanged} index={i} value={v} num={num} label={lbl + ' - ' + v}/>
						}
					})

					return(<div><label style={lvst}>{namestring + ': '}</label>
						<div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div>{options}</div>
						
					)
				}


		}
		
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
		return <label onClick={this.onClick} style={style}>{this.props.children}</label>
	}
}
class LiveView extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({rejects:0, mode:0, phase:90,pled:0,dled:0})
		this.update = this.update.bind(this);
		this.setLEDs = this.setLEDs.bind(this);
	}
	update (data) {
		this.refs.st.update(data)
	}
	setLEDs (p,d) {
		this.refs.st.setLEDs(p,d)
	}
	render(){
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBar ref='st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBar ref='st'/>
			</div>
			)
	}
}
class LiveViewInt extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({rejects:0, mode:0, phase:90,pled:0,dled:0})
		this.update = this.update.bind(this);
		this.setLEDs = this.setLEDs.bind(this);
	}
	update (a,b) {
		this.refs.st.update(a,b)
	}
	setLEDs (pa,da,pb,db) {
		this.refs.st.setLEDs(pa,pb,da,db)
	}
	render(){
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBarInt ref = 'st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBarInt ref = 'st'/>		
			</div>
			)
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
			cont = (<div><label>No Faults</label></div>)
		}else{
			clButton = <button onClick={this.clearFaults}>Clear Faults</button>
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
		return <div><label>{"Fault type: " + type}</label>
		</div>
	}
}

class StatBar extends React.Component{
	constructor(props) {
		super(props)
		this.update = this.update.bind(this)
		this.setLEDs = this.setLEDs.bind(this)
	}
	update (data) {
		this.refs.tb.update(data)
	}
	setLEDs (p,d) {
		this.refs.lb.update(p,d)
	}
	render(){
		return (<div className='statBar'>
			<TickerBox ref='tb' int={false}/>
			<LEDBar ref='lb'/>
			</div>)
	}
}
class StatBarInt extends React.Component{
	constructor(props) {
		super(props)
			this.update = this.update.bind(this)
		this.setLEDs = this.setLEDs.bind(this)
	
	}
	update (a,b) {
		this.refs.ta.update(a)
		this.refs.tb.update(b)
	}
	setLEDs (pa,pb,da,db) {
		this.refs.lb.update(pa,pb,da,db)
	}
	render(){
		return (<div className='statBar'>
			<TickerBox ref='ta' int={true} color='#800080'/>
			<TickerBox ref='tb' int={true} color='#008080'/>
			<LEDBarInt ref='lb'/>
			</div>)
	}
}
	
class MultiBankUnit extends React.Component{
	constructor(props) {
		super(props)
		var dat = []
		if(this.props.data.length >0){
			dat = this.props.data
			////////////console.log(dat)
		}
		this.state =  ({banks:dat})
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
	}
	onRMsg (e,d) {
		// body...
		if(this.refs[d.mac]){
			////////////console.log(d)
			this.refs[d.mac].onRMsg(e,d)
	
		}
	}
	onParamMsg2(e,d){
		if(this.refs[d.mac]){
			//////////////console.log(d)
			this.refs[d.mac].onParamMsg2(e,d)
	
		}
		e = null;
		d = null;

	}
	componentWillReceiveProps (nextProps) {
		this.setState({banks:nextProps.data})
	}
	switchUnit (u) {
		this.props.onSelect(u)
	}
	render (argument) {
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.mac} name={b.name}/>
		})
		return (<div className='multiBankUnit'>
			<div className='nameLabel'>
				<label>{this.props.name}</label></div>
			{banks}</div>)
	

	}
}
class StatBarMB extends React.Component{
	constructor(props) {
		super(props)
		var br = window.matchMedia('(min-width:600px)')
		br.addListener(this.listenToMq)
		var interceptor = this.props.unit.interceptor;//(vdefByMac[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		this.state = ({pn:'',phase_A:9000, phase_B:9000, phasemode_A:0, phasemode_B:0,sens_A:100,sens_B:100, peak_A:0,peak_B:0,br:br, mobile:br.matches, interceptor:interceptor, rejs:2, fault:false, live:false, pled_A:0,dled_A:0,pled_B:0,dled_B:0, rpcResp:false})
		this.update = this.update.bind(this)
		this.updateMeter = this.updateMeter.bind(this)
		this.setLEDSInt = this.setLEDSInt.bind(this)
		this.setLEDS = this.setLEDS.bind(this)
		this.setDyn = this.setDyn.bind(this)
		this.listenToMq = this.listenToMq.bind(this)
		this.setDynInt =this.setDynInt.bind(this);
		this.setProdVars = this.setProdVars.bind(this);
		this.setProdVarsInt = this.setProdVarsInt.bind(this);
		this.onRMsg = this.onRMsg.bind(this)
		this.switchUnit = this.switchUnit.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this)
	}
	listenToMq () {
		this.setState({mobile:this.state.br.matches});
	}
	update (data) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(data)
	}
	setDyn(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults})
		}
	}
	updateMeter (dat) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	setDynInt(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	}
	setProdVars(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	}
	setProdVarsInt(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	}
	setLEDS(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	}
	switchUnit () {
		// body...
		if(this.state.live){
			this.props.onSelect(this.props.unit)	
		}
		
	}
	componentDidMount () {
		// body...
		var self = this;
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		myTimers[this.props.unit.mac] = setInterval(function(){
			if((Date.now()-liveTimer[self.props.unit.mac])>1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet});	
			}
			
		},1000)
			
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.mac]);
	}
	onRMsg (e,d) {
		// body...
		if(d.mac = this.props.unit.mac){
			clearInterval(myTimers[this.props.unit.mac]);
			this.setState({rpcResp:true})	
		}		
		e = null;
		d = null;

	}
	onParamMsg2(e){
		

		var self = this;
   		var res = vdefByMac[this.props.unit.mac]
		var lcd_type = e.type
		var rec = e.rec
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(rec[f] != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(rec['PhaseAngleAuto'],16),rec['Peak'], rec['RejCount'], faultArray)
					this.updateMeter(uintToInt(rec['DetectSignal'],16))
					this.setLEDS(rec['Reject_LED'],rec['Prod_LED'],rec['Prod_HI_LED'])
				}else{
					this.updateMeterInt(uintToInt(rec['DetectSignal_A'],16),uintToInt(rec['DetectSignal_B'],16))
					this.setDynInt(uintToInt(rec['PhaseAngleAuto_A'],16),rec['Peak_A'], rec['RejCount'], faultArray, uintToInt(rec['PhaseAngleAuto_B'],16),rec['Peak_B'], rec['RejCount'], faultArray)
					this.setLEDSInt(rec['Reject_LED_A'],rec['Prod_LED_A'],rec['Prod_HI_LED_A'],rec['Reject_LED_B'],rec['Prod_LED_B'],rec['Prod_HI_LED_B'])
				}
				faultArray = null;
			}
		}
		
		e = null;
		rec = null;
		res = null;

	}
	render(){

		if(!this.state.mobile){
			return this.renderMob();
		}else{
			return this.renderTab();
		}
	
	}
	renderTab () {
		// body...
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
			////////////console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			////////////console.log(klass)
		}
		var list = ['dry','wet','DSA']
		var mtab = (	<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td></tr>
				<tr><td><label>Peak:{this.state.peak_A}</label></td>
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td></tr></tbody></table>
				)
		if(!this.state.interceptor){
				return(
				<div onClick={this.switchUnit} className={klass}>
				<LiveView ref='lv' layout='tab'>
					{mtab}
				</LiveView>
				</div>)	
		}else{
			return(
				<div onClick={this.switchUnit} className={klass}>
				<LiveViewInt ref='lv' layout='tab'>
					{mtab}
				</LiveViewInt>
				</div>)
		}
	

	}
	renderMob () {
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
		}
		if(!this.state.live){
			klass = 'inactive'
		}
		var list = ['dry','wet','DSA']
		var mtab = (	<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>)
		
		if(!this.state.interceptor){
			return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveView ref='lv' layout='mobile'>
				{mtab}
				</LiveView>
			</div>)
		}else{
			return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveViewInt ref='lv' layout='mobile'>
				{mtab}
				</LiveViewInt>
			</div>)
		}
		
	}
}
class SingleUnit extends React.Component{
	constructor(props) {
		super(props)
		// body...
		var mobMqs = [
			window.matchMedia('(min-width:321px)'),
			window.matchMedia('(min-width:376px)'),
			window.matchMedia('(min-width:426px)')
		]
		for(var i = 0; i<3;i++){
			mobMqs[i].addListener(this.listenToMq)
		}
		var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		var interceptor =  this.props.unit.interceptor//(vdefByMac[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		this.state = ({font:font,mq:mobMqs,phasemode_A:0,live:false, fault:false, pn:'', sens_A:0,peak_A:0,rejs_A:0,phase_A:0,pled_A:0,dled_A:0,
			sens_B:0,peak_B:0,rejs_B:0,phase_B:0,pled_B:0,dled_B:0,rpcResp:false, interceptor:interceptor})
		this.onClick = this.onClick.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		this.updateMeter = this.updateMeter.bind(this);
		this.updateMeterInt = this.updateMeterInt.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.onParamMsg2 = this.onParamMsg2.bind(this);
		this.onFault = this.onFault.bind(this);
		this.setProdVars = this.setProdVars.bind(this);
		this.setProdVarsInt = this.setProdVarsInt.bind(this);
		this.setLEDS = this.setLEDS.bind(this);
		this.setDyn = this.setDyn.bind(this);
		this.setLEDSInt = this.setLEDSInt.bind(this);
		this.setDynInt = this.setDynInt.bind(this);
    this.renderNew = this.renderNew.bind(this);
	}
	onClick () {
		if(this.state.live){
			this.props.onSelect(this.props.unit)
	
		}
	}
	listenToMq () {
		// body...
		var mobMqs = this.state.mq
			var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		this.setState({font:font})
	}
	updateMeter (dat) {
		// body...
		liveTimer[this.props.unit.mac] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		//this.refs.lv.update(dat)
	}
	updateMeterInt(a,b){
		liveTimer[this.props.unit.mac] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		//////////////console.log([a,b])
		//this.refs.lv.update(a,b)	
	}
	onRMsg (e,d) {
		clearInterval(myTimers[this.props.unit.mac]);
		this.setState({rpcResp:true})
	}
	onParamMsg2(e){
		var self = this;
		var res = vdefByMac[this.props.unit.mac]
		var lcd_type = e.type
		var rec = e.rec
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				
					
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])	
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(rec[f] != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(rec['PhaseAngleAuto'],16),rec['Peak'], rec['RejCount'], faultArray)
					this.updateMeter(uintToInt(rec['DetectSignal'],16))
					this.setLEDS(rec['Reject_LED'],rec['Prod_LED'],rec['Prod_HI_LED'])
				}else{
					this.updateMeterInt(uintToInt(rec['DetectSignal_A'],16),uintToInt(rec['DetectSignal_B'],16))
					this.setDynInt(uintToInt(rec['PhaseAngleAuto_A'],16),rec['Peak_A'], rec['RejCount'], faultArray, uintToInt(rec['PhaseAngleAuto_B'],16),rec['Peak_B'], rec['RejCount'], faultArray)
					this.setLEDSInt(rec['Reject_LED_A'],rec['Prod_LED_A'],rec['Prod_HI_LED_A'],rec['Reject_LED_B'],rec['Prod_LED_B'],rec['Prod_HI_LED_B'])
				}
				faultArray = null;
			}
		}
		rec = null;
		res = null;
		e = null;
	}
	onFault () {
		//
		this.setState({fault:!this.state.fault})
	}
	componentDidMount () {
		var self = this;
		this._isMounted = true;
		myTimers[this.props.unit.mac] = setInterval(function(){
			//////console.log('4596', self.state.rpcResp)
			if((Date.now() - liveTimer[self.props.unit.mac]) > 1500){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				var packet = dsp_rpc_paylod_for(19,[102,0,0])
				socket.emit('rpc',{ip:self.props.unit.ip, data:packet})
			}
		}, 1500)
	}
	componentWillUnmount () {
		clearInterval(myTimers[this.props.unit.mac]);
	}
	setProdVars(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	}
	setProdVarsInt(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	}
	setLEDS(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
	//	this.refs.lv.setLEDs(pled,det)
	}
	setDyn(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults})
		}
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		//this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	setDynInt(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	}
	render(){
    return this.renderNew()
		var classname = 'multiScanUnit'
		if(!this.state.live){
			classname = 'multiScanUnit inactive'
		}else if(this.state.fault){
			classname = 'multiScanUnit faultactive'
		}
		var st= {fontSize:20};
		if(this.state.font == 2){
			st = {fontSize:20, height:160}
		}else if(this.state.font == 1){
			st = {fontSize:18, height:145}
		}else if(this.state.font == 0){
			st = {fontSize:16, height:145}
		}
		if(this.state.interceptor){
			return this.renderInt(classname, st)
		}else{
			return this.renderST(classname, st)
		}
	}
  renderNew(){
        var lstyle = {height: 65}   
        var width = 655;
        var innerWidth = 465
    var imgStyle = {height: 60, verticalAlign:'middle', marginTop:5}   
    var marL = 20
    var imMar = 15
    var imH = 40
    var font = 24
        var groupStatus = 'grey'
        if(this.state.live){
          groupStatus = 'green'
        }else if(this.state.fault){
          groupStatus = 'red'
        }
        if(this.props.mobile){
          imgStyle.height = 42
          imgStyle.marginTop = 12
          width = '93%'
          innerWidth = '60%'
          marL = 3
          imMar = 10
          imH = 32
          font = 16
        }
        var leds = <React.Fragment>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            </React.Fragment>
        if (groupStatus == 'green')
        {
          leds = <React.Fragment>
              <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_green.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            </React.Fragment>
        }
        else if (groupStatus == 'yellow')
        {
leds = <React.Fragment>
              <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_yellow.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            </React.Fragment>
        }
        else if (groupStatus == 'red')
        {
leds = <React.Fragment>
              <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_grey.png'/></div>
            <div style={{display:'inline-block', height: 70, verticalAlign:'bottom'}}><img style={imgStyle} src='assets/led_circle_red.png'/></div>
            </React.Fragment>
        }
        
          return(
            <div style={{border:'solid #eee 2px', borderRadius:40, padding:8, width:width, marginTop:2, marginBottom:4, marginLeft:marL}}>
            <div style={{borderRadius:25}}>
              <div style={{display:'inline-block', lineHeight:'70px', verticalAlign:'bottom',backgroundColor:'#818a90', borderTopLeftRadius:30,borderBottomLeftRadius:30, width:innerWidth, height:70, verticalAlign:'bottom'}} className="detectorName" onClick={this.onClick}>
              <img src='assets/layer.svg' style={{height:60,width:imH,display:'inline-block',marginRight:imMar, marginLeft:imMar,float:'left'}}/>
              <div style={{display:'inline-block', height:70, verticalAlign:'bottom', fontSize:font}}>{this.props.unit.name}</div></div>
              <div style={{display:'inline-block', borderRadius:23, boxShadow:' -50px 0px 0 0 #818a90', paddingLeft:10, height: 70, verticalAlign:'bottom'}}>
              {leds}
              </div>
              </div>
            </div>)
  }
	renderInt(classname,st){

		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveViewInt st={st} ref = 'lv'>
			<div onClick={this.onClick}>
			<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A+ "  "+ this.state.sens_B}</label></td><td><label style={{paddingLeft:15, display:'none'}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A] 
				+ "  "+ (this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A+ "  "+ this.state.peak_B}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
			</div>
			</LiveViewInt>
			</div>)
	}
	renderST (classname,st) {
		
		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveView st={st} ref='lv'>
			<div  onClick={this.onClick}>
				<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
				</div>
			</LiveView>
		</div>)
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
class MbSetup extends React.Component{
		constructor(props) {
			super(props)
			this.state = ({mode:false})
			this.editMb = this.editMb.bind(this);
			this.remove = this.remove.bind(this);
			this.moveUp = this.moveUp.bind(this);
			this.moveDown = this.moveDown.bind(this);
			this.toggleOptions = this.toggleOptions.bind(this);
		}
		editMb () {
			////////////console.log(this.props.index)
			this.props.edit(this.props.index)
		}
		remove () {
			this.props.remove(this.props.index)
		}
		moveUp () {
			this.props.move(this.props.index,'up')
		}
		moveDown (){
			this.props.move(this.props.index,'down')
		}
		toggleOptions () {
			this.setState({mode:!this.state.mode})
		}
		render () {
			var editRow;
			if(this.state.mode){
				editRow = (<div>
					<button onClick={this.editMb}>Edit</button>
					<button onClick={this.remove}>Remove</button>
					<button onClick={this.moveUp}>move up</button>
					<button onClick={this.moveDown}>move down</button>
					</div>)
			}

        var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
      var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

   
    
      
			return (
         <div className='sItem noChild'>
       <label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Detector Name'}</label>
      <div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.props.mb.name}</label></div></div>
      <img onClick={this.remove} style={{position:'absolute', width:36,top:15, left:815, strokeWidth:'2%', transform:'scaleX(-1)' }} src='assets/trash.svg'/>
      </div>
)	
		}
}

class DetectorView extends React.Component{
	constructor(props) {
		super(props)
		this.mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		this.minMq = window.matchMedia("(min-width: 400px)");
		for (var i=0; i<3; i++){
			this.mqls[i].addListener(this.listenToMq)
		}
		var res = vdefByMac[this.props.det.mac]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		this.landScape = window.matchMedia("(orientation: landscape)");
		this.minMq.addListener(this.listenToMq.bind(this));
		this.landScape.addListener(this.listenToMq.bind(this));
		var interceptor = this.props.det.interceptor//(vdefByMac[this.props.det.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.det.board_id == 5);
		this.state =  {pVdef:pVdef, callback:null, rec:{},offline:true, landScape:this.landScape.matches,showTest:false, warningArray:[],faultArray:[],pind:0,currentView:'MainDisplay', data:[], stack:[],stack2:[],data2:[], pn:'', sens:0, netpoll:this.props.netpolls, 
			prodSettings:{}, sysSettings:{}, combinedSettings:[],cob2:[], pages:{}, showCal:false,userid:0, isUpdating:false, username:'Not Logged In', isSyncing:false,
			minW:this.minMq.matches, br:this.props.br, fault:false, usb:false, usernames:[{username:'ADMIN',acc:4}], broadCast:false,
			peak:0, rej:0, phase:0, interceptor:interceptor, ioBITs:{}, testRec:{},framRec:{}, updateCount:0, language:0,rejOn:0,showSens:false,level:0, trec:0, loginOpen:false}
		this.sendPacket = this.sendPacket.bind(this);
		this.onRMsg = this.onRMsg.bind(this);
		this.toggleAttention = this.toggleAttention.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.listenToMq = this.listenToMq.bind(this);
		this.getCob = this.getCob.bind(this);
		this.getPages = this.getPages.bind(this);
		this.getPage = this.getPage.bind(this);
		this.onParamMsg3 = this.onParamMsg3.bind(this);
		this.setLEDS = this.setLEDS.bind(this);
		this.setLEDSInt = this.setLEDSInt.bind(this);
		this.showSettings = this.showSettings.bind(this);
		this.showSens = this.showSens.bind(this);
		this.showTestModal = this.showTestModal.bind(this);
		this.logoClick = this.logoClick.bind(this);
		this.changeView = this.changeView.bind(this);
		this.settingClick = this.settingClick.bind(this);
		this.goBack = this.goBack.bind(this);
		this.clear = this.clear.bind(this);
		this.settingsClosed = this.settingsClosed.bind(this);
		this.onCalFocus = this.onCalFocus.bind(this);
		this.onCalClose = this.onCalClose.bind(this);
		this.clearSig = this.clearSig.bind(this);
		this.setOverride = this.setOverride.bind(this);
		this.setTOverride = this.setTOverride.bind(this);
		this.setCOverride = this.setCOverride.bind(this);
		this.setSOverride = this.setSOverride.bind(this);
		this.toggleTestSettings = this.toggleTestSettings.bind(this);
		this.toggleCalSettings = this.toggleCalSettings.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.setLanguage = this.setLanguage.bind(this);
		this.showCalibModal = this.showCalibModal.bind(this);
		this.clearFaults = this.clearFaults.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.sendOp = this.sendOp.bind(this);
		this.sendAck = this.sendAck.bind(this);
		this.quitTest = this.quitTest.bind(this);
		this.calClosed = this.calClosed.bind(this);
		this.tmClosed = this.tmClosed.bind(this);
		this.snmClosed = this.snmClosed.bind(this);
		this.showTestRModal = this.showTestRModal.bind(this);
		this.getTestText = this.getTestText.bind(this);
		this.onSens = this.onSens.bind(this);
		this.toggleSensSettings = this.toggleSensSettings.bind(this);
		this.toggleLogin = this.toggleLogin.bind(this);
		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.authenticate = this.authenticate.bind(this);
		this.setAuthAccount = this.setAuthAccount.bind(this);
		this.syncPrompt = this.syncPrompt.bind(this);
		this.startSync = this.startSync.bind(this);
		this.startUpdate = this.startUpdate.bind(this);
		this.cancelSync = this.cancelSync.bind(this);
		this.loginClosed = this.loginClosed.bind(this);
		this.renderAccounts = this.renderAccounts.bind(this);
	}
	componentDidMount(){
		var self = this;
		ifvisible.setIdleDuration(300);
		ifvisible.on("idle", function(){
			if(self.refs.im){
				self.refs.im.pauseGraph()
			}
			self.logout()
		});
		ifvisible.on('wakeup', function(){
			if(self.refs.im){
				self.refs.im.restart()
			}
		})
		ifvisible.onEvery(5,function(){
			//send keepalive
			if(self.state.userid != 0){
				if(ifvisible.getIdleInfo().timeLeft > 294899){		
					self.setAuthAccount({level:self.state.level, username:self.state.username, user:self.state.userid - 1});
				}
			}
		});

		this._isMounted = true;
		myTimers[this.props.det.mac] = setInterval(function(){
			if((Date.now() - liveTimer[self.props.det.mac]) > 1500){
				if(!self.state.isUpdating){
					if(self.state.broadCast){
						socket.emit('locateReq')
						self.setState({broadCast:false, offline:true, update:true});
					}else{
						socket.emit('locateUnicast', self.props.det.ip)
						self.setState({broadCast:true,offline:true, update:true});
					}
				}		
			}else{
				self.setState({broadCast:false, update:false})
			}
		},1500)
		socket.on('usbdetect',function(){
			self.setState({usb:true,update:true})
			self.syncPrompt()	
		})
		socket.on('usbdetach',function(){
			self.setState({usb:false,update:true})
		})
		socket.on('doneUpdate',function(){
			self.setState({isUpdating:false, update:true})
		})
		socket.on('startUpdate',function(){
			self.setState({isUpdating:true, update:true})
		})
		socket.on('doneSync',function(){
			self.setState({isSyncing:false, update:true})
		})
		socket.on('startSync',function(){
			self.setState({isSyncing:true, update:true})
		})
	}
	componentWillUnmount () {
		ifvisible.off('idle');
		ifvisible.off('wakeup')
		ifvisible.onEvery().stop();
		clearInterval(myTimers[this.props.det.mac]);
	}
	syncPrompt(){
		this.refs.syncModal.toggle();
	}
	startSync(){
		socket.emit('syncStart', this.props.det)
		this.setState({isSyncing:true, update:true})
		this.refs.syncModal.close();
	}
	startUpdate(){
		socket.emit('startUpdate', this.props.det)
		this.setState({isUpdating:true, update:true})
		this.refs.syncModal.close();
	}
	cancelSync(){
		this.refs.syncModal.close();
	}

	componentWillReceiveProps (newProps) {
	
		var rec = this.state.framRec;
		rec['Nif_gw'] = newProps.nifgw;
		rec['Nif_nm'] = newProps.nifnm;
		rec['Nif_ip'] = newProps.nifip;
		//rec['Disp_Ver'] = newProps.dispVer;
	//	////console.log(4954, rec)
		var cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, this.state.rec, rec)

		this.setState({netpoll:newProps.netpolls, framRec:rec,cob2:cob2, update:true})
	}
	setAuthAccount(pack){
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_RPC_USERLOGIN']
		var pkt = rpc[1].map(function (r) {
			if(!isNaN(r)){
				return r
			}else{
				return pack.user
			}
		});
		var packet = dsp_rpc_paylod_for(rpc[0],pkt);
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		if(this.state.userid != pack.user+1){
			this.setState({level:pack.level, username:pack.username, update:true, userid:pack.user+1})
		}		
		
	}
	logout(){
		this.refs.fModal.close();
		this.refs.tModal.close();
		this.refs.teModal.close();
		this.refs.sModal.close();
		this.refs.snModal.close();
		this.refs.calibModal.close();
		this.refs.im.refs.pedit.close();
		this.refs.im.refs.netpolls.close();		
		if(this.state.level != 0){

			toast("Logged out")
			var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_RPC_USERLOGOUT']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			this.setState({level:0, userid:0, username:'Not Logged In',update:true})

		}
	}
	toggleAttention () {
		this.refs.fModal.toggle();
	}
	onRMsg (e,d) {
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
		if(data[1] == 18){
			var prodbits = data.slice(3)
			var dat = []
			for(var i = 0; i < 99; i++){
			if(prodbits[i] ==2){
					dat.push(i+1)
				}
			}
			if(this.refs.im){
				this.refs.im.setProdList(dat)
				
			}

		}else if(data[1] == 24){
			if(this.state.callback){
				this.state.callback(data, this.state.pind)
			}
		}
		
		e = null;
		msg = null;
		data = null;
		dat = null;
		prodbits = null;
	}
	onNetpoll(e,d){
		if(this.props.det.ip != d.ip){
			return;	
		}
		var nps = this.state.netpoll
		if(nps.length == 15){
			nps.splice(1,-1);
		}
		nps.unshift(e);
		this.setState({netpoll:nps, update:true})
	}
	listenToMq () {
		var landscape = window.matchMedia('(orientation: landscape)');
		var minMq = window.matchMedia("(min-width: 400px)");
		this.setState({minW:minMq.matches, landScape:landscape.matches, update:true})	
	}
	getCob (sys,prod,dyn, fram) {
    var int = false
    if(this.props.det.interceptor){
      int = true
    }
		var vdef = vdefByMac[this.props.det.mac]
		var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
		var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram, int)
		vdef = null;
		_cvdf = null;
		return cob
	}
	getPages (sys,prod,dyn, fram) {
		 var int = false
    if(this.props.det.interceptor){
      int = true
    }
    var vdef = vdefByMac[this.props.det.mac]
		var _pages = JSON.parse(JSON.stringify(vdef[6]))
		var pages = {}
		for(var pg in _pages){
			pages[pg] = iterateCats2(_pages[pg], vdef[1],sys,prod, vdef[5],dyn, fram,int)
		}
		vdef = null;
		_pages = null;
		return pages
	}
	getPage (pg,sys,prod,dyn, fram) {
		// body...
     var int = false
    if(this.props.det.interceptor){
      int = true
    }
		var vdef = vdefByMac[this.props.det.mac]
		var _page = JSON.parse(JSON.stringify(vdef[6][pg]))
		var page = {}
		page = iterateCats2(_page, vdef[1],sys,prod, vdef[5],dyn, fram, int)
	
		vdef = null;
		_page = null;
		return page
	}
	onParamMsg3 (e,d) {
		//////console.log('on Param Msg 3',d)
		if(this.props.det.ip != d.ip){
			return;
		}
		var sysSettings =  null;//this.state.sysSettings;
		var prodSettings = null;//this.state.prodSettings;
		var combinedSettings = null;
		var self = this;
   		var lcd_type = e.type;
   		liveTimer[this.props.det.mac] = Date.now();
		if(this.state.offline){
			this.setState({offline:false, update:true})
		}
  	    if(lcd_type== 0){
 			////////console.log('sys')
			if(vdefByMac[d.mac]){
				var sysSettings = e.rec
    			var pages;// = {}
    			var cob2;// = iterateCats(_cvdf[0], pVdef, sysRec, this.state.prodSettings, _vmap, this.state.rec)
   
    				if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, this.state.prodSettings)	
					}
					
					if(this.refs.im){
						this.refs.im.parseInfo(sysSettings, this.state.prodSettings)
					}	
				if(isDiff(sysSettings,this.state.sysSettings)){
					cob2 = this.getCob(sysSettings, this.state.prodSettings, this.state.rec, this.state.framRec);
					pages = this.getPages(sysSettings, this.state.prodSettings, this.state.rec, this.state.framRec);
					//var langs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
					var lang = sysSettings['Language']
					this.setState({sysSettings:sysSettings,cob2:cob2, pages:pages, updateCount:0,update:true,language:lang})
				}
			
    		}  
    		sysSettings = null;
		}else if(lcd_type == 1){
			if(vdefByMac[d.mac]){
				var prodRec = e.rec;
        if(this.state.interceptor){
				  var dccoeffA = prodRec['DcCoeffNorm_A']
    			var dccoeffB = prodRec['DcCoeffNorm_B']
    			var dcrateA = 2
    			var dcrateB = 2
    			if(dccoeffA<50){
    				dcrateA = 3;
    			}else if(dccoeffA<500){
    				dcrateA = 2;
    			}else if(dccoeffA< 5000){
    				dcrateA = 1
    			}else{
    				dcrateA = 0
    			}
    			if(dccoeffB<50){
    				dcrateB = 3;
    			}else if(dccoeffB < 500){
    				dcrateB = 2;
    			}else if(dccoeffB < 5000){
    				dcrateB = 1
    			}else{
    				dcrateB = 0
    			}
    			prodRec['DCRate_A'] = dcrateA;
    			prodRec['DCRate_B'] = dcrateB;
        }else{
          var dccoeff = prodRec['DcCoeffNorm'];
          var dcrate = 2 
          if(dccoeff<50){
            dcrate = 3;
          }else if(dccoeff<500){
            dcrate = 2;
          }else if(dccoeff< 5000){
            dcrate = 1
          }else{
            dcrate = 0
          }
          prodRec['DCRate'] = dcrate;
        }
				var cob2;// = iterateCats(_cvdf[0], pVdef, this.state.sysSettings, prodSettings, _vmap, this.state.rec)
    			var pages;// = {}    		
					if(this.refs.sd){
						this.refs.sd.parseInfo(this.state.sysSettings, prodRec)	
					}
					if(this.refs.im){
						this.refs.im.parseInfo(this.state.sysSettings, prodRec)
					}
				if(isDiff(prodRec,this.state.prodSettings)){
					cob2 = this.getCob(this.state.sysSettings, prodRec, this.state.rec, this.state.framRec)
					pages = this.getPages(this.state.sysSettings, prodRec, this.state.rec, this.state.framRec)
					this.setState({prodSettings:prodRec, cob2:cob2, pages:pages, updateCount:0,update:true})
				}
			}	
		}else if(lcd_type==2){
			if(vdefByMac[d.mac])
			{
					var pVdef = vdefByMac[d.mac][1]
					var rejOn = 0
					var shouldUpdate = false
  					var pauseGraph = false;
					var prodRec = e.rec
					var iobits = {}
					if(_ioBits){
	   						_ioBits.forEach(function(b){
    							if(typeof prodRec[b] != 'undefined'){
    								iobits[b] = prodRec[b]
    							}
    						})
    						if(isDiff(iobits,this.state.ioBITs)){
    							shouldUpdate = true;
    						}
    					}

    					  	var faultArray = [];
				  	var warningArray = [];
					pVdef[7].forEach(function(f){
					if(prodRec[f] != 0){
						faultArray.push(f)
							if(self.state.prodSettings[f+'Warn'] == 1){
								warningArray.push(f)
							}
						}
					});
					
  					if(this.state.faultArray.length != faultArray.length){
  						shouldUpdate = true;
  					}else if(this.state.rejOn != rejOn){
  						shouldUpdate = true
  					}else if(this.state.warningArray.length != warningArray.length){
  						shouldUpdate = true;
  					}else{
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								shouldUpdate = true;
  							}
  						})
  						warningArray.forEach(function (w) {
  							// body...
  							if(self.state.warningArray.indexOf(w) == -1){
  								shouldUpdate = true;
  							}
  						})
  					}
  					if(this.state.updateCount == 6){
  						if((this.refs.sModal.state.show && !this.refs.sModal.state.keyboardVisible) || (this.refs.snModal.state.show && !this.refs.snModal.state.keyboardVisible)
  							|| (this.refs.teModal.state.show && !this.refs.teModal.state.keyboardVisible)|| (this.refs.calibModal.state.show && this.state.showCal && !this.refs.calibModal.state.keyboardVisible)){
  								shouldUpdate = true
  						}
  					}
  						if(this.refs.sModal.state.show && this.refs.sModal.state.keyboardVisible){
  							shouldUpdate = false;
  						}	
    				
    				var pk = prodRec['Peak']
					var sig =uintToInt(prodRec['DetectSignal'],16)
					var rej = prodRec['RejCount']
						rejOn = prodRec['LS_YEL'] || prodRec['LS_BUZ'];
					 
              this.refs.sModal.updateMeter(sig)
              this.refs.sModal.updateSig(pk)
              this.refs.snModal.updateMeter(sig)
              this.refs.snModal.updateSig(pk)
              this.refs.calibModal.updateMeter(sig)
              this.refs.calibModal.updateSig(pk)
              this.refs.teModal.updateMeter(sig)
              this.refs.teModal.updateSig(pk)
              this.refs.tModal.updateMeter(sig)
              this.refs.tModal.updateSig(pk)
              this.refs.loginModal.updateMeter(sig)
              this.refs.loginModal.updateSig(pk)
    				if(this.state.rec['DateTime'] != prodRec['DateTime']){
    					this.refs.im.setDT(prodRec['DateTime'])
    				}
    				if(this.state.interceptor){
      				var pka = prodRec['Peak_A'];
  						var pkb = prodRec['Peak_B'];
  						var siga = uintToInt(prodRec['DetectSignal_A'],16)
  						var sigb = uintToInt(prodRec['DetectSignal_B'],16)
  						var phaseA = (uintToInt(prodRec['PhaseAngleAuto_A'],16)/100).toFixed(2)
  						var phaseB = (uintToInt(prodRec['PhaseAngleAuto_B'],16)/100).toFixed(2)
  						var phaseSpeedA = prodRec['PhaseFastBit_A']
  						var phaseSpeedB = prodRec['PhaseFastBit_B']
  						var rpka = prodRec['ProdPeakR_A']
  						var xpka = prodRec['ProdPeakX_A']
  						var rpkb = prodRec['ProdPeakR_B']
  						var xpkb = prodRec['ProdPeakX_B']
  						var sensCalA = prodRec['LearningSensBit_A']
  						var sensCalB = prodRec['LearningSensBit_B']
  						var det_power_a = this.state.prodSettings['OscPower_A'];
  						var det_power_b = this.state.prodSettings['OscPower_B']
  						var phaseWet = prodRec['PhaseWetBit_A']
  						var phaseWetB = prodRec['PhaseWetBit_B']
  						var prod_a = prodRec['Prod_LED_A'];
  						var pled_a = 0
  						if(prodRec['Prod_HI_LED_A'] == 1){
  							pled_a = 2
  						}else if(prodRec['Prod_LED_A'] == 1){
  							pled_a = 1
  						}
  						var pled_b = 0
  						if(prodRec['Prod_HI_LED_B'] == 1){
  							pled_b = 2
  						}else if(prodRec['Prod_LED_B'] == 1){
  							pled_b = 1
  						}
						
  						
							if(this.refs.dfs){
  							this.refs.dfs.setPeaks(pka,pkb,pk)
  						}
  						if((this.refs.im.state.rpeak != rpka)||(this.refs.im.state.xpeak != xpka)||(this.refs.im.state.rej != rej)
  							||(this.refs.im.state.phase != phaseA)||(this.refs.im.state.rpeakb != rpkb)||(this.refs.im.state.xpeakb != xpkb)
  							||(this.refs.im.state.phaseb != phaseB)||(this.refs.im.state.phaseFast != phaseSpeedA)||(this.refs.im.state.phaseFastB != phaseSpeedB)||(this.refs.im.state.pled_a !=pled_a)||(this.refs.im.state.pled_b !=pled_b)){
  							this.refs.im.setState({rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB, pled_a:pled_a, pled_b:pled_b})		
  						}
  						if(this.refs.cb){
  							 if((this.refs.cb.state.sensCalA != sensCalA)||(this.refs.cb.state.sensCalB != sensCalB)||(this.refs.cb.state.sensA != this.state.prodSettings['Sens_A'])||(this.refs.cb.state.sensB != this.state.prodSettings['Sens_B'])||(this.refs.cb.state.rpeak != rpka)||(this.refs.cb.state.xpeak != xpka)||(this.refs.cb.state.phase != phaseA)||(this.refs.cb.state.rpeakb != rpkb)||(this.refs.cb.state.xpeakb != xpkb)|| (this.refs.cb.state.det_power_b != det_power_b) || (this.refs.cb.state.det_power_a != det_power_a) 
  							 ||(this.refs.cb.state.phaseb != phaseB)||(this.refs.cb.state.phaseSpeed != phaseSpeedA)||(this.refs.cb.state.phaseSpeedB != phaseSpeedB)||(this.refs.cb.state.phaseMode != phaseWet) || (this.refs.cb.state.phaseModeB != phaseWetB)){//||(this.refs.cb.state.pled_a != pled_a)||(this.refs.cb.state.pled_b != pled_b)){
  								this.refs.cb.setState({sensA:this.state.prodSettings['Sens_A'],sensB:this.state.prodSettings['Sens_B'],rpeak:rpka, xpeak:xpka,sensCalA:sensCalA,sensCalB:sensCalB, phase:phaseA, rpeakb:rpkb, xpeakb:xpkb, phaseb:phaseB,phaseSpeed:phaseSpeedA,phaseSpeedB:phaseSpeedB,phaseMode:phaseWet, phaseModeB:phaseWetB, det_power_a:det_power_a, det_power_b:det_power_b})
  							 }

							   this.refs.cb.setPleds(pled_a, pled_b)
						  }

						  this.refs.im.update(sig,siga,sigb)
						  this.refs.im.updatePeak(pk,pka,pkb)
  						pka = null;
  						pkb = null;
  						siga = null;
  						sigb = null;
  						phaseA = null;
  						phaseB = null;
  						phaseSpeedA = null;
  						phaseSpeedB = null;
  						rpka = null;
  						xpkb = null;
  						rej = null;

					}else{
						var phase = (uintToInt(prodRec['PhaseAngleAuto'],16)/100).toFixed(2)
						var phaseSpeed = prodRec['PhaseFastBit'];
						var rpeak = prodRec['ProdPeakR']
						var xpeak = prodRec['ProdPeakX']
            var sensCal = prodRec['LearningSensBit']
            var det_power = this.state.prodSettings['OscPower']
            var phaseWet = prodRec['PhaseWetBit']  
            var pled = 0
            if(prodRec['Prod_HI_LED'] == 1){
              pled = 2
            }else if(prodRec['Prod_LED'] == 1){
              pled = 1
            }

						if((this.refs.im.state.peak !=pk)||(this.refs.im.state.rpeak != rpeak)||(this.refs.im.state.xpeak != xpeak)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phase)||(this.refs.im.state.phaseFast != phaseSpeed)||(this.refs.im.state.pled_a != pled)){
							this.refs.im.setState({peak:pk,rpeak:rpeak,xpeak:xpeak,rej:rej,phase:phase,phaseFast:phaseSpeed, pled_a:pled})		
						}
						if(this.refs.cb){
                 if((this.refs.cb.state.sensCalA != sensCal)||(this.refs.cb.state.sensA != this.state.prodSettings['Sens'])||(this.refs.cb.state.rpeak != rpeak)||(this.refs.cb.state.xpeak != xpeak)||(this.refs.cb.state.phase != phase)||(this.refs.cb.state.det_power_a != det_power) 
                 ||(this.refs.cb.state.phaseSpeed != phaseSpeedA)||(this.refs.cb.state.phaseMode != phaseWet)){//||(this.refs.cb.state.pled_a != pled_a)||(this.refs.cb.state.pled_b != pled_b)){
                  this.refs.cb.setState({sensA:this.state.prodSettings['Sens'],rpeak:rpeak, xpeak:xpeak,sensCalA:sensCal, phase:phase, phaseSpeed:phaseSpeed,phaseMode:phaseWet,det_power_a:det_power})
                 }

                 this.refs.cb.setPleds(pled)
              }

						if(this.refs.dfs){
                this.refs.dfs.setPeaks(pk)
              }
						this.refs.im.update(sig)
            this.refs.im.updatePeak(pk)
						pk = null;
						sig = null;
						phase = null;
						phaseSpeed = null;
						rpeak = null;
						xpeak = null;
					}
					
  					var trec = 0;	

  					if(this.state.testRec['TestRecOnFlag']){
						trec = 1
						if(this.state.testRec['TestRecPage'] == 3){
							trec = 2
						}
						if(this.state.testRec['TestRecPage'] == 2){
							trec = 2
						}
					}
  					if(this.props.kraft){
  						if(this.state.rec['CIP_PLC'] != prodRec['CIP_PLC']){
  							this.refs.im.cip_plc(prodRec['CIP_PLC'])
  						}
  						if(this.state.rec['IsoCleanTimeoutSec'] != prodRec['IsoCleanTimeoutSec']){
  							this.refs.im.cip_test(prodRec['IsoCleanTimeoutSec'])
  						}
  						if(prodRec['CIP_PLC'] || (prodRec['IsoCleanTimeoutSec'])){
  							trec = 0;
  						}
  					}else{
  						if(this.state.rec['CIP'] != prodRec['CIP']){
  							this.refs.im.cip_plc(prodRec['CIP'])
  						}
  						if(prodRec['CIP']){
  							trec = 0;
  						}
  					}
  					
  					if(this.state.trec != trec){
  						shouldUpdate = true;
  					}

  						if(shouldUpdate){
  							if(this.refs.sModal.state.show){
  								var	cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, prodRec, this.state.framRec)
  								this.setState({rec:prodRec,faultArray:faultArray,warningArray:warningArray,trec:trec, cob2:cob2, rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								cob2 = null;
  							}else if(this.refs.snModal.state.show){
  								var	sns = this.getPage('Sens',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Sens'] = sns
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec, rejOn:rejOn,updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								sns = null;
  								pages = null;

  							}else if(this.refs.teModal.state.show){
  								var	te = this.getPage('Test',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Test'] = te
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec,rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								te = null;
  								pages = null;
  							}else if(this.state.showCal){
  								//////////console.log(['3878',prodRec['PhaseAngleAuto_B']])
  								var	cal = this.getPage('Calibration',this.state.sysSettings,this.state.prodSettings, prodRec, this.state.framRec)
  								var pages = this.state.pages;
  								pages['Calibration'] = cal
  								this.setState({rec:prodRec, pages:pages,faultArray:faultArray,warningArray:warningArray,trec:trec, rejOn:rejOn, updateCount:0,update:shouldUpdate, ioBITs:iobits})
  								cal = null;
  								pages = null;
  							}else{
  								this.setState({rec:prodRec,faultArray:faultArray,warningArray:warningArray, rejOn:rejOn,trec:trec, updateCount:0, update:shouldUpdate, ioBITs:iobits})
  							}
  						}else{
  							this.state.rec = prodRec,
  							this.state.ioBITs = iobits
  							this.state.updateCount = (this.state.updateCount+1)%7
  						}
  						faultArray = null;
  						warningArray = null;
			}
			
			pVdef = null;
			iobits = null;

   		}else if(lcd_type == 3){
   			
			var framRec = e.rec
			framRec['Nif_ip'] = this.props.nifip //this.props.nif.ip
			framRec['Nif_nm'] = this.props.nifnm
			framRec['Nif_gw'] = this.props.nifgw
			if(isDiff(framRec, this.state.framRec)){
				var cob2 = this.getCob(this.state.sysSettings, this.state.prodSettings, this.state.rec, framRec)
				this.setState({framRec:framRec,cob2:cob2, update:true})
			}
			framRec = null;
		}else if(lcd_type == 4){
   				var testRec = e.rec
				var trec = 0;
				if(testRec['TestRecOnFlag']){
					trec = 1
					if(testRec['TestRecPage'] == 3){
						trec = 2
					}
					if(testRec['TestRecPage'] == 2){
						trec = 2
					}
				}
				if(this.props.kraft){
					if((this.state.rec['CIP_PLC']) || this.state.rec['IsoCleanTimeoutSec'] != 0){
						trec = 0;
					}
				}else{
					if(this.state.rec['CIP']){
						trec = 0;
					}
				}
    			if(isDiff(testRec, this.state.testRec) || this.state.trec != trec){
    				this.setState({testRec:testRec, trec:trec, update:true})
    			}
    		
		
    			testRec = null;

   		}

   		prodRec = null;	
   		faultArray = null;	
   		e = null;
   		d = null;
   		combinedSettings = null;
   		cob2 = null;	
	}
	shouldComponentUpdate (nextProps, nextState) {
		if(nextState.update !== false){
			return true;
		}else{
			return false
		}
	}
	setLEDS(det_a,prod_a,prodhi_a){
			var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a)
	
	}
	setLEDSInt(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	}
	showSettings () {
		var self = this;
		// accessControl
		if((vdefByMac[this.props.det.mac][4][0].acc <= this.state.level)||(this.state.level > 2)||(this.state.sysSettings['PassOn'] == 0)){

		
		this.setState({data:[[this.state.cob2,0]], update:true})
		setTimeout(function () {
				self.refs.im.pauseGraph();
				self.refs.sModal.toggle();
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
		}, 100)
		}
	}
	showSens () {
			var self = this;
		
		// accessControl
		if((this.state.sysSettings['PassAccSens'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

			this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})

			setTimeout(function () {
			// body...
				self.refs.im.pauseGraph();
				self.refs.snModal.toggle()
			}, 100)
		}else{
			//toast('Access Denied')
				setTimeout(function () {
				self.toggleLogin();
		}, 100)
		}
	}
	showTestModal () {
		var self = this;
		// accessControl
		if((this.state.sysSettings['PassAccTest'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

		
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false,showTest:false, update:true});
		}
		else{
			this.setState({settings:true,showTest:false, stack:[], data:[], update:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}
		setTimeout(function () {
			// body...
				self.refs.im.pauseGraph();		
				self.refs.teModal.toggle()
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	
	}
	showTestRModal () {
		var self = this;
		// accessControl
			if((this.state.sysSettings['PassAccTest'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){

		
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false,showTest:false, update:true});
		}
		else{
			this.setState({settings:true,showTest:false, stack:[], data:[], update:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}
		setTimeout(function () {
			// body...

			self.refs.tModal.toggle()
		}, 100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	showCalibModal () {
		var self = this;
	
		// accessControl
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.setState({showCal:false, update:true})
			setTimeout(function (argument) {
				self.refs.im.pauseGraph();
				self.refs.calibModal.toggle();
			
			},100)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	toggleTestSettings () {
		var self = this;
	
		// accessControl
		if((vdefByMac[this.props.det.mac][6]['Test'].acc <= this.state.level)||(this.state.level > 2)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showTest){
				this.setState({showTest:false, data:[], stack:[], update:true})
			}else{
				this.setState({showTest:true, data:[[this.state.pages['Test'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	toggleCalSettings () {
		var self = this;
	
		// accessControl
		if((this.state.level > 3)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showCal){
				this.setState({showCal:false, data:[], stack:[], update:true})
			}else{
				this.setState({showCal:true, data:[[this.state.pages['Calibration'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}

	}
	toggleSensSettings () {
		// accessControl
		var self = this;
		if((this.state.level > 3)||(this.state.sysSettings['PassOn'] == 0)){

			if(this.state.showSens){
				this.setState({showSens:false, data:[], stack:[], update:true})
			}else{
				this.setState({showSens:true, data:[[this.state.pages['Sens'],0]], stack:[], update:true})
			}
		}else{
			//toast("Access Denied")
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	logoClick () {
		this.props.logoClick();
	}
	goBack () {
    var self = this;
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			setTimeout(function(){self.setState({currentView:d[0], data: d[1], stack: stack, settings:(d[0] == 'SettingsDisplay'), update:true });
        self.sendPacket('refresh',0)
    },100);
			
		}
	}
	changeView (d) {
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
		this.setState({currentView:d[0], data:d[1], update:true})
	}
	settingClick (s,n) {
		if((Array.isArray(s))&&(s[0] == 'get_accounts')){
			//console.log('get accounts')
			this.refs.loginModal.toggle();
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
	clear (param) {
		////////console.log(['3277',param])
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
	}	
	sendPacket (n,v) {
		var vdef = vdefByMac[this.props.mac]
		var self = this;
		if(typeof n == 'string'){
			if(n == 'KAPI_REJ_MODE_CLEARLATCH'){
			var rpc = vdef[0]['@rpc_map']['KAPI_REJ_MODE_CLEARLATCH']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
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
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
			}else if(n=='sig_a'){

			}else if(n=='DateTime'){
				var rpc = vdef[0]['@rpc_map']['LOCF_DATE_TIME_WRITE']
	
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],v);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
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
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
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
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
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
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
			}else if(n== 'Sens_A'){
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[1]);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			}else if(n == 'Sens'){
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
			////////////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'Sens_B'){
			////////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_SENS_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'SigModeCombined'){
			////////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_SIG_MODE_COMBINED_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'oscPower'){
			var rpc = vdef[0]['@rpc_map']['KAPI_OSC_POWER_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
			////////////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[1]);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'oscPowerB'){
			////////////console.log(this.props.ip)
			var rpc = vdef[0]['@rpc_map']['KAPI_OSC_POWER_WRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0]);
			////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
			
		}else if(n == 'ProdNo'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NO_APIWRITE']
			var pkt = rpc[1].map(function (r) {
				// body...
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
					////////////console.log(packet)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n == 'ProdName'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NAME_APIWRITE']
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
			var str = (v + "                    ").slice(0,20)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,str);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		
		}else if(n == 'cal'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CALIBRATE']
			
			var packet = dsp_rpc_paylod_for(rpc[0], [rpc[1][0],1],v)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n == 'getProdList'){
			this.setState({pind:0})
			var self = this;
			setTimeout(function () {
				// body...
				var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEF_FLAGS_READ']
				var pkt = rpc[1].map(function (r) {
				// body...
					if(!isNaN(r)){
						return r
					}else{
						return 0	
				}
				})
				var packet = dsp_rpc_paylod_for(rpc[0], pkt)
				socket.emit('rpc', {ip:self.props.ip, data:packet})
			},100)
			
		}else if(n =='getProdName'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_NAME_APIREAD']
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
			var packet = dsp_rpc_paylod_for(rpc[0], pkt)
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n=='refresh'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}else if(n=='rpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='xpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='rpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='xpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[0]);			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		}else if(n=='phaseEdit'){
			var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_ANGLE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(phase)){
						return 0
					}else{
						return parseInt(phase)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt)
			if(this.props.det.interceptor){
				packet = dsp_rpc_paylod_for(rpc[0],pkt,[1])
			}
			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseEditb'){
			var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_ANGLE_WRITE']
			var pkt = rpc[1].map(function (r) {
				if(!isNaN(r)){
					return r
				}else{
					if(isNaN(phase)){
						return 0
					}else{
						return parseInt(phase)
					}
				}
			})
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseMode'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_MODE_WRITE']
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt)
			if(this.props.det.interceptor){
				packet = dsp_rpc_paylod_for(rpc[0],pkt,[1])
			}
			
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='phaseModeb'){
			//var phase = Math.round(parseFloat(v)*100)
			var rpc = vdef[0]['@rpc_map']['KAPI_PHASE_MODE_WRITE']
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
			var packet = dsp_rpc_paylod_for(rpc[0],pkt,[0])
			socket.emit('rpc', {ip:this.props.det.ip, data:packet})
		
		}else if(n=='test'){
			var packet = dsp_rpc_paylod_for(19,[32,v,0]);
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}else if(n=='clearFaults'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARFAULTS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	

		}else if(n=='clearWarnings'){
			////console.log(vdef[0]['@rpc_map'])
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARWARNINGS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	

		}else if(n=='DefaultRestore'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_RESTORE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='DeleteAll'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_DEFAULT_DELETEALL']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='FactorySave'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_SAVE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}else if(n=='FactoryRestore'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_RESTORE']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})
		}
		}else{
		if(n['@rpcs']['toggle']){

			var arg1 = n['@rpcs']['toggle'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
				if(!isNaN(n['@rpcs']['toggle'][1][i])){
					arg2.push(n['@rpcs']['toggle'][1][i])
				}else{
					arg2.push(parseInt(v))
				}
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n['@rpcs']['write']){
			var arg1 = n['@rpcs']['write'][0];
			var arg2 = [];
			var strArg = null;
			for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
				if(!isNaN(n['@rpcs']['write'][1][i])){
					arg2.push(n['@rpcs']['write'][1][i])
				}else if(n['@rpcs']['write'][1][i] == n['@name']){
					if(!isNaN(v)){
						arg2.push(v)
					}
					else{
						arg2.push(0)
						strArg=v
					}
				}else{
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
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			socket.emit('rpc', {ip:this.props.ip, data:packet})
		}else if(n['@rpcs']['clear']){
			var packet;
			this.clear(n)
		}else if(n['@rpcs']['start']){
			var rpc = n['@rpcs']['start']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			socket.emit('rpc',{ip:this.props.det.ip, data:packet})	
		}
		}
			packet = null;
	}


	settingsClosed () {
		// body...
			var st = [];
			var currentView = 'MainDisplay';
			this.refs.im.restart();
			this.setState({currentView:currentView,data:[], stack:[], settings:false, update:true})

	}
	onCalFocus () { this.refs.calibModal.setState({override:true}) }
	onCalClose () {
		var self = this;
		setTimeout(function () {self.refs.calibModal.setState({override:false})},100)
	}
	clearSig (a) {
		var param = this.state.pVdef[2][a]
		this.clear(param) 
	}
	sendOp (e) {
		// body...
		var num = 0
		if(typeof e == 'number'){
			num = parseInt(e)
		}
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['LOCF_IBOPER_CODE_WRITE']
		var pkt = rpc[1].map(function (v) {
			// body...
			if(isNaN(v)){
				return e;
			}else{
				return v;
			}
		})
		var packet = dsp_rpc_paylod_for(rpc[0],pkt)
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	sendAck(){
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['KAPI_TEST_METAL_TYPE_OK']
		
		var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
	}
	onFocus(){

	}
	onRequestClose(){

	}
	quitTest () {
		// body...
		var rpc = vdefByMac[this.props.mac][0]['@rpc_map']['LOCF_IBTEST_PASS_QUIT']
		var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	getTestText(){
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var cn = this.state.testRec['TestRecConfig']
		var mode = testModes[this.state.testRec['TestRecConfig']]
		var testcount = 3
		var cfs = []
		if(this.props.det.interceptor){
			testcount = 6
		}
		if(this.state.testRec['TestRecPage'] == 3){
			return "Enter Operator Number"
		}
		if(this.state.testRec['TestRecPage'] == 2){
			return "Select Test to run"
		}
		if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0)){
			return "Acknowledge required"
		}else{
			var i = this.state.testRec['TestRecOrder']
			var cnt = this.state.prodSettings['TestConfigCount'+cn+'_'+i]
			var cntString = cnt - this.state.testRec['TestRecPassCnt'] + ' of '+ cnt
			var met = metTypes[this.state.prodSettings['TestConfigMetal'+cn+'_'+i]]
			return cntString + ' Metal Type:' + met
		}
			
	}
	renderTest () {
		// body...
		var testcont = ''
		var ack = ''
		var nograd = {background:'rgba(128, 128, 128, 0.3)', fontSize:25, width:170	}

		var tdstyle = {background:'linear-gradient(135deg, rgba(128, 128, 128, 0.3), transparent 67%)'	}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
		var lg = lgs[this.state.language]
		
		if(this.state.testRec['TestRecOnFlag']){
			if(this.state.testRec['TestRecPage'] == 3){
				//send operator code
				testcont = <div>Test required. Enter operator code
						<div><button onClick={()=> this.refs.op.toggle()}>Enter</button></div>
						 <CustomKeyboard  language={lg} pwd={false} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='op' onChange={this.sendOp} value={''} label={'Operator Code'}/>
	

					</div>

			}else if(this.state.testRec['TestRecPage'] == 2){
				//prompt
					testcont = <TestReq mobile={!this.state.br} ip={this.props.ip} toggle={this.showTestRModal} settings={this.state.prodSettings}/>  

			}else{
				var cn = this.state.testRec['TestRecConfig']
				var mode = testModes[this.state.testRec['TestRecConfig']]
				var testcount = 3
				var cfs = []
				if(this.props.det.interceptor){
					//testcount = 6
				}
				for(var i = 0; i<testcount;i++){
					var cnt = this.state.prodSettings['TestConfigCount'+cn+'_'+i]//config[i]['@children'][1];
					var met = metTypes[this.state.prodSettings['TestConfigMetal'+cn+'_'+i]]
				
					var lab = ''
					if(i == this.state.testRec['TestRecOrder']){

						if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0))
						{
							ack = <button onClick={this.sendAck}>Acknowledge Test</button>
						}else{
							ack = 'Currently Running'
						}
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>{cnt - this.state.testRec['TestRecPassCnt']} of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div><div style={{display:'inline-block', width:300}}>{ack}</div></div>
					}else if(i<this.state.testRec['TestRecOrder']){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(0,128,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>{cnt} of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div><div style={{display:'inline-block', width:300}}>Done</div></div>
					
					}else if(cnt != 0){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,128,128,0.4))',fontSize:25}}><div style={{display:'inline-block', width:100}}>0 of {cnt}
						</div><div style={{display:'inline-block', width:200}}>{met}</div><div style={{display:'inline-block', width:300}}></div></div>
					
					}
					cfs.push(lab)
				}
				testcont = <div>
					<div>Test - {mode}</div>
					<div><div>
					{cfs}
					</div></div>
				</div>

				
			}
		}

		var testprompt = (<div style={{color:'#e1e1e1'}}>{testcont}<div><button onClick={this.quitTest}>Quit Test</button></div></div>)
		return testprompt
	}
	setOverride (ov) {
		this.refs.sModal.setState({keyboardVisible:ov})
	}
	setTOverride (ov) {
		this.refs.teModal.setState({keyboardVisible:ov})
	}
	setCOverride (ov) {
		this.refs.calibModal.setState({keyboardVisible:ov})
	}
	setSOverride (ov) {
		this.refs.snModal.setState({keyboardVisible:ov})
	}
	
	getProdName (n, cb,i) {
		var self = this;
		this.setState({callback:cb, pind:i})
		setTimeout(function () {
			self.sendPacket('getProdName',n)
		},50)
	}
	clearFaults () {
		// accessControl
		var self = this;
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.sendPacket('clearFaults',0)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	clearWarnings () {
		// accessControl
		var self = this;
		if((this.state.sysSettings['PassAccCal'] <= this.state.level)||(this.state.sysSettings['PassOn'] == 0)||(this.state.level > 2)){
			this.sendPacket('clearWarnings',0)
		}else{
			//toast('Access Denied')
			setTimeout(function () {
				self.toggleLogin();
			}, 100)
		}
	}
	calClosed () {
		this.refs.im.restart();
		this.setState({showCal:false, update:true})
	}
	snmClosed () {
		this.refs.im.restart();
		this.setState({showSens:false, update:true})
	}
	tmClosed () {
		this.refs.im.restart();
		this.setState({showTest:false, update:true})
	}
	
	calB () {
		this.sendPacket('cal',[0])
	}
	calA () {
		this.sendPacket('cal',[1])
	}
	cal () {
		this.sendPacket('cal')
	}
	onSens(s,c){
		this.sendPacket(c,s)
	}
	setLanguage (i) {
		var langs = ['english', 'korean']
		this.setState({language:i, update:true})
	} 
	toggleLogin(){
		//this.refs.loginModal.toggle()
		this.refs.lgctrl.login();
		this.setState({loginOpen:true})
	}
	login(v){
		this.setState({level:v,update:true})
	}
	loginClosed(){
		this.setState({loginOpen:false, update:true})
	}
	authenticate(user,pswd){
		socket.emit('authenticate',{user:parseInt(user) - 1,pswd:pswd, ip:this.props.det.ip})
	}
	renderAccounts(){
		var actrl = <AccountControl level={this.state.level} accounts={this.state.accounts} ip={this.props.ip} language={this.props.language} login={this.login} val={this.state.level}/>
			
	}
	render () {
		var attention = 'attention'
		if(this.state.faultArray.length != 0){
			attention = 'attention_clear'
		}
		var config = 'config'
		if(this.state.settings){
			config = 'config_active'
		}
		var find = 'find'
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']
		var lg = lgs[this.state.language]

		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		var df = false;

	//	////////console.log(lg)
		var MD ="";
		var dm = "";// <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm' int={this.state.interceptor}/>
		var dg = "";// <DummyGraph ref='dg' canvasId={'dummyCanvas'} int={this.state.interceptor}/>
		var ce =""// <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'} int={this.state.interceptor}/>
	 	var lstyle = {height: 72,marginRight: 20, marginLeft:10}
	 	var np = (<NetPollView language={lg} ref='np' eventCount={15} events={this.state.netpoll}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15, marginLeft: 10}
		}
		var SD = (<SettingsDisplay2 int={this.props.det.interceptor} usernames={this.state.usernames} mobile={!this.state.br} Id={this.props.ip+'SD'} language={lg} mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} mac={this.props.det.mac} int={this.state.interceptor} cob2={[this.state.cob2]} cvdf={vdefByMac[this.props.det.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} framRec={this.state.framRec} level={this.state.level}/>)
		MD = ""; 
		var mpui// = 	<StealthMainPageUI usb={this.state.usb} mac={this.props.det.mac}  language={this.state.language} setLang={this.setLanguage} toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
		var cb// = <StealthCalibrateUI  mac={this.props.det.mac} language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} />
	
		var lbut = (<td onClick={this.logoClick}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>)
		var abut = (<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>)
		var cbut = (<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>)
		if(!this.state.br){

			if(!this.state.settings){
				MD = (<div><div className='prefInterface'>{dm}</div>
					<div className='prefInterface'>{dg} </div>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
			}	
		}
		//var ov = 0
		var status = ''
		var trec = this.state.trec;
		var tescont = <TestReq mobile={!this.state.br} ip={this.props.ip} toggle={this.showTestModal} settings={this.state.prodSettings}/>
		//var showPropmt = "Settings";
		var showPrompt = "#e1e1e1";
		var showPrompts = "#e1e1e1";
		
		var showPropmt = "#e1e1e1";
		var tbklass = 'expandButton';
		var	df = true;
		var	sensui =  <InterceptorDFSensitivityUI interceptor={this.props.det.interceptor} clearSig={this.clearSig} mobile={!this.state.br} ref='dfs'  mac={this.props.det.mac} language={lg} level={this.state.level} sigmode={this.state.prodSettings['SigModeCombined']} onSigMode={this.sendPacket} sens={this.state.prodSettings['Sens']} sensA={this.state.prodSettings['Sens_A']} sensB={this.state.prodSettings['Sens_B']} onFocus={this.onSensFocus} onRequestClose={this.onSensClose} sendPacket={this.sendPacket} refresh={this.refresh} onSens={this.onSens}/>
	
		var sn = (<div>
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Sensitivity'][lg]['name']}</div></h2></span>
					 </div>{sensui}</div>)
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 int={this.props.det.interceptor} mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'TESTD'} language={lg} setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} 
					cob2={[this.state.pages['Test']]} cvdf={vdefByMac[this.props.det.mac][6]['Test']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} framRec={this.state.framRec}/>
			showPropmt = "orange"
			tbklass='collapseButton'
		}
	
		//	if(this.props.det.interceptor){

				mpui = 	<InterceptorMainPageUI interceptor={this.props.det.interceptor} landScape={this.state.landScape} mobile={!this.state.br} df={df} offline={this.state.offline} isUpdating={this.state.isUpdating} isSyncing={this.state.isSyncing} usb={this.state.usb} mac={this.props.det.mac} login={this.toggleLogin} logout={this.logout} toggleTestRModal={this.showTestRModal} testReq={trec} status={status} rejOn={this.state.rejOn} rejLatch={this.state.prodSettings['RejLatchMode'] || this.state.prodSettings['Rej2Latch']} language={this.state.language} setLang={this.setLanguage}
				 toggleCalib={this.showCalibModal} toggleTestModal={this.showTestModal} faultArray={this.state.faultArray} warningArray={this.state.warningArray} clearFaults={this.clearFaults} clearWarnings={this.clearWarnings} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick}
				  ref='im' getProdName={this.getProdName} level={this.state.level} username={this.state.username} />
				cb = <div>
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Learn'][lg]['name']}</div></h2></span></div>
				<InterceptorCalibrateUI interceptor={this.props.det.interceptor} mobile={!this.state.br} offsetA={uintToInt(this.state.prodSettings['PhaseOffset_A'],16)} offsetB={uintToInt(this.state.prodSettings['PhaseOffset_B'],16)} moa={this.state.prodSettings['MPhaseOrder_A']} mob={this.state.prodSettings['MPhaseOrder_B']} learnComb={this.state.prodSettings['LearnCombined']}  mac={this.props.det.mac} language={lg} ref='cb' onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calibA={this.calA} calibB={this.calB} /></div>
				
			//}
		var testprompt = this.renderTest();
		var CB;
		if(this.state.showCal){
			CB = <SettingsDisplay2 int={this.props.det.interceptor} mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'CALBD'} language={lg} setOverride={this.setCOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'calpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Calibration']]} cvdf={vdefByMac[this.props.det.mac][6]['Calibration']} sendPacket={this.sendPacket} prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} framRec={this.state.framRec}/>
			showPrompt = "orange"
		}else{
			CB = cb
		}
		var snsCont;
		if(this.state.showSens){

			snsCont = <SettingsDisplay2 int={this.props.det.interceptor} mobile={!this.state.br} mac={this.props.det.mac} Id={this.props.ip+'SNSD'} language={lg} setOverride={this.setSOverride} 
			faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} 
			ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} 
			cob2={[this.state.pages['Sens']]} cvdf={vdefByMac[this.props.det.mac][6]['Sens']} sendPacket={this.sendPacket} 
			prodSettings={this.state.prodSettings} sysSettings={this.state.sysSettings} dynSettings={this.state.rec} level={this.state.level} 
			framRec={this.state.framRec}/>
			showPrompts = "orange"
		}else{
			snsCont = sn;
		}
		var gearStyle = {position:'absolute', display:'block', width:460, textAlign:'right', marginLeft:400}
		var inblk = 'inline-block'
		if(!this.state.br){
			gearStyle = {float:'right', display:'block', textAlign:'right', marginLeft:-40}
			inblk = 'none'
		}
		var gear = <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
		var tocal = <div style={gearStyle}><div style={{top:65}}>
		<div onClick={this.toggleCalSettings} style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPrompt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div onClick={this.toggleCalSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompt}>{gear}</svg></div></div>
		</div>		
  		var tosns =  <div style={gearStyle}><div style={{top:65}}>
		<div onClick={this.toggleSensSettings}  style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPrompts}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div onClick={this.toggleSensSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPrompts}>{gear}</svg></div></div>
		</div>	
		var totest = <div style={gearStyle}><div  style={{top:65}}>
		<div onClick={this.toggleTestSettings}  style={{display:inblk, verticalAlign:'top',  paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div  onClick={this.toggleTestSettings} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}>{gear}</svg></div></div>
		</div>		

		var tModal = (	<Modal mobile={!this.state.br} ref='tModal' intMeter={true} dfMeter={df} clear={this.clearSig}>
					{testprompt}
				
				</Modal>)
		if(trec == 0){
			tModal = 	<Modal  mobile={!this.state.br} ref='tModal' override={0} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{testprompt}
				
				</Modal>
		}else if(this.state.testRec['TestRecPage'] == 3){
			tModal = <CustomKeyboard language={lg} pwd={false} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='tModal' onChange={this.sendOp} value={''} label={'Operator Code'}/>
		
		}
	
		return(<div style={{minWidth: 290,userSelect: 'none', maxWidth: 1028,marginLeft: 'auto', marginRight:'auto'}}>
			{mpui}	
			<Modal mobile={!this.state.br} ref ='calibModal' onClose={this.calClosed} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{tocal}
				<div>
				{CB}
				</div>	
			</Modal>
			<Modal mobile={!this.state.br} ref='sModal' onClose={this.settingsClosed} intMeter={true} dfMeter={df} clear={this.clearSig}>
					{SD}
				</Modal>
					<Modal mobile={!this.state.br} ref='fModal'>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
				</Modal>
				{tModal}
				<Modal mobile={!this.state.br} ref='teModal' intMeter={true} clear={this.clearSig} dfMeter={df} onClose={this.tmClosed}>
				{totest}{tescont}
				</Modal>
				<Modal mobile={!this.state.br} ref='snModal' intMeter={true} clear={this.clearSig} dfMeter={df} onClose={this.snmClosed}>
				{tosns}
					<div>
					{snsCont}
					</div>
				</Modal>
				<Modal mobile={!this.state.br} ref='loginModal' onClose={()=>this.loginClosed()} intMeter={true} dfMeter={df} clear={this.clearSig}>
			<AccountControl mobile={!this.state.br} level={this.state.level} accounts={this.state.usernames} ip={this.props.ip} language={lg} login={this.login} val={this.state.level}/>
			
				</Modal>
				<LogInControl2 mobile={!this.state.br}  ref='lgctrl' onRequestClose={this.loginClosed} isOpen={this.state.loginOpen} pass6={this.state.sysSettings['PasswordLength']} level={this.state.level}  mac={this.props.det.mac} ip={this.props.ip} logout={this.logout} accounts={this.state.usernames} authenticate={this.authenticate} language={lg} login={this.login} val={this.state.userid}/>

				<Modal mobile={!this.state.br} ref='syncModal' className='pop-modal' Style={{textAlign:'center', marginTop:40}}>
						<div style={{color:'#e1e1e1'}}>Usb detected. Start sync process?</div>

						<div>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.startUpdate}>Update</button>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:150, borderRadius:20}} onClick={this.startSync}>{vdefMapV2['@labels']['Accept'][lg].name}</button>
						<button style={{height:50, border:'5px solid #808a90', color:'#e1e1e1',background:'#5d5480', width:150, borderRadius:20}} onClick={this.cancelSync}>{vdefMapV2['@labels']['Cancel'][lg].name}</button></div>
	  	
				</Modal>
				</div>)
	} 
}
class InterceptorMainPageUI extends React.Component{
	constructor(props) {
		super(props)
			var res = vdefByMac[this.props.det.mac]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		var tmpA = '';
		var tmpB = '';
		var res = null;

		this.state = ({peditMode:false,lang:0,rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0,curInd:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', 
			prodList:[],prodNames:[], phaseFast:0, phaseFastB:0, pVdef:pVdef, keyboardVisible:false,pled_a:0,pled_b:0, combineMode:0})
		this.keyboardOpen = this.keyboardOpen.bind(this);
		this.keyboardClose = this.keyboardClose.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onButton = this.onButton.bind(this);
		this.clearRej = this.clearRej.bind(this);
		this.switchProd = this.switchProd.bind(this);
		this.clearPeak = this.clearPeak.bind(this);
		this.clearPeakDF = this.clearPeakDF.bind(this);
		this.clearPeakB = this.clearPeakB.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.calibrate = this.calibrate.bind(this);
		this.setTest = this.setTest.bind(this);
		this.updateTmp = this.updateTmp.bind(this);
		this.updateTmpB = this.updateTmpB.bind(this);
		this.submitTmpSns = this.submitTmpSns.bind(this);
		this.submitTmpSnsB = this.submitTmpSnsB.bind(this);
		this.refresh = this.refresh.bind(this);
		this.gohome = this.gohome.bind(this);
		this.calA = this.calA.bind(this);
		this.calB = this.calB.bind(this);
		this.setProdList = this.setProdList.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.prodFocus = this.prodFocus.bind(this);
		this.prodClose = this.prodClose.bind(this);
		this.changeProdEditMode = this.changeProdEditMode.bind(this);
		this.copyCurrentProd = this.copyCurrentProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
		this.languageChange = this.languageChange.bind(this);	
		this.updatePeak = this.updatePeak.bind(this);
		this.clearSig = this.clearSig.bind(this);
		this.handleProdScroll = this.handleProdScroll.bind(this);
		this.deleteCurrentProd = this.deleteCurrentProd.bind(this);
		this.login = this.login.bind(this);
		this.defaultRestore = this.defaultRestore.bind(this);
		this.deleteAll = this.deleteAll.bind(this);
		this.factoryRestore = this.factoryRestore.bind(this);
		this.factorySave = this.factorySave.bind(this);
		this.importUSB = this.importUSB.bind(this);
		this.exportUSB = this.exportUSB.bind(this);
		this.restorUSB = this.restorUSB.bind(this);
		this.backupUSB = this.backupUSB.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this)
		this.cip_plc = this.cip_plc.bind(this);
		this.cip_test = this.cip_test.bind(this);
		this.onDeny = this.onDeny.bind(this);
		this.logout = this.logout.bind(this);
		this.setDT = this.setDT.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
		this.renderProducts = this.renderProducts.bind(this);
		this.renderProductsMobile = this.renderProductsMobile.bind(this);
	}
	shouldComponentUpdate (nextProps, nextState) {
		if(this.state.keyboardVisible){

			if((this.state.prodRec['Sens'] == nextState.prodRec['Sens'])){
				return true;
			}else{
				return false;
			}
			
		}else{
			return true;
		}
	}
	pauseGraph(){
	
			this.refs.nv.pauseGraph();
		
	}
	restart(){
		
			this.refs.nv.restart();
	}
	setDT(dt){
		if(!this.props.mobile){

			this.refs.clock.setDT(dt)
		}
	}
	cip_plc(on){
		//if(this.props.df){
		//	this.refs.dv.setCip(on)
		//}else{
			this.refs.nv.setCip(on)
		//}
		
	}
	cip_test(sec){
	
			this.refs.nv.setCipSec(sec)
			this.refs.dv.setCipSec(sec)
	}
	sendPacket (n,v) {
		this.props.sendPacket(n,v);
	}
	update(df,siga, sigb,ov) {
    var dat;
    if(this.props.interceptor){
      dat = {t:Date.now(),val:siga,valb:sigb, valCom:df}
    }else{
      dat = dat = {t:Date.now(),val:df}
    }
		this.refs.nv.streamTo(dat,ov)
		this.refs.dv.update(df,siga,sigb)
			this.refs.pedit.updateMeter(df,siga,sigb)
			this.refs.netpolls.updateMeter(df,siga,sigb)
	
	}
	updatePeak(df,pa,pb){
		this.refs.dv.updatePeak(df,pa,pb);
		this.refs.pedit.updateSig(df,pa,pb);
		this.refs.netpolls.updateSig(df,pa,pb)
	}
	componentDidMount(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	}
	clearRej () {
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	}
	requestSwitchProd(p){

	}
	switchProd (p) {
		var self = this;
		this.props.sendPacket('ProdNo',p)
		setTimeout(function(){
			self.refs.pedit.close();
		},100)
	}
	clearPeakDF(){
		var p = 'Peak'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	clearPeak () {
		var p = 'Peak_A'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	clearPeakB () {
		var p = 'Peak_B'
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
		param = null;
	}
	calibrate () {
		this.refs.calibModal.toggle()
	}
	parseInfo(sys, prd){
		//if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){

			if(this.props.int){
				////console.log('this should parse it... ')
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens_A'], tmpB:prd['Sens_B']})
			}else{
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
			}
			
		//}
	}
	showEditor () {
		var self = this;
		//7025 this.state.sysRec['PassAccProd'] <= this.props.level
		if((this.state.sysRec['PassAccProd'] <= this.props.level) || (this.state.sysRec['PassOn'] == 0)||(this.props.level > 2)){

			
			this.setState({peditMode:false})
		
			setTimeout(function () {
				//self.setState({peditMode:false})
				self.refs.pedit.toggle()
				socket.emit('getProdList', self.props.det.ip)
			},100)
		}else{
		//	toast('Access Denied')
			setTimeout(function(){
				self.login();
			},)
		}
	}
	editSens () {
		this.refs.sensEdit.toggle()
	}
	setTest () {
		if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				this.toggleTestModal()
			}
			
		}
	}
	toggleTestModal () {
		// body...
		this.refs.testModal.toggle()
	}
	updateTmp (e) {
		if(typeof e == 'string'){
			if(this.props.int){
				this.props.sendPacket(this.state.pVdef[1]['Sens_A'], e)
			}else{
				this.props.sendPacket(this.state.pVdef[1]['Sens'],e)	
			}
			this.setState({tmp:e})
		}else{
			if(this.props.int){
				this.props.sendPacket(this.state.pVdef[1]['Sens_A'], e.target.value)
			}else{
				this.props.sendPacket(this.state.pVdef[1]['Sens'],e.target.value)	
			}
			this.setState({tmp:e.target.value})	
		}
		
	}
	updateTmpB (e) {
		if(typeof e == 'string'){
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e)
			this.setState({tmpB:e})
		}else{
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e.target.value)
			this.setState({tmpB:e.target.value})	
		}
		
	}
	submitTmpSns () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_A', this.state.tmp)
			}else{
				this.props.sendPacket('Sens',this.state.tmp)	
			}
			this.cancel()
		}
	}
	submitTmpSnsB () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_B', this.state.tmpB)
			}else{
				this.props.sendPacket('Sens',this.state.tmpB)	
			}
			this.cancel()
		}
	}
	refresh () {
		this.props.sendPacket('refresh')
	}
	cancel () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	}
	calB () {
		this.props.sendPacket('cal',[0])
	}
	calA () {
		// body...
		this.props.sendPacket('cal',[1])
	}
	_handleKeyPress (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	}
	sensFocus(){
		this.refs.sensEdit.setState({override:true})
	}
	sensClose(){
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	}
	gohome () {
		// body...
		this.props.gohome();
	}
	toggleNetpoll () {
		// body...
		this.refs.netpolls.toggle();
	}
	onButton (f) {
		// body...
		////////console.log(f)
		var self = this;

		if(f == 'test'){
			setTimeout(function () {
				// body...
				self.props.toggleTestModal();
			},100)
			
		}else if(f == 'onTestReq'){
			setTimeout(function () {
				// body...
				self.props.toggleTestRModal();
			},100)
			
		}else if(f == 'log'){
			setTimeout(function () {
			
				self.toggleNetpoll();
			},100)
			
		}else if(f == 'config'){
			setTimeout(function () {
			
				self.props.toggleConfig();
			},100)
		}else if(f == 'prod'){
			setTimeout(function () {
			
				self.showEditor();
			},100)
			//this.showEditor();
		}else if(f == 'cal'){
			//this.calibrate();
			setTimeout(function () {
			
				self.props.toggleCalib();
			},100)
			//this
		}else if(f=='sig_a'){
			this.clearPeak();
		}else if(f=='sig_b'){
			this.clearPeakB();
		}else if(f=='sig'){
			this.clearPeakDF();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			setTimeout(function () {
			
				self.props.toggleSens();
			},100)
		}
	}
	clearRejLatch(){
		//clear rej latch
		this.props.sendPacket('KAPI_REJ_MODE_CLEARLATCH','')
	}
	clearSig(a){
		if(a == 1){
			this.clearPeak()
		}else{
			this.clearPeakB()
		}

	}
	onSens (e,s) {
		this.props.sendPacket(s,e);
	}
	setProdList (prodList) {
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)
			self.handleProdScroll();
		},100)
	}
	getProdName (p,cb,i) {
		this.props.getProdName(p,cb,i)
	}
	setProdName (name, ind) {
		var sa = []
		name.slice(3,23).forEach(function (i) {
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}

	}
	prodFocus(){
		this.refs.pedit.setState({override:true})
	}
	prodClose(){
		var self = this;
		this.setState({peditMode:false})
		setTimeout(function(){

			self.refs.pedit.setState({override:false})	
		}, 100)
	}
	changeProdEditMode () {
		// accessControl
		if((this.props.level > 2)||(this.state.sysRec['PassOn'] == 0)){

			this.setState({peditMode:!this.state.peditMode})
		}else{
			toast("Access Denied")
		}
	}
	copyCurrentProd () {
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
			setTimeout(function(){
				self.handleProdScroll();
			},400)
		},100)
	}
	deleteProd (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	editName (name) {
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	factorySave(){
		this.sendPacket('FactorySave')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}

	factoryRestore(){
		this.sendPacket('FactoryRestore')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	deleteAll(){
		this.sendPacket('DeleteAll')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)	
	}
	defaultRestore(){
		this.sendPacket('DefaultRestore')
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	importUSB(){
		socket.emit('import',this.props.det)
		this.refs.pedit.close();
	}
	exportUSB(){
		socket.emit('export', this.props.det)
	}
	backupUSB(){
		socket.emit('backup',this.props.det)
	}
	restorUSB(){
		socket.emit('restore', this.props.det)
		this.refs.pedit.close();
	}
	onCalFocus () {
		this.refs.calibModal.setState({override:true})
	}
	onCalClose () {
		var self = this;
		setTimeout(function () {
				self.refs.calibModal.setState({override:false})
		},100)
	
	}
	keyboardOpen () {
		this.setState({keyboardVisible:true})
	}
	keyboardClose () {
		this.setState({keyboardVisible:false})
	}
	languageChange (i) {
		this.props.setLang(i)
	}
	handleProdScroll(){
		////console.log('handleProdScroll')
		 var el = document.getElementById("prodList")		
     	 if(el){
			if(el.scrollTop > 5){
				this.refs.arrowTop.show();
			}else{
				this.refs.arrowTop.hide();
			}
			if(el.scrollTop + el.offsetHeight < el.scrollHeight ){
				this.refs.arrowBot.show();
			}else{
				this.refs.arrowBot.hide();
			}
    	}
	}
	onDeny(){
		this.login();
	}
	scrollDown(){

	}
	scrollUp(){

	}
	deleteCurrentProd(p){
		if(this.state.prodList.length < 2){
			return;
		}
		////////console.log(['6923',p, this.state.prodList])
		var self  = this;
	
		if(this.state.prodList.indexOf(p) != 0){
			this.switchProd(this.state.prodList[this.state.prodList.indexOf(p) - 1])
		}else{
			this.switchProd(this.state.prodList[1])
		}
		setTimeout(function(){
			self.sendPacket('deleteProd',p)
			setTimeout(function (argument) {
				socket.emit('getProdList', self.props.det.ip)
			},100);
		},200);
	}
	login (){
		this.props.login();
	}
	logout(){
		this.props.logout();
	}
	renderProductsMobile(){
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		if(lg == 'turkish'){
		//	lg = 'korean'
		}
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		var buttonStyle = {display:'inline-block', marginLeft:5, marginRight:5, height: 40,marginBottom:5, lineHeight:'40px', border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:120, borderRadius:20, fontSize:14}

		var prodNames = this.state.prodNames
		var chSize = 8;
		
		var chsize = 3, maxHeight = '80%';
		var defRestore = '', factorySave = '', factoryRestore = '', editCont = '', showPropmt = "#e1e1e1", exportCont='';
		if(this.state.peditMode){
			chsize = 2
			maxHeight = "75%";
			showPropmt = 'orange'
			defRestore =  <CustomAlertButton alertMessage={'Restore this product to default settings?'} onClick={this.defaultRestore}  style={buttonStyle}> Default Restore</CustomAlertButton>
			factorySave = <CustomAlertButton alertMessage={'Save this product to factory?'} onClick={this.factorySave}  style={buttonStyle}>Factory Save</CustomAlertButton>
			factoryRestore = <CustomAlertButton alertMessage={'Restore this product to factory settings?'}  onClick={this.factoryRestore}  style={buttonStyle}>Factory Restore </CustomAlertButton>
			editCont = <div style={{position:'relative', display:'block', width:"100%", marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				{factoryRestore}
				{factorySave}
				{defRestore}
				 <CustomAlertButton alertMessage={'Delete all current products?'}  onClick={this.deleteAll}  style={buttonStyle}>Delete All </CustomAlertButton>
			</div>
		
		}
		var chpnames = this.state.prodNames.chunk(chsize);
		var prList = this.state.prodList.map(function(p,i){
			var sel = false
				if(p==self.state.sysRec['ProdNo']){
					sel = true;
				}
				var name = ""
				if(typeof self.state.prodNames[i] != 'undefined'){
					name = self.state.prodNames[i]
				}
				return <div><ProductItem mobile={self.props.mobile} language={lg} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} deleteCurrent={self.deleteCurrentProd} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/></div>
			
		})
		

		var prodList = <div id='prodList' onScroll={this.handleProdScroll} style={{display:'block', width:'100%',marginLeft:'auto',marginRight:'auto', maxHeight:maxHeight, overflowY:'scroll'}}><div>{prList}</div></div>



		
		var SA = false;
		if(this.state.prodList.length > 4*chsize){
			SA = true;
		}

		var gearStyle = {float:'right', display:'block', textAlign:'right', marginLeft:-40}
		var	inblk = 'none'
	
		var togglePedit = <div style={gearStyle}><div style={{top:65}}>
		<div onClick={this.changeProdEditMode} style={{display:inblk, verticalAlign:'top', paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div onClick={this.changeProdEditMode} style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		</div>		
		
		return(<div>
				{togglePedit}
				<div style={{paddingTop:10, paddingBottom:4}}>
					 <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5, fontWeight:500, color:"#eee"}} >
					 <div style={{display:'inline-block', textAlign:'center'}}>{vdefMapV2['@labels']['Products'][lg]['name']}</div></h2></span>
					 </div>
				{editCont}
				{exportCont}
				
				<div style={{position:'relative',textAlign:'center', width:"100%", marginLeft:'auto', marginRight:'auto', display:'block'}}>
					<ScrollArrow ref='arrowTop' width={72} marginTop={-35} active={SA} mode={'top'} onClick={this.scrollDown}/>
		
				{prodList}

					<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
				</div>
			</div>)
	}
	renderProducts(){
		var self = this;
		if(this.props.mobile){
			return this.renderProductsMobile();
		}
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
		}

		var prodNames = this.state.prodNames
		var chSize = 8;
		
		var chsize = 3, maxHeight = 380;
		var defRestore = '', factorySave = '', factoryRestore = '', editCont = '', showPropmt = "#e1e1e1", exportCont='';
		if(this.state.peditMode){
			chsize = 2
			maxHeight = 330;
			showPropmt = 'orange'
			defRestore =  <CustomAlertButton alertMessage={'Restore this product to default settings?'} onClick={this.defaultRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height: 40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}> Default Restore</CustomAlertButton>
			factorySave = <CustomAlertButton alertMessage={'Save this product to factory?'} onClick={this.factorySave}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Save</CustomAlertButton>
			factoryRestore = <CustomAlertButton alertMessage={'Restore this product to factory settings?'}  onClick={this.factoryRestore}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Factory Restore </CustomAlertButton>
			editCont = <div style={{position:'relative', display:'block', height:50, width:785, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				{factoryRestore}
				{factorySave}
				{defRestore}
				 <CustomAlertButton alertMessage={'Delete all current products?'}  onClick={this.deleteAll}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Delete All </CustomAlertButton>
			</div>
			if(this.props.usb){ 
				maxHeight = 275;
				exportCont = <div style={{position:'relative', display:'block', height:50, width:785, marginTop:5, marginLeft:'auto',marginRight:'auto', textAlign:'center'}}>
				 <CustomAlertButton alertMessage={'Import Product Records from USB?'}  onClick={this.importUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Import Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Export Product Records to USB?'}  onClick={this.exportUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Export Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Restore Product Records from USB?'}  onClick={this.restorUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Restore Products</CustomAlertButton>
				 <CustomAlertButton alertMessage={'Backup Product Records to USB?'}  onClick={this.backupUSB}  style={{display:'inline-block', marginLeft:10, marginRight:10, height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}>Backup Products </CustomAlertButton>
			</div>

			}
		}
		var chpnames = this.state.prodNames.chunk(chsize);
		var prList = this.state.prodList.chunk(chsize).map(function(a,i){
			var cells = a.map(function(p,j){			
					var sel = false;
				if(p==self.state.sysRec['ProdNo']){
					sel = true;
				}
				var name = ""
				if(typeof chpnames[i][j] != 'undefined'){
					name = chpnames[i][j]
				}
				return <td><ProductItem language={lg} onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} deleteCurrent={self.deleteCurrentProd} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/></td>
			})
			return <tr>{cells}</tr>
		})


		var prodList = <div id='prodList' onScroll={this.handleProdScroll} style={{display:'block', width:785,marginLeft:'auto',marginRight:'auto', maxHeight:maxHeight, overflowY:'scroll'}}><table><tbody>{prList}</tbody></table></div>
		var SA = false;
		if(this.state.prodList.length > 4*chsize){
			SA = true;
		}
		var togglePedit =  <div  onClick={this.changeProdEditMode}  style={{top:65}}>
		<div style={{display:'inline-block', verticalAlign:'top',  paddingTop:5, paddingLeft:20, color:showPropmt}}> {vdefMapV2['@labels']['Settings'][lg].name} </div> 
		<div style={{display:'inline-block'}}><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill={showPropmt}><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></div></div>
		
		return (<div>
				<table style={{width:860, borderBottom:'1px solid #eee', marginBottom:5}}><tbody><tr><td style={{width:200}}></td>
				<td style={{width:460}}><div style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}}> {vdefMapV2['@labels']['Products'][lg].name}

				</div></td><td style={{width:200, textAlign:'right'}}>{togglePedit}</td></tr></tbody></table>

				{editCont}
				{exportCont}
				
				<div style={{position:'relative',textAlign:'center', width:785, marginLeft:'auto', marginRight:'auto', display:'block'}}>
					<ScrollArrow ref='arrowTop' width={72} marginTop={-35} active={SA} mode={'top'} onClick={this.scrollDown}/>
		
				{prodList}

					<ScrollArrow ref='arrowBot' width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
				</div>
			</div>)


	}
	render () {
		// body...
		var home = 'home'
		var login = 'login'

		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		if(this.props.mobile){
			style.overflowY = 'scroll'
		}
		var lstyle = {height: 50,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
		}
		var peditCont = this.renderProducts()
	
		var logincell = <td className="logbuttCell" style={{height:60}} onClick={this.login}><button className='login' style={{height:50}} /></td>
		var logintext = ''
		if(this.props.level > 0){
			logincell = <td className="logbuttCell" style={{height:60}} onClick={this.logout}><button className='logout' style={{height:50}} /></td>
			logintext =	<td style={{height:60, width:100, color:'#eee'}}><label onClick={this.login}>{this.props.username}</label></td>
		}

		var dv = <InterceptorDynamicViewDF interceptor={this.props.interceptor} mobile={this.props.mobile}  offline={this.props.offline} onDeny={this.onDeny} mac={this.props.mac} testReq={this.props.testReq}  language={lg} onButton={this.onButton} onSens={this.onSens} rejOn={this.props.rejOn} faultArray={this.props.faultArray} warningArray={this.props.warningArray}
							ref='dv' sys={this.state.sysRec} sens={this.state.prodRec['Sens']} sig={this.state.peak} pleds={this.state.pled_a} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} clearFaults={this.props.clearFaults} 
							clearWarnings={this.props.clearWarnings} rejLatch={this.props.rejLatch} prodName={this.state.prodRec['ProdName']}
										rej={this.state.rej} onKeyboardOpen={this.keyboardOpen} onKeyboardClose={this.keyboardClose} level={this.props.level}/>
		
			//var dfLab = <label style={{fontSize:30,lineHeight:'50px',display:'inline-block',position:'relative',top:-10,color:'#FFF'}}>DF</label>
		

    var imsrc = 'assets/Stealth-white-01.svg'
    if(this.props.interceptor){
      imsrc = 'assets/Interceptor-white-01.svg'
    }
		return (<div className='interceptorMainPageUI' style={style}>
					<table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
						<tbody>
							<tr>
								<td style={{width:380}}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td><td hidden={this.props.mobile}>
								<img style={{height:45, marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src={imsrc}/>
								</td>
							{logintext}	{logincell}
							{!this.props.mobile &&
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
				
							}
							</tr>
						</tbody>
					</table>
		
		{dv}		
		<InterceptorNav interceptor={this.props.interceptor} mobile={this.props.mobile} offline={this.props.offline} onDeny={this.onDeny} df={this.props.df} testReq={this.props.testReq} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} language={lg} onButton={this.onButton} ref='nv' clearFaults={this.props.clearFaults} clearWarnings={this.props.clearWarnings} 
		rejOn={this.props.rejOn} rejLatch={this.props.rejLatch}  faultArray={this.props.faultArray} warningArray={this.props.warningArray} prodName={this.state.prodRec['ProdName']} combineMode={this.state.prodRec['SigModeCombined']} sens={this.state.prodRec['Sens']} thresh={this.state.prodRec['DetThresh']}>
			<DspClock mobile={this.props.mobile} dst={this.state.sysRec['DaylightSavings']} sendPacket={this.sendPacket} language={lg} ref='clock'/>
		</InterceptorNav>
				<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal mobile={this.props.mobile} ref='pedit' intMeter={true} dfMeter={this.props.df} clear={this.clearSig}>
				

				{peditCont}
				</Modal>
				
				<Modal mobile={this.props.mobile} ref='netpolls' intMeter={true} dfMeter={this.props.df}  clear={this.clearSig}>
					<NetPollView mobile={this.props.mobile} language={lg} ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip} mac={this.props.det.mac}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
		</div>)
	}
}
class InterceptorDynamicViewDF extends React.Component{
	constructor(props) {
		super(props)
		this.state = {peak:0,peaka:0,peakb:0, cipSec:0}
		this.update = this.update.bind(this)
		this.onSens = this.onSens.bind(this)
		this.onSig = this.onSig.bind(this);
		this.onRej = this.onRej.bind(this);
		this.updatePeak = this.updatePeak.bind(this);
		this.setCip = this.setCip.bind(this);
		this.setCipSec = this.setCipSec.bind(this);
		this.onTestReq = this.onTestReq.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	setCip(on){
		
			this.refs.mc.setState({cip:on});
		
	}
	setCipSec(sec){
		
			this.refs.mc.setState({cipSec:sec});
			if(sec != 0){
				if(this.state.cipSec == 0){
					this.setState({cipSec:1})
				}
			}else{
				if(this.state.cipSec == 1){
					this.setState({cipSec:0})
				}
			}
	}
	update (sig,a,b) {
		
		this.refs.tbb.update(sig)
	}
	updatePeak(df,a,b){
		if((this.state.peak != df)){
			this.setState({peak:df})
		}
	}
	onSens (e) {
		this.props.onSens(e, 'Sens')
	}
	onSig () {
		this.props.onButton('sig')
	}
	onRej () {
		this.props.onButton('rej')
	}
	onTestReq(){
		this.props.onButton('onTestReq')
	}
	renderMobile(){
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'InterceptorDynamicView_tf'
		}
		var marginSt = {marginLeft:5, marginRight:5}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		return (
			<div style={{marginTop:0, marginLeft:7, marginRight:7, marginBottom:12}}>
			<div className={klass} style={{overflow:'hidden', display:'block', marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 8px #818a90'}}>
				<div style={{padding:10, paddingTop:0, paddingBottom:0, display:'block', height:15}}><TickerBox ref='tbb'/>
				</div>
				<div>	<MessageConsole mobile={true} offline={this.props.offline} ref='mc' isUpdating={this.props.isUpdating} isSyncing={this.props.isSyncing} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>
				</div>
				<div style={marginSt}>
					<KeyboardInputTextButton mobile={true} language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' '} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				<div style={marginSt}><KeyboardInputTextButton mobile={true} language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				
				<div style={marginSt}>
					<KeyboardInputTextButton mobile={true} language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSig} isEditable={false} value={this.state.peak} inverted={false}/>
				</div>

				
				</div>
				</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'InterceptorDynamicView_tf'
		}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 3);
		return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'#818a90'}}><tbody>
				<tr>
				<td colSpan={3} style={{padding:0,display:'inline-block',overflow:'hidden', width:956}}>
				<div style={{padding:10, paddingTop:5, paddingBottom:5, display:'block', width:936}}><TickerBox ref='tbb'/>
				</div></td></tr>
				
				<tr>
				<td style={{padding:0, height:123, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative', marginTop:5}}>
					<KeyboardInputTextButton language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' '} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:123}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:5, marginLeft:10}}><div><KeyboardInputTextButton language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative',marginTop:5}}>
					<KeyboardInputTextButton language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSig} isEditable={false} value={this.state.peak} inverted={false}/>
					</div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={3} style={{display:'inline-block', padding:0,overflow:'hidden', display:'none'}}><div style={{width:936,height:116, overflow:'hidden', display:'none'}}>
					<MessageConsole mobile={false} offline={this.props.offline} ref='mc' isUpdating={this.props.isUpdating} isSyncing={this.props.isSyncing} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>

				</div></td></tr>
				</tbody></table>
				
				</div>
				</div>)
	}
}
class InterceptorNav extends React.Component{
	constructor(props) {
		super(props)
		this.onConfig = this.onConfig.bind(this);
		this.onTest = this.onTest.bind(this);
		this.onLog = this.onLog.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onCal = this.onCal.bind(this);
		this.onProd = this.onProd.bind(this);
		this.streaTo = this.streamTo.bind(this);
		this.onTestReq = this.onTestReq.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.setCip = this.setCip.bind(this);
		this.setCipSec = this.setCipSec.bind(this);
		this.onDeny = this.onDeny.bind(this);	
		this.pauseGraph =this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	pauseGraph(){
		if(this.refs.sg){
			this.refs.sg.pauseGraph();	
		}
		
	}
	restart(){
		if(this.refs.sg){
			this.refs.sg.restart();
		}	
	}
	onDeny(){
		this.props.onDeny();
	}
	setCip(on){
		//if(!this.props.df){
		if(!this.props.mobile){
			this.refs.nv.setState({cip:on});
		}
		//}
	}
	setCipSec(sec){
		if(!this.props.mobile){
			this.refs.nv.setState({cipSec:sec});
		}
	}
	onConfig () {
		this.props.onButton('config')
	}
	onTest () {
		// body...
		this.props.onButton('test')
	}
	onTestReq(){
		this.props.onButton('onTestReq')
	}
	onLog () {
		// body...
		this.props.onButton('log')
	}
	onSens () {
		// body...
		this.props.onButton('sens')
	}
	onCal () {
		// body...
		this.props.onButton('cal')
	}
	onProd () {
		// body...
		this.props.onButton('prod')
	}
	streamTo (dat,ov) {
		// body...

		if(this.refs.sg){
			this.refs.sg.stream(dat,ov);
		}
		
	}
	clearRejLatch(){
		this.props.clearRejLatch();
	}
	renderMobile(){
		var labels = {'Settings':{'english':'Settings','korean':'설정'},
		'Test':{'english':'Test','korean':'테스트'},
		'Log':{'english':'Log','korean':'기록'},
		'Sensitivity':{'english':'Sensitivity','korean':'민감도'},
		'Calibrate':{'english':'Calibrate','korean':'캘리브레이션'},
		'Product':{'english':'Product','korean':'품목'} }
		var klass = 'navWrapper'
		if(this.props.faultArray.length != 0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'navWrapper_f'
		}else if(this.props.rejOn == 1){
			klass = 'navWrapper_r'
		}else if(this.props.testReq == 1){
			klass = 'navWrapper_t'
		}else if(this.props.testReq == 2){
			klass = 'navWrapper_tf'
		}

		var content = <InterceptorNavContent interceptor={this.props.interceptor} combineMode={this.props.combineMode} mobile={this.props.mobile} offline={this.props.offline} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} ref='nv' clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>
				
	
		return (<div className='interceptorNav' style={{display:'block', marginLeft:'auto',marginRight:'auto'}}>
				
				<div className={klass} style={{overflow:'hidden', marginTop:-10, background:'transparent'}}>
				<div style={{background:'#362c66', paddingLeft:15, paddingRight:15}}>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={vdefMapV2['@labels']['Settings'][this.props.language]['name']} onClick={this.onConfig}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Test'][this.props.language]['name']} onClick={this.onTest}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Log'][this.props.language]['name']} onClick={this.onLog}/>
					<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} inverted={true} onClick={this.onSens}/>
				<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} inverted={true} onClick={this.onCal}/>
				<CircularButton style={{width:'100%', marginLeft:-8, height:43,borderWidth:5, marginTop:3}} lab={vdefMapV2['@labels']['Product'][this.props.language]['name']} inverted={true} onClick={this.onProd}/>
				
				</div>

				<table hidden className='intNavTable' style={{height:240, marginTop:0, borderSpacing:0,width:'100%', borderCollapse:'collapse', background:'#362c66'}}><tbody><tr>
				<td>
				<div style={{marginLeft:0, marginRight:'auto', width:180}}>
				<div></div>
				</div>
				</td><td>
				<div style={{marginRight:0, marginLeft:'auto', width:180}}><div>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile();
		}
		// body...
		var labels = {'Settings':{'english':'Settings','korean':'설정'},
		'Test':{'english':'Test','korean':'테스트'},
		'Log':{'english':'Log','korean':'기록'},
		'Sensitivity':{'english':'Sensitivity','korean':'민감도'},
		'Calibrate':{'english':'Calibrate','korean':'캘리브레이션'},
		'Product':{'english':'Product','korean':'품목'} }
		var left =  {width:215, marginLeft:0, marginRight:'auto', height:80, lineHeight:'85px'}
		var right =  {width:215, marginLeft:'auto', marginRight:0,height:80, lineHeight:'85px'}
		var klass = 'navWrapper'
		if(this.props.faultArray.length != 0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'navWrapper_f'
		}else if(this.props.rejOn == 1){
			klass = 'navWrapper_r'
		}else if(this.props.testReq == 1){
			klass = 'navWrapper_t'
		}else if(this.props.testReq == 2){
			klass = 'navWrapper_tf'
		}

		var content = 				<InterceptorNavContent interceptor={this.props.interceptor} offline={this.props.offline} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} ref='nv' clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}>
					</InterceptorNavContent>
		//if(this.props.df){
		//	content = <SlimGraph df={true} int={true} ref='sg' canvasId={'sgcanvas2'}/>
		//}
		return (<div className='interceptorNav' style={{display:'block', width:987, marginLeft:'auto',marginRight:'auto', background:'linear-gradient(90deg, transparent, transparent 5%, black 5%, black 95%, transparent 95%)'}}>
				
				<div className={klass} style={{overflow:'hidden',width:987,height:352}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 50px',boxShadow:'-2px 0px 0px 0px #362c66', height:366, textAlign:'center', marginTop:0, paddingTop:1, position:'relative'}}>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Settings'][this.props.language]['name']} onClick={this.onConfig}/>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Test'][this.props.language]['name']} onClick={this.onTest}/>
					<CircularButton fSize={35} style={left} lab={vdefMapV2['@labels']['Log'][this.props.language]['name']} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:480, height:327, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'40px 100px', borderBottomRightRadius:'40px 100px'}}>
				<div style={{height:63}}>{content}</div>
				
				<SlimGraph sens={this.props.sens} thresh={this.props.thresh} combineMode={this.props.combineMode} df={false} int={this.props.interceptor} ref='sg' canvasId={'sgcanvas2'}/>
				{this.props.children}
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 50px',boxShadow:'2px 0px 0px 0px #362c66', height:366, textAlign:'center', marginTop:0, paddingTop:1, position:'relative'}}>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} inverted={true} onClick={this.onSens}/>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} inverted={true} onClick={this.onCal}/>
				<CircularButton fSize={35} style={right} lab={vdefMapV2['@labels']['Product'][this.props.language]['name']} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
}
class InterceptorNavContent extends React.Component{
	constructor(props) {
		super(props)
		this.state =  {prodName:'PRODUCT 1',cip:0,cipSec:0}
		this.clearFaults = this.clearFaults.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.onClick = this.onClick.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	stream (dat,ov) {
	}
	componentWillReceiveProps(newProps){
		if(newProps.faultArray.length > this.props.faultArray.length){
			this.refs.fModal.show();
		}
	}
	clearFaults(){
		this.props.clearFaults()
	}
	clearWarnings(){
		this.props.clearWarnings()
	}
	clearRejLatch(){
		this.props.clearRejLatch()
	}
	onClick () {
		if(this.props.faultArray.length>0){
			this.refs.fModal.toggle();
		}else if(this.props.testReq != 0){
			this.props.toggleTest();
		}else if(this.props.rejLatch ==1){
			this.refs.fModal.toggle();
		}
	}
	renderMobile(){
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'navTabLeft'
		var center = 'navTabCent'
		var right = 'navTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:'100%'}
		var line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.prodName}</div>
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{fstr + " " + wstr}</div>
			//line2 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'navTabLeft_f'
			center = 'navTabCent_f'
			right = 'navTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			left = 'navTabLeft_r'
			center = 'navTabCent_r'
			right = 'navTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name'] + ' - ' + vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
				//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'navTabLeft_t'
			center = 'navTabCent_t'
			right = 'navTabRight_t'
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'navTabLeft_tf'
			center = 'navTabCent_tf'
			right = 'navTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{this.props.status}</div>
		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			line1 =  <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name + ' - ' + vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>
			//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
		//	line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>PLC</div>

		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:270, marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:270, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
	
		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{   textAlign:'center', color:'#eee'}}>
			<div style={{display:'block', width:350, marginLeft:'auto',marginRight:'auto'}}>
			<table className='noPadding' style={{marginRight:0, marginLeft:0}} onClick={this.onClick}>
				<tbody><tr><td className={left} ></td>
				<td className={center} style={{width:270}}>
				{line1}{line2}
				</td><td className={right}></td></tr>
				</tbody>
			</table>
			</div>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal' mobile={true}>
				{fCont}
			</Modal>
				</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'navTabLeft'
		var center = 'navTabCent'
		var right = 'navTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:220}
		var line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.prodName}</div>
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{fstr + " " + wstr}</div>
			//line2 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'navTabLeft_f'
			center = 'navTabCent_f'
			right = 'navTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}  onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}  onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}}  onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			left = 'navTabLeft_r'
			center = 'navTabCent_r'
			right = 'navTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name'] + ' - ' + vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
				//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'navTabLeft_t'
			center = 'navTabCent_t'
			right = 'navTabRight_t'
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'navTabLeft_tf'
			center = 'navTabCent_tf'
			right = 'navTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{this.props.status}</div>
		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			line1 =  <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name + ' - ' + vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>
			//line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
		//	line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>PLC</div>

		}
		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:330, marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:330, fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
	
		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{   position: 'fixed',marginTop: -15,marginLeft: 35, color:'#eee'}}>
			<table className='noPadding' onClick={this.onClick}>
				<tbody><tr><td className={left} ></td>
				<td className={center}>
				{line1}{line2}
				</td><td className={right}></td></tr>
				</tbody>
			</table>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal'>
				{fCont}
			</Modal>
				</div>)
			
	}
}
class InterceptorDFSensitivityUI extends React.Component{
	constructor(props){
		super(props);
		this.state = {peaka:0,peakb:0, peakdf:0}
		this.renderMobile = this.renderMobile.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onSensA = this.onSensA.bind(this);
		this.onSensB = this.onSensB.bind(this);
		this.onSigMode = this.onSigMode.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		this.setPeaks = this.setPeaks.bind(this);
		this.onSigA	= this.onSigA.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onSigDF = this.onSigDF.bind(this);
	}
	setPeaks(a,b,df){
    if(this.props.interceptor){
		if((this.state.peaka != a)||(this.state.peakb != b)||(this.state.peakdf != df)){
			this.setState({peaka:a,peakb:b, peakdf:df})
		}
  }else{
    if(this.state.peakdf != a){
      this.setState({peakdf:a})
    }
  }

	}
	onSens(sens){
		this.props.onSens(sens,'Sens');
	}
	onSensA(sens){
		this.props.onSens(sens,'Sens_A');
	}
	onSensB(sens){
		this.props.onSens(sens,'Sens_B')
	}
	onSigMode(){
		var self = this;
		setTimeout(function(){
			self.refs.sgpw.toggle()
		},150)
		
	}
	selectChanged(v,i){
		this.props.onSigMode('SigModeCombined',v)
	}
	onSigA(){
		this.props.clearSig('Peak_A')
	}
	onSigB(){
		this.props.clearSig('Peak_B')
	}
	onSigDF(){
		this.props.clearSig('Peak')
	}
	onDeny(){

	}
	onRequestClose(){

	}
	onFocus(){

	}
	renderMobile(){
		var details = '';
		var list = vdefByMac[this.props.mac][0]['@labels']['SigModeCombined']['english']
		if(this.props.level > 3){
			details = (	
				
				<div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black', textAlign:'center'}}>

						<div style={{marginTop:15}}>
						<div><KeyboardInputTextButton  mobile={this.props.mobile}  language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} />
						</div><div>
					<KeyboardInputTextButton mobile={this.props.mobile} onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
						</div>
					<div>
					<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['SigModeCombined']['@translations'][this.props.language]['description']} label={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} 
				onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={list[this.props.sigmode]} onClick={this.onSigMode} inverted={false} />
				<PopoutWheel mobile={this.props.mobile} ref='sgpw' vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} val={[this.props.sigmode]} options={[list]} onChange={this.selectChanged}/>
				</div>
						<div>
						<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={false}/></div>
					<div>
					<KeyboardInputTextButton mobile={this.props.mobile}  onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={false}/></div>
					
		</div>
		)
		}
		
		return <div>
		<div style={{textAlign:'center'}}>
				<div>
				<div><KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens']['@translations'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} inverted={false} />
				</div><div>
				<KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSigDF} isEditable={false} value={this.state.peakdf} inverted={false}/>
					</div>
				
			</div>
		</div>
		{details}
		</div>
	}
	render(){
		if(this.props.mobile){
			return this.renderMobile();
		}
		var details = '';
	  if(this.props.interceptor){
      var list =  vdefByMac[this.props.mac][0]['@labels']['SigModeCombined']['english']
  
    
   	if(this.props.level > 3){
			details = (	
				
				<div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black'}}>

		<table style={{borderSpacing:0}}>
			<tbody><tr>
					<td style={{width:300, background:'#818a90', textAlign:'center'}}>
						<div style={{marginTop:15}}>
						<div><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} />
						</div><div>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
						</div>
						</td>
					<td  style={{width:300,textAlign:'center', background:'linear-gradient(90deg, #818a90, #818a90 49.9%,#362c66 50.1%, #362c66)'}}>
										<div>
					<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['SigModeCombined']['@translations'][this.props.language]['description']} label={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} 
				onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={list[this.props.sigmode]} onClick={this.onSigMode} inverted={false} />
				<PopoutWheel ref='sgpw' vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={vMapV2['SigModeCombined']['@translations'][this.props.language]['name']} val={[this.props.sigmode]} options={[list]} onChange={this.selectChanged}/>
				</div>
					</td>
					<td  style={{width:300, textAlign:'center', background:'#362c66'}}>
						<div style={{marginTop:15}}>
						<div>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={true}/></div>
						</div><div>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name'] + ' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={true}/></div>
					
					</td>
				
			</tr></tbody>
		</table>
		</div>
		)
		}
  }
		
		return <div>
		<div style={{textAlign:'center'}}>
				<div><table><tbody><tr><td style={{width:450}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens']['@translations'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} inverted={false} />
				</td><td style={{width:450}}><KeyboardInputTextButton language={this.props.language} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSigDF} isEditable={false} value={this.state.peakdf} inverted={false}/>
					</td></tr></tbody></table>
				
			</div>
		</div>
		{details}
		</div>
	}
}
class InterceptorCalibrateUI extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({sensCalA:0,sensCalB:0,sensA:0,sensB:0,rpeak:0,xpeak:0,phaseb:0,phaseSpeedB:0, phaseModeB:0, phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'', tmpStrB:'', pled_a:0, pled_b:0, det_power_a:0, det_power_b:0, pa:false,pb:false})
		this.onCalA = this.onCalA.bind(this);
		this.onCalB = this.onCalB.bind(this);
		this.calibrateAll = this.calibrateAll.bind(this);
		this.onPhaseA = this.onPhaseA.bind(this);
		this.onPhaseB = this.onPhaseB.bind(this);
		this.onModeA = this.onModeA.bind(this);
		this.onModeB = this.onModeB.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.setPleds = this.setPleds.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.lowPower = this.lowPower.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	componentWillReceiveProps (newProps) {
		// body...
	}
	setPleds(a,b){
		var self = this;
		var pa = false;
		var pb = false;
		if((a != this.state.pled_a) || (b != this.state.pled_b)){
			
			if((this.state.phaseSpeed != 0) && (a == 2)){
				pa = true;
			}

			if((this.state.phaseSpeedB != 0) && (b == 2)){
				pb = true;
			}
			//this.setState()
			this.setState({pled_a:a, pled_b:b, pa:pa, pb:pb})
			if(pa||pb){
				setTimeout(function(){
					self.refs.cfmodal.show();
				},100)
			}

		}
	}
	onCalA () {
		// body...
		this.props.calibA()
	}
	onCalB () {
		// body...
		this.props.calibB()
	}
	calibrateAll () {
		// body...
		var self = this;
		this.props.calibA()
	
	}
	onPhaseA (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	}
	onPhaseB (p) {
		// body...
		this.props.sendPacket('phaseEditb',p)
	}
	onModeA (m) {
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	}
	onModeB (m) {
		this.props.sendPacket('phaseModeb',parseInt(m.target.value))
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose();
	}
	lowPower(){
		var self = this;
			////console.log(9984, 'lowPower')
			this.props.sendPacket('oscPower', 0)
		setTimeout(function(){
				self.props.sendPacket('oscPowerB',0)
		},300)
		
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile();
		}
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]
		var ledcolors = ["#ffffff","#00ff00","#ff0000"]

		var opsA = modes[self.state.phaseMode]
		var opsB = modes[self.state.phaseModeB]

    var tab =    
    <table style={{borderSpacing:0}}>
      <tbody> 
        <tr><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><CalibIndicator language={this.props.language} tooltip={vMapV2['PhaseAngle']['@translations'][this.props.language]['description']} label={vMapV2['PhaseAngle']['@translations'][this.props.language]['name']} lab2={opsA} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} mphase={this.props.moa} offset={this.props.offsetA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
          </td><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens']['@translations'][this.props.language]['description']} label={vMapV2['Sens']['@translations'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensA} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.sensCalB]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
    
        </td></tr>

      </tbody>
     </table>
    if(this.props.interceptor){
      tab =    <table style={{borderSpacing:0}}>
      <tbody> 
        <tr><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><CalibIndicator language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} lab2={opsA} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} mphase={this.props.moa} offset={this.props.offsetA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
            <div style={{marginTop:5}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens_A']['@translations'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.sensCalA]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
          </td><td style={{width:422, textAlign:'center'}}><div style={{marginTop:15}}><CalibIndicator language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']} lab2={opsB} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phaseb} mphase={this.props.mob} offset={this.props.offsetB} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.phaseSpeedB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
            <div style={{marginTop:5}}><KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_B']['@translations'][this.props.language]['description']} label={vMapV2['Sens_B']['@translations'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensB} onInput={this.onPhaseB} inverted={true} bgColor={colors[this.state.sensCalB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
    
        </td></tr>

      </tbody>
     </table>
    }

	 	return	<div >
	 	<div><CircularButton style={{width:228, lineHeight:'80px', height:70}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
	{tab}


				<AlertModal ref='cfmodal' accept={this.lowPower}>
					<div style={{color:'#e1e1e1'}}>{'Product High Signal -   Use low power?'}</div>
				</AlertModal>
		</div>
	
		
	}
	renderMobile () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]
		var ledcolors = ["#ffffff","#00ff00","#ff0000"]

		var opsA = modes[self.state.phaseMode]
		var opsB = modes[self.state.phaseModeB]



	 	return	<div style={{textAlign:'center'}} >
	 	<div style={{marginLeft:5, marginRight:5}}><CircularButton  style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={vdefMapV2['@labels']['Learn'][this.props.language]['name']} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
	 	<div style={{marginTop:15}}><CalibIndicator  mobile={this.props.mobile}  mphase={this.state.moa} offset={this.state.offsetA} language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} lab2={opsA} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} mphase={this.props.moa} offset={this.props.offsetA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton mobile={this.props.mobile} language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens']['@translations'][this.props.language]['name'] + ' A'} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensA} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.sensCalA]} rstyle={{backgroundColor:ledcolors[this.state.pled_a]}} overrideBG={true}/></div>
		<div style={{marginTop:15}}><CalibIndicator  mobile={this.props.mobile}  mphase={this.state.moa} offset={this.state.offsetA} language={this.props.language} tooltip={vMapV2['PhaseAngle_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']} lab2={opsB} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phaseb} mphase={this.props.mob} offset={this.props.offsetB} onInput={this.onPhaseB} inverted={false} bgColor={colors[this.state.phaseSpeedB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
						<div style={{marginTop:5}}><KeyboardInputTextButton mobile={this.props.mobile}  language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vMapV2['Sens']['@translations'][this.props.language]['name'] + ' B'}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={false} value={this.state.sensB} onInput={this.onPhaseB} inverted={false} bgColor={colors[this.state.sensCalB]} rstyle={{backgroundColor:ledcolors[this.state.pled_b]}} overrideBG={true}/></div>
		

				<AlertModal ref='cfmodal' accept={this.lowPower}>
					<div style={{color:'#e1e1e1'}}>{'Product High Signal -   Use low power?'}</div>
				</AlertModal>
		</div>
	
		
	}
}
class AccountControl extends React.Component{
	constructor(props){
		super(props)
		this.state = ({accounts:this.props.accounts, curlevel:0, username:'', pswd:'', newUser:false})
		this.selectChanged = this.selectChanged.bind(this);
		this.addAccount = this.addAccount.bind(this);
		this.removeAccount = this.removeAccount.bind(this);
		this.addNewUser = this.addNewUser.bind(this);

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
		this.refs.pw.toggle();
	}
	setUserName(){
		this.refs.username.toggle();
	}
	setPassword(){
		this.refs.pswd.toggle();
	}
	addNewUser(){
		//this.setState({newUser:true})
	}
	render1(){
		var self = this;
		var levels = ['none','operator','technician','engineer']
		var pw = 	<PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Filter Events'} ref='pw' val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='user' onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='pswd' onChange={this.onPswdChange} value={''} label={'Password'}/>
			var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} ><div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
		var st = {padding:7,display:'inline-block', width:180}
		
		////console.log(this.props.accounts)
		var accTableRows = [];
		this.props.accounts.forEach(function(ac,i){
			accTableRows.push(<AccountRow mobile={self.props.mobile} language={self.props.language} lvl={self.props.level} change={self.props.level > ac.acc} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
		})

		return <div style={{maxHeight:350, overflowY:'scroll'}}>
			{userkb}
			{pswdkb}
			{pw}
			<div className='sItem noChild' hidden onClick={this.login}><label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'User Group'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{levels[this.props.val]}</label></div></div>
			</div>
			<table style={{borderCollapse:'collapse',background:"#d1d1d1", width:860}}>
			<tbody>
			<tr ><th>Username</th><th>Passcode</th><th>Level</th></tr>
			{accTableRows}
			</tbody>
			</table>	
		</div>
	}
	render(){
		var self = this;
		var levels = ['none','operator','technician','engineer']
		var pw = 	<PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Filter Events'} ref='pw' val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='user' onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='pswd' onChange={this.onPswdChange} value={''} label={'Password'}/>
			var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

		    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} ><div style={{display:'inline-block', textAlign:'center'}}>Accounts</div></h2></span>)
		var st = {padding:7,display:'inline-block', width:180}
		
		////console.log(this.props.accounts)
		var accTableRows = [];
		this.props.accounts.forEach(function(ac,i){
			accTableRows.push(<AccountRow mobile={self.props.mobile} language={self.props.language} lvl={self.props.level} change={self.props.level > ac.acc} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
		})
		var backBut = ''
		var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:"#eee"}} >{backBut}<div style={tstl}>Accounts</div></h2></span>)
	    }

		return <div style={{maxHeight:350, overflowY:'scroll'}}>
			{userkb}
			{pswdkb}
			{pw}
		
		<div>	
		{titlediv}
		{accTableRows}
			
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
	}
	componentWillReceiveProps(props){
		this.setState({username:props.username, acc:props.acc, password:props.password})
	}
	valClick(){
		//toast('Value Clicked')
		this.setState({changed:false})
		this.refs.ed.toggle();
	}
	onUserChange(v){
		this.setState({username:v, changed:true})
	}
	onPswdChange(v){
		var pswd = (v+'000000').slice(0,6)
		this.setState({password:pswd, changed:true})
	}
	setLevel(){
		if(this.props.change){
		
			var self = this;
			setTimeout(function(){
		
			self.refs.pw.toggleCont();
			},80);
		}
	}
	selectChanged(v){
		this.setState({acc:v, changed:true})
	}
	setUserName(){
		if(this.props.change){
		
		var self = this;
		setTimeout(function(){
			self.refs.username.toggle();
		},80)
		}
	}
	setPassword(){
		if(this.props.change){
			var self = this;
			setTimeout(function(){
				self.refs.pswd.toggle();
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
		//if(this.state.changed){
			//console.log('save Changes')
			this.addAccount();
		//}
		
	}
	addAccount(){
		socket.emit('writeUserData', {data:{username:this.state.username, acc:this.state.acc, password:this.state.password, user:this.props.uid}, ip:this.props.ip})
		this.setState({changed:false})
	}
	render() {
		//////console.log(3243, this.props.mobile)
		var levels = ['0','1','2','3','4']
		
		var namestring = 'User'+ this.props.uid
		//////////console.log(['2692',namestring])
			
		var dt = false;
		var self = this;
		var fSize = 24;
		if(namestring.length > 24){
			fSize = 18
		}
		else if(namestring.length > 20){
			fSize= 20
		}else if(namestring.length > 12){
			fSize = 22
		}
		if(this.props.mobile){
			fSize -= 7;
			fSize = Math.max(13, fSize)
		}
		let lvst = {display: 'table-cell',fontSize: fSize,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}

		var labWidth = (536/2)

		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}

			
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


			var pw = 	<PopoutWheel vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={'Set Level'} ref='pw' val={[this.state.acc]} options={[levels]} onChange={this.selectChanged}/>
		var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='username' onChange={this.onUserChange} value={this.state.username} label={'Username'}/>
		var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='pswd' onChange={this.onPswdChange} value={''} label={'Password'}/>
	
			var edit = <Modal mobile={this.props.mobile} ref='ed' onClose={this.saveChanges}>
			<div style={{textAlign:'center'}}>

				<div className={'sItem noChild'} onClick={() => this.refs.username.toggle()}><div><label style={lvst}>{'Username: '}</label>
						<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={st}>{this.state.username}</label></div></div></div></div>
				<div className={'sItem noChild'} onClick={() => this.refs.pswd.toggle()}><div><label style={lvst}>{'Password: '}</label>
						<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={st}>{this.state.password.split("").map(function(c){return '*'}).join('')}</label></div></div></div></div>
				<div className={'sItem noChild'} onClick={() => this.refs.pw.toggle()}><div><label style={lvst}>{'Level: '}</label>
						<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={st}>{this.state.acc}</label></div></div></div></div>
				</div>
				{pw}{userkb}{pswdkb}
			</Modal>
				
			var num = true
			var lbl = namestring

			return(<div className={'sItem noChild'}><div><label style={lvst}>{namestring + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}>{vLabels}</div></div></div>{edit}</div>)
	}
}

class NetPollView extends React.Component{
	constructor(props) {
		super(props)
		this.state =({events:[], curFilter:0})
		this.pushEvent = this.pushEvent.bind(this);
		this.onNetpoll = this.onNetpoll.bind(this);
		this.changeFilter = this.changeFilter.bind(this);
		this.selectChanged = this.selectChanged.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	onNetpoll(e){
		this.pushEvent(e)
	}
	pushEvent (e) {
		// body...
		var events = this.state.events
		if(events.length == this.props.eventCount){
			events.splice(-1,1);
		}
		events.unshift(e);
		this.setState({events:events})
	}
	dummyEvent () {
	}
	changeFilter(){
		var self = this;
		setTimeout(function(){
			self.refs.pw.toggleCont();
		
		},100);
	}	
	selectChanged(v){
		this.setState({curFilter:v})
	}
	renderMobile(){
		var self = this;
		var buttStyle = {display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}
		var innerStyle = {display:'inline-block', position:'relative',top:-2,width:'100%', color:"#e1e1e1", fontSize:14,lineHeight:2.2}
		var eventArr = []
		if(this.state.curFilter == 0){
			//eventArr = this.props.events.slice(0); (hack)
			this.props.events.forEach(function(e){
				if(e.net_poll_h != 'NETPOLL_STREAM_FRAM'){
					eventArr.push(e)
				}
			})
		}else if(this.state.curFilter == 1){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_REJECT_ID"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 2){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_FAULT"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 3){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_TEST_REQ_PASS"){
					eventArr.push(ev)
				}
			})
		}
		////console.log(['6536',self.props.mac])
		var events = []
     eventArr.forEach(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations'][self.props.language]['name']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			////////console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				////console.log(6957,e)
				if(e.parameters.length > 0){
				if(e.parameters[0].value != null){

          var pname = e.parameters[0].param_name;
          if(vMapV2[pname]){
            pname = vMapV2[pname]['@translations'][self.props.language].name
          }
					string = pname + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					var lg = self.props.language
					if(typeof vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language] == 'undefined'){
						lg = 'english'
					}else if(vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language][e.parameters[0].label.value].trim().length == 0){
						lg = 'english'
					}
					string = e.parameters[0].param_name + ': ' + vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][lg][e.parameters[0].label.value];
				}
			}else{
        string = 'Rec dump'
      }
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByMac[self.props.mac][0]['@labels'].FaultSrc[self.props.language][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
			}


			events.push(<tr><td style={{width:'20%', fontSize:12}}>{dateTime}</td><td style={{width:'15%', fontSize:12}}>{e.username}</td><td style={{width:'30%', fontSize:12}}>{ev}</td><td style={{width:'35%', fontSize:12}}>{string}</td></tr>)
		})
		var filters = ['All', 'Rejects', 'Faults', 'Tests']
		// body... 
		return (<div>
			<div style={{textAlign:'center'}}><label style={{fontSize:26,width:100,paddingLeft: 20,color:'#e1e1e1'}}>{vdefMapV2['@labels']['Events'][this.props.language]['name']}</label></div>
			<div>	
			<div style={{position:'relative', textAlign:'center'}}>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 0)} lab={'All'} onClick={()=>this.selectChanged(0)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 1)} lab={'Rejects'} onClick={()=>this.selectChanged(1)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 2)} lab={'Faults'} onClick={()=>this.selectChanged(2)}/>
			<CircularButton style={{display:'inline-block', marginLeft:5, marginRight:5, height: 30, lineHeight:'30px', width:120, borderRadius:20}} innerStyle={innerStyle} selected={(this.state.curFilter == 3)} lab={'Tests'} onClick={()=>this.selectChanged(3)}/>
			</div>
				
			<div style={{color:'#e1e1e1'}}>
			<table className='npTable'>
			<thead style={{display:'block', width:'100%'}}><tr style={{background:'transparent', fontSize:12}}><th style={{width:'20%'}}>{vdefMapV2['@labels']['Timestamp'][this.props.language]['name']}</th><th style={{width:"15%"}}>User</th><th style={{width:"30%"}}>{vdefMapV2['@labels']['Event'][this.props.language]['name']}</th><th style={{width:"35%"}}>{vdefMapV2['@labels']['Details'][this.props.language]['name']}</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
			</div>
			</div>

		</div>)
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var self = this;
		var eventArr = []
		if(this.state.curFilter == 0){
			//eventArr = this.props.events.slice(0); (hack)
			this.props.events.forEach(function(e){
				if(e.net_poll_h != 'NETPOLL_STREAM_FRAM'){
					eventArr.push(e)
				}
			})
		}else if(this.state.curFilter == 1){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_REJECT_ID"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 2){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_FAULT"){
					eventArr.push(ev)
				}
			})
		}else if(this.state.curFilter == 3){
			this.props.events.forEach(function(ev){
				if(ev.net_poll_h == "NET_POLL_TEST_REQ_PASS"){
					eventArr.push(ev)
				}
			})
		}
		////console.log(['6536',self.props.mac])
		var events = eventArr.map(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations'][self.props.language]['name']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			////////console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				////console.log(6957,e)
				if(e.parameters.length > 0){
				if(e.parameters[0].value != null){

 var pname = e.parameters[0].param_name;
          if(vMapV2[pname]){
            pname = vMapV2[pname]['@translations'][self.props.language].name
          }
          string = pname + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					var lg = self.props.language
					if(typeof vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language] == 'undefined'){
						lg = 'english'
					}else if(vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][self.props.language][e.parameters[0].label.value].trim().length == 0){
						lg = 'english'
					}
					string = e.parameters[0].param_name + ': ' + vdefByMac[self.props.mac][0]['@labels'][e.parameters[0].label.type][lg][e.parameters[0].label.value];
				}
			}else{
        string = "Rec Dump"
      }
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByMac[self.props.mac][0]['@labels'].FaultSrc[self.props.language][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
				
				//vdefByMac[this.props.ip][0]['@labels'].FaultSrc[]
			}


			return (<tr><td style={{width:185}}>{dateTime}</td><td style={{width:135, fontSize:16}}>{e.username}</td><td style={{width:185, fontSize:16}}>{ev}</td><td style={{width:295, fontSize:16}}>{string}</td></tr>)
		})
		var filters = ['All', 'Rejects', 'Faults', 'Tests']
		// body... 
		return (<div>
			<div style={{textAlign:'center'}}><label style={{fontSize:26,width:100,paddingLeft: 20,color:'#e1e1e1'}}>{vdefMapV2['@labels']['Events'][this.props.language]['name']}</label></div>
			<div>	
			<div style={{position:'relative', textAlign:'center'}}>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 0)} lab={'All'} onClick={()=>this.selectChanged(0)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 1)} lab={'Rejects'} onClick={()=>this.selectChanged(1)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 2)} lab={'Faults'} onClick={()=>this.selectChanged(2)}/>
			<CircularButton style={{width:170, display:'inline-block', marginLeft:5, marginRight:5}} selected={(this.state.curFilter == 3)} lab={'Tests'} onClick={()=>this.selectChanged(3)}/>
			</div>
				
			<div style={{color:'#e1e1e1'}}>
			<table className='npTable'>
			<thead><tr style={{background:'transparent', fontSize:16}}><th style={{width:185}}>{vdefMapV2['@labels']['Timestamp'][this.props.language]['name']}</th><th style={{width:135}}>User</th><th style={{width:185}}>{vdefMapV2['@labels']['Event'][this.props.language]['name']}</th><th style={{width:295}}>{vdefMapV2['@labels']['Details'][this.props.language]['name']}</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
			</div>
			</div>

		</div>)
	}
}
class ProductItem extends React.Component{
	constructor(props) {
		super(props)
		this.state = {name:this.props.name}
		this.switchProd = this.switchProd.bind(this);
		this.copyProd = this.copyProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.accept = this.accept.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	componentWillReceiveProps (newProps) {
		this.setState({name:newProps.name})
	}
	switchProd () {
		var self = this;
		if(!this.props.selected){
			setTimeout(function(){

			self.refs.cfmodal.show();
		},100)	
		}
		
	}
	accept (){
		this.props.switchProd(this.props.p)
	}
	copyProd () {
		this.props.copy();
	}
	deleteProd () {
		if(this.props.selected){
			this.props.deleteCurrent(this.props.p);
	
		}
		//this.props.delete(this.props.p)
	}
	editName () {
		var self = this;
		setTimeout(function () {
		self.refs.nameinput.toggle()
	},100)
	}
	onChange (v) {
		this.setState({name:v})
		this.props.editName(v)
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose() {
		// body...
		this.props.onRequestClose();
	}
	renderMobile(){
		var check= ""
		var dsW = '98%';
		var chkwd = '5%'
		var bkgr = "#362c66"
		var ds = {paddingLeft:'2%', display:'inline-block', width:dsW, background:"#d1d1d1"}
		var st = {padding:7,display:'inline-block',height:50, lineHeight:'50px',fontSize:17}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
			bkgr = "#5aaa5a"
			check = <img src="assets/Check_mark.svg" style={{width:'100%'}}/>
			ds.background = "#5aaa5a";
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
			buttons = <div style={{display:'inline-block'}}>
			<CustomAlertClassedButton alertMessage={'Do you want to delete the current product?'} className='deleteButton_m' style={{display:'inline-block'}} onClick={this.deleteProd}/><button className='copyButton_m' style={{paddingLeft:0, paddingRight:0}} onClick={this.copyProd}></button>
			<button className='editButton_m' style={{paddingLeft:0, paddingRight:0}} onClick={this.editName}></button>
			<CustomKeyboard mobile={true} language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onChange={this.onChange} value={this.state.name} label={this.state.name}/>
		
			</div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			if(this.props.selected){
				editRow = <div style={{display:'inline-block', width:'40%', background:"#5aaa5a"}}>{buttons}</div>
				chkwd = '8.3%'
				ds.width = '58%'
			}
			

		}
		return (<div style={{background:bkgr, color:"#000", position:'relative', textAlign:'left'}}><div style={ds }onClick={this.switchProd}  ><div style={{display:'inline-block', width:chkwd}}>{check}</div><label style={st}>{this.props.p + '.  ' +name}</label></div>{editRow}
				<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{"Do you want to run " + name}</div>
				</AlertModal>
			</div>)
	}
	render () {
		// body..
		if(this.props.mobile){
			return this.renderMobile()
		}
		var check= ""
		var dsW = 250;
		var stW = 212;
		if(this.props.editMode){
			dsW = 380;
			stW = 342;
		}
		var ds = {paddingLeft:7, display:'inline-block', width:dsW, background:"#d1d1d1"}
		var st = {padding:7,display:'inline-block', width:stW, height:65, lineHeight:'65px',fontSize:22}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,display:'inline-block', width:dsW,	 background:"#5aaa5a"}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160
			buttons = <div style={{display:'inline-block'}}><CustomAlertClassedButton alertMessage={'Do you want to delete the current product?'} className='deleteButton' style={{display:'inline-block'}} onClick={this.deleteProd}/><button className='copyButton' style={{paddingLeft:0, paddingRight:0}} onClick={this.copyProd}></button>
			<button className='editButton' style={{paddingLeft:0, paddingRight:0}} onClick={this.editName}></button>
			<CustomKeyboard language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onChange={this.onChange} value={this.state.name} label={this.state.name}/>
		
			</div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			editRow = <div style={{display:'inline-block', marginLeft:mgl, position:'absolute', marginTop:20}}>{buttons}</div>
		}
		return (<div style={{background:"#362c66", color:"#000", position:'relative', textAlign:'left'}}><div style={ds} ><div style={{display:'inline-block', width:22}}>{check}</div><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label></div>{editRow}
				<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{"Do you want to run " + name}</div>
				</AlertModal>
			</div>)
	}
}

class TestReq extends React.Component{
	constructor(props) {
		super(props)
		this.testMan = this.testMan.bind(this);
		this.testMan2 = this.testMan2.bind(this);
		this.testHalo = this.testHalo.bind(this);
		this.testHalo2 = this.testHalo2.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}
	testMan () {
		var packet = dsp_rpc_paylod_for(19,[32,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	testMan2 () {
		var packet = dsp_rpc_paylod_for(19,[32,2,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	testHalo () {
		var packet = dsp_rpc_paylod_for(19,[32,1,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.nextProps.toggle()
	}
	testHalo2 () {
		var packet = dsp_rpc_paylod_for(19,[32,3,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		packet = null;
		this.props.toggle()
	}
	sendOp () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[14,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	quitTest () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[15,0,0])
		socket.emit('rpc', {ip:this.props.ip, data:packet})
		
	}
	renderMobile(){
		
				var testcont = ''
		var ack = ''
		var tdstyle = {width:220}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var opts = []
		var cnt = 0;
		var options = ""
		var funcs = [this.testMan, this.testHalo, this.testMan2, this.testHalo2]
		var fnames = ['Manual','Halo','Manual 2', 'Halo 2']
		for(var i = 0; i<4;i++){
			if(this.props.settings['TestConfigCount'+i+'_0']>0){
				opts.push(<div style={{marginLeft:5, marginRight:5}}>	<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={fnames[i]} onClick={funcs[i]}/></div>)
				cnt++;
			}else{
				opts.push(<div  style={{marginLeft:5, marginRight:5}}>	<CircularButton style={{width:'100%', marginLeft:-8, height:43, borderWidth:5}} lab={fnames[i]} disabled={true} onClick={funcs[i]}/></div>)
			}
		}
		if(cnt == 0){
			options = <div style={{fontSize:25}}>No Tests Configured</div>
		}else{
			options = opts
		}

			
		
		
		testcont = <div  style={{color:'#e1e1e1'}}	>
					<div style={{fontSize:25}}>Select Test</div>

					{options}
				</div>

			
		
		var testprompt = <div>{testcont} </div>
		return testprompt
	}
	render () {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var testcont = ''
		var ack = ''
		var tdstyle = {width:220}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
		var opts = []
		var cnt = 0;
		var options = ""
		var funcs = [this.testMan, this.testHalo, this.testMan2, this.testHalo2]
		var fnames = ['Manual','Halo','Manual 2', 'Halo 2']
		for(var i = 0; i<4;i++){
			if(this.props.settings['TestConfigCount'+i+'_0']>0){
				opts.push(	<CircularButton lab={fnames[i]} onClick={funcs[i]}/>)
				cnt++;
			}else{
				opts.push(	<CircularButton lab={fnames[i]} disabled={true} onClick={funcs[i]}/>)
			}
		}
		if(cnt == 0){
			options = <div style={{fontSize:25}}>No Tests Configured</div>
		}else{
			options =<table>
						<tbody><tr>
							<td style={tdstyle}>{opts[0]}</td><td style={tdstyle}>{opts[1]}</td>
						</tr><tr>
							<td style={tdstyle}>{opts[2]}</td><td style={tdstyle}>{opts[3]}</td>	
						</tr></tbody>
					</table>
		}

			
		
		
		testcont = <div  style={{color:'#e1e1e1'}}	>
					<div style={{fontSize:25}}>Select Test</div>
					<table hidden>
						<tbody><tr>
							<td style={tdstyle} onClick={this.testMan}>Manual</td><td style={tdstyle} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={tdstyle} onClick={this.testMan2}>Manual 2</td><td style={tdstyle} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
					{options}
				</div>

			
		
		var testprompt = <div>{testcont} </div>
		return testprompt
	}
}

class DspClock extends React.Component{
	constructor(props){

		super(props)
		this.state = {dt:'1996/01/01 00:00:00', tick:0}
		this.changeDT = this.changeDT.bind(this);
		this.toggleCK = this.toggleCK.bind(this);
		this.setDT = this.setDT.bind(this);
		this.setDST = this.setDST.bind(this);
	}
	setDST(dst){
		this.props.sendPacket('DaylightSavings',dst)
		this.refs.dtsModal.close();
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
		this.refs.dtsModal.close();
	}
	toggleCK(){
		var self = this;
		//this.refs.ck.toggle()
		this.refs.dtsModal.toggle();
		setTimeout(function(){
			self.refs.dts.getDT(self.state.dt)
		},200)
	}
	render(){
		var dt = this.state.dt;
		if(this.state.tick == 1){
			dt = this.state.dt.slice(0,-1) + (parseInt(this.state.dt.slice(-1))+1).toString();
		}
		return <React.Fragment><label style={{color:'#e1e1e1'}} onClick={this.toggleCK}>{dt}</label>
			<CustomKeyboard num={true} datetime={true} language={this.props.language} tooltip={'Enter Date String in exactly yyyy/mm/dd hh:mm:ss format'} vMap={this.props.vMap}  onFocus={this.onFocus} ref={'ck'} onRequestClose={this.onRequestClose} onChange={this.changeDT} value={this.state.dt} num={false} label={this.state.dt}/>
			<Modal ref='dtsModal'>
				<DateTimeSelect setDST={this.setDST} dst={this.props.dst} language={this.props.language} setDT={this.changeDT} ref='dts'/>
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
	}
	getDT(dtstring){
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
		var date = [parseInt(this.state.year),parseInt(this.state.month),parseInt(this.state.day)]
		date[i] = _date;
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
	render(){

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
		var dpw = <PopoutWheel vMap={vMapV2['Date']} language={this.props.language} interceptor={false} name={'Date'} ref='dpw' val={date} options={[years,months,days]} onChange={this.onDateChange}/>
		var tpw = <PopoutWheel vMap={vMapV2['Time']} language={this.props.language} interceptor={false} name={'Time'} ref='tpw' val={time} options={[hours,minutes,secs]} onChange={this.onTimeChange}/>
		var dstpw = <PopoutWheel vMap={vMapV2['DST']} language={this.props.language} interceptor={false} name={'Daylight Savings'} ref='dstpw' val={[this.props.dst]} options={[['off','on']]} onChange={this.onDSTChange}/>
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}


		    
		var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26,fontWeight:500, color:"#eee"}} >
			<div style={{display:'inline-block', textAlign:'center'}}>DateTime</div></h2></span>)
		var clr = "#e1e1e1"
		var dateItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.dpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Date'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</label></div></div>
			</div>)
		var timeItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.tpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Time'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</label></div></div>
			</div>)
		var dstItem =  (<div className='sItem noChild' style={{borderCollapse:'collapse'}} onClick={()=>this.refs.dstpw.toggle()}>
			<label style={{display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}}>{'Daylight Savings'}</label>
			<div style={vlabelswrapperStyle}><div style={vlabelStyle}><label style={_st}>{tg[this.props.dst]}</label></div></div>
			</div>)
		return <div style={{position:'relative'}}>{tpw}{dpw}{dstpw}
		<div>
		{titlediv}
		
		</div>
			{dateItem}
			{timeItem}
			{dstItem}
			<button className='customAlertButton' onClick={this.setDT}>Set DateTime</button>
		</div> 
	}
}

class CalibIndicator extends React.Component{
	constructor(props) {
		super(props)
		this.renderMobile = this.renderMobile.bind(this);
	}
	render() {
		if(this.props.mobile){
			return this.renderMobile()
		}
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:20}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:22}
   		}
   		var label = this.props.label
   		if(this.props.lab2){
   			var lab2 = this.props.lab2
   			if(this.props.mphase > 1){
   				lab2 += (' - M'+this.props.mphase)
   			}
   			label = <div>
   				<div style={{lineHeight:'45px'}}>{this.props.label}</div><div style={{lineHeight:'22px'}}>{lab2}</div>
   			</div>
   		}
		rstyle.padding = 8;
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <div style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'75px'}} onClick={this.editValue}>{this.props.value}</div>
		if(this.props.offset != 0){
			var offset = this.props.offset.toString();
			if(this.props.offset > 0){
				offset = '+'+offset
			}
			kb = <div style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'37px'}} onClick={this.editValue}><div>{this.props.value}</div>
			<div>{offset}</div></div>
			
		}
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:75}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton'>
			<div style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' style={rstyle}>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv' style={tbst}>{label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:75}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton'>
			<div style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' style={rstyle}>
				<div className='tbDiv' style={tbst}>{label}</div>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
	renderMobile() {
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:13}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:16}
   		}
		rstyle.padding = 5;
		rstyle.height = 50
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		//var lab2 = this.props.lab2
   			if(this.props.mphase > 1){
   				lab2 += (' - M'+this.props.mphase)
   			}
		var ckb = <CustomKeyboard mobile={this.props.mobile} language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <div style={{fontSize:20, textAlign:'center', width:'100%', display:'inline-block', lineHeight:'50px', marginLeft:-14}} onClick={this.editValue}>{this.props.value}</div>
		if(this.props.offset != 0){
			var offset = this.props.offset.toString();
			if(this.props.offset > 0){
				offset = '+'+offset
			}
			kb = <div style={{fontSize:20, textAlign:'center', width:'100%', display:'inline-block', lineHeight:'25px', marginLeft:-14}} onClick={this.editValue}><div>{this.props.value}</div><div>{offset}</div></div>
			
		}
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' style={rstyle}>
				<div className='pbContain_m'>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' style={rstyle}>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
				<div className='pbContain_m' style={{borderTopRightRadius:25, borderBottomRightRadius:25}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
}
ReactDOM.render(<Container/>,document.getElementById('content'))

