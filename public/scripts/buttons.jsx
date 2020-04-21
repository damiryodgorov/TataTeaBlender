var React = require('react');
var ReactDom = require('react-dom')
import {AlertModal} from './components.jsx'

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
		this.state = {touchActive:false, lab:props.lab}
		this.onClick = this.onClick.bind(this)
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.simTouch = this.simTouch.bind(this);
		this.tStart = this.tStart.bind(this);
		this.tEnd = this.tEnd.bind(this);
	}
	componentWillReceiveProps(newProps){
		if(newProps.lab != this.props.lab){
			this.setState({lab:newProps.lab})
		}
	}
	onClick () {
		if(!this.props.disabled){
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
	onTouchStart (){
		this.setState({touchActive:true})
	}
	tStart(str){
		this.setState({touchActive:true, lab:str})
	}
	tEnd(){

		this.setState({touchActive:false, lab:this.props.lab})
	}
	onTouchEnd (){
		var self = this;
		
		setTimeout(function (argument) {

		self.onClick();
		},100)
		
				
			if(this.props.override){

			}else{
				this.setState({touchActive:false})
			
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
		if(this.props.disabled){
			bstyle.background = '#818a90'
			innerStyle.color = "#bbb"
			return(<div  className={klass} onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.state.lab}</div>
			</div>)
		}	

		//if(this.props.inverted){
			return(<div  className={klass} onPointerDown={this.onTouchStart} onPointerUp={this.onTouchEnd} style={bstyle}>
				<div style={innerStyle}>{this.state.lab}</div>
			</div>)
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