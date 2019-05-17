var React = require('react');
var ReactDom = require('react-dom')
import {AlertModal} from './components.jsx'

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
		this.onClick = this.onClick.bind(this)
	}
	onClick () {
		if(!this.props.disabled){
			this.props.onClick();
		}else{
			toast('Test is not configured')
		}
	}
	render () {
		var bg = '#818a90'
		var gr = '#484074'
		var mr = 'auto'
		var ml = 'auto'
		var border = '8px solid rgb(129, 138, 144)'
		 
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
		var innerStyle = {display:'inline-block', position:'relative',top:-2,width:'100%', color:"#e1e1e1", fontSize:fsize,lineHeight:'50px'}
		if(this.props.innerStyle){
			innerStyle = Object.assign({} ,this.props.innerStyle);
		}
		if(this.props.selected == true){
			bstyle.background = 'rgb(128,122,150)'
		}
		if(this.props.disabled){
			bstyle.background = '#818a90'
			innerStyle.color = "#bbb"
			return(<div  className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}	

		if(this.props.inverted){
			return(<div  className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}else{
			return(<div className='circularButton' onClick={this.onClick} style={bstyle}>
				<div style={innerStyle}>{this.props.lab}</div>
			</div>)
		}
	}
}
class CustomAlertClassedButton extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.refs.cfmodal.show();
		},100)	
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
		return	(<div style={style}><button className={klass} style={style} onClick={this.onClick} >{this.props.children}
		
		</button>
			<AlertModal ref='cfmodal' accept={this.accept}>
					<div style={{color:'#e1e1e1'}}>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}
class CustomAlertButton extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
		this.accept = this.accept.bind(this);
	}
	onClick () {
		var self = this;
		setTimeout(function(){
			self.refs.cfmodal.show();
		},100)	
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
		return	(<div className={klass} style={style}><div onClick={this.onClick} >{this.props.children}
		
		</div>
			<AlertModal ref='cfmodal' accept={this.accept}>
					<div>{this.props.alertMessage}</div>
				</AlertModal>
		</div>)
	}
}

module.exports = {}
module.exports.ButtonWrapper = ButtonWrapper;
module.exports.CircularButton = CircularButton;
module.exports.CustomAlertClassedButton = CustomAlertClassedButton
module.exports.CustomAlertButton = CustomAlertButton