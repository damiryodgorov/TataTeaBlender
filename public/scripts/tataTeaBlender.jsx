const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
const timezoneJSON = require('./timezones.json');
const FtiSockIo = require('./ftisockio.js')
import { Uint64LE } from 'int64-buffer';
import { CircularButton } from './buttons.jsx';
import { CustomKeyboard, EmbeddedKeyboard } from './keyboard.jsx';
import { PopoutWheel } from './popwheel.jsx';
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { AlertModal, AuthfailModal, LockModal, MessageModal, Modal, ProgressModal, ScrollArrow, TrendBar } from './components.jsx';
import { YAxis, XAxis, HorizontalGridLines, VerticalGridLines, XYPlot, AreaSeries, Crosshair, LineSeries,ChartLabel } from "react-vis";
import "react-vis/dist/style.css";
import { Line } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
var onClickOutside = require('react-onclickoutside');
/** Global variable declarations **/
const DISPLAYVERSION = '2022/03/01'
const FORTRESSPURPLE1 = 'rgb(40, 32, 72)'
const FORTRESSPURPLE2 = '#5d5480'
const SPARCBLUE2 = '#30A8E2'
const SPARCBLUE1 = '#1C3746'
var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',fontSize:26,lineHeight:'57px'}
var innerStyle2 = {display:'inline-block', position:'relative', verticalAlign:'middle',fontSize:22,lineHeight:'57px'}
var backgroundColor = FORTRESSPURPLE1;
var inputSrcArr = ["NONE","TACH","EYE","RC1","RC2","ISO_1","IO_PL8_01","IO_PL8_02","IO_PL8_03","IO_PL8_04","IO_PL8_05","IO_PL8_06","IO_PL8_07","IO_PL8_08","IO_PL8_09","IO_PL6_01","IO_PL6_02","IO_PL6_03"];
var outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

const vdefMapV2 = require('./vdefmaptata.json')
const funcJSON = require('./funcjson.json')
let vdefByMac = {};
var _Vdef;
var _pVdef;
var _nVdf;
var liveTimer = {}
var categories;
var netMap = vdefMapV2['@netpollsmap']
var vMapV2 = vdefMapV2["@vMap"]
var vMapLists = vdefMapV2['@lists']
var categoriesV2 = [vdefMapV2["@pages"]['CWSys']]
var catMapV2 = vdefMapV2["@catmap"]
var labTransV2 = vdefMapV2['@labels']
let SingletonDataStore = {sysRec:{},prodRec:{}}
/*************Helper functions start**************/
function FormatWeight(wgt, unit){
  if(typeof wgt == 'undefined'){
    wgt = 0;
  }else if(wgt == null){
    wgt = 0;
  }
    if(unit == 1){
      if(wgt>=10000000)
      {
        return (wgt/1000000).toFixed(1)+' tonne'
      }
      else{
        return (wgt/1000).toFixed(1) + ' kg'
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
      }else{
        pAcc = par.passAcc;
      }
    }
    console.log("_vmap[p]",_vmap[p]);
    pAcc = Math.max(passAcc, pAcc);
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
    		}/*else if(_vmap[p]['@interceptor']){
        
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
        }*/else if(_vmap[p]['@test']){
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
/*************Helper functions end**************/
/********************************************************** */
/*Opening a websocket connection between the client and server */

var serverURL = 'ws://'+location.host;
var socket = new FtiSockIo(serverURL,true);

socket.on('vdef', function(vdf){
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
/********************************************************** */
/******************Main Components start********************/
class Container extends React.Component {
	render(){
        return(
            <ErrorBoundary autoReload={false}>
                <LandingPage/>
            </ErrorBoundary>
        )
    }
}
class LandingPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {level:0,username:'No User',userid:0,user:-1,accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''],
                      liveWeight:0.0,updateCount:0,faultArray:[],warningArray:[],language:'english',branding:'FORTRESS',fram:{},srec:{},prec:{},rec:{},crec:{},cob:{},pcob:{},
                      unusedList:{},checkPrecInterval:null,version:'2018/07/30',connected:false,init:false,currentPage:'landing',start:true,pause:false,stop:false,
                      timezones:[],curDet:'',ioBITs:{},mbunits:[],dets:[], detL:{}, macList:[],nifip:'', nifnm:'',nifgw:'',connectedClients:0,confirmPressed:0,
                      custMap:vdefMapV2,vMap:vdefMapV2,customMap:true,data:[],currentView:'',plannedBatches:[],prodNames:[],pList:[],prodList:{},prodListRaw:{}}

        this.showDisplaySettings = this.showDisplaySettings.bind(this);
        this.onMixtureMenuOpen = this.onMixtureMenuOpen.bind(this);
        this.onPrimeMenuOpen = this.onPrimeMenuOpen.bind(this);
        this.onBatchStartMenuMenuOpen = this.onBatchStartMenuMenuOpen.bind(this);
        this.onEnableAddbackOpen = this.onEnableAddbackOpen.bind(this);
        this.onEmptyOpen = this.onEmptyOpen.bind(this);
        this.onPurgeAOpen = this.onPurgeAOpen.bind(this);
        this.onPurgeBOpen = this.onPurgeBOpen.bind(this);
        this.onPurgeCOpen = this.onPurgeCOpen.bind(this);
        this.onSilenceAlarmOpen = this.onSilenceAlarmOpen.bind(this);
        this.onStatisticsOpen = this.onStatisticsOpen.bind(this);
        this.onParamMsg = this.onParamMsg.bind(this);
        this.getCob = this.getCob.bind(this);
        this.getUCob = this.getUCob.bind(this);
        this.onRMsg = this.onRMsg.bind(this);
        this.loadPrefs = this.loadPrefs.bind(this);
        this.loginClosed = this.loginClosed.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.tryAgain = this.tryAgain.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.toggleLogin = this.toggleLogin.bind(this);
        this.setAuthAccount = this.setAuthAccount.bind(this);
        this.formatUSB = this.formatUSB.bind(this);
        this.reboot = this.reboot.bind(this);
        this.resetCalibration = this.resetCalibration.bind(this);
        this.openUnused = this.openUnused.bind(this);
        this.submitTooltip = this.submitTooltip.bind(this);
        this.listChange = this.listChange.bind(this);
        this.transChange = this.transChange.bind(this);
        this.setTrans = this.setTrans.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.settingClick = this.settingClick.bind(this);
        this.changeView = this.changeView.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.getProdList = this.getProdList.bind(this);
        this.start = this.start.bind(this);
        this.resume = this.resume.bind(this);
        this.pause = this.pause.bind(this);
        this.stop = this.stop.bind(this);
        this.unusedModal = React.createRef();
        this.usd = React.createRef();
        this.sd = React.createRef();
        this.am = React.createRef();
        this.lgoModal = React.createRef();
        this.resetPass = React.createRef();
        this.loginControl = React.createRef();
        this.fclck = React.createRef();
        this.lockModal = React.createRef();
        this.settingsModal = React.createRef();
        this.mixtureModal = React.createRef();
        this.primeModal = React.createRef();
        this.batchStartModal = React.createRef();
        this.enableAddbackModal = React.createRef();
        this.emptyModal = React.createRef();
        this.purgeAModal = React.createRef();
        this.purgeBModal = React.createRef();
        this.purgeCModal = React.createRef();
        this.silenceAlarmModal = React.createRef();
        this.statisticsModal = React.createRef();
    }
    /** Life Cycle Method **/
    componentDidMount(){
        /** Establishing the connection **/
        var self = this;
        setTimeout(function (argument) {
            self.loadPrefs();
        }, 100)
        ifvisible.setIdleDuration(300);
        ifvisible.on("idle", function(){
          self.logout()
        });
        socket.on('userNames', function(p){
          self.setState({usernames:p.det.data.array})
        })
        socket.on('locatedResp', function (e) {
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
            socket.emit('getTimezones')
        });
        socket.on('timezones',function (e) {
            // body...
            self.setState({timezones:e})
        })
        socket.on('gw', function(gw){
            self.setState({nifgw:gw})
        })
        socket.on('nif', function(iface){
          self.setState({nifip:iface.address, nifnm:iface.netmask})
        })
        socket.on('notvisible', function(e){
            toast('Detectors located, but network does not match')
        })
        socket.on('version',function (version) {
            self.setState({version:version})
        })
        socket.on('prefs', function(f) {
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
        socket.on('paramMsgCW', function(data) {
          //self.onParamMsg(data.data, data.det)
          self.onParamMsg(data.data, data.det)
          data = null;
          
        })
        socket.on('authResp', function(pack){
          if(pack.reset){
             self.resetPass.current.show(pack)
            self.setAuthAccount(pack)
          }else{
            self.setAuthAccount(pack)
      
          }
        })
        socket.on('authFail', function(pack){
          self.am.current.show(pack.user, pack.ip)
          self.setAuthAccount({username:labTransV2['Not Logged In'][this.state.language]['name'], level:0, user:-1})
        })
        socket.on('notify',function(msg){
          self.notify(msg)
        })
        socket.on('connectedClients',function (c) {
          var fram = self.state.fram
          fram.ConnectedClients = c
          self.setState({connectedClients:c,fram:fram, noupdate:false})
        })
        socket.on('custJSON',function (json) {
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
        socket.on('onReset', function(r){
          self.setState({currentPage:'landing', curDet:''});
        })
        socket.on('batchJson',function (json) {
          self.setState({plannedBatches:JSON.parse(json.replace(/\s/g, '').replace(/\0/g, ''))})
        })
        socket.on('prodNames',function (pack) {
          if(self.state.curDet.ip == pack.ip){
            self.setState({pList:pack.list, prodNames:pack.names, noupdate:false})
          }
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
    /**sendPacket function used to send rpc requests to the server */
    
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
          }else if(e.type == 1){
            //this.getProdList()
            SingletonDataStore.prodRec = e.rec;
            setTimeout(function (argument) {
              // body...
              if(!self.state.init){
                self.sendPacket('refresh_buffer',7)
              }
            },200)
            this.setState({noupdate:false,prec:e.rec,cob:this.getCob(this.state.srec, e.rec, this.state.rec,this.state.fram), unusedList:this.getUCob(this.state.srec, e.rec, this.state.rec,this.state.fram), pcob:this.getPCob(this.state.srec,e.rec, this.state.rec,this.state.fram)})
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
            /*if(e.rec['Taring'] != this.state.rec['Taring']){
              if(e.rec['Taring'] == 1){
                //toast('Taring..')
                this.tBut.current.tStart('Taring');
              }else if(e.rec['Taring'] == 2){
                this.tBut.current.tDone('Tared')
              }else{
                this.tBut.current.tEnd();
              }
            }*/
            
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
                //this.ss.current.setState({rec:e.rec, crec:this.state.crec, lw:FormatWeight(lw,this.state.srec['WeightUnits'])})
                /*if (this.ssDual && this.ssDual.current){
                  this.ssDual.current.setState({rec:e.rec, crec:this.state.crec, lw:FormatWeight(lw,this.state.srec['WeightUnits'])})
                }
                if(this.sd.current){
    //                console.log('update Live Weight')
                  this.sd.current.updateLiveWeight(lw)
                }
                cob = this.getCob(this.state.srec, this.state.prec, e.rec,this.state.fram);
                pcob = this.getPCob(this.state.srec, this.state.prec, e.rec,this.state.fram)*/
              noupdate = false
              this.setState({liveWeight:e.rec['LiveWeight'],rec:e.rec,ioBITs:iobits})
            }
            if(e.rec['BatchRunning'] != this.state.rec['BatchRunning']){
              if(typeof this.state.rec['BatchRunning'] != 'undefined'){
                if(e.rec['BatchRunning'] == 1){
                  //toast('Batch Started');
                  /*this.ste.current.showMsg(labTransV2['Batch Started'][language]['name'])
                  if (this.steDual && this.steDual.current){
                    this.steDual.current.showMsg(labTransV2['Batch Started'][language]['name'])
                  }*/
                  //this.lg.current.clearHisto();
                  setTimeout(function () {
                    self.getRefBuffer(7)
                    // body...
                  },100)
                }else if(e.rec['BatchRunning'] == 2){
                  // toast('Batch Paused')
                  /*this.ste.current.showMsg(labTransV2['Batch Paused'][language]['name'])
                  if (this.steDual && this.steDual.current){
                    this.steDual.current.showMsg(labTransV2['Batch Paused'][language]['name'])
                  }*/
                }else{
                  //this.msgm.current.show('Batch Stopped')
                  /*this.ste.current.showMsg(labTransV2['Batch Stopped'][language]['name'])
                  if (this.steDual && this.steDual.current){
                    this.steDual.current.showMsg(labTransV2['Batch Stopped'][language]['name'])
                  }*/
                  //  toast('Batch Stopped')
                }
                noupdate = false
              }
              /*if(e.rec['BatchRunComplete'] != this.state.rec['BatchRunComplete']){
                if(typeof this.state.rec['BatchRunComplete'] != 'undefined'){
                  if(e.rec['BatchRunComplete'] == 1){
                    this.msgm.current.show(labTransV2['Batch Completed'][language]['name'])
                    this.ste.current.showMsg(labTransV2['Batch Completed'][language]['name'])
                    if (this.steDual && this.steDual.current){
                      this.steDual.current.showMsg(labTransV2['Batch Completed'][language]['name'])
                    }
                  }
                }
              }*/
            }
            //this.setState({calibState:e.rec['Calibrating'],faultArray:faultArray,start:(e.rec['BatchRunning'] != 1),pcob:pcob,cob:cob, stop:(e.rec['BatchRunning'] != 0), pause:(e.rec['BatchRunning'] == 1),warningArray:warningArray,updateCount:(this.state.updateCount+1)%4, noupdate:noupdate, live:true})
            
          }else if(e.type == 3){
            console.log("Record type 3");
            e.rec.Nif_ip = this.state.nifip
            e.rec.Nif_gw = this.state.nifgw
            e.rec.Nif_nm = this.state.nifnm
            e.rec.Nif_mac = this.state.curDet.mac
            e.rec.ConnectedClients = this.state.connectedClients
            SingletonDataStore.framRec = e.rec;
           /* if(this.state.srec['RemoteDisplayLock'] == 1){
              if(typeof e.rec['InternalIP'] != 'undefined'){
                if(window.location.host != e.rec['InternalIP']){
                  this.lockModal.current.show(labTransV2['This display has been locked for remote use'][language]['name'])
                }
              }
              
            }*/
           this.setState({fram:e.rec,cob:this.getCob(this.state.srec, this.state.prec, this.state.rec,e.rec)})
          }else if(e.type == 5){
            console.log("Record type 5");
            /*var packms = new Uint64LE(e.rec['PackTime'].data)
            e.rec['PackTime'] = packms
            if((e.rec['PackTime'] != this.state.crec['PackTime']) ||(e.rec['TotalCnt'] != this.state.crec['TotalCnt']) ||(e.rec['CheckWeightCnt'] != this.state.crec['CheckWeightCnt'])){
            var del = 25
            var dur = 50
            if(typeof this.state.prec["SampDelEnd"] != 'undefined'){
              del = this.state.prec['SampDelEnd'];
              dur = this.state.prec['SampDur'];
            }
            var ms = new Uint64LE(e.rec['BatchStartMS'].data)
            var sms = new Uint64LE(e.rec['SampleStartMS'].data)
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
            if(e.rec['WeightPassed'] == 9){
              this.setState({cwgt:e.rec['PackWeight'], noupdate:false})
            }
            }else{
              console.log('repeated pack')
            }
            if (this.props.lane){
              this.props.update(this.props.lane)
            }
            */

          }else if(e.type == 6){
            console.log("Record type 6");
            /*var cnt = 0;
            if(typeof this.state.crec['TotalCnt'] != 'undefined'){
              cnt = this.state.crec['TotalCnt']
            }
            this.setState({packSamples:e.rec,noupdate:true})*/
          }else if(e.type == 7){
            console.log("Record type 7");
            /*if(this.btc.current){
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
            }*/
          }else if(e.type == 15){
            console.log("Record type 15");
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
      var vdef = vdefByMac[this.state.curDet.mac]
      var _cvdf = JSON.parse(JSON.stringify(vdef[6]['Unused']))
      var cob =  iterateCats2(_cvdf, vdef[1],sys,prod, vdef[5],dyn,fram)
      vdef = null;
      _cvdf = null;
      return cob
    }
    /******************Authentication Function Controls************ */
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
      // console.log(pack,668)
      this.setState({level:pack.level, username:pack.username,noupdate:false, update:true, userid:pack.user+1, user:pack.user}) 
    }
    authenticate(user,pswd){
      socket.emit('authenticate',{user:parseInt(user) - 1,pswd:pswd, ip:this.state.curDet.ip})
    }
    logout(){
      if(this.state.level != 0){
        var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_RPC_USERLOGOUT']
        var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
        socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
        this.setState({level:0, userid:0,user:-1, username:'Not Logged In',noupdate:false})
      }
    }
    loginClosed(){
      this.setState({loginOpen:false});
    }
    login(v){
      this.setState({level:v,noupdate:false})
    }
    forgotPassword(id,ip){
      socket.emit('passReset',{ip:ip,data:{user:id}})
    }
    resetPassword(pack,v){
      var packet = {ip:pack.ip, data:{user:pack.user, password:v}}
      socket.emit('writePass', packet)
    }
    tryAgain(){
      this.loginControl.current.login();
    }
    toggleLogin(){
      var self = this;
      if(this.state.user == -1){
        this.loginControl.current.login();
        this.setState({loginOpen:true})
      }else{
        setTimeout(function (argument) {
          // body...
           self.lgoModal.current.show(self.logout, 0, "You will be logged out")
        },100)
      }
    }
    /**************************************************************** */
    /**Response message */
    notify(msg){
      console.log("Received message ", msg)
        /*if(this.batModal.current.state.show){
          this.batModal.current.showMsg(msg)
        }else if(this.pmodal.current.state.show){
            if(msg == 'Reject Setup is invalid!'){
              this.setState({rejectAlertMessage:msg})
            }
            else{
              this.pmodal.current.showMsg(msg)
              this.setState({rejectAlertMessage:''})
            }
        }else if(this.settingModal.current.state.show){
          this.settingModal.current.showMsg(msg)
          this.setState({rejectAlertMessage:''})
        }else if(this.cwModal.current.state.show){
          this.cwModal.current.showMsg(msg)
        }else if(msg!='Reject Setup is invalid!'){
          this.msgm.current.show(msg)
        }*/
    }
    /**Connecting with the server **/
    loadPrefs(){
      if(socket.sock.readyState  == 1){
       socket.emit('getVersion',true);
      }
    }
    /**Connect To the Unit (Registration Process with the board) */
    connectToUnit(det){
      console.log('connect To Unit')
      var self = this;
      socket.emit('connectToUnit',{ip:det.ip, app:'FTI_CW', app_name:'FTI_CW'})
      var unit = {name:det.name, type:'single', banks:[det]}
      setTimeout(function (argument) {
        // body...
        // console.log(1308, unit)
        socket.emit('savePrefsCW', [unit])
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
    }
    /**************************************************************** */
    /**Functions used to open the Settings Menu**/
    showDisplaySettings(){
      var self = this;
      if(this.state.connected){
        this.sendPacket('refresh')
      }else{
        socket.emit('locateReq',true)
      }
      setTimeout(function () {
        self.settingsModal.current.toggle()
      },100)
      setTimeout(function () {
        socket.emit('getConnectedClients')
      },200)
    }
    renderModal() {
      var self = this;
      var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

      var detectors = this.state.dets.map(function (det, i) {
        // body...
        return   <div> <CircularButton language={self.state.language} branding={self.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={det.ip} onClick={()=> self.connectToUnit(det)}/></div>
         
      })
        return (<div>
          {detectors}
        </div>)
    }
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
    openUnused(){
      this.unusedModal.current.toggle();
    }
    resetCalibration(){
      this.setState({confirmPressed:1})
    }
    /****************************************************************** */
    /**Functions used to open the Mixture Menu**/
    onMixtureMenuOpen(){
        this.mixtureModal.current.toggle();
    }
    getProdList(){
      this.sendPacket('getProdList')
    }
    /**Reboot function used to reboot the system */
    reboot(){
      socket.emit('reboot')
    }
    formatUSB(){
      socket.emit('formatInternalUsb')
    }
    /**Function used to open the Prime Menu**/
    onPrimeMenuOpen(){
        this.primeModal.current.toggle();
    }
    /**Function used to open the Batch Start Menu**/
    onBatchStartMenuMenuOpen(){
        this.batchStartModal.current.toggle();
    }
    /**Function used to open the Enable Addback Menu**/
    onEnableAddbackOpen(){
        this.enableAddbackModal.current.toggle();
    }
    /**Function used to open the Empty Menu**/
    onEmptyOpen(){
        this.emptyModal.current.toggle();
    }
    /**Function used to open the Purge A Menu**/
    onPurgeAOpen(){
        this.purgeAModal.current.toggle();
    }
    /**Function used to open the Purge B Menu**/
    onPurgeBOpen(){
        this.purgeBModal.current.toggle();
    }
    /**Function used to open the Purge C Menu**/
    onPurgeCOpen(){
        this.purgeCModal.current.toggle();
    }
    /**Function used to open the Silence Alarm Menu**/
    onSilenceAlarmOpen(){
        this.silenceAlarmModal.current.toggle();
    }
    /**Function used to open the Statistics Menu**/
    onStatisticsOpen(){
        this.statisticsModal.current.toggle();
    }
    /**Update Translations**/
    submitTooltip(n,l,v){
      var custMap = this.state.custMap
      custMap['@vMap'][n]['@translations'][l]['description'] = v
      socket.emit('saveCustomJSON',JSON.stringify(custMap));
    }
    listChange(n,l,v){
      var custMap = this.state.custMap
      custMap['@lists'][n][l] = v
      socket.emit('saveCustomJSON',JSON.stringify(custMap));
    }
    transChange(n,l,v){
      var custMap = this.state.custMap
      custMap['@vMap'][n]['@translations'][l]['name'] = v
      socket.emit('saveCustomJSON',JSON.stringify(custMap));
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
    /***************** Batch Control*****************/
    start(){
      var self = this;
      if((this.state.srec['PassOn'] == 0) || (this.state.level >= this.state.srec['PassAccStartStopBatch'])){
        if(this.state.srec['BatchMode'] == 0){
          this.sendPacket('BatchStart')
          this.setState({start:false, pause:true})
        }else if(this.state.srec['BatchMode'] == 1){
          socket.emit('getPlannedBatches', self.state.curDet.ip)
          setTimeout(function(argument) {
            //self.planStart.current.toggle();
          },200)
          
        }else if(this.state.srec['BatchMode'] == 2){
            //this.manStart.current.toggle();          
        }
      }else{
        //this.msgm.current.show('Access Denied')
      }
      
    }
    resume(){
        this.sendPacket('BatchStart')
        this.setState({start:false, pause:true})
    }
    pause(){
      this.sendPacket('BatchPause')
      this.setState({start:true, pause:false, stop:true})
    }
    stop(){
      var self =this;
      this.sendPacket('BatchPause')
      this.setState({start:true, pause:false, stop:true})
      setTimeout(function(){
        //self.stopConfirm.current.show()
      }, 150)
      
    }
    sendPacket(n,v){
      var self = this;
      
      var vdef = vdefByMac[self.state.curDet.mac]
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          var packet = dsp_rpc_paylod_for(rpc[0],pkt, buf);
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
        
        }else if(n == 'factoryReset'){
          var rpc = vdef[0]['@rpc_map']['KAPI_PROD_FACTORY_RESET']
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          setTimeout(function (argument) {
            socket.emit('getProdList', self.state.curDet.ip)
          },150)
        }else if( n == 'refresh'){
          var rec = 0;
          if(v){
            rec = v
          }
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
          var packet = dsp_rpc_paylod_for(rpc[0],[rpc[1][0],rec,0])
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'refresh_buffer'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
          var packet = dsp_rpc_paylod_for(rpc[0],[rpc[1][0],v,0])
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'BatchStart'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
          var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'BatchStartSel'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
          var buf = Buffer.alloc(4)
          buf.writeUInt32LE(v,0)
          var packet = dsp_rpc_paylod_for(rpc[0],rpc[1], buf)
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'BatchStartNew'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STARTBATCH']
          var packet = dsp_rpc_paylod_for(rpc[0],rpc[1], v)
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'BatchPause'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_PAUSEBATCH']
          var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if( n == 'BatchEnd'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_STOPBATCH']
          var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
          socket.emit('rpc',{ip:this.state.curDet.ip, data:packet}) 
        }else if(n=='DateTime'){
          var rpc = vdef[0]['@rpc_map']['KAPI_RPC_DATETIMEWRITE']
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);            
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
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
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
        }else if(n['@rpcs']['clear']){
          var packet = dsp_rpc_paylod_for(n['@rpcs']['clear'][0], n['@rpcs']['clear'][1],n['@rpcs']['clear'][2]);
          socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})
        }
      }
    }
    /************************************************/
  render(){

    /**Declaration of Theme and Button variables**/
    var language = this.state.language;
    var pl = 'assets/play-arrow-sp.svg'
    var img = 'assets/NewFortressTechnologyLogo-WHT-trans.png';
    var startButton = <div className='circularButton' style={{backgroundColor:'#11DD11', width:220, float:'left', lineHeight:'60px',color:'black',font:30, display:'inline-block',marginTop:12, marginRight:5, borderWidth:1,height:60}}> 
                            <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Start'}</div>
                      </div>
    var silenceAlarmButton = <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:310, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Silence Alarm'} onClick={this.onSilenceAlarmOpen}/> 
    var statisticsButton = <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Statistics'} onClick={this.onStatisticsOpen}/> 
    var logklass = 'logout'
    if(this.state.user == -1){
      logklass = 'login'
    }
    /**End of Theme and Button variables declarations**/
    /**Settings Component Parameters */
    var cont = ''
    var sd = <div><DisplaySettings soc={socket} nifip={this.state.nifip} nifgw={this.state.nifgw} nifnm={this.state.nifnm} language={this.state.language} branding={this.state.branding}/>
      <button onClick={this.reboot}>{labTransV2['Reboot'][language]['name']}</button><button onClick={this.formatUSB}>{labTransV2['Format USB and Reboot'][language]['name']}</button></div>
    var unused = ''
    var dets=''
    var cald=''
    var lw = 0;
    var statusStr = labTransV2['Good Weight'][language]['name']
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
        statusStr = vMapV2[this.state.faultArray[0]+'Mask']['@translations']['english']['name'] + ' ' + labTransV2['Fault Active'][language]['name']
      }else{
         statusStr = this.state.faultArray[0] +  ' ' + labTransV2['Active'][language]['name']
      }
    }else{
      statusStr = this.state.faultArray.length + ' ' + labTransV2['Faults Active'][language]['name']
    }
    }else if(this.state.crec['WeightPassed']%2 == 1){
      statusLed = <img src="assets/led_circle_yellow.png"/>
    }

    if(this.state.srec['SRecordDate']){
      sd = <div><div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>{labTransV2['System Settings'][language]['name']}</div></div>
      <SettingsPageWSB  resetCalibration={this.resetCalibration} soc={socket} timezones={this.state.timezones} timeZone={this.state.srec['Timezone']} dst={this.state.srec['DaylightSavings']} openUnused={this.openUnused} submitList={this.listChange} submitChange={this.transChange} submitTooltip={this.submitTooltip} calibState={1} setTrans={this.setTrans} setTheme={this.setTheme} onCal={'this.calWeightSend'} onCalCancel={'this.calWeightCancelSend'} branding={this.state.branding} int={false} usernames={this.state.usernames} mobile={false} Id={'SD'} language={this.state.language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.sd} data={this.state.data} 
        onHandleClick={this.settingClick} dsp={this.state.curDet.ip} mac={this.state.curDet.mac} cob2={[this.state.cob]} cvdf={vdefByMac[this.state.curDet.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prec} sysSettings={this.state.srec} crec={this.state.crec} dynSettings={this.state.rec} framRec={this.state.fram} level={this.state.level} accounts={this.state.usernames} vdefMap={this.state.vMap}/>
      
      </div>

      cont = sd;
      /*cald = (<div style={{background:'#e1e1e1', padding:10}}>
        <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'CalWeight'} vMap={vMapV2['CalWeight']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['CalWeight']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.srec['CalWeight'], this.state.srec['WeightUnits'])} editable={true} onEdit={this.sendPacket} param={vdefByMac[this.state.curDet.mac][1][0]['CalWeight']} num={true}/></div>
        <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'OverWeightLim'} vMap={vMapV2['OverWeightLim']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['OverWeightLim']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.prec['OverWeightLim'], this.state.srec['WeightUnits'])} param={vdefByMac[this.state.curDet.mac][1][1]['OverWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
        <div style={{marginTop:5}}><ProdSettingEdit getMMdep={this.getMMdep} trans={true} name={'UnderWeightLim'} vMap={vMapV2['UnderWeightLim']}  language={this.state.language} branding={this.state.branding} h1={40} w1={200} h2={51} w2={200} label={vMapV2['UnderWeightLim']['@translations'][this.state.language]['name']} value={FormatWeight(this.state.prec['UnderWeightLim'], this.state.srec['WeightUnits'])} param={vdefByMac[this.state.curDet.mac][1][1]['UnderWeightLim']} editable={true} onEdit={this.sendPacket} num={true}/></div>
        <CircularButton language={this.state.language} branding={this.state.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.calWeightSend} lab={labTransV2['Calibrate'][language]['name']}/>
        </div>)*/

      unused = <div style={{background:'#e1e1e1', padding:10}}><SettingsPage soc={this.props.soc} black={true} submitList={this.listChange} submitChange={this.transChange} submitTooltip={this.submitTooltip} calibState={1} setTrans={this.setTrans} setTheme={this.setTheme} onCal={'this.calWeightSend'} branding={this.state.branding} int={false} usernames={this.state.usernames} mobile={false} Id={'uSD'} language={language} mode={'config'} setOverride={this.setOverride} faultBits={[]} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref ={this.usd} data={this.state.data} 
        onHandleClick={this.settingClick} dsp={this.state.curDet.ip} mac={this.state.curDet.mac} cob2={[this.state.unusedList]} cvdf={vdefByMac[this.state.curDet.mac][4]} sendPacket={this.sendPacket} prodSettings={this.state.prec} sysSettings={this.state.srec} dynSettings={this.state.rec} framRec={this.state.fram} level={4} accounts={this.state.usernames} vdefMap={this.state.vmap}/></div>
    }else{
      dets = this.renderModal()
      cont = <div><div style={{display:'table-cell', width:330,backgroundColor:'#e1e1e1',textAlign:'center'}} >
        <div style={{textAlign:'center', fontSize:25, marginTop:5, marginBottom:5}}>{labTransV2['Located Units'][language]['name']}</div>{dets}</div><div style={{display:'table-cell', width:840, paddingLeft:5, paddingRight:5}}>{sd}</div></div>
    } 

    return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
                <div style={{marginLeft:'auto',marginRight:'auto',maxWidth:1280, width:'100%',textAlign:'left'}}>
                    <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
                        <tbody>
                            <tr>
                                <td><img style={{height: 67,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:16}} src={img}/></td>
                                <td>
                                    <Mixture onMixtureMenuOpen={this.onMixtureMenuOpen} productName={this.state.prec['ProdName']}/>
                                </td>
                                <td style={{height:60, width:190, color:'#eee', textAlign:'right'}}>
                                    <div style={{fontSize:28,paddingRight:6}}>{this.state.username}</div>
                                    <div>
                                      <FatClock timezones={this.state.timezones} timeZone={this.state.srec['Timezone']} branding={this.state.branding} dst={this.state.srec['DaylightSavings']} sendPacket={this.sendPacket} language={this.state.srec['Language']} ref={this.fclck} style={{fontSize:16, color:'#e1e1e1', paddingRight:6, marginBottom:-17}}/>
                                    </div>
                                </td>
                                <td className="logbuttCell" style={{height:60}} onClick={this.toggleLogin}>
                                    <div style={{paddingLeft:3, borderLeft:'2px solid #fff', borderRight:'2px solid #fff',height:55, marginTop:16, paddingLeft:10, paddingRight:10}}>
                                    <button className={logklass} style={{height:50, marginTop:-7}} onClick={this.toggleLogin} />
                                    <div style={{color:'#e1e1e1', marginTop:-15, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{labTransV2['Level'][this.state.language]['name'] +' '+this.state.level}</div>
                                    </div>
                                </td>
                                <td className="confbuttCell" style={{paddingRight:5}} onClick={this.showDisplaySettings}>
                                    <button onClick={this.showDisplaySettings} className={'config_w'} style={{marginTop:5, marginLeft:2,marginBottom:-10, paddingLeft:10}}/>
                                    <div style={{color:'#e1e1e1', marginTop:-20, marginBottom:-17, height:34, fontSize:18, textAlign:'center', paddingLeft:5}}>{'Settings'}</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                            <tr style={{verticalAlign:'top'}}>
                                <td>
                                    <TeaAndFlavour productRecord={this.state.prec} systemRecord={this.state.srec} liveRecord={this.state.rec} liveWeight={this.state.liveWeight}/>
                                    <AddBack productRecord={this.state.prec} systemRecord={this.state.srec} liveRecord={this.state.rec} liveWeight={this.state.liveWeight}/>
                                    <LineGraph/>
                                    {startButton}
                                    {silenceAlarmButton}
                                    {statisticsButton}
                                </td>
                                <td>
                                    <SideButtonsMenu onPrimeMenuOpen={this.onPrimeMenuOpen} onBatchStartMenuMenuOpen={this.onBatchStartMenuMenuOpen} onEnableAddbackOpen={this.onEnableAddbackOpen} onEmptyOpen={this.onEmptyOpen} onPurgeAOpen={this.onPurgeAOpen} onPurgeBOpen={this.onPurgeBOpen} onPurgeCOpen={this.onPurgeCOpen}/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <Modal x={true} ref={this.settingsModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onMixtureClose}>
                        {cont}
                    </Modal>
                    <Modal x={true} ref={this.mixtureModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onMixtureClose}>
                      <ProductSettings RejSetupInvalid={this.state.rec.RejSetupInvalid} EditProdNeedToSave={this.state.rec.EditProdNeedToSave} rejectAlertMessage={''}  soc={socket} usb={this.state.rec['ExtUsbConnected'] == true} sendPacket={this.sendPacket} getProdList={this.getProdList} level={this.state.level} liveWeight={FormatWeight(this.state.liveWeight,this.state.srec['WeightUnits'])} startB={this.start} resume={this.resume} statusStr={statusStr} weightUnits={this.state.srec['WeightUnits']}  start={this.state.start} stop={this.state.stop} stopB={this.stop} pause={this.pause} submitList={this.listChange} 
                        submitChange={this.transChange} submitTooltip={this.submitTooltip} vdefMap={this.state.vMap} onClose={this.closeProductMenu}  editProd={this.state.srec['EditProdNo']} needSave={this.state.rec['EditProdNeedToSave']} language={language} ip={this.state.curDet.ip} mac={this.state.curDet.mac} 
                        curProd={this.state.prec} runningProd={this.state.srec['ProdNo']} srec={this.state.srec} drec={this.state.rec} crec={this.state.crec} fram={this.state.fram} branding={this.state.branding} prods={this.state.prodList} pList={this.state.pList} pNames={this.state.prodNames}/>
                    </Modal>
                    <Modal x={true} ref={this.primeModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Prime Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.batchStartModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Batch Start Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.enableAddbackModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Enable Addback Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.emptyModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Empty Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.purgeAModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Purge A Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.purgeBModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Purge B Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.purgeCModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Purge C Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.silenceAlarmModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Silence Alarm Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.statisticsModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onPrimeClose}>
                        <h1 style={{color:'white'}}>Statistics Menu</h1>
                    </Modal>
                    <LogInControl2 language={this.state.language} branding={this.state.branding} ref={this.loginControl} onRequestClose={this.loginClosed} isOpen={this.state.loginOpen} 
                          pass6={this.state.srec['PasswordLength']} level={this.state.level}  mac={this.state.curDet.mac} ip={this.state.curDet.ip} logout={this.logout} 
                          accounts={this.state.usernames} authenticate={this.authenticate} login={this.login} val={this.state.userid}/>
                      <AuthfailModal language={this.state.language} ref={this.am} forgot={this.forgotPassword} tryAgain={this.tryAgain}/>
                      <UserPassReset language={this.state.language} ref={this.resetPass} mobile={!this.state.brPoint} resetPassword={this.resetPassword}/>
                      <LogoutModal language={this.state.language} ref={this.lgoModal} branding={this.state.branding}/>
                    <LockModal ref={this.lockModal} branding={this.state.branding}/>
                </div>
            </div>
      ) 
  }

}

class Mixture extends React.Component{
    constructor(props){
	    super(props)
	}

    render(){
        var img = 'assets/tataTeaBlender/beaker.png';
        return(
            <div className='mixtureSection'>
                <div className='circularButton' onClick={this.props.onMixtureMenuOpen} style={{width:150, float:'left', lineHeight:'60px',color:'white',font:30, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:1,height:60}}> 
                    <img src={img} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Mixture'}</div>
                </div>
                <h3 className='mixtureName'>{!this.props.productName ? 'Connecting ...' : this.props.productName}</h3>
                <div className='status'>
                    Status:
                </div>
                
            </div>
        )
    }
}
class TeaAndFlavour extends React.Component{
    constructor(props){
      super(props);
    }
    render(){
      /*console.log("live records", this.props.liveRecord);
      console.log("system records ", this.props.systemRecord);
      console.log("product records ", this.props.productRecord);*/
        return(
            <div className='teaAndFlavourSection'>
                <table className='categoryTable'>
                    <tbody>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Hopper</td>
                            <td style={{fontWeight:'bold'}}>TEA</td>
                            <td style={{fontWeight:'bold'}}>FLAVOUR</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Live Weight Tared</td>
                            <td style={{fontWeight:'bold'}}>{Number(this.props.liveWeight).toFixed(1)} g</td>
                            <td style={{fontWeight:'bold'}}>{Number(this.props.liveWeight).toFixed(1)} g</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Target Feed Rate</td>
                            <td style={{fontWeight:'bold'}}>{typeof this.props.productRecord['TeaTargetFeedRate'] == 'undefined'? '0.0' : Number(this.props.productRecord['TeaTargetFeedRate']).toFixed(1)} g/min</td>
                            <td style={{fontWeight:'bold'}}>{typeof this.props.productRecord['FlavourTargetFeedRate'] == 'undefined'? '0.0' : Number(this.props.productRecord['FlavourTargetFeedRate']).toFixed(1)} g/min</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Actual Feed Rate</td>
                            <td style={{fontWeight:'bold'}}>0.0 g/min</td>
                            <td style={{fontWeight:'bold'}}>0.0 g/min</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Feed Speed</td>
                            <td style={{fontWeight:'bold'}}>{typeof this.props.liveRecord['TeaFeedSpeed'] == 'undefined' ? '0.0' : Number(this.props.liveRecord['TeaFeedSpeed']).toFixed(1)} %</td>
                            <td style={{fontWeight:'bold'}}>{typeof this.props.liveRecord['FlavourFeedSpeed'] == 'undefined' ? '0.0' : Number(this.props.liveRecord['FlavourFeedSpeed']).toFixed(1)} %</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                            <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class AddBack extends React.Component{
  constructor(props){
    super(props);
  }
    render(){
        return(
            <div className='addBackSection'>
               <table className='addBackTable'>
                    <tr style={{fontWeight:'bold'}}>ADD BACK</tr>
                    <tr style={{fontWeight:'bold'}}>{Number(this.props.liveWeight).toFixed(1)} g</tr>
                    <tr style={{fontWeight:'bold'}}>{typeof this.props.productRecord['AddbackTargetFeedRate'] == 'undefined' ? '0.0' : Number(this.props.productRecord['AddbackTargetFeedRate']).toFixed(1)} g/min</tr>
                    <tr style={{fontWeight:'bold'}}>0.0 g/min</tr>
                    <tr style={{fontWeight:'bold'}}>{typeof this.props.productRecord['AddbackFeedSpeed'] == 'undefined' ? '0.0' : Number(this.props.liveRecord['AddbackFeedSpeed']).toFixed(1)} %</tr>
                    <tr>
                        <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                    </tr>
               </table>
            </div>
        )
    }
}
class LineGraph extends React.Component{
    render(){
      const data = [
        {x: 0, y: 2.7},
        {x: 1, y: 3.2},
        {x: 2, y: 2.8},
        {x: 6, y: 2.6},
        {x: 8, y: 2.2}
      ];
      const topLineData = [
        {x: 0, y: 3.5},
        {x: 1, y: 3.5},
        {x: 2, y: 3.5},
        {x: 6, y: 3.5},
        {x: 8, y: 3.5}
      ];
      const middleLineData = [
        {x: 0, y: 3},
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 6, y: 3},
        {x: 8, y: 3}
      ];
      const bottomLineData = [
        {x: 0, y: 2.5},
        {x: 1, y: 2.5},
        {x: 2, y: 2.5},
        {x: 6, y: 2.5},
        {x: 8, y: 2.5}
      ];
        return(
            <div className='lineGraphSection'>
              
              <XYPlot height={280} width= {980}>
                <XAxis style={{ line: {stroke: 'black'}}}/>
                <YAxis style={{ line: {stroke: 'black'}}}/>
                <LineSeries data={topLineData} color="red"/>
                <LineSeries data={middleLineData} color="green"/>
                <LineSeries data={bottomLineData} color="red"/>
                <LineSeries data={data} curve={'curveMonotoneX'} color="black" />
              </XYPlot>
                {/*<Line
                    data={{
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [
                        {
                            data: [2.8,3.8,2.5,1.5,2.7,1],
                            borderColor: [
                            'black'
                            ],
                            borderWidth: 5,
                            tension: 0.5
                        },
                        {
                        data: [3.5,3.5,3.5,3.5,3.5,3.5],
                        borderColor: [
                            'red'
                        ],
                        borderWidth: 2,
                        },
                        {
                        data: [3,3,3,3,3,3],
                        borderColor: [
                        'green'
                        ],
                        borderWidth: 2,
                        },
                        {
                        data: [2.5,2.5,2.5,2.5,2.5,2.5],
                        borderColor: [
                            'red'
                        ],
                        borderWidth: 2,
                        }
                    ],
                    }}
                    height={400}
                    width={600}
                    options={{
                        plugins: {
                            legend: {
                            display: false
                            }
                        },
                        maintainAspectRatio: false,

                        elements: {
                            point:{
                                radius: 0
                            }
                        },
                        scales: {
                            y: {
                                suggestedMin: 0,
                                ticks: {
                                    // Include a dollar sign in the ticks
                                    callback: function(value, index, values) {
                                        return value+'%';
                                    }
                                }
                            },
                            x: {
                                display:false
                            }
                        }         
                    }}
                />*/}
            </div>
        )
    }
}
class SideButtonsMenu extends React.Component{
    render(){
        return(
            <div className='sideButtonsSection'>
                <CircularButton language={'english'} innerStyle={innerStyle} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25, fontWeight:'bold'}} lab={'Prime'} onClick={this.props.onPrimeMenuOpen}/> 
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Batch Start'} onClick={this.props.onBatchStartMenuMenuOpen}/>  
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Enable Addback'} onClick={this.props.onEnableAddbackOpen}/> 
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Empty'} onClick={this.props.onEmptyOpen}/> 
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge A'} onClick={this.props.onPurgeAOpen}/> 
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge B'} onClick={this.props.onPurgeBOpen}/> 
                <CircularButton language={'english'} branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge C'} onClick={this.props.onPurgeCOpen}/> 
            </div>
        )
    }
}
/******************Main Components end********************/

/** Timezone Components used to display the system clock **/
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

  render(){
    var style = Object.assign({}, this.props.style);

    return <React.Fragment>
    <div style={style} onClick={this.toggleCK}>{this.state.date}</div>
      <Modal language={this.props.language} ref={this.dtsModal} innerStyle={{background:'#e1e1e1'}}>
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
      <div style={{display:'inline-block', textAlign:'center'}}>{labTransV2['DateTime_Word'][this.props.language]['name']}</div></h2></span>)
    var clr = "#e1e1e1"
 
    var dateItem = (<div style={{margin:2}} onClick={()=>this.dpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
      {labTransV2['Date'][this.props.language]['name']}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</div>
      </div>
      </div>)

    var timeItem = (<div style={{margin:2}} onClick={()=>this.tpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
      {labTransV2['Time'][this.props.language]['name']}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.hour +':'+this.state.minute+':'+this.state.sec}</div>
      </div>
      </div>)
    var dstItem =  (<div style={{margin:2}} onClick={()=>this.dstpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {labTransV2['Daylight Savings'][this.props.language]['name']}
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
      <button className='customAlertButton' onClick={this.setDT}>{labTransV2['Set DateTime'][this.props.language]['name']}</button>
    </div> 
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
      <div style={{display:'inline-block', textAlign:'center'}}>{labTransV2['Device Time'][this.props.language]['name']}</div></h2></span>)
    var clr = "#e1e1e1"
 
    var dateItem = (<div style={{margin:2}} onClick={()=>this.dpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {labTransV2['Date'][this.props.language]['name']}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{this.state.year +'/'+this.state.month+'/'+this.state.day}</div>
      </div>
      </div>)

    var timeItem = (<div style={{margin:2}} onClick={()=>this.tpw.current.toggle()}>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, color:txtClr, width:300,textAlign:'center'}}>
        {labTransV2['Time'][this.props.language]['name']}
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
             <CircularButton language={this.props.language} onClick={this.setDT} branding={this.props.branding} innerStyle={innerStyle} style={{width:280, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Confirm'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:280, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Cancel'][this.props.language]['name']}/>
   
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
    return <Modal language={this.props.language} ref={this.dtsModal} innerStyle={{background:'#e1e1e1'}}>
        <DateTimeSelector cancel={() => this.dtsModal.current.close()} branding={this.props.branding} language={this.props.language} setDT={this.changeDT} ref={this.dts}/>
      </Modal>
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
      {labTransV2['Time Zone'][this.props.language]['name']}
      </div>
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}>
        <div style={st}>{tzTxt}</div>
      </div>
      </div>)


    return <React.Fragment>{tzItem}{tz}</React.Fragment>
  }
}
/*******************Authentication Components*************** */
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
    var levels = [labTransV2['none'][this.props.language]['name'],labTransV2['operator'][this.props.language]['name'],labTransV2['technician'][this.props.language]['name'],labTransV2['engineer'][this.props.language]['name']]
    var pw     =  <PopoutWheel inputs={inputSrcArr} ovWidth={290} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={labTransV2['Filter Events'][this.props.language]['name']} ref={this.pw} val={[this.state.curlevel]} options={[levels]} onChange={this.selectChanged}/>
    var userkb =  <CustomKeyboard language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={labTransV2['Username'][this.props.language]['name']}/>
    var pswdkb =  <CustomKeyboard language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={labTransV2['Password'][this.props.language]['name']}/>
    var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
    var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
    var _st = {textAlign:'center',lineHeight:'60px', height:60, width:536, display:'table-cell', position:'relative'}

    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} ><div style={{display:'inline-block', textAlign:'center'}}>{labTransV2['Accounts'][this.props.language]['name']}</div></h2></span>)
    var st = {padding:7,display:'inline-block', width:180}
    
    var accTableRows = [];
    
    this.props.accounts.forEach(function(ac,i){
      accTableRows.push(<AccountRow soc={self.props.soc} branding={self.props.branding} mobile={self.props.mobile} language={self.props.language} lvl={self.props.level} change={self.props.level > 3} username={ac.username} acc={ac.acc} password={'*******'} uid={i} saved={true} ip={self.props.ip}/>)
    })
    
    var backBut = (<div className='bbut' onClick={this.goBack}><img style={{marginBottom:-5, width:32}} src='assets/return_blk.svg'/>
            <label style={{color:'#000', fontSize:24}}>{labTransV2['Back'][this.props.language]['name']}</label></div>)
    var tstl = {display:'inline-block', textAlign:'center'}
      var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>{labTransV2['Accounts'][this.props.language]['name']}</div></h2></span>)
      
      if (this.state.font == 1){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>{labTransV2['Accounts'][this.props.language]['name']}</div></h2></span>)
      }else if (this.state.font == 0){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:"#000"}} >{backBut}<div style={tstl}>{labTransV2['Accounts'][this.props.language]['name']}</div></h2></span>)
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
    
    var namestring = labTransV2['User'][this.props.language]['name']+ this.props.uid
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
      
      var pw = this.state.username!='ADMIN' && <PopoutWheel branding={this.props.branding} ovWidth={290} inputs={inputSrcArr} outputs={outputSrcArr} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={labTransV2['Set Level'][this.props.language]['name']}ref={this.pw} val={[this.state.acc]} options={[levels]} onChange={this.selectChanged}/>
    var userkb = this.state.username!='ADMIN' && <CustomKeyboard branding={this.props.branding} language={this.props.language} num={false} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.username} onChange={this.onUserChange} value={this.state.username} label={labTransV2['Username'][this.props.language]['name']}/>
    var pswdkb = <CustomKeyboard branding={this.props.branding} language={this.props.language} pwd={true} num={true} onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref={this.pswd} onChange={this.onPswdChange} value={''} label={labTransV2['Password'][this.props.language]['name']}/>
      
      var edit = <Modal language={this.props.language} mobile={this.props.mobile} ref={this.ed} onClose={this.saveChanges} innerStyle={{background:modBG}}>
      <div style={{textAlign:'center', background:'#e1e1e1', padding:10}}>

        <div style={{marginTop:5}} onClick={() => this.username.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{labTransV2['Username'][this.props.language]['name'] + ': '}
        </div>    <div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}><label style={st}>{this.state.username}</label></div></div>
        <div style={{marginTop:5}} onClick={() => this.pswd.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{labTransV2['Password'][this.props.language]['name'] + ': '}
        </div>    <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:496}}><label style={st}>{this.state.password.split("").map(function(c){return '*'}).join('')}</label></div></div>
        <div style={{marginTop:5}} onClick={() => this.pw.current.toggle()}><div  style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:fSize,zIndex:1, lineHeight:'38px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr,color:txtClr, width:300,textAlign:'center'}} >{labTransV2['Level'][this.props.language]['name'] + ': '}
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
      <div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:'50px', borderRadius:15,height:50, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:486}}>
        {vLabels}
      </div>
      {edit}

      <MessageModal language={this.props.language} ref={this.msgm}/>
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

      //this.setState({val:props.val, list:list})
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
        this.msgm.current.show(labTransV2['Password should be 6 characters'][this.props.language]['name'])
      }
    }else{
      if(v.length == 4){
        this.props.authenticate(this.state.val,v)
      }else{
        this.msgm.current.show(labTransV2['Password should be 4 characters'][this.props.language]['name'])
      }
    }
    
  }
  toggleAccountControl(){
    if(this.props.level > 2){
      this.setState({showAcccountControl:!this.state.showAcccountControl})
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
    var namestring = labTransV2['Select User'][this.props.language]['name']
    var pw = <PopoutWheel inputs={inputSrcArr} tooltipOv={true} tooltip={vdefMapV2['@tooltips']['Select User'][this.props.language]} outputs={outputSrcArr} ovWidth={290} branding={this.props.branding} mobile={this.props.mobile} vMap={this.props.vMap} language={this.props.language} index={0} interceptor={false} name={namestring} ref={this.pw} val={[this.props.val]} options={[list]} onChange={this.selectChanged} onCancel={this.onCancel}/>

    return <React.Fragment>{pw}
      <CustomKeyboard passwordKeyboard={true} branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.psw} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Password'}/>
    <MessageModal language={this.props.language} ref={this.msgm}/>
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
        this.msgm.current.show(labTransV2['Password should be 6 characters'][this.props.language]['name'])
      }
    }else{
      if(v.length == 4){
        this.props.resetPassword(this.state.pack,v)
      }else{
        this.msgm.current.show(labTransV2['Password should be 4 characters'][this.props.language]['name'])
      }
    }
  }
  render(){
    return <React.Fragment>
        <CustomKeyboard mobile={this.props.mobile} language={this.props.language} pwd={true} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.psw} onRequestClose={this.onRequestClose} onChange={this.valChanged} index={0} value={''} num={true} label={'Reset Password'}/>
        <MessageModal  language={this.props.language} ref={this.msgm} />
    </React.Fragment>
  }
}
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
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>{labTransV2['Confirm Action'][this.props.language]['name']}</div>
          <div style={{color:clr}}> {this.props.children}</div>
        <div>
          <CircularButton language={this.props.language} onClick={this.do} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Confirm'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Cancel'][this.props.language]['name']}/>
          
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
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>{labTransV2['Confirm Action'][this.props.language]['name']}</div>
          <div style={{color:clr}}> {this.props.children}</div>
        <div>
          <CircularButton language={this.props.language} onClick={this.do} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Confirm'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Cancel'][this.props.language]['name']}/>
          
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
    cont =  <DeleteModalCont branding={this.props.branding} vMap={this.props.vMap} delete={this.delete} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}><div style={{width:400}}>{labTransV2['Delete Selected Product?'][this.props.language]['name']+'.'}</div></DeleteModalCont>
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
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}>{labTransV2['Confirm Action'][this.props.language]['name']}</div>
          <div style={{color:clr}}>
          {this.props.children}
          </div>
        <div>
                <CircularButton language={this.props.language} onClick={this.delete} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Delete Product'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Cancel'][this.props.language]['name']}/>
          
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
          <div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:clr, fontSize:30}}><div>{labTransV2['Warning'][this.props.language]['name']}</div><div style={{fontSize:24}}>{labTransV2['This will make changes to current batch'][this.props.language]['name']}</div></div>
          {this.props.children}
        <div>
          <CircularButton language={this.props.language} onClick={this.discard} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Discard Changes'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.save} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Save Changes'][this.props.language]['name']}/>
                <CircularButton language={this.props.language} onClick={this.cancel} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Cancel'][this.props.language]['name']}/>
          
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
    this.showAlertMessageForProducts = this.showAlertMessageForProducts.bind(this);
    this.advProdMgmt = this.advProdMgmt.bind(this);
    this.copyFromDef = this.copyFromDef.bind(this);
    this.showProdMgmtTooltip = this.showProdMgmtTooltip.bind(this);
    this.stopConfirmed = this.stopConfirmed.bind(this);
    this.showMessageAlert = this.showMessageAlert.bind(this);
    this.msgm = React.createRef();
    this.stopConfirm = React.createRef();
    this.deleteAllProductsAlert = React.createRef();
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
    //this.props.sendPacket("refresh_buffer",6)
  }
  shouldComponentUpdate(newProps,nextState){
    //console.log('Component Will Receive')
    if(newProps.needSave != this.props.needSave){
      if(newProps.needSave == 1){
       if(this.pgm.current.state.show){
        this.pmd2.current.show();
       }else{
         this.pmd.current.show()
       }
       
      }
      if(newProps.needSave == 0){
          this.pmd.current.close()
      }
    }
    if(newProps.needSave!=1){
      if(newProps.RejSetupInvalid == 0)
      {
        this.msgm.current.close()
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
        this.msgm.current.show(labTransV2['Changes not permitted'][this.props.language]['name'] + '.')
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
      toast(labTransV2['Products need to be fetched'][this.props.language]['name'])
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
      this.props.sendPacket('switchProd',this.state.selProd);
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name']);
    }
  }
  selectRunningProd(){
    var prodEditAcc = this.props.level >= this.props.srec['PassAccSelectProduct'];
      if(this.props.srec['PassOn'] == 0){
        prodEditAcc = true;
      }
      if(prodEditAcc){
        if(this.props.drec['BatchRunning']==1 || this.props.drec['BatchRunning']==2){
          if(this.props.curProd['BatchNumber'] != this.props.prods[this.state.selProd]['BatchNumber'])
          {
            this.stop();
          }
        }else{
          //if(this.props.curProd['BatchNumber'] != this.props.prods[this.state.selProd]['BatchNumber'])
          //{
            this.props.sendPacket('switchProd',this.state.selProd);
         // }
        }
      }else{
        this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name']);
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
    }
  }
  copyFromFt(){
     if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
          this.cfTo.current.toggle();
          this.setState({copyMode:2})
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
    }
  }
  copyFromDef(){
     if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
          this.cfTo.current.toggle();
          this.setState({copyMode:1})
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
    }
  }
  copyConfirm(target){
    var t = parseInt(target)
    var prodNos = this.props.pList.slice(0)
    // console.log('copyConfirm', t, prodNos)
    if(t == this.props.srec['ProdNo']){
      this.msgm.current.show(labTransV2['Cannot overwrite current running product'][this.props.language]['name'] +'.')
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
    var alertMessage = labTransV2['Product'][this.props.language]['name'] + ' '+ target+labTransV2['will be overwritten. Continue?'][this.props.language]['name']

    this.cfModal.current.show(this.copyCurrentProd, target, alertMessage)
  }
  deleteProd(p){
    if((this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccAdvProdEdit'])){
      this.dltModal.current.show(p)
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
  showAlertMessageForProducts(){
    this.deleteAllProductsAlert.current.show();
  }
  deleteAllProducts(){
    if((this.props.srec['PassOn'] == 0) || (this.props.level >= 4 )){
      var self=this;
      this.sendPacket('deleteAll')
      setTimeout(function (argument) {
        // body...
        self.props.sendPacket('getProdList')
      },300)
      /*setTimeout(()=>{
        this.msgm.current.show('Products Deleted Successfully');
      },2000)*/
      
      //this.props.onClose();
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])}
  }
  advProdMgmt(){
    this.apmgmt.current.show();
  }
  showProdMgmtTooltip(){
    this.prodMgmtTooltip.current.show();
  }
  showMessageAlert(){ 
      if(this.props.rejectAlertMessage == 'Reject Setup is invalid!' && showAlertMessageInProductMenu == 0 && !this.pgm.current.state.show && !alreadyDisplayedRejectSetupMessageInProductMenu)
      {
        this.msgm.current.show(this.props.rejectAlertMessage)        
        showAlertMessageInProductMenu = 1;
        alreadyDisplayedRejectSetupMessageInProductMenu=true;
      }else if(this.props.rejectAlertMessage == 'Reject Setup is invalid!' && showAlertMessageInPackGraphMenu == 0 && !alreadyDisplayedRejectSetupMessageInProductMenu && this.pgm.current.state.show){
        this.pgm.current.showMsg(this.props.rejectAlertMessage)
        showAlertMessageInPackGraphMenu = 1;
        showAlertMessageInProductMenu = 1;
      }
  }
  render(){    
    setTimeout(()=>{
      this.showMessageAlert()
    },2000)
    
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
      <EmbeddedKeyboard label={labTransV2['Search Products'][this.props.language]['name']} liveUpdate={this.updateFilterString} language={this.props.language} onAccept={this.toggleSearch} onCancel={this.closeKeyboard}/></div>
    }else{
      var curProd = {}
      var pList = [];
      var showText = labTransV2['Show All Products'][this.props.language]['name']
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
        showText = labTransV2['Hide Inactive Products'][this.props.language]['name']
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
        if(curProd['FeedbackCorRate'].includes('grams/pulse') || curProd['FeedbackCorRate'].includes('grams/sec'))
				{ if(this.props.weightUnits == 2 || this.props.weightUnits == 3)
          {
            if(curProd['FeedbackCorRate'].includes('grams/pulse'))
            {
              newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/pulse","oz/pls");
            }else if(curProd['FeedbackCorRate'].includes('grams/sec')){
              newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/sec","oz/s");
            }
            var twoParts = newFeedbackCorRate.split(' ');
            var number = Number(twoParts[0]);
            var unit = twoParts[1];
            newFeedbackCorRate = (number/28.3495).toFixed(2) + " " + unit;
          }
          else{
            if(curProd['FeedbackCorRate'].includes('grams/pulse'))
            {
              newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/pulse","g/pls");
            }else if(curProd['FeedbackCorRate'].includes('grams/sec')){
              newFeedbackCorRate= curProd['FeedbackCorRate'].replace("grams/sec","g/s");
            }
            var twoParts = newFeedbackCorRate.split(' ');
            var number = twoParts[0];
            var unit = twoParts[1];
            newFeedbackCorRate = Number(number).toFixed(1) + " " + unit;
          }
          
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
      console.log("vdefByMac[this.props.mac]",vdefByMac[this.props.mac])
      content =( 
      <div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6,height:480}}>
        <div>
        <div style={{display:'inline-block', verticalAlign:'top'}}>
        <ProdSettingEdit prodNameComponent={true} afterEdit={this.props.getProdList} acc={prodEditAcc} trans={true} name={'ProdName'} vMap={vMapV2['ProdName']}  language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={60} w2={300} label={labTransV2['Product Name'][this.props.language]['name']} value={curProd['ProdName']} param={vdefByMac[this.props.mac][1][1]['ProdName']} tooltip={vMapV2['ProdName']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={false}/></div>
        <div style={{display:'inline-block', marginLeft:5, marginTop:-5}}><CircularButton language={this.props.language} onClick={this.selectRunningProd} branding={this.props.branding} innerStyle={selStyle} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:50, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Select Product'][this.props.language]['name']}/>
        <img src='assets/graph.svg' style={{position:'absolute', width:40, left:770, marginTop:15}} onClick={this.toggleGraph}/>
        
        </div>
        <div style={{display:'none', marginBottom:-10}}>
          <div style={{display:'none', position:'relative', verticalAlign:'top'}} onClick={this.toggleSearch}>
            <div style={{height:35, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{height:35, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{position:'absolute',float:'right', marginTop:-70, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:50}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>{labTransV2['Search'][this.props.language]['name']}</div></div>
          </div>
        </div>
        </div>
        <div style={{height:339}}>
          <div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
            {/*<div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'FeedRate'} vMap={vMapV2['FeedRate']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Feed Rate'][this.props.language]['name']} value={nwgt} param={vdefByMac[this.props.mac][1][1]['TeaTargetFeedRate']} tooltip={vMapV2['FeedRate']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'InfeedRunTime'} vMap={vMapV2['InfeedRunTime']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Infeed Run Time'][this.props.language]['name']} value={ovwgt} param={vdefByMac[this.props.mac][1][1]['TeaInfeedRunTime']} tooltip={vMapV2['InfeedRunTime']['@translations'][this.props.language]['description']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'LowerWeightLimit'} vMap={vMapV2['PkgWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Packaging Weight'][this.props.language]['name']} value={pkgwgt} param={vdefByMac[this.props.mac][1][1]['TeaLowerWeightLimit']}  tooltip={vMapV2['PkgWeight']['@translations'][this.props.language]['description']} onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'PkgWeight'} vMap={vMapV2['PkgWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Packaging Weight'][this.props.language]['name']} value={pkgwgt} param={vdefByMac[this.props.mac][1][1]['TeaUpperWeightLimit']}  tooltip={vMapV2['PkgWeight']['@translations'][this.props.language]['description']} onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'PkgWeight'} vMap={vMapV2['PkgWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Packaging Weight'][this.props.language]['name']} value={pkgwgt} param={vdefByMac[this.props.mac][1][1]['TeaEmptyWeightLimit']}  tooltip={vMapV2['PkgWeight']['@translations'][this.props.language]['description']} onEdit={this.sendPacket} editable={true} num={true}/></div>*/}
           {/* <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'EyePkgLength'} vMap={vMapV2['EyePkgLength']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Product Length'][this.props.language]['name']} value={this.getValue(curProd['EyePkgLength'], 'EyePkgLength')} tooltip={vMapV2['EyePkgLength']['@translations'][this.props.language]['description']} param={vdefByMac[this.props.mac][1][1]['EyePkgLength']}  onEdit={this.sendPacket} editable={true} num={true}/></div>
            <div style={{marginTop:5}}><ProdSettingEdit acc={prodEditAcc} getMMdep={this.getMMdep}  submitChange={this.submitChange} trans={true} name={'VfdBeltSpeed1'} vMap={vMapV2['VfdBeltSpeed1']} language={this.props.language} branding={this.props.branding} h1={40} w1={200} h2={51} w2={200} label={labTransV2['Belt Speed'][this.props.language]['name']} value={this.getValue(curProd['VfdBeltSpeed1'],'VfdBeltSpeed1')}  tooltip={vMapV2['VfdBeltSpeed1']['@translations'][this.props.language]['description']} param={vdefByMac[this.props.mac][1][1]['VfdBeltSpeed1']} onEdit={this.sendPacket} editable={true} num={true} shortcut={[4]} onShortcut={this.onShortcut} /></div>*/}
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
      
      return <div> <ProductSelectItem language={self.props.language} advAcc={advProdEditAcc} sendPacket={self.props.sendPacket} branding={self.props.branding} name={prd.name} p={prd.no} isNull={prd.null} deleteProd={self.deleteProd} selectProd={self.selectProd} selected={(self.state.selProd == prd.no)} running={(self.props.runningProd == prd.no)}/>
         </div>
    })

    if(list.length == 0){
      prods = <div style={{textAlign:'center', width:297,padding:5}}>{labTransV2['No Matching Products'][this.props.language]['name']}</div>
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
       <div style={{color:'#e1e1e1', fontSize:25}}><div style={{display:'inline-block'}}>{labTransV2['Create New Product'][this.props.language]['name']+':'}</div>  <div  style={{float:'right', display:'inline-block',marginRight:20}}><img src='assets/help.svg' onClick={this.showProdMgmtTooltip} width={30}/></div>
      </div>
       <div style={{textAlign:'center'}}>
            <CircularButton language={this.props.language} onClick={this.copyTo} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['From Selected Product'][this.props.language]['name']}/>
            <CircularButton language={this.props.language} onClick={this.copyFromDef} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['From Base Product'][this.props.language]['name']}/>
         
            <CircularButton language={this.props.language} onClick={this.copyFromFt} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['From Factory Product'][this.props.language]['name']}/>
            <CircularButton language={this.props.language} onClick={this.advProdMgmt} branding={this.props.branding} innerStyle={innerStyle} style={{width:550, display:'block',marginLeft:'auto', marginRight:'auto', borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Product Records Management'][this.props.language]['name']}/>
         
         
          </div>
          <Modal language={this.props.language} ref={this.prodMgmtTooltip}>
            <div style={{color:'#e1e1e1', whiteSpace:'break-spaces'}}>
              {vdefMapV2['@tooltips']['ProductManagement'][this.props.language]}
            </div>
          </Modal>
    </div>

    var usbMsg = ''
    var usbButStyle = innerStyle;
    if(!this.props.usb){
      usbMsg = <div style={{color:'#ff0000', textAlign:'center'}}>{labTransV2['Plug in USB Key'][this.props.language]['name']}</div>
      usbButStyle.color = '#aaa'
    }
    var advProdMgmt = <div>
       <div style={{color:'#e1e1e1', fontSize:25}}>{labTransV2['Advanced Options'][this.props.language]['name']}</div>
       {usbMsg}
          <div>
            <CircularButton language={this.props.language} onClick={this.onImport} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Import'][this.props.language]['name']}/>
            <CircularButton language={this.props.language} onClick={this.onExport} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Export'][this.props.language]['name']}/>
          </div>
          <div>
            <CircularButton language={this.props.language} onClick={this.onRestore} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Restore'][this.props.language]['name']}/>
            <CircularButton language={this.props.language} onClick={this.onBackup} disabled={!this.props.usb} branding={this.props.branding} innerStyle={usbButStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Backup'][this.props.language]['name']}/>
          </div>
          <div>
            <CircularButton language={this.props.language} onClick={this.showAlertMessageForProducts} branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15, boxShadow:'none'}} lab={labTransV2['Delete All'][this.props.language]['name']}/>
          </div>
    </div>
    //   <div onClick={this.copyTo} style={{display:'table-cell',height:85, borderRight:'2px solid #ccc', width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>+ Copy Current Product</div>
    return <div style={{width:1155}}>
      <div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:720, paddingLeft:10}}>{labTransV2['Product'][this.props.language]['name']}</div><div style={{display:'inline-block', fontSize:20,textAlign:'right',width:400}}>{labTransV2['Current Product'][this.props.language]['name']+': '+spstr }</div></div>
      <table style={{borderCollapse:'collapse'}}><tbody>
        <tr>
          <td style={{verticalAlign:'top', width:830}}>{content}<div style={{width:819, paddingTop:0}}>  
          <BatchWidget language={this.props.language} acc={(this.props.srec['PassOn'] == 0) || (this.props.level >= this.props.srec['PassAccStartStopBatch'])} sendPacket={this.props.sendPacket} liveWeight={this.props.liveWeight} batchRunning={this.props.drec['BatchRunning']} canStartBelts={this.props.drec['CanStartBelts']} onStart={this.props.startB} onResume={this.props.resume} pause={this.props.pause} start={this.props.start} stopB={this.props.stopB} status={this.props.statusStr} netWeight={FormatWeight(this.props.crec['PackWeight'], this.props.weightUnits)}/>
          </div></td><td style={{verticalAlign:'top',textAlign:'center'}}>
          <ScrollArrow language={this.props.language} ref={this.arrowTop} offset={72} width={72} marginTop={-40} active={SA} mode={'top'} onClick={this.scrollUp}/>
          <div style={{display:'none', background:'#e1e1e1', padding:2}}>
             <div style={{position:'relative', verticalAlign:'top', marginLeft:180}} onClick={this.toggleSearch}>
            <div style={{height:25, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{height:25, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
            <div style={{position:'absolute',float:'right', marginTop:-53, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:40}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>{labTransV2['Search'][this.props.language]['name']}</div></div>
          </div>
          </div>
          <div onScroll={this.onProdScroll} id='prodListScrollBox' style={{height:490, background:'#e1e1e1',overflowY:'scroll'}}>{prods}
          </div>
          <div style={{height:85,lineHeight:'85px', background:'#e1e1e1', borderTop:'1px solid #362c66'}}>
          <div onClick={this.prodMgmt} style={{display:'table-cell',height:85, borderRight:'1px solid #362c66', width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>{labTransV2['Product Management'][this.props.language]['name']}</div>
          
          <div onClick={this.toggleSearch} style={{display:'table-cell',height:85, borderLeft:'1px solid #362c66',width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}><img src='assets/search.svg' style={{width:40}}/><div style={{marginTop:-10, fontSize:16}}>{labTransV2['Search'][this.props.language]['name']}</div></div>
          </div>
          <ScrollArrow language={this.props.language} ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
      
          </td>
        </tr>
      </tbody></table>
      <PromptModal language={this.props.language} branding={this.props.branding} ref={this.pmd} save={this.saveProductPassThrough} discard={this.passThrough} onClose={this.onPromptCancel}/>
      <CustomKeyboard branding={this.props.branding} mobile={this.props.mobile} language={this.props.language} pwd={false} vMap={this.props.vMap}  onFocus={this.onFocus} ref={this.cfTo} onRequestClose={this.onRequestClose} onChange={this.copyConfirm} index={0} value={''} num={true} label={labTransV2['Target Product'][this.props.language]['name']}/>
      
      <CopyModal language={this.props.language} ref={this.cfModal}  branding={this.props.branding}/>
      <DeleteModal language={this.props.language} ref={this.dltModal} branding={this.props.branding} deleteProd={this.deleteProdConfirm}/>
      <Modal language={this.props.language} x={true} Style={{maxWidth:1100}} innerStyle={{maxHeight:600}} ref={this.pgm} branding={this.props.branding}>
        
        <PromptModal language={this.props.language} branding={this.props.branding} ref={this.pmd2} save={this.saveProductPassThrough} discard={this.passThrough} onClose={this.onPromptCancel}/>
      
      </Modal>
      <Modal language={this.props.language} x={true} Style={{width:870, marginTop:50}} ref={this.pmgmt} branding={this.props.branding}>
        {createNew}
        <Modal language={this.props.language} x={true} Style={{width:870, marginTop:50}} ref={this.apmgmt} branding={this.props.branding}>{advProdMgmt}</Modal>
      </Modal>
      <AlertModal language={this.props.language} ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{labTransV2['end the current batch. Confirm?'][this.props.language]['name']}</div></AlertModal>
      <AlertModal language={this.props.language} ref={this.deleteAllProductsAlert} accept={this.deleteAllProducts}><div style={{color:"#e1e1e1"}}>{labTransV2['delete all product records?'][this.props.language]['name']}</div></AlertModal>
      <MessageModal language={this.props.language} ref={this.msgm}/>
    </div>
    //<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Select Product'} onClick={this.selectRunningProd}/>
          
  }
}
class ProductSelectItem extends React.Component{
  constructor(props){
    super(props)
    this.confModal = React.createRef();
    this.msgm = React.createRef();
    this.restoreFactorySettings = React.createRef();
    this.restoreBaseProduct = React.createRef();
    this.saveSelectedProduct = React.createRef();
    this.switchProd = this.switchProd.bind(this);
    this.deleteProd = this.deleteProd.bind(this); 
    this.advChanges = this.advChanges.bind(this);
    this.restoreDefault = this.restoreDefault.bind(this);
    this.restoreBackup = this.restoreBackup.bind(this);
    this.backupProduct = this.backupProduct.bind(this);
    this.restoreDefaultMessage = this.restoreDefaultMessage.bind(this);
    this.restoreBackupMessage = this.restoreBackupMessage.bind(this);
    this.backupProductMessage = this.backupProductMessage.bind(this);
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
        self.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
      }
    },100)
    
  }
  restoreDefaultMessage(){
    var self=this;
    setTimeout(function(){
      self.restoreFactorySettings.current.show();
    }, 150)
  }
  restoreBackupMessage(){
    var self=this;
    setTimeout(function(){
      self.restoreBaseProduct.current.show();
    }, 150)
  }
  backupProductMessage(){
    var self=this;
    setTimeout(function(){
      self.saveSelectedProduct.current.show();
    }, 150)
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
    var name = labTransV2['Product'][this.props.language]['name']+ ' '+this.props.p
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
        <Modal language={this.props.language} ref={this.confModal} Style={{color:'#e1e1e1',width:800, maxWidth:800}}>
               <div style={{textAlign:'center'}}>
               <div style={{fontSize:25, padding:10}}>{labTransV2['Save and Restore'][this.props.language]['name']}</div>
               <CircularButton language={this.props.language} onClick={this.restoreDefaultMessage} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Restore selected product to factory settings'][this.props.language]['name']}/>
               <CircularButton language={this.props.language} onClick={this.restoreBackupMessage} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Restore selected product to base product'][this.props.language]['name']}/>
               <CircularButton language={this.props.language} onClick={this.backupProductMessage} branding={this.props.branding} innerStyle={innerStyle} style={{width:600, display:'block', borderWidth:5,height:43, borderRadius:15}} lab={labTransV2['Save selected product to base product'][this.props.language]['name']}/>
        </div>
          </Modal>
        <AlertModal language={this.props.language} ref={this.restoreFactorySettings} accept={this.restoreDefault}><div style={{color:"#e1e1e1"}}>{labTransV2['restore selected product?'][this.props.language]['name']}</div></AlertModal>
        <AlertModal language={this.props.language} ref={this.restoreBaseProduct} accept={this.restoreBackup}><div style={{color:"#e1e1e1"}}>{labTransV2['restore selected product?'][this.props.language]['name']}</div></AlertModal>
        <AlertModal language={this.props.language} ref={this.saveSelectedProduct} accept={this.backupProduct}><div style={{color:"#e1e1e1"}}>{labTransV2['save selected product?'][this.props.language]['name']}</div></AlertModal>
        <MessageModal language={this.props.language} ref={this.msgm}/>
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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

          list = vMapLists[this.props.param['@labels']][this.props.language].slice(0);
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
        trnsmdl = <Modal language={this.props.language} ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>{labTransV2['Parameter Name'][this.props.language]['name']+': '+ this.props.vMap['@translations'][this.props.language]['name']}</div> 
              <div style={{color:txtClr}}>{labTransV2['Current Language'][this.props.language]['name']+': '+ this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitChange}>{labTransV2['Submit Translation'][this.props.language]['name']}</button>
        </Modal>
      }
       
    var titleFont = 20;
    
    if(this.props.w1/this.props.label.length < 10){
      titleFont = 20*this.props.w1/(10*this.props.label.length) 
    }
    if (this.props.label.length >= 20)
    {
      titleFont = 16;
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
          {labTransV2['Translate Setting'][this.props.language]['name']}
        </MenuItem>
      </ContextMenu>
       {trnsmdl}
       <MessageModal language={this.props.language} ref={this.msgm}/>
    </div>
  }
}
class SettingsPageWSB extends React.Component{
  constructor(props){
    super(props);
    this.state = {sel:0, data:[], path:[],showAccounts:false, cal:false, liveWeight:0, update:true,calib:0,mot:false}
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
    this.startCalibration = this.startCalibration.bind(this);
    this.closeCalibrationWindow = this.closeCalibrationWindow.bind(this);
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

    var self = this;
    setTimeout(function(argument) {
      self.props.sendPacket("refresh_buffer",6);
    },300)
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
      toast(labTransV2['Restarting Display'][this.props.language]['name'])
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
  onCalib(){
    this.props.onCal()
  }
  startCalibration(){
    if((this.props.sysSettings['PassOn'] == 0)||(this.props.level >= this.props.sysSettings['PassAccCalMenu'])){
      if((this.props.dynSettings['BatchRunning'] == 0))
      {
        this.calibrationModal.current.show();      
      }else{
        this.msgm.current.show(labTransV2['Batch needs to be ended'][this.props.language]['name']+ '.');
      }
    }else{
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name']);
    }
  }
  closeCalibrationWindow(){
    this.calibrationModal.current.close(); 
  }
  render(){
    var self = this;
    var weightUnits = this.props.sysSettings['WeightUnits'];
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
      var calBut = <div style={{textAlign:'center'}}><CircularButton language={this.props.language} branding={this.props.branding} innerStyle={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} onClick={this.startCalibration} lab={labTransV2['Calibrate'][this.props.language]['name']}/>
          </div>
          
    var calStuff = (  <div style={{background:'#e1e1e1', padding:10}}>
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{labTransV2['Calibrate'][this.props.language]['name']}</div></h2></span>
          
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LiveWeight'} vMap={vMapV2['LiveWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200}  label={vMapV2['LiveWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.state.liveWeight, weightUnits)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LiveWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTime'} vMap={vMapV2['LastCalTime']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['LastCalTime']['@translations'][this.props.language]['name']} value={this.props.sysSettings['LastCalTimeStr']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTime']} num={true}/></div>
          
          </div>
          <div style={{marginTop:5}}>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'RawWeight'} vMap={vMapV2['RawWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['RawWeight']['@translations'][this.props.language]['name']} value={this.props.dynSettings['RawWeight']} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['RawWeight']} num={true}/></div>
          <div style={{display:'inline-block', width:395}}><ProdSettingEdit getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'LastCalTare'} vMap={vMapV2['LastCalTare']} language={this.props.language} branding={this.props.branding} h1={40} w1={180} h2={51} w2={200} label={vMapV2['LastCalTare']['@translations'][this.props.language]['name']} value={this.props.sysSettings['LastCalTare'].toFixed(1)} editable={false} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][2][0]['LastCalTare']} num={true}/></div>
          </div>
          <div style={{marginTop:5}}><ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalWeight'} vMap={vMapV2['CalWeight']} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalWeight']['@translations'][this.props.language]['name']} value={FormatWeight(this.props.sysSettings['CalWeight'], weightUnits)} editable={true} onEdit={this.props.sendPacket} param={vdefByMac[this.props.mac][1][0]['CalWeight']} num={true}  submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalWeight']['@translations'][this.props.language]['description']}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'CalDur'} vMap={vMapV2['CalDur']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['CalDur']['@translations'][this.props.language]['name']} value={this.props.sysSettings['CalDur']+' ms'} param={vdefByMac[this.props.mac][1][0]['CalDur']} editable={true} onEdit={this.props.sendPacket} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['CalDur']['@translations'][this.props.language]['description']}/></div>
          <div style={{marginTop:5}}><ProdSettingEdit acc={calAcc} getMMdep={this.getMMdep} submitChange={this.props.submitChange} trans={true} name={'ADCTemp'} vMap={vMapV2['ADCTemp']}  language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={488} label={vMapV2['ADCTemp']['@translations'][this.props.language]['name']} value={this.props.dynSettings['ADCTemp']+' C'} param={vdefByMac[this.props.mac][1][0]['ADCTemp']} editable={false} onEdit={this.props.sendPacket} num={true} submitTooltip={this.props.submitTooltip} tooltip={vMapV2['ADCTemp']['@translations'][this.props.language]['description']}/></div>
          <div style={{marginTop:44, fontSize:24, textAlign:'center'}}></div>
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
          
          <div style={{marginTop:0, fontSize:24, textAlign:'center'}}></div>
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
       <span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:'#000', borderBottom:'1px solid #000'}} ><div style={{display:'inline-block', textAlign:'center'}}>{labTransV2['Motor Control'][this.props.language]['name']}</div></h2></span>
          
        <div style={{marginTop:5}}>
          <MotorControl language={this.props.language} motors={[{name: labTransV2['Infeed Belt'][this.props.language]['name']},{name: labTransV2['Weigh Table Belt'][this.props.language]['name']},{name: labTransV2['Reject Belt'][this.props.language]['name']},{name: labTransV2['Exit Belt'][this.props.language]['name']}]}/>
        </div>

         </div>

         </div>
      </React.Fragment>
    }
    var backgroundColor = FORTRESSPURPLE1;
    return <div>
      <table style={{borderCollapse:'collapse', verticalAlign:'top'}}><tbody><tr style={{verticalAlign:'top'}}><td style={{paddingBottom:0,paddingRight:8}}> <div style={{ height:525, background:'#e1e1e1', paddingBottom:10}}>{cats}</div></td><td style={{width:813, height:525,padding:5, background:'#e1e1e1'}}>{sd}</td></tr></tbody></table>
      <MessageModal language={this.props.language} ref={this.msgm}/> 
    </div>
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
     sysRec:this.props.sysSettings,curtrn: labTransV2['Settings'][this.props.language]['name'], prodRec:this.props.prodSettings, dynRec:this.props.dynSettings,font:2, data:this.props.data, cob2:this.props.cob2, framRec:this.props.framRec,path:[]
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
    this.factoryResetMessage = React.createRef();
    this.systemSettingsOverrides = React.createRef();
    this.translatePopup = this.translatePopup.bind(this);
    this.curtrnChange = this.curtrnChange.bind(this);
    this.submitTooltip = this.submitTooltip.bind(this);
    this.openUnused = this.openUnused.bind(this);
    this.goToShortcut = this.goToShortcut.bind(this);
    this.formatUSB = this.formatUSB.bind(this);
    this.update = this.update.bind(this);
    this.showSystemSettingOverridesTooltip = this.showSystemSettingOverridesTooltip.bind(this);
    this.factoryReset = this.factoryReset.bind(this);
    this.showFactoryResetMessage = this.showFactoryResetMessage.bind(this);
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
    //this.props.sendPacket('refresh',0);
    //window.addEventListener('scroll', this.handleScroll)
    var self = this;
    setTimeout(function(argument) {
      self.props.sendPacket('refresh',0);
    },300)
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
  showSystemSettingOverridesTooltip(){
    this.systemSettingsOverrides.current.show();
  }
  showFactoryResetMessage(){
    var self=this;
    setTimeout(()=>{
      self.factoryResetMessage.current.show();
    },150)
  }
  factoryReset(){
    this.props.sendPacket('factoryReset')
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
    var backText = vdefMapV2['@labels']['Back'][this.props.language]['name']
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
        nodes.push(<SettingItem3 language={self.props.language} soc={this.props.soc} submitList={this.submitList} submitTooltip={this.submitTooltip} submitChange={this.submitChange} vMap={vMapV2} branding={this.props.branding} ioBits={this.props.ioBits} int={isInt} mobile={this.props.mobile} mac={this.props.mac} 
          onFocus={this.onFocus} onRequestClose={this.onRequestClose} path={'path'} ip={self.props.dsp} 
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
            
            nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} timezones={self.props.timezones} timeZone={self.props.timeZone} dst={self.props.dst} dt={true} submitList={self.submitList} submitTooltip={self.submitTooltip} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
            ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
              children={[vdefByMac[self.props.mac][5][pname].children,ch]} hasChild={false} data={d} onItemClick={handler} passAcc={passAcc} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec}/>)
       
           }else{
          //console.log(2158, isInt)
          nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitList={self.submitList} submitTooltip={self.submitTooltip} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} 
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
              nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac}
               onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
                data={[sc,i]} children={[vdefByMac[self.props.mac][5][spname].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
      
          }else{
                if(self.props.wsb && lvl == 1){
                  lenOffset++;
                }else{
                  nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
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
                  
                  nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp}
                    font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} backdoor={true}
                   data={[sc,i]} children={[vdefByMac[self.props.mac][5][spar['@name']].children,ch]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
        
          }else{
            nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}   vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
              font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false}  backdoor={true}
              data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
          }
        }else if(par.type == 3){
          var acc = true;
         
          var sc = par['@data']
            
          nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange} vMap={vMapV2} branding={self.props.branding} int={isInt} usernames={self.props.usernames} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} 
            font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Accounts'} name={'Accounts'} hasChild={false} 
            data={[sc,i]} onItemClick={handler} hasContent={true} acc={acc} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
    
        }else if(par.type == 4){
          var acc = false;
          if((self.props.level > 3) || (self.state.sysRec['PassOn'] == 0)){
            acc = true;
          }
          var sc = par['@data']
          if(par['@data'] == 'format_usb'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton language={self.props.language} branding={self.props.branding} onClick={self.formatUSB} lab={labTransV2['Format USB'][self.props.language]['name']}/></div>)
          }else if(par['@data'] == 'reboot_display'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton language={self.props.language} branding={self.props.branding} onClick={self.reboot} lab={labTransV2['Reboot'][self.props.language]['name']}/></div>)
          }else if(par['@data'] == 'update'){
             nodes.push(<div style={{display:'inline-block', padding:5}}><CircularButton language={self.props.language} branding={self.props.branding} onClick={self.update} lab={labTransV2['Update'][self.props.language]['name']}/></div>)
          }

         
        }else if(par.type == 5){
          nodes.push(<SettingItem3 language={self.props.language} soc={self.props.soc} submitTooltip={self.submitTooltip} submitList={self.submitList} submitChange={self.submitChange}  vMap={vMapV2} branding={self.props.branding} int={isInt} mobile={self.props.mobile} mac={self.props.mac} onFocus={self.onFocus} onRequestClose={self.onRequestClose} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={'Unused'} name={'Unused'} hasChild={true} 
              data={{}} onItemClick={self.openUnused} hasContent={true} acc={true} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec} dynSettings={self.state.dynRec} framSettings={self.state.framRec}/>)
      
          //nodes.push(<CircularButton branding={self.props.branding} onClick={self.openUnused} lab={"Get Unused Settings"}/>)
        }
      })

      len = data[lvl - 1 ][0].params.length;
      var ph = ""
      if((len - lenOffset) > 7){
          ph = <div style={{display:'block', width:'100%', height:20}}></div>
          SA = true;
      }
      if(pathString=='System/Advanced'){
        ph = <div style={{display:'block', width:'100%', height:20}}></div>
        SA = true;
      }
      var fSize = 20;
      if(labTransV2['Factory Reset'][this.props.language]['name'].length > 21)
      {
        fSize = 16
      }
      nav = (
          <div className='setNav' style={{maxHeight:maxHeight}} onScroll={this.handleScroll} id={this.props.Id}>
            {nodes}
            {ph}
           {pathString=='System/Advanced' && <div style={{marginTop:-20}}>
             <button className="sItem" onClick={this.showFactoryResetMessage} style={{border:'5px solid red',width:200,height:60}}><p style={{marginTop:-8, fontSize:fSize}}>{labTransV2['Factory Reset'][this.props.language]['name']}</p></button>
             <button className="sItem" onClick={()=>location.reload()} style={{border:'5px solid #818a90',width:200,height:60,marginLeft:40}}><p style={{marginTop:-8, fontSize:fSize}}>{labTransV2['Reconnect'][this.props.language]['name']}</p></button>
           </div>
           } 
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
    var trnsmdl =    <Modal language={this.props.language} ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>{labTransV2['Parameter Name'][this.props.language]['name']+': '+ catname}</div> 
              <div style={{color:txtClr}}>{labTransV2['Current Language'][this.props.language]['name']+': '+ this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitCatChange}>{labTransV2['Submit Translation'][this.props.language]['name']}</button>
        </Modal>

    var className = "menuCategory expanded";
    var tstl = {display:'inline-block', textAlign:'center'}
    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}{label == labTransV2['System Setting Overrides'][this.props.language]['name'] && <img src='assets/help.svg' onClick={this.showSystemSettingOverridesTooltip} style={{position:'absolute', width:30, left:780, backgroundColor:"black", borderRadius:'100%'}}/>}</div></h2></span>)
    if (this.state.font == 1){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}</div></h2></span>)
    }else if (this.state.font == 0){
        titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5,fontWeight:500, color:titleColor, borderBottom:'1px solid '+titleColor}} >{backBut}<div style={tstl}>{label}{grphBut}</div></h2></span>)
    }
    catList = null;
    //console.log(4713,SA)
    return(
      <div className='settingsDiv'>
      <ScrollArrow language={this.props.language} ref={this.arrowTop} offset={72} width={72} marginTop={5} active={SA} mode={'top'} onClick={this.scrollUp}/>
    
      <div className={className}>
        <ContextMenuTrigger id={pathString+'_titleCTMID'}>
        {titlediv}
        </ContextMenuTrigger>
        <ContextMenu id={pathString+'_titleCTMID'}>
        <MenuItem onClick={this.translatePopup}>
          {labTransV2['Translate Setting'][this.props.language]['name']}
        </MenuItem>
        </ContextMenu>

      {trnsmdl}{nav}
     
      </div>
      <ScrollArrow language={this.props.language} ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
      <Modal ref={this.systemSettingsOverrides} systemSettingTooltip={'yes'}>
        <div style={{color:'#e1e1e1', whiteSpace:'break-spaces'}}>
            <h2 style={{fontSize:20}}>{labTransV2['System Settings Overrides'][this.props.language]['name']}</h2>
            {vdefMapV2['@tooltips']['SystemSettingsOverridesTooltip'][this.props.language]}
        </div>
      </Modal>
      <AlertModal language={this.props.language} ref={this.factoryResetMessage} accept={this.factoryReset}><div style={{color:"#e1e1e1"}}>{labTransV2['Are you sure?'][this.props.language]['name']}</div></AlertModal>
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
        this.msgm.current.show(labTransV2['Cannot change this setting'][this.props.language]['name']+ '.')
      }
      if(n['@labels'] == 'WeighingMode'){
        this.msgm.current.show(labTransV2['Cannot change this setting'][this.props.language]['name']+ '.')
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
      toast(labTransV2['Not Configurable'][this.props.language]['name'])
    }else{



      if(this.props.hasChild || typeof this.props.data == 'object'){
    
        if(this.props.acc){
          this.props.onItemClick(this.props.data, this.props.name)  
        }else{
          if(this.props.backdoor == true ){

          }else{
            this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
      if(d == 'MinBeltSpeed'){
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

    var accModal = <MessageModal language={this.props.language} ref={this.msgm}/>
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
      console.log("vdefByMac[this.props.mac][0] ",vdefByMac[this.props.mac][0])
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
      //console.log(this.props.param, 5679)
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
      this.msgm.current.show(labTransV2['This setting is currently disabled'][this.props.language]['name'])
    }else if(this.props.pAcc === false){
      //toast('Access Denied')
      if(acc){
        this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
      fSize = 12.5
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
      if(self.props.param[i]['@type'] == 'float' || self.props.param[i]['@type'] == 'weight' || self.props.param[i]['@type'] == 'fdbk_rate'){
        if(val == null){
          val = 0;
        }
        if(self.props.param[i]['@type'] == 'fdbk_rate' && Number(val)){
          if(self.props.weightUnits == 2)
          {
            val = Number(val/28.3495);
          }
          if(self.props.weightUnits == 3)
          {
            val = Number(val/28.3495);
          }
        }
        if(val.toString().includes('grams/pulse') || val.toString().includes('grams/sec'))
        {
          var twoParts = val.split(' ');
          var number = twoParts[0];
          var unit = twoParts[1];
          if(self.props.weightUnits == 1 || self.props.weightUnits == 0)
          {
            val = Number(number).toFixed(1) + " " + unit;
          }
          if(self.props.weightUnits == 2)
          {
            number = Number(number) / 28.3495;
            unit = unit.replace("grams","oz");
            val = Number(number).toFixed(2) + " " + unit;
          }
          if(self.props.weightUnits == 3)
          {
            number = Number(number) / 28.3495;
            unit = unit.replace("grams","oz");
            val = Number(number).toFixed(2) + " " + unit;
          }
          
        }else{
          if(typeof self.props.param[i]['@float_dec'] != 'undefined'){
            if(self.props.weightUnits == 3 && self.props.param[i]['@name']!='FilterFreq' && self.props.param[i]['@name']!='FaultClearTimeOverride')
            {
              val = val.toFixed(2)
            }
            else if((self.props.weightUnits == 1 || self.props.weightUnits == 2) && self.props.param[i]['@name'] == 'SettleWeight')
            {
              val = val.toFixed(3)
            }
            else{
              if(self.props.param[i]['@type'] == 'fdbk_rate' && self.props.weightUnits == 2){
                val = val.toFixed(2)
              }else{
                val = val.toFixed(self.props.param[i]['@float_dec'])
              }
            }
          }else if(val.toString().length > val.toFixed(5).length){
            val = val.toFixed(5)
          }
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
          //console.log(self.props.param[i])
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

      return (<CustomLabel index={i} onClick={self.valClick} style={_st}>{(val == '0.0 seconds' && self.props.param[i]['@name']=='FaultClearTimeOverride')  ? labTransV2['DefaultClearTime'][self.props.language]['name'] : (val == '0 mm' && self.props.param[i]['@name']=='EyeMinGapDistOverride') || (val == '0.0 in' && self.props.param[i]['@name']=='EyeMinGapDistOverride') ? labTransV2['DefaultClearTime'][self.props.language]['name'] : val == '0.00 x Product Length' ? labTransV2['DefaultClearTime'][self.props.language]['name'] : val}</CustomLabel>)
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

       var trnsmdl =    <Modal language={this.props.language} ref={this.trnsmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>{labTransV2['Parameter Name'][this.props.language]['name']+': '+  this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>{labTransV2['Current Language'][this.props.language]['name']+': '+this.props.language}</div>
              <input type='text' style={{fontSize:20}} value={this.state.curtrn} onChange={this.curtrnChange}/>
              <button onClick={this.submitChange}>{labTransV2['Submit Translation'][this.props.language]['name']}</button>
        </Modal>
        var lsedit = this.state.tlist.map(function (l,i) {
          return <tr><td style={{color:"#e1e1e1"}}>{self.state.elist[i]}</td><td><input type='text' value={l} onChange={(e) => self.lChange(e,i)}/></td></tr>
          // body...
        })
        var listmdl = <Modal language={this.props.language} ref={this.listmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>{labTransV2['List Name'][this.props.language]['name'] +': ' + this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>{labTransV2['Current Language'][this.props.language]['name']+': '+this.props.language}</div>
        <table><tbody style={{maxHeight:400, overflow:'scroll', display:'block'}}>{lsedit}</tbody></table>
              <button onClick={this.submitList}>{labTransV2['Submit Translation'][this.props.language]['name']}</button>
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
        vfdsetupbutt =<Modal language={this.props.language} ref={this.vfdSModal} mobile={this.props.mobile} innerStyle={{background:modBG}}>

        <div>
          <div style={{color:txtClr}}>{labTransV2['To set up this VFD unit...'][this.props.language]['name'] + '.'}</div>
        <div onPointerUp={this.vfdSetup} style={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',margin:10,color:'#1C3746',fontSize:30,lineHeight:'40px'}} className={'circularButton_sp'}> <div style={{display:'inline-block'}}>{labTransV2['Confirm'][this.props.language]['name']}</div></div>
        <div onPointerUp={()=>this.vfdSModal.current.toggle()} style={{display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',margin:10,color:'#1C3746',fontSize:30,lineHeight:'40px'}} className={'circularButton_sp'}><div style={{display:'inline-block'}}>{labTransV2['Cancel'][this.props.language]['name']}</div></div> 
    </div></Modal>
      }
    if(!acc){
      
       if(vfdcont){
        vfdbutts = <Modal language={this.props.language} ref={this.vfdModal}  mobile={this.props.mobile} innerStyle={{background:modBG}}>

        <div>
          <div style={{color:txtClr}}>{labTransV2['VFD Test'][this.props.language]['name']}</div>
        <div onPointerUp={this.vfdStart} style={{width:120, lineHeight:'60px',color:txtClr,font:30, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={'circularButton_sp'}> <img src={plArr} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{labTransV2['Start Text'][this.props.language]['name']}</div></div>
        <div onPointerUp={this.vfdStop} style={{width:120, lineHeight:'60px',color:txtClr,font:30, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:60}} className={'circularButton_sp'}> <img src={plStop} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{labTransV2['Stop'][this.props.language]['name']}</div></div> 
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
        {labTransV2['Translate Setting'][this.props.language]['name']}
        </MenuItem>
       </ContextMenu>
      </div>
      {trnsmdl}
      {listmdl}
       <MessageModal language={this.props.language} ref={this.msgm}/>

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
         popupmenu = <MenuItem onClick={this.translateLists}>{labTransV2['Translate List'][this.props.language]['name']}</MenuItem>
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
      listmdl =  (<Modal language={this.props.language} ref={this.listmdl}  mobile={this.props.mobile} innerStyle={{background:modBG}}>
              <div style={{color:txtClr}}>{labTransV2['List Name'][this.props.language]['name'] +': ' + this.props.vMap['@translations']['english']['name']}</div> 
              <div style={{color:txtClr}}>{labTransV2['Current Language'][this.props.language]['name']+': '+this.props.language}</div>
        <table><tbody style={{maxHeight:400, overflow:'scroll', display:'block'}}>{lsedit}</tbody></table>
              <button onClick={this.submitList}>{labTransV2['Submit Translation'][this.props.language]['name']}</button>
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
        {labTransV2['Translate Setting'][this.props.language]['name']}
        </MenuItem>
        {popupmenu}
      </ContextMenu>
      </div>

      {trnsmdl}
      {listmdl}
       <MessageModal  language={this.props.language} ref={this.msgm}/>
      </div>
      }else{
        options = this.state.val.map(function(v, i){
          if(typeof self.props.param[i]['@labels'] != 'undefined'){
            popupmenu = <MenuItem onClick={this.translateLists}>{labTransV2['Translate List'][this.props.language]['name']}</MenuItem>

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
                if(!isNaN(v)){
                  if(wunit == 1){
                    max = max/1000
                    v = Number(v/1000).toFixed(1);
                  }else if(wunit == 2){
                    max = max/453.592
                    v = Number(v/453.592).toFixed(1);
                  }else if(wunit == 3){
                    max = max/28.3495
                    v = Number(v/28.3495).toFixed(2);
                  }
                }else{
                  if(wunit == 1){
                    max = max/1000
                  }else if(wunit == 2){
                    max = max/453.592
                  }else if(wunit == 3){
                    max = max/28.3495
                  }
                }
              }
             else if(self.props.param[i]['@type'] == 'fdbk_rate'){
                var wunit = self.getMMdep('WeightUnits')
                if(!isNaN(v)){
                 if(wunit == 2 || wunit == 3){
                    max = max/28.3495
                    min = min/28.3495
                    v = Number(v/28.3495).toFixed(2);
                  }
                }else{
                  if(wunit == 0 || wunit == 1)
                  {
                    var twoParts = v.split('grams');
                    var number = twoParts[0];
                    v = Number(number).toFixed(1);
                  }
                  if(wunit == 2 || wunit == 3){
                    max = max/28.3495
                    min = min/28.3495
                    var twoParts = v.split('grams');
                    var number = twoParts[0];
                    v = Number(number/28.3495).toFixed(2);
                  }
                }
              }
            }

            var lbl = namestring
            if(self.props.combo){ lbl = lbl + [' Delay', ' Duration'][i]}
              if(self.props.dt){
                return <DateTimeModal language={self.props.language} branding={self.props.branding} value={v} ref={self['input'+i]} onEdit={self.changeDT}/>
              }
              var dispV = v
              if(!isNaN(v)){
                if(self.props.weightUnits == 3)
                {
                  if(float_dec && self.props.param[i]['@name']!='FilterFreq' && self.props.param[i]['@name']!='FaultClearTimeOverride')
                  {
                    dispV = Number(dispV).toFixed(2)
                  }
                  else if(float_dec && (self.props.param[i]['@name']=='FilterFreq' || self.props.param[i]['@name']=='FaultClearTimeOverride')){
                    dispV = Number(dispV).toFixed(1)
                  }
                }
                else if(self.props.weightUnits == 0 || self.props.weightUnits == 1 || self.props.weightUnits == 2){

                  if(self.props.param[i]['@type'] == 'fdbk_rate' && (self.props.weightUnits == 2 || self.props.weightUnits == 3))
                  {
                    dispV = Number(dispV).toFixed(2)
                  }
                  else{
                    dispV = Number(dispV).toFixed(float_dec)
                  }
                  
                  if(self.props.param[i]['@name'] == 'SettleWeight'&& (self.props.weightUnits == 1 || self.props.weightUnits == 2 )){
                    dispV = Number(dispV).toFixed(3)
                  }

                }
              }
              else{
                if(float_dec && !isNaN(dispV)){
                  dispV = dispV.toFixed(float_dec)
                }
              }
              /*if(float_dec && !isNaN(dispV)){
                dispV = dispV.toFixed(float_dec)
              }*/
              return <CustomKeyboard parameter={self.props.param[i]['@name']} weightUnits={self.props.weightUnits} floatDec={float_dec} sendAlert={msg => self.msgm.current.show(msg)} min={[minBool, min]} max={[maxBool, max]} submitTooltip={self.submitTooltip} branding={self.props.branding} mobile={self.props.mobile} 
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
        {labTransV2['Translate Setting'][this.props.language]['name']}
        </MenuItem>
        {popupmenu}
      </ContextMenu>
      </div>

      {trnsmdl}
      {listmdl}
      <MessageModal language={this.props.language} ref={this.msgm}/>
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
                <div style={{marginTop:5}}><ProdSettingEdit2 trans={true} name={'Nif_ip'} vMap={vMapV2['Nif_ip']} submitChange={this.onSubmit} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_ip']['@translations'][this.props.language]['name']} value={this.props.nifip} editable={true} onEdit={this.editIP} param={{'@name':'Nif_ip', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                <div style={{marginTop:5}}><ProdSettingEdit2 trans={true} name={'Nif_nm'} vMap={vMapV2['Nif_nm']} submitChange={this.onSubmit} language={this.props.language} branding={this.props.branding} h1={40} w1={300} h2={51} w2={400} label={vMapV2['Nif_nm']['@translations'][this.props.language]['name']} value={this.props.nifnm} editable={true} onEdit={this.editNM} param={{'@name':'Nif_nm', '@type':'ipv4_address','@bit_len':32, '@rpcs':{'write':[0,[0,0,0],null]}}} num={true}/></div>
                
       
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
/*****************Batch Control Components*********************/
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
      this.msgm.current.show(labTransV2['Access Denied'][this.props.language]['name'])
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
    
     var sttxt = labTransV2['Start Text'][this.props.language]['name']
    play = <div  style={{width:250, borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#a9a9a9', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
    stop = ''
    if(this.props.batchRunning == 0){
      if(this.props.canStartBelts == 1){
        play = <div onClick={this.onStartClick} style={{width:250, borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
      }
    }
    else if(this.props.batchRunning == 2){
        sttxt = labTransV2['Resume'][this.props.language]['name']
        play = <div onClick={this.onResumeClick} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#11DD11', display:'inline-block',marginLeft:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
        stop = <div onClick={this.stop} style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FF0101', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18, width:50, alignItems:'center', verticalAlign:'middle', lineHeight:'25px', height:50}}>{labTransV2['End Batch'][this.props.language]['name']}</div></div> 
        if(this.props.canStartBelts == 0){
          play = <div style={{width:114,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#a9a9a9', display:'inline-block',marginLeft:5, borderWidth:5,height:45}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{sttxt}</div></div>
        }
      
    }
    
    else if(this.props.batchRunning == 1){
      play = <div onClick={this.pause} style={{width:250,borderRadius:25, lineHeight:'45px',color:psbtcolor,font:28, background:'#FFFF00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:45, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pauseb} style={{display:'inline-block', marginLeft:-15, width:25, verticalAlign:'middle'}}/><div style={{display:'inline-block', font:18}}>{labTransV2['Pause/Stop'][this.props.language]['name']}</div></div>
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
    <div style={{textAlign:'center', marginTop:5, fontSize:20}}><div><div style={{display:'inline-block', width:250}}>{labTransV2['Net Weight'][this.props.language]['name']+': '+this.props.netWeight}</div>
    <div style={{display:'inline-block', width:250}}>{labTransV2['Live Weight'][this.props.language]['name']+': '+this.props.liveWeight}</div>
    </div>
    <div>{this.props.status}</div></div>
    </div>)

    //var status = <div style={{display:'inline-block', color:'#e1e1e1', textAlign:'center',}}></div>

    return <div style={{display:'grid', gridTemplateColumns:"285px auto", background:'#e1e1e1', borderRadius:20,paddingLeft:5, marginTop:5, width:819}}>
      <div>{play}{stop} </div><div> {status}</div>
        <AlertModal language={this.props.language} ref={this.stopConfirm} accept={this.stopConfirmed}><div style={{color:"#e1e1e1"}}>{labTransV2['end the current batch. Confirm?'][this.props.language]['name']}</div></AlertModal>
        <MessageModal  language={this.props.language} ref={this.msgm}/>
    </div>
  }
}
/******************Settings Components end********************/
/**Mixture Menu Component **/
class ProductSettings2 extends React.Component{
    constructor(props){
      super(props)
    }
    render(){  
    /**Declaration of Theme and Button variables**/
      var searchColor = FORTRESSPURPLE1;      
      var selStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:25,lineHeight:'47px'}
      var content =(
        <div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6,height:567}}>
            <div>
                <div style={{display:'inline-block', verticalAlign:'top'}}>
                    <ProdSettingEdit  prodNameComponent={true} afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'ProdName'} vMap={'Product Name'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Product Name'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                </div>
                <div style={{display:'inline-block', marginLeft:8, marginTop:3}}>
                    <CircularButton language={'english'} onClick={'this.selectRunningProd'} branding={'FORTRESS'} innerStyle={selStyle} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:50, borderRadius:15, boxShadow:'none'}} lab={'Select Product'}/>       
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
                <div style={{display:'inline-block',width:'100%', verticalAlign:'top', marginTop:-5}}>
                    <ProdSettingEdit afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'FeedRate'} vMap={'Feed Rate'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Feed Rate'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                    <ProdSettingEdit afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'InfeedRunTime'} vMap={'Infeed Run Time'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Infeed Run Time'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                    <ProdSettingEdit afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'LowerWeightLimit'} vMap={'Lower Weight Limit'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Lower Weight Limit'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                    <ProdSettingEdit afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'UpperWeightLimit'} vMap={'Upper Weight Limit'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Upper Weight Limit'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                    <ProdSettingEdit afterEdit={'this.props.getProdList'} acc={false} trans={true} name={'EmptyWeightLimit'} vMap={'Empty Weight Limit'}  language={'english'} branding={'FORTRESS'} h1={40} w1={200} h2={60} w2={250} label={'Empty Weight Limit'} value={77}  onEdit={'this.sendPacket'} editable={true} num={false}/>
                </div>
            </div>
        
      </div>
      )
    /**End of Theme and Button variables declarations**/  
        return <div style={{width:1155}}>
        <div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:720, paddingLeft:10}}>Product</div><div style={{display:'inline-block', fontSize:20,textAlign:'right',width:400}}>{'Current Product: '+"DY TEST spstr" }</div></div>
        <table style={{borderCollapse:'collapse'}}>
            <tbody>
                <tr>
                    <td style={{verticalAlign:'top', width:830}}>{content}
                        <div style={{width:819, paddingTop:0}}> </div>
                    </td>
                    <td style={{verticalAlign:'top',textAlign:'center'}}>
                    <ScrollArrow ref={this.arrowTop} offset={72} width={72} marginTop={-40} active={true} mode={'top'} onClick={'this.scrollUp'}/>
                        <div style={{display:'none', background:'#e1e1e1', padding:2}}>
                            <div style={{position:'relative', verticalAlign:'top', marginLeft:180}}>
                            <div style={{height:25, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
                            <div style={{height:25, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%, '+ searchColor + ' 26%, '+ searchColor}}/>
                            <div style={{position:'absolute',float:'right', marginTop:-53, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:40}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>Search</div></div>
                            </div>
                        </div>
                        <div onScroll={this.onProdScroll} id='prodListScrollBox' style={{height:490, background:'#e1e1e1',overflowY:'scroll'}}>{'prods'}
                        </div>
                        <div style={{height:85,lineHeight:'85px', background:'#e1e1e1', borderTop:'1px solid #362c66'}}>
                            <div onClick={'this.prodMgmt'} style={{display:'table-cell',height:85, borderRight:'1px solid #362c66', width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}>Product Management</div>
                    
                            <div onClick={'this.toggleSearch'} style={{display:'table-cell',height:85, borderLeft:'1px solid #362c66',width:154, fontSize:15, lineHeight:'20px', verticalAlign:'middle'}}><img src='assets/search.svg' style={{width:40}}/><div style={{marginTop:-10, fontSize:16}}>Search</div></div>
                        </div>
                    <ScrollArrow ref={this.arrowBot} offset={72} width={72} marginTop={-30} active={false} mode={'bot'} onClick={this.scrollDown}/>
                
                    </td>
                </tr>
            </tbody>
        </table>
      
      </div>
            
    }
}
/**ProdSettingEdit Component **/
class ProdSettingEdit2 extends React.Component{
    constructor(props){
      super(props);
      this.onClick = this.onClick.bind(this);
      this.ed = React.createRef();
    }
    onClick()
    {
      this.ed.current.toggle()
        console.log
    }
    render(){
      var self = this;
      var ckb;
      var dispVal = this.props.value
      var txtClr = '#e1e1e1';
      var titleFont = 20;
      var bgClr = FORTRESSPURPLE2
      /*if(this.props.editable){
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
      
      }*/
      ckb = <CustomKeyboard floatDec={2} sendAlert={msg => 'this.msgm.current.show(msg)'} min={[true,0]} max={[true,100]} preload={'ProdName'} branding={'FORTRESS'}
            ref={this.ed} language={'english'} tooltip={'Test DY'} num={2} onChange={1} value={''} label={'Label Test'+': ' + 'Value'} submitTooltip={'this.submitTooltip'}/>

      return <div style={{marginTop:10}}>
        <div style={{display:'inline-block', verticalAlign:'top', position:'relative',color:txtClr, fontSize:titleFont,zIndex:1, lineHeight:this.props.h1+'px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:bgClr, width:this.props.w1,textAlign:'center'}}>
           <ContextMenuTrigger id={this.props.name + '_ctmid'}>
          {this.props.label}   </ContextMenuTrigger>
        
        </div>
        <div onClick={this.onClick} style={{display:'inline-flex',alignItems:'center',overflowWrap:'anywhere', justifyContent:'center', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:this.props.h2/2+'px', borderRadius:15,height:this.props.h2, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:this.props.w2}}>
          {dispVal}
        </div>
        {
            !this.props.prodNameComponent && 
            <div onClick={this.onClick} style={{display:'inline-flex',alignItems:'center',overflowWrap:'anywhere', justifyContent:'center', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:this.props.h2/2+'px', borderRadius:15,height:this.props.h2, border:'5px solid #818a90',marginLeft:15,textAlign:'center', width:this.props.w2}}>
                {dispVal}
            </div>
        }
        {ckb}
      </div>
    }
}

ReactDOM.render(<LandingPage/>,document.getElementById('content'))