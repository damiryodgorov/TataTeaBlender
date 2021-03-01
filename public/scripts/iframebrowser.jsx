const React = require('react');
const ReactDOM = require('react-dom');
import {TrendBar,TickerBox, CanvasElem, SlimGraph, DummyGraph, Modal,GraphModal, AuthfailModal, MessageModal, AlertModal, MessageConsole, ScrollArrow} from './components.jsx'
import {CircularButton, ButtonWrapper, CustomAlertButton, CustomAlertClassedButton} from './buttons.jsx'


const FtiSockIo = require('./ftisockio.js')
var _wsurl = 'ws://' +location.host 
var socket = new FtiSockIo(_wsurl,true);	

class NavWrapper extends React.Component{
	constructor(props){
		super(props)
		this.md = React.createRef();
		this.toggleMD = this.toggleMD.bind(this);
		this.onLinkClick = this.onLinkClick.bind(this);
		this.loadInitPage = this.loadInitPage.bind(this);
		this.state = {src:'',links:[],lastLink:''}
	}
	componentDidMount(){
		var self = this;
		//socket.emit('locateReq', true)
		socket.on('lastLink', function (link) {
			// body...  
			//window.location.href = link;
			setTimeout(function (argument) {
				// body...
				self.locate();
			},500)
			self.setState({src:link, lastLink:link})
		})
		socket.on('locateResp',function (dsps) {
			// body...
			console.log(dsps)
			var links = []
			dsps.forEach(function (d) {
				// body...
				if(self.state.lastLink == 'http://'+d.ip+'/cw.html'){
					window.location.href = self.state.lastLink
				}

				links.push('http://'+d.ip+'/cw.html')
			})
			self.setState({links:links})
		})
		setTimeout(function (argument) {
			
			self.loadInitPage();
		}, 500)	
	}
	loadInitPage(){
		if(socket.sock.readyState  ==1){
			socket.emit('getLink');
			//this.locate();
		}
	}
	onLinkClick(l){
		socket.emit('saveLink',l)
		setTimeout(function (argument) {
			// body...
			window.location.href = l;
		},500)
		
		this.setState({src:l})
	}
	toggleMD(){
		this.locate();
		this.md.current.toggle();
	}
	locate(){
		console.log('this should locate')
		socket.emit('locateReq',true)
	}
	refresh(){
		location.reload()
	}
	testNav(){
		window.location.href = "http://localhost/cw.html"
	}
	render(){
		//Need to figure out protocols to get url
		//create api?
		//<iframe name='foo' style={{width:'100%',height:'100%'}} src={this.state.src}/>
			 
		var self = this;
		var links = this.state.links.map(function(l) {
			// body...
			return <p><a onClick={() => self.onLinkClick(l)}>{l}</a></p>
		})
		return <div style={{width:'100%',height:'100%'}}>
			<img src='assets/burger.png' style={{position:'absolute', width:50, marginLeft:280}}  onClick={this.toggleMD}/>
			<div style={{textAlign:'center'}}><img src='assets/NewFortressTechnologyLogo-BLK-trans.png' style={{width:800, marginTop:150}}/></div>
			<Modal ref={this.md} branding='FORTRESS'>
				{links}
				<button onClick={this.refresh}>Refresh Page</button>
				<button onClick={this.testNav}>TestNav</button>
				</Modal>
		</div>
	}
}


ReactDOM.render(<NavWrapper/>,document.getElementById('content'))