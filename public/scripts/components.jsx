var React = require('react');
var ReactDom = require('react-dom')
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
var createReactClass = require('create-react-class');
var onClickOutside = require('react-onclickoutside');
const vdefMapV2 = require('./vdefmap.json')


function yRangeFunc(range){
	var max = 200;
	if(Math.abs(range.max) > max){
		max = Math.min(1500,Math.abs(range.max))
	}
	if(Math.abs(range.min) > max){
		max = Math.min(1500,Math.abs(range.min))
	}
	return({min:(0-max),max:max});
}

class ScrollArrow extends React.Component{
	constructor(props) {
		super(props)
		// body...
		if(this.props.mode == 'top'){
			this.state = {visible:false}
		}else{
			this.state = {visible:true}
		}
		this.hide = this.hide.bind(this)
		this.show = this.show.bind(this)
		this.onClick = this.onClick.bind(this);
	}
	hide() {
		// body...
		if(this.state.visible){
			this.setState({visible:false})
		}
	}
	show () {
		// body...
		if(!this.state.visible){
			this.setState({visible:true})
		}
	}
	onClick () {
		// body...
		if(this.props.onClick){
			this.props.onClick();
		}
	}
	render () {
		// body...
		if(this.props.mode == 'top'){
			return <div className='scrollArrow' hidden={!(this.props.active && this.state.visible)}>
						<svg onClick={this.onClick} style={{position:'fixed',zIndex:2,marginTop:this.props.marginTop,marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'}} xmlns="http://www.w3.org/2000/svg" fill="#e1e1e1" viewBox="0 0 24 24" ><path stroke="#000"  d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>								
					</div>
		}
		return <div className='scrollArrow' hidden={!(this.props.active && this.state.visible)}>
			<svg onClick={this.onClick} style={{position:'fixed',zIndex:2,marginTop:this.props.marginTop, marginLeft:this.props.width/-2,marginRight:'auto',width:this.props.width,height:this.props.width, strokeWidth:'2%'	}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e1e1e1"><path stroke="#000"  d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/></svg>								
		</div>
	}
}

class GraphModal extends React.Component{
	constructor(props) {
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.toggle = this.toggle.bind(this);
	}
	toggle () {
		var self = this;
		if(!this.state.override){
			if(this.props.show){
			this.setState({show:false, override:true})

		
			setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})
				if(typeof self.props.onClose != 'undefined'){
			
					self.props.onClose();
				}
			},50)
			}else{
				this.setState({show:true, override:true})

		
				setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})

				},50)
			}
		}

		
	}
	render () {
		var cont = '';
		var h = !this.props.show
		if(typeof this.props.override != 'undefined'){
			if(this.props.override == 1){
				h = false
			}else{
				h = true
			}
		}


		if(!h){
			
			cont = (<GModalCont toggle={this.props.onClose} Style={this.props.Style} innerStyle={this.props.innerStyle}>
				{this.props.children}
			</GModalCont>)
		}

		return(<div className={this.state.className} hidden={h}>
			{cont}
		</div>)
	}
}
class GModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {keyboardVisible:false}
		this.toggle = this.toggle.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}
	toggle(){
		this.props.toggle()
	}
	handleClickOutside(e){
		if(!this.state.keyboardVisible){
			this.props.toggle();	
		}	
	}
	render() {
		var style= this.props.Style || {}
		var cs = this.props.innerStyle || {}
		var button = 	<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
			
				return (<div className='modal-outer' style={style}>
				<div className='modal-content' style={cs}>
					{this.props.children}
				</div>
				</div>)
	
	}
}
var GModalCont = onClickOutside(GModalC);
class Modal extends React.Component{
	constructor(props) {
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.toggle = this.toggle.bind(this);
		this.updateMeter =this.updateMeter.bind(this);
		this.updateSig = this.updateSig.bind(this);
		this.clear = this.clear.bind(this);
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
	}
	componentWillReceiveProps (newProps){
		if(typeof newProps.override != 'undefined'){
			if(newProps.override == 0){
				this.setState({show:false})
			}else{
				this.setState({show:true})
			}
			
		}
	}
	show(){
		this.setState({show:true})
	
	}
	close(){
		var self = this;
		////console.log(4530, self.props.onClose)
	
		this.setState({show:false})
		setTimeout(function(){
				if(typeof self.props.onClose != 'undefined'){
			
				self.props.onClose();
			}
			//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
			self.setState({override:false})
			
		},50)
	}
	toggle () {
		var self = this;
		if(this.state.keyboardVisible){
			return
		}
		if(!this.state.override){
			if(this.state.show){
				this.close()
			}else{
				this.setState({show:true, override:true})

		
				setTimeout(function(){
				//hack - sometimes the open and close will fire simultaneously, disable closing in the 50 ms after opening
				self.setState({override:false})

				},50)
			}
		}

		
	}
	updateMeter (a,b) {
		// body...
		if(this.state.show){
			this.refs.mb.update(a,b)
		}
		
	}
	clear (c) {
		// body...
		var p = 'Peak'
		if(c == 0){
			p = 'Peak_A'
		}else if(c == 1){
			p = 'Peak_B'
		}
		this.props.clear(c)
	}
	updateSig (a,b) {
		// body...
		if(this.state.show){
			if((typeof b != 'undefined')){
				if(this.refs.mb.state.sig != a || this.refs.mb.state.sigB != b){
					this.refs.mb.setState({sig:a,sigB:b})
				}
			}else{
				if(this.refs.mb.state.sig != a ){
					this.refs.mb.setState({sig:a})
				}
			}
		}
		
	}
	render () {
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
			var im =''
		//	if(this.props.intMeter){
				//im = <InterceptorMeterBar ref='mb' clear={this.clear} mobile={this.props.mobile}/>
		//	}
			if(this.props.dfMeter){
				im = <StealthMeterBar ref='mb' clear={this.clear} mobile={this.props.mobile}/>
			}
				cont = (<ModalCont toggle={this.toggle} Style={this.props.Style} innerStyle={this.props.innerStyle} mobile={this.props.mobile}>
					{im}
			
			{this.props.children}
		</ModalCont>)
		

		return(<div className={this.state.className} hidden={h}>
			{cont}
	</div>)
	}
	else{
		return null;
	}
	}
}
class ModalC extends React.Component{
	constructor(props){
		super(props);
		this.state = {keyboardVisible:false}
		this.toggle = this.toggle.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}
	toggle(){
		this.props.toggle()
	}
	handleClickOutside(e){
		if(!this.state.keyboardVisible){
			this.props.toggle();	
		}	
	}
	render() {
		var style= this.props.Style || {}
		var cs = this.props.innerStyle || {}
		var button = ''
		
		if(this.props.mobile){
			cs.padding = 7;
			cs.maxHeight = '83%'
			cs.overflow = 'scroll'
			style.maxHeight = '83%'
			style.overflow = 'scroll'
			button = <button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
		}

				return (<div className='modal-outer' style={style}>
					{button}
				<div className='modal-content' style={cs}>
					{this.props.children}
				</div>
				</div>)
	
	}
}
var ModalCont = onClickOutside(ModalC);

class StealthMeterBar extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({sig:0, sigB:0})
		this.update = this.update.bind(this);
		this.onSig = this.onSig.bind(this);
	}
	update (a) {
		this.refs.tb.update(a);
	
	}
	onSig() {
		this.props.clear(2)
	}
	render () {
		// body...
		var tbstyle = {display:'inline-block', width:700, padding:5}
		var sigStyle = {color: 'black'}
		var sigWrapperSytle = {display:'inline-block'}
		if(this.props.mobile){
			tbstyle.width = '100%'
			tbstyle.padding = 0;
			tbstyle.height = 15;
			tbstyle.overflow = 'hidden'
			//sigStyle.width = '100%'
			//sigWrapperSytle.width = '10%'
			sigWrapperSytle.display = 'none'
		}
		return(<div style={{background: 'rgb(129, 138, 144)', borderRadius:15,border:'5px solid #818a90', boxShadow:'0 0 14px black', marginBottom:3}}>
			<div style={sigWrapperSytle}>
			<div className='intmetSig' style={sigStyle} onClick={this.onSig}>{this.state.sig}</div></div><div style={tbstyle}><TickerBox ref='tb'/></div>
				</div>)
	}
}
class TickerBox extends React.Component{
	constructor(props) {
		super(props)
		this.state = {ticks:0}
		this.update = this.update.bind(this);
	}
	update(data) {
		this.setState({ticks:data})
	}
	render(){
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
}
class CanvasElem extends React.Component{
	constructor(props){	
		super(props)
		this.line = new TimeSeries();
		this.line_b = new TimeSeries();
		this.line_com = new TimeSeries();
		this.smoothie = new SmoothieChart({millisPerPixel:this.props.mpp,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
			horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],
			labels:{fillStyle:'#808a90'}, grid:{millisPerLine:2000,fillStyle:'rgba(256,256,256,0)'}, yRangeFunction:yRangeFunc, maxDataSetLength:700, minDataSetLength:300, limitFPS:15});
		
		this.state =  ({update:true})
		this.stream = this.stream.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
	}
	componentWillUnmount(){
		this.smoothie.stop();
		this.smoothie = null;
		this.line = null;
		this.line_b
		this.line_com = null;
	}
	shouldComponentUpdate(){
		return false;
	}
	pauseGraph(){
		this.setState({update:false})
		this.smoothie.stop()
		//this.state.smoothie.setTargetFPS(8)
	}
	restart(){
		this.setState({update:true})
		this.smoothie.start()
		//this.state.smoothie.setTargetFPS(15)
	}
	componentDidMount(){
		this.smoothie.streamTo(document.getElementById(this.props.canvasId));
		if(this.props.df){
			this.smoothie.addTimeSeries(this.line_com, {lineWidth:2,strokeStyle:'rgb(0, 128, 128)'});
			this.smoothie.addTimeSeries(this.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		}else if(this.props.int){
			this.smoothie.addTimeSeries(this.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		
		}else{
			this.smoothie.addTimeSeries(this.line, {lineWidth:2,strokeStyle:'#ff00ff'});
	
		}
	}
	stream(dat) {
		if(this.state.update){
		this.line.append(dat.t, dat.val);
		if(this.props.df){
			var combVal = dat.valCom
			if(this.props.combineMode == 1){
				combVal = (dat.val + dat.valb)*this.props.sens/this.props.thresh
			}else{
				combVal = Math.max(dat.val, dat.valb)*this.props.sens/this.props.thresh
			}
			this.line_com.append(dat.t, combVal)
			
		
		} 
		if(this.props.int){
			this.line_b.append(dat.t, dat.valb)
				
		}
	}

	}

		render(){
			console.log('rendering canvas')
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
}
class DummyGraph extends React.Component{
	constructor(props) {
		super(props)
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		this.state = ({width:480, height:230, mqls:mqls})
	}
	listenToMq () {
	}
	componentDidMount () {
		this.listenToMq()
	}
	renderCanv () {
		return(<CanvasElem df={this.props.df} canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int} mpp={20}/>)
	}
	stream (dat) {
		this.refs.cv.stream(dat)
	}
	render () {
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			{cv}
			</div>)
	}

}
class SlimGraph extends React.Component{
	constructor(props) {
		super(props)
		/*var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}*/
		this.state = ({width:480, height:215, popUp:false})
		this.toggle = this.toggle.bind(this);
		this.stream = this.stream.bind(this);
		this.pauseGraph = this.pauseGraph.bind(this);
		this.restart = this.restart.bind(this);
	}
	pauseGraph(){
		//console.log('lower res')
		this.refs.cv.pauseGraph();
	}
	restart(){
		this.refs.cv.restart();
	}
	listenToMq () {
		// body...
		if(this.state.mqls[3].matches){
			this.setState({width:480})
		}else if(this.state.mqls[2].matches){
			this.setState({width:558})
		}else if(this.state.mqls[1].matches){
			this.setState({width:480})
		}else{
			this.setState({width:280})
		}
	}
	componentDidMount () {
		//this.listenToMq()
	}
	renderCanv () {
		if(this.state.popUp){
			return <GraphModal Style={{maxWidth:950,width:950,marginTop:100, background:'#000'}} innerStyle={{backgroundColor:'black'}} show={true} onClose={this.toggle}>
				<CanvasElem combineMode={this.props.combineMode} sens={this.props.sens} thresh={this.props.thresh} df={true} canvasId={this.props.canvasId} ref='cv' w={900} h={400} int={this.props.int} mpp={13}/>
			</GraphModal>
		}
		return(<CanvasElem combineMode={this.props.combineMode} sens={this.props.sens} thresh={this.props.thresh} df={true} canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height} int={this.props.int} mpp={28}/>)
	}
	stream (dat, ov) {
		if(!ov){
			this.refs.cv.stream(dat)
		}
		
	}
	toggle(){
		var self = this;
		setTimeout(function(){
			self.setState({popUp:!self.state.popUp})
		},100)
		
	}
	render () {
		//img src='assets/fullscreen.svg'
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			<div  style={{position:'absolute', top:76,left:63, width:350,height:140}} onClick={this.toggle}/>
			{cv}
			</div>)
	}

}
class AuthfailModal extends React.Component{
	constructor(props){
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false,userid:0,ip:'0.0.0.0'});
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		this.forgot = this.forgot.bind(this);
	}
	show (userid, ip) {
		this.setState({show:true, userid:userid,ip:ip})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	forgot(){
		this.props.forgot(this.state.userid,this.state.ip);
	}
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <AFModalCont vMap={this.props.vMap} accept={this.forgot} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.props.children}</AFModalCont>
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
class AFModalC extends React.Component{
	constructor(props){
		super(props);
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	componentDidMount() {
		// body...
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	}
	close() {
		// body...
		if(this.props.show){
			this.props.close();
		}
	}
	accept(){
		var self = this;
		this.props.accept();
		setTimeout(function(){
			if(self.props.show){
			self.props.close();
			}
		}, 100)
		
	}
	cancel(){
		var self = this;
		setTimeout(function(){
			self.close();
			
		}, 100)
	}
	render () {
		// body...
		var self = this;
		
	  return( <div className='alertmodal-outer'>
	  			<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>Authentication Failed</div>
	  			{this.props.children}
				<div><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.cancel}>Try Again</button>
				<button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.accept}>Forgot</button></div>
	  		
		  </div>)

	}
}
var AFModalCont =  onClickOutside(AFModalC);
class MessageModal extends React.Component{
	constructor(props){
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false,message:''});
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		
	}
	show (message) {
		this.setState({show:true,message:message})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <MModalCont vMap={this.props.vMap} accept={this.close} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}><div style={{color:'#e1e1e1'}}>{this.state.message}</div></MModalCont>
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
class MModalC extends React.Component{
	constructor(props){
		super(props);
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	componentDidMount() {
		// body...
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	}
	close() {
		// body...
		if(this.props.show){
			this.props.close();
		}
	}
	accept(){
		var self = this;
		this.props.accept();
		setTimeout(function(){
			if(self.props.show){
			self.props.close();
			}
		}, 100)
		
	}
	cancel(){
		var self = this;
		setTimeout(function(){
			self.close();
			
		}, 100)
	}
	render () {
		// body...
		var self = this;
		
	  return( <div className='alertmodal-outer'>
	  			<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>Attention</div>
	  			{this.props.children}
				<div><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.cancel}>Cancel</button><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.accept}>Confirm</button></div>
	  		
		  </div>)

	}
}
var MModalCont =  onClickOutside(MModalC);

class AlertModal extends React.Component{
	constructor(props){
		super(props)
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		this.state = ({className:klass, show:false, override:false ,keyboardVisible:false});
		this.show = this.show.bind(this);
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
	}
	show () {
		this.setState({show:true})
	}
	close () {
		var self = this;
		setTimeout(function () {
			self.setState({show:false})
		},100)
		
	}
	accept(){
		this.props.accept();
	}
	render () {
		var	cont = ""
		if(this.state.show){
		cont =  <AlertModalCont vMap={this.props.vMap} accept={this.accept} language={this.props.language} interceptor={this.props.interceptor} name={this.props.name} show={this.state.show} onChange={this.onChange} close={this.close} value={this.props.value} options={this.props.options}>{this.props.children}</AlertModalCont>
		}
		return <div hidden={!this.state.show} className= 'pop-modal'>
	{/*	<div className='modal-x' onClick={this.close}>
			 	 <svg viewbox="0 0 40 40">
    				<path className="close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" />
  				</svg>
			</div>*/}
			{cont}
		</div>
	}
}
class AlertModalC extends React.Component{
	constructor(props){
		super(props);
		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.close = this.close.bind(this);
		this.accept = this.accept.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	componentDidMount() {
		// body...
	}
	handleClickOutside(e) {
		// body...
		if(this.props.show){
			this.props.close();
		}
		
	}
	close() {
		// body...
		if(this.props.show){
			this.props.close();
		}
	}
	accept(){
		var self = this;
		this.props.accept();
		setTimeout(function(){
			if(self.props.show){
			self.props.close();
			}
		}, 100)
		
	}
	cancel(){
		var self = this;
		setTimeout(function(){
			self.close();
			
		}, 100)
	}
	render () {
		// body...
		var self = this;
		
	  return( <div className='alertmodal-outer'>
	  			<div style={{display:'inline-block', width:400, marginRight:'auto', marginLeft:'auto', textAlign:'center', color:'#fefefe', fontSize:30}}>Confirm Action</div>
	  			{this.props.children}
				<div><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.accept}>Confirm</button><button style={{height:60, border:'5px solid #808a90',color:'#e1e1e1', background:'#5d5480', width:160, borderRadius:25,fontSize:30, lineHeight:'50px'}} onClick={this.close}>Cancel</button></div>
	  		
		  </div>)

	}
}
var AlertModalCont =  onClickOutside(AlertModalC);

class MessageConsole extends React.Component{
	constructor(props){
		super(props)
		this.state =  {prodName:'PRODUCT 1',cip:0,cipSec:0}
		this.clearFaults = this.clearFaults.bind(this);
		this.clearRejLatch = this.clearRejLatch.bind(this);
		this.clearWarnings = this.clearWarnings.bind(this);
		this.renderOverlay = this.renderOverlay.bind(this);
		this.onClick = this.onClick.bind(this);
	}
	clearWarnings(){
		this.props.clearWarnings();
	}
	clearFaults(){
		this.props.clearFaults();
	}
	clearRejLatch(){
		this.props.clearRejLatch();
	}
	onClick(){
		if(this.props.faultArray.length>0){
			this.refs.fModal.toggle();
		}else if(this.props.testReq != 0){
			this.props.toggleTest();
		}else if(this.props.rejLatch ==1){
			this.refs.fModal.toggle();
		}
	}
	renderOverlay(){
		var self = this;
		var fActive = (this.props.faultArray.length > 0)
		var left = 'dfnavTabLeft'
		var center = 'dfnavTabCent'
		var right = 'dfnavTabRight'
		var fCont = <div style={{color:"#e1e1e1"}}>{vdefMapV2['@labels']["No Faults"][this.props.language].name}</div>
		var bgColor = 'rgba(150,150,150,0.3)'
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:'100%', height:88, marginLeft:'auto', marginRight:'auto', marginTop:10}
		var line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Running Product'][this.props.language]['name']}</div>
		var line2 = 	<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.prodName}</div>
		var textColor = '#eee'
		if(fActive){
			var fref = 'Faults'
			var wref = 'Warnings'
			var fstr = this.props.faultArray.length + " " +vdefMapV2['@labels'][fref][this.props.language].name
			var wstr = ''
			if(this.props.warningArray.length > 0){
				var faultCount = this.props.faultArray.length - this.props.warningArray.length;
				if(faultCount == 0){
					fstr = this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}else{

					if(faultCount == 1){
						fref = 'Fault'
					}
					if(this.props.warningArray.length == 1){
						wref = 'Warning'
					}
					fstr = faultCount + " " + vdefMapV2['@labels'][fref][this.props.language].name; 
					wstr =  this.props.warningArray.length + " " +vdefMapV2['@labels'][wref][this.props.language].name
				}
			}
			if(this.props.faultArray.length == 1){
				fstr = vdefMapV2['@vMap'][this.props.faultArray[0]+'Mask']['@translations'][this.props.language]['name'];
				if(this.props.warningArray.length == 1){
					var fArr = fstr.split(' ').slice(0,-1);
					fArr.push(vdefMapV2['@labels']["Warning"][this.props.language].name)
					fstr = fArr.join(' ');
				}
			}
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{fstr}</div>
			line2 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{wstr}</div>	//<div style={{display:'block', height:34, width:330, fontSize:25}}><button hidden onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button></div>
			bgColor = 'yellow'
			left = 'dfnavTabLeft_f'
			center = 'dfnavTabCent_f'
			right = 'dfnavTabRight_f'
			var clrButtons = ''
			if(this.props.warningArray.length == this.props.faultArray.length){
					clrButtons =  <button onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
				}else if(this.props.warningArray.length != 0){
						clrButtons =  <React.Fragment><button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}} onClick={this.clearWarnings}>{vdefMapV2['@labels']['Clear Warnings'][this.props.language]['name']}</button>
											 <button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}} onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
						</React.Fragment>
				}else{
					clrButtons =  <button  style={{display:'block', marginLeft:'auto', marginRight:'auto', height:40, border:'5px solid #808a90', color:'#e1e1e1', background:'#5d5480', width:165, borderRadius:20, fontSize:20}} onClick={this.clearFaults}>{vdefMapV2['@labels']['Clear Faults'][this.props.language]['name']}</button>
				
				}
			fCont = <div style={{color:"#e1e1e1"}}>{this.props.faultArray.map(function (f) {
				if(self.props.warningArray.indexOf(f) != -1){
					return <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']+ ' - '+ vdefMapV2['@labels']["Warning"][self.props.language].name}</div>
				}
				return  <div>{vdefMapV2['@vMap'][f+'Mask']['@translations'][self.props.language]['name']}</div>
			})}{clrButtons}</div>
		}else if(this.props.rejOn == 1){
			textColor = '#333'
			left = 'dfnavTabLeft_r'
			center = 'dfnavTabCent_r'
			right = 'dfnavTabRight_r'
			if(this.props.rejLatch == 1){
				fCont = <div style={{color:"#e1e1e1"}}><button onClick={this.clearRejLatch}>{vdefMapV2['@labels']['Clear Reject Latch'][this.props.language].name}</button></div>
				line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Reject Latched'][this.props.language]['name']}</div>
				line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Clear Latch'][this.props.language]['name']}</div>
			}
		}else if(this.props.testReq == 1){
			left = 'dfnavTabLeft_t'
			center = 'dfnavTabCent_t'
			right = 'dfnavTabRight_t'
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Test in progress'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.status}</div>
		}else if(this.props.testReq == 2){
			left = 'dfnavTabLeft_tf'
			center = 'dfnavTabCent_tf'
			right = 'dfnavTabRight_tf'
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Test required'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{this.props.status}</div>
		}

		if(this.props.isSyncing){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Syncing'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}
		if(this.state.cipSec){
			left = 'dfnavTabLeft_tf'
			center = 'dfnavTabCent_tf'
			right = 'dfnavTabRight_tf'
			line1 =  <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Time left'][this.props.language].name + ': '+ this.state.cipSec}</div>

		}
		if(this.state.cip){
			line1 =  <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Clean mode'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>PLC</div>

		}

		if(this.props.isUpdating){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Updating Detector'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>
		}else if(this.props.offline){
			line1 = <div style={{display:'block', height:34, width:'100%', marginBottom:-3}}>{vdefMapV2['@labels']['Trying to reconnect'][this.props.language].name}</div>
			line2 =<div style={{display:'block', height:34, width:'100%', fontSize:25}}>{vdefMapV2['@labels']['Please Wait'][this.props.language].name}</div>

		}
		return (<div className='interceptorNavContent' style={wrapper}>
			<div style={{paddingTop:0, color:textColor}}>
			<div className='noPadding' onClick={this.onClick}>
				<div className={center}>
				{line1}{line2}
				</div>
			</div>
			</div>
			<div>
			{this.props.children}
			</div>
			<Modal ref='fModal' mobile={this.props.mobile}>
				{fCont}
			</Modal>
				</div>)
			
	}
	render() {
		return this.renderOverlay();	
	}
}
module.exports = {}
module.exports.TickerBox = TickerBox;
module.exports.CanvasElem = CanvasElem;
module.exports.SlimGraph = SlimGraph;
module.exports.DummyGraph = DummyGraph;
module.exports.Modal = Modal
module.exports.GraphModal = GraphModal
module.exports.AuthfailModal = AuthfailModal;
module.exports.MessageModal = MessageModal;
module.exports.AlertModal = AlertModal;
module.exports.MessageConsole = MessageConsole;
module.exports.ScrollArrow = ScrollArrow;