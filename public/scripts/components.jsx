var React = require('react');
var ReactDom = require('react-dom')
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
var createReactClass = require('create-react-class');




class TreeNode extends React.Component{
	constructor(props){		
		super(props) 
		this.state = ({hidden:true})
		this.toggle = this.toggle.bind(this)
	}
	toggle(){
		var hidden = !this.state.hidden
		this.setState({hidden:hidden});
	}
	render(){
		////console.log("render")
		var cName = "collapsed"
		if(!this.state.hidden){
			cName = "expanded"
		}
		return (
			<div hidden={this.props.hide} className="treeNode">
				<div onClick={this.toggle} />
				<div className="nodeName">
					<label className={cName} onClick={this.toggle}>{this.props.nodeName}</label>
				</div>
				<div className="innerDiv" hidden={this.state.hidden}>
				{this.props.children}
				</div>
			</div>
		)
	}
}

var placeholder = document.createElement("li");
placeholder.className = "placeholder";



function yRangeFunc(range){
	var max = 200;
	if(Math.abs(range.max) > max){
		max = Math.abs(range.max)
	}
	if(Math.abs(range.min) > max){
		max = Math.abs(range.min)
	}
	return({min:(0-max),max:max});
}

class CanvasElem extends React.Component{
	constructor(props){	
		super(props)
		var l1 = new TimeSeries();
		var l2 = new TimeSeries();
		this.state =  ({line:l1, line_b:l2})
		this.stream = this.stream.bind(this);
	}
	componentDidMount(){
		var smoothie = new SmoothieChart({millisPerPixel:25,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
		horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],labels:{fillStyle:'#808a90'}, grid:{fillStyle:'rgba(256,256,256,0)'}, yRangeFunction:yRangeFunc});
		smoothie.setTargetFPS(24)
		smoothie.streamTo(document.getElementById(this.props.canvasId));

		if(this.props.int){
			smoothie.addTimeSeries(this.state.line_b, {lineWidth:2,strokeStyle:'rgb(128, 128, 128)'});
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'rgb(128, 0, 128)'});
		
		}else{
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'#ff00ff'});
	
		}
	}
	stream(dat) {
		this.state.line.append(dat.t, dat.val);
		this.state.line.dropOldData(1000, 3000)
		if(this.props.int){
			this.state.line_b.append(dat.t, dat.valb)
			this.state.line_b.dropOldData(1000, 3000)
		
		}
	}
	render(){
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
}
class ConcreteElem extends React.Component{
	constructor(props){
		super(props)
		var axisLayer = new Concrete.Layer();
		var gridLayer = new Concrete.Layer();
		var plotLayers = [];
		for(var i = 0; i<5;i++){
			plotLayers[i] = new Concrete.Layer();
		}

		var x = this.props.w/2
		var y = this.props.h/2
		this.state = ({wrapper:null,gridLayer:gridLayer, plotLayers:plotLayers, axisLayer:axisLayer, axis:{x:[(0-x),x], r:[(0-y),y]}, Xscale:1, Rscale:1, packs:[[],[],[],[],[]], curPack:0, redraw:true})
	}
	componentDidMount(){
		var concreteContainer = document.getElementById(this.props.concreteId);

		var wrapper = new Concrete.Wrapper({width:this.props.w, height:this.props.h, container:concreteContainer})
		concreteContainer.addEventListener('mousedown', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		//console.log([x,y]);
			}			
		});
		concreteContainer.addEventListener('mousemove', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		//console.log('move');
			 	}
		});
		concreteContainer.addEventListener('mouseup', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		//console.log([x,y]);
			 	}
		});
		wrapper.add(this.state.axisLayer)
		wrapper.add(this.state.gridLayer)
		var plotLayers = this.state.plotLayers;
		for(var i = 0; i<5;i++){
			wrapper.add(plotLayers[i])
		}
		var self = this;
		socket.on('testXR', function(xr){
			self.parseXR(xr)
		})
		this.setState({wrapper:wrapper});
		this.drawAxis()
	}
	getSampleStream(){
		this.onSwitchPack();
		socket.emit('initTestStream')
	}
	onSwitchPack(){
		var nextPack = (this.state.curPack+ 1)%5
		var packs = this.state.packs;
		packs[nextPack] = []
		this.setState({curPack:nextPack,packs:packs, redraw:true})

	}
	parseXR(xr){
		var packs = this.state.packs
		packs[this.state.curPack].push(xr)
		var minX = this.state.axis.x[0]
		var maxX = this.state.axis.x[1]
		var minR = this.state.axis.r[0]
		var maxR = this.state.axis.r[1]
		var redraw = this.state.redraw;
		if(Math.abs(xr.x)>maxX){
			maxX=Math.abs(xr.x);
			minX= 0-maxX
			redraw = true
		}
		if(Math.abs(xr.r)>maxR){
			maxR=Math.abs(xr.r)
			minR = 0-maxR
			redraw = true
		}
		var Xscale = (maxX-minX)/this.props.w;
		var Rscale = (maxR-minR)/this.props.h;
		this.setState({ axis:{x:[minX,maxX],r:[minR,maxR]},Xscale:Xscale,Rscale:Rscale, redraw:redraw, packs:packs})
		this.drawPacksSim();
	}
	drawPacks(){
		var ctx = this.state.plotLayers[this.state.curPack].sceneCanvas.context;
		var strokeStyles = ['#FF0000', '#d8bab3', '#aa938d', '#7a6965', '493f3d']
		var alpha = [1.0,0.8,0.7,0.6,0.5,0.4]
		var lW = [2,1,1,1,1]	
		if(this.state.redraw){
			for(var ind= this.state.curPack+1; ind < this.state.curPack+6;ind++){
				var line = this.state.packs[ind%5]
				this.state.plotLayers[ind%5].sceneCanvas.clear();
				if(line.length > 0){
					var start = line[0];
					ctx = this.state.plotLayers[ind%5].sceneCanvas.context;//canv.getContext('2d')
		
					ctx.beginPath();
					ctx.strokeStyle = strokeStyles[(ind-this.state.curPack)%5]
					ctx.globalAlpha = alpha[(ind-this.state.curPack)%5]
					ctx.lineWidth = lW[(ind-this.state.curPack)%5]
					ctx.moveTo((start.x-this.state.axis.x[0])/this.state.Xscale,(0-start.r+this.state.axis.r[1])/this.state.Rscale)
					
					for(var i = 1; i<line.length; i++){
					
						ctx.lineTo((line[i].x - this.state.axis.x[0])/this.state.Xscale, (0-line[i].r+this.state.axis.r[1])/this.state.Rscale)
						start = line[i]
					}
					ctx.stroke();
					this.setState({redraw:false})
				}
			}
					
		}else{
			var line = this.state.packs[this.state.curPack]
				var count = line.length
				ctx.beginPath();
				if(count>1){
				var start = line[count-2];
				var i = count - 1;
				ctx.moveTo((start.x-this.state.axis.x[0])/this.state.Xscale,(0-start.r+this.state.axis.r[1])/this.state.Rscale)
			
				ctx.lineTo((line[count-1].x - this.state.axis.x[0])/this.state.Xscale, (0-line[count-1].r+this.state.axis.r[1])/this.state.Rscale)
				
			}
			ctx.stroke();
		}
	}
	clear(){
		this.state.plotLayers.forEach(function(p) {
			p.sceneCanvas.clear();
		})
		var x = this.props.w/2
		var y = this.props.h/2
		this.setState({axis:{x:[(0-x),x], r:[(0-y),y]}, Xscale:1, Rscale:1, packs:[[],[],[],[],[]], curPack:0, redraw:true})
		this.toggleGrid();
	}
	drawPacksSim(){
		var self = this;
		var strokeStyles = ['#FF0000', '#d8bab3', '#aa938d', '#7a6965', '493f3d']
		var alpha = [1.0,0.8,0.7,0.6,0.5,0.4]
		var lW = [2,1,1,1,1]
		var count = this.state.packs[this.state.curPack].length
		var curPack = this.state.curPack
		if(this.state.redraw){
			this.state.plotLayers.forEach(function(l,j){
				l.sceneCanvas.clear();
				l.sceneCanvas.context.beginPath();
				l.sceneCanvas.context.strokeStyle = strokeStyles[(j+5 - self.state.curPack)%5]
				l.sceneCanvas.context.globalAlpha = alpha[(j+5 - self.state.curPack)%5];
				l.sceneCanvas.context.lineWidth = lW[(j+5 - self.state.curPack)%5];
				
				var p = self.state.packs[j]
				if(p.length >0){
					l.sceneCanvas.context.moveTo((p[0].x-self.state.axis.x[0])/self.state.Xscale,(0-p[0].r +self.state.axis.r[1])/self.state.Rscale);
				}
				
			})
			for(var i=1;i<count; i++){
				for(var j=curPack; j<curPack+5;j++){
					if(i<this.state.packs[j%5].length){
						var pt = this.state.packs[j%5][i]
						this.state.plotLayers[j%5].sceneCanvas.context.lineTo((pt.x-self.state.axis.x[0])/self.state.Xscale,(0-pt.r + self.state.axis.r[1])/self.state.Rscale);
					}
					
				}
			}
			this.state.plotLayers.forEach(function(l){
				l.sceneCanvas.context.stroke();
			})
			this.toggleGrid();
		}else{
			for(var j=curPack; j<curPack+5;j++){
				if(count-1<this.state.packs[j%5].length){
					var pt = this.state.packs[j%5][count-1]
					this.state.plotLayers[j%5].sceneCanvas.context.lineTo((pt.x-self.state.axis.x[0])/self.state.Xscale,(0-pt.r + self.state.axis.r[1])/self.state.Rscale);
					this.state.plotLayers[j%5].sceneCanvas.context.stroke();
				}				
			}
		}
	}

	drawAxis(){
		var ctx = this.state.axisLayer.sceneCanvas.context
			ctx.beginPath();
			ctx.strokeStyle = 'black'
			ctx.lineWidth = 3;
			ctx.moveTo((0-this.state.axis.x[0])/this.state.Xscale,0);
		ctx.lineTo((0-this.state.axis.x[0])/this.state.Xscale,this.props.h)
		//ctx.stroke();
		ctx.moveTo(0,(this.state.axis.r[1])/this.state.Rscale);
		ctx.lineTo(this.props.w,(this.state.axis.r[1])/this.state.Rscale)
		ctx.stroke();
		this.toggleGrid();
	}
	toggleGrid(){
		var ctx = this.state.gridLayer.sceneCanvas.context
		var hctx = this.state.gridLayer.hitCanvas.context;
		hctx.fillRect(0,0,400,400)
		this.state.gridLayer.sceneCanvas.clear();
		var xlim = this.state.axis.x[1];
		var rlim = this.state.axis.r[1];
		var xcnt = Math.floor(xlim/100)
		var xfactor = 1
		var rfactor = 1
		while(xcnt > 10){
			xcnt = Math.floor(xcnt/2)
			xfactor = xfactor*2
		}

		var ycnt = Math.floor(rlim/100)
		while(ycnt >10){
			ycnt = Math.floor(ycnt/2);
			rfactor = rfactor*2
		}
		ctx.beginPath()
		for(var i=0;i<xcnt;i++){
			ctx.moveTo(((-100)*(i+1)*xfactor + xlim)/this.state.Xscale, rlim/this.state.Rscale - 5)
			ctx.lineTo(((-100)*(i+1)*xfactor + xlim)/this.state.Xscale, rlim/this.state.Rscale + 5)
			ctx.moveTo(((100)*(i+1)*xfactor + xlim)/this.state.Xscale, rlim/this.state.Rscale - 5)
			ctx.lineTo(((100)*(i+1)*xfactor + xlim)/this.state.Xscale, rlim/this.state.Rscale + 5)
		}
		for(var j = 0; j<ycnt;j++){
			ctx.moveTo(xlim/this.state.Xscale - 5,((-100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.lineTo(xlim/this.state.Xscale + 5,((-100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.moveTo(xlim/this.state.Xscale - 5,((100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.lineTo(xlim/this.state.Xscale + 5,((100)*(j+1)*rfactor + rlim)/this.state.Rscale)
		}
		ctx.stroke();
	}
	render(){
		return(<div className='prefInterface'>
			<div><label>X Range:[ {this.state.axis.x[0] + ' ~ ' + this.state.axis.x[1]}]</label></div>
			<div><label>R Range:[ {this.state.axis.r[0] + ' ~ ' + this.state.axis.r[1]}]</label></div>
		
				<div id={this.props.concreteId}/>
				<button onClick={this.getSample}>Get Sample</button>
			<button onClick={this.getSampleStream}>Get Stream</button>
			<button onClick={this.clear}>Clear</button>
			</div>)
	}
}
/*
	drawStream:function(){
		var canv = document.getElementById(this.props.canvasId)
		var ctx = canv.getContext('2d')
		
		var self = this;
		if(this.state.redraw){// || (this.state.line.length > this.state.buf)){
			//console.log('redraw')
			ctx.clearRect(0,0,400,400)
			ctx.beginPath();
			var strokeStyles = ['#000000','#FF0000','#00FF00','#0000FF']
			ctx.strokeStyle = 'black';//strokeStyles[this.state.curStyle]
			ctx.moveTo((0-this.state.axis.x[0])/this.state.Xscale,0);
		ctx.lineTo((0-this.state.axis.x[0])/this.state.Xscale,this.props.h)
		//ctx.stroke();
		ctx.moveTo(0,(this.state.axis.r[1])/this.state.Rscale);
		ctx.lineTo(this.props.w,(this.state.axis.r[1])/this.state.Rscale)
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = strokeStyles[this.state.curStyle]
		var line = this.state.line;
		var br = this.state.line.length - this.state.buf

		if(line.length >0){
			var start = line[0];
			//ctx.moveTo(start)

			for(var i = 0; i<line.length; i++){
				ctx.beginPath();
				if(i<br){
					
					ctx.strokeStyle = '#DCDCDC'
				}else{
					ctx.strokeStyle = '#000000'
				}
				ctx.moveTo((start.x-this.state.axis.x[0])/this.state.Xscale,(0-start.r+this.state.axis.r[1])/this.state.Rscale)
				ctx.lineTo((line[i].x - this.state.axis.x[0])/this.state.Xscale, (0-line[i].r+this.state.axis.r[1])/this.state.Rscale)
				start = line[i]
				ctx.stroke();
				this.setState({redraw:false})
			}
		}
		}else if(this.state.line.length > this.state.buf){
			var line = this.state.line
			var front = line.length - this.state.buf - 1;
			var start = line[front]
			ctx.beginPath();
			ctx.strokeStyle = '#DCDCDC';

			ctx.moveTo((start.x-this.state.axis.x[0])/this.state.Xscale,(0-start.r+this.state.axis.r[1])/this.state.Rscale)
			ctx.lineTo((line[front+1].x - this.state.axis.x[0])/this.state.Xscale, (0-line[front+1].r+this.state.axis.r[1])/this.state.Rscale)
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle = '#000000'
			var count = line.length

			var st = line[count-2];
				var i = count - 1;
				ctx.moveTo((st.x-this.state.axis.x[0])/this.state.Xscale,(0-st.r+this.state.axis.r[1])/this.state.Rscale)
			
				ctx.lineTo((line[count-1].x - this.state.axis.x[0])/this.state.Xscale, (0-line[count-1].r+this.state.axis.r[1])/this.state.Rscale)
			ctx.stroke();
				

		}else{
			//console.log('no redraw')
			ctx.beginPath();
			var strokeStyles = ['#000000','#FF0000','#00FF00','#0000FF']
			ctx.strokeStyle = strokeStyles[this.state.curStyle]
			var line = this.state.line
			var count = line.length
			if(count>1){
				var start = line[count-2];
				var i = count - 1;
				ctx.moveTo((start.x-this.state.axis.x[0])/this.state.Xscale,(0-start.r+this.state.axis.r[1])/this.state.Rscale)
			
				ctx.lineTo((line[count-1].x - this.state.axis.x[0])/this.state.Xscale, (0-line[count-1].r+this.state.axis.r[1])/this.state.Rscale)
				
			}
			ctx.stroke();
			//ctx.beginPath();
		}
		
		
	},
*/
/*var DetMainInfo = createReactClass({
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
		this.setState({peditMode:false})
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
		if(this.state.peditMode){
			var peditCont = 	<div><ProductMenu ip={this.props.det.ip} onKeyFocus={this.prodFocus}	onRequestClose={this.prodClose}/><div style={{float:'right'}}><button onClick={this.changeProdEditMode}> Back</button></div></div>
				
		}else{
			peditCont = <div>
				<div style={{display:'inline-block'}}>{prodList}</div><div style={{float:'right'}}><button onClick={this.changeProdEditMode}>Edit Product List</button></div>
			</div>
		}
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
})*/

module.exports = {}
module.exports.ConcreteElem =  ConcreteElem;
module.exports.CanvasElem = CanvasElem;
//module.exports.KeyboardInput = KeyboardInput;
module.exports.TreeNode = TreeNode
//module.exports.SnackbarNotification = SnackbarNotification;
