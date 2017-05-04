var React = require('react');
var ReactDOM = require('react-dom')
import {ConcreteElem,CanvasElem,KeyboardInput,TreeNode} from './components.jsx';
var injectTapEventPlugin = require('react-tap-event-plugin')
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';
//import {createStore} from 'redux'




var TestSetupPage = React.createClass({
	getInitialState: function(){
		return({})
	},
	render:function(){
		return (<div>
		
	</div>)
	}

})


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
		
		socket.on('paramMsg', function(data) {
			self.onParamMsg(data.data,data.det) 
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
	},
	onNetpoll: function(e,d){
		////console.log([e,d])
		var nps = this.state.netpolls
		if(nps[d.ip]){
			if(nps[d.ip].length == 15){
				nps[d.ip].splice(-1,1);
		
			}
			if((e.net_poll_h == 'NET_POLL_PROD_REC_VAR')|| (e.net_poll_h == 'NET_POLL_PROD_SYS_VAR')){
				return;
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
	onParamMsg: function (e,d) {
		if(vdefByIp[d.ip]){
			
				if(this.refs[d.ip]){
					this.refs[d.ip].onParamMsg(e);
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
  						this.refs['mbu'+ind].onParamMsg(e,d);
  						}
  					}
  				}
  			
		
		if(this.refs.dv){
			this.refs.dv.onParamMsg(e,d)
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
								<td className="buttCell"><button onClick={this.showLogin} className={login}/></td>
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal'>
						{modalContent}
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

//Settings Page 
var SettingsDisplay = React.createClass({
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
		 sysRec:this.props.sysSettings, prodRec:this.props.prodSettings, mqls:mqls, font:font, data:this.props.data
		});
	},
	componentWillReceiveProps: function(newProps){
		this.setState({data:newProps.data})
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
	/*parseFRAM: function(fram){
		if(isDiff(fram, this.state.fram)){
			this.setState({fram:fram})
		}
	},*/
	componentDidMount: function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[102,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.dsp, data:buf.buffer})
	},

	sendPacket: function (n,v) {
		// body...
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
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
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
						//////console.log(n)
						arg2.push(v)
					}
					else{
						strArg=v
						
					}
				}else{
					////console.log(n['@rpcs']['apiwrite'][1][i])
				}
			}
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			var buf = new Uint8Array(packet);
			////console.log(buf)
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
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			var buf = new Uint8Array(packet);
			////console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}
	},
	activate: function (n) {
		// body...
		var list = this.props.combinedSettings[this.props.data[0]]
		for(var l in list){
			if(l!=n){
				if(this.refs[l]){
					////console.log(['972',l])
					this.refs[l].deactivate();
				}
			}
		}


	},
	render: function (){
		var self = this;
		var data = this.state.data
		////console.log(data)
		var lvl = data.length
		var handler = this.handleItemclick;
		var lab = 'Settings'
		////console.log(lvl)
		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
		}
		var nav =''
		var backBut = ''

		var catList = []
		//////console.log(['1030', combinedSettings])
		for(var cb in this.props.combinedSettings){
			catList.push(cb)
		}
	//	console.log(['1069',catList]	)
		//['Sensitivity', 'Calibration','Faults','Rej Setup', 'Test','Input','Output','Password','Other'];
		var accLevel = 0;
		var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej'}
		
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem ioBits={this.props.ioBits} path={this.state.data} ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[ct,this.props.combinedSettings[ct]]} onItemClick={handler} hasContent={true} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec}/>)
			}
			nav = nodes;
		}else if(lvl == 1 ){

			var cat = data[0];
			lab = cat//catMap[cat]['@translations']['english']
			if(accMap[cat]){
				accLevel = this.state.sysRec[accMap[cat]]
			}
			var list = this.props.combinedSettings[cat]
			////console.log(list)
			nodes = []
			////console.log(['1067',this.state])
			for (var l in list){
			
				nodes.push(<SettingItem ioBits={this.props.ioBits} path={self.state.data} ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={false} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec}/>)
			}
			nav = (<div className='setNav'>
					{nodes}
				</div>)

			backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Settings</label></div>)

		}else if(lvl == 2){
			////console.log(['lvl 2', data])
			if(data[1]){
				if(typeof data[1] == 'object'){
					////console.log(['1058',data])
					lab = data[2]//catMap[data[0]+'/'+data[2]]['@translations']['english']
					for(var d in data[1]){

						var nm = d
						if(vMap[d]){
							if(vMap[d]['@translations']['english']['name'] != ''){
								nm = vMap[d]['@translations']['english']['name']
							}
						}
						nodes.push(<SettingItem ioBits={this.props.ioBits} path={self.state.data} ip={self.props.dsp} ref={d} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={d} name={nm} 
							children={vMap[d]['children']} hasChild={false} data={this.props.combinedSettings[data[0]][data[2]][d]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={false} sysSettings={this.state.sysRec} prodSettings={this.state.prodRec}/>)
					}
				}
			}
			
		}else if(lvl == 3){
			////console.log(['1099', lvl])
			nodes = []
			lab = data[2]//catMap[data[0]+'/'+data[2]]['@translations']['english']
			for(var d in data[1]){

						var nm = d
						if(vMap[d]){
							if(vMap[d]['@translations']['english']['name'] != ''){
								nm = vMap[d]['@translations']['english']['name']
							}
						}
						nodes.push(<SettingItem ioBits={this.props.ioBits} path={self.state.data} ip={self.props.dsp} ref={d} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={d} name={nm} 
							children={vMap[d]['children']} hasChild={false} data={this.props.combinedSettings[data[0]][data[2]][d]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={false}  sysSettings={this.state.sysRec} prodSettings={this.state.prodRec}/>)
					}
				backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>{catMap[data[0]]['@translations']['english']}</label></div>)

			nav = (<div className='setNav'>
					{nodes}
				</div>)
		}
			 
	     var className = "menuCategory expanded";
	    
	    ////console.log(lab)
	    var label = lab
	    if(lvl == 1){
	    	label = catMap[data[0]]['@translations']['english']
	    }else if(lvl == 2){

	    }else if(lvl ==3){
	    	label = catMap[data[0]+'/'+data[2]]['@translations']['english']
	    }

	    var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center', fontSize:26, marginTop:-5}} >{backBut}<div style={tstl}>{label}</div></h2></span>
)
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

var SettingItem = React.createClass({
	getInitialState: function(){
		return({mode:0,font:this.props.font})
	},
	sendPacket: function(n,v){
		if(!isNaN(v)){
			////console.log(parseInt(v))	
		}
		this.props.sendPacket(n,v)
		
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		this.setState({font:newProps.font})
	},
	onItemClick: function(){
		if(this.props.hasChild || typeof this.props.data == 'object'){

			this.props.onItemClick(this.props.data, this.props.name)	
		}
		
	},
	activate: function () {
			this.props.activate(this.props.name)
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
								console.log(d)
								////console.log(['1205',self.props.sysSettings])
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
								console.log(d)
								////console.log(['1230',self.props.sysSettings])
								
								return self.props.sysSettings[d];
							}else{
								console.log(d)
								////console.log(['1233',self.props.prodSettings])
								
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
			//self = null;
			return val;
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
			if(this.props.path.length > 0){
				path = this.props.path[0]
				for(var i=1;i<this.props.path.length;i++){
					path = path + '/'+this.props.path[i]
				}
				path = path +'/'+ namestring;
			}else{
				path = namestring
			}
			
			if(typeof catMap[path] != 'undefined'){
				////console.log('1270')
				namestring = catMap[path]['@translations']['english']
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
			if(this.props.path.length > 0){
				path = this.props.path[0]
				for(var i=1;i<this.props.path.length;i++){
					path = path + '/'+this.props.path[i]
				}
				path = path +'/'+ namestring;
			}else{
				path = namestring
			}
			
			if(typeof catMap[path] != 'undefined'){
				////console.log('1298')
				namestring = catMap[path]['@translations']['english']
				////console.log('1300')
				
			}
				////console.log(['1195', this.props.name, this.props.data])
				return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{namestring}</label></div>)
			}else{
				val = [this.getValue(this.props.data['@data'], this.props.lkey)]
				////console.log(['1250',this.props.lkey, typeof this.props.data['@data']])
				////console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}

				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var ch in this.props.data['@children']){
						val.push(this.getValue(this.props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
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
				}else{

				}
				if(this.props.data['@children']){
					////console.log(['1346', this.props.data.children])
					for(var ch in this.props.data['@children']){
						val.push(this.getValue(this.props.data['@children'][ch], ch))
						if(typeof pVdef[0][ch] != 'undefined'){
							pram.push(pVdef[0][ch])
						}else if(typeof pVdef[1][ch] != 'undefined'){
							pram.push(pVdef[1][ch])
						}
					}
				}
				////console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}
			}
			
				var edctrl = <EditControl ioBits={this.props.ioBits} acc={this.props.acc} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={false} name={this.props.lkey}/>
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
	render: function(){
		console.log('render key input wrapper..	')
		return(<div style={this.props.Style}><KeyboardInput onInput={this.onInput} onChange={this.onChange} value={this.state.value} tid={this.props.tid} Style={this.props.Style} num={this.props.num}/></div>)
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
	render:function() {
		var namestring = this.props.name
	//	////console.log(['1548', namestring])
			if(typeof vMap[this.props.name] != 'undefined'){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
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
				////console.log(['1560',])
				
				val = _pVdef[6][self.props.param[i]["@labels"]]['english'][d]
				if((self.props.param[i]['@labels'] == 'InputSrc')){
					//console.log(['1582', self.props.param[i]['@labels']])
					if(self.props.ioBits[inputSrcArr[d]] == 0){
						st.color = 'grey'
					}
					//val = val + '*'
					
				}else if((self.props.param[i]['@labels'] == 'OutputSrc')){
					//console.log(['1582', self.props.param[i]['@labels']])
					if(self.props.ioBits[outputSrcArr[d]] == 0){
						st.color = 'grey'
					}
					//val = val + '*'
					
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
						return(<KeyboardInputWrapper tid={namestring+'_kia'} onInput={self.valChanged} Id={i} value={v} onKeyPress={self._handleKeyPress} num={num} Style={{width:self.props.vst.width, display:'inline-block'}}/>)
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
		if(typeof vMap[this.props.name] != 'undefined'){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
				}
			}
		if(this.props.data.length > 1){
			if(Array.isArray(this.props.data[0])){
				////console.log('1728')
				return (<NestedEditControl ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}else{
				////console.log('1732')
				return (<MultiEditControl ioBits={this.props.ioBits} acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
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
					return(
						<div>
						<div onClick={this.switchMode}>
							<label style={this.props.lvst}>{namestring + ': '}</label><label style={this.props.vst}> {dval}</label>
							</div>
							<div style={{marginLeft:this.props.lvst.width, width:this.props.vst.width}} className='customSelect'>
							<select onChange={this.valChangedl}>
							{options}
							</select>
							</div>
							</div>)

				}else{
					/*<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0]}></input>*/
					var input = (<KeyboardInput tid={namestring+'_ki'} onInput={this.valChanged} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} Style={{width:this.props.vst.width}}/>)//
					return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
						<div style={{marginLeft:250, display:'inline-block',width:200,marginRight:10}}>{input}</div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid grey',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	
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
		return({className:klass, show:false, override:false})
	},
	toggle: function () {
		var self = this;
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
			<div className='modal-x'>
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
	onParamMsg:function(e,d){
		if(this.refs[d.ip]){
			//////console.log(d)
			this.refs[d.ip].onParamMsg(e,d)
	
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
	onParamMsg: function(e){
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
   		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
  	    data = null
		var prodArray = [];
		var res = vdefByIp[this.props.unit.ip]
		for(var i = 0; i<((n-1)/2); i++){
			prodArray[i] = dv.getUint16(i*2 + 1);	
		}
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens', pVdef),getVal(prodArray,1,'PhaseMode', pVdef))
					
				}else{
					this.setProdVarsInt(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens_A', pVdef),getVal(prodArray, 1, 'Sens_B', pVdef),getVal(prodArray,1,'PhaseMode_A', pVdef),getVal(prodArray,1,'PhaseMode_B', pVdef))
					
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(getVal(prodArray,2,f, pVdef) != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(getVal(prodArray,2,'PhaseAngleAuto',pVdef),16),getVal(prodArray,2,'Peak',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.updateMeter(uintToInt(getVal(prodArray,2,'DetectSignal',pVdef),16))
					this.setLEDS(getVal(prodArray,2,'Reject_LED', pVdef),getVal(prodArray,2,'Prod_LED',pVdef),getVal(prodArray,2,'Prod_HI_LED',pVdef))
				}else{
					this.updateMeterInt(uintToInt(getVal(prodArray,2,'DetectSignal_A',pVdef),16),uintToInt(getVal(prodArray,2,'DetectSignal_B',pVdef),16))
					this.setDynInt(uintToInt(getVal(prodArray,2,'PhaseAngleAuto_A',pVdef),16),getVal(prodArray,2,'Peak_A',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray, uintToInt(getVal(prodArray,2,'PhaseAngleAuto_B',pVdef),16),getVal(prodArray,2,'Peak_B',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.setLEDSInt(getVal(prodArray,2,'Reject_LED_A', pVdef),getVal(prodArray,2,'Prod_LED_A',pVdef),getVal(prodArray,2,'Prod_HI_LED_A',pVdef),getVal(prodArray,2,'Reject_LED_B', pVdef),getVal(prodArray,2,'Prod_LED_B',pVdef),getVal(prodArray,2,'Prod_HI_LED_B',pVdef))
				}
				faultArray = null;
			}
		}
		msg = null;
		dv = null;
		prodArray = null;
		e = null;

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
	onParamMsg: function(e){
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
   		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
  	    data = null
		var prodArray = [];
		var res = vdefByIp[this.props.unit.ip]
		for(var i = 0; i<((n-1)/2); i++){
			prodArray[i] = dv.getUint16(i*2 + 1);	
		}
		dv = null;
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens', pVdef),getVal(prodArray,1,'PhaseMode', pVdef))
					
				}else{
					this.setProdVarsInt(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens_A', pVdef),getVal(prodArray, 1, 'Sens_B', pVdef),getVal(prodArray,1,'PhaseMode_A', pVdef),getVal(prodArray,1,'PhaseMode_B', pVdef))
					
				}
				

			}else if(lcd_type == 2){
				var faultArray = [];
				pVdef[7].forEach(function(f){
					if(getVal(prodArray,2,f, pVdef) != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(getVal(prodArray,2,'PhaseAngleAuto',pVdef),16),getVal(prodArray,2,'Peak',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.updateMeter(uintToInt(getVal(prodArray,2,'DetectSignal',pVdef),16))
					this.setLEDS(getVal(prodArray,2,'Reject_LED', pVdef),getVal(prodArray,2,'Prod_LED',pVdef),getVal(prodArray,2,'Prod_HI_LED',pVdef))
				}else{
					this.updateMeterInt(uintToInt(getVal(prodArray,2,'DetectSignal_A',pVdef),16),uintToInt(getVal(prodArray,2,'DetectSignal_B',pVdef),16))
					this.setDynInt(uintToInt(getVal(prodArray,2,'PhaseAngleAuto_A',pVdef),16),getVal(prodArray,2,'Peak_A',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray, uintToInt(getVal(prodArray,2,'PhaseAngleAuto_B',pVdef),16),getVal(prodArray,2,'Peak_B',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.setLEDSInt(getVal(prodArray,2,'Reject_LED_A', pVdef),getVal(prodArray,2,'Prod_LED_A',pVdef),getVal(prodArray,2,'Prod_HI_LED_A',pVdef),getVal(prodArray,2,'Reject_LED_B', pVdef),getVal(prodArray,2,'Prod_LED_B',pVdef),getVal(prodArray,2,'Prod_HI_LED_B',pVdef))
				}
			}
		}
		msg = null;
		prodArray = null;
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
		return {faultArray:[],currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, netpoll:this.props.netpolls, prodSettings:{}, sysSettings:{}, combinedSettings:[],
		minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, peak:0, rej:0, phase:0, interceptor:interceptor, ioBITs:{}, testRec:{}}
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
		this.setState({netpoll:newProps.netpolls})
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
		if(data[1] == 18){
			//prodList
			////console.log('prodList')
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
				this.refs.im.setState({prodList:dat})
				
			}

		}else if(data[1] == 24){
			////console.log(data)
		}
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
		this.setState({netpoll:nps})
		//this.setState()
		/*if(this.refs.np){
			this.refs.np.onNetpoll(e)
		}*/
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
		
		this.setState({minW:this.state.minMq.matches})
		
	},
	onParamMsg: function (e,d) {
		// body...
		
		if(this.props.det.ip != d.ip){
			return;
		}
		var sysSettings =  null;//this.state.sysSettings;
		var prodSettings = null;//this.state.prodSettings;
		var combinedSettings = null;
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
 		if(lcd_type== 0){
 			console.log(['2783', vdefByIp[d.ip][3]])
		
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
				var cVdf = vdefByIp[d.ip][3]
				var sysArray = [];
				for(var i = 0; i<((n-1)/2); i++){
					sysArray[i] = dv.getUint16(i*2 + 1);	
				}
				var sysRec = {}
    			Vdef["@params"].forEach(function(p){
    				if(p["@rec"] == 0){
    					var setting = getVal(sysArray, 0, p["@name"], pVdef)
    					sysRec[p["@name"]] = setting;
    				}
    			})
    			for(var p in Vdef["@deps"]){
    				if(Vdef["@deps"][p]["@rec"] == 0){
    					var setting = getVal(sysArray,5, p, pVdef)
    					sysRec[p] = setting;
    				}
    			}
    			sysSettings = sysRec;
    			var cob = {};
				for (var v in cVdf){
					if(!cob[v]){
						cob[v] = {}; 
					}
					for(var p in cVdf[v]){
						if(!cVdf[v][p].param){
							cob[v][p] = {};
							for(var t in cVdf[v][p]){
								//cob[v][p][t]
								var par =  cVdf[v][p][t].param

								if(par['@rec'] == 0){
									cob[v][p][t] = {'@data':sysSettings[par['@name']], '@children':{}}
								}else if(par['@rec'] == 1){
									cob[v][p][t] = {'@data':this.state.prodSettings[par['@name']], '@children':{}}
								}
								for(var c in cVdf[v][p][t].children){
									if(cVdf[v][p][t].children[c]['@rec'] == 0){
										cob[v][p][t]['@children'][c] = sysSettings[c]
									}else if(cVdf[v][p][t].children[c]['@rec'] == 1){
										cob[v][p][t]['@children'][c] = this.state.prodSettings[c]
									}
									
								}
							}
						}else{
							var par = cVdf[v][p].param
								if(par['@rec'] == 0){
									cob[v][p] = {'@data':sysSettings[par['@name']], '@children':{}}
								}else if(par['@rec'] == 1){
									cob[v][p] = {'@data':this.state.prodSettings[par['@name']], '@children':{}}
								}
								for(var c in cVdf[v][p].children){
									if(cVdf[v][p].children[c]['@rec'] == 0){
										cob[v][p]['@children'][c] = sysSettings[c]
									}else if(cVdf[v][p].children[c]['@rec'] == 1){
										cob[v][p]['@children'][c] = this.state.prodSettings[c]
									}
									
								}
						}
					}
				}
				combinedSettings = cob;
				cob = null;
    				if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, this.state.prodSettings)	
					}
					
					if(this.refs.im){
						this.refs.im.parseInfo(sysSettings, this.state.prodSettings)
					}	
				if(isDiff(sysSettings,this.state.sysSettings)){
					this.setState({sysSettings:sysSettings, combinedSettings:combinedSettings})
				}
    
    		}  
		}else if(lcd_type == 1){
			console.log('prod')
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
				var cVdf = vdefByIp[d.ip][3]
			
				var prodArray = [];
				for(var i = 0; i<((n-1)/2); i++){
					prodArray[i] = dv.getUint16(i*2 + 1);	
				}
				var prodRec = {}
    			Vdef["@params"].forEach(function(p){
    				if(p["@rec"] == 1){
    					var setting = getVal(prodArray, 1,p["@name"], pVdef)
    					prodRec[p["@name"]] = setting;
    				}
    			})
   				for(var p in Vdef["@deps"]){
   					if(Vdef["@deps"][p]["@rec"] == 1){
    					var setting = getVal(prodArray,5, p, pVdef)
    					prodRec[p] = setting;
    				}
    			}
				prodSettings = prodRec;
				var phaseMode = prodSettings['PhaseMode']
				var phaseSpeed = Vdef['@labels']['PhaseSpeed']['english'][prodSettings['PhaseSpeed']]
				var cob = {};
				for (var v in cVdf){
					if(!cob[v]){
						cob[v] = {}; 
					}
					for(var p in cVdf[v]){
						if(!cVdf[v][p].param){
							cob[v][p] = {};
							for(var t in cVdf[v][p]){
								//cob[v][p][t]
								var par =  cVdf[v][p][t].param

								if(par['@rec'] == 0){
									cob[v][p][t] = {'@data':this.state.sysSettings[par['@name']], '@children':{}}
								}else if(par['@rec'] == 1){
									cob[v][p][t] = {'@data':prodSettings[par['@name']], '@children':{}}
								}
								for(var c in cVdf[v][p][t].children){
									if(cVdf[v][p][t].children[c]['@rec'] == 0){
										cob[v][p][t]['@children'][c] = this.state.sysSettings[c]
									}else if(cVdf[v][p][t].children[c]['@rec'] == 1){
										cob[v][p][t]['@children'][c] = prodSettings[c]
									}
									
								}
							}
						}else{
							var par = cVdf[v][p].param
								if(par['@rec'] == 0){
									cob[v][p] = {'@data':this.state.sysSettings[par['@name']], '@children':{}}
								}else if(par['@rec'] == 1){
									cob[v][p] = {'@data':prodSettings[par['@name']], '@children':{}}
								}
								for(var c in cVdf[v][p].children){
									if(cVdf[v][p].children[c]['@rec'] == 0){
										cob[v][p]['@children'][c] = this.state.sysSettings[c]
									}else if(cVdf[v][p].children[c]['@rec'] == 1){
										cob[v][p]['@children'][c] = prodSettings[c]
									}
									
								}
						}
					}
				}

				combinedSettings = cob;
				cob = null;
				////console.log('combined settings here:')
				//////console.log(comb)
					if(this.refs.sd){
						this.refs.sd.parseInfo(this.state.sysSettings, prodSettings)	
					}
					if(this.refs.im){
						this.refs.im.parseInfo(this.state.sysSettings, prodSettings)
					}
					if(isDiff(prodSettings,this.state.prodSettings)){
					this.setState({prodSettings:prodSettings, combinedSettings:combinedSettings})
				}else{
					console.log('redundant pr')
				}
				//this.setState({sysSettings})
			}			
		}else if(lcd_type==2){
			if(vdefByIp[d.ip])
			{

				var Vdef = vdefByIp[d.ip][0]
				var nVdf = vdefByIp[d.ip][2]
				var pVdef = vdefByIp[d.ip][1]
				var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 2){
    						var setting = getVal(prodArray, 2,p["@name"], pVdef)
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 2){
    						var setting = getVal(prodArray,5, p, pVdef)
    						prodRec[p] = setting;
    					}
    				}
					if(_ioBits){
    						var iobits = {}
    						_ioBits.forEach(function(b){
    							if(typeof prodRec[b] != 'undefined'){
    								iobits[b] = prodRec[b]
    							}
    						})
    						if(isDiff(iobits,this.state.ioBITs)){
    							this.setState({ioBITs:iobits})
    						}
    					}
    				//console.log(['2958',prodRec])
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
					

					//	if(this.state.currentView == 'MainDisplay'){
							/*if((this.refs.dm.state.peak !=pka)||(this.refs.dm.state.rpeak != rpka)||(this.refs.dm.state.xpeak != xpka)||(this.refs.dm.state.rej != rej)||(this.refs.dm.state.phase != phaseA)||(this.refs.dm.state.peakb !=pkb)||(this.refs.dm.state.rpeakb != rpkb)||(this.refs.dm.state.xpeakb != xpkb)||(this.refs.dm.state.phaseb != phaseB)||(this.refs.dm.state.phaseFast != phaseSpeedA)||(this.refs.dm.state.phaseFastB != phaseSpeedB)){
								console.log('render det main info')
								this.refs.dm.setState({peak:pka,peakb:pkb,rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB})
							}*/
							if((this.refs.im.state.peak !=pka)||(this.refs.im.state.rpeak != rpka)||(this.refs.im.state.xpeak != xpka)||(this.refs.im.state.rej != rej)||(this.refs.im.state.phase != phaseA)||(this.refs.im.state.peakb !=pkb)||(this.refs.im.state.rpeakb != rpkb)||(this.refs.im.state.xpeakb != xpkb)||(this.refs.im.state.phaseb != phaseB)||(this.refs.im.state.phaseFast != phaseSpeedA)||(this.refs.im.state.phaseFastB != phaseSpeedB)){
								console.log('render InterceptorMainPageUI info')
								this.refs.im.setState({peak:pka,peakb:pkb,rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB,phaseFast:phaseSpeedA,phaseFastB:phaseSpeedB})
								
							}
							this.refs.im.update(siga,sigb)
					//	}
					/*	if(this.refs.lv){
							this.refs.lv.update(siga,sigb)
							this.setLEDSInt(prodRec['Reject_LED_A'],prodRec['Prod_LED_A'],prodRec['Prod_HI_LED_A'],prodRec['Reject_LED_B'],prodRec['Prod_LED_B'],prodRec['Prod_HI_LED_B'])


  						}
  						if(this.refs.dg){
  						//	this.refs.dg.stream({t:Date.now(),val:siga, valb:sigb})
  						}*/
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
					//////console.log(phase)
					var phaseSpeed = prodRec['PhaseFastBit'];
					var rpeak = prodRec['ProdPeakR']
					var xpeak = prodRec['ProdPeakX']
					//if(this.state.currentView == 'MainDisplay'){
					/*	if((this.refs.dm.state.peak !=peak)||(this.refs.dm.state.rpeak != rpeak)||(this.refs.dm.state.xpeak != xpeak)||(this.refs.dm.state.rej != rej)||(this.refs.dm.state.phase != phase)){
						
							this.refs.dm.setState({peak:peak, rej:rej, phase:phase, phaseFast:phaseSpeed, rpeak:rpeak, xpeak:xpeak})
						
						}
						
					}
					if(this.refs.lv){
						this.refs.lv.update(sig)	
						//////console.log('3147')
						this.setLEDS(prodRec['Reject_LED'],prodRec['Prod_LED'],prodRec['Prod_HI_LED'])
					}
					
				if(this.refs.dg){
  						this.refs.dg.stream({t:Date.now(),val:sig})
  					}
  				}*/
  				var faultArray = [];
					pVdef[7].forEach(function(f){
					if(getVal(prodArray,2,f,pVdef) != 0){
						faultArray.push(f)
						}
					});
  					if(this.state.faultArray.length != faultArray.length){
  						this.setState({faultArray:faultArray})
  					}else{
  						var diff = false;
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								diff = true;
  							}
  						})
  						if(diff){
  							this.setState({faultArray:faultArray})
  							}
  						}
  						faultArray = null;	
  					//}
				}
			}
			

   		}else if(lcd_type == 3){
   			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var nVdf = vdefByIp[d.ip][2]
				var pVdef = vdefByIp[d.ip][1]
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 3){
    						var setting = getVal(prodArray, 3,p["@name"],pVdef)
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 3){
    						var setting = getVal(prodArray,5, p, pVdef)
    						prodRec[p] = setting;
    					}
    				}
				}
   		}else if(lcd_type == 4){
   			console.log('test rec')
   			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var nVdf = vdefByIp[d.ip][2]
				var pVdef = vdefByIp[d.ip][1]
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var testRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 4){
    						var setting = getVal(prodArray, 4,p["@name"],pVdef)
    						testRec[p["@name"]] = setting;
    					}
    				})
    				console.log(testRec)
    				if(isDiff(testRec, this.state.testRec)){
    					this.setState({testRec:testRec})
    				}
    				testRec = null;

				}

   		}

   		data = null;
   		msg = null;
   		dv = null;
   		prodArray = null;
   		prodRec = null;	
   		sysRec = null;
   		Vdef = null;
   		cVdf = null;
   		pVdef = null;
   		faultArray = null;	
   		e = null;
   		d = null;
   		combinedSettings = null;
   		//prodSettings = null;
   		//sysSettings = null;

   		
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
		//////console.log([pled_a, det_a,pled_b,det_b])
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	},
	showSettings: function () {
		console.log('show settings')
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';

			this.setState({currentView:currentView, stack:[], data:[], settings:false})

			this.refs.sModal.toggle();
		}
		else{
		//	this.refs.sModal.toggle();
			this.setState({settings:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);

			this.refs.sModal.toggle();
		}
	},
	logoClick: function () {
		this.props.logoClick();
	},
	goBack: function () {
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			setTimeout(this.setState({currentView:d[0], data: d[1], stack: stack, setttings:(d[0] == 'SettingsDisplay') }),100);
			
		}
	},
	changeView: function (d) {
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
		////console.log(['2976',d[1]])
		this.setState({currentView:d[0], data:d[1]})
	},
	settingClick: function (s,n) {
		var set = this.state.data.slice(0)
		////console.log(['set', s,n])
		if(Array.isArray(s)){
			set.push(s[0])
			//set.push(n)
		}else{
			set.push(s)
			set.push(n)
		}
		
		this.changeView(['SettingsDisplay',set]);
	},
	clear: function (param) {
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	sendPacket: function (n,v) {
		////console.log([n,v])
		if(typeof n == 'string'){
			if(n== 'Sens_A'){
			var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)],[1]);
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			}else if(n == 'Sens'){
			////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)]);
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
		}else if(n == 'Sens_B'){
			////console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)],[0]);
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
		}else if(n == 'ProdNo'){
			var packet = dsp_rpc_paylod_for(0x13,[0x8, parseInt(v)]);
			////console.log(packet)
			var buf = new Uint8Array(packet)
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			}else if(n == 'ProdName'){
			////console.log(v)
			var str = (v + "                    ").slice(0,20)
			////console.log(str)
			var packet = dsp_rpc_paylod_for(0x13,[0x2a],str);
			////console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		}else if(n == 'cal'){
			var packet = dsp_rpc_paylod_for(0x13, [0x1e,1],v)
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n == 'getProdList'){
			var packet = dsp_rpc_paylod_for(0x13, [0x12])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n =='getProdName'){
			var packet = dsp_rpc_paylod_for(0x13, [24,parseInt(v)])
				var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n=='refresh'){
			var packet = dsp_rpc_paylod_for(19,[102,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	
		}else if(n=='rpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[480,0,0],[1])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[480,0,0],[1])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='rpeakb'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[480,0,0],[0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeakb'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[480,0,0],[0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='phaseEdit'){
			var phase = Math.round(parseFloat(v)*100)
			var packet = dsp_rpc_paylod_for(19,[48,phase,0])
			if(this.props.det.interceptor){
				packet = dsp_rpc_paylod_for(19,[48,phase,0],[1])
			}
				var buf = new Uint8Array(packet);
			
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='phaseEditb'){
			var phase = Math.round(parseFloat(v)*100)
			var packet = dsp_rpc_paylod_for(19,[48,phase,0],[0])
				var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='test'){
			var packet = dsp_rpc_paylod_for(19,[32,v,0]);
			var buf = new Uint8Array(packet);
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
			this.setState({currentView:currentView, stack:[], data:[], settings:false})

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
	 	var lstyle = {height: 72,marginRight: 20}
	 	var np = (<NetPollView ref='np' eventCount={15} events={this.state.netpoll}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		
			SD = (<SettingsDisplay ioBits={this.state.ioBITs} goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor} combinedSettings={this.state.combinedSettings}/>)
	
		
			MD = ""; /*(<div style={{margin:5, marginTop:-15}}>
					<table className='mainContTable'><tbody><tr><td className='defCont'>{dm}
					</td><td style={{width:380}} className='defCont'>{dg}
					</td></tr>
					</tbody></table>
					<div className='prefInterface' style={{height:160, minHeight:160}}>{np}</div>
					<div>{ce}</div>
					</div>)*/
		
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
				MD = (<div><div className='prefInterface' >{dm}</div>
					<div className='prefInterface' >{dg} </div>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
			}	
		}
		var ov = 0
		if(this.state.testRec['TestRecOnFlag']){
			ov = 1;
		}
		
		var testprompt = this.renderTest();
		return(<div>
			<div hidden>
				{lmtable}
			</div>
				<InterceptorMainPageUI toggleConfig={this.showSettings} netpoll={this.state.netpoll} clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} gohome={this.logoClick} ref='im'/>
				<Modal ref='sModal' onClose={this.settingsClosed}>
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
				</div>)
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
		var events = this.props.events.map(function(e){
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
		// body...
		return (<div>
			<label style={{display: 'inline-block',fontSize:26,width:100,float:'left',paddingLeft: 20}}>Events</label>
			<div style={{display:'inline-block', overflowY:'scroll', height:260,width:600	}}>
			<table className='npTable'><tbody>
			{events}
			</tbody></table>
			</div>

		</div>)
	}
})
var DetMainInfo = React.createClass({
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

		return({rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', prodList:[], phaseFast:0, phaseFastB:0, pVdef:pVdef})
	},
	componentDidMount: function(){
		this.sendPacket('refresh','')
	},
	clearRej: function () {
		// body...
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	},
	switchProd: function (p) {
		// body...
		this.props.sendPacket('ProdNo',p)
	},
	sendPacket: function (n,v) {
		// body...
		this.props.sendPacket(n,v)
	},
	getProdName: function (num) {
		// body...
		this.props.sendPacket('getProdName',99)
	},
	clearPeak: function () {
		// body...
		var p = 'Peak'
		if(this.props.int){
			p = 'Peak_A'
		}
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	},
	clearPeakB: function () {
		// body...
		var p = 'Peak'
		if(this.props.int){
			p = 'Peak_B'
		}
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
		param = null;
	},
	calibrate: function () {
		this.refs.calbModal.toggle()
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
		this.props.sendPacket('getProdList')
		this.refs.pedit.toggle()
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
	render: function () {
			
		//////console.log('render here')
		var self = this;
		var padding = {paddingLeft:10}
		var tdstyle = {paddingLeft:10, background:'linear-gradient(135deg, rgba(128, 128, 128, 0.3), transparent 67%)', width:200}
		var tdstylest = {paddingLeft:10, background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))', width:400}
		
		var tdstyleintA = {paddingLeft:10, background:'linear-gradient(315deg, transparent 33%, rgba(128,0,128,0.4))', width:200}
		var tdstyleintB = {paddingRight:10, background:'linear-gradient(135deg, rgba(0,128,128,0.4),transparent 67%', width:200}
		var list = ['dry', 'wet', 'DSA']
		var headingStyle = {textAlign:'right',background:'linear-gradient(to right, transparent, transparent 33%, rgba(128, 128, 128, 0.3)'}
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
		var tab = (
		<table className='dtmiTab'>
			<tbody>

				<tr><td style={headingStyle}>Name</td><td colSpan={2} style={tdstylest}>{this.props.det.name}</td></tr>
				<tr onClick={this.showEditor}><td style={headingStyle}>Product</td><td colSpan={2} style={tdstylest}>{this.state.prodRec['ProdName']}</td></tr>
				<tr><td style={headingStyle}>Sensitivity</td><td colSpan={2} style={tdstylest}><KeyboardInputWrapper Style={{fontSize:26, textAlign:'center', width:'100%'}}  Id='sens' tid='sens' num={true} onKeyPress={this._handleKeyPress} onInput ={this.updateTmp} value={this.state.tmp}/>
</td></tr>
				<tr><td style={headingStyle}>Signal</td><td colSpan={2} style={tdstylest} onClick={this.clearPeak}>{this.state.peak}</td></tr>
				<tr><td style={headingStyle}>Phase</td><td colSpan={2} style={tdstylest} >{this.state.phase + ' ' + list[this.state.prodRec['PhaseMode']]}</td></tr>
				<tr><td style={headingStyle}>Rejects</td><td colSpan={2} style={tdstylest} onClick={this.clearRej}>{this.state.rej}</td></tr>
			
				<tr><td></td><td style={tdstyle} onClick={this.calibrate}>Calibrate </td><td onClick={this.setTest} style={tdstyle}>Test</td>
				</tr>		
			</tbody>
		</table>)
		var CB = 	<CalibInterface int={this.props.int} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.calB} calibA={this.calA} phase={[this.state.phase, this.state.prodRec['PhaseMode'], ps]} phaseA={[this.state.phaseb]} peaks={[this.state.rpeak,this.state.xpeak]}ref='ci'/>
						
		if(this.props.int){
			tab = (<table className='dtmiTab'>
				<tbody>
				<tr onClick={this.showEditor}><td style={headingStyle}>Product</td><td colSpan={2} style={tdstyleintA}>{this.state.prodRec['ProdName']}</td></tr>
				<tr><td style={headingStyle}>Sensitivity</td><td style={tdstyleintA}><KeyboardInputWrapper  Style={{fontSize:26, textAlign:'center', width:'100%'}} Id='sens' tid='sens' num={true} onKeyPress={this._handleKeyPress} onInput ={this.updateTmp} value={this.state.tmp}/></td><td style={tdstyleintB}><KeyboardInputWrapper  Style={{fontSize:26, textAlign:'center', width:'100%'}} Id='sens' tid='sens' num={true} onKeyPress={this._handleKeyPress} onInput ={this.updateTmpB} value={this.state.tmpB}/></td></tr>
				<tr><td style={headingStyle}>Signal</td><td style={tdstyleintA} onClick={this.clearPeak}>{this.state.peak}</td><td style={tdstyleintB} onClick={this.clearPeakB}>{this.state.peakb}</td></tr>
				<tr><td style={headingStyle}>Phase</td><td style={tdstyleintA} onClick={this.calibrate}>{this.state.phase + ' ' + list[this.state.prodRec['PhaseMode_A']]}</td>
				<td style={tdstyleintB}>{this.state.phaseb + ' ' + list[this.state.prodRec['PhaseMode_B']]}</td></tr>
				<tr><td style={headingStyle}>Rejects</td><td colSpan={2} style={tdstyleintA} onClick={this.clearRej}>{this.state.rej}</td></tr>
	
				<tr><td></td><td  onClick={this.calibrate} style={tdstyle}><span>Calibrate</span> </td><td onClick={this.setTest} style={tdstyle}><span>Test</span></td></tr>		
			</tbody>
				</table>)
			ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_A']]
			var psb = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed_B']]
			if(this.state.phaseFast == 1){
				ps = 'fast'
			}
			if(this.state.phaseFastB == 1){
				psb = 'fast'
			}	
			CB = <CalibInterface int={this.props.int} sendPacket={this.sendPacket} refresh={this.refresh} calib={this.calB} calibA={this.calA} phase={[this.state.phase, this.state.prodRec['PhaseMode_A'], ps]} phaseB={[this.state.phaseb, this.state.prodRec['PhaseMode_B'], psb]} peaks={[this.state.rpeak,this.state.xpeak, this.state.rpeakb,this.state.xpeakb]}ref='ci'/>
			
		}
		var prodList = this.state.prodList.map(function(p){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}

			return (<ProductItem selected={sel} p={p} switchProd={self.switchProd}/>)
		})
		return (<div className='detInfo'>
						{tab}
							<Modal ref='pedit'>
							{prodList}
						</Modal>
						<Modal ref='sensEdit'>
							<div>Sensitivity: <KeyboardInput onFocus={this.sensFocus} onRequestClose={this.sensClose} tid='sens' num={true} onKeyPress={this._handleKeyPress} onInput ={this.updateTmp} value={this.state.tmp}/>
							<button onClick={this.submitTmpSns}>OK</button><button onClick={this.cancel}>Cancel</button></div>
						</Modal>
						<Modal ref='testModal'>
							<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
						</Modal>
						<Modal ref='calbModal'>
						{CB}
						</Modal>
					</div>)
	}
})
var ProductItem = React.createClass({
	switchProd:function () {
		this.props.switchProd(this.props.p)
	},
	render: function () {
		// body...
		var st = {color:'grey'}
		if(this.props.selected){
			st = {color:'green'}
		}
		return (<div onClick={this.switchProd}><label style={st}>{'Product '+this.props.p}</label></div>)
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
		var packet = dsp_rpc_paylod_for(19,[608,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.props.toggle()
	},
	testMan2:function () {
		var packet = dsp_rpc_paylod_for(19,[610,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.props.toggle()
	},
	testHalo:function () {
		var packet = dsp_rpc_paylod_for(19,[604,0,0])
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		this.nextProps.toggle()
	},
	testHalo2:function () {
		var packet = dsp_rpc_paylod_for(19,[606,0,0])
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

			//return(<tr><td style={{marginRight:10, width:100, display:'inline-block'}}>Metal:<select >{metDrop}</select></td><td>Count:{mc.count}</td></tr>)
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
		return({width:375, height:260, mqls:mqls})
	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[3].matches){
			this.setState({width:375})
		}else if(this.state.mqls[2].matches){
			this.setState({width:558})
		}else if(this.state.mqls[1].matches){
			this.setState({width:375})
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

		return({rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0, sysRec:{},prodRec:{}, tmp:'', tmpB:'', prodList:[], phaseFast:0, phaseFastB:0, pVdef:pVdef})
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
		this.sendPacket('refresh','')
	},
	clearRej: function () {
		// body...
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	},
	switchProd: function (p) {
		// body...
		this.props.sendPacket('ProdNo',p)
	},
	getProdName: function (num) {
		// body...
		this.props.sendPacket('getProdName',99)
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
		this.props.sendPacket('getProdList')
		this.refs.pedit.toggle()
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
				this.toggleTestModal()
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
		}
	},
	onSens: function (e,s) {
		// body...
		this.props.sendPacket(s,e);
	},
	render:function () {
		// body...
		var home = 'home'
		var style = {background:'#764399', width:'100%',display:'block'}
		var lstyle = {height: 56,marginRight: 20}
		var self = this;
		var prodList = this.state.prodList.map(function(p){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}

			return (<ProductItem selected={sel} p={p} switchProd={self.switchProd}/>)
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
				{prodList}
				</Modal>
				<Modal ref='calibModal'>
				{CB}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll}/>
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
					<div style={{background:'#764399', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton lab={'Config'} onClick={this.onConfig}/>
					<CircularButton lab={'Test'} onClick={this.onTest}/>
					<CircularButton lab={'Log'} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:430, height:220, borderBottom:'20px solid grey',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<InterceptorNavContent ref='nv' prodName={this.props.prodName}><SlimGraph int={true} ref='sg' canvasId={'sgcanvas2'}/>	</InterceptorNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#764399', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
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
		var style = {width:345,height:220,background:'white',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:430, height:220}
		return (<div className='interceptorNavContent' style={wrapper}>
			<table className='noPadding'>
				<tbody><tr><td style={{width:40,background:'linear-gradient(80deg,black,black 47%,grey 51%,grey)'}}></td><td style={{height:75,background:'grey', width:330}}><div style={{display:'block', height:34, width:330}}>Product Info</div>
				<div style={{display:'block', height:34, width:330}}>{this.props.prodName}</div>
				</td><td style={{width:40,background:'linear-gradient(100deg,grey,grey 49%,black 53%,black)'}}></td></tr>
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
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'white', textAlign:'start'}

		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'white', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		//linear-gradient(90deg, #764399, rgba(128,128,128,0.5))
		return (
			<div style={{marginTop:2}}>
			<div style={{padding:10, borderRadius:20, border:'5px black solid', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'white', boxShadow:'0px 0px 0px 10px grey'}}>
			<div className='interceptorDynamicView' style={{overflow:'hidden', display:'block', width:940, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10, border:'2px solid black'}}>
				<table  style={{borderSpacing:0,background:'linear-gradient(55deg,grey, grey 49.5%,black 50%, #764399 50.5%, #764399)'}}><tbody>
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
				<div style={{color:'white'}}>rejects</div>
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
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'white', textAlign:'start'}

		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'white', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}

		return (
			<div>
			<div style={{padding:10, borderRadius:20, border:'2px black solid', borderBottom:'none', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'white', boxShadow:'0px 0px 0px 8px black'}}>
			<div className='interceptorDynamicView' style={{overflow:'hidden', display:'block', width:940, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10}}>
				<div></div><div style={{padding:10,borderRadius:10,background:'#764399', display:'block', width:920,marginRight:-10,paddingRight:20}}><TickerBox ref='tbb'/></div>
				<table style={{borderSpacing:0}}><tbody><tr>
				<td style={{padding:0, height:160, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:156	,background:'grey', marginTop:4, borderTopLeftRadius:10}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>sens</div><div style={contb}><KeyboardInputButton isEditable={true} value={100} inverted={false}/></div></div>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={labstyleb}>signal</div><div style={contb}><KeyboardInputButton isEditable={false} value={100} inverted={false}/></div></div>
					
				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:160, backgroundImage:'linear-gradient(to top right, grey, grey 49%,white 49%,white 51%,#764399 51%, #764399)'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:50}}><div><KeyboardInputButton isEditable={false} value={100} inverted={false}/></div>
				<div style={{color:'white'}}>rejects</div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:160, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:158, background:'#764399', borderBottomRightRadius:10}}>
					<div style={{position:'relative', marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton isEditable={true} value={100} inverted={true}/></div><div style={labstylea}>sens</div></div>
					<div style={{position:'relative',marginTop:8, marginBottom:7}}><div style={conta}><KeyboardInputButton isEditable={false} value={100} inverted={true}/></div><div style={labstylea}>signal</div></div>
					
				</div>
				</td>
				</tr>
				</tbody></table>
				<div style={{padding:10,borderRadius:10,background:'grey', display:'block', width:920,marginLeft:-10,paddingLeft:20}}><TickerBox ref='tba'/></div>	
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
		// body...
		var style = {height:55,top:-6,left:-6}
		var divstyle = {overflow:'hidden',background:'grey',height:50,width:50,borderRadius:25}
		console.log('render circle')
		if(this.props.inverted){
			return(<div style={{width:200,position:'relative',margin:10,height:50,overflow:'hidden', borderRadius:'27px 0px 0px 27px', background:'linear-gradient(90deg, rgba(128,128,128,0.7),#764399)', padding:3, marginLeft:'auto', marginRight:'auto'}}>
				<div className='cbDiv' style={divstyle}><button className='circleButton' style={style} onClick={this.onClick}/></div> 
				<div style={{display:'inline-block', position:'relative',top:-23,width:150}}>{this.props.lab}</div>
			</div>)
		}else{
			return(<div style={{width:200,position:'relative',margin:10,height:50,overflow:'hidden', borderRadius:'0px 27px 27px 0px', background:'linear-gradient(90deg, #764399, rgba(128,128,128,0.7))', padding:3, marginLeft:'auto', marginRight:'auto'}}>
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

		var kb = <KeyboardInput num={this.props.num} Style={{fontSize:25, textAlign:'center', width:100}} onInput={this.onInput} ref='input' value={this.props.value}/>
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
   /* width: 44px;
    left: 83px;
    background: grey;
    border-radius: 20px;}*/
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


injectTapEventPlugin();
ReactDOM.render(<Container/>,document.getElementById('content'))

