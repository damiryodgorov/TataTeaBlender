const React = require('react');
const ReactDOM = require('react-dom')
var onClickOutside = require('react-onclickoutside');
var createReactClass = require('create-react-class');

const vdefMapV2 = require('./vdefmap.json')
import {Modal, ScrollArrow} from './components.jsx'
import {CircularButton} from './buttons.jsx'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

let inputSrcArr = ["NONE","TACH","EYE","RC1","RC2","ISO_1","IO_PL8_01","IO_PL8_02","IO_PL8_03","IO_PL8_04","IO_PL8_05","IO_PL8_06","IO_PL8_07","IO_PL8_08","IO_PL8_09","IO_PL6_01","IO_PL6_02","IO_PL6_03"];
const outputSrcArr = ['NONE', 'REJ_MAIN', 'REJ_ALT','FAULT','TEST_REQ', 'HALO_FE','HALO_NFE','HALO_SS','LS_RED','LS_YEL', 'LS_GRN','LS_BUZ','DOOR_LOCK','SHUTDOWN_LANE']

const SPARCBLUE1 = '#30A8E2'
const FORTRESSPURPLE1 = '#362c66'
const FORTRESSPURPLE2 = '#5d5480'

function setScrollTop(id, top) {document.getElementById(id).scrollTop = top;}

class PopoutWheel extends React.Component{
	constructor(props) {
		super(props)
		this.onChange = this.onChange.bind(this);
		this.toggle = this.toggle.bind(this);
		this.toggleCont =this.toggleCont.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.getToolTip = this.getToolTip.bind(this);
	}
	onCancel(){
		if(this.props.onCancel){
			this.props.onCancel();
		}
	}
	onChange (v,i,i2) {
		if(typeof this.props.index != 'undefined'){
			this.props.onChange(v,this.props.index)
		}else{
			this.props.onChange(v,i,i2)
		}
		
	}
	toggleCont () {
		this.refs.md.toggle();
	}
	toggle () {
		this.refs.md.toggle();
	}
	getToolTip(t){
		if(this.props.getToolTip){
			return this.props.getToolTip(t)
		}else{
			return 'N/A'
		}
	}
	render () {
		var value = "placeholder"
		return	<PopoutWheelModal tooltipOv={this.props.tooltipOv} tooltip={this.props.tooltip} getToolTip={this.getToolTip} submitTooltip={this.props.submitTooltip} ovWidth={this.props.ovWidth} inputs={this.props.inputs} outputs={this.props.outputs} branding={this.props.branding} mobile={this.props.mobile} onCancel={this.onCancel} params={this.props.params} vMap={this.props.vMap} ioBits={this.props.ioBits} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} ref='md' onChange={this.onChange} value={this.props.val} options={this.props.options} ref='md'/>
	}
}
class PopoutWheelModal extends React.Component{
	constructor(props) {
		super(props)
		this.state = {show:false}
		this.toggle = this.toggle.bind(this);
		this.close = this.close.bind(this);
		this.onChange = this.onChange.bind(this);
	}
	toggle () {
		if(this.props.name!='Manual Reject')
		{
			this.setState({show:true})
		}else{
			this.onChange(0,0,'undefined')
		}
	}
	close (v) {
		var self = this;

		setTimeout(function () {
			self.setState({show:false})
		},80)
		if(v == 0){
			this.props.onCancel();
		}
		
	}
	onChange(v,i,i2){
		this.props.onChange(v,i,i2)
	}
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <PopoutWheelModalCont tooltipOv={this.props.tooltipOv} tooltip={this.props.tooltip}  getToolTip={this.props.getToolTip} submitTooltip={this.props.submitTooltip} ovWidth={this.props.ovWidth} inputs={this.props.inputs} outputs={this.props.outputs} branding={this.props.branding} mobile={this.props.mobile} params={this.props.params}  vMap={this.props.vMap} ioBits={this.props.ioBits} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options} />
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
			{cont}
		</div>
	}
}
class PopoutWheelModalC extends React.Component{
	constructor(props){
		super(props);
		var tooltiptext = 'N/A'
		var tooltipSymlink = ''
		////console.log(this.props.vMap)
		if(typeof this.props.vMap != 'undefined'){
			if(this.props.vMap['@translations'][this.props.language]['description'].length >0){
				tooltiptext = this.props.vMap['@translations']['english']['description'];
			}
		}
		if(this.props.params){
			if(this.props.params[0]['@labels'] == 'OutputSrc'){
				tooltipSymlink = this.props.outputs[this.props.value[0]]
			}
		}
		this.state = {value:this.props.value.slice(0),curtrans:tooltiptext, tooltipSymlink:tooltipSymlink}
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.select = this.select.bind(this);
		this.accept = this.accept.bind(this);
		this.help = this.help.bind(this);
		this.curtrnChange = this.curtrnChange.bind(this);
		this.translateTooltip = this.translateTooltip.bind(this);
		this.submitTooltip = this.submitTooltip.bind(this);
		this.getToolTip = this.getToolTip.bind(this);
	}
	componentDidMount() {
		// body...
		var tooltipSymlink = ''
		if(this.props.params){
			if(this.props.params[0]['@labels'] == 'OutputSrc'){
				tooltipSymlink = this.props.outputs[this.props.value[0]]
			}
		}
		this.setState({value:this.props.value.slice(0), tooltipSymlink:tooltipSymlink})
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close(0);
		}
		
	}
	close(v) {
		// body...
		if(this.props.show){
			//console.log(3709, v)
			this.props.close(v);
		}
	}
	select(v, i) {
		// body...
		var tooltipSymlink = this.state.tooltipSymlink;
		if(this.props.params){
			if(i == 0 && this.props.params[0]['@labels'] == 'OutputSrc'){
				tooltipSymlink = this.props.outputs[v]
			}
		}
		var values = this.state.value
		values[i] = v;
		this.setState({value:values, tooltipSymlink:tooltipSymlink})
		//////console.log([2913,v])
	}
	getToolTip(t){
		if(this.props.getToolTip){
			return this.props.getToolTip(t)
		}
		else return 'N/A'
	}
	accept() {
		var self = this;
		//////console.log(['accept',this.props.value[0], this.state.value[0]])
		if(this.props.value[0] != this.state.value[0]){
			//////console.log('wtf')
			this.props.onChange(this.state.value[0], 0)
			if(this.props.value.length > 1){
				if(this.props.value[1] != this.state.value[1]){
					setTimeout(function () {				// body...
						self.props.onChange(self.state.value[1],1);
						if(self.props.value.length > 2){
							if(self.props.value[2] != self.state.value[2]){
								setTimeout(function () {
									self.props.onChange(self.state.value[2],2)
									self.close(1);
								},80)
							}else{
								self.close(1);
							}
						}else{
							self.close(1);
						}
					},80)
				}else{
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close(1);
						},80)
					}else{
						self.close(1);
					}
				}
			}else{
				this.close(1);
			}
		}else if(this.props.value.length > 1){
			if(this.props.value[1] != this.state.value[1]){
				this.props.onChange(this.state.value[1],1);
				if(this.props.value.length > 2){
					if(this.props.value[2] != this.state.value[2]){
						setTimeout(function () {
							self.props.onChange(self.state.value[2],2)
							self.close(1);
						},80)
					}else{
						self.close(1);
					}
				}else{
					self.close(1);
				}
			}else{
				if(this.props.value[2] != this.state.value[2]){
					this.props.onChange(this.state.value[2],2)
				}
			this.close(1);
				
			}
		}else{
			this.close(1);
		}


	}
	help () {
		this.refs.helpModal.toggle();
	}
	translateTooltip(){
		this.refs.transModal.toggle();

	}
	curtrnChange(e){
		this.setState({curtrans:e.target.value})
	}
	submitTooltip(){
		if(typeof this.props.submitTooltip != 'undefined'){
			this.props.submitTooltip(this.state.curtrans)
		}
		
	}
	render () {
		// body...
		var self = this;
		var hs = this.props.options.map(function(op) {
			// body...
			return op.length*60
		})
		var height = hs.reduce(function(a,b){ return Math.max(a,b)});
		if(height > 315){
			height = 315;
		}
		if(this.props.mobile){
			height = 200
		}
		var isIO = false;
		var ioIND = false;
		var ioLED = ''
		var tooltipSymlink = ''

		if(this.props.params){
		if(this.props.params[0]['@labels'] == 'InputSrc' || this.props.params[0]['@labels'] == 'OutputSrc'){
			isIO = true;
		}

		if(isIO){
			if(this.props.params[0]['@labels'] == 'InputSrc'){
				if(this.props.ioBits[this.props.inputs[this.state.value[0]]] == 0){
					ioIND = !(parseInt(this.state.value[1]) == 0)
				}else{
					ioIND = (parseInt(this.state.value[1]) == 0)
					
				}
				if(this.state.value[0] == 0){
					ioIND = false
				}
			}else if(this.props.params[0]['@labels'] == 'OutputSrc'){
				tooltipSymlink = this.props.outputs[this.state.value[0]]
				if(this.props.ioBits[this.props.outputs[this.state.value[0]]] == 0){
					ioIND = !(parseInt(this.state.value[1]) == 0)
				}else{
					ioIND = (parseInt(this.state.value[1]) == 0)

				}
				if(this.state.value[1] == 2){
					ioIND = false;
				}else if(this.state.value[1] == 3){
					ioIND = true;
				}
				if(this.state.value[0] == 0){
					ioIND = false;
				}
			}
		}
	}

		if(ioIND){
			ioLED = <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#5d5'}}></div>
		}
		var wheels;
		var helpStyle = {float:'right', display:'inline-block', marginLeft:-50, marginRight:15, marginTop:6};
		if(this.state.value.length == 1){
			//helpStyle.position = 'absolute'
			wheels  = this.state.value.map(function (m,i) {
				var params = null;
				if(self.props.params){
					params = self.props.params[i]
				}
			// body...
			return <PopoutWheelSelector ovWidth={self.props.ovWidth} inputs={self.props.inputs} outputs={self.props.outputs} params={params}  height={height} ioBits={self.props.ioBits} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}else{
			wheels  = this.state.value.map(function (m,i) {
			// body...
		//	//////console.log(['2258',self.props.vMap,i])
		  	var lb = ''
		  	if(typeof self.props.vMap != 'undefined'){
		  		////console.log(3321, self.props.vMap)
		  		lb = 	vdefMapV2['@labels'][self.props.vMap['@labels'][i]][self.props.language]['name']
				
		  	}	
		  	var params = null;
				if(self.props.params){
					params = self.props.params[i]
					//console.log(params)
				}
			// body...
			return <PopoutWheelSelector ovWidth={self.props.ovWidth} inputs={self.props.inputs} outputs={self.props.outputs} params={params}  height={height} ioBits={self.props.ioBits} label={lb} interceptor={self.props.interceptor} Id={self.props.name+i} value={m} options={self.props.options[i]} index={i} onChange={self.select}/>
			})
		}
		
		var tooltiptext = 'N/A'
		////console.log(this.props.vMap)
		if(typeof this.props.vMap != 'undefined'){
			if(this.props.vMap['@translations'][self.props.language]['description'].length >0){
				tooltiptext = this.props.vMap['@translations']['english']['description'];
			}
		}
		if(tooltipSymlink.length > 0){
			tooltiptext = this.getToolTip(tooltipSymlink);
		}
		if(this.props.tooltipOv){
			tooltiptext = this.props.tooltip;
		}
		var minW = 400
		var maxW = 346
		if(this.props.mobile){
			minW = 300
			maxW = 246
		}
		var fontSize = 30;
		
		if(this.props.name.length > 15){
			fontSize = 26;
		}
		if(this.props.name.length > 20){
			fontSize = 22
		}
		if(this.props.name.length > 24){
			fontSize = 20
		}
		if(this.props.mobile){
			fontSize -= 2
		}
		var klass = 'selectmodal-outer'
		var klr = '#fefefe'
		if(this.props.branding  == 'SPARC'){
			klass = 'selectmodalo-sp'
			klr = '#010101'
		}
		var st = {minWidth:minW, marginTop:60}
		var tttxt = <div  style={{whiteSpace:'pre-wrap', textAlign:'left'}}>{tooltiptext}</div>
		if(self.props.params){
			var cmenuid = self.props.params.map(function (p) {
				return p['@name']				// body...
			}).join('-') + 'tttxt'
			tttxt = <React.Fragment>
			<div style={{textAlign:'center', borderBottom:'1px solid #e1e1e1'}}><label>{this.props.name}</label></div>
			<div  style={{whiteSpace:'pre-wrap', textAlign:'left'}}><ContextMenuTrigger id={cmenuid}>{tooltiptext}</ContextMenuTrigger></div>
			<ContextMenu id={cmenuid}>
				<MenuItem onClick={this.translateTooltip}>Translate Tooltip</MenuItem>
			</ContextMenu>
			</React.Fragment>
		}
		////console.log(tooltiptext)
	  return( <div className={klass} style={{minWidth:minW, marginTop:60}}>

	  		<div style={{display:'inline-block', marginRight:'auto', marginLeft:'auto', textAlign:'center', color:klr, maxWidth:maxW, fontSize:fontSize}}>{ioLED}{this.props.name}</div>
	  		<div  style={helpStyle}><img src='assets/help.svg' onClick={this.help} width={30}/></div>
	  		<div style={{textAlign:'center', padding:5}}>
	  		{wheels}
	  		</div>
	  		<div>
	  		<CircularButton branding={this.props.branding} style={{height:45,display:'inline-block', border:'5px solid #808a90', marginLeft:2, marginRight:2, color:'#e1e1e1', width:156, borderRadius:25, fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={this.accept} lab={vdefMapV2['@labels']['Accept'][this.props.language].name}/>
		<CircularButton branding={this.props.branding} style={{height:45, display:'inline-block', marginLeft:2, marginRight:2, border:'5px solid #808a90',color:'#e1e1e1', width:156, borderRadius:25,fontSize:30, lineHeight:'50px', display:'inline-block'}} onClick={()=> this.close(0)} lab={vdefMapV2['@labels']['Cancel'][this.props.language].name}/>
	  	</div>	<Modal ref='helpModal' Style={{color:'#e1e1e1',width:600}}>
	  		{tttxt}
	  		</Modal>
	  		<Modal ref='transModal' Style={{color:'#e1e1e1',width:600}}>
	  		 <textarea type='text' style={{fontSize:20, width:400, height:100}} value={this.state.curtrans} onChange={this.curtrnChange}/>
	  		 <button onClick={this.submitTooltip}>Submit Change</button>
	  		</Modal>
	  </div>)

	}
}
var PopoutWheelModalCont =  onClickOutside(PopoutWheelModalC);

class PopoutWheelSelector extends React.Component{
	constructor(props) {
		super(props)
		this.select = this.select.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
		this.scrollUp = this.scrollUp.bind(this);
		this.scrollDown = this.scrollDown.bind(this);

	}
	select (i) {
		// body...
		this.props.onChange(i, this.props.index)
	}
	componentDidMount () {
		// body...
		//scrollToComponent(this.refs[this.props.options[this.props.value].toString()], { offset: 0, align: 'top', duration: 500})
		setScrollTop(this.props.Id,54*this.props.value)
	}
	handleScroll () {
		// body...
		 var el = document.getElementById(this.props.Id)		
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
	scrollUp () {
		// body...
		_scrollById(this.props.Id,-225,200);
	}
	scrollDown () {
		// body...
		_scrollById(this.props.Id,225,200);
		//setScrollTop(this.props.Id, document.getElementById(this.props.Id).scrollTop + 200)
	}
	render () {
		// body...
		var self = this;
		var sa = this.props.options.length > 6
		var ioled = ''
		var iob = false
		var options = this.props.options.map(function (o,i) {
			var active = true;
			if(self.props.ioBits){
				if(self.props.params){
					if(self.props.params['@labels'] == 'InputSrc'){
						iob = true;
						if(typeof self.props.inputs != 'undefined'){
							if(self.props.ioBits[self.props.inputs[i]] == 0){
								active = false;
							}
						}else if(self.props.ioBits[inputSrcArr[i]] == 0){
							active = false;
						}
					}else if(self.props.params['@labels'] == 'OutputSrc'){
						iob = true;
						if(typeof self.props.outputs != 'undefined'){
							if(self.props.ioBits[self.props.outputs[i]] == 0){
								active = false;
							}
						}else if(self.props.ioBits[outputSrcArr[i]]==0){
							active = false;
						}
					}
				}
			}
			// body...
			if(i == self.props.value){
				if(active && iob){
				//	ioled = <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#5d5'}}></div>
				}

				return <SelectSCModalRow iob={iob} ovWidth={self.props.ovWidth} active={active} ref={o.toString()} onClick={self.select} value={o} index={i} selected={true}/>
			}else{
				return <SelectSCModalRow iob={iob} ovWidth={self.props.ovWidth} active={active} ref={o.toString()} onClick={self.select} value={o} index={i} selected={false}/>
			}
		})
		var ul;
		if(this.props.label){
			ul = <div style={{color:"#ccc", marginTop:-16, lineHeight:1.5,display:'block'}}>{this.props.label}</div>
		}
		var width = 230
		if(typeof this.props.ovWidth != 'undefined'){
			width = this.props.ovWidth + 50
		}
		return(
			<div style={{display:'inline-block'}}>
			{ul}{ioled}
			<ScrollArrow ref='arrowTop' active={sa} offset={48} width={48} marginTop={-25}  mode={'top'} onClick={this.scrollUp}/>
			<div id={this.props.Id} onScroll={this.handleScroll} style={{width:width, height:this.props.height, overflowY:'scroll', padding:5, marginLeft:5, marginRight:5, background:'rgba(200,200,200,1)'}}>
				{options}
			</div>
			<ScrollArrow ref='arrowBot' active={sa} offset={48} width={48} marginTop={-20} mode={'bot'} onClick={this.scrollDown}/>
		
			</div>)
		
	
	}
}
class SelectSCModalRow extends React.Component{
	constructor(props) {
		super(props)
		this.onClick = this.onClick.bind(this);
	}
	onClick () {
		// body...
		if(!this.props.selected){
			this.props.onClick(this.props.index)
		}
		
	}
	render () {
		// body...
		var check= ""
		var ioled = ''
		var style = {textAlign:'center', position:'relative'}
		if(this.props.selected){
			check = <img src="assets/Check_mark.svg"/>
			style ={textAlign:'center',background:'rgba(150,150,150,0.5)', position:'relative'}
			
		}
		if(this.props.iob){
			if(this.props.active){
				ioled =  <div style={{position:'absolute', width:30, height:30, left:15, top:10, borderRadius:15, background:'#5d5'}}></div>
				//style.color = "#666"
			}
		}
		
		var width = 180
		if(typeof this.props.ovWidth != 'undefined'){
			width = this.props.ovWidth
		}
		return (<div onClick={this.onClick} style={style}>{ioled}
			<div style={{width:22, display:'table-cell'}}>{check}</div><div style={{width:width, display:'table-cell', lineHeight:'54px', height:54}}>{this.props.value}</div><div style={{width:22, display:'table-cell'}}></div></div>)
		
	}
}

export {PopoutWheel}