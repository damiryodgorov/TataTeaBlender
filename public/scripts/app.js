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

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

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
		//	console.log("????")

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

var TickerBox = React.createClass({
	getInitialState: function(){
		return{ticks:0}
	},
	componentDidMount: function(){
		var ref = this;
		
	},
	render: function(){
		var tickerVal= this.state.ticks;
		if(Math.abs(tickerVal)<50){
			tickerVal = 0;
		}else if(tickerVal>0){
			tickerVal = tickerVal - 50;
		}else{
			tickerVal = tickerVal + 50
		}
		var color = 'green';
		if(Math.abs(tickerVal)>50){
			color = 'red';
		}
		if(tickerVal>200){
			tickerVal = 200;
		}else if(tickerVal < -200){
			tickerVal = -200
		}
		return (
			<div className='tickerBox'>
			<div className='example_path'>
				<div className='example_block' style = {{left:50-(tickerVal/4)+'%',backgroundColor:color}}/>
			</div>
			</div>
		)
	}
});


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
var LEDBar = React.createClass({
	getInitialState: function(){
		return ({leds:0, lcd:0})
	},
	render: function(){
		var rej = 'black';
		var prod = 'black';
		var fault = 'black';
		console.log(this.state.leds & 0xf)
		if ((this.state.lcd>>3)&1 == 1){
			fault = 'red';
		}
		if ((this.state.leds>>5)&1 == 1){
			prod = 'green';
		}
		if ((this.state.leds>>4)&1 == 1){
			prod = 'red';
		}
		if ((this.state.leds>>6)&1 == 1){
			rej = 'red';
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LED color={rej}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LED color={prod}/></td></tr></tbody></table>
			</div>
			)
	}
});
var LED = React.createClass({
	render: function(){
		return(<div className='led' style={{ backgroundColor:this.props.color}}/>)
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

var App = React.createClass({

  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  afterOpenModal: function() {
    // references are now sync'd and can be accessed.
    this.refs.subtitle.style.color = '#f00';
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  render: function() {
    return (
      <div>
        <button onClick={this.openModal}>Open Modal</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <h2 ref="subtitle">Hello</h2>
          <button onClick={this.closeModal}>close</button>
          <div>I am a modal</div>
          <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
          </form>
        </Modal>
      </div>
    );
  }
});


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
				<table><tbody><tr>
				<td><NavButton ws={self.props.ws} klass='rButton' keyMap={65}/></td><td>
				<h3  className='panelTitle' style={font}><pre id='l1' style={{margin:0}}>{t1}</pre></h3>
				</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={57}/></td></tr><tr>
				<td><NavButton ws={self.props.ws} klass='rButton' keyMap={51}/></td><td>
				<h3  className='panelTitle' style={font}><pre id='l2' style={{margin:0}}>{t2}</pre></h3>
				</td><td><NavButton ws={self.props.ws} klass='lButton' keyMap={56}/></td></tr></tbody></table>
				{editControls}
			</div>
		)
	}
});


var MobileMenu = React.createClass({
	//This display will allow for navigating back to previous pages - 
	getInitialState: function(){
		var mq = window.matchMedia("(min-width: 800px)");
		mq.addListener(this.listenToMq)
		console.log(mq.matches)
	
		return ({modalIsOpen:false, currentView:'MainDisplay', data:[], stack:[], 
			settings:false, attention:"attention", query: '' , faults:[], mq:mq, br7:mq.matches})
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
			//this.refs.pn.handleMsg(msg)
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
					if(this.state.currentView == 'MainDisplay'){
					var prodName = this.getVal(prodArray, 1, 'ProdName')		
					var sens = this.getVal(prodArray, 1, 'SigPath[0].Sens')
					//console.log([prodName, sens])

					/*if((this.refs.md.state.productName != prodName)||(this.refs.md.state.sens != sens)){
						this.refs.md.setState({productName:prodName, sens:sens})
					}*/
					}
					else if(this.state.currentView = "SettingsDisplay"){
			//			console.log('line 810')
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
		st.push([this.state.currentView, this.state.data]); //immediate parent will be at top of stack
		console.log(d)
		console.log(st)
		this.setState({currentView:d[0], data:d[1]})
		//console.log(this.props.data)
		//this.setState({data: d, stack: st });
	},
	goBack: function(){
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			
				setTimeout(this.setState({currentView:d[0], data: d[1], stack: stack, setttings:(d[0] == 'SettingsDisplay') }),100);
			
		}
	},
	toggleSettings: function(){
		if(this.state.settings){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], settings:false})
		}
		else{
			this.setState({settings:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}
	},
	toggleAttention: function(){
		if(this.state.attention == "attention"){
			this.setState({attention:"attention_clear", faults:[{'type':'reference'},{'type':'24v'}]});
			this.openModal();
		}else{
			this.setState({attention:"attention", faults:[]})
			this.closeModal();
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
	settingClick:function(s){
		var set = this.state.data.slice(0)
		set.push(s[0])
		this.changeView(['SettingsDisplay',set]);
	},
	openModal: function() {
	this.refs.faultModal.toggle();
    this.setState({modalIsOpen: true});
  },

  afterOpenModal: function() {
    // references are now sync'd and can be accessed.
    this.refs.subtitle.style.color = '#f00';
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  listenToMq:function (match) {
  	// body...
  	this.setState({br7:this.state.mq.matches})
   },
	render: function(){
		var products = [{name:'Product1', number:1}, {name:'Product2', number:2}]
		var display;
		var back = false;
		if (this.state.stack.length > 0){
			back = true;
		}
		var attention = this.state.attention
		if(this.state.currentView == 'MainDisplay'){
		//	display = <MainDisplay ws={this.props.ws} ref='md'/>
			display = 	<MainView ws={this.props.ws}/>
		}else if(this.state.currentView == 'SettingsDisplay'){
			display = <SettingsDisplay goBack={this.goBack} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick}/>
		}
		var panel = <Panel ws={this.props.ws} ref={'pn'}/>;
		var faults = this.state.faults.map(function(f){
			return <FaultItem data={f}/>
		})
		var menuString = 'Stealth'
		var config = 'config'
		if(this.state.currentView == 'SettingsDisplay'){
			menuString = 'Settings'
			config = 'config_active'
		}
		if (!this.state.br7){


		return(<div className="menuContainer">
			<table className="menuTable"><tbody><tr><td className="buttCell" hidden={true} ><button className="backButton" onClick={this.goBack}/></td>
			<td><img className='logo' src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className={config}/></td></tr></tbody></table>
			<Modal
          ref={'faultModal'} >

          <h2 ref="subtitle">Faults</h2>
          <button onClick={this.closeModal}>close</button>
          <div>Current Faults</div>
       		{faults}
        </Modal>
        	<LiveView/>
        	{display}

        	<ProductEditor products={products}/>
			<MultiScan/>
			</div>)
		}else{
			return (<div className="menuContainer">
			<table className="menuTable"><tbody><tr><td className="buttCell" hidden={true} ><button className="backButton" onClick={this.goBack}/></td>
			<td><img className='logo' src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td><td className='mobCell'><MobLiveBar/></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className={config}/></td></tr></tbody></table>
			<Modal
          ref={'faultModal'} >

          <h2 ref="subtitle">Faults</h2>
          <button onClick={this.closeModal}>close</button>
          <div>Current Faults</div>
       		{faults}
        </Modal>
        	{display}
        	<ProductEditor products={products}/>
        	<MultiScan/>
			</div>)
		}
	}

})

var MobLiveBar = React.createClass({
	render: function () {
		return(<div className="mobLiveBar"><StatBar/></div>)
		// body...
	}
})


var FaultItem = React.createClass({
	render: function(){
		var type = this.props.data.type

		return <div><label>{"Fault type: " + type}</label></div>
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
					return true
				}
			}else{
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
			 isHidden: false, sysRec:sysSettings, prodRec:prodSettings
		});
	},
	render: function (){
		var ih = this.state.isHidden;
		var data = this.props.data
		console.log(data)
		var lvl = data.length
		var handler = this.handleItemclick;
		var lab = 'Settings'
		console.log(lvl)
		var nodes;
		 var clis = [];
			for(var c in combinedSettings){
				console.log(c)
				clis.push([c,combinedSettings[c]])
			}
			console.log(clis)
		var nav =''
		var backBut = ''
		if(lvl == 0){
			nodes = clis.map(function (item) {
	        console.log(item)
	     //   return(<SettingItem data={item} onItemClick={handler} isHidden={ih}/>)
	      return (
	      	<SettingItem lkey={item[0]} name={item[0]} isHidden={ih} hasChild={true} 
	      	data={item} onItemClick={handler} hasContent={true}/>
	      );
	      
	    });
			nav = nodes;
		}else if(lvl == 1 ){

			var cat = data[0];
			lab = cat
			var list = combinedSettings[cat]
			console.log(list)
			nodes = []
			for (var l in list){
				nodes.push((<SettingItem lkey={l} name={l} isHidden={ih} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true} />))
			}
			nav = (<div className='setNav'><span><h3>{cat}</h3></span>
					{nodes}
				</div>)
			backBut =(<img className='bbut' onClick={this.props.goBack} src='assets/angle-left.svg'/>)

		}
			    var className = "menuCategory";
	    if (ih){
	    	className = "menuCategory collapsed";
	    }
	    else{
	    	className = "menuCategory expanded";
	    }
		return(
			<div className='settingsDiv'>
			<div className={className}>
			<span  onClick={this.toggle}><h2 >{backBut}{lab}</h2></span>
				{nav}
			</div>
			</div>
		);
	},
	
})
var SettingItem = React.createClass({
	getInitialState: function(){
		return({mode:0})
	},
	sendPacket: function(){

	},
	onItemClick: function(){
		if(this.props.hasChild){
			this.props.onItemClick(this.props.data)	
		}
		
	},
	render: function(){
		if(this.state.mode == 1){
			return (<div className='sItem' hidden={this.props.isHidden}>
				<EditControl name={this.props.name} data={this.props.data} sendPacket={this.sendPacket}/></div>) 
		}
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
		return (<div className='sItem hasChild' hidden={this.props.isHidden} onClick={this.onItemClick}><label>{this.props.name}</label></div>)
		}else{
			var pram;
			var val;
			var label = false
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
					label = true
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
				//	val = pVdef[3][pram["@labels"]]["english"][val]
					label = true
				}
			}else{
				val = this.props.data
			} 
			var edctrl = <EditControl name={this.props.name} sendPacket={this.sendPacket} data={val}/>
			if(label){
				edctrl = <EditControlSelect mode={true} list={pVdef[3][pram["@labels"]]['english']} val = {val}><label>{this.props.name}</label></EditControlSelect>
			}

			return (<div className='sItem' hidden={this.props.isHidden}> {edctrl}
				</div>)
		}
	}
})

var EditControl = React.createClass({
	getInitialState: function(){
		return({val:this.props.data, changed:false})
	},
	sendPacket: function(){
		this.props.sendPacket(this.props.name, this.state.val)
	},
	valChanged: function(e){
		this.setState({val:e.target.value})
	},
	submit: function(){

	},
	render: function(){
		return (<div><label>{this.props.name + ": "}</label><input onChange={this.valChanged} type='text' value={this.state.val}></input>
			<button onClick={this.sendPacket}>Submit</button></div>)
	}
})
var ItemContent = React.createClass({
	render: function(){
		return (<div>could be the plot here!</div>)
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
					<tbody>
					<tr><td>Current Product: </td><td>{this.state.productName}</td></tr>
					<tr><td>Sensitivity: </td><td>{this.state.sens}</td></tr>
					<tr><td>Signal: </td><td>{this.state.sig}</td></tr>
					<tr><td>Phase: </td><td>{this.state.phase}</td></tr>
					</tbody>
				</table>
			</div>
			</div>)
	}
})

var MainView = React.createClass({
	//this will contain product info, etc, and be 
	getInitialState: function(){
		return ({products:{}, currProd:0,prodList:[], hasProd:false})
	},
	setProd: function(e){
		e.preventDefault();
	},
	render: function(){
		var selectProduct = (<select onChange={this.setProd}>
			<option value = "product1">Product 1</option>
		</select>)
		return(<div className='mainView'><table><tbody><tr><td>Current Product: </td><td>{selectProduct}</td></tr><tr><td>Sensitivity: </td><td>100</td></tr>
			<tr><td>Phase:</td><td>90</td></tr>
			<tr><td>Mode:</td><td>0</td></tr></tbody></table></div>)
	}
})

var LiveView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90})
	},
	render: function(){
		return (<div className='liveView'>
			{this.props.children}
			<StatBar/>
			</div>
			)
		/*<table className='liveTable'><tbody><tr><td>Current Rejects: </td><td>{this.state.rejects}</td></tr>
			<tr><td>Mode: </td><td>{this.state.mode}</td></tr>
			<tr><td>Phase: </td><td>{this.state.phase}</td></tr></tbody></table>*/
	}	
})

var StatBar = React.createClass({
	render: function(){
		return (<div className='statBar'>
			<TickerBox/>
			<LEDBar/>
			</div>)
	}
})

var EditControlSelect = React.createClass({
	getInitialState: function(){
		return({value:this.props.val, editMode:this.props.mode})
	},
	onSubmit:function(e){
		e.preventDefault();
		var val = this.state.value;
		if(helpers.Editable.indexOf(this.props.s) != -1 ){
			val = helpers.Reverse[this.props.s].apply(this, [].concat.apply([],[val, deps] ))
		}else if(this.props.bitLen == 16){
			val = VdefHelper.swap16(val)

		}
		this.props.handleSubmit(this.props.param, parseInt(val));
		this.setState({editMode:false})
	},
	changeMode:function(e){
		e.preventDefault();
		if(this.props.editable){
			this.setState({editMode:true})
		}
	},
	valChanged:function(e){
		this.setState({value:e.target.value});
	},
	render: function(){
		var selected = this.state.value;
		console.log('line 924')
		console.log(this.props.list)
		var options = this.props.list.map(function(e,i){
			if(i==selected){
				return (<option value={i} selected>{e}</option>)
			}else{
				return (<option value={i}>{e}</option>)
			}
		})
		var editbutton = "";
		if(this.props.editable){
			editbutton = <input type="submit" value="Edit" />
		}
		if(this.state.editMode){
		return(<form className='editControl' onSubmit={this.onSubmit}>
			{this.props.children}
			<select onChange={this.valChanged}>
			{options}
			</select>
			{editbutton}
			</form>)
		}else{
			return(
				<form className='editControl' onSubmit={this.changeMode}>
					{this.props.children}
					<label>{this.props.displayValue}</label>
					{editbutton}
				</form>
			)
		}
	}
})	
var Modal = React.createClass({
	getInitialState: function () {
		// body...
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		return({className:klass, show:false})
	},
	toggle: function () {
		// body...
		this.setState({show:!this.state.show})
	},
	doNothing:function (e) {
		e.preventDefault();
		// body...
	},
	render: function () {
		// body...
		return(<div className={this.state.className} hidden={!this.state.show}>
				<div className='modal-outer'>
				<button className='modal-close' onClick={this.toggle}><img className='closeIcon' src='assets/Close-icon.png'/></button>
				<div className='modal-content'>
					{this.props.children}
				</div>
				</div>
			</div>)
	}
})

var ResponsiveMenuBar = React.createClass({
	render:function(){
		return (<div></div>)
	}
})
var ProductEditor = React.createClass({
	getInitialState: function () {
		// body...
		return({products:this.props.products, prodNum:1, index:0})
	},
	addProd: function (n) {
		// body...
		var products = this.state.products
		products.push(n);
		this.setState({products:products})

	},
	selectProd: function(index) {
		// body...
		//alert(prod)
		this.setState({prodNum:this.state.products[index].number, index:index})
	},
	call: function (f,i,data) {
		// body...

		 if(f == 'copy'){
		 	this.addProd(i)
		 }
		 else if(f == 'del')
		 {
		 	this.del(i)
		 }else if( f == 'update'){
		 	this.update(i,data)
		 }	
	},
	update: function (i,d) {
		// body...
		var products = this.state.products
		products[i].name = d
		this.setState({products:products})
	},
	del: function(p) {
		var products = this.state.products;
		products.splice(p,1);
		this.setState({products:products})
		
	},
	openAddModal: function () {
		// body...
		this.refs.addModal.toggle()
	},
	copyProd: function() {
		this.addProd(this.props.products[this.state.index])
		// body...
	},
	addNewProd: function () {
		// body...
		this.addProd({name:'Product', number:(this.props.products.length + 1)})
	},
	delCurrent: function () {
		// body...
		var products = this.state.products;
		products.splice(this.state.index,1);

		this.setState({products:products, index:0, prodNum:products[0].number})
	},
	render: function() {
		// body...
		var self = this;
		var ProdList = this.state.products.map(function(p,i){
			var active = false;
			if(p.number == self.state.prodNum){
				active= true;
			}
			return <ProductView call={self.call} prod={p} index={i} select={self.selectProd} active={active}/>
			console.log(active)
		});
		return (<div className='productEditor'>
				<button onClick={this.addNewProd}>Add New</button>
				<button onClick={this.copyProd}>Copy Current Product</button>
				<button onClick={this.delCurrent}>Delete Current Product</button>
			
				{ProdList}
				<Modal ref='addModal'>
					<div>copy existing product</div>
					<div>new product</div>
				</Modal>
			</div>)
		}
	
});
var ProductView = React.createClass({
	getInitialState: function(){
		return ({data:[], name:this.props.prod.name})
	},
	del: function () {
		// body...
		this.props.call('del', this.props.index)
	},
	copy: function () {
		// body...
		this.props.call('copy',this.props.index, this.props.prod)
	},
	edit: function () {
		//alert('edit')
		//this.props.call('edit', this.props.index, this.state.data)
		// body...
		console.log('edit')
		this.refs.editModal.toggle()
	},
	submitClick: function (argument) {
		// body...
		//console.log('click me')
		this.refs.editModal.toggle()
		this.props.call('update', this.props.index, this.state.name)
	},
	select: function () {
		// body...
		//alert("select this")
		this.props.select(this.props.index)
	},
	onNameChange: function (e){
		// body...
		this.setState({name:e.target.value})
	},
	render: function (argument) {
		// body...
		var p = this.props.prod
		var act;
		if(this.props.active){
			act=(<img className='checkmark' src='assets/check48.png'/>)
		}

		return (<div className='productView'>
				<button onClick={this.edit}><img className='checkmark' src='assets/edit48.png'/></button><label>{p.name}</label> <button onClick={this.del}>Delete</button> <button onClick={this.copy}>Copy</button> 
				<button onClick={this.select}>Select</button>{act}
				<Modal ref={'editModal'}><div><label>Edit Product</label>
				<input type='text' value={this.state.name} onChange={this.onNameChange}/>
				<button onClick={this.submitClick}>submit</button></div></Modal>
			</div>)
	}
})

var MultiScan = React.createClass({
	getInitialState: function () {
		// body...
		return ({units:['192.168.10.50','192.168.10.51']})
	},
	switchUnit: function (u) {
		// body...
		console.log(u)
		alert(u)
	},
	render: function () {
		var self = this;
		var units = this.state.units.map(function (u) {
			// body...
			return <MultiScanUnit onSelect={self.switchUnit} unit={u}/>
		})
		// body...
		return (<div className='multScan'>
				{units}
			</div>)
	}
})
var MultiScanUnit = React.createClass({
	onClick: function () {
		// body...
		this.props.onSelect(this.props.unit)
	},
	render: function () {
		// body...
		return(<div className='multiScanUnit'>
			<LiveView>
				<div onClick={this.onClick}><label>Detector Name</label></div>
				<div><label>Current Product</label></div>
			</LiveView>
		</div>)
	}
})
ReactDOM.render(<Container/>,document.getElementById('content'))

