var React = require('react');
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
import Keyboard from 'react-material-ui-keyboard';
import TextField from 'material-ui/TextField';
import { extendedKeyboard, alphaNumericKeyboard,numericKeyboard } from 'react-material-ui-keyboard/layouts';

//var Concrete = require('./concrete.min.js').Concrete

var TreeNode = React.createClass({
	getInitialState: function(){
		return ({hidden:true})
	},
	toggle: function(){
		var hidden = !this.state.hidden
		this.setState({hidden:hidden});
	},
	render: function(){
		var cName = "collapsed"
		if(!this.state.hidden){
			cName = "expanded"
		}
		return (
			<div hidden={this.props.hide} className="treeNode">
				<div onClick={this.toggle} className={cName}/>
				<div className="nodeName">
					<span onClick={this.toggle}>{this.props.nodeName}</span>
				</div>
				<div className="innerDiv" hidden={this.state.hidden}>
				{this.props.children}
				</div>
			</div>
		)
	}
})
var KeyboardInput = React.createClass({
	getInitialState: function(){
		var value = ""
		 if(typeof this.props.value != 'undefined'){
		 	value = this.props.value.toString()
		 }
		return {textarea:value, open:false}
	},
	componentWillReceiveProps: function(newProps){
		if(typeof newProps.value != 'undefined'){
			this.setState( {textarea:newProps.value.toString()})
		}
		
	},
	onTextareaChanged: function(e,v){
		console.log('onTextareaChanged')
		this.setState({textarea:v})
		if(this.props.onInput){
			this.props.onInput(v)
		}
		if(this.props.onChange){
			this.props.onChange(e)
		}
		
	},
	onInput: function(e){
		console.log('onInput')
		this.setState({textarea:e})
		if(this.props.onInput){
			this.props.onInput(e)
		}
		if(this.props.onChange){
			this.props.onChange(e)
		}
		
	},
	onFocus: function(e){
		if(ftiTouch){
			console.log('74 components.jsx')

			this.setState({open:true})
			if(this.props.onFocus){
				this.props.onFocus();
			}
		}
	},
	onRequestClose:function(e){
		if(ftiTouch){


			console.log(['79 comp'])
			this.setState({open:false})
			if(this.props.onRequestClose){
				this.props.onRequestClose();
			}
		}
	},
	render:function () {
		//console.log($('#keyboardinput'))
		/*<Keyboard value={this.state.textarea} name='thetextareaname'
			 options={{type:'textarea',layout:'qwerty', autoAccept: true, alwaysOpen: false, appendLocally: true, color:'light', class:'sxcycx', updateOnChange: true }} onChange={this.onTextareaChanged} /> 
*/
		// body...
		var layout = [alphaNumericKeyboard];
		if(this.props.num){
			layout = [numericKeyboard]
		}
		var style =  this.props.Style || {width:'100%'} 
		var textfield = ( <TextField
          	style = {style}
            id={this.props.tid}
            value={this.state.textarea}
            onChange={this.onTextareaChanged}
            onFocus={this.onFocus}
          />)
		if(ftiTouch){
			console.log(ftiTouch)

		return (
			<div style={{style}}>
			      <Keyboard textField={textfield}    keyboardKeyHeight={65}
                        keyboardKeyWidth={105}
                        keyboardKeySymbolSize={35}  open={this.state.open} onRequestClose={this.onRequestClose} onInput={this.onInput} layouts={layout}/>
                        </div>
			 )
			}else{
				console.log(ftiTouch)
				return(
						<div style={{style}}>
		
			      <Keyboard textField={textfield} open={false} onInput={this.onInput} layouts={layout}/>
			      </div>)
			}
    
	}
})

var Panel = React.createClass({
	handleItemclick: function(dat){
		this.props.onHandleClick(dat);
	},
	toggle: function(e){
		e.preventDefault();
		this.setState({isHidden: !this.state.isHidden} );
	},
	
	getInitialState: function(){
		var t1 = '                    '
		var ws;

		return{hide:true, prodRec:{}, sysRec:{}, prodvar:0, prodArray:[], sysvar:0, sysArray:[], dspip:"192.168.10.51", 
		tickerVal:0, cursor:0, type:'',n:0,text:'', t1:t1,t2:'                    ', leds:0, lcd:0, ws:ws, isDesktop:true, isHidden:false}

	},
	handleMsg: function(msg){
		//console.log(msg)
		var dv = new DataView(msg);
			var lcd_type = dv.getUint8(0);
			//console.log(lcd_type)
    		var lcd_leds = dv.getUint8(1);
    		var lcd_bits = dv.getUint8(2);
    		var lcd_cur  = dv.getUint8(3);
    		var lcd_len  = dv.getUint8(4); // text-size
    		if (lcd_len > 72) return; // packet is screwed up -> not necessarily!! need to grab info from vdef for packet size
    		var line1 = String.fromCharCode.apply(null, new Uint8Array(msg,5,lcd_len/2))
    		var line2 = String.fromCharCode.apply(null, new Uint8Array(msg,5+lcd_len/2,lcd_len/2));
    		if(!((this.refs.pd.state.cursor == lcd_cur)&&(this.refs.pd.state.t1 == line1)&&(this.refs.pd.state.t2 == line2))){
    			this.refs.pd.setState({cursor:lcd_cur, t1:line1, t2:line2});
    		}
	},
	render: function(){
		var ih = this.state.isHidden;
		var handler = this.handleItemclick;
		
		 var className = "menuCategory expanded";
	   

		return (<div className={className}>
			<span  onClick={this.toggle}><h2 >{"Panel"}</h2></span>
			<div hidden ={ih}>
				<PanelDisplay ws={this.props.ws} ref={'pd'} isDesktop={this.state.isDesktop} minFont={this.state.minFont} maxFont={this.state.maxFont} />
				<PanelControls ws={this.props.ws} isDesktop={this.state.isDesktop}/>
				</div>
			</div>)
	}
})

var TreeNode = React.createClass({
	getInitialState: function(){
		return ({hidden:true})
	},
	toggle: function(){
		var hidden = !this.state.hidden
		this.setState({hidden:hidden});
	},
	render: function(){
		//console.log("render")
		var cName = "collapsed"
		if(!this.state.hidden){
			cName = "expanded"
		}
		return (
			<div hidden={this.props.hide} className="treeNode">
				<div onClick={this.toggle} className={cName}/>
				<div className="nodeName">
					<span onClick={this.toggle}>{this.props.nodeName}</span>
				</div>
				<div className="innerDiv" hidden={this.state.hidden}>
				{this.props.children}
				</div>
			</div>
		)
	}
})
var MenuCategory = React.createClass({
	handleItemclick: function(dat){
		this.props.onHandleClick(dat);
	},
	toggle: function(e){
		e.preventDefault();
		this.setState({isHidden: !this.state.isHidden} );
	},
	getInitialState: function(){
		return({
			 isHidden: false
			
		});
	},
	render: function(){
		var ih = this.state.isHidden;
		var handler = this.handleItemclick;
		//var hasContent = this.props.data
	    console.log(this.props.data)
		var menuNodes = ""
		var mNodes = []
		if(Array.isArray(this.props.data)){
			menuNodes = this.props.data.map(function (item) {
	        console.log(item)
	        if(item.length == 2){
	        	console.log(item.length)
	        	return (
	      	<MenuItem lkey={item[0]} name={item[0]} isHidden={ih} hasChild={false} 
	      	data={item} onItemClick={handler} hasContent={true}/>)	
	        }else{
	        	console.log(item)
	        	for(var it in item){
	        		console.log(it)
	        		console.log(item[it])
	        		var vit = (<MenuItem lkey={it} name={it} isHidden={ih} hasChild={false} data={item[it]} onItemClick={handler} hasContent={true}/>)
	        		mNodes.push(vit)
	        	}
	        //	console.log(mNodes)
	      	}	
	        	
	        });
	    
		}else{
			menuNodes = <MenuItem isHidden={ih} onItemClick={handler} name={this.props.data} data={this.props.data}/>
		}
		
	    var className = "menuCategory";
	    if (ih){
	    	className = "menuCategory collapsed";
	    }
	    else{
	    	className = "menuCategory expanded";
	    }
		return(
			<div className={className}>
			<span  onClick={this.toggle}><h2 >{this.props.name}</h2></span>
				{menuNodes}
				{mNodes}
			</div>
		);
	}
})
var SearchBox = React.createClass({
	render: function() {
		return (
			<div></div>
		);
	}
})
var MenuItem = React.createClass({
	getInitialState: function(){
		return ({mode:0})
	},
	onItemClick: function(){
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
			this.props.onItemClick(this.props.data)	
		}else{
			console.log(this.props.data)
		}
		
	},
	sendPacket: function(){

	},
	render: function(){
		if(this.state.mode == 1){
			return <EditControl name={this.props.name} data={this.props.data} sendPacket={this.sendPacket}/>
		}
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
		return (<div className='menuItem' hidden={this.props.isHidden} onClick={this.onItemClick}>{this.props.name}</div>)
		}else{
			var pram;
			var val;
			if(typeof pVdef[0][this.props.name] != 'undefined'){
				pram = pVdef[0][this.props.name]
				console.log(pram)
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]["s"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							//console.log(d)
							if(pVdef[2][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					val = Params[f].apply(this, [].concat.apply([], [val, deps]));
				}

				if(pram["@labels"]){
					val = pVdef[3][pram["@labels"]]["english"][val]
				}
			}else if(typeof pVdef[1][this.props.name] != 'undefined'){
				pram = pVdef[1][this.props.name]
				console.log(pram)
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]["s"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							//console.log(d)
							if(pVdef[2][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					val = Params[f].apply(this, [].concat.apply([], [val, deps]));
				}

				if(pram["@labels"]){
					val = pVdef[3][pram["@labels"]]["english"][val]
				}
			}else{
				val = this.props.data
			}
			return (<div className='menuItem' hidden={this.props.isHidden} onClick={this.onItemClick}>{this.props.name + ": " + val}</div>)
		}
	}
})
var NavButton = React.createClass({
	handleClick: function(){
		//send DSP call to update panel accordingly
		var data = new Uint8Array(1);
		data[0] = this.props.keyMap & 0xff;
		console.log(this.props.ws)
		this.props.ws.send(data.buffer);
		
	},
	render: function(){
		return(<button className={this.props.klass} onClick={this.handleClick}></button>)
	}
})

var PanelControls = React.createClass({
	
	render: function(){
		var self = this;
		if(!this.props.isDesktop){
			return(
			<div className="panelControls-mobile">
			<PanelNav flat={true}/>
			<table><tr>
			<td>
				<PanelButton ws={self.props.ws} label="Enter" keyMap={50}/>
				<PanelButton ws={self.props.ws} label="Exit" keyMap={49}/>
				<PanelButton ws={self.props.ws} label="Menu" keyMap={66}/>
				
			</td><td>
				<PanelButton ws={self.props.ws} label="Sensitivity" keyMap={55}/>
				<PanelButton ws={self.props.ws} label="Product" keyMap={68}/>
				<PanelButton ws={self.props.ws} label="Calibrate" keyMap={35}/>
				<PanelButton ws={self.props.ws} label="Test" keyMap={48}/>
				<PanelButton ws={self.props.ws} label="Unit" keyMap={42}/>
			</td>
			</tr>
			</table>
			</div>
			)
		}
		return(
			<div className="panelControls">
			<table><tr>
			<td>
				<PanelButton ws={self.props.ws} label="Enter" keyMap={50}/>
				<PanelButton ws={self.props.ws} label="Exit" keyMap={49}/>
				<PanelButton ws={self.props.ws} label="Menu" keyMap={66}/>
			</td><td>
				<PanelNav ws={self.props.ws}/>
			</td>
			<td>
				<PanelButton ws={self.props.ws} label="Sensitivity" keyMap={55}/>
				<PanelButton ws={self.props.ws} label="Product" keyMap={68}/>
				<PanelButton ws={self.props.ws} label="Calibrate" keyMap={35}/>
				<PanelButton ws={self.props.ws} label="Test" keyMap={48}/>
				<PanelButton ws={self.props.ws} label="Unit" keyMap={42}/>
			</td>
			</tr>
			</table>
			</div>
		)
	}
});

var PanelButton = React.createClass({
	handleClick: function(){
		//send DSP call to update panel accordingly
		var data = new Uint8Array(1);
		data[0] = this.props.keyMap & 0xff;
		this.props.ws.send(data.buffer);
		
	},
	render: function(){
		return(
			<div>
			<button className='panelButton' onClick={this.handleClick}>
				{this.props.label}
				</button>
			</div>)
	}
});
var PanelNav = React.createClass({
	render: function(){
		var self = this;
		if(this.props.flat){
			return(
				<div className='panelNav'>
				<table><tr>
				<td><NavButton ws={self.props.ws} klass='pButton' keyMap={67}/></td>
				<td><NavButton ws={self.props.ws} klass='lButton' keyMap={54}/></td>
				<td><NavButton ws={self.props.ws} klass='rButton' keyMap={52}/></td>
				<td><NavButton ws={self.props.ws} klass='mButton' keyMap={53}/></td>
				</tr></table>
				</div>
				)
		}else{
		return(<div className='panelNav'>
				<table>
				<tr><td></td><td>
					<NavButton ws={self.props.ws} klass='pButton' keyMap={67}/>
	
				</td><td></td></tr>
				<tr><td>
					<NavButton ws={self.props.ws} klass='lButton' keyMap={54}/>
	
				</td><td></td><td>
					<NavButton ws={self.props.ws} klass='rButton' keyMap={52}/>

				</td></tr>
				<tr><td></td><td>
					<NavButton ws={self.props.ws} klass='mButton' keyMap={53}/>

				</td><td></td></tr>
				</table>
			</div>)
	}
	}
});

var placeholder = document.createElement("li");
placeholder.className = "placeholder";

var List = React.createClass({
  getInitialState: function() {
    return {data: this.props.data};
  },
  componentWillReceiveProps: function (newProps) {
  	// body...
  	console.log(newProps)
  	this.setState({data:newProps.data})
  },
  dragStart: function(e) {
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    e.dataTransfer.setData("text/html", e.currentTarget);
  },
  dragEnd: function(e) {

    this.dragged.style.display = "block";
    this.dragged.parentNode.removeChild(placeholder);
    // Update data
    var data = this.state.data;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    if(this.nodePlacement == "after") to++;
    data.splice(to, 0, data.splice(from, 1)[0]);
    this.setState({data: data});
  },
  dragOver: function(e) {
    e.preventDefault();
    this.dragged.style.display = "none";
    if(e.target.className == "placeholder") return;
    this.over = e.target;
    // Inside the dragOver method
    var relY = e.clientY - this.over.offsetTop;
    var height = this.over.offsetHeight / 2;
    var parent = e.target.parentNode;
    
    if(relY > height) {
      this.nodePlacement = "after";
      parent.insertBefore(placeholder, e.target.nextElementSibling);
    }
    else if(relY < height) {
      this.nodePlacement = "before"
      parent.insertBefore(placeholder, e.target);
    }
  },
  render: function() {
  	console.log(this.state.data)
    return <ul onDragOver={this.dragOver}>
    	{this.state.data.map(function(item, i) {
      	return (
        	<li
		        data-id={i}
            key={i}
            draggable="true"
            onDragEnd={this.dragEnd}
            onDragStart={this.dragStart}
          >
       			{item}
          </li>
        )
   	 	}, this)}
    </ul>
  }
});


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

var CanvasElem = React.createClass({
	getInitialState: function () {
		var l1 = new TimeSeries();
		var l2 = new TimeSeries();
		return ({line:l1, line_b:l2})
	},
	componentDidMount: function(){
		var smoothie = new SmoothieChart({millisPerPixel:25,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
		horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],labels:{fillStyle:'#000000'}, grid:{fillStyle:'#ffffff'}, yRangeFunction:yRangeFunc});
		smoothie.streamTo(document.getElementById(this.props.canvasId));
		if(this.props.int){
			smoothie.addTimeSeries(this.state.line_b, {lineWidth:2,strokeStyle:'rgba(0, 128, 128, 0.4)'});
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'rgba(128, 0, 128, 0.4)'});
		
		}else{
			smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'#000000'});
	
		}
	},
	stream:function (dat) {
		this.state.line.append(dat.t, dat.val);
		this.state.line.dropOldData(1000, 3000)
		if(this.props.int){
			this.state.line_b.append(dat.t, dat.valb)
			this.state.line_b.dropOldData(1000, 3000)
		
		}
	},
	render: function(){
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
});
var ConcreteElem = React.createClass({
	getInitialState: function(){
		var axisLayer = new Concrete.Layer();
		var gridLayer = new Concrete.Layer();
		var plotLayers = [];
		for(var i = 0; i<5;i++){
			plotLayers[i] = new Concrete.Layer();
		}

		var x = this.props.w/2
		var y = this.props.h/2
		return({wrapper:null,gridLayer:gridLayer, plotLayers:plotLayers, axisLayer:axisLayer, axis:{x:[(0-x),x], r:[(0-y),y]}, Xscale:1, Rscale:1, packs:[[],[],[],[],[]], curPack:0, redraw:true})
	},
	componentDidMount: function(){
		var concreteContainer = document.getElementById(this.props.concreteId);

		var wrapper = new Concrete.Wrapper({width:this.props.w, height:this.props.h, container:concreteContainer})
		concreteContainer.addEventListener('mousedown', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		console.log([x,y]);
			}			
		});
		concreteContainer.addEventListener('mousemove', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		console.log('move');
			 	}
		});
		concreteContainer.addEventListener('mouseup', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		console.log([x,y]);
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
	},
	getSampleStream: function(){
		this.onSwitchPack();
		socket.emit('initTestStream')
	},
	onSwitchPack: function(){
		var nextPack = (this.state.curPack+ 1)%5
		var packs = this.state.packs;
		packs[nextPack] = []
		this.setState({curPack:nextPack,packs:packs, redraw:true})

	},
	parseXR: function(xr){
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
	},
	drawPacks: function(){
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
	},
	clear: function(){
		this.state.plotLayers.forEach(function(p) {
			p.sceneCanvas.clear();
		})
		var x = this.props.w/2
		var y = this.props.h/2
		this.setState({axis:{x:[(0-x),x], r:[(0-y),y]}, Xscale:1, Rscale:1, packs:[[],[],[],[],[]], curPack:0, redraw:true})
		this.toggleGrid();
	},
	drawPacksSim: function(){
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
	},

	drawAxis: function(){
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
	},
	toggleGrid:function(){
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
	},
	render:function(){
		return(<div className='prefInterface'>
			<div><label>X Range:[ {this.state.axis.x[0] + ' ~ ' + this.state.axis.x[1]}]</label></div>
			<div><label>R Range:[ {this.state.axis.r[0] + ' ~ ' + this.state.axis.r[1]}]</label></div>
		
				<div id={this.props.concreteId}/>
				<button onClick={this.getSample}>Get Sample</button>
			<button onClick={this.getSampleStream}>Get Stream</button>
			<button onClick={this.clear}>Clear</button>
			</div>)
	}
});
/*
	drawStream:function(){
		var canv = document.getElementById(this.props.canvasId)
		var ctx = canv.getContext('2d')
		
		var self = this;
		if(this.state.redraw){// || (this.state.line.length > this.state.buf)){
			console.log('redraw')
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
			console.log('no redraw')
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

module.exports = {}
module.exports.ConcreteElem =  ConcreteElem;
module.exports.CanvasElem = CanvasElem;
module.exports.KeyboardInput = KeyboardInput;
module.exports.TreeNode = TreeNode
