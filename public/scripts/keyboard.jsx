const React = require('react');
const ReactDOM = require('react-dom')
var onClickOutside = require('react-onclickoutside');
var createReactClass = require('create-react-class');
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { v4 as uuidv4 } from 'uuid';

const vdefMapV2 = require('./vdefmap.json')
var labTransV2 = vdefMapV2['@labels']

import {Modal} from './components.jsx'
import {CircularButton} from './buttons.jsx'

class CustomKeyboard extends React.Component{
	constructor(props) {
		super(props)
		this.state = {show:false}
		this.toggle = this.toggle.bind(this)
		this.close = this.close.bind(this)
		this.onChange = this.onChange.bind(this);
	}
	toggle () {
		var self   = this;
		setTimeout(function () {

			self.setState({show:true})
				
			if(self.props.onFocus){
				self.props.onFocus()
			}
		},100)
		
	}
	close () {
		var self = this;
		if(self.state.show){
			setTimeout(function (argument) {
				self.setState({show:false})	
				if(self.props.onRequestClose){
					self.props.onRequestClose();
				}
			},80)
		}
		
	}
	updateMeter(){

	}
	updateSig(){
		
	}
	onChange (value) {
		var self = this;
		this.close();
		setTimeout(function(){
			self.props.onChange(value, self.props.index, self.props.index2);
		
		}, 180)
	}
	render () {
		var cont = "";

		if(this.state.show){
			cont = <CustomKeyboardCont sendAlert={this.props.sendAlert} min={this.props.min} max={this.props.max} preload={this.props.preload} branding={this.props.branding} 
			ref='cnt' mobile={this.props.mobile} datetime={this.props.datetime} language={this.props.language} tooltip={this.props.tooltip} pwd={this.props.pwd} onChange={this.onChange} 
			show={this.state.show} close={this.close} value={this.props.value} num={this.props.num} label={this.props.label} submitTooltip={this.props.submitTooltip}/>
		}
		return <div hidden={!this.state.show} className = 'pop-modal'>
		{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
var CustomKeyboardCont = onClickOutside(createReactClass({
	getInitialState:function () {
		// body...
		var value = "";
		if(this.props.preload){
			value = this.props.value
		}
		return{value:value, shift:false,curtrans:this.props.tooltip}
	},

	componentDidMount:function () {
		// body...
		if(this.props.mobile && !this.props.num ){
			document.getElementById('inp').focus();
		}
		var value = "";
		if(this.props.preload){
			value = this.props.value
		}
		this.setState({value:value, shift:false})
	},
	handleClickOutside:function (e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	},
	close:function () {
		// body...
		this.props.close();
	},
	onKeyPress:function (char) {
		// body...
		if(char == 'clear'){
			this.clear();
		}else if(char == 'del'){
			this.onDelete();
		}else if(char == 'enter'){
			this.onEnter();
		}else if(char == 'shift'){
			this.onShift();
		}else if(char == 'cancel'){
			this.close();
		}else if((char == 'space' ) || (char == 'shortspace')){
			if(this.state.value.length < 20){
				this.setState({value:this.state.value.concat(" ")})
			}
		}else{
			if(this.state.value.length < 20){
				this.setState({value:this.state.value.concat(char)})
			}
		}
		
	},

	onEnter:function () {
		// body...
		if(typeof this.props.min != 'undefined'){
			if(this.props.min[0]){
				if(parseFloat(this.props.min[1]) > this.state.value){
					this.props.sendAlert(labTransV2['Minimum Value is'][language]['name']+' '+this.props.min[1])
					return;
				}
			}
		}

		if(typeof this.props.max != 'undefined'){
			if(this.props.max[0]){
				if(parseFloat(this.props.max[1]) < this.state.value){
					this.props.sendAlert(labTransV2['Maximum Value is'][language]['name']+' '+this.props.max[1])
					return;
				}
			}
		}
	
		this.props.onChange(this.state.value)
	},
	onDelete:function () {
		// body...
		this.setState({value:this.state.value.slice(0,this.state.value.length - 1)})
	},
	clear:function () {
		this.setState({value:""})
	},
	onShift :function() {
		this.setState({shift:!this.state.shift})
	},
	onChange: function(e){
		this.setState({value:e.target.value})
	},
	help: function (argument) {
		this.refs.helpModal.toggle();	
	},
	translateTooltip: function (argument) {
		// body...
		this.refs.transModal.toggle();
	},
	curtrnChange: function (e) {
		this.setState({curtrans:e.target.value})
		// body...
	},
	submitTooltip: function () {
		if(typeof this.props.submitTooltip != 'undefined'){
			this.props.submitTooltip(this.state.curtrans)
		}
	},
	renderMobile:function(){
				var self = this;
		
		var width = 290;
		var hidden = false;
		var caps = this.state.shift
			var helpModal;
		var helpButton;
		if(typeof this.props.tooltip != 'undefined'){
			var helpWidth = 600;
			var helpMargin = 15;
			if(this.props.mobile){
				helpWidth = '90%'
				helpModal = 0;
			}
			helpButton = <div  style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:helpMargin, marginTop:3}}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		helpModal = <Modal mobile={self.props.mobile} ref='helpModal' Style={{color:'#e1e1e1',width:helpWidth, maxWidth:400}}>
	  		<div>{this.props.tooltip}</div>
	  		</Modal>
		}
		var but1 = ''//helpButton;
		var but2 = helpButton;
		var fbwidth = 290

		var dispval = this.state.value;
		if(this.props.pwd){
			dispval = this.state.value.split('').map(function(c){return '*'}).join('');
		}
		//var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
		var label = labTransV2['Enter'][language]['name']
		if(this.props.label && this.props.label.length > 0){
			label = this.props.label;
		}
		var minW = 400;
		if(this.props.mobile){
			minW = 300
		}

		return <div style={{paddingLeft:7,paddingRight:7}} className = 'selectmodal-outer'>
		<div style={{minWidth:minW,fontSize:20}}>
		<div className='flexCont' style={{display:'inline-block',width:fbwidth,height:45,color:'#a0a0a0',marginRight:'auto',marginLeft:'auto',display:'inline-block'}}> <span className='flexBox' >
			{label}</span></div>{but2}</div>
		<div style={{height:70, position:'relative'}}>		
				<input id='inp' style={{background:'rgba(150,150,150,0.3)',display:'inline-block',fontSize:25,lineHeight:'65px',textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:65,color:'#eee', whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}} value={this.state.value} type={'text'} onChange={this.onChange}/>

		</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>

	  	
		</div>
		{helpModal}
		<div style={{marginTop:10}}><button style={{height:60, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25, fontSize:30, lineHeight:'50px'}} onClick={this.onEnter}>{vdefMapV2['@labels']['Accept'][this.props.language].name}</button>
		<button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.close}>{vdefMapV2['@labels']['Cancel'][this.props.language].name}</button></div>
		</div>
	},
	render:function () {

		var self = this;
		var NumericKeyset = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','-']]
		var ANumericKeyset = [ ['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],
							['a','s','d','f','g','h','j','k','l','@'],['shift','z','x','c','v','b','n','m','-','.'],
							['space','#','enter','cancel']]
		var TimeKeySet = [['5','6','7','8','9'],['0','1','2','3','4'],['shortspace',':','/']]
		var rows = ""
		var width = 290;
		var hidden = false;
		var caps = this.state.shift
			var helpModal;
			var transModal;
		var helpButton;
		var klass = 'selectmodal-outer'
		var vclr = '#a0a0a0'
		var dvclr = '#eee'
		if(this.props.branding == 'SPARC'){
			klass = 'selectmodalo-sp'
			vclr = '#1e1e1e'
			dvclr = '#111'
		}
		var label = labTransV2['Enter'][language]['name']
		var helpText = '';
		if(this.props.label && this.props.label.length > 0){
			if(this.props.label.includes('Clear Time -')||this.props.label.includes('Minimum Product Gap -')||this.props.label.includes('Eye Block Fault Distance -')){
				label = this.props.label;
				helpText=labTransV2['Enter 0 to use default'][language]['name'];
			}else{
				if(this.props.label.toString().includes('grams/pulse') || this.props.label.toString().includes('grams/sec'))
				{
					var twoParts = this.props.label.split('-');
					var numberPart = twoParts[1].split(' ');
					var number = numberPart[1];
					var unit = numberPart[2];
					label = twoParts[0] + " - "+Number(number).toFixed(1) + " " + unit;
				}
				else{
					label = this.props.label;
				}
			}			
		}

		if(typeof this.props.tooltip != 'undefined'){
			var tooltip = this.props.tooltip
			if(tooltip.length == 0){
				tooltip = 'N/A'
			}
			var helpWidth = 600;
			var helpMargin = 15;
			if(this.props.mobile){
				helpWidth = '90%'
				helpModal = 0;
			}
			var uid = uuidv4();
			helpButton = <div  style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:helpMargin, marginTop:3}}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		helpModal = <Modal mobile={self.props.mobile} ref='helpModal' Style={{color:'#e1e1e1',width:helpWidth}}>
	  		<div style={{textAlign:'center', borderBottom:'1px solid #e1e1e1'}}>{label.split('-')[0]}</div>
	  		<div style={{whiteSpace:'pre-wrap', textAlign:'left'}}><ContextMenuTrigger id={uid}>{tooltip}</ContextMenuTrigger></div>
	  		<ContextMenu id={uid}>
	  			<MenuItem onClick={this.translateTooltip}>{labTransV2['Translate Tooltip'][language]['name']}</MenuItem>
	  		</ContextMenu>
	  		</Modal>
	  			transModal = <Modal mobile={self.props.mobile} ref='transModal' Style={{color:'#e1e1e1',width:600}}>
	  		 <textarea type='text' style={{fontSize:20, width:400, height:100}} value={this.state.curtrans} onChange={this.curtrnChange}/>
	  		 <button onClick={this.submitTooltip}>{labTransV2['Submit Change'][language]['name']}</button>
	  		</Modal>
		}
		var but1 = ''//helpButton;
		var but2 = helpButton;
		var fbwidth = 290

		if(this.props.datetime == true){
			//console.log('datetime')
			rows = TimeKeySet.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey  klass='customKey_sp' branding={self.props.branding} Key={k} mobile={self.props.mobile}  caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			fbwidth = 500;
			width = 610;
		}else if(this.props.num){
			//but1= helpButton;
			rows = NumericKeyset.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey  klass='customKey_sp' branding={self.props.branding} Key={k} mobile={self.props.mobile} caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
		}else{
			if(this.props.mobile){
				return this.renderMobile()
			}
			hidden = true;
			fbwidth = 830
			//but2 = helpButton
			rows = ANumericKeyset.map(function (row) {
				var tds = row.map(function(key){
					if(caps){
						if (key.length == 1){
							key = key.toUpperCase();
						}
						if(key == '-'){
							key = '_';
						}
					}
					return <CustomKey  klass='customKey_sp' branding={self.props.branding} Key={key} caps={caps} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			width = 940
		}
		var minStr = ''
		var maxStr = ''
		var mmaxb = false
		var mmaxdiv =''
		var dispval = this.state.value;
		var sigfigs = 0;
		if(this.props.floatDec){
			sigfigs = this.props.floatDec;
			dispval = dispval.toFixed(sigfigs)
		}

		if(this.props.pwd){
			dispval = this.state.value.split('').map(function(c){return '*'}).join('');
		}

		if(typeof this.props.min != 'undefined' ){
			if(this.props.min[0]){
				mmaxb = true
				minStr = parseFloat(this.props.min[1])
				if(this.props.label.includes("."))
				{
					if(this.props.label.includes("oz"))
					{
						minStr = minStr.toFixed(2);
					}else{
						minStr = minStr.toFixed(1);
					}
				}else{
					if(this.props.floatDec){
						minStr = minStr.toFixed(this.props.floatDec)
					}else{
						if(minStr.toString().length > minStr.toFixed(1).length){
							minStr = minStr.toFixed(1);
						}
					}
				}
			}
			if(isNaN(minStr))
			{
				minStr = 0;
			}
		}
		if(typeof this.props.max != 'undefined'){
			if(this.props.max[0]){
				mmaxb = true;
				maxStr = parseFloat(this.props.max[1])
				if(this.props.label.includes("."))
				{
					if(this.props.label.includes("oz"))
					{
						maxStr = maxStr.toFixed(2)
					}else{
						maxStr = maxStr.toFixed(1)
					}					
				}else{
					if(this.props.floatDec){
						maxStr = maxStr.toFixed(this.props.floatDec)
					}else{
						if(maxStr.toString().length > maxStr.toFixed(1).length){
							maxStr = maxStr.toFixed(1)
						}
					}
				}
			}
		}

		
		if(mmaxb){
			
			mmaxdiv = <div style={{fontSize:18,color:dvclr, textAlign:'center' }}>{labTransV2['Range'][language]['name']}+': '[{minStr+'~'+maxStr}]</div>
		}
		//var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
	
		var minW = 400;
		if(this.props.mobile){
			minW = 300
		}
		
		return <div style={{paddingLeft:7,paddingRight:7}} className = {klass}>
		<div style={{minWidth:minW,fontSize:20}}><div className='flexCont' style={{display:'inline-block',width:fbwidth,height:45,color:vclr,marginRight:'auto',marginLeft:'auto',display:'inline-block'}}> <span className='flexBox' >
			{label}</span> 
			<br/>
			<span className='flexBox' >{helpText}</span></div>{but2}</div>
		{mmaxdiv}
	<div style={{height:70, position:'relative'}}>		<svg style={{position:'absolute', top:14, marginLeft:3}} onClick={this.clear} xmlns="http://www.w3.org/2000/svg" height="40" version="1.1" viewBox="0 0 32 32" width="40"><g id="Layer_1"/><g id="x_x5F_alt"><path d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M23.914,21.086   l-2.828,2.828L16,18.828l-5.086,5.086l-2.828-2.828L13.172,16l-5.086-5.086l2.828-2.828L16,13.172l5.086-5.086l2.828,2.828   L18.828,16L23.914,21.086z" fill="#E1E1E1"/></g></svg>
	<div style={{background:'rgba(150,150,150,0.3)',display:'inline-block',fontSize:25,lineHeight:'65px',textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:65,color:dvclr, whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}}>{dispval}</div>{but1}
		<svg style={{position:'absolute', top:10, marginLeft:-52, width:50}} onClick={this.onDelete} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E1E1E1" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>
		</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>
		<table style={{tableLayout:'fixed', position:'relative', top:0,width:width}} className='customKeyboardTable'><tbody style={{display:'table-row-group'}}>
			{rows}
		</tbody></table>
		
	  	
		</div>
		{helpModal}
		{transModal}
		<div hidden={hidden}><CircularButton branding={this.props.branding} style={{height:45,display:'inline-block', border:'5px solid #808a90', marginLeft:2, marginRight:2, color:'#e1e1e1', width:156, borderRadius:25, fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={this.onEnter} lab={vdefMapV2['@labels']['Accept'][this.props.language].name}/>
		<CircularButton branding={this.props.branding} style={{height:45, display:'inline-block', marginLeft:2, marginRight:2, border:'5px solid #808a90',color:'#e1e1e1', width:156, borderRadius:25,fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={this.close} lab={vdefMapV2['@labels']['Cancel'][this.props.language].name}/></div>
		</div>
	  	
	}
}))
class CustomKey extends React.Component{
	constructor(props) {
		super(props)
		this.state = {touchActive:false}
		this.onPointerDown = this.onPointerDown.bind(this);
		this.onPointerUp = this.onPointerUp.bind(this);
		this.onPress = this.onPress.bind(this)
	}
	onPointerDown(){
		this.setState({touchActive:true})
	}
	onPointerUp(){
		this.setState({touchActive:false})
	}
	onPress () {
		// body...
		this.props.onPress(this.props.Key)
	}
	render () {
		// body...
		var klass = 'customKey'
		if(this.props.mobile){
			klass = 'customKey_m'
		}else if(this.props.klass){
			klass = this.props.klass
		}
		if(this.state.touchActive){
			klass += ' keyDown'
		}
		if(this.props.Key == 'space'){
			return	<td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass} colSpan={5}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M18 9v4H6V9H4v6h16V9z"/></svg></div></td>
		}else if(this.props.Key == 'shortspace'){
			return	<td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass} colSpan={3}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M18 9v4H6V9H4v6h16V9z"/></svg></div></td>
	
		}else if(this.props.Key == 'del'){
			return	<td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass}><div style={{marginBottom:-15}}><svg xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/></svg></div></td>
		}else if(this.props.Key == 'enter'){
			return  <td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass} colSpan={2}><div style={{marginBottom:0, fontSize:30}}>{labTransV2['Accept'][language]['name']}</div></td>
		
		}else if(this.props.Key == 'shift'){
			var fill = "#000000"
			var st = {}
			if(this.props.caps){
				fill = "#eeeeee"
				st={background:'#808a90'}
			}
			return <td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} style={st} onClick={this.onPress} className={klass}><div style={{marginBottom:-15}}><svg fill={fill} xmlns="http://www.w3.org/2000/svg" width="55" height="48" viewBox="0 0 24 24"><path d="M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41zM6 18h12v-2H6v2z"/></svg></div></td>
		}else if(this.props.Key == 'cancel'){
			return <td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass} colSpan={2}><div style={{marginBottom:0, fontSize:30}}>{labTransV2['Cancel'][language]['name']}</div></td>
			
	
		}else{

			return <td onPointerDown={this.onPointerDown} onPointerUp={this.onPointerUp} onPointerOut={this.onPointerUp} onClick={this.onPress} className={klass}>{this.props.Key.slice(0,1)}</td>
		}
		
	}
}
class EmbeddedKeyboard extends React.Component{
	constructor(props){
		super(props)
		this.state = {value:"", shift:false}
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onEnter = this.onEnter.bind(this);
		this.onShift = this.onShift.bind(this);
		this.onChange = this.onChange.bind(this);
		this.liveUpdate = this.liveUpdate.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.clear = this.clear.bind(this);
		this.close = this.close.bind(this);
		this.onEnter = this.onEnter.bind(this);

	}
	close(){
		this.props.onCancel()
	}
	componentDidMount(){
		this.liveUpdate('');
	}
	onEnter() {
		// body...
		this.props.onChange(this.state.value)
	}
	onDelete() {
		// body...
		var self = this;
		var value = this.state.value.slice(0,this.state.value.length - 1)
		this.setState({value:value})
		setTimeout(function (argument) {
			// body...
			self.liveUpdate(value)
		},100)
	}
	clear() {
		var self = this;
		var value = ""
		this.setState({value:value})
		setTimeout(function (argument) {
			// body...
			self.liveUpdate(value)
		},100)
	}
	onShift() {
		this.setState({shift:!this.state.shift})
	}
	onEnter(){
		this.props.onAccept();
	}
	onChange(e){
		var self = this;
		var value = e.target.value;
		this.setState({value:value})
		setTimeout(function (argument) {
			// body...
			self.liveUpdate(value)
		},100)
	}
	help(argument) {
		this.refs.helpModal.toggle();	
	}
	liveUpdate(val){
		if(this.props.liveUpdate){
			this.props.liveUpdate(val)
		}
	}
	onKeyPress(char) {
		// body...
		var self = this;
		var value = this.state.value
		
		if(char == 'enter'){
			this.onEnter();
		}else if(char == 'shift'){
			this.onShift();
		}else if(char == 'cancel'){
			this.close();
		}else{
			if(char == 'clear'){
			//this.clear();
				value = ""
			}else if(char == 'del'){
				value = value.slice(0,value.length -1)
				//this.onDelete();
			}else if((char == 'space' ) || (char == 'shortspace')){
				if(value.length < 20){
					value = value.concat(" ");
				
				}
			}else{
				if(value.length < 20){
					value = value.concat(char)
			}
		}
			this.setState({value:value})
			setTimeout(function () {
				// body...
				self.liveUpdate(value)
			},100)
		}
		
	}
	render(){
		var self = this;
		var NumericKeyset = [['7','8','9'],['4','5','6'],['1','2','3'],['.','0','-']]
		var ANumericKeyset = [ ['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],
							['a','s','d','f','g','h','j','k','l','@'],['shift','z','x','c','v','b','n','m','-','.'],
							['space','#','enter','cancel']]
		var TimeKeySet = [['5','6','7','8','9'],['0','1','2','3','4'],['shortspace',':','/']]
		var rows = ""
		var width = 290;
		var hidden = false;
		var caps = this.state.shift
			var helpModal;
		var helpButton;
		if(typeof this.props.tooltip != 'undefined'){
			var helpWidth = 400;
			var helpMargin = 15;
			if(this.props.mobile){
				helpWidth = '90%'
				helpModal = 0;
			}
			helpButton = <div  style={{float:'right', display:'inline-block', marginLeft:-50, marginRight:helpMargin, marginTop:3}}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		helpModal = <Modal mobile={self.props.mobile} ref='helpModal' Style={{color:'#e1e1e1',width:helpWidth}}>
	  		<div>{this.props.tooltip}</div>
	  		</Modal>
		}
		var but1 = ''//helpButton;
		var but2 = helpButton;
		var fbwidth = 290

		if(this.props.datetime == true){
			//console.log('datetime')
			rows = TimeKeySet.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey klass='customKey_sp' Key={k} mobile={self.props.mobile}  caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			fbwidth = 500;
			width = 610;
		}else if(this.props.num){
			//but1= helpButton;
			rows = NumericKeyset.map(function (row) {
				var tds = row.map(function(k){
					//////console.log(k)
					return <CustomKey klass='customKey_sp' Key={k} mobile={self.props.mobile} caps={false} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
		}else{
			
			hidden = true;
			fbwidth = 765
			//but2 = helpButton
			rows = ANumericKeyset.map(function (row) {
				var tds = row.map(function(key){
					if(caps){
						if (key.length == 1){
							key = key.toUpperCase();
						}
						if(key == '-'){
							key = '_';
						}
					}
					return <CustomKey klass='customKey_sp' Key={key} caps={caps} onPress={self.onKeyPress}/>
				})
				return <tr>{tds}</tr>
			})
			width = 815
		}
		var dispval = this.state.value;
		if(this.props.pwd){
			dispval = this.state.value.split('').map(function(c){return '*'}).join('');
		}
		//var tooltiptext = 'This is a tooltip'
		////console.log(this.props.vMap)
		var label = 'Enter'
		if(this.props.label && this.props.label.length > 0){
			label = this.props.label;
		}
		var minW = 400;
		if(this.props.mobile){
			minW = 300
		}

		return <div style={{width:width, textAlign:'center', background:'#3f3f3f'}}>

	<div style={{height:75, position:'relative'}}>		<svg style={{position:'absolute', top:18, marginLeft:3}} onClick={this.clear} xmlns="http://www.w3.org/2000/svg" height="40" version="1.1" viewBox="0 0 32 32" width="40"><g id="Layer_1"/><g id="x_x5F_alt"><path d="M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M23.914,21.086   l-2.828,2.828L16,18.828l-5.086,5.086l-2.828-2.828L13.172,16l-5.086-5.086l2.828-2.828L16,13.172l5.086-5.086l2.828,2.828   L18.828,16L23.914,21.086z" fill="#E1E1E1"/></g></svg>
	<div style={{background:'rgba(150,150,150,0.3)',display:'inline-block',fontSize:25,lineHeight:'75px',textDecoration:'underline',textUnderlinePosition:'under',textDecorationColor:'rgba(200,200,200,0.7)',height:75,color:'#eee', whiteSpace:'pre',width:width - 4, marginTop:5,marginLeft:'auto',marginRight:'auto'}}>{dispval}</div>{but1}
		<svg style={{position:'absolute', top:15, marginLeft:-52, width:50}} onClick={this.onDelete} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E1E1E1" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>
		</div>
		<div style={{width:width,marginLeft:'auto',marginRight:'auto'}}>
		<table style={{tableLayout:'fixed', position:'relative', top:0,width:width}}className='customKeyboardTable'><tbody style={{display:'table-row-group'}}>
			{rows}
		</tbody></table>
		
	  	
		</div>
		{helpModal}
		<div hidden={hidden}><CircularButton style={{height:45,display:'inline-block', border:'5px solid #808a90', marginLeft:2, marginRight:2, color:'#e1e1e1', width:156, borderRadius:25, fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={this.onEnter} lab={vdefMapV2['@labels']['Accept'][this.props.language].name}/>
		<CircularButton style={{height:45, display:'inline-block', marginLeft:2, marginRight:2, border:'5px solid #808a90',color:'#e1e1e1', width:156, borderRadius:25,fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={this.close} lab={vdefMapV2['@labels']['Cancel'][this.props.language].name}/></div>
		</div>
	}
}
class KeyboardInputTextButton extends React.Component{
	constructor(props) {
		super(props)
		this.editValue = this.editValue.bind(this)
		this.onFocus = this.onFocus.bind(this);
		this.onInput = this.onInput.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
		this.renderMobile = this.renderMobile.bind(this);
	}

	onInput (e) {
		// body...
		this.props.onInput(e)
	}
	onFocus () {
		// body...
		if(this.props.onFocus){
			//console.log('okay, on focus')
			this.props.onFocus()
		}
	}
	onRequestClose () {
		// body...
		if(this.props.onRequestClose){
			//console.log('okay, on request close')
			this.props.onRequestClose();
		}
	}
	editValue () {
		// body...
		var self = this;
		// accessControl
		if((typeof this.props.acc == 'undefined')||(this.props.acc == true)){
		if(this.props.isEditable){
			setTimeout(function () {
				// body...
				self.refs.input.toggle()
			},100)
			
		}else{
			this.props.onClick()
		}
	}else{
		
		if(this.props.onDeny){
			setTimeout(function(){
				self.props.onDeny();
			},100)
			
		}else{
			toast('Access Denied')
		}
	}
		
	}

	renderMobile(){
			var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:13}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:16}
   		}
		rstyle.padding = 5;
		rstyle.height = 50
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard mobile={this.props.mobile} language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:20, textAlign:'center', width:'100%', display:'inline-block', lineHeight:'50px', marginLeft:-14}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='pbContain_m'>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:50}
		var contStyle= {display:'inline-block',width:'100%',position:'absolute',left:14,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton' style={{width:'100%'}}>
			<div onClick={this.editValue}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='tbDiv_m' style={tbst}>{this.props.label}</div>
				<div className='pbContain_m' style={{borderTopRightRadius:25, borderBottomRightRadius:25}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
	render() {
		if(this.props.mobile){
			return this.renderMobile();
		}
		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor || bgColor
			rstyle = this.props.rstyle || rstyle
		}
		var tbst = {}
		if(this.props.label.length>13){
			tbst = {fontSize:20}
		}else if(this.props.label.length > 10){
   			tbst = {fontSize:22}
   		}
		rstyle.padding = 8;
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var lab2 = this.props.lab2 || "";
		var ckb = <CustomKeyboard language={this.props.language} tooltip={this.props.tooltip} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.label + lab2 +': ' + this.props.value}/>
		var	kb = <label style={{fontSize:25, textAlign:'center', width:75, display:'inline-block', lineHeight:'75px'}} onClick={this.editValue}>{this.props.value}</label>
		
		if(!this.props.isEditable){
			ckb = ""
		}
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:2,backgroundColor:bgColor,borderRadius:34, height:75}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:100,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
   		
		
		return (
			<div className='keyboardInputTextButton'>
			<div onClick={this.editValue} style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='tbDiv' style={tbst}>{this.props.label}</div>
					
			</div>
			</div>
			{ckb}
			</div>
		);
		}else{
		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:46,left:65,backgroundColor:bgColor,borderRadius:34, height:75}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:49,left:-36,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:35, height:75}
		var contStyle= {display:'inline-block',width:85,position:'absolute',left:14,overflow:'hidden', height:75, backgroundColor:bgColor, zIndex:2, borderRadius:10}
  	
		return (
			<div className='keyboardInputTextButton'>
			<div onClick={this.editValue} style={{paddingTop:3, paddingBottom:3}}>
			<div className='round-bg' onClick={this.editValue} style={rstyle}>
				<div className='tbDiv' style={tbst}>{this.props.label}</div>
				<div className='pbContain' style={{display:'table-cell', width:115}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>

			</div>
			</div>
			{ckb}	
			</div>
		);
		}
	}
}

export {EmbeddedKeyboard, CustomKeyboard, KeyboardInputTextButton}
/*
module.exports = {}
module.exports.EmbeddedKeyboard = EmbeddedKeyboard;
module.exports.CustomKeyboard = CustomKeyboard;
module.exports.KeyboardInputTextButton = KeyboardInputTextButton;*/