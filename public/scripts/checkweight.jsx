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

var createReactClass = require('create-react-class');

const SPARCBLUE2 = '#30A8E2'
const SPARCBLUE1 = '#1C3746'
const FORTRESSPURPLE1 = '#362c66'
const FORTRESSPURPLE2 = '#5d5480'

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
var categoriesV2 = [vdefMapV2["@categories"]]
var catMapV2 = vdefMapV2["@catmap"]

const FtiSockIo = require('./ftisockio.js')

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
    res[6] = json["@deps"];
    res[7] = json["@labels"]
    res[8] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        ////////console.log("fault found")
        res[8].push(par)
      }
    }

    _pVdef = res;
    //if(json['@defines']['INTERCEPTOR']){
        vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@categories"]], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]

    //}else{
      //   vdefList[json['@version']] = [json, res, nVdf, categories, [vdefMapST['@categories']], vdefMapST['@vMap'], vdefMapST['@pages']]
       // vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapST["@categories"]], vdefMapST['@vMap'], vdefMapST['@pages']]

    //}
   ////console.log('552',vdefByMac)
    isVdefSet = true;
})


function tickFormatter(t,i) {
	var text = t.split(' ').map(function(v,j){
		return <tspan x="0" dy={j+'em'}>{v}</tspan>
	})
  return (<text x="0"  transform='translate(-5,-5)' style={{textAnchor:"end", fontSize:16}}>
    {text}
  </text>);
}

class Container extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return <LandingPage/>
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
class LandingPage extends React.Component{
	constructor(props){
		super(props)
		this.state = {updateCount:0,connected:false,start:true,x:null,branding:'SPARC', automode:0,currentPage:'landing',netpolls:{}, curIndex:0, progress:'',srec:{},prec:{},rec:{},crec:{},
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:5, version:'2018/07/30',pmsg:'',pON:false,percent:0,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'single', banks:[]}, accounts:['operator','engineer','Fortress'],usernames:['ADMIN','','','','','','','','',''], nifip:'', nifnm:'',nifgw:''}
	
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
	}
	onRMsg(e,det){
		console.log('onRMsg',e)
	}
	loadPrefs() {
		if(socket.sock.readyState  ==1){
			//socket.emit('locateReq');
			socket.emit('getVersion',true);
			socket.emit('getPrefsCW',true);
      		socket.emit('getDispSettings');

		}
	}
	shouldComponentUpdate(nextProps, nextState){
		if(true ==  nextState.noupdate){
			return false;
		}
		return true;
	}
	onParamMsg(e,u){
		console.log('onParamMsg', e.type)
		if(this.state.curDet.ip == u.ip){
			if(typeof e != 'undefined'){
				if(e.type == 0){
					this.setState({srec:e.rec})
				}else if(e.type == 1){
					this.setState({prec:e.rec})
				}else if(e.type == 2){
					this.setState({rec:e.rec,updateCount:(this.state.updateCount+1)%10, noupdate:(this.state.updateCount != 0)})
				}else if(e.type == 5){
					//console.log('checkweighing pack')
					this.setState({crec:e.rec, noupdate:true})
					this.refs.lg.parseDataset(e.rec['PackSamples'], Math.random()*100)
				}
			}
		}
	}
	componentDidMount(){
		var self = this;
		this.loadPrefs();
		socket.on('resetConfirm', function (r) {
			socket.emit('locateReq',true);
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
				socket.emit('locateReq',true)
			}

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
			console.log(e)
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
							socket.emit('connectToUnit', {ip:b.ip, app:b.app})
		
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
	tareWeight(){
		if(this.state.connected){
			console.log(this.state.curDet, vdefByMac)
			var rpc = vdefByMac[this.state.curDet.mac][0]['@rpc_map']['KAPI_TARE_WEIGHT_TARE']
				var packet = dsp_rpc_paylod_for(rpc[0],rpc[1]);
			socket.emit('rpc', {ip:this.state.curDet.ip, data:packet})

		}
	}	
	calWeight(){
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
		this.refs.hh.parsePack(pack)
		var max = Math.max(...data)
		this.refs.ss.parsePack(max);
		this.refs.tb.update(max);
		this.refs.se.setState({value:max.toFixed(1)+' g'})
		this.refs.lg.parseDataset(data, pack)

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
		if(this.state.start){
			this.simStart()
		}
	}
	stop(){
		if(!this.state.start){
			this.simStart()
		}
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
		setTimeout(function () {
			self.refs.settingModal.toggle()
		},100)
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
		socket.emit('connectToUnit',det)
		//socket.emit('vdefReq', det);
		this.setState({curDet:det, connected:true})
	}
	renderModal() {
		var self = this;
		
		    	var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}

		var detectors = this.state.dets.map(function (det, i) {
			// body...
			return   <div> <CircularButton branding={self.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={det.name} onClick={()=> self.connectToUnit(det)}/></div>
       
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
	render(){
	

		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}

		var config = 'config_w'
    	var find = 'find_w'
    	var klass = 'interceptorDynamicView'
    	var pl = 'assets/play-arrow-fti.svg'
    	var stp = 'assets/stop-fti.svg'
    	var backgroundColor;
    	var grbg = 'black'
    	var img = 'assets/NewFortressTechnologyLogo-WHT-trans.png'
    	var psbtklass = 'circularButton'
    	var psbtcolor = 'black'
    	var grbrdcolor = '#818a90'
    	if(this.state.branding == 'FORTRESS'){
    		backgroundColor = FORTRESSPURPLE1
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
    		play = <div onClick={this.start} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#00DD00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
    		stop = <div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#FA2222', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    	}else{
    		play = <div onClick={this.start} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#00DD00', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53, boxShadow:'inset 2px 4px 7px 0px rgba(0,0,0,0.75)'}} className={psbtklass}> <img src={pl} style={{display:'inline-block', marginLeft:-15, width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Start</div></div>
			stop = <div onClick={this.stop} style={{width:120, lineHeight:'53px',color:psbtcolor,font:30, background:'#FA2222', display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} className={psbtklass}> <img src={stp} style={{display:'inline-block', marginLeft:-15,width:30, verticalAlign:'middle'}}/><div style={{display:'inline-block'}}>Stop</div></div> 

    	}    	

    	var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'50px'}


		return  (<div className='interceptorMainPageUI' style={{background:backgroundColor, width:'100%',display:'block', height:'-webkit-fill-available', boxShadow:'0px 19px '+backgroundColor}}>
         <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
            <tbody>
              <tr>
                <td><img style={{height: 67,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:16}} onClick={()=> function(){location.reload()}}  src={img}/></td>
                	<td style={{height:60, width:200, color:'#eee', textAlign:'right'}}><div style={{fontSize:28,paddingRight:6}}>{'Robert B.'}</div>
                	<Clock style={{fontSize:16, color:'#e1e1e1', paddingRight:6, marginBottom:-17}}/></td>
                	<td className="logbuttCell" style={{height:60}}>
                	<div style={{paddingLeft:3, borderLeft:'2px solid #56697e', borderRight:'2px solid #56697e',height:55, marginTop:16, paddingRight:3}}>
                	<button className='logout' style={{height:50, marginTop:-7}} />
                	<div style={{color:'#e1e1e1', marginTop:-17, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Level 1'}</div>
                	</div></td>
		          <td className="confbuttCell" style={{paddingRight:5}}><button onClick={this.showDisplaySettings} className={config} style={{marginTop:-2, marginLeft:2,marginBottom:-10}}/>
		          <div style={{color:'#e1e1e1', marginTop:-20, marginBottom:-17, height:34, fontSize:18, textAlign:'center'}}>{'Settings'}</div>
		          </td>
              </tr>
            </tbody>
          </table>
          <table><tbody><tr style={{verticalAlign:'top'}}><td>
         	<StatSummary branding={this.state.branding} ref='ss'/>
          </td><td><div><SparcElem ref='se' branding={this.state.branding} value={this.state.rec['LiveWeight'] + 'g'} name={'Gross Weight'} width={616} font={40}/></div>
          <div>
          </div><div style={{background:grbg,border:'5px solid '+grbrdcolor, borderRadius:20,overflow:'hidden'}}><LineGraph  branding={this.state.branding} ref='lg' prodName={'Crackers - 17g'}>
          <TrendBar branding={this.state.branding} lowerbound={15} upperbound={19} t1={15.5} t2={18.5} low={16.5} high={17.5} yellow={true} ref='tb'/></LineGraph></div>
          </td><td>
          	<HorizontalHisto branding={this.state.branding} ref='hh'/>
          </td></tr></tbody></table>
          <div style={{display:'inline-block',padding:5, marginRight:10, marginLeft:10}} >{play}{stop}</div>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Check Weight'} onClick={this.calWeight}/>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Tare'} onClick={this.tareWeight}/>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Product'} onClick={()=>this.refs.pmodal.toggle()}/>
          <CircularButton branding={this.state.branding} innerStyle={innerStyle} style={{width:210, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:53}} lab={'Log'} onClick={this.changeBranding}/>
      	<Modal ref='pmodal' Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:SPARCBLUE1, maxHeight:650, height:620}}>
      		<ProductSettings branding={this.state.branding}/>
      	</Modal>
      	 <Modal ref='settingModal' Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:SPARCBLUE1, maxHeight:650, height:620}}>
      		{this.renderModal()}
      	</Modal>
      	<Modal ref='cwModal' Style={{maxWidth:1200, width:'95%'}} innerStyle={{background:SPARCBLUE1, maxHeight:650, height:620}}>
      		<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Calibrate Weight'} value={this.state.prec['CalWeight']+'g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Over Weight Limit'} value={this.state.prec['OverWeightLim']+'g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Under Weight Limit'} value={this.state.prec['UnderWeightLim']+'g'}/></div>
						
      	</Modal>
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
class SparcElem extends React.Component{
	constructor(props){
		super(props)
		this.state = {value:this.props.value}
	}
	componentWillReceiveProps(newProps){
		this.setState({value:newProps.value})
	}

	render(){
		var outerbg = '#818a90'
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'

		if(this.props.branding == 'SPARC'){
			outerbg = '#e1e1e1'
			innerbg = SPARCBLUE2
			fontColor = 'black'
		}
		var innerWidth = Math.min((this.props.width*0.55),160);
		var innerFont = Math.min(Math.floor(this.props.font/2), 16);
		return(<div style={{width:this.props.width,background:outerbg, borderRadius:10, marginTop:5,marginBottom:5, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

			<div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:fontColor}}>{this.props.name}</div></div><div style={{textAlign:'center', marginTop:-10,lineHeight:this.props.font*1.3+'px',height:this.props.font*1.3, fontSize:this.props.font}}>{this.state.value}</div>
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
		this.state = {data:[0, 0, 0, 0, 0, 0, 0, 0]}
	}
	parsePack(pack){
		var data = this.state.data.slice(0)
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
		this.setState({data:data})
	}	
	render(){
		var outerbg = '#818a90'
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'
		var graphColor = FORTRESSPURPLE1
		if(this.props.branding == 'SPARC'){
			outerbg = '#e1e1e1'
			innerbg = SPARCBLUE2
			fontColor = 'black'
			graphColor = SPARCBLUE2;
		}
		var xDomain = [0,15]
		var yDomin = [0, 5]
		var data = [{x: this.state.data[0], y:'Total'}, {x: this.state.data[1], y:'Good'}, {x: this.state.data[2], y:'Under Weight'}, {x: this.state.data[3], y:'Over Weight'}, {x:this.state.data[4], y:'Unstable'}, {x:this.state.data[5], y:'Check Weights'}, {x:this.state.data[6], y:'Over Capacity'}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
		var labelData = data.map(function(d){
			var lax = 'start'
			if(d.x > (data[0].x*0.75)){
				lax = 'end'
				return {x:d.x,y:d.y,label:d.x, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
			}
			return	{x:d.x,y:d.y,label:d.x, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
		})
		//var hh = 
		return <div style={{width:400, height:515,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0}}>

			<div style={{marginBottom:30}}><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:150,paddingLeft:2, fontSize:16, color:fontColor}}>Statistics</div></div>

		<XYPlot	height={430} width= {400} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal'>		
  
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
		this.state = {decisionRange:[12,18],max:20,dataSets:[[8,9,13,15,16,16,14,13,10,4],[9,10,12,14,15,14,13,11,9,3],[9,10,14,15,17,17,15,9,8,2]],reject:false,over:false,under:false}
	}
	parseDataset(data,pack){
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
		if((max > 17.5) || (max < 16.5)){
			reject = true;
	
		}
		this.setState({dataSets:dataSets, reject:reject,max:Math.max(...setMax), over:(max>17.5), under:(max<16.5)})
	}
	render(){
		var outerbg = '#818a90'
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'
		var graphColor = FORTRESSPURPLE1
		var bg2 = 'rgba(150,150,150,0.3)'
	
		if(this.props.branding == 'SPARC'){
			outerbg = '#e1e1e1'
			innerbg = SPARCBLUE2
			fontColor = 'black'
			graphColor = SPARCBLUE2;
			bg2 = 'rgba(150,150,150,0.5)'
		}
		var opc = [0.8,0.6,0.4,0.3,0.2,0.1]
		var dsl = this.state.dataSets.length;
		var max = 0;
		var min = 0;
		var self = this;
		if(dsl != 0){
			var decSet =  this.state.dataSets[dsl-1].slice(this.state.decisionRange[0],this.state.decisionRange[1])
			max = Math.max(...decSet);
			min = Math.min(...decSet)
		}

		var graphs = this.state.dataSets.map(function(set,i){
			var data = set.map(function(d,j){
				return {y:d, x:j}
			})
			if(i+1 == dsl){
				
				return <AreaSeries curve='curveMonotoneX' opacity={opc[dsl-1-i]} color={graphColor} data={data}/>
			}else{
				
				return <AreaSeries curve='curveMonotoneX' opacity={opc[dsl-1-i]} color="#818a90" data={data}/>
			}
		})
	var bg = 'transparent';
	var str = 'Good Weight'
	if(this.state.reject){
		bg = 'rgba(255,255,0,0.2)'
		bg2 = 'rgba(255,255,0,0.3)'
	}
	if(this.state.over){
		str = 'Over Weight'
	}else if(this.state.under){
		str = 'Under Weight'
	}
	return	<div style={{background:bg, textAlign:'center'}}>
		<div style={{width:580,marginLeft:'auto',marginRight:'auto'}}>{this.props.children}</div>
		<div style={{background:'black',width:580,marginLeft:'auto',marginRight:'auto'}}><div style={{background:bg2,color:'#e1e1e1',marginBottom:-47,marginLeft:'auto',marginRight:'auto',padding:4,width:572, height:75,lineHeight:'35px'}}><div style={{display:'inline-block', width:280}}><div style={{fontSize:16}}>Running Product</div><div style={{fontSize:24}}>{this.props.prodName}</div></div>
		<div style={{display:'inline-block', width:280}} ><div style={{fontSize:16}}>Status</div><div style={{fontSize:24}}>{str}</div></div></div>
		</div>
	<XYPlot height={358} width={610} yDomain={[0,this.state.max]} stackBy='y' margin={{left:0,right:0,bottom:0,top:50}}>
		<XAxis hideTicks />
		{graphs}
		<VerticalRectSeries curve='curveMonotoneX' stack={true} opacity={0.8} stroke="#ff0000" fill='transparent' strokeWidth={3} data={[{y0:min,y:max,x0:this.state.decisionRange[0],x:this.state.decisionRange[1]}]}/>
		
		</XYPlot></div>
	}
}
class StatSummary extends React.Component{
	constructor(props){
		super(props)
		this.parsePack = this.parsePack.bind(this);
		this.state = {count:0, grossWeight:0,currentWeight:0}
	}
	parsePack(max){
		this.setState({count:this.state.count+1,grossWeight:this.state.grossWeight + max,currentWeight:max})

	}
	render(){
		var outerbg = '#818a90'
		var innerbg = '#5d5480'
		var fontColor = '#e1e1e1'

		if(this.props.branding == 'SPARC'){
			outerbg = '#e1e1e1'
			innerbg = SPARCBLUE2
			fontColor = 'black'
		}

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
	return	<div style={{width:220,background:outerbg, borderRadius:10, margin:5, marginBottom:0, border:'2px '+outerbg+' solid', borderTopLeftRadius:0, height:515}}>

			<div><div style={{background:innerbg, borderBottomRightRadius:15, height:24, width:140,paddingLeft:2, fontSize:16, color:fontColor}}>Summary</div></div>
			<StatControl name='Gross Weight' value={grstr}/>
			<StatControl name='Gross Weight (Live)' value={this.state.currentWeight.toFixed(1)+'g'}/>
			<StatControl name='Net Weight' value='0g'/>
			<StatControl name='Average Weight' value={av.toFixed(1)+'g'}/>
			<StatControl name='Standard Deviation' value='0g'/>
			<StatControl name='Giveaway (Batch)' value='0g'/>
			<StatControl name='Giveaway (Sample)' value='0g'/>
			<StatControl name='Production Rate' value='150ppm'/>

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
class ProductSettings extends React.Component{
	constructor(props){
		super(props)
		this.updateFilterString = this.updateFilterString.bind(this);
		this.toggleSearch = this.toggleSearch.bind(this);
		this.selectProd = this.selectProd.bind(this);
		this.onProdScroll = this.onProdScroll.bind(this);
		this.state ={searchMode:false, filterString:'', filterList:[],selProd:1,prodList:[{name:'Crackers - 17g', no:1},{name:'Cookies - 100g',no:2},{name:'Chips - 35g',no:3},{name:'Lays - 40g',no:4},{name:'Doritos - 40g',no:5},{name:'Cheetos - 35g',no:6},{name:'Cereal - 200g',no:7},{name:'Bread - 200g',no:8},{name:'Eggos - 500g',no:9},{name:'Patties - 400g',no:10},{name:'Fries - 454g',no:11},{name:'Hot Dogs - 200g',no:12},{name:'Snickers - 35g',no:13},{name:'Cheese - 35g',no:14},{name:'Popcorn - 100g',no:15},{name:'Candy - 35g',no:16},{name:'Chocolate - 35g',no:17}]}
	}
	componentDidMount(){
		var self = this;
		var scrollInd = 0;
		this.state.prodList.forEach(function(prd,i){
			if(prd.no == self.state.selProd){
				scrollInd = i;
			}
		});
		var el = document.getElementById('prodListScrollBox')
		el.scrollTop = scrollInd*66
	}
	updateFilterString(str){
		var list = []
		var self = this;
		this.state.prodList.forEach(function(prod) {
				// body...

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
	selectProd(p){
		this.setState({selProd:p, searchMode:false, filterString:''})
		
	}
	onProdScroll(){
		     var el = document.getElementById('prodListScrollBox')   
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
	render(){
		var self = this;
		var list = [];
		var sp = null;
		var content = ''
			var innerStyle = {display:'inline-block', position:'relative', verticalAlign:'middle',height:'100%',width:'100%',color:'#1C3746',fontSize:30,lineHeight:'40px'}

		if(this.state.searchMode){
			var filterString = this.state.filterString
			this.state.prodList.forEach(function(prod) {
				// body...

			/*	if(filterString.trim() == ''){
					list.push(prod)
				}else if(prod.name.toUpperCase().indexOf(filterString.toUpperCase()) != -1){
					list.push(prod)
				}*/
				if(self.state.selProd == prod.no){
					sp = prod 
				}

			})
			list = this.state.filterList.slice(0)
			content = <div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6, height:480}}>
			<EmbeddedKeyboard label={'Search Products'} liveUpdate={this.updateFilterString} language={'english'}/></div>
		}else{
			list = this.state.prodList.slice(0)
			list.forEach(function (pr) {
				// body...
				if(self.state.selProd == pr.no){
					sp = pr 
				}
			})
			content =( 
			<div style={{background:'#e1e1e1', padding:5, width:813,marginRight:6,height:480}}>
				<div>
				<div style={{display:'inline-block', verticalAlign:'top'}}><ProdSettingEdit h1={40} w1={200} h2={60} w2={400} label={'Product Name'} value={sp.name}/></div>
				<div style={{display:'inline-block', marginLeft:87, marginBottom:-10}}>
					<div style={{position:'relative', verticalAlign:'top'}} onClick={this.toggleSearch}>
						<div style={{height:35, width:120, display:'block', background:'linear-gradient(120deg, transparent, transparent 25%,#1C3746 26%, #1C3746)'}}/>
						<div style={{height:35, width:120, display:'block', background:'linear-gradient(60deg, transparent, transparent 25%,#1C3746 26%, #1C3746)'}}/>
						<div style={{position:'absolute',float:'right', marginTop:-70, marginLeft:50, color:'#e1e1e1'}}><img src='assets/search_w.svg' style={{width:50}}/><div style={{textAlign:'right', paddingRight:20, marginTop:-20, fontSize:16}}>Search</div></div>
					</div>
				</div>
				</div>
				<div>
					<div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Nominal Weight'} value={'0g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Target Weight'} value={'0g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Product Tare'} value={'0g'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Product Length'} value={'0mm'}/></div>
						<div style={{marginTop:5}}><ProdSettingEdit h1={40} w1={200} h2={51} w2={200} label={'Measure Mode'} value={'Auto'}/></div>
					</div>

					<div style={{display:'inline-block',width:'50%', verticalAlign:'top'}}>
						<div style={{width:'90%',padding:'2.5%',margin:'2.5%',background:'linear-gradient(90deg,#919aa0, #e1e1e1)'}}>
							<div><div style={{width:'60%',display:'inline-block'}}>Overweight Accept</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>Enabled</div></div>
							<div><div style={{width:'60%',display:'inline-block'}}>Product Speed</div><div style={{width:'40%',display:'inline-block', textAlign:'right'}}>60m/min</div></div>
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
					<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Advanced'}/>
          			<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Save Product'}/>
          
				</div>
			</div>)
		}
		
		var scrollInd = 0
		var prods = list.map(function (prd,i) {

			// body...
			if(prd.no == self.state.selProd){
				scrollInd = i;
			}
			return <div> <ProductSelectItem name={prd.name} p={prd.no} selectProd={self.selectProd} selected={(self.state.selProd == prd.no)}/>
         </div>
		})

		if(list.length == 0){
			prods = <div style={{textAlign:'center', width:297,padding:5}}>No Matching Products</div>
		}
		var spstr = ''
		if(sp != null){
			spstr = sp.no + '. '+sp.name;
		}
		var SA = (list.length > 8)
		return <div style={{width:1155}}>
			<div style={{color:'#e1e1e1'}}><div style={{display:'inline-block', fontSize:30, textAlign:'left', width:530, paddingLeft:10}}>Products</div><div style={{display:'inline-block', fontSize:20,textAlign:'right',width:600}}>{'Current Product: '+spstr }</div></div>
			<table><tbody>
				<tr>
					<td style={{verticalAlign:'top', width:830}}>{content}<div style={{width:813, padding:5, paddingTop:0, textAlign:'right'}}>			<CircularButton branding={this.props.branding} innerStyle={innerStyle} style={{width:380, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43, borderRadius:15}} lab={'Select Product'}/>
          </div></td><td style={{verticalAlign:'top',textAlign:'center'}}>
          	<ScrollArrow ref='arrowTop' offset={72} width={72} marginTop={-40} active={SA} mode={'top'} onClick={this.scrollUp}/>
		
          <div onScroll={this.onProdScroll} id='prodListScrollBox' style={{height:557, background:'#e1e1e1',overflowY:'scroll'}}>{prods}</div>
          <ScrollArrow ref='arrowBot' offset={72} width={72} marginTop={-30} active={SA} mode={'bot'} onClick={this.scrollDown}/>
			
          </td>
				</tr>
			</tbody></table>
			
		</div>
	}
}
class ProdSettingEdit extends React.Component{
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick(){

	}
	render(){
		var ckb = <CustomKeyboard language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
	
		return <div>
			<div style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:20,zIndex:1, lineHeight:this.props.h1+'px', borderBottomLeftRadius:15,borderTopRightRadius:15, backgroundColor:SPARCBLUE2, width:this.props.w1,textAlign:'center'}}>
				{this.props.label}
			</div>
			<div onClick={this.onClick} style={{display:'inline-block', verticalAlign:'top', position:'relative', fontSize:24,zIndex:2,lineHeight:this.props.h2+'px', borderRadius:15,height:this.props.h2, border:'5px solid #818a90',marginLeft:-5,textAlign:'center', width:this.props.w2}}>
				{this.props.value}
			</div>
		</div>
	}
}
class ProductSelectItem extends React.Component{
	constructor(props){
		super(props)
		this.switchProd = this.switchProd.bind(this);
	}
	switchProd(){
		this.props.selectProd(this.props.p)
	}
	render () {
		// body..
		
		var check= ""
		var dsW = 300;
		var stW = 227;
		var ds = {paddingLeft:7, display:'inline-block', width:dsW, background:"transparent"}
		var st = {padding:7,display:'inline-block', width:stW, height:50, lineHeight:'50px',fontSize:22,borderBottom:'2px solid #bbbbbbaa'}
		var mgl = -90
		var buttons// = <button className='deleteButton' onClick={this.deleteProd}/>
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			ds = {paddingLeft:7,display:'inline-block', width:dsW,	 background:"#7ccc7c"}
			//st = {color:'green', padding:7, display:'inline-block', width:200}
			mgl = -160

		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		
		return (<div style={{background:"transparent", color:"#000", position:'relative', textAlign:'left'}}><div style={ds} ><div style={{display:'inline-block', width:22}}>{check}</div><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label></div>
			</div>)
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
ReactDOM.render(<Container/>,document.getElementById('content'))