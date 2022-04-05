const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
const timezoneJSON = require('./timezones.json');
const FtiSockIo = require('./ftisockio.js')
import { CircularButton } from './buttons.jsx';
import { CustomKeyboard, EmbeddedKeyboard } from './keyboard.jsx';
import { PopoutWheel } from './popwheel.jsx';
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { AlertModal, AuthfailModal, LockModal, MessageModal, Modal, ProgressModal, ScrollArrow, TrendBar } from './components.jsx';
import { YAxis, XAxis, HorizontalGridLines, VerticalGridLines, XYPlot, AreaSeries, Crosshair } from "react-vis";
import "react-vis/dist/style.css";
import { Line } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
/** Global variable declarations **/
const FORTRESSPURPLE1 = 'rgb(40, 32, 72)'
const FORTRESSPURPLE2 = '#5d5480'
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

var categories;
var netMap = vdefMapV2['@netpollsmap']

var vMapV2 = vdefMapV2["@vMap"]
var vMapLists = vdefMapV2['@lists']
var categoriesV2 = [vdefMapV2["@pages"]['CWSys']]
var catMapV2 = vdefMapV2["@catmap"]
var labTransV2 = vdefMapV2['@labels']

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
/*************Helper functions end**************/
/********************************************************** */
/*Opening a websocket connection between the client and server */

var serverURL = 'ws://'+location.host+':3000';
var socket = new FtiSockIo(serverURL,true);

socket.on('getPackets', (packets)=>{
  console.log("Received packets are ",packets);
})
socket.on('vdef', function(vdf){
    console.log('on vdef tata')
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
        this.state = {prec:{},checkPrecInterval:null,version:'2018/07/30',connected:false,currentPage:'landing',timezones:[],curDet:'',mbunits:[],dets:[], detL:{}, macList:[],nifip:'', nifnm:'',nifgw:''}
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
        this.loadPrefs = this.loadPrefs.bind(this);
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
          console.log("Received Tata Data is ", data);
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
    var silenceAlarmButton = <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:310, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Silence Alarm'} onClick={this.onSilenceAlarmOpen}/> 
    var statisticsButton = <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Statistics'} onClick={this.onStatisticsOpen}/> 

    /**End of Theme and Button variables declarations**/

    return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, textAlign:'center', width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
                <div style={{marginLeft:'auto',marginRight:'auto',maxWidth:1280, width:'100%',textAlign:'left'}}>
                    <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
                        <tbody>
                            <tr>
                                <td><img style={{height: 67,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:16}} src={img}/></td>
                                <td>
                                    <Mixture onMixtureMenuOpen={this.onMixtureMenuOpen}/>
                                </td>
                                <td style={{height:60, width:190, color:'#eee', textAlign:'right'}}>
                                    <div style={{fontSize:28,paddingRight:6}}>{"No User"}</div>
                                    <div style={{fontSize:16, color:'#e1e1e1', paddingRight:6, marginBottom:-17}}>{'2020/12/05 15:38:10'}</div>
                                </td>
                                <td className="logbuttCell" style={{height:60}}  onClick={'function to create'}>
                                    <div style={{paddingLeft:3, borderLeft:'2px solid #fff', borderRight:'2px solid #fff',height:55, marginTop:16, paddingLeft:10, paddingRight:10}}>
                                    <button className={'login'} style={{height:50, marginTop:-7}} onClick={'function to create'} />
                                    <div style={{color:'#e1e1e1', marginTop:-15, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Login'}</div>
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
                                    <TeaAndFlavour/>
                                    <AddBack/>
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
                </div>
            </div>
      ) 
  }

}

class Mixture extends React.Component{
    constructor(props){
	    super(props)
        this.mixtureModal = React.createRef()
	}

    render(){
        var img = 'assets/tataTeaBlender/beaker.png';
        return(
            <div className='mixtureSection'>
                <div className='circularButton' onClick={this.props.onMixtureMenuOpen} style={{width:150, float:'left', lineHeight:'60px',color:'white',font:30, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:1,height:60}}> 
                    <img src={img} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>{'Mixture'}</div>
                </div>
                <h3 className='mixtureName'>001 - Earl Gray Mix</h3>
                <div className='status'>
                    Status:
                </div>
                
            </div>
        )
    }
}
class TeaAndFlavour extends React.Component{
    render(){
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
                            <td style={{fontWeight:'bold'}}>0.0 g</td>
                            <td style={{fontWeight:'bold'}}>0.0 g</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Target Feed Rate</td>
                            <td style={{fontWeight:'bold'}}>80 %</td>
                            <td style={{fontWeight:'bold'}}>20 %</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Actual Feed Rate</td>
                            <td style={{fontWeight:'bold'}}>0.0 g/min</td>
                            <td style={{fontWeight:'bold'}}>0.0 g/min</td>
                        </tr>
                        <tr>
                            <td style={{backgroundColor:'#5d5480', borderRadius:25, color:'white'}}>Feed Speed</td>
                            <td style={{fontWeight:'bold'}}>0.0 %</td>
                            <td style={{fontWeight:'bold'}}>0.0 %</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                            <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>Not Communicating</td>
                            <td>Not Communicating</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
class AddBack extends React.Component{
    render(){
        return(
            <div className='addBackSection'>
               <table className='addBackTable'>
                    <tr style={{fontWeight:'bold'}}>ADD BACK</tr>
                    <tr style={{fontWeight:'bold'}}>0.0 g</tr>
                    <tr style={{fontWeight:'bold'}}>10.0 %</tr>
                    <tr style={{fontWeight:'bold'}}>0.0 g/min</tr>
                    <tr style={{fontWeight:'bold'}}>0.0 %</tr>
                    <tr>
                        <td><span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Flow Control</span> <span style={{backgroundColor:'#5d5480', color:'white', padding:5}}>Refilling</span></td>
                    </tr>
                    <tr>Not Communicating</tr>
               </table>
            </div>
        )
    }
}
class LineGraph extends React.Component{
    render(){
        return(
            <div className='lineGraphSection'>
                <Line
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
                />
            </div>
        )
    }
}
class SideButtonsMenu extends React.Component{
    render(){
        return(
            <div className='sideButtonsSection'>
                <CircularButton innerStyle={innerStyle} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25, fontWeight:'bold'}} lab={'Prime'} onClick={this.props.onPrimeMenuOpen}/> 
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Batch Start'} onClick={this.props.onBatchStartMenuMenuOpen}/>  
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Enable Addback'} onClick={this.props.onEnableAddbackOpen}/> 
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Empty'} onClick={this.props.onEmptyOpen}/> 
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge A'} onClick={this.props.onPurgeAOpen}/> 
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge B'} onClick={this.props.onPurgeBOpen}/> 
                <CircularButton branding={'TATA'} innerStyle={innerStyle2} style={{width:220, display:'inline-block',marginTop:12,marginLeft:10, marginRight:5, borderWidth:1,height:60, borderRadius:25}} lab={'Purge C'} onClick={this.props.onPurgeCOpen}/> 
            </div>
        )
    }
}
/******************Main Components end********************/

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
                    <CircularButton onClick={'this.selectRunningProd'} branding={'FORTRESS'} innerStyle={selStyle} style={{width:200, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:50, borderRadius:15, boxShadow:'none'}} lab={'Select Product'}/>       
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