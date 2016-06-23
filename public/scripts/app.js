'use strict'

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

class Params{
	static frac_value(int){
		return (int/(1<<15))
	}
	static mm(dist, metric){
		if(metric==0){
			return (dist/25.4).toFixed(1) + " in"

		}
		else{
			return dist + " mm";
		}

	}
	static rec_date(val){
		//needs to be swapped..
		//0xac26 -> 0x26ac
		var dd = val & 0x1f;
		var mm = (val >> 5) & 0xf
		var yyyy = ((val>>9) & 0x7f) + 1996
		return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString();
	}
	static phase_spread(val){
		return Math.round(Params.frac_value(val)*45)
	}
	static phase_wet(val){
		return ((Params.frac_value(val) * 45)).toFixed(2);
	}
	static phase_dry(val){
		if(((Params.frac_value(val) * 45)+90) <= 135){
			return ((Params.frac_value(val) * 45)+90).toFixed(2);	
		}
		else{
			return ((Params.frac_value(val) * 45)).toFixed(2);
			
		}

	}
	static phase(val, wet){
		//console.log(wet);
		if(wet==0){
			return Params.phase_dry(val);
		}else{
			return Params.phase_wet(val);
		}
	}
	static rej_del(ticks, tack){
		if(tack==0){
			return (ticks/231.0).toFixed(2); //2 decimal float
		}else{
			return ticks;
		}
	}
	static belt_speed(tpm, metric, tack){
		//console.log(tpm);
		if(tack!=0){

			return tpm;
		}
		var speed = (231.0/tpm) * 60;
		if(metric==0){
			return speed
		}else{
			return speed
		}
		//do we want to handle this on the front end or here?
		//might be better to do it here
		//okay.
	}
	static password8(words){
			var arr = words.match(/../g).map(function(c){
				return parseInt((("00" + c.charCodeAt(0).toString(16)).substr(-2)
				 +("00" + c.charCodeAt(1).toString(16)).substr(-2)),16);
			});
		//console.log(arr);

		var res = arr.map(function(w){
			return ((w & 0xffff).toString(16)) //hex format string
		}).join(',')
	//	console.log(res);
		return(res)

	}
	static rej_chk(rc1, rc2){
		if (rc2==0){
			if(rc1==0){
				return 0
			}else{
				return 1
			}
		}else{
			return 2
		}
	}
	static rej_mode(photo, rev){
		if (rev==0){
			if (photo==0){
				return 0;
			}else{
				return 1;
			}
		}else{
			return 2;
		}
	}

	static rej_latch(latch, toggle){
		if (toggle==0){
			if (latch==0){
				return 0;
			}else{
				return 1;
			}
		}else{
			return 2;
		}
	}
	static prod_name(val){
		return val;
	}


	static peak_mode(eye, time){
		if (eye==0){
			if (time==0){
				return 0;
			}else{
				return 2;
			}
		}else{
			return 1;
		}
	}


	static eye_rej(photo, lead, width){
		if (photo==0){
			return 3;
		}else{
			if(lead==0){
				if(width==0){
					return 0;
				}else{
					return 2;
				}
			}else{
				return 1;
			}
		}
	}
	static phase_mode(wet, patt){
		//console.log(patt)
		if (patt==0){
			if (wet==0){
				return 0;
			}
			else{
				return 1;
			}
		}else{
			return 2;
		}
	}
	
	static bit_array(val){
		if(val == 0){
			return 0;
		}else{
			var i = 0;
			while(i<16 && ((val>>i) & 1) == 0){
				i++;
			}
			i++; //1 based index
			return i;
		}
	}

	static patt_frac(val){
		return (val/10.0).toFixed(1);
	}

	static	swap16(val){
    	return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
	}

	static 	convert_word_array_BE(byteArr){
		var b = new Buffer(byteArr)
		var length = byteArr.length/2;
		var wArray = []
		//console.log(length)
		for(var i = 0; i<length; i++){
			wArray.push(b.readUInt16BE(i*2));
		}
		//console.log(wArray)
		return wArray;

	}

	static convert_word_array_LE(byteArr){
		var b = new Buffer(byteArr)
		var length = byteArr.length/2;
		var wArray = []
		//console.log(length)
		for(var i = 0; i<length; i++){
			wArray.push(b.readUInt16LE(i*2));
		}
		//console.log(wArray)
		return wArray;

	}
}

var ToySettings = {'Others':{}, 'Password':{},'Sensitivity':{}}
var VolatileList = {'Signal':{}}
var MenuStructure = [ToySettings,VolatileList]
var socket = io();

var sysSettings = {};
var prodSettings ={};
var combinedSettings = [];

var vdefList;
var Vdef;
var pVdef;
var isVdefSet = false;
var nVdf;

socket.on('location', function(data){
	console.log(data)
})
socket.on('vdef', function(vdf){
	Vdef = vdf[0];
	nVdf = vdf[1];
	console.log(nVdf)
		var res = [];
		res[0] = [];
		res[1] = [];
		res[2] = [];
		res[3] = [];

		Vdef["@params"].forEach(function(p){
			res[p["@rec"]][p["@name"]] = p;
		});
		res[2] = Vdef["@deps"];
		res[3] = Vdef["@labels"]
		pVdef = res;
	isVdefSet = true;
	//console.log(pVdef);
})

var Container = React.createClass({
	getInitialState:function(){
		var self = this;
		socket.emit('hello', 'from me')
		var dspip = '192.168.20.2'
		var ws = new WebSocket('ws://'+dspip + '/panel')
		ws.binaryType = 'arraybuffer'

		ws.onmessage = function(evt){
			//console.log('evt')
			//self.refs.mm.handleMsg(evt)
			//socket.emit('ws', evt)
		}
		socket.on('wssss', function(e){
			//console.log("????")

			//console.log(e)
			//var ev = toArrayBuffer(e)
			self.refs.mm.handleMsg(e)
		})
		return({ws:ws})
	},
	render: function (){
		// body...
		return (<div>
			<MobileMenu ref={'mm'} ws={this.state.ws} data={[]}/>
		</div>)
	}
});

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
	onItemClick: function(){
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
			this.props.onItemClick(this.props.data)	
		}else{
			console.log(this.props.data)
		}
		
	},
	render: function(){
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

var ItemContent = React.createClass({
	render: function(){
		return (<div>could be the plot here!</div>)
	}
})

var CanvasElem = React.createClass({
	componentDidMount: function(){
		var smoothie = new SmoothieChart({millisPerPixel:50,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2});
		smoothie.streamTo(document.getElementById(this.props.canvasId));
		var line1 = new TimeSeries();
		socket.on('graph', function(dat){
			line1.append(dat.t, dat.val);
		});
		smoothie.addTimeSeries(smLine);
	},
	render: function(){
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={200} width={300}></canvas>
			</div>
		);
	}
});

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
		
		 var className = "menuCategory";
	    if (ih){
	    	className = "menuCategory collapsed";
	    }
	    else{
	    	className = "menuCategory expanded";
	    }

		return (<div className={className}>
			<span  onClick={this.toggle}><h2 >{"Panel"}</h2></span>
			<div hidden ={ih}>
				<PanelDisplay ws={this.props.ws} ref={'pd'} isDesktop={this.state.isDesktop} minFont={this.state.minFont} maxFont={this.state.maxFont} />
				<PanelControls ws={this.props.ws} isDesktop={this.state.isDesktop}/>
				</div>
			</div>)
	}
})
var PanelDisplay = React.createClass({
	getInitialState: function(){
		var t1 = ''
		return{data:[],cursor:0, t1:t1,t2:'                    ',show:true}
	},
	componentDidMount: function(){
		var ref = this;
		socket.on('display', function(data){
			alert(data);
			ref.setState({data:data});
		});
	},
	render: function(){
		//console.log('pd')
		var self = this;
		var editControls = this.state.data.map(function(item){
			return(
				<EditControl name={item.name} val={item.value} />
			)
		});
		var font = {fontSize:'3vw'}
		if(!this.props.minFont){
			//font = {fontSize:'15px'}
		}else if(this.props.maxFont){
			//font = {fontSize:'48px'}
		}
		var t1 = this.state.t1;
		var t2 = this.state.t2;
		console.log(this.state.show)
		if(this.state.cursor>0){
    			if(this.state.cursor<=20){

			    	return(
						<div className="panelDisplay" hidden={!this.state.show}>
							<table><tr>
							<td><NavButton ws={self.props.ws} klass='rButton' keyMap={65}/></td><td>
							<h3  className='panelTitle' style={font}><pre id='l1' style={{margin:0}}>{t1.substring(0,this.state.cursor-1)}
							<b>{t1.substring(this.state.cursor-1,this.state.cursor)}</b>{t1.substring(this.state.cursor,20)}</pre></h3>
							</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={57}/></td></tr><tr>
							<td><NavButton ws={self.props.ws} klass='rButton' keyMap={51}/></td><td>
							<h3  className='panelTitle' style={font}><pre id='l2' style={{margin:0}}>{t2}</pre></h3>
							</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={56}/></td></tr></table>
							{editControls}
						</div>
					)	
    				//selectAndHighlightRange('l1',this.state.cursor,this.state.cursor+1)
    			}else if(this.state.cursor<=40){
			    	return(
						<div className="panelDisplay" hidden={!this.state.show}>
							<table><tr>
							<td><NavButton ws={self.props.ws} klass='rButton' keyMap={65}/></td><td>
							<h3  className='panelTitle' style={font}><pre id='l1' style={{margin:0}}>{t1}</pre></h3>
							</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={57}/></td></tr><tr>
							<td><NavButton ws={self.props.ws} klass='rButton' keyMap={51}/></td><td>
							<h3  className='panelTitle' style={font}><pre id='l2' style={{margin:0}}>{t2.substring(0,this.state.cursor-21)}
							<b>{t2.substring(this.state.cursor-21,this.state.cursor-20)}</b>{t2.substring(this.state.cursor-20,20)}</pre></h3>
							</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={56}/></td></tr></table>
							{editControls}
						</div>
					)
			    				//selectAndHighlightRange('l2',this.state.cursor-20,this.state.cursor-19)
    			}
    		}
		return(
			<div className="panelDisplay" hidden={!this.state.show}>
				<table><tr>
				<td><NavButton ws={self.props.ws} klass='rButton' keyMap={65}/></td><td>
				<h3  className='panelTitle' style={font}><pre id='l1' style={{margin:0}}>{t1}</pre></h3>
				</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={57}/></td></tr><tr>
				<td><NavButton ws={self.props.ws} klass='rButton' keyMap={51}/></td><td>
				<h3  className='panelTitle' style={font}><pre id='l2' style={{margin:0}}>{t2}</pre></h3>
				</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={56}/></td></tr></table>
				{editControls}
			</div>
		)
	}
});

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
var MobileMenu = React.createClass({
	//This display will allow for navigating back to previous pages - 
	getInitialState: function(){
		var data = [];
		if(this.props.data.length > 0){
			data = this.props.data
		}
		return {data:[['MainDisplay', data]], stack:[], settings:false, attention:"attention", query: ''}
	},
	handleMsg: function(evt){
		var msg = evt
		//console.log(msg)
		
		if (msg instanceof ArrayBuffer) {
				var n = msg.byteLength;
		
				
		if(n<77){
			var dv = new DataView(msg);
			//this.setState({dv:msg})
			if (n < 9 ) return;
			var dsp_signal = dv.getInt32(1, true);

				
			//}
		}else{
			var self = this;
			
			var dv = new DataView(msg);
			var lcd_type = dv.getUint8(0);
			//console.log(lcd_type)
    		if (lcd_type == 0x1){
    	//	console.log('here')
			this.refs.pn.handleMsg(msg)
			}else if(lcd_type == 0x4){
				//system
				if(isVdefSet){
				var sysArray = [];
					for(var i = 0; i<64; i++){
						sysArray[i] = dv.getUint16(i*2 + 1);	
					}
				//	sysSettings = sysArray.slice(0)
				var sysRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 0){
    						var setting = self.getVal(sysArray, 0, p["@name"])
    						sysRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
   // 					console.log(p)
    					if(Vdef["@deps"][p]["@rec"] == 0){
    						var setting = self.getVal(sysArray,2, p)
    						sysRec[p] = setting;
    					}
    				}
    				sysSettings = sysRec;
    
    			}
			}else if(lcd_type == 0x5){
				if(isVdefSet ){
					var prodArray = [];
					for(var i = 0; i<64; i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 1){
    						var setting = self.getVal(prodArray, 1,p["@name"])
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 1){
    						var setting = self.getVal(prodArray,2, p)
    						prodRec[p] = setting;
    					}
    				}
					prodSettings = prodRec;
	// 				console.log(this.state.data)
					if(this.state.data[0][0] == 'MainDisplay'){
					var prodName = this.getVal(prodArray, 1, 'ProdName')		
					var sens = this.getVal(prodArray, 1, 'SigPath[0].Sens')
					//console.log([prodName, sens])

					if((this.refs.md.state.productName != prodName)||(this.refs.md.state.sens != sens)){
						this.refs.md.setState({productName:prodName, sens:sens})
					}
					}
					else if(this.state.data[0][0] = "Settings"){
						var comb = [];
						for(var c in nVdf){
							comb[c] = {};
							for(var i = 0; i < nVdf[c].length; i++){
						//		console.log(nVdf[c][i])
								if(nVdf[c][i]['@rec'] == 0){
									comb[c][nVdf[c][i]["@name"]] = sysSettings[nVdf[c][i]["@name"]]
								}else{
									comb[c][nVdf[c][i]["@name"]] = prodSettings[nVdf[c][i]["@name"]]
								}
				
							}
						}
						combinedSettings = comb;
						//diff, and set settings
						//console.log(this.state.data)	
						if(this.refs.sd){
							this.refs.sd.parseInfo(sysSettings, prodSettings)	
						}
						
					}
				}
				//Product
				
			}
		}
		}
	},
	getVal: function(arr, rec, key){
		//console.log(key)
		var param = pVdef[rec][key]
	//	console.log(key)
	//	console.log(param)
		if(param['@bit_len']>16){
			return this.wordValue(arr, param)
		}else{
			
			var val = Params.swap16(arr[param["@i_var"]]);
			
			if(param["@bit_len"] < 16){
				
				val = (val >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
			}
			return val;
		}


	},
	wordValue: function(arr, p){
		
		var n = Math.floor(p["@bit_len"]/16);
		var sa = arr.slice(p["@i_var"], p["@i_var"]+n)
		var str = sa.map(function(e){
			//console.log(e);
			return (String.fromCharCode((e>>8),(e%256)));
		}).join("");
		return str;
	},
	changeView: function(d){
		var st = this.state.stack;
		st.push(this.state.data); //immediate parent will be at top of stack
		console.log(d)
		console.log(st)
		this.setState({data:[d]})
		//console.log(this.props.data)
		//this.setState({data: d, stack: st });
	},
	goBack: function(){
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			if(this.state.settings){
				setTimeout(this.setState({data: d, stack: stack, settings: !this.state.settings}),100);
			}else{
				setTimeout(this.setState({data: d, stack: stack}),100);
			}
			
		}
	},
	toggleSettings: function(){
		if(this.state.settings){
			this.goBack();
		}
		else{
			this.setState({settings:true});
			var SettingArray = ['Settings',[]]
			this.changeView(SettingArray);
		}
	},
	toggleAttention: function(){
		if(this.state.attention == "attention"){
			this.setState({attention:"attention_clear"});
		}else{
			this.setState({attention:"attention"})
		}
	},
	doSearch: function(q){
		//placeholder... literally does nothing
		//actually do somthing now
		this.setState({query:q});
		this.filter();

	},
	filter: function(){
		//filter components? (based on data?)
	},
	componentWillReceiveProps: function(nextProps){
		this.setState({data:[['Settings',nextProps.data],['Volatile',[]]]})
	},
	settingClick: function(s){
		console.log(s)
		this.changeView(s);
	},
	render: function(){
		var self = this;
		var back = false;
		if (this.state.stack.length > 0){
			back = true;
		}
		var attention = this.state.attention
		var cv = this.changeView
		var menuCats = this.state.data.map(function(ct, i){
			if(ct[0] == 'MainDisplay'){
				return(<MainDisplay ws={self.props.ws} ref='md'/>)
			}else if(ct[0] == 'Settings'){
				return(<SettingsDisplay ws={self.props.ws} ref='sd' onHandleClick={self.settingClick} data={[]}/>)
			}else{
				return(<MenuCategory ws={self.props.ws} key={i} name={ct[0]} data={[ct[1]]} onHandleClick={cv}/>)	
			}
			
		})
		var panel = <Panel ws={this.props.ws} ref={'pn'}/>;
		console.log(this.state.data)
		return (<div className='menuContainer'>
			<table className="menuTable"><tr><td className="buttCell" hidden={!back} ><button className="backButton" onClick={this.goBack}/></td>
			<td><h1>Menu</h1></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className="config"/></td></tr></table><table className="menuTable">
			<tr><td><SearchBox query={this.state.query} doSearch={this.doSearch}/></td></tr></table> 
			{menuCats}
			{panel}
			</div>)
	}
})

var SettingsDisplay = React.createClass({
	handleItemclick: function(dat){
		this.props.onHandleClick(dat);
	},
	parseInfo: function(sys, prd){
		if(this.isDiff(sys,this.state.sysRec)||this.isDiff(prd,this.state.prodRec)){
			this.setState({sysRec:sys, prodRec:prd})
		}
	},
	isDiff: function(x, y){
		for(var p in x){
			if(typeof y[p] != 'undefined'){
				if(!(x[p] == y[p])){
					//console.log(p)
					return true
				}
			}else{

				//console.log(x[p])
				//console.log(y[p])
				return true
			}
		}
		return false;
	},
	toggle: function(e){
		e.preventDefault();
		this.setState({isHidden: !this.state.isHidden} );
	},
	getInitialState: function(){
		return({
			 isHidden: true, sysRec:sysSettings, prodRec:prodSettings
			
		});
	},
	render: function(){
		var ih = this.state.isHidden;
		var handler = this.handleItemclick;
		//var hasContent = this.props.data
		console.log(this.state)
	    console.log(this.props.data)
	    var clis = [];
		for(var c in combinedSettings){
			console.log(c)
			clis.push([c,combinedSettings[c]])
		}
		var menuNodes = ""
		if(Array.isArray(clis)){
			menuNodes = clis.map(function (item) {
	        console.log(item)
	      return (
	      	<MenuItem lkey={item[0]} name={item[0]} isHidden={ih} hasChild={false} 
	      	data={item} onItemClick={handler} hasContent={true}/>
	      );
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
			<span  onClick={this.toggle}><h2 >Settings</h2></span>
				{menuNodes}
			</div>
		);
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
var MainDisplay = React.createClass({
	getInitialState: function(){
		return({productName:'',sens:100,sig:0,phase:'90', isHidden:false})
	},
	toggle: function(e){
		e.preventDefault();
		this.setState({isHidden: !this.state.isHidden} );
	},
	render: function(){
		var ih = this.state.isHidden

	    var className = "menuCategory";
	    if (ih){
	    	className = "menuCategory collapsed";
	    }
	    else{
	    	className = "menuCategory expanded";
	    }
		return(
			<div className={className}>
			<span  onClick={this.toggle}><h2 >Main</h2></span>
			<div hidden={ih} className='mainPage'>
				<table>
					<tr><td>Current Product: </td><td>{this.state.productName}</td></tr>
					<tr><td>Sensitivity: </td><td>{this.state.sens}</td></tr>
					<tr><td>Signal: </td><td>{this.state.sig}</td></tr>
					<tr><td>Phase: </td><td>{this.state.phase}</td></tr>
				</table>
			</div>
			</div>)
	}
})

React.render(<Container/>,document.getElementById('content'))