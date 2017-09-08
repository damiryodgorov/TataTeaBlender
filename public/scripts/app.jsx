var React = require('react');
var ReactDOM = require('react-dom')
import {ConcreteElem,CanvasElem,KeyboardInput,TreeNode,SnackbarNotification} from './components.jsx';
var injectTapEventPlugin = require('react-tap-event-plugin')
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';


var TestSetupPage = React.createClass({
	getInitialState: function(){
		return({})
	},
	render:function(){
		return (<div>
		
	</div>)
	}

})

function getParams(cat, pVdef, sysRec, prodRec, _vmap, dynRec){
	var params = []
	cat.params.forEach(function(p) {
    	var _p = {'@name':p, '@children':[]}
   		if(typeof pVdef[0][p] != 'undefined'){
   			_p = {'@name':p, '@data':sysRec[p], '@children':[]}
   		}else if(typeof pVdef[1][p] != 'undefined'){
    		_p = {'@name':p, '@data':prodRec[p], '@children':[]}
    	}else if(typeof pVdef[2][p] != 'undefined'){
    		_p = {'@name':p, '@type':'dyn','@data':dynRec[p], '@children':[]}
    	}
    	console.log(_vmap[p])
    	console.log(p)
    	_vmap[p].children.forEach(function (ch) {
    		var _ch;
    		if(typeof pVdef[0][ch] != 'undefined'){
    			_ch = sysRec[ch]
    		}else if(typeof pVdef[1][ch] != 'undefined'){
    			_ch = prodRec[ch]
    		}else if(typeof pVdef[2][ch] != 'undefined'){
    			_ch = dynRec[p]
    		}
    		_p['@children'].push(_ch)	
    	})
    	params.push(_p)
    					
    })
	return params
}
//var cat = _cvdf.slice(0)
function iterateCats(cat, pVdef, sysRec, prodRec, _vmap, dynRec){

	cat.params = getParams(cat, pVdef, sysRec, prodRec, _vmap, dynRec)
	var subCats = cat.subCats.map(function (sc) {

		return iterateCats(sc, pVdef, sysRec, prodRec, _vmap, dynRec)
	})
	cat.subCats = subCats;
	return cat
	
}
//for efficiency, and limited depth: 
function noRecursion(cat, pVdef, sysRec, prodRec, _vmap) {
	// body...
	var ct = cat;
	ct.params = getParams(ct, pVdef, sysRec, prodRec, _vmap)
	ct.subCats.forEach(function (sc) {
		sc.params = getParams(sc, pVdef, sysRec, prodRec, _vmap)
		sc.subCats.forEach(function(ssc){
			ssc.params = getParams(ssc, pVdef, sysRec, prodRec, _vmap)
			ssc.subCats.forEach(function(sssc){
				sssc.params = getParams(sssc, pVdef, sysRec, prodRec, _vmap)
				sssc.subCats.forEach(function(ssssc){
					ssssc.params = getParams(ssssc, pVdef, sysRec, prodRec, _vmap)
					ssssc.subCats.forEach(function(sssssc){
						sssssc.params = getParams(sssssc, pVdef, sysRec, prodRec, _vmap)
					})
				})
			})
		})
		// body...
	})
	return ct;
}

var Container = React.createClass({
	getInitialState:function(){
		return({ data:[]})
	},
	render: function (){
		return (<div>
		<LandingPage/>	
			<Notifications/>
		</div>)
	}
});
var LandingPage = React.createClass({
	getInitialState: function () {
		var minMq = window.matchMedia("(min-width: 400px)");
		var mq = window.matchMedia("(min-width: 850px)");
		mq.addListener(this.listenToMq)
		minMq.addListener(this.listenToMq)
		var mqls = [
			window.matchMedia("(min-width: 321px)"),
			window.matchMedia("(min-width: 376px)"),
			window.matchMedia("(min-width: 426px)")
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		return ({currentPage:'landing',netpolls:{}, curIndex:0, minMq:minMq, minW:minMq.matches, mq:mq, brPoint:mq.matches, 
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:5,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]}})
	},
	listenToMq: function (argument) {
		// body...
		if(this.refs.dv){
			this.refs.dv.setState({br:this.state.mq.matches})
		}
		this.setState({brPoint:this.state.mq.matches})
	},
	locateUnits: function (callback) {
		located = false;
		socket.emit('hello','landing')
		this.refs.findDetModal.toggle();
	},
	locateB: function(){
		socket.emit('locateReq', 'b')
	},
	componentDidMount: function () {
		var self = this;
		this.loadPrefs();
		socket.on('resetConfirm', function (r) {
			socket.emit('locateReq');
		})
		
		socket.on('netpoll', function(m){
			//////console.log(['73',m])
			self.onNetpoll(m.data, m.det)
			m = null;
		})
		socket.on('prefs', function(f) {
			////console.log(f)
			var detL = self.state.detL
			f.forEach(function (u) {
				u.banks.forEach(function(b){
					detL[b.mac] = null
				})
			})
			self.setState({mbunits:f, detL:detL})
		})
		socket.on('noVdef', function(ip){
			setTimeout(function(){
				socket.emit('vdefReq', ip);
			}, 1000)
		})
		socket.on('locatedResp', function (e) {
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
				////console.log(d)
				socket.emit('vdefReq', d.ip);

			})
			////console.log(dets)
			self.state.mbunits.forEach(function(u){
				u.banks.forEach(function(b) {
					dets[b.mac] = null;
					if(!nps[b.ip]){
						nps[b.ip] = []
					}
					console.log('connectToUnit')
					socket.emit('connectToUnit', b.ip)
				})
			})
			self.setState({dets:e, detL:dets, macList:macs, netpolls:nps})
		});
		
		socket.on('paramMsg2', function(data) {
		//	console.log('on param msg')
			self.onParamMsg2(data.data,data.det) 
			data = null;
		})
		socket.on('rpcMsg', function (data) {
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
		if(_buildVersion != 'MegaTron'){
		setTimeout(function (argument) {
			// body...
			if(self.state.mbunits.length == 1){
				if(self.state.currentPage == 'landing'){
					if(self.state.mbunits[0].banks.length == 1){
						if(vdefByIp[self.state.mbunits[0].banks[0].ip]){
							self.switchUnit(self.state.mbunits[0].banks[0])
						}else{
							setTimeout(function () {
								// body...
								if(vdefByIp[self.state.mbunits[0].banks[0].ip]){
									self.switchUnit(self.state.mbunits[0].banks[0])
								}
							},2000)
						}
					}
					
				}	
			}
		},800)
	}

	},
	onNetpoll: function(e,d){
		////console.log([e,d])
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
				console.log('test started: ' + d.ip)
			}else if(e.net_poll_h == 'NET_POLL_TEST_REQ_PASS'){
				console.log('test passed: ' + d.ip)
				notify.show('Test Passed')
			}

			this.setState({netpolls:nps})
		}
		
	},
	onRMsg: function (e,d) {
		////console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);

		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.ip]){
			this.refs[d.ip].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  					if(b.ip == d.ip){
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
	},
	onParamMsg2: function (e,d) {
		if(vdefByIp[d.ip]){
			if(this.refs[d.ip]){
				this.refs[d.ip].onParamMsg2(e);
			}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  					m.banks.forEach(function (b) {
  						if(b.ip == d.ip){
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
				this.refs.dv.onParamMsg2(e,d)
			}
		}
		e = null;
		d = null;
	},
	
	ipChanged: function (e) {
		e.preventDefault();
		this.setState({ipToAdd:e.target.value})
	},
	renderDetectors: function () {
		var self = this;
		var units = this.state.detectors.map(function (u) {
			return <SingleUnit ref={u.ip} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
	},
	showFinder: function () {
		this.refs.findDetModal.toggle();
		this.locateB()
	},
	logoClick: function () {
		this.setState({currentPage:'landing'})
	},
	switchUnit: function (u) {
		////console.log(u)
		var self = this;
		setTimeout(function () {
			// body...
			self.setState({curDet:u, currentPage:'detector'})
		},100)
		
	},
	addNewMBUnit:function () {
		var self = this;
		setTimeout(function (argument) {
			// body...
		
		self.setState({curModal:'newMB', tmpMB:{name:'NEW', type:'mb', banks:[]}})
		},100)
	}, 
	addNewSingleUnit: function () {
		var self = this;
		setTimeout(function (argument) {
			// body...
			self.setState({curModal:'newSingle', tmpMB:{name:'NEW', type:'single', banks:[]}})
		},100)
		
	},
	addMBUnit: function (mb) {
		var mbunits = this.state.mbunits
		var nps = this.state.netpolls
		mbunits.push(mb)
		mb.banks.forEach(function(b){
			if(!nps[b.ip]){
				nps[b.ip] = []
			}
		})
		this.setState({mbunits:mbunits, netpolls:nps})
	},
	editMb:function (i) {
		
		var mbunits = this.state.mbunits;

		var mbunit ={}
		mbunit.type = mbunits[i].type;
		mbunit.name = mbunits[i].name;
		mbunit.banks = mbunits[i].banks;
		this.setState({curIndex:i, curModal:'edit', tmpMB:mbunit})
	},
	addToTmp:function(e, type){
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
		if(vdefByIp[dsps[e].ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2){
			tmpdsp.interceptor = true
		}else{
			tmpdsp.interceptor = false
		}
		socket.emit('connect',tmpdsp.ip)
		cont.push(tmpdsp)
		detL[dsps[e].mac] = null;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
		
	},
	addToTmpGroup: function (e) {
		this.addToTmp(e,'multi')
	},
	addToTmpSingle: function (e) {
		this.addToTmp(e,'single')
	},
	removeFromTmpGroup: function (e) {
		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		detL[cont[e].mac] = cont[e]
		cont.splice(e,1)
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
	},
	cancel: function () {
		////console.log(['268', 'cancel'])
		var detL = this.state.detL;
		this.state.tmpMB.banks.forEach(function (b) {
			detL[b.mac]= b
		})
		this.setState({curModal:'add',detL:detL, tmpMB:{name:'NEW',type:'mb',banks:[]}})
	},
	submitMB: function(){
		var mbunits = this.state.mbunits;
		mbunits.push(this.state.tmpMB)

		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	},
	submitMBe: function(){
		var mbunits = this.state.mbunits;
		mbunits[this.state.curIndex]= this.state.tmpMB 
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpMB:{name:'NEW',type:'mb',banks:[]}})
	},
	changeModalMode: function () {
		this.setState({curModal:'add'})
	},
	move: function (i,d) {
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
	},
	saveSend: function (mbunits) {
		socket.emit('savePrefs', mbunits)
	},
	save: function () {
		socket.emit('savePrefs', this.state.mbunits)
	},
	loadPrefs: function () {
		////console.log('load prefs')
		socket.emit('locateReq');
		socket.emit('getPrefs');
	},
	removeMb: function (i) {
		var mbunits = this.state.mbunits;
		var detL = this.state.detL
		mbunits[i].banks.forEach(function(b){
			detL[b.mac] = b
		})
		mbunits.splice(i,1);
		this.saveSend(mbunits)
		this.setState({mbunits:mbunits, detL:detL})
	},
	reset: function () {
		socket.emit('reset', 'reset requested')
	},
	renderModal: function () {
		var self = this;
		var mbSetup = this.state.mbunits.map(function(mb,ind) {
			////console.log(ind)
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
						<div className='prefInterface'>
								<button onClick={this.addNewMBUnit}>Add new MultiBankUnit</button>
								<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
								<button onClick={this.save}>Save Settings</button>
								<button onClick={this.loadPrefs}>Load Saved Settings </button>
								<button onClick={this.reset}>Reset Connections</button>
								<div className='mbManager'>
								{mbSetup}
						</div>
						</div>
						</div>)
		}
	},
	changetMBName: function (e) {
		e.preventDefault();
		if(this.state.mbunits)
		var MB = this.state.tmpMB
		if(typeof e == 'string'){
			MB.name = e
		}else{
			MB.name = e.target.value;
		
		}
		this.setState({tmpMB:MB})
	},
	renderMBGroup: function (mode) {
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
			var	nameEdit = (<KeyboardInput onFocus={this.addFocus} onRequestClose={this.addClose} onChange={this.changetMBName} tid='mbtname' value={MB.name}/>)
			return (<div><label>Name:</label>{nameEdit}
					<table><tbody><tr>
					<th>Available Detectors</th><th>Banks</th>
					</tr><tr>
					<td style={{width:300, border:'1px solid black', minHeight:50}}>
						{detectors}
					</td><td style={{width:300,  border:'1px solid black', minHeight:50}}>
						{banks}
					</td><td><div style={{height:30}}/></td></tr></tbody></table>
					{submit}<button onClick={this.cancel}>Cancel</button>
					</div>)
	},
	showLogin: function(){
		this.refs.logIn.toggle();
	},
	showLogs: function () {
		// body...
		this.refs.logModal.toggle()
	},
	renderLanding: function () {
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
					////console.log('457')
					return <SingleUnit ref={mb.banks[0].ip} onSelect={self.switchUnit} unit={mb.banks[0]}/>	
				}						
			}
			
		})
		
		var modalContent = this.renderModal();
		return (<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell" hidden><button onClick={this.showLogs} className={find}/></td>
								
							
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal'>
						{modalContent}
					</Modal>
					<Modal ref='logModal'>
					<LogView netpolls={this.state.netpolls}/>
					</Modal>
				 	{detectors}
				 	{mbunits}
			</div>)	
	},
	renderDetector: function () {
		return (<DetectorView br={this.state.brPoint} ref='dv' acc={this.state.level} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip} netpolls={this.state.netpolls[this.state.curDet.ip]}/>)
	},
	renderAccounts: function(){
		
		if(this.state.level == 5){
			return <AccountControlView showLogin={this.showLogin} minW={this.state.minW} ref='acc' active={true} logoClick={this.logoClick}/>
		}else{
			return <AccountControlView showLogin={this.showLogin} minW={this.state.minW} ref='acc' active={false} logoClick={this.logoClick}/>
		}
	},
	configAccounts: function(){
		this.setState({currentPage:'userSetup'})
	},
	onLoginFocus: function(){
		this.refs.logIn.setState({override:true})
	},
	onLoginClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.logIn.setState({override:false})	
		}, 100)
		
	},
	addFocus: function(){
		this.refs.findDetModal.setState({override:true})
	},
	addClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.findDetModal.setState({override:false})	
		}, 100)
	},
	dummy: function () {
		// body...
		console.log('dummy')
	},
	render: function () {
		var cont;
		if(this.state.currentPage == 'landing'){
			////console.log('here')
			cont = this.renderLanding();
		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
		}else if(this.state.currentPage == 'userSetup'){
			cont = this.renderAccounts();
		}
		return (<div>
			<Modal ref='logIn'>
				<LogInControl onKeyFocus={this.onLoginFocus} onRequestClose={this.onLoginClose} level={this.state.level} userName={this.state.curUser}/>
				<button onClick={this.configAccounts}>Configure Accounts</button>
			</Modal>

			{cont}
			
		</div>)
	}
})
var LogView = React.createClass({
	getInitialState: function () {
		// body...
		return({netpolls:this.props.netpolls})
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({netpolls:newProps.netpolls})	// body...
	},
	render:function () {
		// body...
		var dets = [];
		for(var d in this.state.netpolls){
			var evs = this.state.netpolls[d].map(function (e) {
				// body...			
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations']['english']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults

			var string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;
			if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				string = e.parameters[0].param_name + ': ' + e.parameters[0].value
			}

				return (<tr><td>{dateTime}</td><td>{ev}</td><td>{string}</td></tr>)
			})
			var tab = (<table className='npTable'><tbody>
				{evs}
				</tbody></table>)
			if(this.state.netpolls[d].length == 0){
				tab = <label>No Logs availble</label>
			}
			var node = (<TreeNode hide={false} nodeName={'Detector at ' +d}>
				{tab}
			</TreeNode>)
			dets.push(node)
		}
		return( <div>
			<div>Logs for all detectors</div>
			{dets}
		</div>)
	}
})
var AccountControlView = React.createClass({
	getInitialState: function(){
		return ({userList:[], newuser:'',password:'',level:0})
	},
	logoClick: function(){
		this.props.logoClick();
	},
	showLogin: function(){
		this.props.showLogin();
	},
	componentDidMount: function(){
		var self = this;
		socket.emit('getUsers','data');
		socket.on('userList', function(data){
			self.setState({userList:data})
		})
	},
	addNew:function(){
		socket.emit('addUser', {id:this.state.newuser, pw:this.state.password, level:parseInt(this.state.level)})
		this.setState({newuser:'', password:'', level:0})
	},
	userNameChange:function(e){
		this.setState({newuser:e.target.value});
	},
	passwordChange:function(e){
		this.setState({password:e.target.value});
	},
	levelChange: function(e){
		this.setState({level:e.target.value})
	},
	render: function(){
		var cont = '';
		var login = 'login';
		var lstyle = {height: 72,marginRight: 20}
		if(!this.props.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var users = this.state.userList.map(function(u){
			return(<UserObj user={u}/>)
		})
		if(this.props.active){
			cont = <div><label>Users</label>
				<div>
					{users}
				</div>
				<table><tbody>
				<tr><td>User</td><td><input type='text' onChange={this.userNameChange} value={this.state.newuser}/></td></tr>
				<tr><td>Password</td><td><input type='text' onChange={this.passwordChange} value={this.state.password}/></td></tr>
				<tr><td>level</td><td><input type='text' onChange={this.levelChange} value={this.state.level}/></td></tr>
				<tr><td>test</td><td><KeyboardInput tid="test" value=''/></td></tr>
				</tbody></table>
				<button onClick={this.addNew}>Add User</button>
			</div>
		}else{
			cont = <div><label>Log in as admin to access this page</label></div>
		}
		return(<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img onClick={this.logoClick}style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell"><button onClick={this.showLogin} className={login}/></td>
							</tr>
						</tbody>
					</table>
					{cont}
			</div>)	
	}
})

var UserObj = React.createClass({
	delete:function(){
		socket.emit('delUser', this.props.user.id)
	},
	render: function(){
		var u = this.props.user
		return(<div><label>{'Username:' + u.id + '  Level:' + u.level}</label><button onClick={this.delete}>Delete This user</button></div>)
	}
})
var LogInControl = React.createClass({
	getInitialState: function(){
		return ({userName:'',password:'',alert:''})
	},
	componentDidMount: function(){
		var self = this;
		socket.on('access denied', function(alert){
			self.setState({alert:alert})
		})
	},
	userNameChange: function(e){
		////console.log(e)
		if(typeof e == 'string'){

			this.setState({userName:e})
		}else if(e.target){
			if(e.target.value){
				this.setState({userName:e.target.value})
			}
		}
	},
	onFocus: function(){
		this.props.onKeyFocus();
	},
	onRequestClose: function(){
		this.props.onRequestClose();
	},
	passwordChange: function(e){
		if(typeof e == 'string'){

			this.setState({password:e})
		}else if(e.target){
			if(e.target.value){
				this.setState({password:e.target.value})
			}
		}
	},
	loginSubmit: function(){
		socket.emit('login',{id:this.state.userName, pw:this.state.password})
		this.setState({password:'', alert:''})
	},
	logOut:function(){
		socket.emit('logOut')
	},
	render:function(){
		if(this.props.level>0){
			return (<div>
				<label>{'Logged In as ' + this.props.userName}</label>
				<button onClick={this.logOut}>Log Out</button>
			</div>)
		}else{
		return (<div>
			<table>
				<tbody>
					<tr><td>Username:</td><td><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onChange={this.userNameChange} tid='username' value={this.state.userName}/></td></tr>
					<tr><td>Password:</td><td><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onChange={this.passwordChange} tid='password' value={this.state.password}/></td></tr>
				</tbody>
			</table>
			<label style={{color:'red'}}>{this.state.alert}</label>
			<button onClick={this.loginSubmit}>Log in</button>
		</div>)
		}
	}
})

var TickerBox = React.createClass({
	getInitialState: function(){
		return{ticks:0}
	},
	update:function (data) {
		this.setState({ticks:data})
	},
	render: function(){
		var tickerVal= this.state.ticks;
		if(Math.abs(tickerVal)<50){
			tickerVal = 0;
		}else if(tickerVal>0){
			tickerVal = tickerVal - 50;
		}else{
			tickerVal = tickerVal + 50
		}
		var color = 'green';
		if(this.props.color){
			color = this.props.color
		}
		if(Math.abs(tickerVal)>50){
			color = 'red';
		}
		if(tickerVal>200){
			tickerVal = 200;
		}else if(tickerVal < -200){
			tickerVal = -200
		}
		var path = 'example_path'
		var block = 'example_block'
		if(this.props.int){
			path = 'example_path_i'
			block = 'example_block_i'
		}
		return (
			<div className='tickerBox'>
			<div className={path}>
				<div className={block} style = {{left:50-(tickerVal/4)+'%',backgroundColor:color}}/>
			</div>
			</div>
		)
	}
});

var LEDBar = React.createClass({
	getInitialState: function(){
		return ({pled:0, dled:0})
	},
	update:function (p,d) {
		if((this.state.pled != p) || (this.state.dled != d)){
			this.setState({pled:p, dled:d})
		}
	},
	render: function(){
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
});
var LEDBarInt = React.createClass({
	getInitialState: function(){
		return ({pled_a:0, dled_a:0,pled_b:0, dled_b:0})
	},
	update:function (pa,pb,da,db) {
		// body...
		if((this.state.pled_a != pa) || (this.state.dled_a != da)||(this.state.pled_b != pb) || (this.state.dled_b != db)){
			this.setState({pled_a:pa, dled_a:da,pled_b:pb, dled_b:db})
		}
	},
	render: function(){
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
});
var LEDi = React.createClass({
	render: function(){
		return(<div className='ledi' style={{ backgroundColor:this.props.color}}/>)
	}
})

var MobLiveBar = React.createClass({
	setLEDs: function (a,b,c,d) {
		if(this.props.int){
			this.refs.st.setLEDs(a,c,b,d)

		}
		else{
			this.refs.st.setLEDs(a,b)
			// body...
		}
	},
	update: function (a,b) {
		this.refs.st.update(a,b)
	},
	render: function () {
		var st=<StatBar ref='st' />
		if(this.props.int){
			st = <StatBarInt style={{marginTop:12}} ref='st'/>
		}
		return(<div className="mobLiveBar">{st}</div>)
	}
})


var FaultItem = React.createClass({
	render: function(){
		var type = this.props.fault
		return <div><label>{"Fault type: " + type}</label>
		</div>
	}
})


var SettingsDisplay2 = React.createClass({
	getInitialState: function(){
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		var font = 0;
		if(mqls[2].matches){
			font = 2
		}else if(mqls[1].matches){
			font = 1
		}

		return({
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, mqls:mqls, font:font, data:this.props.data, cob2:this.props.cob2
		});
	},
	componentWillReceiveProps: function(newProps){
		this.setState({data:newProps.data, cob2:newProps.cob2})
	},
	listenToMq:function () {
		if(this.state.mqls[2].matches){
			this.setState({font:2})
		}else if(this.state.mqls[1].matches){
			this.setState({font:1})
			
		}else if(this.state.mqls[0].matches){
			this.setState({font:0})
		}
	},
	handleItemclick: function(dat, n){

		this.props.onHandleClick(dat, n);
	},
	parseInfo: function(sys, prd){
		if((typeof sys != 'undefined') && (typeof prd != 'undefined')){
			if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
				this.setState({sysRec:sys, prodRec:prd})
			}
		}
	},
	componentDidMount: function () {
		this.props.sendPacket('refresh',0)
	},

	sendPacket: function (n,v) {
		var self = this;
		console.log([n,v])
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
			var buf = new Uint8Array(packet);
			////console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
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
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
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
				strArg = n['@rpcs']['write'][2]
			}
		
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}
	},
	activate: function (n) {
		// body...
		var self = this;
		console.log(['1466',n,this.props.cob2,this.state.data])
		var list; 
		if(this.state.data.length > 1){
			list 	= this.state.data[this.state.data.length - 1][0].params
		}else{
			list = this.state.data[0][0].params
		}
	
		list.forEach(function(p){
			if(p['@name'] != n['@name']){
				if(self.refs[p['@name']]){
					self.refs[p['@name']].deactivate();
				}
			}
		});


	},
	onFocus: function () {
		// body...
		if(ftiTouch){
			this.props.setOverride(true)
		}
	},
	onRequestClose: function () {
		// body...
		var self = this;
		if(ftiTouch){
			setTimeout(function () {
				// body...
				self.props.setOverride(false)
			},100)
			
		}
	},
	render: function (){
		var self = this;
		var data = this.state.data
		//var catMap = vdefByIp[this.props.dsp][]
		////console.log(data)
		var lvl = data.length 
		var handler = this.handleItemclick;
		var lab = 'Settings'
		var cvdf = this.props.cvdf
		////console.log(lvl)
		var label = 'Settings'

		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
		}
		var nav =''
		var backBut = ''

		var catList = [	]
		//////console.log(['1030', combinedSettings])
		console.log(['1515',lvl])
		for(var cb in this.props.combinedSettings){
			//catList.push(cb)
		}
		if(categoriesV2){
			if(lvl == 0){
				catList = []
				this.props.cvdf.forEach(function (c) {
					catList.push(c.cat)
					// body...
				})
			}

		}
		var accLevel = 0;
		var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej'}
		
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem2 onFocus={this.onFocus} onRequestClose={this.onRequestClose} faultBits={this.props.faultBits}  ioBits={this.props.ioBits} path={'path'} ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[this.props.cob2[i],i]} onItemClick={handler} hasContent={true} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec}/>)
			}
			nav = nodes;
		}else{

			var cat = data[lvl - 1 ][0].cat;
			var pathString = ''
			lab = cat//catMap[cat]['@translations']['english']
			if(lvl == 1){
		    	
		    	if(this.props.mode == 'config'){
		    		label == 'Settings'
		    	}else{
		    		label = catMapV2[data[0][0].cat]['@translations']['english']
		    		pathString = data[0][0].cat
		    	}
		    	//catMap[data[0]]['@translations']['english']
		    }else if(lvl == 2){
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations']['english'];
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations']['english'];
		    	}
		    	if(this.props.mode == 'config'){
					backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Settings</label></div>)
		
				}else{
					backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>{catMapV2[data[0][0].cat]['@translations']['english']}</label></div>)
				}
		    }else{
		    	var bblab = ''
		    	if(this.props.mode == 'config'){
		    		pathString = data.slice(1).map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations']['english'];
		    		bblab = catMapV2[data.slice(1,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations']['english']; 
		    	}else{
		    		pathString = data.map(function (d) {return d[0].cat}).join('/')
		    		label = catMapV2[pathString]['@translations']['english'];
		    		bblab = catMapV2[data.slice(0,data.length - 1).map(function (d) {return d[0].cat}).join('/')]['@translations']['english']; 
		    	}
		    	backBut = (<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>{bblab}</label></div>)
				
		    	 
		    	
		    }
			nodes = []
			data[lvl - 1 ][0].subCats.forEach(function(sc,i){
			nodes.push(<SettingItem2 onFocus={self.onFocus} onRequestClose={self.onRequestClose} faultBits={self.props.faultBits} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={sc.cat} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={sc.cat} name={sc.cat} hasChild={false} 
					data={[sc,i]} onItemClick={handler} hasContent={true} acc={self.props.accLevel>=accLevel} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec}/>)
			})
			data[lvl - 1 ][0].params.forEach(function (p,i) {
				// body...
					var ind = 0;
					var prms = self.props.cob2[ind].params;
					var sbc = self.props.cob2[ind].subCats;
					while(ind < lvl - 1){
						ind = ind + 1
						prms = sbc[data[ind][1]].params
						sbc = sbc[data[ind][1]].subCats;	
					}
					var d = prms[i]
					var ch = d['@children']
				
					nodes.push(<SettingItem2 onFocus={self.onFocus} onRequestClose={self.onRequestClose} faultBits={self.props.faultBits} ioBits={self.props.ioBits} path={pathString} ip={self.props.dsp} ref={p['@name']} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} dsp={self.props.dsp} lkey={p['@name']} name={p['@name']} 
							children={[vdefByIp[self.props.dsp][5][p['@name']].children,ch]} hasChild={false} data={d} onItemClick={handler} hasContent={true}  acc={self.props.accLevel>=accLevel} int={false} sysSettings={self.state.sysRec} prodSettings={self.state.prodRec}/>)
					
			})
			nav = (<div className='setNav'>
					{nodes}
				</div>)
			
		}

		var className = "menuCategory expanded";
	   	var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:26, marginTop: -5}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24, marginTop: -5}} >{backBut}<div style={tstl}>{label}</div></h2></span>)
	    }
	    catList = null;

		return(
			<div className='settingsDiv'>
			<div className={className}>
							{titlediv}
							{nav}
			</div>
			</div>
		);
	},
	
})

var SettingItem2 = React.createClass({
	getInitialState: function(){
		return({mode:0,font:this.props.font})
	},
	sendPacket: function(n,v){
		this.props.sendPacket(n,v)
		
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		this.setState({font:newProps.font})
	},
	onItemClick: function(){
		if(this.props.hasChild || typeof this.props.data == 'object'){
			console.log([this.props.data])
			this.props.onItemClick(this.props.data, this.props.name)	
		}
		
	},
	activate: function () {
			this.props.activate(this.props.data)
	},
	deactivate: function () {
		// body...
		if(this.refs.ed){
			this.refs.ed.deactivate()
		}
		
	},
	getValue: function(rval, pname){
		var pram;
			var val;
			var label = false
			var res = vdefByIp[this.props.ip];
			var pVdef = _pVdef;
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
								console.log(d)
								////console.log(['1208',self.props.sysSettings])
								return self.props.prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
					}
					
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
						deps = pram["@dep"].map(function(d){
							if(pVdef[5][d]["@rec"] == 0){
								return self.props.sysSettings[d];
							}else{
								return self.props.prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
					}
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else{
				val = rval
			}
			return val;
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose: function () {
		// body...
		this.props.onRequestClose();
	},
	render: function(){
		var ft = [16,20,24];
		var wd = [150,260,300]
		var vwd = [75,125,170]
		var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
		var vst = {display:'inline-block', fontSize:ft[this.state.font], width:vwd[this.state.font]}
		var self = this;
			var res = vdefByIp[this.props.ip];
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
				////console.log('1270')
				namestring = catMapV2[path]['@translations']['english']
				////console.log('1272')
			}
						
					
		return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{namestring}</label></div>)
		}else{
			var val, pram;
			//if(this.props.isArray)
			//(Array.isArray)
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
				////console.log('1270')
				namestring = catMapV2[path]['@translations']['english']
				////console.log('1272')
			}
				////console.log(['1195', this.props.name, this.props.data])
				return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{namestring}</label></div>)
			}else{
				console.log(this.props.data)
				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				////console.log(['1250',this.props.lkey, typeof this.props.data['@data']])
				////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}

				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var i=0;i<this.props.children[0].length;i++){
						val.push(this.props.children[1][i])
						if(typeof pVdef[0][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[0][this.props.children[0][i]])
						}else if(typeof pVdef[1][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[1][this.props.children[0][i]])
						}else if(typeof pVdef[2][this.props.children[0][i]] != 'undefined'){
							pram.push(pVdef[2][this.props.children[0][i]])
						}
					}
				}
				////console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}	
			}
			}else{


				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				////console.log(['1250',this.props.lkey, typeof this.props.data])
				////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else if(typeof pVdef[2][this.props.lkey] != 'undefined'){
					pram = [pVdef[2][this.props.lkey]]
				}
				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var ch in this.props.data['@children']){
						val.push(this.getValue(this.props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}else if(typeof pVdef[2][ch] != 'undefined'){
							pram.push(pVdef[2][ch])
						}
					}
				}
				////console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}
			}
			
				var edctrl = <EditControl ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} onFocus={this.onFocus} onRequestClose={this.onRequestClose} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={false} name={this.props.lkey}/>
				return (<div className='sItem'> {edctrl}
					</div>)
			
		}
	}
})

var KeyboardInputWrapper = React.createClass({
	getInitialState: function () {
		// body...
		return({value:this.props.value})
	},
	componentWillReceiveProps:function (newProps) {
		// body...
		if(this.state.value != newProps.value){
			this.setState({value:newProps.value})
		}
	},
	onChange: function(e){
		console.log(['1412',e])
		if(this.props.onChange){
			this.props.onChange(e, this.props.Id)
		}else{
			if(typeof e != 'string'){
				this.props.onInput(e.target.value, this.props.Id)
			}
			else{
				this.props.onInput(e,this.props.Id)
			}
		}
		
	},
	onInput: function(e){
		console.log(['1425',e])
		this.props.onInput(e, this.props.Id)
	},
	onFocus: function () {
		// body...
		if(this.props.onFocus){
			this.props.onFocus();
		}
		
	},	
	onRequestClose: function () {
		// body...
		if(this.props.onRequestClose){
			this.props.onRequestClose()
		}
	},	
	render: function(){
		console.log('render key input wrapper..	')
		return(<div style={this.props.Style}><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} onInput={this.onInput} onChange={this.onChange} value={this.state.value} tid={this.props.tid} Style={this.props.Style} num={this.props.num}/></div>)
	},
})
var NestedEditControl = React.createClass({
	getInitialState: function(){
		return ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
	},
	componentWillReceiveProps:function(newProps){
		this.setState({val:newProps.data.slice(0)})
	},
	selectChanged: function(v,i,j){
		var data = this.state.val;
		data[i][j] = v;
		this.setState({val:data})
		this.props.sendPacket(this.props.param[i][j],v)
	},

	switchMode: function () {
		// body...
		if(this.props.acc){
			if(this.props.param[0][0]['@rpcs']){
				if((this.props.param[0][0]['@rpcs']['write'])||(this.props.param[0][0]['@rpcs']['toggle'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
	},
	render:function() {
			var namestring = this.props.name
			if(vMap[this.props.name]){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
				}
			}
		if(this.state.mode == 0){
			return (<div onClick={this.switchMode}>{namestring}</div>);
		}else{
			var self = this;
			////console.log('line 1264')
			var rows = this.state.val.map(function(r,i){
			var conts = r.map(function (v,j) {
					// body...
			if(self.props.label){

				return(<SelectForMulti val={v} index={i} index2={j} onChange={self.selectChanged} list={_pVdef[6][self.props.param[0][0]["@labels"]]['english']}/>)
			}else{
						return(<div style={{display:'inline-block'}}>{v}</div>)
						//return(<KeyboardInput tid={namestring+'_kia'} onInput={self.valChanged} value={v} onKeyPress={this._handleKeyPress} num={num} Style={{width:150}}/>)
					}

				})
				return <div>{conts}</div>
				
			})
		
		return (
			<div><div onClick={this.switchMode}><label>{namestring}</label></div><div>
				{rows}
			</div></div>
		);
		}
		
	}
})
var MultiEditControl = React.createClass({
	getInitialState: function(){
		return ({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
	},
	componentWillReceiveProps:function(newProps){
		this.setState({val:newProps.data.slice(0)})
	},
	switchMode: function () {
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
	},
	deactivate:function () {
		// body...
		this.setState({mode:0})
	},
	selectChanged:function(v,i){
		var val = v//e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			//////console.log(val)
			this.props.sendPacket(this.props.param[i], parseInt(val));
		var value = this.state.val;
		value[i] = v// e.target.value
		////console.log(this.props.data)
		this.setState({val:value})
	},
	valChanged: function(v,i){
		var val = v
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;	
		////console.log(['1404',v,i])
		value[i] = val;
		this.setState({val:value})
		if(!Number.isNaN(val)){
			this.props.sendPacket(this.props.param[i], parseInt(val));
		}
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose:function () {
		// body...
		this.props.onRequestClose();
	},
	render:function() {
		var namestring = this.props.name
	//	////console.log(['1548', namestring])
			if(typeof vdefByIp[this.props.ip][5][this.props.name] != 'undefined'){
				if(vdefByIp[this.props.ip][5][this.props.name]['@translations']['english']['name'] != ''){
					namestring = vdefByIp[this.props.ip][5][this.props.name]['@translations']['english']['name']
				}
			}
	//	////console.log(['1554', namestring])
			
		var self = this;
		var isInt = false
		var colors = ['#800080','#008080']
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
		var vLabels = this.state.val.map(function(d,i){
			var val = d;
			var st = {}

			st.width = self.props.vst.width;
			st.fontSize = self.props.vst.fontSize;
			st.display = self.props.vst.display;
			if(isInt){
				st.color = colors[i]
			}
			if(typeof self.props.param[i]['@labels'] != 'undefined'){
				console.log(['1560',self.props.param])
				
				val = _pVdef[6][self.props.param[i]["@labels"]]['english'][d]
				if((self.props.param[i]['@labels'] == 'InputSrc')){
					//console.log(['1582', self.props.param[i]['@labels']])
					if(self.props.ioBits[inputSrcArr[d]] == 0){
						st.color = '#818a90'
					}
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
					//console.log(['1582', self.props.param[i]['@labels']])
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = '#818a90'
					}
					//val = val + '*'
					
				}else if((self.props.param[i]['@labels'] == 'FaultMaskBit')){
					if(self.props.faultBits.indexOf(self.props.param[i]['@name'].slice(0,-4)) != -1){
						st.color= '#ffa500'
					}
				}
			}
			
			
			return (<label style={st}>{val}</label>)
		})
		if(this.state.mode == 0){
			return(<div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label>{vLabels}</div>)

		}else{
			////console.log(['1574', self.props.param[0]])
					
				var options = this.state.val.map(function(v, i){
					if(typeof self.props.param[i]['@labels'] != 'undefined'){

						var opts = _pVdef[6][self.props.param[i]["@labels"]]['english'].map(function(e,i){
							if(i == v){
								return (<option selected value={i}>{e}</option>)

							}else{
								return (<option value={i}>{e}</option>)

							}
						})
						return <SelectForMulti val={v} index={i} onChange={self.selectChanged} list={_pVdef[6][self.props.param[i]["@labels"]]['english']} Style={{width:self.props.vst.width, display:'inline-block'}}/>
					}else{
						var num = true
						if(self.props.param[i]['@name'] == 'ProdName'){
							num = false
						}
						return(<KeyboardInputWrapper onFocus={self.onFocus} onRequestClose={self.onRequestClose} tid={namestring+'_kia'} onInput={self.valChanged} Id={i} value={v} onKeyPress={self._handleKeyPress} num={num} Style={{width:self.props.vst.width, display:'inline-block'}}/>)
					}
				})
				return(<div><div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label>{vLabels}</div>
					<div style={{paddingLeft:this.props.lvst.width}}>
						{options}
					</div></div>)

		}
		
	}
})
var SelectForMulti = React.createClass({
	getInitialState: function(){
		return({val: this.props.val})
	},
	onChange: function(e){
		this.setState({val:parseInt(e.target.value)})
		this.props.onChange(parseInt(e.target.value), this.props.index, this.props.index2)
	},
	componentWillReceiveProps:function(newProps){
		this.setState({val:newProps.val})
	},
	render:function(){
		var val = this.state.val
		var opts = this.props.list.map(function(e,i){
			if(i == val){
				return (<option selected value={i}>{e}</option>)
			}else{
				return (<option value={i}>{e}</option>)
			}
		})
		return(<div className='customSelect' style={{width:150}}><select onChange={this.onChange}>{opts}</select></div>)
	}
})
var EditControl = React.createClass({
	getInitialState: function(){
		return({val:this.props.data.slice(0), changed:false, mode:0, size:this.props.size})
	},
	sendPacket: function(){
		var self = this;
		this.props.sendPacket(this.props.param[0], this.state.val[0])
		if(this.props.int){
			setTimeout(function () {
				// body...
				self.props.sendPacket(self.props.param[1], self.state.val[1])
			},100)
			
		}
		this.setState({mode:0})
	},
	valChanged: function(e){
		
		var val = e//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[0] = e
		////console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedl: function(e){
		
		var val = e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			//////console.log(val)
			this.props.sendPacket(this.props.param[0], parseInt(val));
		var value = this.state.val;
		value[0] = e.target.value
		////console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedb: function(e){
		////console.log(e)
		var val = e;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[1] = e
		////console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedlb: function(e){
	//	////console.log(e)
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			this.props.sendPacket(this.props.param[1], parseInt(val));
		var value = this.state.val;
		value[1] = e.target.value
		////console.log(this.props.data)
		this.setState({val:value})
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({size:newProps.size, val:newProps.data.slice(0)})
	},
	deactivate:function () {
		// body...
		if(this.refs.ed){
			////console.log(['1511', 'this the prob'])
			this.refs.ed.setState({mode:0})
		}else{
			this.setState({mode:0})	
		}
		
	},
	_handleKeyPress: function (e) {
		// body...
		if(e.key === 'Enter'){
			this.sendPacket();
		}
	},
	switchMode: function () {
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
	},
	onSubmit:function(e){
		e.preventDefault();
		var valA = this.state.value[0];
		var valB = this.state.value[1];
		var self = this;
		if(this.props.bitLen == 16){
			valA = VdefHelper.swap16(valA)
			valB = VdefHelper.swap16(valB)

		}
		this.props.sendPacket(this.props.param[0], parseInt(valA));
		setTimeout(function(){
			self.props.sendPacket(self.props.param[1], parseInt(valB))
			
		}, 100)
		this.setState({editMode:false})
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose: function () {
		this.props.onRequestClose()	
	},
	render: function(){
		var lab = (<label>{this.state.val}</label>)
		var num = true;
		var style = {display:'inline-block',fontSize:24}
		if(this.state.size == 1){
			style = {display:'inline-block',fontSize:20}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:16}
		}
		var namestring = this.props.name;
		if(namestring.indexOf('INPUT_')!= -1){
			////console.log(namestring)
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
		////console.log(['1720',this.props.name, this.props.data])
		if(typeof vMapV2[this.props.name] != 'undefined'){
				if(vMapV2[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMapV2[this.props.name]['@translations']['english']['name']
				}
			}
		if(this.props.data.length > 0	){
			if(Array.isArray(this.props.data[0])){
				////console.log('1728')
				return (<NestedEditControl ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}else{
				////console.log('1732')
				return (<MultiEditControl ip={this.props.ip} faultBits={this.props.faultBits} ioBits={this.props.ioBits} onFocus={this.onFocus} onRequestClose={this.onRequestClose} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}	
		}


		var dval = this.props.data[0]
		if(this.props.label){
			dval=_pVdef[6][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
		}
		
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					////console.log(selected)
					if (this.props.param[0]["@labels"] == 'InputSrc'){
						console.log(['1795', 'Input Source bits'])
					}else if(this.props.param[0]["@labels"] == 'OutputSrc'){
						console.log(['1797', 'Output Source bits'])
					}
					var options = _pVdef[6][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
					var lvst = this.props.lvst
					if((this.props.param[0]['@labels'] == 'FaultMaskBit')){
						if(this.props.faultBits.indexOf(this.props.param[0]['@name'].slice(0,-4)) != -1){
							lvst.color= '#ffa500'
						}
					}
					return(
						<div>
						<div onClick={this.switchMode}>
							<label style={lvst}>{namestring + ': '}</label><label style={this.props.vst}> {dval}</label>
							</div>
							<div style={{marginLeft:this.props.lvst.width, width:this.props.vst.width}} className='customSelect'>
							<select onChange={this.valChangedl}>
							{options}
							</select>
							</div>
							</div>)

				}else{
					/*<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0]}></input>*/
					var input = (<KeyboardInput tid={namestring+'_ki'} onInput={this.valChanged} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} onFocus={this.onFocus} onRequestClose={this.onRequestClose} Style={{width:this.props.vst.width}}/>)//
					return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
						<div style={{marginLeft:250, display:'inline-block',width:200,marginRight:10}}>{input}</div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid #818a90',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	
			}
		}
	
	}
})
var FRamView =React.createClass({
	getInitialState: function(){
		return({dspName:'',XPortIp:'',internalIp:'',haloIp:'',ioIp:''})
	},
	render:function(){
		return(<div></div>)
	}
	
})

var LiveView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (data) {
		this.refs.st.update(data)
	},
	setLEDs: function (p,d) {
		this.refs.st.setLEDs(p,d)
	},
	render: function(){
		////console.log('rendering st')
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
})
var LiveViewInt = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (a,b) {
		
		this.refs.st.update(a,b)
	},
	setLEDs: function (pa,da,pb,db) {
		this.refs.st.setLEDs(pa,pb,da,db)
	},
	render: function(){
		////console.log('rendering int')
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
})


var FaultDiv = React.createClass({
	clearFaults: function () {
	this.props.clearFaults()
	},
	maskFault: function (f) {
		this.props.maskFault(f)
	},
	render:function () {
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
})
var StatBar = React.createClass({
	update: function (data) {
		this.refs.tb.update(data)
	},
	setLEDs: function (p,d) {
		this.refs.lb.update(p,d)
	},
	render: function(){
		return (<div className='statBar'>
			<TickerBox ref='tb' int={false}/>
			<LEDBar ref='lb'/>
			</div>)
	}
})
var StatBarInt = React.createClass({
	update: function (a,b) {
		this.refs.ta.update(a)
		this.refs.tb.update(b)
	},
	setLEDs: function (pa,pb,da,db) {
		this.refs.lb.update(pa,pb,da,db)
	},
	render: function(){
		return (<div className='statBar'>
			<TickerBox ref='ta' int={true} color='#800080'/>
			<TickerBox ref='tb' int={true} color='#008080'/>
			<LEDBarInt ref='lb'/>
			</div>)
	}
})
	
var Modal = React.createClass({
	getInitialState: function () {
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		return({className:klass, show:false, override:false ,keyboardVisible:false})
	},
	toggle: function () {
		var self = this;
		if(this.state.keyboardVisible){
			return
		}
		if(!this.state.override){
			this.setState({show:!this.state.show, override:true})
			setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})
			},50)
		}
		if(typeof this.props.onClose != 'undefined'){
			this.props.onClose();
		}
		
	},

	render: function () {
		var cont = '';
		var h = !this.state.show
		if(typeof this.props.override != 'undefined'){
			if(this.props.override == 1){
				h = false
			}else{
				h = true
			}
		}
		if(!h){
				cont = (<ModalCont toggle={this.toggle}>
			{this.props.children}
		</ModalCont>)
		}

		return(<div className={this.state.className} hidden={h}>
			<div className='modal-x' onClick={this.toggle}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>
			{cont}
	</div>)
	}
})
var ModalCont = onClickOutside(React.createClass({
	getInitialState: function(){
		return({keyboardVisible:false})
	},
	toggle: function(){
		this.props.toggle();
	},
	handleClickOutside: function(e){
		console.log('2136 handleClickOutside')
		if(!this.state.keyboardVisible){
			this.props.toggle();	
		}
		
	},
	render: function(){
		var button = 	<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
			
				return (<div className='modal-outer' >
				<div className='modal-content'>
					{this.props.children}
				</div>
				</div>)
	
	},

})
)

var MultiBankUnit = React.createClass({
	getInitialState: function () {
		// body...
		var dat = []
		if(this.props.data.length >0){
			dat = this.props.data
			////console.log(dat)
		}
		return ({banks:dat})
	},
	onRMsg: function (e,d) {
		// body...
		if(this.refs[d.ip]){
			////console.log(d)
			this.refs[d.ip].onRMsg(e,d)
	
		}
	},
	onParamMsg2:function(e,d){
		if(this.refs[d.ip]){
			//////console.log(d)
			this.refs[d.ip].onParamMsg2(e,d)
	
		}
		e = null;
		d = null;

	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({banks:nextProps.data})
	},
	switchUnit: function (u) {
		// body...
		////console.log('switch mb')
		this.props.onSelect(u)
	},
	render: function (argument) {
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			////console.log(b)
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.ip} name={b.name}/>
		
		})
		return (<div className='multiBankUnit'>
			<div className='nameLabel'>
				<label>{this.props.name}</label></div>
			{banks}</div>)
	

	}
})

var StatBarMB = React.createClass({
	getInitialState: function () {
		var br = window.matchMedia('(min-width:600px)')
		br.addListener(this.listenToMq)
		var interceptor = this.props.unit.interceptor;//(vdefByIp[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		return({pn:'',phase_A:9000, phase_B:9000, phasemode_A:0, phasemode_B:0,sens_A:100,sens_B:100, peak_A:0,peak_B:0,br:br, mobile:br.matches, interceptor:interceptor, rejs:2, fault:false, live:false, pled_A:0,dled_A:0,pled_B:0,dled_B:0, rpcResp:false})
	},
	listenToMq: function () {
		this.setState({mobile:this.state.br.matches});
	},
	 update: function (data) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(data)
	},
	setDyn: function(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults})
		}
	},
	updateMeter: function (dat) {
		// body...
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	},
	setLEDSInt:function(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
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
	},
	setDynInt: function(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	},
	setProdVars: function(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	},
	setProdVarsInt: function(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	},
	setLEDS:function(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	},
	switchUnit: function () {
		// body...
		if(this.state.live){
			this.props.onSelect(this.props.unit)	
		}
		
	},
	componentDidMount: function () {
		// body...
		var self = this;
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		var buf =  new Uint8Array(packet)
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now()-liveTimer[self.props.unit.ip])>1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				socket.emit('rpc',{ip:self.props.unit.ip, data:buf.buffer});	
			}
			
		},1000)
			
	},
	componentWillUnmount: function () {
		clearInterval(myTimers[this.props.unit.ip]);
	},
	onRMsg: function (e,d) {
		// body...
		if(d.ip = this.props.unit.ip){
			clearInterval(myTimers[this.props.unit.ip]);
			this.setState({rpcResp:true})	
		}		
		e = null;
		d = null;

	},
	onParamMsg2: function(e){
		

		var self = this;
   		var res = vdefByIp[this.props.unit.ip]
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
					this.setLEDS(getVal(prodArray,2,'Reject_LED', pVdef),rec['Prod_LED'],rec['Prod_HI_LED'])
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

	},
	render: function(){

		if(!this.state.mobile){
			return this.renderMob();
		}else{
			return this.renderTab();
		}
	
	},
	renderTab: function () {
		// body...
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
			////console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			////console.log(klass)
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
	

	},
	renderMob: function () {
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
})

var SingleUnit = React.createClass({
	getInitialState: function () {
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
		var interceptor =  this.props.unit.interceptor//(vdefByIp[this.props.unit.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.unit.board_id == 5)
		return ({font:font,mq:mobMqs,phasemode_A:0,live:false, fault:false, pn:'', sens_A:0,peak_A:0,rejs_A:0,phase_A:0,pled_A:0,dled_A:0,
			sens_B:0,peak_B:0,rejs_B:0,phase_B:0,pled_B:0,dled_B:0,rpcResp:false, interceptor:interceptor})
	},
	onClick: function () {
		if(this.state.live){
			this.props.onSelect(this.props.unit)
	
		}
	},
	listenToMq: function () {
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
	},
	updateMeter: function (dat) {
		// body...
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	},
	updateMeterInt: function(a,b){
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		//////console.log([a,b])
		this.refs.lv.update(a,b)	
	},
	onRMsg: function (e,d) {
		clearInterval(myTimers[this.props.unit.ip]);
		this.setState({rpcResp:true})
	},
	onParamMsg2: function(e){
		var self = this;
   		var res = vdefByIp[this.props.unit.ip]
		var lcd_type = e.type
		var rec = e.rec
		//console.log(['2767',e])
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(rec['ProdName'],rec['Sens'],rec['PhaseMode'])
				
					
				}else{
					this.setProdVarsInt(rec['ProdName'],rec['Sens_A'],rec['PhaseMode_A'],rec['Sens_B'],rec['PhaseMode_B'])
					//this.setProdVarsInt(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens_A', pVdef),getVal(prodArray, 1, 'Sens_B', pVdef),getVal(prodArray,1,'PhaseMode_A', pVdef),getVal(prodArray,1,'PhaseMode_B', pVdef))
					
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
	//	msg = null;
		//dv = null;
	//	prodArray = null;
		rec = null;
		res = null;
		e = null;

	},
	onFault: function () {
		this.setState({fault:!this.state.fault})

	},
	componentDidMount: function () {
		var self = this;
		this._isMounted = true;
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now() - liveTimer[self.props.unit.ip]) > 1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				var packet = dsp_rpc_paylod_for(19,[102,0,0])
				var buf =  new Uint8Array(packet)
				socket.emit('rpc',{ip:self.props.unit.ip, data:buf.buffer})
			}
		}, 1000)
	},
	componentWillUnmount: function () {
		clearInterval(myTimers[this.props.unit.ip]);
	},
	setProdVars: function(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	},
	setProdVarsInt: function(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
	},
	
	setLEDS:function(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	},
	setDyn: function(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults})
		}
	},
	setLEDSInt:function(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
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
	},
	setDynInt: function(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	},
	render: function(){
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
	},
	renderInt:function(classname,st){

		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveViewInt st={st} ref = 'lv'>
			<div onClick={this.onClick}>
			<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A+ "  "+ this.state.sens_B}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A] 
				+ "  "+ (this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A+ "  "+ this.state.peak_B}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
			</div>
			</LiveViewInt>
			</div>)
	},
	renderST: function (classname,st) {
		
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
})


var DetItemView = React.createClass({
	addClick: function () {
		// body...
		this.props.addClick(this.props.i)
	},
	render: function () {
		var addText = 'Add'
		if(this.props.type == 1){
			addText = 'Remove'
		}
		return (<div style={{padding:5, lineHeight:1.8, fontSize:25}}>
				<label onClick={this.addClick}>{this.props.det.name}</label>
			</div>)
	}
})
var MBGroupView = React.createClass({
	getInitialState: function () {
		// body...
		return ({font:2})
	},

	render: function() {
		var banks = this.props.unit.banks;
		var lab = "Config Multibank Unit"
		var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span><h2 style={{textAlign:'center'}} ><div style={tstl}>{lab}</div></h2></span>)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:30}} ><div style={tstl}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24}} ><div style={tstl}>{lab}</div></h2></span>)
	    }
		return(<div className='settingsDiv'>
				<div className='menuCategory'>
				{titlediv}
				<TreeNode nodeName="Config banks">
					{this.props.unit.name}
				</TreeNode>
			</div>
		</div>)
	}
})
var MbSetup = React.createClass({
		getInitialState: function () {
			return({mode:false})
		},
		editMb:function () {
			////console.log(this.props.index)
			this.props.edit(this.props.index)
		},
		remove:function () {
			this.props.remove(this.props.index)
		},
		moveUp: function () {
			this.props.move(this.props.index,'up')
		},
		moveDown: function (){
			this.props.move(this.props.index,'down')
		},
		toggleOptions: function () {
			this.setState({mode:!this.state.mode})
		},
		render:function () {
			var editRow;
			if(this.state.mode){
				editRow = (<div>
					<button onClick={this.editMb}>Edit</button>
					<button onClick={this.remove}>Remove</button>
					<button onClick={this.moveUp}>move up</button>
					<button onClick={this.moveDown}>move down</button>
					</div>)
			}
			return (<div className="sItem" onClick={this.toggleOptions}>
						<label >Name:{this.props.mb.name}</label>
						{editRow}
					</div>)	
		}
	})

var DetectorView = React.createClass({
	getInitialState: function () {
		// body...
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		var minMq = window.matchMedia("(min-width: 400px)");
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		minMq.addListener(this.listenToMq);
		var interceptor = this.props.det.interceptor//(vdefByIp[this.props.det.ip][0]['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2)//(this.props.det.board_id == 5);
		return {
		callback:null, rec:{},	showTest:false,faultArray:[],pind:0,currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, netpoll:this.props.netpolls, 
		prodSettings:{}, sysSettings:{}, combinedSettings:[],cob2:[], pages:{},
		minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, 
		peak:0, rej:0, phase:0, interceptor:interceptor, ioBITs:{}, testRec:{}}
	},
	componentDidMount: function () {
		/*var packet = dsp_rpc_paylod_for(19,[102,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})*/
	},
	componentWillReceiveProps: function (newProps) {
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})
		this.setState({netpoll:newProps.netpolls, update:true})
	},
	toggleAttention: function () {
		this.refs.fModal.toggle();
	},
	onRMsg:function (e,d) {
		// body...
		//////console.log([e,d])
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
		console.log(['3489',data])
		if(data[1] == 18){
			//prodList

			console.log('prodList')
			var prodbits = data.slice(3)
			var dat = []
			for(var i = 0; i < 99; i++){
			if(prodbits[i] ==2){
					dat.push(i+1)
				}
			}
			/*if(this.refs.dm){
				////console.log(dat)
				//this.refs.dm.setState({prodList:dat})
			}*/
			if(this.refs.im){
				this.refs.im.setProdList(dat)
				
			}

		}else if(data[1] == 24){
			if(this.state.callback){
				this.state.callback(data, this.state.pind)
			}else{
				console.log('3495 ')
			}
			/*if(this.refs.im){
				this.refs.im.setProdName(data)
				
			}*/
		}
		//else if(data[1] == ){

		//}
		e = null;
		msg = null;
		data = null;
		dat = null;
		prodbits = null;
	},
	onNetpoll: function(e,d){
		if(this.props.det.ip != d.ip){
			return;	
		}
		////console.log(['2600',e])
		var nps = this.state.netpoll
		if(nps.length == 15){
			nps.splice(1,-1);
		}
		nps.unshift(e);
		this.setState({netpoll:nps, update:true})

	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[2].matches){
			////console.log(1)
		}else if(this.state.mqls[1].matches){
			////console.log(2)
		}else if(this.state.mqls[0].matches){
			////console.log(3)
		}else{
			////console.log(4)
		}
		
		this.setState({minW:this.state.minMq.matches, update:true})
		
	},
	getCob: function (sys,prod,dyn) {
		// body...
		var vdef = vdefByIp[this.props.det.ip]
		var _cvdf = JSON.parse(JSON.stringify(vdef[4][0]))
		var cob =  iterateCats(_cvdf, vdef[1],sys,prod, vdef[5],dyn)
		vdef = null;
		_cvdf = null;
		return cob
	},
	getPages: function (sys,prod,dyn) {
		// body...
		var vdef = vdefByIp[this.props.det.ip]
		var _pages = JSON.parse(JSON.stringify(vdef[6]))
		var pages = {}
		for(var pg in _pages){
			pages[pg] = iterateCats(_pages[pg], vdef[1],sys,prod, vdef[5],dyn)
		}
		vdef = null;
		_pages = null;
		return pages
	},
	onParamMsg2: function (e,d) {
		// body...
		

		if(this.props.det.ip != d.ip){
			return;
		}
		var sysSettings =  null;//this.state.sysSettings;
		var prodSettings = null;//this.state.prodSettings;
		var combinedSettings = null;
		var self = this;
   		var lcd_type = e.type;
  	    if(lcd_type== 0){
 			console.log('sys')
			if(vdefByIp[d.ip]){
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
					cob2 = this.getCob(sysSettings, this.state.prodSettings, this.state.rec);
					pages = this.getPages(sysSettings, this.state.prodSettings, this.state.rec);
					this.setState({sysSettings:sysSettings,cob2:cob2, pages:pages, update:true})
					//this.refs.store.setState()
				}
			/*	if(isDiff(sysSettings,this.refs.store.state.sysSettings)){
					cob2 = this.getCob(sysSettings, this.refs.store.state.prodSettings, this.refs.store.state.rec);
					pages = this.getPages(sysSettings, this.refs.store.state.prodSettings, this.refs.store.state.rec);
					this.refs.store.setState({sysSettings:sysSettings,cob2:cob2, pages:pages, update:true})
					
				}*/
    
    		}  
    		sysSettings = null;
		}else if(lcd_type == 1){
			if(vdefByIp[d.ip]){
			
				
				
				var prodRec = e.rec;
				var cob2;// = iterateCats(_cvdf[0], pVdef, this.state.sysSettings, prodSettings, _vmap, this.state.rec)
    			var pages;// = {}    		
					if(this.refs.sd){
						this.refs.sd.parseInfo(this.state.sysSettings, prodRec)	
					}
					if(this.refs.im){
						this.refs.im.parseInfo(this.state.sysSettings, prodRec)
					}
				if(isDiff(prodRec,this.state.prodSettings)){
					cob2 = this.getCob(this.state.sysSettings, prodRec, this.state.rec)
					pages = this.getPages(this.state.sysSettings, prodRec, this.state.rec)
				
					this.setState({prodSettings:prodRec, cob2:cob2, pages:pages, update:true})
				}
				/*	if(isDiff(prodRec,this.refs.store.state.prodSettings)){
					cob2 = this.getCob(this.refs.store.state.sysSettings, prodRec, this.refs.store.state.rec);
					pages = this.getPages(this.refs.store.state.sysSettings, prodRec, this.refs.store.state.rec);
					this.refs.store.setState({prodSettings:prodRec,cob2:cob2, pages:pages, update:true})
					
				}*/
			}	
		}else if(lcd_type==2){
			if(vdefByIp[d.ip])
			{
					var pVdef = vdefByIp[d.ip][1]
			
					var prodRec = e.rec
					if(_ioBits){
    						var iobits = {}
    						_ioBits.forEach(function(b){
    							if(typeof prodRec[b] != 'undefined'){
    								iobits[b] = prodRec[b]
    							}
    						})
    						if(isDiff(iobits,this.state.ioBITs)){
    							this.setState({ioBITs:iobits, update:true})
    						}
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
						var rej = prodRec['RejCount']
					

						if((this.refs.im.state.peak !=pka)||(this.refs.im.state.rpeak != rpka)||(this.refs.im.state.xpeak != xpka)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phaseA)||(this.refs.im.state.peakb !=pkb)||(this.refs.im.state.rpeakb != rpkb)||(this.refs.im.state.xpeakb != xpkb)
							||(this.refs.im.state.phaseb != phaseB)||(this.refs.im.state.phaseFast != phaseSpeedA)||(this.refs.im.state.phaseFastB != phaseSpeedB)){
							this.refs.im.setState({peak:pka,peakb:pkb,rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB})		
						}
						this.refs.im.update(siga,sigb)
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
						var peak = prodRec['Peak']
						var rej = prodRec['RejCount']
						var sig = uintToInt(prodRec['DetectSignal'],16)
						var phase = (uintToInt(prodRec['PhaseAngleAuto'],16)/100).toFixed(2)
						var phaseSpeed = prodRec['PhaseFastBit'];
						var rpeak = prodRec['ProdPeakR']
						var xpeak = prodRec['ProdPeakX']
						if((this.refs.im.state.peak !=peak)||(this.refs.im.state.rpeak != rpeak)||(this.refs.im.state.xpeak != xpeak)||(this.refs.im.state.rej != rej)
							||(this.refs.im.state.phase != phase)||(this.refs.im.state.phaseFast != phaseSpeed)){
							this.refs.im.setState({peak:peak,rpeak:rpeak,xpeak:xpeak,rej:rej,phase:phase,phaseFast:phaseSpeed})		
						}
						this.refs.im.update(sig)
						peak = null;
						sig = null;
						phase = null;
						phaseSpeed = null;
						rpeak = null;
						xpeak = null;

		
					}
				  	var faultArray = [];
					pVdef[7].forEach(function(f){
					if(prodRec[f] != 0){
						faultArray.push(f)
						}
					});
  					if(this.state.faultArray.length != faultArray.length){
  						this.setState({faultArray:faultArray, update:true})
  					}else{
  						var diff = false;
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								diff = true;
  							}
  						})
  						if(diff){
  							this.setState({faultArray:faultArray, update:true})
  							}
  						}
  						faultArray = null;	
  						var shouldUpdate = false
  						if(prodRec['DateTime'] != this.state.rec['DateTime']){
  							if(this.refs.sModal.state.show || this.refs.snModal.state.show || this.refs.teModal.state.show){
  								shouldUpdate = true
  							}
  							
  						}
  						this.setState({rec:prodRec, update:shouldUpdate})
			}
			
			pVdef = null;
			iobits = null;

   		}else if(lcd_type == 3){
   					
			var prodRec = e.rec

		}else if(lcd_type == 4){
   				var testRec = e.rec
					
    			if(isDiff(testRec, this.state.testRec)){
    				this.setState({testRec:testRec, update:true})
    			}
    			testRec = null;

   		}

   		prodRec = null;	
   		faultArray = null;	
   		e = null;
   		d = null;
   		combinedSettings = null;
   		cob2 = null;	
	},
	shouldComponentUpdate:function (nextProps, nextState) {
		if(nextState.update !== false){
			return true;
		}else{
			return false
		}
	},
	setLEDS: function(det_a,prod_a,prodhi_a){
			var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a)
	
	},
	setLEDSInt:function(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
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
	},
	showSettings: function () {
		var data = [];
		data.push([this.state.cob2,0]);
		this.refs.sModal.toggle();
		this.setState({data:[[this.state.cob2,0]], update:true})
		
	},
	showSens: function () {
		this.refs.snModal.toggle()
		this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})
		//this.refs.store.
	},
	showTestModal: function () {
		console.log('show settings')
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false,showTest:false, update:true});
			this.refs.teModal.toggle();
		}
		else{
			this.setState({settings:true,showTest:false, stack:[], data:[], update:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
			this.refs.teModal.toggle();
		}
	},
	logoClick: function () {
		this.props.logoClick();
	},
	goBack: function () {
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			setTimeout(this.setState({currentView:d[0], data: d[1], stack: stack, settings:(d[0] == 'SettingsDisplay'), update:true }),100);
			
		}
	},
	changeView: function (d) {
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
		this.setState({currentView:d[0], data:d[1], update:true})
	},
	settingClick: function (s,n) {
		var set = this.state.data.slice(0)
		////console.log(['set', s,n])
		if(Array.isArray(s)){
			set.push(s)
		}else{
			set.push(s)
			set.push(n)
		}
		var self = this;
		setTimeout(function () {
			// body...
			self.changeView(['SettingsDisplay',set]);
		},100)
		
	},
	clear: function (param) {
		console.log(['3277',param])
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	sendPacket: function (n,v) {
		//fsendpacket

		var vdef = vdefByIp[this.props.ip]
		var self = this;
		if(typeof n == 'string'){
			if(n == 'copyCurrentProd'){
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
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
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
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
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
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
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
			////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(rpc[0],pkt);
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
		}else if(n == 'Sens_B'){
			////console.log(this.props.ip)
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
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
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
					////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
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
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		}else if(n == 'cal'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CALIBRATE']
			
			var packet = dsp_rpc_paylod_for(rpc[0], [rpc[1][0],1],v)
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
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
				var buf = new Uint8Array(packet);
				socket.emit('rpc', {ip:self.props.ip, data:buf.buffer})
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
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n=='refresh'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_SENDWEBPARAMETERS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			var buf =  new Uint8Array(packet)
			socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	
		}else if(n=='rpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeak'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[1])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='rpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeakb'){
			var rpc = vdef[0]['@rpc_map']['KAPI_PROD_PEAK_R_CLEAR'];
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1],[0]);			
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
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
				var buf = new Uint8Array(packet);
			
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
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
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
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
				var buf = new Uint8Array(packet);
			
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
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
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='test'){
			var packet = dsp_rpc_paylod_for(19,[32,v,0]);
			var buf = new Uint8Array(packet);
			socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	
		}else if(n=='clearFaults'){
			var rpc = vdef[0]['@rpc_map']['KAPI_RPC_CLEARFAULTS']
			var packet = dsp_rpc_paylod_for(rpc[0],rpc[1])
			var buf =  new Uint8Array(packet)
			socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	

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
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
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
				strArg = n['@rpcs']['write'][2]
			}
			
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			var buf = new Uint8Array(packet);
			////console.log(buf)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		
		}
		}
	},
	sendAck :function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[628,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	testMan:function () {
		var packet = dsp_rpc_paylod_for(19,[608,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	testMan2:function () {
		var packet = dsp_rpc_paylod_for(19,[610,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	testHalo:function () {
		var packet = dsp_rpc_paylod_for(19,[604,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	testHalo2:function () {
		var packet = dsp_rpc_paylod_for(19,[606,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	sendOp: function () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[63,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
	},
	quitTest: function () {
		// body...
		var packet = dsp_rpc_paylod_for(21,[11,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
	},
	settingsClosed: function () {
		// body...
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false, update:true})

	},
	renderTest: function () {
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
			
		
		if(this.state.testRec['TestRecOnFlag']){
			if(this.state.testRec['TestRecPage'] == 3){
				//send operator code
				testcont = <div>Test required. Enter operator code
						<div><button onClick={this.sendOp}>Send OP</button></div>
					</div>

			}else if(this.state.testRec['TestRecPage'] == 2){
				//prompt
					testcont = <div>
					<div>Select Test</div>
					<table>
						<tbody><tr>
							<td style={nograd} onClick={this.testMan}>Manual</td><td style={nograd} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={nograd} onClick={this.testMan2}>Manual 2</td><td style={nograd} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
				</div>

			}else{
				var cn = this.state.testRec['TestRecConfig']
				var mode = testModes[this.state.testRec['TestRecConfig']]
				var config = this.state.combinedSettings['Test'][_tcats[this.state.testRec['TestRecConfig']]]
				var testcount = 3
				var cfs = []
				//var dst = {display:'inline-block'}
				if(this.props.det.interceptor){
					testcount = 6
				}
				for(var i = 0; i<testcount;i++){
					var cnt = config['TestConfigMetal'+cn+'_'+i]['@children']['TestConfigCount'+cn+'_'+i];
					var met = metTypes[config['TestConfigMetal'+cn+'_'+i]['@data']]
					var sigchain = ''

					if(this.props.det.interceptor){
						sigchain = <div style={{display:'inline-block', width:30}}>{schain[config['TestConfigMetal'+cn+'_'+i]['@children']['TestConfigFreq'+cn+'_'+i]]}</div>
					}
					var lab = ''
					if(i == this.state.testRec['TestRecOrder']){

						if((this.state.testRec['TestRecAckMetalFlag'])&&(this.state.testRec['TestRecPassCnt'] == 0))
						{
							ack = <button onClick={this.sendAck}>Acknowledge Test</button>
						}else{
							ack = 'Currently Running'
						}
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}}><div style={{display:'inline-block', width:60}}>{cnt - this.state.testRec['TestRecPassCnt']} of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}>{ack}</div></div>
					}else if(i<this.state.testRec['TestRecOrder']){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(0,128,128,0.4))'}}><div style={{display:'inline-block', width:60}}>{cnt} of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}>Done</div></div>
					
					}else if(cnt != 0){
						lab = <div style={{background:'linear-gradient(315deg, transparent 33%, rgba(128,128,128,0.4))'}}><div style={{display:'inline-block', width:60}}>0 of {cnt}
						</div><div style={{display:'inline-block', width:170}}>{met}</div>{sigchain}<div style={{display:'inline-block', width:250}}></div></div>
					
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

		var testprompt = (<div>{testcont}
			
		<div><button onClick={this.quitTest}>Quit Test</button></div>

		 </div>)
		return testprompt
	},
	setOverride: function (ov) {
		// body...
		this.refs.sModal.setState({keyboardVisible:ov})
	},
	setTOverride: function (ov) {
		// body...
		this.refs.teModal.setState({keyboardVisible:ov})
	},
	setSOverride: function (ov) {
		// body...
		this.refs.snModal.setState({keyboardVisible:ov})
	},
	toggleTestSettings: function () {
		// body...
		if(this.state.showTest){
			this.setState({showTest:false, data:[], stack:[], update:true})
		}else{
			this.setState({showTest:true, data:[[this.state.pages['Test'],0]], stack:[], update:true})
		}
		
	},

	getProdName: function (n, cb,i) {
		// body...
		var self = this;
		this.setState({callback:cb, pind:i})
		setTimeout(function () {
			// body...
			self.sendPacket('getProdName',n)
		},50)
		
	
	},
	clearFaults: function () {
		// body...
		this.sendPacket('clearFaults',0)
		
	},
	render: function () {
		// body...
		var attention = 'attention'
		if(this.state.faultArray.length != 0){
			attention = 'attention_clear'
		}
		var config = 'config'
		if(this.state.settings){
			config = 'config_active'
		}
		var find = 'find'
		
		var SD ="";
		var MD ="";
		var dm = "";// <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm' int={this.state.interceptor}/>
		var dg = "";// <DummyGraph ref='dg' canvasId={'dummyCanvas'} int={this.state.interceptor}/>
		var ce =""// <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'} int={this.state.interceptor}/>
	 	var lstyle = {height: 72,marginRight: 20, marginLeft:10}
	 	var np = (<NetPollView ref='np' eventCount={15} events={this.state.netpoll}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15, marginLeft: 10}
		}
		
			SD = (<SettingsDisplay2 mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' 
				data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.cob2]} cvdf={vdefByIp[this.props.det.ip][4]} sendPacket={this.sendPacket}/>)
			MD = ""; 
		
		var lbut = (<td onClick={this.logoClick}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>)
		var abut = (<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>)
		var cbut = (<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>)
		var lmtable = (<table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								<td className='mobCell'><MobLiveBar ref='lv' int={this.state.interceptor}/></td>
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>)
		if(!this.state.br){
			lmtable = (<div><table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>
					<MobLiveBar ref='lv' int={this.state.interceptor}/>
					</div>)
			if(!this.state.settings){
				MD = (<div><div className='prefInterface'>{dm}</div>
					<div className='prefInterface'>{dg} </div>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
			}	
		}
		var ov = 0
		if(this.state.testRec['TestRecOnFlag']){
			ov = 1;
		}
		var tescont = <TestReq ip={this.props.ip} toggle={this.showTestModal}/>
		var showPropmt = "Settings";
		var tbklass = 'expandButton';
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Test']]} cvdf={vdefByIp[this.props.det.ip][6]['Test']} sendPacket={this.sendPacket}/>
			showPropmt = "Back"
			tbklass='collapseButton'
		}
		var snsCont = <SettingsDisplay2 setOverride={this.setSOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Sens']]} cvdf={vdefByIp[this.props.det.ip][6]['Sens']} sendPacket={this.sendPacket}/>
		var mpui = 	<StealthMainPageUI toggleTestModal={this.showTestModal} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
			if(this.props.det.interceptor){
				mpui = 	<InterceptorMainPageUI toggleTestModal={this.showTestModal} toggleSens={this.showSens} toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im' getProdName={this.getProdName}/>
			
			}
		var testprompt = this.renderTest();
		return(<div>
			<div hidden>
				{lmtable}

			</div>

			{mpui}	<Modal ref='sModal' onClose={this.settingsClosed}>
					<div style={{height:500, overflowY:'scroll'}}>
					{SD}
					</div>
				</Modal>
					<Modal ref='fModal'>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
				</Modal>
				<Modal ref='tModal' override={ov}>
					{testprompt}
				
				</Modal>
				<Modal ref='teModal'>
				<button style={{float:'right', color:'blue'}}className={tbklass} onClick={this.toggleTestSettings}>{showPropmt}</button>
					{tescont}
				</Modal>
				<Modal ref='snModal'>
					{snsCont}
				</Modal>
				<SnackbarNotification faults={this.state.faultArray} onClear={this.clearFaults} vmap={vdefByIp[this.props.ip][5]}/>
				</div>)
	}
})

var Storage = React.createClass({
	getInitialState:function () {
		// body...
		return({cob:{},pages:{},faultArray:[],ioBITs:[]})
	},
	parseRec: function () {
		// body...
	},
	showSettings: function () {
		//var data = [];
		//data.push([this.state.cob2,0]);
		this.refs.sModal.toggle();
		this.setState({data:[[this.state.cob2,0]], update:true})
		
	},
	showSens: function () {
		// body...
		this.refs.snModal.toggle()
		this.setState({data:[[this.state.pages['Sens'],0]], stack:[], update:true})
	},
	setOverride: function (ov) {
		// body...
		this.refs.sModal.setState({keyboardVisible:ov})
	},
	setTOverride: function (ov) {
		// body...
		this.refs.teModal.setState({keyboardVisible:ov})
	},
	setSOverride: function (ov) {
		// body...
		this.refs.snModal.setState({keyboardVisible:ov})
	},
	sendPacket:function (n,v) {
		// body...
		this.props.sendPacket(n,v)
	},
	render: function () {
		// body...
		var ov = 0
		if(this.state.testRec['TestRecOnFlag']){
			ov = 1;
		}
		var tescont = <TestReq ip={this.props.ip} toggle={this.showTestModal}/>
		var showPropmt = "Settings";
		var tbklass = 'expandButton';
		if (this.state.showTest){
			var dt;
			if(this.state.data.length == 0){
				dt = []
			}
			tescont = 	<SettingsDisplay2 setOverride={this.setTOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'testpage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Test']]} cvdf={vdefByIp[this.props.det.ip][6]['Test']} sendPacket={this.sendPacket}/>
			showPropmt = "Back"
			tbklass='collapseButton'
		}
		var snsCont = <SettingsDisplay2 setOverride={this.setSOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'snspage' mode={'page'} data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} cob2={[this.state.pages['Sens']]} cvdf={vdefByIp[this.props.det.ip][6]['Sens']} sendPacket={this.sendPacket}/>

		var	SD = (<SettingsDisplay2 mode={'config'} setOverride={this.setOverride} faultBits={this.state.faultArray} ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' 
				data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.props.interceptor} cob2={[this.state.cob2]} cvdf={vdefByIp[this.props.det.ip][4]} sendPacket={this.sendPacket}/>)
	
		return <div>
			<Modal ref='sModal'>
				{SD}
			</Modal>

			<Modal ref='fModal'></Modal>

			<Modal ref='tModal'>
				{tescont}
			</Modal>


			<Modal ref='snModal'>
				{snsCont}
			</Modal>
		</div>
	}
})
var NetPollView = React.createClass({
	getInitialState: function () {
		return({events:[]})
	},
	onNetpoll: function(e){
		this.pushEvent(e)
	},
	pushEvent: function (e) {
		// body...
		var events = this.state.events
		if(events.length == this.props.eventCount){
			events.splice(-1,1);
		}
		////console.log(['3280',e])
		events.unshift(e);
		this.setState({events:events})
	},
	dummyEvent: function () {
		// body...
		//this.pushEvent({string:(new Date(Date.now())).toUTCString() + 'Reject - dummy'})
	},
	render:function () {
		var self = this;
		var events = this.props.events.map(function(e){
			var ev = e.net_poll_h;
			if(netMap[e.net_poll_h]){
				ev = netMap[e.net_poll_h]['@translations']['english']	
			}
			var dateTime = e.date_time.year + '/' + e.date_time.month + '/' + e.date_time.day + ' ' + e.date_time.hours+ ':' + e.date_time.min + ':' + e.date_time.sec;
			var rejects = e.rejects
			var faults = e.faults
			var string = ""
			console.log(['4163',e])
			if(e.net_poll_h == "NET_POLL_REJECT_ID"){

				string = 'rejects:' + rejects.number + ', signal:' + rejects.signal;

			}else if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')||(e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				if(e.parameters[0].value != null){


					string = e.parameters[0].param_name + ': ' + e.parameters[0].value
				}else if(e.parameters[0].label.type != null){
					string = e.parameters[0].param_name + ': ' + vdefByIp[self.props.ip][0]['@labels'][e.parameters[0].label.type]['english'][e.parameters[0].label.value];
				}
			}else if(e.net_poll_h == 'NET_POLL_FAULT'){
				if(e.faults.length != 0){
					e.faults.forEach(function(f, i){
						string += vdefByIp[self.props.ip][0]['@labels'].FaultSrc['english'][f]
						if(i + 1 <e.faults.length ){
							string += ", "
						}
					})
				}else{
					string = 'No Faults'
				}
				
				//vdefByIp[this.props.ip][0]['@labels'].FaultSrc[]
			}


			return (<tr><td style={{width:150}}>{dateTime}</td><td style={{width:150}}>{ev}</td><td style={{width:220}}>{string}</td></tr>)
		})
		// body...
		return (<div>
			<label style={{display: 'inline-block',fontSize:26,width:100,float:'left',paddingLeft: 20}}>Events</label>
			<div style={{display:'inline-block', height:260,width:600	}}>
			<table className='npTable'>
			<thead><tr><th style={{width:150}}>Timestamp</th><th style={{width:150}}>Event</th><th style={{width:220}}>Details</th></tr>
		</thead>
			<tbody>
				{events}
			</tbody></table>
			</div>

		</div>)
	}
})
var ProductItem = React.createClass({
	getInitialState: function () {
		// body...
		return{name:this.props.name}
	},
	componentWillReceiveProps:function (newProps) {
		// body...
		this.setState({name:newProps.name})
	},
	switchProd:function () {
		this.props.switchProd(this.props.p)
	},
	copyProd:function () {
		// body...
		this.props.copy();
	},
	deleteProd: function () {
		// body...
		this.props.delete(this.props.p)
	},
	editName: function () {
		// body...
		var self = this;
		setTimeout(function () {
				// body...
			
		self.refs.nameinput.onFocus()
	},100)
		//this.props.editName(this.state.name)
	},
	onChange: function (v) {
		// body...
		this.setState({name:v})
		this.props.editName(v)
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose: function() {
		// body...
		this.props.onRequestClose();
	},
	render: function () {
		// body...
		var st = {color:'#818a90', padding:7, display:'inline-block', width:200}
		var buttons = <button className='deleteButton' onClick={this.deleteProd}></button>
		if(this.props.selected){
			st = {color:'green', padding:7, display:'inline-block', width:200}
			buttons = <div style={{display:'inline-block'}}><button className='copyButton' onClick={this.copyProd}></button>
			<button className='editButton' onClick={this.editName}></button><div style={{display:'none'}}><KeyboardInput onFocus={this.onFocus} onRequestClose={this.onRequestClose} ref='nameinput' onInput={this.onChange} value={this.state.name}/></div></div>
		}
		var name = 'Product '+this.props.p
		if(this.props.name.length > 0){
			name = this.props.name
		}
		var editRow ="";
		if(this.props.editMode){
			editRow = <div style={{display:'inline-block', marginLeft:10}}>{buttons}</div>
		}
		return (<div ><label onClick={this.switchProd} style={st}>{this.props.p + '.  ' +name}</label>{editRow}</div>)
	}
})
var CalibInterface = React.createClass({
	getInitialState: function () {
		// body...
		return({phaseSpeed:0,phase:0,phaseMode:0, edit:false, tmpStr:'', tmpStrB:''})
	},
	calibrate: function () {
		// body...
		this.props.calib()
	},
	calibrateA: function () {
		// body...
		this.props.calibA()
	},  
	editPhase: function () {
		// body...
		this.setState({edit:!this.state.edit})
	},

	refresh: function () {
		// body...
		this.props.refresh()
	},
	onChangePhase: function (e) {
		this.setState({tmpStr:e})
	},
	onChangePhaseB: function (e) {
		// body...
		this.setState({tmpStrB:e})
	},
	clearR: function () {
		// body...	
		this.props.sendPacket('rpeak','clear')
	},
	clearRB: function () {
		// body...
		this.props.sendPacket('rpeakb','clear')
	},
	submitPhase: function () {
		// body...
		this.props.sendPacket('phaseEdit',this.state.tmpStr)
	},
	submitPhaseb: function () {
		// body...
		this.props.sendPacket('phaseEditb',this.state.tmpStrB)
	},
	clearX: function(){
		this.props.sendPacket('xpeak','clear')
	},
	clearXB: function(){
		this.props.sendPacket('xpeakb','clear')
	},
	_handleKeyPress: function (e) {
		// body...
		if(e.key === 'Enter'){
			this.submitPhase();
		}
	},
	render: function () {
		// body...
		var list = ['dry', 'wet', 'DSA']
		var phase = (<div onClick={this.editPhase}> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>)
		var tdstyle = {background:'linear-gradient(135deg, rgba(128, 128, 128, 0.3), transparent 67%)'	}
		
		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))', width:170}
		var tdstyleintB = { background:'linear-gradient(135deg, rgba(0,128,128,0.4),transparent 67%', width:170}
		

		if(this.state.edit){
			phase = (<div><div onClick={this.editPhase}> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>
					<div><KeyboardInputWrapper num={true} onKeyPress={this._handleKeyPress} onInput={this.onChangePhase} value={this.state.tmpStr}/> <button onClick={this.submitPhase}>Submit</button></div>
				</div>)
		}
		if(this.props.int){
			var phaseb =  <div onClick={this.editPhase}> {this.props.phaseB[0] + '-' + list[this.props.phaseB[1]]}</div>
			if(this.state.edit){
				phaseb =  <div><div onClick={this.editPhase}> {this.props.phaseB[0] + '-' + list[this.props.phaseB[1]]}</div>
						<div><KeyboardInputWrapper num={true} value = {this.state.tmpStrB} onInput={this.onChangePhaseB}/>
						<button onClick={this.submitPhaseb}>Submit</button>
						</div>
						</div>
			}
			return (<div className='calib'>
				<label>
					Calibration Menu
				</label>
				<table><tbody>
					<tr><td style={tdstyle}>Phase Speed:</td><td style={tdstyleintA}>{this.props.phase[2]}</td><td  style={tdstyleintB}>{this.props.phaseB[2]}</td></tr>
					<tr><td style={tdstyle}>Phase:</td><td style={tdstyleintA}>{phase}</td><td style={tdstyleintB}>{phaseb}</td></tr>
					<tr><td style={tdstyle}>R Peak:</td><td style={tdstyleintA} onClick={this.clearR}>{this.props.peaks[0]}</td><td style={tdstyleintB} onClick={this.clearRB}>{this.props.peaks[2]}</td></tr>
					<tr><td style={tdstyle}>X Peak:</td><td style={tdstyleintA} onClick={this.clearX}>{this.props.peaks[1]}</td><td style={tdstyleintB} onClick={this.clearXB}>{this.props.peaks[3]}</td></tr>
					<tr><td/><td style={tdstyle} onClick={this.calibrateA}>Calibrate</td><td style={tdstyle} onClick={this.calibrate}>Calibrate</td></tr>
				
				</tbody></table>
				<div></div>
							</div>)
		}
		return (<div className='calib'>
				<label>
					Calibration Menu
				</label>
				<table><tbody>
					<tr><td style={tdstyle} >Phase Speed:</td><td style={tdstyleintA}>{this.props.phase[2]}</td></tr>
					<tr><td  style={tdstyle}>Phase:</td><td style={tdstyleintA}>{phase}</td></tr>
					<tr><td  style={tdstyle}>R Peak:</td><td onClick={this.clearR}>{this.props.peaks[0]}</td></tr>
					<tr><td style={tdstyle}>X Peak:</td><td onClick={this.clearX}>{this.props.peaks[1]}</td></tr>
					<tr><td/><td style={tdstyle} onClick={this.calibrate}>Calibrate</td></tr>
				
				</tbody></table>
				<button onClick={this.calibrate}>Calibrate</button>
				</div>)
	}
})
var TestReq = React.createClass({
	testMan:function () {
		var packet = dsp_rpc_paylod_for(19,[32,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.props.toggle()
	},
	testMan2:function () {
		var packet = dsp_rpc_paylod_for(19,[32,2,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.props.toggle()
	},
	testHalo:function () {
		var packet = dsp_rpc_paylod_for(19,[32,1,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.nextProps.toggle()
	},
	testHalo2:function () {
		var packet = dsp_rpc_paylod_for(19,[32,3,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.props.toggle()
	},
	render: function () {
		// body...
		var testcont = ''
		var ack = ''
		var tdstyle = {background:'rgba(128, 128, 128, 0.3)', fontSize:25, width:170	}

		var tdstyleintA = { background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))'}
		var testModes = ['Manual','Halo','Manual 2', 'Halo 2']
		var _tcats = ['Manual','Halo','Manual2','Halo2']
		var metTypes = ['Ferrous','Non-Ferrous','Stainless Steel']
		var schain = ['B','A']
			
		
		
		testcont = <div>
					<div>Select Test</div>
					<table>
						<tbody><tr>
							<td style={tdstyle} onClick={this.testMan}>Manual</td><td style={tdstyle} onClick={this.testHalo}>Halo</td>
						</tr><tr>
							<td style={tdstyle} onClick={this.testMan2}>Manual 2</td><td style={tdstyle} onClick={this.testHalo2}>Halo 2</td> 
						</tr></tbody>
					</table>
				</div>

			
		
		var testprompt = <div>{testcont} </div>
		return testprompt
	}
})
var TestInterface = React.createClass({
	getInitialState: function () {
		// body...
		return {prodRec:this.props.prodRec}
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({prodRec:newProps.prodRec})
		this.render();
	},
	sendPacket: function(e,c){
		this.props.sendPacket(this.props.pVdef[1][c],e)
	},
	sendTest: function(){
		if(this.props.prodRec['TestMode'] > 0){
			this.props.sendPacket('test',this.props.prodRec['TestMode'] - 1)

		}
	},
	modeChanged: function(e){
		this.props.sendPacket(this.props.pVdef[1]['TestMode'],e.target.value)

	},
	render: function () {
		var prod = this.state.prodRec;
		//////console.log(prod)
		var self = this;
		var testConfigs = _testMap.map(function(_test, i){
			var test = _test.map(function(conf){
		//		////console.log(conf)
				return ({count:prod[conf.count], metal:prod[conf.metal]})
			})	
			//////console.log(test)
			return <TestItem sendChange={self.sendPacket} conf={_test} metalCounts={test} ind={i+1} pVdef={self.props.pVdef}/>
		}) 
		var op = ''
		//console.log('testmode: ' + prod['TestMode']);
		if(prod['TestMode']){
			var testConfigs = testConfigs[prod['TestMode']- 1]
		//	console.log(prod['TestConfigOperator'+(prod['TestMode'] - 1).toString()])
			if(prod['TestConfigOperator'+(prod['TestMode'] - 1).toString()]){
				//prompt
				op = <div><KeyboardInputWrapper onInput={this.onOp} num={true}/></div>
			}
		} 

		var testModes = ['Prompt', 'Manual', 'Halo', 'Manual2', 'Halo2'];
		var testSelectOptions = testModes.map(function(m,i){
			if(i == prod['TestMode']){
				return <option selected value={i}>{m}</option>
			}else{
				return <option  value={i}>{m}</option>
			}
		})

		//var selectTestMode
	//	////console.log(testConfigs)
		return(<div className='testInt'>
			{op}
			{testConfigs}
		

				<select onChange={this.modeChanged}>
				{testSelectOptions}
				</select>
					<button onClick={this.sendTest}>Test</button>
			</div>)
	}
})
var TestItem = React.createClass({
	sendChange: function(e,c){
		////console.log('received change')
		////console.log(e)
		////console.log(c)
		this.props.sendChange(e,c)
	},
	render:function(){
		var metList = ['FE','NFE', 'SS']
		var self = this;
		
		var tests = this.props.metalCounts.map(function(mc, j){
			var metDrop = metList.map(function(m,i){
					if(i==mc.metal){
							return (<option value={i} selected>{m}</option>)
					}else{
							return (<option value={i}>{m}</option>)
					}
			})
			return <TestPassRow sendChange={self.sendChange} mc={mc} conf={self.props.conf[j]} />
		})
		var testStr = ['Prompt', 'Manual', 'Halo', 'Manual2', 'Halo2']
		return(<div>
			<TreeNode nodeName={'Test ' + testStr[this.props.ind]}>
			<table><tbody>
			{tests}
			</tbody></table>
			</TreeNode>
		</div>)
	}
})
var TestPassRow = React.createClass({
	getInitialState: function(){
		return ({mc:this.props.mc})
	},
	componentWillReceiveProps: function(np){
		this.setState({mc:np.mc})
	},
	onChangeMet: function(e){
		var mc = this.state.mc;
		mc.metal = parseInt(e.target.value);
		this.props.sendChange(mc.metal, this.props.conf.metal)
		this.setState({mc:mc})

	},
	valChanged: function(e){
		var mc = this.state.mc
		if(typeof e == 'string'){
			mc.count = parseInt(e);
		}else{
			mc.count = parseInt(e.target.value)
		}
		this.props.sendChange(mc.count, this.props.conf.count)
		this.setState({mc:mc})
	},
	render:function(){
		var metList = ['FE','NFE', 'SS']
		var self = this;
		var metDrop = metList.map(function(m,i){
					if(i==self.props.mc.metal){
							return (<option value={i} selected>{m}</option>)
					}else{
							return (<option value={i}>{m}</option>)
					}
			})
		return (<tr><td style={{marginRight:10, width:100, display:'inline-block'}}>Metal:<select onChange={this.onChangeMet}>{metDrop}</select></td><td>Count:
			<KeyboardInput tid={this.props.conf.count+'_test'} onInput={this.valChanged} value={this.state.mc.count}  num={true} Style={{width:150}}/>
	</td></tr>)
	}
})
var DummyGraph = React.createClass({
	getInitialState: function () {
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		return({width:480, height:230, mqls:mqls})
	},
	listenToMq: function () {
		// body...
		
	},
	componentDidMount: function () {
		this.listenToMq()
	},
	renderCanv: function () {
		return(<CanvasElem canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int}/>)
	},
	stream:function (dat) {
		this.refs.cv.stream(dat)
	},
	render: function () {
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			{cv}
			</div>)
	}

})
var SlimGraph = React.createClass({
	getInitialState: function () {
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		return({width:400, height:140, mqls:mqls})
	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[3].matches){
			this.setState({width:400})
		}else if(this.state.mqls[2].matches){
			this.setState({width:558})
		}else if(this.state.mqls[1].matches){
			this.setState({width:400})
		}else{
			this.setState({width:280})
		}
	},
	componentDidMount: function () {
		this.listenToMq()
	},
	renderCanv: function () {
		return(<CanvasElem canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int}/>)
	},
	stream:function (dat) {
		this.refs.cv.stream(dat)
	},
	render: function () {
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			{cv}
			</div>)
	}

})
var StealthMainPageUI = React.createClass({
	getInitialState: function () {
		// body...
		var res = vdefByIp[this.props.det.ip]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];

		}
		var res = null;
		return ({rpeak:0,xpeak:0,peak:0,phase:0,rej:0, sysRec:{},prodRec:{},tmp:'',prodList:[],phaseFast:0,pVdef:pVdef})
	},
	sendPacket: function (n,v) {
		// body...
		this.props.sendPacket(n,v)
	},
	parseInfo: function(sys, prd){
		//////console.log('parseInfo')
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
		//	////console.log([sys,prd])
			
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
			
		}
	},
	componentDidMount: function(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			// body...
			console.log(['5369', pack])
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	},
	clearRej: function () {
		// body...
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	},
	switchProd: function (p) {
		// body...
		this.props.sendPacket('ProdNo',p)
		//this.props.sendPacket('LOCF_PROD_NAME_READ',p)

	},
	clearPeak: function () {
		// body...
		var p = 'Peak'
		
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	},
	update: function (sig) {
		var dat = {t:Date.now(),val:sig}
		this.refs.nv.streamTo(dat)
		this.refs.dv.update(sig)
	},
		refresh: function () {
		this.props.sendPacket('refresh')
	},
	cancel:function () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	},
	showEditor: function () {
		//this.setState({prodNames:[],curInd:0})
		var self = this;
		this.refs.pedit.toggle()
		setTimeout(function () {
			// body...
			self.setState({peditMode:false})
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList')
		},100)
		
		
	},
	calibrate: function () {
		this.refs.calibModal.toggle()
	},
	_handleKeyPress: function (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	},
	sensFocus: function(){
		this.refs.sensEdit.setState({override:true})
	},
	sensClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	},
	gohome: function () {
		// body...
		this.props.gohome();
	},
	toggleNetpoll:function () {
		// body...
		this.refs.netpolls.toggle();
	},
	onButton: function (f) {
		// body...
		console.log(f)
			
		if(f == 'test'){
			if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				//this.toggleTestModal()
				this.props.toggleTestModal();
			}
			
		}	
		}else if(f == 'log'){
			this.toggleNetpoll();
		}else if(f == 'config'){
			this.props.toggleConfig();
		}else if(f == 'prod'){
			this.showEditor();
		}else if(f == 'cal'){
			this.calibrate();
		}else if(f=='sig'){
			this.clearPeak();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			this.props.toggleSens();
		}
	},
	onSens: function (e,s) {
		// body...
		this.props.sendPacket(s,e);
	},
	setProdList: function (prodList) {
			// body...
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)
		},100)
	},
	getProdName:function (p,cb,i) {
		// body...
		console.log(['5889',p])
		this.props.getProdName(p,cb,i)
	},
	setProdName: function (name, ind) {
		// body...
		var sa = []
		name.slice(3,23).forEach(function (i) {
			// body...
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		console.log(['5888',str])
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				// body...
				
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}

	},
	prodFocus: function(){
		this.refs.pedit.setState({override:true})
	},
	prodClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.pedit.setState({override:false})	
		}, 100)
	},
	changeProdEditMode:function () {
		// body...
		this.setState({peditMode:!this.state.peditMode})
	},
	copyCurrentProd: function () {
		// body...
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList',99)
		},100)
	},
	deleteProd: function (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	},
	editName: function (name) {
		// body...
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	},
	onCalFocus: function () {
		// body...
		this.refs.calibModal.setState({override:true})
	},
	onCalClose: function () {
		// body...
		var self = this;
		setTimeout(function () {
			// body...
				self.refs.calibModal.setState({override:false})
		},100)
	
	},
	render: function () {
		// body...
		var home = 'home'
		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		var lstyle = {height: 50,marginRight: 20, marginLeft:10}
		var self = this;
		var prodNames = this.state.prodNames
		console.log(self.state.sysRec)
		var prodList = this.state.prodList.map(function(p, i){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}
			var name = ""
			if(typeof prodNames[i] != 'undefined'){
				name = prodNames[i]
			}
			return (<ProductItem onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/>)
		})
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
			var peditCont = (<div>
				<div><button style={{float:'right'}} className='editButton' onClick={this.changeProdEditMode}>Edit Products</button></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return(<div className='stealthMainPageUI' style={style}>
			<table className='landingMenuTable' style={{marginBottom:-8, marginTop:-7}}>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
							</tr>
						</tbody>
					</table>
			<StealthDynamicView onButton={this.onButton} onSens={this.onSens} ref='dv' prodName={this.state.prodRec['ProdName']} sens={[this.state.prodRec['Sens']]} sig={[this.state.peak]} rej={this.state.rej}/>
			<StealthNav onButton={this.onButton} ref='nv' prodName={this.state.prodRec['ProdName']}/>
			<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit'>
				{peditCont}
				</Modal>
				<Modal ref='calibModal'>
				<StealthCalibrateUI onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} phase={[this.state.phase, this.state.prodRec['PhaseMode'], ps]} peaks={[this.state.rpeak,this.state.xpeak]}/>
				{/*CB*/}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
			</div>)
	}
})
var StealthDynamicView = React.createClass({
	update: function (sig) {
		// body...

		this.refs.tb.update(sig)
		//this.refs.tbb.update(sigb)
	},
	onSens: function (e) {
		// body...
		this.props.onSens(e, 'Sens')
	},
	onSig: function () {
		// body...
		this.props.onButton('sig')
	},
	onRej:function () {
		// body...
		this.props.onButton('rej')
	},
	render:function () {
		// body...
			var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
			var centerLab = {textAlign:'center', marginRight:'auto', marginLeft:'auto', color:"#000"}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		return(
			<div style={{marginTop:2}}>
			<div style={{padding:10, borderRadius:20, border:'5px black solid', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'rgb(225,225,225)', boxShadow:'0px 0px 0px 10px #818a90'}}>
			<div className='stealthDynamicView'  style={{overflow:'hidden', display:'block', width:940,height:232, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10, border:'2px solid black'}}>
			<div style={{background:'#818a90', height:232}}>
				<div><TickerBox ref='tb'/></div>
						<table style={{marginLeft:'auto', marginRight:'auto', marginTop:5}}><tbody><tr><td style={{borderColor:'#e1e1e1',borderStyle:'solid',borderWidth:10,borderRadius:20,height:75,background:'#818a90', width:330}}>
						
						<div style={{display:'block', height:34, width:470}}>Product Info</div>
				<div style={{display:'block', height:34, width:470, fontSize:24}}>{this.props.prodName}</div>

				</td></tr>
				</tbody></table>
				<div><div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Sensitivity</div><div ><KeyboardInputButton num={true} isEditable={true} value={this.props.sens[0]} onInput={this.onSens} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Signal</div><div ><KeyboardInputButton onClick={this.onSig} isEditable={false} value={this.props.sig[0]} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3}}><div style={centerLab}>Reject</div><div><KeyboardInputButton  isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div></div>
				
				</div></div>

			</div>
			</div>
			</div>
			</div>)
	}
})

var StealthNav = React.createClass({
	onConfig: function () {
		// body...
		this.props.onButton('config')
	},
	onTest:function () {
		// body...
		this.props.onButton('test')
	},
	onLog: function () {
		// body...
		this.props.onButton('log')
	},
	onSens: function () {
		// body...
		this.props.onButton('sens')
	},
	onCal: function () {
		// body...
		this.props.onButton('cal')
	},
	onProd: function () {
		// body...
		this.props.onButton('prod')

	},
	streamTo: function (dat) {
		// body...
		this.refs.sg.stream(dat);
		//console.log('streaming')
	},
	render: function () {
		// body...
		return (<div className='interceptorNav' style={{display:'block', width:930, marginLeft:'auto',marginRight:'auto', background:'black'}}>
				
				<div style={{overflow:'hidden',width:930,height:250}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton lab={'Config'} onClick={this.onConfig}/>
					<CircularButton lab={'Test'} onClick={this.onTest}/>
					<CircularButton lab={'Log'} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:430, height:220, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<StealthNavContent ref='nv' prodName={this.props.prodName}><DummyGraph int={false} ref='sg' canvasId={'sgcanvas2'}/>	</StealthNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
				<CircularButton lab={'Sensitivity'} inverted={true} onClick={this.onSens}/>
				<CircularButton lab={'Calibrate'} inverted={true} onClick={this.onCal}/>
				<CircularButton lab={'Product'} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
})
var StealthNavContent = React.createClass({
	getInitialState: function () {
		// body...
		return {prodName:'PRODUCT 1'}
	},
	stream:function (dat) {
		// body...
		//this.refs.sg.stream(dat)
	},
	render: function () {
		// body...
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:230, marginTop: -20,marginLeft:-20}
		return (<div className='interceptorNavContent' style={wrapper}>
			<table className='noPadding'>
				<tbody>
				<tr><td>
				{this.props.children}
				
				</td></tr>
				</tbody>
			</table>
				</div>)
	}
})

var InterceptorMainPageUI = React.createClass({
	getInitialState: function () {
		// body...
		var res = vdefByIp[this.props.det.ip]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		var tmpA = '';
		var tmpB = '';
		var res = null;

		return({peditMode:false,rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0,curInd:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', prodList:[],prodNames:[], phaseFast:0, phaseFastB:0, pVdef:pVdef})
	},
	sendPacket: function (n,v) {
		// body...
		this.props.sendPacket(n,v);
	},
	update(siga, sigb) {
		// body...
		var dat = {t:Date.now(),val:siga,valb:sigb}
		this.refs.nv.streamTo(dat)
		this.refs.dv.update(siga,sigb)
	},
	componentDidMount: function(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			// body...
			console.log(['5369', pack])
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	},
	clearRej: function () {
		// body...
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	},
	switchProd: function (p) {
		// body...
		this.props.sendPacket('ProdNo',p)
		//this.props.sendPacket('LOCF_PROD_NAME_READ',p)

	},
	clearPeak: function () {
		// body...
		var p = 'Peak_A'
		
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	},
	clearPeakB: function () {
		// body...
		var p = 'Peak_B'
		
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
		param = null;
	},
	calibrate: function () {
		this.refs.calibModal.toggle()
	},
	parseInfo: function(sys, prd){
		//////console.log('parseInfo')
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
		//	////console.log([sys,prd])
			if(this.props.int){
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens_A'], tmpB:prd['Sens_B']})
			}else{
				this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
			}
			
		}
	},
	showEditor: function () {
		//this.setState({prodNames:[],curInd:0})
		var self = this;
		this.refs.pedit.toggle()
		setTimeout(function () {
			// body...
			self.setState({peditMode:false})
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList')
		},100)
		
		
	},
	editSens: function () {
		this.refs.sensEdit.toggle()
	},
	setTest: function () {
		if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				this.toggleTestModal()
			}
			
		}
		//

	},
	toggleTestModal: function () {
		// body...
		this.refs.testModal.toggle()
	},
	updateTmp:function (e) {
		//e.preventDefault();
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
		
	},
	updateTmpB:function (e) {
		//e.preventDefault();
		if(typeof e == 'string'){
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e)
			this.setState({tmpB:e})
		}else{
			this.props.sendPacket(this.state.pVdef[1]['Sens_B'], e.target.value)
			this.setState({tmpB:e.target.value})	
		}
		
	},
	submitTmpSns:function () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_A', this.state.tmp)
			}else{
				this.props.sendPacket('Sens',this.state.tmp)	
			}
			this.cancel()
		}
	},
	submitTmpSnsB:function () {
		if(!isNaN(this.state.tmp)){
			if(this.props.int){
				this.props.sendPacket('Sens_B', this.state.tmpB)
			}else{
				this.props.sendPacket('Sens',this.state.tmpB)	
			}
			this.cancel()
		}
	},
	refresh: function () {
		this.props.sendPacket('refresh')
	},
	cancel:function () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	},
	calB: function () {
		this.props.sendPacket('cal',[0])
	},
	calA:function () {
		// body...
		this.props.sendPacket('cal',[1])
	},
	_handleKeyPress: function (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	},
	sensFocus: function(){
		this.refs.sensEdit.setState({override:true})
	},
	sensClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	},
	gohome: function () {
		// body...
		this.props.gohome();
	},
	toggleNetpoll:function () {
		// body...
		this.refs.netpolls.toggle();
	},
	onButton: function (f) {
		// body...
		console.log(f)
			
		if(f == 'test'){
			if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				//this.toggleTestModal()
				this.props.toggleTestModal();
			}
			
		}	
		}else if(f == 'log'){
			this.toggleNetpoll();
		}else if(f == 'config'){
			this.props.toggleConfig();
		}else if(f == 'prod'){
			this.showEditor();
		}else if(f == 'cal'){
			this.calibrate();
		}else if(f=='sig_a'){
			this.clearPeak();
		}else if(f=='sig_b'){
			this.clearPeakB();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			this.props.toggleSens();
		}
	},
	onSens: function (e,s) {
		// body...
		this.props.sendPacket(s,e);
	},
	setProdList: function (prodList) {
			// body...
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)
		},100)
	},
	getProdName:function (p,cb,i) {
		// body...
		console.log(['5889',p])
		this.props.getProdName(p,cb,i)
	},
	setProdName: function (name, ind) {
		// body...
		var sa = []
		name.slice(3,23).forEach(function (i) {
			// body...
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		console.log(['5888',str])
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				// body...
				
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}

	},

	prodFocus: function(){
		this.refs.pedit.setState({override:true})
	},
	prodClose: function(){
		var self = this;
		setTimeout(function(){
			self.refs.pedit.setState({override:false})	
		}, 100)
	},
	changeProdEditMode:function () {
		// body...
		this.setState({peditMode:!this.state.peditMode})
	},
	copyCurrentProd: function () {
		// body...
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList',99)
		},100)
	},
	deleteProd: function (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	},
	editName: function (name) {
		// body...
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	},
	onCalFocus: function () {
		// body...
		this.refs.calibModal.setState({override:true})
	},
	onCalClose: function () {
		// body...
		var self = this;
		setTimeout(function () {
			// body...
				self.refs.calibModal.setState({override:false})
		},100)
	
	},

	render:function () {
		// body...
		var home = 'home'
		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		var lstyle = {height: 50,marginRight: 20, marginLeft:10}
		var self = this;
		var prodNames = this.state.prodNames
		var prodList = this.state.prodList.map(function(p, i){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}
			var name = ""
			if(typeof prodNames[i] != 'undefined'){
				name = prodNames[i]
			}
			return (<ProductItem onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/>)
		})
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_A']]
			var psb = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_B']]
			if(this.state.phaseFast == 1){
				ps = 'fast'
			}
			if(this.state.phaseFastB == 1){
				psb = 'fast'
			}
		var	CB = <CalibInterface int={true} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.calB} calibA={this.calA} phase={[this.state.phase, this.state.prodRec['PhaseMode_A'], ps]} phaseB={[this.state.phaseb, this.state.prodRec['PhaseMode_B'], psb]} peaks={[this.state.rpeak,this.state.xpeak, this.state.rpeakb,this.state.xpeakb]} ref='ci'/>
		var peditCont = (<div>
				<div><button style={{float:'right'}} className='editButton' onClick={this.changeProdEditMode}>Edit Products</button></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return (<div className='interceptorMainPageUI' style={style}>
					<table className='landingMenuTable' style={{marginBottom:-8, marginTop:-7}}>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
							</tr>
						</tbody>
					</table>
			<InterceptorDynamicViewV2 onButton={this.onButton} onSens={this.onSens} ref='dv' sens={[this.state.prodRec['Sens_A'],this.state.prodRec['Sens_B']]} sig={[this.state.peak,this.state.peakb]} rej={this.state.rej}/>
			<InterceptorNav onButton={this.onButton} ref='nv' prodName={this.state.prodRec['ProdName']} />
				<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit'>
				{peditCont}
				</Modal>
				<Modal ref='calibModal'>
				<InterceptorCalibrateUI int={true} onFocus={this.onCalFocus} onRequestClose={this.onCalClose} sendPacket={this.sendPacket} refresh={this.refresh} calibB={this.calB} calibA={this.calA} phase={[this.state.phase, this.state.prodRec['PhaseMode_A'], ps]} phaseB={[this.state.phaseb, this.state.prodRec['PhaseMode_B'], psb]} peaks={[this.state.rpeak,this.state.xpeak, this.state.rpeakb,this.state.xpeakb]}/>
				{/*CB*/}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
		</div>)
	}
})
var InterceptorNav = React.createClass({
	onConfig: function () {
		// body...
		this.props.onButton('config')
	},
	onTest:function () {
		// body...
		this.props.onButton('test')
	},
	onLog: function () {
		// body...
		this.props.onButton('log')
	},
	onSens: function () {
		// body...
		this.props.onButton('sens')
	},
	onCal: function () {
		// body...
		this.props.onButton('cal')
	},
	onProd: function () {
		// body...
		this.props.onButton('prod')
	},
	streamTo: function (dat) {
		// body...
		this.refs.sg.stream(dat);
		//console.log('streaming')
	},
	render: function () {
		// body...
		return (<div className='interceptorNav' style={{display:'block', width:930, marginLeft:'auto',marginRight:'auto', background:'black'}}>
				
				<div style={{overflow:'hidden',width:930,height:250}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton lab={'Settings'} onClick={this.onConfig}/>
					<CircularButton lab={'Test'} onClick={this.onTest}/>
					<CircularButton lab={'Log'} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:430, height:220, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<InterceptorNavContent ref='nv' prodName={this.props.prodName}><SlimGraph int={true} ref='sg' canvasId={'sgcanvas2'}/>	</InterceptorNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
				<CircularButton lab={'Sensitivity'} inverted={true} onClick={this.onSens}/>
				<CircularButton lab={'Calibrate'} inverted={true} onClick={this.onCal}/>
				<CircularButton lab={'Product'} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
})
var InterceptorNavContent = React.createClass({
	getInitialState: function () {
		// body...
		return {prodName:'PRODUCT 1'}
	},
	stream:function (dat) {
		// body...
		//this.refs.sg.stream(dat)
	},
	render: function () {
		// body...
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:430, height:220}
		return (<div className='interceptorNavContent' style={wrapper}>
			<table className='noPadding'>
				<tbody><tr><td style={{width:40,background:'linear-gradient(80deg,black,black 47%,#818a90 51%,#818a90)'}}></td><td style={{height:75,background:'#818a90', width:330}}><div style={{display:'block', height:34, width:330}}>Product Info</div>
				<div style={{display:'block', height:34, width:330}}>{this.props.prodName}</div>
				</td><td style={{width:40,background:'linear-gradient(100deg,#818a90,#818a90 49%,black 53%,black)'}}></td></tr>
				<tr><td colSpan={3}>
				{this.props.children}
				
				</td></tr>
				</tbody>
			</table>
				</div>)
	}
})
var InterceptorDynamicViewV2 = React.createClass({
	update: function (siga, sigb) {
		// body...

		this.refs.tba.update(siga)
		this.refs.tbb.update(sigb)
	},
	onSens: function (e) {
		// body...
		this.props.onSens(e, 'Sens_A')
	},
	onSensB: function(e){
		this.props.onSens(e, 'Sens_B')
	},
	onSigA: function () {
		// body...
		this.props.onButton('sig_a')
	},
	onSigB: function () {
		// body...
		this.props.onButton('sig_b')
	},
	onRej:function () {
		// body...
		this.props.onButton('rej')
	},
	render: function () {
		// body...
			// body...
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}

		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		//linear-gradient(90deg, #362c66, rgba(128,128,128,0.5))
		return (
			<div style={{marginTop:2}}>
			<div style={{padding:10, borderRadius:20, border:'5px black solid', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'rgb(225,225,225)', boxShadow:'0px 0px 0px 10px #818a90'}}>
			<div className='interceptorDynamicView' style={{overflow:'hidden', display:'block', width:940, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10, border:'2px solid black'}}>
				<table  style={{borderSpacing:0,background:'linear-gradient(55deg,#818a90, #818a90 49.5%,black 50%, #362c66 50.5%, #362c66)'}}><tbody>
				<tr><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:36}}></div></td><td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:604}}><div style={{padding:10, display:'block', width:500,marginLeft:70,paddingLeft:20}}><TickerBox ref='tba'/></div></td></tr>
				
				<tr>
				<td style={{padding:0, height:160, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:160}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>sens</div><div style={contb}><KeyboardInputButton num={true} isEditable={true} value={this.props.sens[0]} onInput={this.onSens} inverted={false}/></div></div>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>signal</div><div style={contb}><KeyboardInputButton onClick={this.onSigA} isEditable={false} value={this.props.sig[0]} inverted={false}/></div></div>
					
				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:160}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:50}}><div><KeyboardInputButton  isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				<div style={{color:'rgb(225,225,225)'}}>rejects</div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:160}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton num={true} isEditable={true} value={this.props.sens[1]} onInput={this.onSensB} inverted={true}/></div><div style={labstylea}>sens</div></div>
					<div style={{position:'relative',marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton onClick={this.onSigB} isEditable={false} value={this.props.sig[1]} inverted={true}/></div><div style={labstylea}>signal</div></div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:604}}><div style={{padding:10, display:'block', width:500,marginLeft:-7,paddingLeft:20}}><TickerBox ref='tbb'/></div></td><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:36}}></div></td></tr>
				</tbody></table>
				
				</div>
				</div>
				</div>)
	}
})
var InterceptorDynamicView = React.createClass({
	render: function () {
		// body...
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'#e1e1e1', textAlign:'start'}

		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'#e1e1e1', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}

		return (
			<div>
			<div style={{padding:10, borderRadius:20, border:'2px black solid', borderBottom:'none', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'#e1e1e1', boxShadow:'0px 0px 0px 8px black'}}>
			<div className='interceptorDynamicView' style={{overflow:'hidden', display:'block', width:940, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10}}>
				<div></div><div style={{padding:10,borderRadius:10,background:'#362c66', display:'block', width:920,marginRight:-10,paddingRight:20}}><TickerBox ref='tbb'/></div>
				<table style={{borderSpacing:0}}><tbody><tr>
				<td style={{padding:0, height:160, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:156	,background:'#818a90', marginTop:4, borderTopLeftRadius:10}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>sens</div><div style={contb}><KeyboardInputButton isEditable={true} value={100} inverted={false}/></div></div>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>signal</div><div style={contb}><KeyboardInputButton isEditable={false} value={100} inverted={false}/></div></div>
					
				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:160, backgroundImage:'linear-gradient(to top right, #818a90, #818a90 49%,#e1e1e1 49%,#e1e1e1 51%,#362c66 51%, #362c66)'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:50}}><div><KeyboardInputButton isEditable={false} value={100} inverted={false}/></div>
				<div style={{color:'#e1e1e1'}}>rejects</div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:158, background:'#362c66', borderBottomRightRadius:10}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton isEditable={true} value={100} inverted={true}/></div><div style={labstylea}>sens</div></div>
					<div style={{position:'relative',marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton isEditable={false} value={100} inverted={true}/></div><div style={labstylea}>signal</div></div>
					
				</div>
				</td>
				</tr>
				</tbody></table>
				<div style={{padding:10,borderRadius:10,background:'#818a90', display:'block', width:920,marginLeft:-10,paddingLeft:20}}><TickerBox ref='tba'/></div>	
				</div>
				</div>
				</div>)
	}
})
var CircularButton = React.createClass({
	onClick: function () {
		// body...
		this.props.onClick();
	},
	render: function () {
		var bg = '#818a90'
		var gr = 'linear-gradient(90deg, #362c66, rgba(128,128,128,0.7))'
		if(this.props.inverted){
			gr = 'linear-gradient(90deg, rgba(128,128,128,0.7),#362c66)'
		}
		if(this.props.isTransparent){
			if(this.props.inverted){
				gr = 'linear-gradient(90deg, rgba(128,128,128,0.7),transparent)'
			}else{
				gr = 'linear-gradient(90deg, transparent, rgba(54,44,102,0.7))'
			}
		}
		// body...
		var style = {height:55,top:-6,left:-6}
		var divstyle = {overflow:'hidden',background:bg,height:50,width:50,borderRadius:25}
		console.log('render circle')
		if(this.props.inverted){
			return(<div style={{width:200,position:'relative',margin:10,height:50,overflow:'hidden', borderRadius:'27px 0px 0px 27px', background:gr, padding:3, marginLeft:'auto', marginRight:'auto'}}>
				<div className='cbDiv' style={divstyle}><button className='circleButton' style={style} onClick={this.onClick}/></div> 
				<div style={{display:'inline-block', position:'relative',top:-23,width:150}}>{this.props.lab}</div>
			</div>)
		}else{
			return(<div style={{width:200,position:'relative',margin:10,height:50,overflow:'hidden', borderRadius:'0px 27px 27px 0px', background:gr, padding:3, marginLeft:'auto', marginRight:'auto'}}>
				<div style={{display:'inline-block', position:'relative',top:-23,width:150}}>{this.props.lab}</div>
				<div className='cbDiv' style={divstyle}><button className='circleButton' style={style} onClick={this.onClick}/></div> 
			</div>)
		}
	}
})
var KeyboardInputButton = React.createClass({
	getInitialState: function () {
		// body...
		return {}
	},
	onInput: function (e) {
		// body...
		this.props.onInput(e)
	},
	onFocus: function () {
		// body...
		if(this.props.onFocus){
			this.props.onFocus()
		}
	},
	onRequestClose: function () {
		// body...
		if(this.props.onRequestClose){
			this.props.onRequestClose();
		}
	},
	editValue: function () {
		// body...
		var self = this;
		if(this.props.isEditable){
			setTimeout(function () {
				// body...
				self.refs.input.onFocus()
			},100)
			
		}else{
			this.props.onClick()
		}
		
	},
	render: function () {
		// body...
		var bgColor='rgba(200,200,200,1)'
		var boxShadow = '0px 0px 0px 50px '+bgColor

		var kb = <KeyboardInput onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} Style={{fontSize:25, textAlign:'center', width:100}} onInput={this.onInput} ref='input' value={this.props.value}/>
		if(!this.props.isEditable){
			kb = <label style={{fontSize:25, textAlign:'center', width:100, display:'inline-block', lineHeight:2}} onClick={this.editValue}>{this.props.value}</label>
		}

		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:0,backgroundColor:bgColor,borderRadius:25, height:46}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:126,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:25, height:46}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:46, backgroundColor:bgColor, zIndex:2}
   		return(<div className='keyboardInputButton' >
			<div className='round-bg'>

				<div className='pbContain' style={{left:10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='pbDiv' style={{position:'relative', paddingRight:5}}>
				<button className='playButtonInv' onClick={this.editValue}/>
				</div>
				</div>
				</div>)
		}else{


		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:94,backgroundColor:bgColor,borderRadius:25, height:46}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:-32,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:25, height:46}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:46, backgroundColor:bgColor, zIndex:2}
  		return(<div className='keyboardInputButton'>
			<div className='round-bg'>
				<div className='pbDiv'  style={{paddingLeft:5}}>
				<button className='playButton' onClick={this.editValue}/>
				</div>
				<div className='pbContain' style={{left:-10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
			</div>
			</div>)
		}
	}
})

var InterceptorCalibrateUI = React.createClass({
	getInitialState: function () {
		// body...
		return({phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'', tmpStrB:''})
	},
	componentWillReceiveProps: function (newProps) {
		// body...
	},
	onCalA: function () {
		// body...
		this.props.calibA()
	},
	onCalB: function () {
		// body...
		this.props.calibB()
	},
	calibrateAll:function () {
		// body...
		var self = this;
		this.props.calibA()
		setTimeout(function () {
			// body...
			self.props.calibB()
		},100)

	},
	onPhaseA: function (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	},
	onPhaseB: function (p) {
		// body...
		this.props.sendPacket('phaseEditb',p)
	},
	onModeA: function (m) {
		// body...
		console.log(['6087', m.target.value])
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	},
	onModeB: function (m) {
		// body...
		this.props.sendPacket('phaseModeb',parseInt(m.target.value))
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose:function () {
		// body...
		this.props.onRequestClose();
	},
	render:function () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']

		var opsA = modes.map(function (m,i) {
			// body...
			if(self.props.phase[1] == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
		var opsB = modes.map(function (m,i) {
			// body...
			if(self.props.phaseB[1] == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
		return	<div>
		<table style={{borderSpacing:0}}>
			<tbody>
				<tr>
					<td style={{width:340, background:'#818a90', textAlign:'center'}}>
						<div><label>Channel A</label></div>
						<div><KeyboardInputButton onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.phase[0]} onInput={this.onPhaseA} inverted={false}/></div>
						<div><div className='customSelect' style={{width:150}}><select onChange={this.onModeA}>{opsA}</select></div></div>
				
						<div><CircularButton lab={'Calibrate'} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
					</td>
					<td  style={{width:220,textAlign:'center', background:'linear-gradient(to top right, #818a90, #818a90 49%,black 49%,black 51%,#362c66 51%, #362c66)'}}>
						<button className='compassButton' onClick={this.calibrateAll}>Calibrate All</button>
					</td><td  style={{width:340, textAlign:'center', background:'#362c66'}}>
						<div><label>Channel B</label></div>
						<div><KeyboardInputButton  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.phaseB[0]} onInput={this.onPhaseB} inverted={true}/></div>
						<div><div className='customSelect' style={{width:150}}><select onChange={this.onModeB}>{opsB}</select></div></div>
				
						<div><CircularButton lab={'Calibrate'} isTransparent={true} inverted={true} onClick={this.onCalA}/></div>
					</td>
				</tr>
			</tbody>
		</table>
			
		</div>
	
		
	}
})

var StealthCalibrateUI = React.createClass({
	getInitialState: function () {
		// body...
		return({phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'' })
	},
	componentWillReceiveProps: function (newProps) {
		// body...
	},
	onCalA: function () {
		// body...
		this.props.calib()
	},

	onPhaseA: function (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	},

	onModeA: function (m) {
		// body...
		console.log(['6087', m.target.value])
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	},
	onFocus: function () {
		// body...
		this.props.onFocus();
	},
	onRequestClose:function () {
		// body...
		this.props.onRequestClose();
	},
	render:function () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']

		var opsA = modes.map(function (m,i) {
			// body...
			if(self.props.phase[1] == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
	
		return	<div>
		<table style={{borderSpacing:0}}>
			<tbody>
				<tr>
					<td style={{width:880, background:'#818a90', textAlign:'center'}}>
						<div><KeyboardInputButton onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.phase[0]} onInput={this.onPhaseA} inverted={false}/></div>
						<div><div className='customSelect' style={{width:150}}><select onChange={this.onModeA}>{opsA}</select></div></div>
				
						<div><CircularButton lab={'Calibrate'} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
					</td>
					
				</tr>
			</tbody>
		</table>
			
		</div>
	
		
	}
})

injectTapEventPlugin();
ReactDOM.render(<Container/>,document.getElementById('content'))

