var React = require('react');
var ReactDom = require('react-dom')
import {AlertModal, Modal} from './components.jsx'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { v4 as uuidv4 } from 'uuid';

const SPARCBLUE2 = '#30A8E2'
const SPARCBLUE1 = '#1C3746'
const FORTRESSPURPLE1 = '#362c66'
const FORTRESSPURPLE2 = '#5d5480'

class ButtonWrapper extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		this.props.onClick(this.props.ID)
	}
	render () {
		var style = this.props.style || {}
		return <button onClick={this.onClick} style={style}>{this.props.children}</button>
	}
}
class CircularButton extends React.Component{
	constructor(props) {

		super(props)
		this.state = {touchActive:false, curtrns:this.props.lab,lab:this.props.lab, tov:false}
		this.onClick = this.onClick.bind(this)
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.simTouch = this.simTouch.bind(this);
		this.tStart = this.tStart.bind(this);
		this.tEnd = this.tEnd.bind(this);
		this.translate = this.translate.bind(this);
		this.onChange = this.onChange.bind(this);
		this.translateModal = React.createRef();
		this.submit = this.submit.bind(this);
	}
	submit(){
		this.props.submit(this.props.pram, this.props.language, this.state.curtrns)
	}
	translate(){
		this.translateModal.current.toggle();
	}
	onChange(e){
		this.setState({curtrns:e.target.value})
	}
	componentWillReceiveProps(newProps){
		if(newProps.lab != this.props.lab){
			this.setState({lab:newProps.lab, curtrns:newProps.lab})
		}
	}
	onClick () {
		if(this.state.tov){
			if(this.props.onAltClick){
				this.props.onAltClick()
			}else{
				this.props.onClick()
			}
		}else if(!this.props.disabled){
			this.props.onClick();
		}else{
			toast('Test is not configured')
		}
	}
	simTouch(ms=1000){
		var self = this;
		this.onTouchStart();
		setTimeout(function () {
			self.tEnd();
		},ms)
	}
	onTouchStart (e){
		console.log(e.button,'touchstart')
		if(e.button != 2){
			this.setState({touchActive:true})
		}
		
	}
	tStart(str){
		this.setState({touchActive:true, lab:str, tov:true})
	}
	tEnd(){

		this.setState({touchActive:false, lab:this.props.lab, tov:false})
	}
	onTouchEnd (e){
		console.log(e.button,'touchend')
		if(e.button != 2){
		var self = this;
		
		setTimeout(function (argument) {

		self.onClick();
		},100)
		
				
			if(this.props.override){

			}else{
				this.setState({touchActive:false})
			
			}
		}
	}
	render () {
		var bg = '#818a90'
		var gr = '#484074'
		var mr = 'auto'
		var ml = 'auto'
		var border = '8px solid rgb(129, 138, 144)'
		
		var klass = 'circularButton'
		var fontColor = '#e1e1e1'
		if(this.state.touchActive){
			klass = 'circularButton touchActive'
		}
		if(this.props.branding == 'FORTRESS'){
			klass = 'circularButton_FT'
			fontColor = SPARCBLUE1
			if(this.state.touchActive){
				klass = 'circularButton_FT touchActive_FT'
			}	
		}
		if(this.props.branding == 'SPARC'){
			fontColor = SPARCBLUE1
			border = '8px solid #e1e1e1'
			var klass = 'circularButton_sp'
			if(this.state.touchActive){
				klass = 'circularButton_sp touchActive_sp'
			}
		}

		if(this.props.isTransparent){
			ml = 'auto'
			if(this.props.inverted){
				gr = '#484074'

			}else{
				gr = '#484074'
			}
		}
		
		var style = {height:55,top:-6,left:-6}
		var divstyle = {overflow:'hidden',background:bg,height:50,width:50,borderRadius:25}
		var bstyle = Object.assign({} ,this.props.style)
		var fsize = 30;
		if(this.props.lab.length > 12){
			fsize = 24;
		}
		if(this.props.fSize){
			fsize = this.props.fSize
		}
		var innerStyle = {display:'inline-block', position:'relative',top:-2,width:'100%', color:fontColor, fontSize:fsize,lineHeight:'50px'}
		if(this.props.innerStyle){
			innerStyle = Object.assign({} ,this.props.innerStyle);
		}
		if(this.props.selected == true){
			bstyle.background = 'rgb(128,122,150)'
		}
		var lab = this.state.lab
		var uid = uuidv4();
		if(this.props.ctm){
			
			lab = <React.Fragment><ContextMenuTrigger id={uid}>{lab}</ContextMenuTrigger>
			
			</React.Fragment>
		}
		if(this.props.disabled){
			bstyle.background = '#818a90'
			innerStyle.color = "#bbb"
			return(

				<React.Fragment><div  className={klass} onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{lab}</div>
			</div>
			<ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu>
				<Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
	  		 <input type='text' style={{fontSize:20}} value={this.state.curtrns} onChange={this.onChange}/>
	  		 <button onClick={this.submit}>Submit Change</button>
	  		</Modal>
			</React.Fragment>)
		}	

		//if(this.props.inverted){
			return(<React.Fragment>
				<div  className={klass} onPointerDown={this.onTouchStart} onPointerUp={this.onTouchEnd} style={bstyle}>
				<div style={innerStyle}>{lab}</div>
			</div>
			<ContextMenu id={uid}><MenuItem onClick={this.translate}>Translate</MenuItem></ContextMenu>
			<Modal ref={this.translateModal} Style={{color:'#e1e1e1',width:400, maxWidth:400}}>
	  		 <input type='text' style={{fontSize:20}} value={this.state.curtrns} onChange={this.onChange}/>
	  		 <button onClick={this.submit}>Submit Change</button>
	  		</Modal>
			</React.Fragment>)
		//}else{
		//	return(<div  className={klass} onMouseDown={this.onTouchStart} onMouseUp={this.onTouchEnd} onClick={this.onClick} style={bstyle}>
		//		<div style={innerStyle}>{this.props.lab}</div> onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd} 
		//	</div>)
		//}
	}
}
class CustomAlertClassedButton extends React.Component{
	constructor(props) {
		super(props)
		this.state = {touchActive:false}
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.cfmodal = React.createRef();

	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.cfmodal.current.show();
		},100)	
	}
	onTouchStart (){
		this.setState({touchActive:true})
	}
	onTouchEnd (){
		this.setState({touchActive:false})
	}
	accept (){
		this.props.onClick()
	}
	render () {
		var style = this.props.style || {}
		var klass = 'customAlertButton'
		if(this.props.className){
			klass = this.props.className
		}
		if(this.state.touchActive){
			klass +=' touchActive';
		}
		return	(<div style={style}><button className={klass} onPointerDown={this.onTouchStart} onPointerUp={this.onTouchEnd} style={style} onClick={this.onClick} >{this.props.children}
		
		</button>
			<AlertModal ref={this.cfmodal} accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}
class CustomAlertButton extends React.Component{
	constructor(props) {
		super(props)
		this.state = {touchActive:false}
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.cfmodal = React.createRef();
	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.cfmodal.current.show();
		},100)	
	}
	accept (){
		this.props.onClick()
	}
	onTouchStart (){
		this.setState({touchActive:true})
	}
	onTouchEnd (){
		this.setState({touchActive:false})
	}
	render () {
		var style = this.props.style || {}
		var klass = 'customAlertButton'
		if(this.props.className){
			klass = this.props.className
		}
		if(this.state.touchActive){
			klass +=' touchActive';
		}
		return	(<div className={klass} style={style}><div onClick={this.onClick} onPointerDown={this.onTouchStart} onPointerUp={this.onTouchEnd} >{this.props.children}
		
		</div>
			<AlertModal ref={this.cfmodal} accept={this.accept}>
					<div>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}


export {ButtonWrapper, CircularButton, CustomAlertButton, CustomAlertClassedButton}
/*
module.exports = {}
module.exports.ButtonWrapper = ButtonWrapper;
module.exports.CircularButton = CircularButton;
module.exports.CustomAlertClassedButton = CustomAlertClassedButton
module.exports.CustomAlertButton = CustomAlertButton*/