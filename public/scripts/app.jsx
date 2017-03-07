var React = require('react');
var ReactDOM = require('react-dom')
import {ConcreteElem,CanvasElem,KeyboardInput,TreeNode} from './components.jsx';
var injectTapEventPlugin = require('react-tap-event-plugin')
var onClickOutside = require('react-onclickoutside')
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
		return ({currentPage:'landing', curIndex:0, minMq:minMq, minW:minMq.matches, mq:mq, brPoint:mq.matches, 
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:0,
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
			//console.log(['73',m])
			self.onNetpoll(m.data, m.det)
		})
		socket.on('prefs', function(f) {
			console.log(f)
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
			if(e.length == 1){

			}
			e.forEach(function(d){
				macs.push(d.mac)
				dets[d.mac] = d;
				if(macs.indexOf(d.mac) == -1){
					macs.push(d.mac)
					dets[d.mac] = d
				}
				console.log(d)
				socket.emit('vdefReq', d.ip);
			})
			console.log(dets)
			self.state.mbunits.forEach(function(u){
				u.banks.forEach(function(b) {
					dets[b.mac] = null;
				})
			})
			self.setState({dets:e, detL:dets, macList:macs})
		});
		
		socket.on('paramMsg', function(data) {
			self.onParamMsg(data.data,data.det) 
		})
		socket.on('rpcMsg', function (data) {
			self.onRMsg(data.data, data.det)
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
		console.log([e,d])
		if(this.refs.dv){
			this.refs.dv.onNetpoll(e,d)
		}
	},
	onRMsg: function (e,d) {
		console.log([e,d])
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
		console.log(u)
		this.setState({curDet:u, currentPage:'detector'})
	},
	addNewMBUnit:function () {
		this.setState({curModal:'newMB', tmpMB:{name:'NEW', type:'mb', banks:[]}})
	}, 
	addNewSingleUnit: function () {
		this.setState({curModal:'newSingle', tmpMB:{name:'NEW', type:'single', banks:[]}})
	},
	addMBUnit: function (mb) {
		var mbunits = this.state.mbunits
		mbunits.push(mb)
		this.setState({mbunits:mbunits})
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
		cont.push(dsps[e])
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
		console.log(['268', 'cancel'])
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
			console.log(ind)
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
			var	nameEdit = (<KeyboardInput onChange={this.changetMBName} tid='mbtname' value={MB.name}/>)
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
		return (<DetectorView br={this.state.brPoint} ref='dv' acc={this.state.level} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip}/>)
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
	render: function () {
		var cont;
		if(this.state.currentPage == 'landing'){
			console.log('here')
			cont = this.renderLanding();
		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
		}else if(this.state.currentPage == 'userSetup'){
			cont = this.renderAccounts();
		}
		return (<div>
			<Modal ref='logIn'>
				<LogInControl level={this.state.level} userName={this.state.curUser}/>
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
		console.log(e)
		if(typeof e == 'string'){

			this.setState({userName:e})
		}else if(e.target){
			if(e.target.value){
				this.setState({userName:e.target.value})
			}
		}
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
					<tr><td>Username:</td><td><KeyboardInput onChange={this.userNameChange} tid='username' value={this.state.userName}/></td></tr>
					<tr><td>Password:</td><td><KeyboardInput onChange={this.passwordChange} tid='password' value={this.state.password}/></td></tr>
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
			st = <StatBarInt ref='st'/>
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
		 sysRec:sysSettings, prodRec:prodSettings, mqls:mqls, font:font, fram:framSettings, data:this.props.data
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
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			this.setState({sysRec:sys, prodRec:prd})
		}
	},
	parseFRAM: function(fram){
		if(isDiff(fram, this.state.fram)){
			this.setState({fram:fram})
		}
	},
	componentDidMount: function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.dsp, data:buf.buffer})
	},

	sendPacket: function (n,v) {
		// body...
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
			console.log(buf)
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
						//console.log(n)
						arg2.push(v)
					}
					else{
						strArg=v
						
					}
				}else{
					console.log(n['@rpcs']['apiwrite'][1][i])
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
			console.log(buf)
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
			console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}
	},
	activate: function (n) {
		// body...
		var list = combinedSettings[this.props.data[0]]
		for(var l in list){
			if(l!=n){
				if(this.refs[l]){
					console.log(['972',l])
					this.refs[l].deactivate();
				}
			}
		}


	},
	render: function (){
		var self = this;
		var data = this.state.data
		console.log(data)
		var lvl = data.length
		var handler = this.handleItemclick;
		var lab = 'Settings'
		console.log(lvl)
		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
		}
		var nav =''
		var backBut = ''
		var catList = ['Sensitivity', 'Calibration','Faults','Rej Setup', 'Test','Input','Output','Password','Other'];
		var accLevel = 0;
		var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej','Test':'PassAccTest'}
		
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={true} data={[ct,combinedSettings[ct]]} onItemClick={handler} hasContent={true}/>)
			}
			nav = nodes;
		}else if(lvl == 1 ){

			var cat = data[0];
			lab = cat
			if(accMap[cat]){
				accLevel = this.state.sysRec[accMap[cat]]
			}
			var list = combinedSettings[cat]
			console.log(list)
			nodes = []
			if(cat === 'Test'){
				//console.log(combinedSettings['TestConfig'])
				//nodes.push(<div><label>Placeholder for TestConfig</label></div>)

			}
			for (var l in list){
				if(Array.isArray(list[l])){
					console.log('1019 - ' + l)
					if(list[l].length == 2 ){
						nodes.push((<SettingItem ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={true}/>))
	
					}else{
						nodes.push((<SettingItem ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={true}/>))
					}
					
				}else if(list[l]['Type'] === 'confObj'){
					console.log(['conf obj', list[l]])
					 nodes.push((<SettingItem ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={true} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={true}/>))
	

				}else{


				nodes.push(<SettingItem ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={false}/>)
				}
			}
			nav = (<div className='setNav'>
					{nodes}
				</div>)

			backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Settings</label></div>)

		}else if(lvl == 2){
			console.log(['lvl 2', data])
			if(data[1]){
				if(data[1].Type == 'confObj'){
				nodes = [];
				if(accMap[data[0]]){
					accLevel = this.state.sysRec[accMap[data[0]]]
				}
				var testSel = ['Manual', 'Halo', 'Manual2', 'Halo2']
					
				lab = testSel[data[1]['Index']]
				for(var d in data[1]){
					console.log(['1056', d,data[1][d],combinedSettings])
					if((d !== 'Type')&&(d !== 'Index')){
						var nm = d + data[1]['Index']
						if(Array.isArray(data[1][d])){
							nm = d + data[1]['Index'] + '_'
						}
						nodes.push(<SettingItem ip={self.props.dsp} ref={nm} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={nm} name={d} hasChild={false} data={combinedSettings[data[0]][lab][d]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel} int={false}/>)

					}
				}
				nav = (<div className='setNav'>
					{nodes}
				</div>)
					//lab = testSel[data[1]['Index']]

				backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Test</label></div>)

				}
			}
			
		}
			 
	     var className = "menuCategory expanded";
	    
	    console.log(lab)
	    var tstl = {display:'inline-block', textAlign:'center'}
	    var titlediv = (<span ><h2 style={{textAlign:'center'}} >{backBut}<div style={tstl}>{lab}</div></h2></span>
)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:30}} >{backBut}<div style={tstl}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24}} >{backBut}<div style={tstl}>{lab}</div></h2></span>)
	    }
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
			console.log(parseInt(v))	
		}
		this.props.sendPacket(n,v)
		
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		this.setState({font:newProps.font})
	},
	onItemClick: function(){
		if(this.props.hasChild){
			this.props.onItemClick(this.props.data)	
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
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
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
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
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
	render: function(){
		var ft = [14,16,20];
		var wd = [190,210,260]
		var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
		var vst = {display:'inline-block', fontSize:ft[this.state.font], width:150}
		var self = this;
			var res = vdefByIp[this.props.ip];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
			var label = false;
		if(this.props.hasChild){
		return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{this.props.name}</label></div>)
		}else{
			var val, pram;
			//if(this.props.isArray)
			if(Array.isArray(this.props.data)){
				if((this.props.data.length == 2) &&((typeof pVdef[0][this.props.lkey+'_A'] != 'undefined')||(typeof pVdef[1][this.props.lkey+'_A'] != 'undefined'))){
					val = [this.getValue(this.props.data[0],this.props.lkey + '_A'), this.getValue(this.props.data[1],this.props.lkey + '_B')]
					if(typeof pVdef[0][this.props.name+'_A'] != 'undefined'){
						pram = [pVdef[0][this.props.lkey+'_A'],pVdef[0][this.props.lkey+'_B']]
					}else{
						pram = [pVdef[1][this.props.lkey+'_A'],pVdef[1][this.props.lkey+'_B']]
					}
					if(pram[0]['@labels']){
						label = true
					}
				}else if(Array.isArray(this.props.data[0])){
					val = []
					pram = []

					this.props.data.forEach(function(d,i){
						val[i] = []
						pram[i] = []
						d.forEach(function(dat,j){
							val[i][j] = self.getValue(dat, self.props.lkey+i+'_'+j)
							if(typeof pVdef[0][self.props.lkey+i+'_'+j] != 'undefined'){
								pram[i][j] = pVdef[0][self.props.lkey+i+'_'+j]
							}else{
								pram[i][j] = pVdef[1][self.props.lkey+i+'_'+j]
							}
						})
					})
					if(pram[0][0]['@labels']){
						label = true
					}
				}else{
					console.log(['1231', self.props.lkey, this.props.data])
					val = []
					pram = []
					this.props.data.forEach(function(d,i){
						val[i] = self.getValue(d,self.props.lkey+i)
						if(typeof pVdef[0][self.props.lkey+i] != 'undefined'){
							pram[i] = pVdef[0][self.props.lkey+i]
						}else{
							pram[i] = pVdef[1][self.props.lkey+i]
						}
					})
					if(pram[0]['@labels']){
						label = true
					}
				}
			}else{


				val = [this.getValue(this.props.data, this.props.lkey)]
				console.log(['1250',this.props.lkey, typeof this.props.data])
				console.log(['1251', pVdef, pram])
				if(typeof pVdef[0][this.props.lkey] != 'undefined'){
					pram = [pVdef[0][this.props.lkey]]
				}else if(typeof pVdef[1][this.props.lkey] != 'undefined'){
					pram = [pVdef[1][this.props.lkey]]
				}else{

				}
				console.log(['1252',pram])
				if(pram[0]['@labels']){
					label = true
				}
			}
			
				var edctrl = <EditControl acc={this.props.acc} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label} int={this.props.int} name={this.props.name}/>
				return (<div className='sItem'> {edctrl}
					</div>)
			
		}
	}
})
var KeyboardInputWrapper = React.createClass({
	onChange: function(e){
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
		this.props.onInput(e, this.props.Id)
	},		
	render: function(){

		return(<div style={this.props.Style}><KeyboardInput onInput={this.onInput} onChange={this.onChange} value={this.props.value} tid={this.props.tid} Style={this.props.Style} num={this.props.num}/></div>)
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
			console.log('line 1264')
			var rows = this.state.val.map(function(r,i){
			var conts = r.map(function (v,j) {
					// body...
			if(self.props.label){

				return(<SelectForMulti val={v} index={i} index2={j} onChange={self.selectChanged} list={_pVdef[5][self.props.param[0][0]["@labels"]]['english']}/>)
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
			//console.log(val)
			this.props.sendPacket(this.props.param[i], parseInt(val));
		var value = this.state.val;
		value[i] = v// e.target.value
		console.log(this.props.data)
		this.setState({val:value})
	},
	valChanged: function(v,i){
		var val = v
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;	
		console.log(['1404',v,i])
		value[i] = val;
		this.setState({val:value})
		if(!Number.isNaN(val)){
			this.props.sendPacket(this.props.param[i], parseInt(val));
		}
	},
	render:function() {
		var namestring = this.props.name
			if(vMap[this.props.name]){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
				}
			}
		var self = this;
		var vLabels = this.state.val.map(function(d,i){
			var val = d;
			if(self.props.label){
				val = _pVdef[5][self.props.param[i]["@labels"]]['english'][d]
			}
			return (<label style={self.props.vst}>{val}</label>)
		})
		/*return (
			<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{this.props.data[0]}</label><label style={this.props.vst}>{this.props.data[1]}</label></div>
						<div style={{marginLeft:250,display:'inline-block',width:150,marginRight:10}}>{inputA}</div><div style={{display:'inline-block',width:150,marginRight:10}}>{inputB}</div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid grey',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	*/
		if(this.state.mode == 0){
				//return <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{valA}</label><label style={this.props.vst}>{valB}</label></div>
					return(<div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label>{vLabels}</div>)

		}else{
			if(this.props.label){
				var options = this.state.val.map(function(v, i){
					var opts = _pVdef[5][self.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i == v){
							return (<option selected value={i}>{e}</option>)

						}else{
							return (<option value={i}>{e}</option>)

						}
					})
					//return <select>{opts}</select>
					return <SelectForMulti val={v} index={i} onChange={self.selectChanged} list={_pVdef[5][self.props.param[0]["@labels"]]['english']}/>
				})
				return(<div><div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label>{vLabels}</div>
					<div>
						{options}
					</div></div>)
			}else{
				var num = true;
				var options = this.state.val.map(function(v,i){
					return(<KeyboardInputWrapper tid={namestring+'_kia'} onInput={self.valChanged} Id={i} value={v} onKeyPress={self._handleKeyPress} num={num} Style={{width:150, display:'inline-block'}}/>)
				})
				return(<div><div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label>{vLabels}</div>
					<div>
						{options}
					</div></div>)
			}
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
		return <select onChange={this.onChange}>{opts}</select>
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
		console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedl: function(e){
		
		var val = e.target.value//e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			//console.log(val)
			this.props.sendPacket(this.props.param[0], parseInt(val));
		var value = this.state.val;
		value[0] = e.target.value
		console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedb: function(e){
		console.log(e)
		var val = e;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
		var value = this.state.val;
		value[1] = e
		console.log(this.props.data)
		this.setState({val:value})
	},
	valChangedlb: function(e){
	//	console.log(e)
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(parseInt(val))
		}
			this.props.sendPacket(this.props.param[1], parseInt(val));
		var value = this.state.val;
		value[1] = e.target.value
		console.log(this.props.data)
		this.setState({val:value})
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({size:newProps.size, val:newProps.data.slice(0)})
	},
	deactivate:function () {
		// body...
		if(this.refs.ed){
			console.log(['1511', 'this the prob'])
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
		var style = {display:'inline-block',fontSize:20}
		if(this.state.size == 1){
			style = {display:'inline-block',fontSize:16}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:14}
		}
		var namestring = this.props.name;
		if(namestring.indexOf('INPUT_')!= -1){
			console.log(namestring)
			namestring = namestring.slice(6);
		}else if(namestring.indexOf('OUT_')!=-1){
			namestring = namestring.slice(4)
		}
		if(namestring.indexOf('PHY_')!= -1){
			namestring = namestring.slice(4)
		}
		if((namestring.indexOf('ProductName')!=-1)||((namestring.indexOf('ProductName')!=-1))){
			num = false
		}
		if(vMap[this.props.name]){
				if(vMap[this.props.name]['@translations']['english']['name'] != ''){
					namestring = vMap[this.props.name]['@translations']['english']['name']
				}
			}
		if(this.props.data.length > 1){
			if(Array.isArray(this.props.data[0])){
				return (<NestedEditControl acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}else if(this.props.data.length == 2){
				//this.props.int block
			}else{
				return (<MultiEditControl acc={this.props.acc} activate={this.props.activate} ref='ed' vst={this.props.vst} 
					lvst={this.props.lvst} param={this.props.param} size={this.props.size} sendPacket={this.props.sendPacket} data={this.props.data} label={this.props.label} int={this.props.int} name={this.props.name}/>)
			}	
		}
		if(this.props.int){

			var valA = this.props.data[0];
			var valB = this.props.data[1];
			if(this.props.label){
				valA = _pVdef[5][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
				//console.log(_pVdef[5][this.props.param[0]["@labels"]]['english'])
				valB = _pVdef[5][this.props.param[1]["@labels"]]['english'][this.props.data[1]]
				console.log([this.props.param,this.props.data,valA,valB])
			}

			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{valA}</label><label style={this.props.vst}>{valB}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					var selectedb = this.state.val[1];
					console.log(selected)
					
					var optionsA = _pVdef[5][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
					var optionsB = _pVdef[5][this.props.param[0]["@labels"]]['english'].map(function(e,i){
						if(i==selectedb){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
					return(
							<div>
							<div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ': '}</label><label style={this.props.vst}>{valA}</label><label style={this.props.vst}>{valB}</label></div>
							<div className='customSelect' style={{marginLeft:250, width:150}}>
							<select onChange={this.valChangedl}>
							{optionsA}
							</select>
							</div>
							<div className='customSelect'>
							<select onChange={this.valChangedlb}>
							{optionsB}
							</select>

							</div>
							</div>)

				}else{
				 ////	
			var inputA =  (<KeyboardInput tid={namestring+'_kia'} onInput={this.valChanged} value={this.state.val[0]} onKeyPress={this._handleKeyPress} num={num} Style={{width:150}}/>) 
			var inputB =  (<KeyboardInput tid={namestring+'_kib'} onInput={this.valChangedb} value={this.state.val[1]} onKeyPress={this._handleKeyPress} num={num} Style={{width:150}}/>) 
			
			  //	<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0].toString()}/>
					return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{this.props.data[0]}</label><label style={this.props.vst}>{this.props.data[1]}</label></div>
						<div style={{marginLeft:250,display:'inline-block',width:150,marginRight:10}}>{inputA}</div><div style={{display:'inline-block',width:150,marginRight:10}}>{inputB}</div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid grey',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	
			}
		}

		}else{


		var dval = this.props.data[0]
		if(this.props.label){
			dval=_pVdef[5][this.props.param[0]["@labels"]]['english'][this.props.data[0]]
		}
		
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val[0];
					console.log(selected)
					var options = _pVdef[5][this.props.param[0]["@labels"]]['english'].map(function(e,i){
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
							<div style={{marginLeft:250}} className='customSelect'>
							<select onChange={this.valChangedl}>
							{options}
							</select>
							</div>
							</div>)

				}else{
					/*<input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val[0]}></input>*/
					var input = (<KeyboardInput tid={namestring+'_ki'} onInput={this.valChanged} value={this.state.val[0].toString()} num={num} onKeyPress={this._handleKeyPress} Style={{width:150}}/>)//
					return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
						<div style={{marginLeft:250, display:'inline-block',width:200,marginRight:10}}>{input}</div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid grey',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	
			}
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
		console.log('rendering st')
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
		console.log('rendering int')
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
			<TickerBox ref='ta' int={true}/>
			<TickerBox ref='tb' int={true}/>
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
		return({className:klass, show:false})
	},
	toggle: function () {
		this.setState({show:!this.state.show})
	},
	render: function () {
		var cont = '';
		if(this.state.show){
				cont = (<ModalCont toggle={this.toggle}>
			{this.props.children}
		</ModalCont>)
		}
		return(<div className={this.state.className} hidden={!this.state.show}>
			{cont}
	</div>)
	}
})
var ModalCont = onClickOutside(React.createClass({
	toggle: function(){
		this.props.toggle();
	},
	handleClickOutside: function(e){
		this.props.toggle();	
	},
	render: function(){
				return (<div className='modal-outer' >
				<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
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
			console.log(dat)
		}
		return ({banks:dat})
	},
	onRMsg: function (e,d) {
		// body...
		if(this.refs[d.ip]){
			console.log(d)
			this.refs[d.ip].onRMsg(e,d)
	
		}
	},
	onParamMsg:function(e,d){
		if(this.refs[d.ip]){
			//console.log(d)
			this.refs[d.ip].onParamMsg(e,d)
	
		}
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({banks:nextProps.data})
	},
	switchUnit: function (u) {
		// body...
		console.log('switch mb')
		this.props.onSelect(u)
	},
	render: function (argument) {
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			console.log(b)
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
		var interceptor = (this.props.unit.board_id == 4)
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
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
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
			this.setState({rpcResp:true})	
		}		

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
				pVdef[6].forEach(function(f){
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
		dv = null;
		prodArray = null;
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
			console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			console.log(klass)
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
		var interceptor = (this.props.unit.board_id == 4)
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
		//console.log([a,b])
		this.refs.lv.update(a,b)	
	},
	onRMsg: function (e,d) {
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
				pVdef[6].forEach(function(f){
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
		prodArray = null;
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
				var packet = dsp_rpc_paylod_for(19,[556,0,0])
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
		return (<div>
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
			console.log(this.props.index)
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
		var interceptor = (this.props.det.board_id == 4);
		return {faultArray:[],currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, netpoll:[],
		minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, peak:0, rej:0, phase:0, interceptor:interceptor}
	},
	componentDidMount: function () {
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})
	},
	componentWillReceiveProps: function (newProps) {
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})
	},
	toggleAttention: function () {
		this.refs.fModal.toggle();
	},
	onRMsg:function (e,d) {
		// body...
		//console.log([e,d])
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
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
			if(this.refs.dm){
				console.log(dat)
				this.refs.dm.setState({prodList:dat})
			}

		}else if(data[1] == 24){
			console.log(data)
		}
	},
	onNetpoll: function(e,d){
		if(this.props.det.ip != d.ip){
			return;	
		}
		console.log(['2600',e])
		var nps = this.state.netpoll
		if(nps.length == 15){
			nps.splice(0,1);
		}
		nps.push(e);
		this.setState({netpoll:nps})
		//this.setState()
		/*if(this.refs.np){
			this.refs.np.onNetpoll(e)
		}*/
	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[2].matches){
			console.log(1)
		}else if(this.state.mqls[1].matches){
			console.log(2)
		}else if(this.state.mqls[0].matches){
			console.log(3)
		}else{
			console.log(4)
		}
		
		this.setState({minW:this.state.minMq.matches})
		
	},
	onParamMsg: function (e,d) {
		// body...
		
		if(this.props.det.ip != d.ip){
			return;
		}
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
 
   	 	if(lcd_type== 0){
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
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
    					var setting = getVal(sysArray,4, p, pVdef)
    					sysRec[p] = setting;
    				}
    			}
    			sysSettings = sysRec;
    			if(this.state.currentView == "SettingsDisplay"){
					if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, prodSettings)	
					}
				}else{
					if(this.refs.dm){
						this.refs.dm.parseInfo(sysSettings, prodSettings)
					}	
				}
    
    		}
		}else if(lcd_type == 1){
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
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
    					var setting = getVal(prodArray,4, p, pVdef)
    					prodRec[p] = setting;
    				}
    			}
				prodSettings = prodRec;
				var phaseMode = prodSettings['PhaseMode']
				var phaseSpeed = Vdef['@labels']['PhaseSpeed']['english'][prodSettings['PhaseSpeed']]
				var comb = [];
				for(var c in nVdf){

					if(c != 'TestConfig'){
					if(!comb[c]){
						comb[c] = {};
					
					}
					for(var p in nVdf[c][0]){
						comb[c][p] = []
						var a,b;
						//console.log(p)
						//console.log
						if(nVdf[c][0][p]['A']){
						if(nVdf[c][0][p]['A']['@rec'] == 0){
							a = sysSettings[p+'_A']
							b = sysSettings[p+'_B']
						}else{
							a = prodSettings[p+'_A']
							b = prodSettings[p+'_B']

						}
						comb[c][p].push(a)
						comb[c][p].push(b)
						}else if(Array.isArray(nVdf[c][0][p])){
						//	console.log('2345')
							//console.log(nVdf[c][0][p])
								comb[c][p] = [];
								
							nVdf[c][0][p].forEach(function(par, j){
								if(Array.isArray(par)){
									//console.log('line 2349')
									console.log(par)
									comb[c][p][j] = [];
									par.forEach(function(para, k){
										if(para['@rec'] ==0){
											comb[c][p][j][k] = sysSettings[para['@name']]
	
										}else{
											comb[c][p][j][k] = prodSettings[para['@name']]
											
										}
										
									})
								}else{
									if(par['@rec'] == 0){

										comb[c][p][j] = sysSettings[par['@name']]
									
									}else{
										comb[c][p][j] = prodSettings[par['@name']]
										
									}
								}

							})
						}
					}
					for(var i = 1; i < nVdf[c].length; i++){
						if(nVdf[c][i]['@rec'] == 0){
							comb[c][nVdf[c][i]["@name"]] = sysSettings[nVdf[c][i]["@name"]]
						}else{
							comb[c][nVdf[c][i]["@name"]] = prodSettings[nVdf[c][i]["@name"]]
						}
						//nVdf[c][0]
						}
					}else{
						if(!comb['Test']){
							comb['Test'] = {}
						}
							var testSel = ['Manual', 'Halo', 'Manual2', 'Halo2']
							nVdf[c].forEach(function(conf, i){
								console.log(['2608',i, conf,])
								var co = {'Type':'confObj', 'Index':i}
								co['TestConfigAck'] = prodSettings[conf['TestConfigAck']['@name']];
								co['TestConfigHaloMode'] = prodSettings[conf['TestConfigHaloMode']['@name']]
								co['TestConfigMetal'] = [];
								co['TestConfigCount'] = [];
								conf['TestConfigMetal'].forEach(function(m,i){
									co['TestConfigMetal'][i] = prodSettings[m['@name']];
								})
								
								conf['TestConfigCount'].forEach(function(m,i){
									co['TestConfigCount'][i] = prodSettings[m['@name']];
								})
								//
								//prodSettings[conf]
								comb['Test'][testSel[i]] =  co//{'TestConfigAck':prodSettings[conf['TestConfigAck']['@name']],
						//	}
							})

						
						
					}
				}
				combinedSettings = comb;
				console.log('combined settings here:')
				console.log(comb)
				if(this.state.currentView == "SettingsDisplay"){
					if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, prodSettings)	
					}
				}else{
					if(this.refs.dm){
						this.refs.dm.parseInfo(sysSettings, prodSettings)
					}
				}
			}			
		}else if(lcd_type==2){
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
    					if(p["@rec"] == 2){
    						var setting = getVal(prodArray, 2,p["@name"], pVdef)
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 2){
    						var setting = getVal(prodArray,4, p, pVdef)
    						prodRec[p] = setting;
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
					

						if(this.state.currentView == 'MainDisplay'){
							if((this.refs.dm.state.peak !=pka)||(this.refs.dm.state.rpeak != rpka)||(this.refs.dm.state.xpeak != xpka)||(this.refs.dm.state.rej != rej)||(this.refs.dm.state.phase != phaseA)
								||(this.refs.dm.state.peakb !=pkb)||(this.refs.dm.state.rpeakb != rpkb)||(this.refs.dm.state.xpeakb != xpkb)||(this.refs.dm.state.phaseb != phaseB)){
								
								this.refs.dm.setState({peak:pka,peakb:pkb,rpeak:rpka,rpeakb:rpkb,xpeak:xpka,xpeakb:xpkb,rej:rej,phase:phaseA,phaseb:phaseB})
							}
						}
						if(this.refs.lv){
							this.refs.lv.update(siga,sigb)
							this.setLEDSInt(prodRec['Reject_LED_A'],prodRec['Prod_LED_A'],prodRec['Prod_HI_LED_A'],prodRec['Reject_LED_B'],prodRec['Prod_LED_B'],prodRec['Prod_HI_LED_B'])


  						}
  						if(this.refs.dg){
  							this.refs.dg.stream({t:Date.now(),val:siga, valb:sigb})
  						}


					}else{
					var peak = prodRec['Peak']
					var rej = prodRec['RejCount']
					var sig = uintToInt(prodRec['DetectSignal'],16)
					var phase = (uintToInt(prodRec['PhaseAngleAuto'],16)/100).toFixed(2)
					//console.log(phase)
					var phaseSpeed = prodRec['PhaseFastBit'];
					var rpeak = prodRec['ProdPeakR']
					var xpeak = prodRec['ProdPeakX']
					if(this.state.currentView == 'MainDisplay'){
						if((this.refs.dm.state.peak !=peak)||(this.refs.dm.state.rpeak != rpeak)||(this.refs.dm.state.xpeak != xpeak)||(this.refs.dm.state.rej != rej)||(this.refs.dm.state.phase != phase)){
						
							this.refs.dm.setState({peak:peak, rej:rej, phase:phase, phaseFast:phaseSpeed, rpeak:rpeak, xpeak:xpeak})
						
						}
					}
					if(this.refs.lv){
						this.refs.lv.update(sig)	
						this.setLEDS(prodRec['Reject_LED'],prodRec['Prod_LED'],prodRec['Prod_HI_LED'])
  					}
  					if(this.refs.dg){
  						this.refs.dg.stream({t:Date.now(),val:sig})
  					}
  				}
  				var faultArray = [];
					pVdef[6].forEach(function(f){
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
    						var setting = getVal(prodArray,4, p, pVdef)
    						prodRec[p] = setting;
    					}
    				}
				}
   		}
   		data = null;
   		dv = null;
   		prodArray = null;

   		
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
		//console.log([pled_a, det_a,pled_b,det_b])
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	},
	showSettings: function () {
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false})
		}
		else{
			this.setState({settings:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
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
		this.setState({currentView:d[0], data:d[1]})
	},
	settingClick: function (s) {
		var set = this.state.data.slice(0)
		console.log(['set', s])
		if(Array.isArray(s)){
			set.push(s[0])
		}else{
			set.push(s)
		}
		
		this.changeView(['SettingsDisplay',set]);
	},
	clear: function (param) {
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1],param['@rpcs']['clear'][2] ) 
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	sendPacket: function (n,v) {
		console.log([n,v])
		if(typeof n == 'string'){
			if(n== 'Sens_A'){
				var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)]);
			console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			}else if(n == 'Sens'){
			console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)]);
			console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			
		}else if(n == 'ProdNo'){
			var packet = dsp_rpc_paylod_for(0x13,[0x8, parseInt(v)]);
			console.log(packet)
			var buf = new Uint8Array(packet)
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			}else if(n == 'ProdName'){
			console.log(v)
			var str = (v + "                    ").slice(0,20)
			console.log(str)
			var packet = dsp_rpc_paylod_for(0x13,[0x2a],str);
			console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		}else if(n == 'cal'){
			var packet = dsp_rpc_paylod_for(0x13, [0x1e,1])
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
			var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	
		}else if(n=='rpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[474,0,0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[474,0,0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='phaseEdit'){
			var phase = Math.round(parseFloat(v)*100)
			var packet = dsp_rpc_paylod_for(19,[48,phase,0])
				var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		
		}else if(n=='tet'){
			var packet = dsp_rpc_paylod_for(19,[32,0,0]);
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
			console.log(buf)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		
		}
		}
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
		var dm = <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm' int={this.state.interceptor}/>
		var dg = <DummyGraph ref='dg' canvasId={'dummyCanvas'} int={this.state.interceptor}/>
		var ce =''// <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'} int={this.state.interceptor}/>
	 	var lstyle = {height: 72,marginRight: 20}
		var np = (<NetPollView ref='np' eventCount={15} events={this.state.netpoll}/>)

		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		if(this.state.settings){
			SD = (<SettingsDisplay goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip} int={this.state.interceptor}/>)
	
		}else{
			MD = (<div style={{margin:5}}>
					<table className='mainContTable'><tbody><tr><td className='defCont'>{dm}
					</td><td style={{width:400}} className='defCont'>{dg}
					</td></tr></tbody></table>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
		}
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
	
		return(<div>
				{lmtable}
				{MD}
				{SD}
				<Modal ref='fModal'>
					<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
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
			events.splice(0,1);
		}
		events.push(e);
		this.setState({events:events})
	},
	dummyEvent: function () {
		// body...
		//this.pushEvent({string:(new Date(Date.now())).toUTCString() + 'Reject - dummy'})
	},
	render:function () {
		var events = this.props.events.map(function(e){
			return (<tr><td>{e.string}</td></tr>)
		})
		// body...
		return (<div>
			<label onClick={this.dummyEvent}>Events Log</label>
			<table className='npTable'><tbody>
			{events}
			</tbody></table>

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
		
		return({rpeak:0,rpeakb:0,xpeakb:0,xpeak:0, peak:0,peakb:0,phase:0, phaseb:0,rej:0, sysRec:{},prodRec:{}, tmp:'', prodList:[], phaseFast:0, phaseFastB:0, pVdef:pVdef})
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
	},
	calibrate: function () {
		this.refs.calbModal.toggle()
	},
	parseInfo: function(sys, prd){
		console.log('parseInfo')
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			console.log([sys,prd])
			this.setState({sysRec:sys, prodRec:prd})
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
		this.refs.testModal.toggle()
	},
	updateTmp:function (e) {
		//e.preventDefault();
		if(typeof e == 'string'){
			this.setState({tmp:e})
		}else{
			this.setState({tmp:e.target.value})	
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
	refresh: function () {
		this.props.sendPacket('refresh')
	},
	cancel:function () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	},
	cal: function () {
		this.props.sendPacket('cal')
	},
	_handleKeyPress: function (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	},
	render: function () {
			
		console.log('render here')
		var self = this;
		var tdstyle = {paddingLeft:10}
		var list = ['dry', 'wet', 'DSA']
		var ps = this.state.pVdef[5]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
		var tab = (
		<table className='dtmiTab'>
			<tbody>
				<tr><td>Name</td><td style={tdstyle}>{this.props.det.name}</td></tr>
				<tr onClick={this.showEditor}><td>Product</td><td style={tdstyle}>{this.state.prodRec['ProdName']}</td></tr>
				<tr onClick={this.editSens}><td>Sensitivity</td><td style={tdstyle}>{this.state.prodRec['Sens']}</td></tr>
				<tr><td>Signal</td><td style={tdstyle} onClick={this.clearPeak}>{this.state.peak}</td></tr>
				<tr><td>Rejects</td><td style={tdstyle} onClick={this.clearRej}>{this.state.rej}</td></tr>
				<tr><td>Phase</td><td style={tdstyle} onClick={this.calibrate}>{this.state.phase + ' ' + list[this.state.prodRec['PhaseMode']]}</td></tr>
				<tr><td>Test</td><td style={tdstyle}><input type='text'></input> <button onClick={this.setTest}>Test</button></td>
				</tr>		
			</tbody>
		</table>)
		if(this.props.int){
			tab = (<table className='dtmiTab'>
				<tbody>
				<tr onClick={this.showEditor}><td>Product</td><td style={tdstyle}>{this.state.prodRec['ProdName']}</td></tr>
				<tr onClick={this.editSens}><td>Sensitivity</td><td style={tdstyle}>{this.state.prodRec['Sens_A']}</td><td>{this.state.prodRec['Sens_B']}</td></tr>
				<tr><td>Signal</td><td style={tdstyle} onClick={this.clearPeak}>{this.state.peak}</td><td style={tdstyle} onClick={this.clearPeakB}>{this.state.peakb}</td></tr>
				<tr><td>Rejects</td><td style={tdstyle} onClick={this.clearRej}>{this.state.rej}</td></tr>
				<tr><td>Phase</td><td style={tdstyle} onClick={this.calibrate}>{this.state.phase + ' ' + list[this.state.prodRec['PhaseMode_A']]}</td>
				<td>{this.state.phaseb + ' ' + list[this.state.prodRec['PhaseMode_B']]}</td></tr>
				<tr><td>Test</td><td style={tdstyle}><button onClick={this.setTest}>Test</button></td>
				</tr>		
			</tbody>
				</table>)
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
							<div>Sensitivity: <KeyboardInput tid='sens' num={true} onKeyPress={this._handleKeyPress} onInput ={this.updateTmp} value={this.state.tmp}/>
							<button onClick={this.submitTmpSns}>OK</button><button onClick={this.cancel}>Cancel</button></div>
						</Modal>
						<Modal ref='testModal'>
							<TestInterface sendPacket={this.sendPacket} prodRec={this.state.prodRec} pVdef={this.state.pVdef}/>
						</Modal>
						<Modal ref='calbModal'>
							<CalibInterface sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} phase={[this.state.phase, this.state.prodRec['PhaseMode'], ps]} peaks={[this.state.rpeak,this.state.xpeak]}ref='ci'/>
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
		return({phaseSpeed:0,phase:0,phaseMode:0, edit:false, tmpStr:''})
	},
	calibrate: function () {
		// body...
		this.props.calib()
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
		this.setState({tmpStr:e.target.value})
	},
	clearR: function () {
		// body...
		this.props.sendPacket('rpeak','clear')
	},
	submitPhase: function () {
		// body...
		this.props.sendPacket('phaseEdit',this.state.tmpStr)
	},
	clearX: function(){
		this.props.sendPacket('xpeak','clear')
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
		if(this.state.edit){
			phase = (<div><div onClick={this.editPhase}> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>
					<div><input type='text' onKeyPress={this._handleKeyPress} onChange={this.onChangePhase} value={this.state.tmpStr}/> <button onClick={this.submitPhase}>Submit</button></div>
				</div>)
		}
		return (<div className='calib'>
				<label>
					Calibration Menu
				</label>
				<table><tbody>
					<tr><td>Phase Speed:</td><td>{this.props.phase[2]}</td></tr>
					<tr><td >Phase:</td><td>{phase}</td></tr>
					<tr><td>R Peak:</td><td onClick={this.clearR}>{this.props.peaks[0]}</td></tr>
					<tr><td>X Peak:</td><td onClick={this.clearX}>{this.props.peaks[1]}</td></tr>
				</tbody></table>
				<button onClick={this.calibrate}>Calibrate</button>
				<button onClick={this.refresh}>Refresh</button>
			</div>)
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
		this.props.sendPacket('test','test')
	},
	modeChanged: function(e){
		this.props.sendPacket(this.props.pVdef[1]['TestMode'],e.target.value)

	},
	render: function () {
		var prod = this.state.prodRec;
		//console.log(prod)
		var self = this;
		var testConfigs = _testMap.map(function(_test, i){
			var test = _test.map(function(conf){
		//		console.log(conf)
				return ({count:prod[conf.count], metal:prod[conf.metal]})
			})	
			//console.log(test)
			return <TestItem sendChange={self.sendPacket} conf={_test} metalCounts={test} ind={i+1} pVdef={self.props.pVdef}/>
		}) 

		console.log('testmode: ' + prod['TestMode']);
		if(prod['TestMode']){
			var testConfigs = testConfigs[prod['TestMode']- 1]
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
	//	console.log(testConfigs)
		return(<div className='testInt'>
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
		console.log('received change')
		console.log(e)
		console.log(c)
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
		return({width:400, height:200, mqls:mqls})
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





injectTapEventPlugin();
ReactDOM.render(<Container/>,document.getElementById('content'))

