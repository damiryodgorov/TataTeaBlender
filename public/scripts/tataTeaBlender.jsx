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

const vdefMapV2 = require('./vdefmapTata.json')
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
/*************Helper functions end**************/
/********************************************************** */
/*Opening a websocket connection between the client and server */

var serverURL = 'ws://'+location.host+':3000';
var socket = new FtiSockIo(serverURL,true);

socket.on('getPackets', (packets)=>{
  console.log("Received packets are ",packets);
})
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
                      liveWeight:0.0,updateCount:0,faultArray:[],language:'english',branding:'FORTRESS',fram:{},srec:{},prec:{},rec:{},cob:{},pcob:{},unusedList:{},
                      checkPrecInterval:null,version:'2018/07/30',connected:false,init:false,currentPage:'landing',noupdate:'',
                      timezones:[],curDet:'',ioBITs:{},mbunits:[],dets:[], detL:{}, macList:[],nifip:'', nifnm:'',nifgw:''}
        this.onSettingsMenuOpen = this.onSettingsMenuOpen.bind(this);
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
    }
    /**sendPacket function used to send rpc requests to the server */
    sendPacket(n,v){
      var self = this;
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
           /* e.rec.Nif_ip = this.state.nifip
            e.rec.Nif_gw = this.state.nifgw
            e.rec.Nif_nm = this.state.nifnm
            e.rec.Nif_mac = this.state.curDet.mac
            e.rec.ConnectedClients = this.state.connectedClients
            SingletonDataStore.framRec = e.rec;
            if(this.state.srec['RemoteDisplayLock'] == 1){
              if(typeof e.rec['InternalIP'] != 'undefined'){
                if(window.location.host != e.rec['InternalIP']){
                  this.lockModal.current.show(labTransV2['This display has been locked for remote use'][language]['name'])
                }
              }
              
            }
            this.setState({noupdate:false,fram:e.rec,cob:this.getCob(this.state.srec, this.state.prec, this.state.rec,e.rec)})*/
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
            /*var prodList = this.state.prodList;
            var prodListRaw = this.state.prodListRaw
            prodList[e.prodNo] = Object.assign({},e.rec);
            prodListRaw[e.prodNo] = e.raw
            this.setState({prodList:prodList, prodListRaw:prodListRaw, noupdate:false})*/
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
    /**Function used to open the Settings Menu**/
    onSettingsMenuOpen(){
        this.settingsModal.current.toggle();
    }
    /**Function used to open the Mixture Menu**/
    onMixtureMenuOpen(){
        this.mixtureModal.current.toggle();
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
    
  render(){

    /**Declaration of Theme and Button variables**/
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
                                <td className="confbuttCell" style={{paddingRight:5}} onClick={this.onSettingsMenuOpen}>
                                    <button onClick={this.onSettingsMenuOpen} className={'config_w'} style={{marginTop:5, marginLeft:2,marginBottom:-10, paddingLeft:10}}/>
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
                        <h1 style={{color:'white'}}>Settings Menu</h1>
                    </Modal>
                    <Modal x={true} ref={this.mixtureModal} Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:backgroundColor, maxHeight:650}} onClose={this.onMixtureClose}>
                        
                        <ProductSettings/>
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
/**Mixture Menu Component **/
class ProductSettings extends React.Component{
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
class ProdSettingEdit extends React.Component{
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