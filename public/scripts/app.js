'use strict'

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= 32 - nbit;
    uint >>= 32 - nbit;
    if(uint<0){
    	//console.log(uint)
    }
    return uint;
}
function dsp_rpc_paylod_for (n_func, i16_args, byte_data) {
        var rpc = [];
        var n_args = i16_args.length;
        var bytes = [];
        if (n_args > 3) n_args = 3;
        // if (byte_data instanceof String) {
        if (typeof byte_data == "string") {
         // alert(byte_data);
          for(var i=0; i<byte_data.length; i++) {
              bytes.push(byte_data.charCodeAt(i));
          }
          console.log(bytes)
        } else if (byte_data instanceof Array) {
          bytes = byte_data;
        }
        rpc[0] = n_func;
        rpc[1] = n_args;
        if (bytes.length > 0) rpc[1] += 4;
        var j=2;
        for(var i=0; i<n_args; i++) {
          rpc[j] = i16_args[i] & 0xff; j+= 1;
          rpc[j] = (i16_args[i] >> 8) & 0xff; j+= 1;
        }
        if (bytes.length > 0) rpc = rpc.concat(bytes);
        
        var cs = fletcherCheckBytes(rpc);
        var cs1=255-((cs[0]+cs[1])%255);  // modify the bytes so the the checksum
        var cs2=255-((cs[0]+cs1)%255); // of the whole payload will be zero
        rpc.push(cs1);
        rpc.push(cs2);
        return rpc;
}
      function fletcherCheckBytes (data) {
        var c1=0, c2=0;
        for(var i=0; i<data.length; i++) {
          c1 += data[i]; if (c1 >=255) c1 -= 255;
          c2 += c1;      if (c2 >=255) c2 -= 255;
        }
        return [c1,c2];
      }
 var ToySettings = {'Others':{}, 'Password':{},'Sensitivity':{}}
var VolatileList = {'Signal':{}}
var MenuStructure = [ToySettings,VolatileList]
var socket = io();

var sysSettings = {};
var prodSettings ={};
var combinedSettings = [];

var located = false;
var cnt = 0;


var myTimers = {}

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
	static prod_name_u16_le(val){
		return val
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

	static eye_rej_mode(val, photo, width){
		if(photo == 0){
			return 3;
		}else{
			if (val == 0){
				if (width == 0){
					return 0;
				}else{
					return 2;
				}
			}else{
				return 1;
			}
		}
		
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
	static ipv4_address(ip){
		//todo
		return ip
	}
}



socket.on('vdef', function(vdf){

var json = vdf[0];
Vdef = json
console.log(Vdef)
if (vdefList[json['@version']]){
    console.log('already have this version')

  }else{
  	    // Vdef = json;
  //console.log(json)
  var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
    nVdf = {};
    nVdf['Other'] = [];
    nVdf['Password'] = [];
    nVdf['Rej Setup'] = [];
    nVdf['Faults'] = [];
    nVdf['Output'] = [];
    nVdf['Sensitivity'] = [];
    nVdf['Test'] = [];
    nVdf['Calibration'] = [];
    nVdf['Input'] = [];
    nVdf['Output'] = [];

    json["@params"].forEach(function(p ){
      res[p["@rec"]][p["@name"]] = p;
     var nm = p['@name'];
     var otherFlag = true;
     if(p["@rec"]<2){


     for(var o in value_groups){
     // console.log(o)

	if(o == 'Faults'){
      if(nm.indexOf('FaultMask')!= -1){
        nVdf[o].push(p);
        otherFlag = false;
        break;
      }
     }else if(o == 'Test'){
     	if(nm.indexOf('TestConfig')!= -1){
        nVdf[o].push(p);
        otherFlag = false;
        break;
      }
     }else if(o == 'Input'){
     	if(nm.indexOf('INPUT')!= -1){
     		console.log([o,p])
     		  nVdf[o].push(p);
        otherFlag = false;
        break;
     	} 
     }else if(o == 'Output'){
     	if(nm.indexOf('OUT')!= -1){
     		  nVdf[o].push(p);
        otherFlag = false;
        break;
     	}
     }else if(o == 'Calibration'){
     	if(nm.indexOf('Phase')!= -1){
     		//nVdf[o].push(p);
        	//otherFlag = false;
        	//break;
     	}
     }
     if(value_groups[o].indexOf(nm) != -1){
      nVdf[o].push(p);
      otherFlag = false;
      break;
     }

   }
   if(otherFlag){  
   	if(p["@rec"] <2){

      nVdf['Other'].push(p)
   	}
   }
}
    });
    console.log(res[2])
    console.log(res[3])
    console.log(nVdf)
    res[4] = json["@deps"];
    res[5] = json["@labels"]
    res[6] = [];
   for(var par in res[2]){ 	
   //	var p = res[2][par]
   	//console.log(p["@name"])
    	if(par.indexOf('Fault') != -1){
    		console.log("fault found")
    		res[6].push(par)
    	}
    	// body...
    }
    pVdef = res;
    vdefList[json['@version']] = [json, res, nVdf]
    isVdefSet = true;
    console.log(res)
}
})


var wSockets = {}
var wVdefSockets = {}
var wParamSockets = {}
var wRSockets = {}
var reconTries = [{},{},{}]
var liveTimer = {}


var Container = React.createClass({
	getInitialState:function(){
		var self = this;
		//socket.emit('hello', 'from me')
		
	
		var dat = []

		return({ data:dat})
	},
	render: function (){
		// body...	<MobileMenu ref={'mm'} ws={this.state.ws} data={this.state.data}/>
		return (<div>
			<LandingPage/>
		
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
	update:function (data) {
		// body...
		this.setState({ticks:data})
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
		return ({pled:0, dled:0})
	},
	update:function (p,d) {
		// body...
		if((this.state.pled != p) || (this.state.dled != d)){
			this.setState({pled:p, dled:d})
		}
	},
	render: function(){
		var rej = 'black';
		var prod = 'black';
		var fault = 'black';
	//	console.log(this.state.leds & 0xf)
		if(this.state.pled == 1){
			prod = 'green';
		}else if(this.state.pled == 2){
			prod = 'red'
		}
		if(this.state.dled == 1){
			rej = 'red'
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

var MobLiveBar = React.createClass({
	update: function (data) {
		this.refs.st.update(data)
		// body...
	},
	render: function () {
		return(<div className="mobLiveBar"><StatBar ref='st'/></div>)
		// body...
	}
})


var FaultItem = React.createClass({
	maskFault:function(){
		this.props.maskFault(this.props.fault)
	},
	render: function(){
		var type = this.props.fault
		return <div><label>{"Fault type: " + type}</label>
		</div>
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
	componentDidMount: function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.dsp, data:buf.buffer})
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
		//this.setState({isHidden: !this.state.isHidden} );
	},
	getInitialState: function(){
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		var font = 0;
		if(mqls[2].matches){
			font = 2
		}else if(mqls[1].matches){
			font = 1
			
		}else if(mqls[0].matches){
			font = 0;
			//shouldn't happen
		}

		return({
			 isHidden: false, sysRec:sysSettings, prodRec:prodSettings, mqls:mqls, font:font
		});
	},
	listenToMq:function () {
		// body...
		//this.setState({})
		if(this.state.mqls[2].matches){
			this.setState({font:2})
		}else if(this.state.mqls[1].matches){
			this.setState({font:1})
			
		}else if(this.state.mqls[0].matches){
			this.setState({font:0})
		}else{
			//shouldn't happen
		}
	},
	sendPacket: function (n,v) {
		// body...
		var self = this;
		console.log([n,v])
		if(pVdef[0][n]){
			console.log(pVdef[0][n])
		}else if(pVdef[1][n]){
			console.log(pVdef[1][n])
		}
		if(n['@rpcs']['toggle']){

			var arg1 = n['@rpcs']['toggle'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['toggle'][1].length;i++){
				if(!isNaN(n['@rpcs']['toggle'][1][i])){
					arg2.push(n['@rpcs']['toggle'][1][i])
				}else{
					arg2.push(v)
				}
			}
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			var buf = new Uint8Array(packet);
			console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}else if(n['@rpcs']['write']){
			var arg1 = n['@rpcs']['write'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
				if(!isNaN(n['@rpcs']['write'][1][i])){
					arg2.push(n['@rpcs']['write'][1][i])
				}else if(n['@rpcs']['write'][1][i] == n['@name']){
					arg2.push(v)
				}else{
					var dep = n['@rpcs']['apiwrite'][1][i]
					if(dep.charAt(0) == '%'){

					}
				}
			}
			if(n['@rpcs']['write'][2]){

			}
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			var buf = new Uint8Array(packet);
			console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}else if(n['@rpcs']['apiwrite']){
			var arg1 = n['@rpcs']['apiwrite'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpcs']['apiwrite'][1].length;i++){
				if(!isNaN(n['@rpcs']['apiwrite'][1][i])){
					arg2.push(n['@rpcs']['apiwrite'][1][i])
				}else if(n['@rpcs']['apiwrite'][1][i] == n['@name']){
					arg2.push(v)
				}else{
					console.log(n['@rpcs']['apiwrite'][1][i])
				}
			}
			if(n['@rpcs']['apiwrite'][2]){

			}
			if(n['@rec'] == 0){
				var mphaserd = this.state.prodRec['MPhaseRD']
				if(mphaserd != 30){
					mphaserd = 30;
				}else{
					mphaserd = 31
				}
				var pack = dsp_rpc_paylod_for(19,[356,mphaserd,0])
				var bu = new Uint8Array(pack);
				setTimeout(function () {
					// body...
					socket.emit('rpc', {ip:self.props.dsp, data:bu.buffer})
				},150)
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			var buf = new Uint8Array(packet);
			console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}
	},
	activate: function (n) {
		// body...
		var list = combinedSettings[this.props.data[0]]
		for(var l in list){
			if(l!=n){
				if(this.refs[l]){
					this.refs[l].deactivate();
				}
			}
		}


	},
	render: function (){
		var self = this;
		var ih = this.state.isHidden;
		var data = this.props.data
		console.log(data)
		var lvl = data.length
		var handler = this.handleItemclick;
		var lab = 'Settings'
		console.log(lvl)
		var nodes;
		var ft = 25;
		if(this.state.font == 1){
			ft = 20
		}else if(this.state.font == 0){
			ft = 18
		}
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
	      	<SettingItem ref={item[0]} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={item[0]} name={item[0]} isHidden={ih} hasChild={true} 
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
				nodes.push((<SettingItem ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} isHidden={ih} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true} />))
			}
			nav = (<div className='setNav'>
					{nodes}
				</div>)

			backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Settings</label></div>)

		}
			    var className = "menuCategory";
	    if (ih){
	    	className = "menuCategory collapsed";
	    }
	    else{
	    	className = "menuCategory expanded";
	    }
	    console.log(lab)
	    var titlediv = (<span  onClick={this.toggle}><h2 style={{textAlign:'center'}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>
)
	    if (this.state.font == 1){
	    	titlediv = (<span  onClick={this.toggle}><h2 style={{textAlign:'center', fontSize:30}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span  onClick={this.toggle}><h2 style={{textAlign:'center', fontSize:24}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
	    }
		return(
			<div className='settingsDiv'>
			<div className={className}>
							{titlediv}
							{nav}
			</div>
			</div>
		);
	},
	
})
var SettingItem = React.createClass({
	getInitialState: function(){
		return({mode:0,font:this.props.font})
	},
	sendPacket: function(n,v){
		if(!isNaN(v)){
			console.log(this.props)
			console.log(parseInt(v))	
		}
		this.props.sendPacket(n,v)
		
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		this.setState({font:newProps.font})
	},
	onItemClick: function(){
		if(this.props.hasChild){
			this.props.onItemClick(this.props.data)	
		}
		
	},
	activate: function () {
		// body...
		this.props.activate(this.props.name)
	},
	deactivate: function () {
		// body...
		this.refs.ed.deactivate()
	},
	render: function(){
		var st = {display:'inline-block', fontSize:20, width:250}
		var vst = {display:'inline-block', fontSize:20}
			if(this.state.font == 1){
				st = {display:'inline-block', fontSize:16, width:200}
				vst = {display:'inline-block', fontSize:16}
			}else if(this.state.font == 0){
				st = {display:'inline-block', fontSize:14, width:180}
				vst = {display:'inline-block', fontSize:14}
			}
		if(this.state.mode == 1){
			console.log('what was this...')
			return (<div className='sItem'  hidden={this.props.isHidden}>
				<EditControl size={this.state.font} name={this.props.name} data={this.props.data} sendPacket={this.sendPacket}/></div>) 
		}
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
		return (<div className='sItem hasChild' hidden={this.props.isHidden} onClick={this.onItemClick}><label>{this.props.name}</label></div>)
		}else{
			var pram;
			var val;
			var label = false
			//var pv = vdef
			if(typeof pVdef[0][this.props.name] != 'undefined'){
				pram = pVdef[0][this.props.name]
			//	console.log(pram)
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							//console.log(d)
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					//console.log(Params)
					//console.log(pram)
					val = Params[f].apply(this, [].concat.apply([], [val, deps]));
				}

				if(pram["@labels"]){
				//	val = pVdef[5][pram["@labels"]]["english"][val]
					label = true
				}
			}else if(typeof pVdef[1][this.props.name] != 'undefined'){
				pram = pVdef[1][this.props.name]
			//	console.log(pram)
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							//console.log(d)
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					console.log(f)
					val = Params[f].apply(this, [].concat.apply([], [val, deps]));
				}

				if(pram["@labels"]){
				//	val = pVdef[3][pram["@labels"]]["english"][val]
					label = true
				}
			}else{
				val = this.props.data
			} 
		
			var edctrl = <EditControl activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} name={this.props.name} sendPacket={this.sendPacket} data={val}/>
			if(label){
				edctrl = <EditControlSelect activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram}  sendPacket={this.sendPacket} size={this.state.font} mode={true} list={pVdef[5][pram["@labels"]]['english']} val = {val}/>
				
			}
			return (<div className='sItem'  hidden={this.props.isHidden}> {edctrl}
				</div>)
		}
	}
})

var EditControl = React.createClass({
	getInitialState: function(){
		return({val:this.props.data, changed:false, mode:0, size:this.props.size})
	},
	sendPacket: function(){
		this.props.sendPacket(this.props.param, this.state.val)
		this.setState({mode:0})
	},
	valChanged: function(e){
		this.setState({val:e.target.value})
	},
	submit: function(){

	},
	componentWillReceiveProps: function (newProps) {
		// body...
		//console.log(newProps)
		this.setState({size:newProps.size})

	},
	deactivate:function () {
		// body...
		this.setState({mode:0})
	},
	switchMode: function () {
		// body...
		if(this.props.param['@rpcs']){
		if((this.props.param['@rpcs']['write'])||(this.props.param['@rpcs']['toggle'])){
			var m = Math.abs(this.state.mode - 1)
			this.props.activate()
			this.setState({mode:m})
		}
	}
		
	},
	render: function(){
		var lab = (<label>{this.state.val}</label>)
		var style = {display:'inline-block',fontSize:20}
		if(this.state.size == 1){
			style = {display:'inline-block',fontSize:16}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:14}
		}
		if(this.state.mode == 0){
			return <div onClick={this.switchMode}><label style={this.props.lvst}>{this.props.name + ": "}</label><label style={this.props.vst}>{this.state.val}</label></div>
		}else{
			return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{this.props.name + ": "}</label><label style={this.props.vst}>{this.state.val}</label></div>
				<div style={{display:'inline-block',width:200}}><input width={10} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val}></input></div>
			<button style={{fontSize:16}} onClick={this.sendPacket}>Submit</button></div>)
		
		}

		}
})


var LiveView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (data) {
		// body...
	//	console.log(data)
		this.refs.st.update(data)
	},
	setLEDs: function (p,d) {
		// body...
		this.refs.st.setLEDs(p,d)
	},
	render: function(){
		return (<div style={this.props.st} className='liveView'>
			{this.props.children}
			<StatBar ref='st'/>
			</div>
			)
	}
})
var LiveMView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (data) {
		// body...
	//	console.log(data)
		this.refs.st.update(data)
	},
	setLEDs: function (p,d) {
		// body...
		this.refs.st.setLEDs(p,d)
	},
	render: function(){
		return (<div className='liveView' style={{fontSize:16}}>
			{this.props.children}
			<StatBar ref='st'/>
			</div>
			)
	}
})
var LiveTView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (data) {
		// body...
	//	console.log(data)
		this.refs.st.update(data)
	},
	setLEDs: function (p,d) {
		// body...
		this.refs.st.setLEDs(p,d)
	},
	render: function(){
		return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBar ref='st'/>
			</td></tr></tbody></table>
			</div>
			)
	}
})
var FaultDiv = React.createClass({
	clearFaults: function () {
		// body...
		this.props.clearFaults()
	},
	maskFault: function (f) {
		// body...
		this.props.maskFault(f)
	},
	render:function () {
		// body...
		var self = this;
		var cont;
		var clButton;
		if(this.props.faults.length == 0){
			cont = (<div><label>No Faults</label></div>)
		}else{
			clButton = <button onClick={this.clearFaults}>Clear Faults</button>
			cont = this.props.faults.map(function(f){
				return <FaultItem maskFault={self.maskFault} fault={f}/>
			})
		}
		return(<div>
			{cont}
			{clButton}
		</div>)
	}
})
var StatBar = React.createClass({
	update: function (data) {
		// body...
		this.refs.tb.update(data)
	},
	setLEDs: function (p,d) {
		// body...
		this.refs.lb.update(p,d)
	},
	render: function(){
		return (<div className='statBar'>
			<TickerBox ref='tb'/>
			<LEDBar ref='lb'/>
			</div>)
	}
})

var EditControlSelect = React.createClass({
	getInitialState: function(){
		return({value:this.props.val, editMode:false,size:this.props.size})
	},
	onSubmit:function(e){
		e.preventDefault();
		var val = this.state.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(val)

		}
		this.props.sendPacket(this.props.param, parseInt(val));
		this.setState({editMode:false})
	},
	submitVal:function () {
		// body...
		this.props.sendPacket(this.props.param, this.state.value)
	},
	changeMode:function(){
		if(this.props.param['@rpcs']){
		
			if((this.props.param['@rpcs']['write'])||(this.props.param['@rpcs']['toggle'])){
				this.props.activate()
				this.setState({editMode:!this.state.editMode})
			}
		}
	},
	deactivate:function () {
		// body...
		this.setState({editMode:false})
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		console.log(newProps)
		this.setState({size:newProps.size})

	},
	valChanged:function(e){
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(val)

		}
		this.props.sendPacket(this.props.param, parseInt(val));
		this.setState({value:e.target.value});

	},
	render: function(){
		var selected = this.state.value;
		var options = this.props.list.map(function(e,i){
			if(i==selected){
				return (<option value={i} selected>{e}</option>)
			}else{
				return (<option value={i}>{e}</option>)
			}
		})
			//editbutton = <button onClick={this.submitVal}>Edit</button>
	
		if(this.state.editMode){
		return(<form className='editControl' onSubmit={this.onSubmit}>
			<div onClick={this.changeMode}><label style={this.props.lvst}>{this.props.param['@name'] + ': '}</label><label style={this.props.vst}> {this.props.list[this.props.val]}</label></div>
			<div className='customSelect'>
			<select onChange={this.valChanged}>
			{options}
			</select>
			
			</div>
			</form>)
		}else{
			return(
				<form className='editControl' onSubmit={this.changeMode}>
					<div onClick={this.changeMode}><label style={this.props.lvst}>{this.props.param['@name'] + ': '}</label><label style={this.props.vst}> {this.props.list[this.props.val]}</label></div>
		
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



var ProductView = React.createClass({
	getInitialState: function(){
		return ({data:[], name:this.props.prod})
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
		var style = {color:'grey'}
		if(this.props.active){
			act=(<img className='checkmark' src='assets/check48.png'/>)
			style={color:'green'}
		}
		var editControl = ""
		if(this.state.mode == 1){
			editControl = (<div></div>)
		}
		
		return (<div className='pView'><img onClick={this.edit} src='assets/angle-right.svg'/><label  onClick={this.select} style={style}>{p}</label>
			{editControl}
			</div>)

	}
})

var MultiBankUnit = React.createClass({
	getInitialState: function () {
		// body...
		var dat = []//[1,2,3,4,5,6,7,8,9,10,11,12];
		if(this.props.data.length >0){
			dat = this.props.data
			console.log(dat)
		}
		return ({banks:dat})
	},
	onRMsg: function (e,d) {
		// body...
		if(this.refs[d.ip]){
			console.log(d)
			this.refs[d.ip].onRMsg(e,d)
	
		}
	},
	componentWillReceiveProps: function (nextProps) {
		// body...

		this.setState({banks:nextProps.data})
	},
	openEdit: function () {
		// body...
		this.refs.editModal.toggle()
	},
	setPnSens: function(p,s,d){
		this.refs[d.ip].setPnSens(p,s);
	},
	setPeakRejs: function (p,r,d) {
		// body...
		this.refs[d.ip].setPeakRejs(p,r);
	},
	setLEDs:function (det,prod,prodhi,d) {
		// body...
		this.refs[d.ip].setLEDs(det,prod,prodhi);
	},
	setFaults:function (faultArray,d) {
		// body...
		this.refs[d.ip].setFaults(faultArray)

	},
	updateMeter: function (m,d) {
		// body...
		this.refs[d.ip].update(m);
	},
	switchUnit: function (u) {
		// body...
		console.log('switch mb')
		this.props.onSelect(u)
	},
	render: function (argument) {
		// body...
		//<div style={{width:100,display:'inline-block'}}>
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			console.log(b)
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.ip} name={b.name}/>
			//return <tr><td >{i+1}</td><td><StatBarMB unit={b} onSelect={self.switchUnit} ref={b.ip} name={b.name}/></td></tr>
			// body...
		})
		return (<div className='multiBankUnit'>
			<div className='nameLabel'>
				<label>{this.props.name}</label>
			</div>
			{banks}
				<Modal ref='editModal'>
					<MBEditor />
				</Modal>
			</div>)
		/*
<table style={{width:'100%'}}>
				<tbody>
					{banks}
				</tbody>

			</table>
		*/
	}
})
var MBEditor = React.createClass({
	getInitialState: function () {
		// body...
		return({name:'', list:['1','2']})
	},
	render:function () {
		// body...
		var name = this.state.name
		return (<div>
				<label>{name}</label>

		</div>)
	}
})

var StatBarMB = React.createClass({
	getInitialState: function () {
		// body...
		var br = window.matchMedia('(min-width:600px)')
		br.addListener(this.listenToMq)
		return({pn:'',phase:9000, phasemode:0,sens:100, peak:0,br:br, mobile:br.matches, rejs:2, fault:false, live:false, pled:0,dled:0, rpcResp:false})
	},
	listenToMq: function () {
		// body...
		this.setState({mobile:this.state.br.matches});
	},
	 update: function (data) {
		// body...
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(data)
	},
	setPnSens: function(p,s){
		if(this.state.sens != s){
			this.setState({sens:s})
		}
	},
	setLEDs:function(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	},
	setPeakRejs: function (p,r) {
		// body...
		if((this.state.peak != p) ||(this.state.rejs != r)){
			console.log(this.state.rejs)
			this.setState({peak:p,rejs:r})
		}
	},
	setFaults: function(faultArray) {
		// body...
		var faults = (faultArray.length != 0);
		if (faults != this.state.fault){
			this.setState({fault:faults})
		}
	},
	switchUnit: function () {
		// body...
		if(this.state.live){
			this.props.onSelect(this.props.unit)	
		}
		
	},
	componentDidMount: function () {
		// body...
		var self = this;
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now()-liveTimer[self.props.unit.ip])>1000){
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				socket.emit('rpc',{ip:self.props.unit.ip, data:buf.buffer});	
			}
			
		},1000)
			
	},
	componentWillUnmount: function () {
		// body...

		//this._isMounted = false
		clearInterval(myTimers[this.props.unit.ip]);
	},
	onRMsg: function (e,d) {
		// body...
		if(d.ip = this.props.unit.ip){
			this.setState({rpcResp:true})	
		}		

	},
	render: function(){

		if(!this.state.mobile){
			return this.renderMob();
			
		}else{
			return this.renderTab();
		}
	
	},
	renderTab: function () {
		// body...
		var klass =''//noclass'// "statBarMB"
		if(this.state.fault){
			klass = 'faultactive'
			console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			console.log(klass)
		}
		var list = ['dry','wet','DSA']
		return(
			<div onClick={this.switchUnit} className={klass}>
				<LiveTView ref='lv'>

					<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>
				</LiveTView>
			</div>
		)

	},
	renderMob: function () {
		// body...
		var rejCount=2;
		var klass =''//noclass'// "statBarMB"
		if(this.state.fault){
			klass = 'faultactive'
			console.log(klass)
		}
		if(!this.state.live){

			klass = 'inactive'
			console.log(klass)
		}
		var list = ['dry','wet','DSA']
		
		return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveMView ref='lv'>

					<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>
				</LiveMView>
			</div>

		)
	}
})

var MultiScanUnit = React.createClass({
	getInitialState: function () {
		// body...
		var mobMqs = [
			window.matchMedia('(min-width:321px)'),
			window.matchMedia('(min-width:376px)'),
			window.matchMedia('(min-width:426px)')
		]
		for(var i = 0; i<3;i++){
			mobMqs[i].addListener(this.listenToMq)
		}
		var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		return ({font:font,mq:mobMqs,phasemode:0,live:false, fault:false, pn:'', sens:0,peak:0,rejs:0,phase:0,pled:0,dled:0,rpcResp:false})
	},
	onClick: function () {
		// body...
		console.log('cliecked')
		if(this.state.live){
			this.props.onSelect(this.props.unit)
	
		}
	},
	listenToMq: function () {
		// body...
		var mobMqs = this.state.mq
			var font;
		if(mobMqs[2].matches){
			font = 3
		}else if(mobMqs[1].matches){
			font = 2
		}else if(mobMqs[0].matches){
			font = 1
		}else{
			font = 0
		} 
		this.setState({font:font})
	},
	updateMeter: function (dat) {
		// body...
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(dat)
	},
	checkLive: function (argument) {
		// body...
		//need to check if live

	},
	onMsg: function (e) {
		// body...
	},
	onRMsg: function (e,d) {
		// body...
		console.log([e,d])
		this.setState({rpcResp:true})
	},
	onFault: function () {
		// body...
		console.log('on fault')
		this.setState({fault:!this.state.fault})

	},
	componentDidMount: function () {
		// body...
		var self = this;
		this._isMounted = true;
		myTimers[this.props.unit.ip] = setInterval(function(){
			
			if((Date.now() - liveTimer[self.props.unit.ip]) > 1000){
				//wSockets[self.props.unit.ip].close();
				//if(self.)
				self.setState({live:false})
			}
			if(!self.state.rpcResp){
				var packet = dsp_rpc_paylod_for(19,[556,0,0])
				var buf =  new Uint8Array(packet)
				socket.emit('rpc',{ip:self.props.unit.ip, data:buf.buffer})
			}
			
		}, 1000)
	},
	componentWillUnmount: function () {
		// body...

		//this._isMounted = false
		clearInterval(myTimers[this.props.unit.ip]);
	},
	setPnSens: function (pn,sens) {
		if((this.state.pn != pn) || (this.state.sens != sens)){
			this.setState({pn:pn, sens:sens})
		}
		// body...
	},
	setLEDS:function(det,prod,prodhi){
		var pled = 0
		if(prodhi == 1){
			pled = 2
		}else if(prod == 1){
			pled = 1
		}
		this.refs.lv.setLEDs(pled,det)
	},
	setPeakRejs: function (p,r) {
		if((this.state.peak != p) || (this.state.rejs != r)){
			console.log(r)	
			this.setState({peak:p, rejs:r})
		}
		// body...
	},
	setPhase: function (phase) {
		// body...
		if(phase != this.state.phase){
			console.log(phase)
			this.setState({phase:phase})
		}
	},
	setPhaseMode:function (mode) {
		if(mode != this.state.phasemode){
			this.setState({phasemode:mode})
		}
		// body...
	},
	setFaults: function (faultArray) {
		// body...
		var faults = (faultArray.length != 0);
		if (faults != this.state.fault){
			this.setState({fault:faults})
		}
	},
	render: function () {
		// body...
		var classname = 'multiScanUnit'
		if(!this.state.live){
			classname = 'multiScanUnit inactive'
		}else if(this.state.fault){
			classname = 'multiScanUnit faultactive'
		}
		var st= {fontSize:20};
		if(this.state.font == 2){
			st = {fontSize:20, height:160}
		}else if(this.state.font == 1){
			st = {fontSize:18, height:145}
		}else if(this.state.font == 0){
			st = {fontSize:16, height:145}
		}
		console.log(classname)
		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveView st={st} ref='lv'>
			<div  onClick={this.onClick}>
				<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label  >Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>
				</div>
			</LiveView>
		</div>)
	}
})

var LandingPage = React.createClass({
	getInitialState: function () {
		var minMq = window.matchMedia("(min-width: 400px)");
		var mq = window.matchMedia("(min-width: 850px)");
		mq.addListener(this.listenToMq)
		minMq.addListener(this.listenToMq)
		var mqls = [
			window.matchMedia("(min-width: 321px)"),
			window.matchMedia("(min-width: 376px)"),
			window.matchMedia("(min-width: 426px)")
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		console.log(mq.matches)
		// body...
		return ({currentPage:'landing', curIndex:0, minMq:minMq, minW:minMq.matches, mq:mq, brPoint:mq.matches, 
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], 
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]},tmpS:{name:'NEW', type:'single', banks:[]}})
	},
	listenToMq: function (argument) {
		// body...
		if(this.refs.dv){
			this.refs.dv.setState({br:this.state.mq.matches})//, br3:this.state.mqls[0].matches, br4:this.state.mqls[1].matches, br6:this.state.mqls[2].matches})
		}
		this.setState({brPoint:this.state.mq.matches})
	},
	locateUnits: function (callback) {
		this.state.detectors.forEach(function(d){
			if(wSockets[d.ip]){
				wSockets[d.ip].close()
			}
			if(wParamSockets[d.ip]){
				wParamSockets[d.ip].close()
			}
			if(wRSockets[d.ip]){
				wRSockets[d.ip].close()
			}
		})
		located = false;
		// body...
		socket.emit('hello','landing')
		//socket.emit('locateReq', 'mb')
		
		this.refs.findDetModal.toggle();
	},
	locateB: function(){
		socket.emit('locateReq', 'b')
	},
	onError: function (t,e, d) {
		var self = this;
		// body...
		console.log('socket error')
		if(t == 1){
			if(wParamSockets[d.ip].readyState == 1 ){
				wParamSockets[d.ip].onclose = function (e) {
					// body...
					setTimeout(reconSocket(1,d.ip,self.onParamMsg,self.onError,self.onClose,d ),100)
				}
				wParamSockets[d.ip].close();
			}
			else{
					//wParamSockets[d.ip] = null;
					setTimeout(reconSocket(1,d.ip,self.onParamMsg,self.onError,self.onClose,d ),100)
			}
		}else if(t ==2 ){
			if(wRSockets[d.ip].readyState == 1){
				wRSockets[d.ip].onclose = function (e) {
					// body...
					setTimeout(reconSocket(2,d.ip,self.onRMsg,self.onError,self.onClose,d ),100)
				}
				wRSockets[d.ip].close();
			}
			else{
					//wRSockets[d.ip] = null;
					setTimeout(reconSocket(2,d.ip,self.onRMsg,self.onError,self.onClose,d ),100)
			}
		}
		console.log([e,d])
	},
	componentDidMount: function () {
		// body...
		var self = this;
		this.loadPrefs();
		socket.on('resetConfirm', function (r) {
			// body...
			socket.emit('locateReq');
		})
		socket.on('prefs', function(f) {
			console.log(f)
			var detL = self.state.detL
			f.forEach(function (u) {
				u.banks.forEach(function(b){
					detL[b.mac] = null
				})
				// body...
			})
			self.setState({mbunits:f, detL:detL})
			// body...
		})
		socket.on('locatedResp', function (e) {
			console.log(e)
			var dets = self.state.detL;
			//var macs = []
			var macs = self.state.macList.slice(0);
			e.forEach(function(d){
				macs.push(d.mac)
				dets[d.mac] = d;
				if(macs.indexOf(d.mac) == -1){
					macs.push(d.mac)
					dets[d.mac] = d

				}

				console.log(d)

		/*	 var vdef_script_tag = document.createElement('script');
        	vdef_script_tag.src = "http://"+d.ip+"/vdef"; // can change the ip here
        	vdef_script_tag.type = "application/javascript";
        	document.body.appendChild(vdef_script_tag); 
        	console.log(vdef_script_tag)*/
			
			})
			console.log(dets)
			self.state.mbunits.forEach(function(u){
				u.banks.forEach(function(b) {
					// body...
					dets[b.mac] = null;
				})
			})
			self.setState({dets:e, detL:dets, macList:macs})
			// body...
		});
		
		socket.on('paramMsg', function(data) {
		//	console.log(data.det.ip)
			self.onParamMsg(data.data,data.det) 

			// body...
		})
		socket.on('rpcMsg', function (data) {
			// body...
			self.onRMsg(data.data, data.det)
		})
	},
	onRMsg: function (e,d) {
		console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);
		if(data[1] == 18){
		//console.log(data)
		var prodbits = data.slice(3)
		var dat = []
		for(var i = 0; i < 99; i++){
			if(prodbits[i] ==2){
				dat.push(i+1)
			}
		}

		console.log(dat)
		}
		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.ip]){
			this.refs[d.ip].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				//	m.banks.for
  				//	}
  					m.banks.forEach(function (b) {
  						// body...
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						console.log('mbu' + ind)
  						this.refs['mbu'+ind].onRMsg(e,d)
  						}
  					}
		}

		
	},
	onParamMsg: function (e,d) {

		var self = this;
   				var msg = e.data;
   	var data = new Uint8Array(msg);
    
   	var dv = new DataView(msg);
	var lcd_type = dv.getUint8(0);
  	      var n = data.length;
		var prodArray = [];
		for(var i = 0; i<((n-1)/2); i++){
			prodArray[i] = dv.getUint16(i*2 + 1);	
		}
		if(isVdefSet){
			//console.log(lcd_type)
    		if(lcd_type == 1)
			{
				if(this.refs[d.ip]){
					this.refs[d.ip].setPnSens(this.getVal(prodArray, 1, 'ProdName'),this.getVal(prodArray, 1, 'Sens'))
					this.refs[d.ip].setPhaseMode(this.getVal(prodArray,1,'PhaseMode'))
				}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  				//	m.banks.for
  				//	}
  					m.banks.forEach(function (b) {
  						// body...
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].setPnSens(this.getVal(prodArray, 1, 'ProdName'),this.getVal(prodArray, 1, 'Sens'),d)
  	
  						}
  					}
  				}
  			}else if(lcd_type == 2){
			//	console.log(this.getVal(prodArray,2,'Peak'))
				var signal =	uintToInt(this.getVal(prodArray,2,'DetectSignal'),16);
				var faultArray = [];
				pVdef[6].forEach(function(f){
					if(self.getVal(prodArray,2,f) != 0){
						faultArray.push(f)
					}
				});
				if(faultArray.length != 0){
					//console.log(faultArray)
					
				}

				if(this.refs[d.ip]){
					this.refs[d.ip].setPhase(uintToInt( this.getVal(prodArray,2,'PhaseAngleAuto'),16))
					this.refs[d.ip].setLEDS(this.getVal(prodArray,2,'Reject_LED'),this.getVal(prodArray,2,'Prod_LED'),this.getVal(prodArray,2,'Prod_HI_LED'))
					this.refs[d.ip].setPeakRejs(this.getVal(prodArray, 2, 'Peak'), this.getVal(prodArray,2, 'RejCount'))
					this.refs[d.ip].updateMeter(signal)
					this.refs[d.ip].setFaults(faultArray)
				}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  				//	m.banks.for
  				//	}
  					m.banks.forEach(function (b) {
  						// body...
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].setPeakRejs(this.getVal(prodArray, 2, 'Peak'),this.getVal(prodArray,2, 'RejCount'),d)
  						this.refs['mbu'+ind].updateMeter(signal,d)	
  						this.refs['mbu'+ind].setFaults(faultArray,d)
  						this.refs['mbu'+ind].setLEDs(this.getVal(prodArray,2,'Reject_LED'),this.getVal(prodArray,2,'Prod_LED'),this.getVal(prodArray,2,'Prod_HI_LED'),d)
  						}
  					}
			}
    	}
		
		if(this.refs.dv){
			this.refs.dv.onParamMsg(e,d)
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
	ipChanged: function (e) {
		e.preventDefault();
		// body...
		this.setState({ipToAdd:e.target.value})
	},
	renderDetectors: function () {

		// body...
		var self = this;
		var units = this.state.detectors.map(function (u) {
			// body...
			return <MultiScanUnit ref={u.ip} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
	},
	setPrefs: function () {
		// body...
		this.refs.prefModal.toggle()
	},
	showFinder: function () {
		this.refs.findDetModal.toggle();
		this.locateB()
		// body...
	},
	logoClick: function () {
		// body...
		this.setState({currentPage:'landing'})
	},
	onClose: function (argument) {
		// body...
		console.log(argument)
	},
	switchUnit: function (u) {
		// body...
		console.log(u)
		this.setState({curDet:u, currentPage:'detector'})
	},
	addNewMBUnit:function () {
		// body...
		this.setState({curModal:'newMB'})
		//this.addMBUnit({name:"new", type:"mb", banks:[]})
	}, 
	addNewSingleUnit: function () {
		// body...
		this.setState({curModal:'newSingle'})
		//this.addMBUnit({name:"new",type:"single", banks:[]})
	},
	addMBUnit: function (mb) {
		// body...
		var mbunits = this.state.mbunits
		mbunits.push(mb)
		this.setState({mbunits:mbunits})
	},
	editMb:function (i) {
		// body...
		console.log(i)
		//this.refs.findDetModal.toggle()
		var mbunits = this.state.mbunits;

		var mbunit ={}
		mbunit.type = mbunits[i].type;
		mbunit.name = mbunits[i].name;
		mbunit.banks = mbunits[i].banks;
		if(mbunit.type == 'single'){
			this.setState({curIndex:i, curModal:'edit', tmpS:mbunit})	
		}else{
			this.setState({curIndex:i, curModal:'edit', tmpMB:mbunit})
		}
		
	},
	callFromMB: function(f,d){

	},
	dragStart: function (e) {
		// body...
			// body...
		console.log('dragstart')
		this.dragged = e.currentTarget;
		console.log(e.currentTarget)
		e.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    e.dataTransfer.setData("text", e.currentTarget.id);

	},
	addToGroup: function (e) {
		// body...
		console.log(e)
		var cont = this.state.mbunits[this.state.curIndex].banks;
		var dsps = this.state.dets;
		
			console.log(dsps[e])
			cont.push(dsps[e])
			
			dsps.splice(e,1)
		var mbUnits = this.state.mbunits;
		mbUnits[this.state.curIndex].banks = cont;
		console.log(dsps)
		console.log(mbUnits)
		this.setState({mbunits:mbUnits, dets:dsps})
		
		
	},
	addToTmpGroup: function (e) {
		// body...
		console.log(e)
		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		
			console.log(dsps[e])
			cont.push(dsps[e])
			
			//dsps.splice(e,1)
			detL[dsps[e].mac] = null;
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		console.log(dsps)
		console.log(mbUnits)
		this.setState({tmpMB:mbUnits, detL:detL})
		
		
	},
	addToTmpSingle: function (e) {
		// body...
		console.log(e)
		var cont = this.state.tmpS.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		if(cont.length != 0){
			return;
		}
			console.log(dsps[e])
			cont.push(dsps[e])
			detL[dsps[e].mac] = null;
		var mbUnits = this.state.tmpS;
		mbUnits.banks = cont;
		mbUnits.name = dsps[e].name
		console.log(dsps)
		console.log(mbUnits)
		this.setState({tmps:mbUnits, detL:detL})
		
		
	},
	removeFromGroup: function (e) {
		// body...

		var cont = this.state.mbunits[this.state.curIndex].banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		console.log(cont[e])
		detL[cont[e].mac] = cont[e];
		cont.splice(e,1)
		
		var mbUnits = this.state.mbunits;
		mbUnits[this.state.curIndex].banks = cont;
		this.setState({mbunits:mbUnits, detL:detL})
	},
	removeFromTmpGroup: function (e) {
		// body...

		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		console.log(cont[e])
		detL[cont[e].mac] = cont[e]
		
		cont.splice(e,1)
		
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
	},
	removeFromTmpSingle: function (e) {
		// body...

		var cont = this.state.tmpS.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		
		detL[cont[e].mac] = cont[e]
		
		
		cont.splice(e,1)
		
		var mbUnits = this.state.tmpS;
		mbUnits.banks = cont;
		this.setState({tmpS:mbUnits, detL:detL})
	},
	cancel: function () {
		var detL = this.state.detL;
		this.state.tmpS.banks.forEach(function (b) {
			// body...
			detL[b.mac] = b
		})
		this.state.tmpMB.banks.forEach(function (b) {
			// body...
			detL[b.mac]= b
		})
		this.setState({curModal:'add',detL:detL, tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
		// body...
	},
	submitMB: function(){
		var mbunits = this.state.mbunits;
		mbunits.push(this.state.tmpMB)
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
		
	
	},

	submitS: function(){
		var mbunits = this.state.mbunits;
		mbunits.push(this.state.tmpS)
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
		
	},
		submitMBe: function(){
		var mbunits = this.state.mbunits;
		mbunits[this.state.curIndex]= this.state.tmpMB 
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
		
	
	},

	submitSe: function(){
		var mbunits = this.state.mbunits;
		mbunits[this.state.curIndex]= this.state.tmpS
		this.saveSend(mbunits);
		this.setState({curModal:'add', tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
		
	},
	changeModalMode: function () {
		// body...
		this.setState({curModal:'add'})
	},
	move: function (i,d) {
		var mbunits = this.state.mbunits
		if(d == 'up'){
			if(i != 0){
				var punit = mbunits[i-1];
				var unit = mbunits[i];
				mbunits[i] = punit;
				mbunits[i-1] = unit;
			}
		}else{
			if(i != (mbunits.length - 1)){
				var nunit = mbunits[i+1];
				var unit = mbunits[i];
				mbunits[i+1] = unit;
				mbunits[i] = nunit;
			}
		}
		this.setState({mbunits:mbunits});
		// body...
	},
	saveSend: function (mbunits) {
		// body...
		socket.emit('savePrefs', mbunits)
	},
	save: function () {
		// body...
		socket.emit('savePrefs', this.state.mbunits)
	},
	loadPrefs: function () {
		socket.emit('locateReq');
		socket.emit('getPrefs');
		// body...
	},
	removeMb: function (i) {
		// body...

		var mbunits = this.state.mbunits;
		var detL = this.state.detL
		mbunits[i].banks.forEach(function(b){
			detL[b.mac] = b
		})
		mbunits.splice(i,1);
		this.saveSend(mbunits)
		this.setState({mbunits:mbunits, detL:detL})
	},
	reset: function () {
		// body...
		socket.emit('reset', 'reset requested')
	},
	renderModal: function () {
		// body...
		var self = this;
		var mbSetup = this.state.mbunits.map(function(mb,ind) {
			console.log(ind)
			return <MbSetup remove={self.removeMb} move={self.move} mb={mb} edit={self.editMb} index={ind} singleUnits={self.state.single}/>	// body...
		})
		var detList = this.state.dets.map(function(d){
			return d.name
		})
		
		if(this.state.curModal == 'edit'){
			var MB = this.renderMBGroup(0)// <MBGroupView unit={this.state.mbunits[this.state.curIndex]} index={this.state.curIndex} call={this.callFromMB} singleUnits={this.state.dets}/>
		
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newMB'){
			var MB = this.renderMBGroup(1)
			return (<div>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newSingle'){
			var MB = this.renderMBGroup(2)
			return (<div>
				{MB}
			</div>)
		}else{
			return (<div>
						<div className='prefInterface'>
								<button onClick={this.addNewMBUnit}>Add new MultiBankUnit</button>
								<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
								<button onClick={this.save}>Save Settings</button>
								<button onClick={this.loadPrefs}>Load Saved Settings </button>
								<button onClick={this.reset}>Reset Connections</button>
								<div className='mbManager'>
								{mbSetup}
						</div>
						</div>
						</div>)
		}
		/*	{console.log('what happened here')}*/
	},
	changeMBName: function (e) {
		e.preventDefault();
		var mbs = this.state.mbunits;
		var MB = this.state.mbunits[this.state.curIndex]
		MB.name = e.target.value;
		mbs[this.state.curIndex] = MB;
		this.setState({mbunits:mbs})		// body...
	},
	changetMBName: function (e) {
		e.preventDefault();
		var mbs = this.state.mbunits;
		var MB = this.state.tmpMB//this.state.mbunits[this.state.curIndex]
		MB.name = e.target.value;
		//mbs[this.state.curIndex] = MB;
		this.setState({tmpMB:MB})		// body...
	},
	changetSName: function (e) {
		e.preventDefault();
		var mbs = this.state.mbunits;
		var MB = this.state.tmpS//mbunits[this.state.curIndex]
		MB.name = e.target.value;
		//mbs[this.state.curIndex] = MB;
		this.setState({tmps:MB})		// body...
	},
	submitChange: function (e) {
		// body...
	},
	renderMBGroup: function (mode) {
		// body...
		var self = this;
		if(mode == 0){
	var detectors = this.state.dets.map(function(det, i){
		//console.log(det)
		if(self.state.detL[det.mac]){
		if(type=='single'){

			return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpSingle}>
					</DetItemView>)
		}else{
			return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}/>)
		}
	}
		})

		var MB; 
		var type;
		console.log('what')
		if(this.state.mbunits[this.state.curIndex].type == 'single'){
			MB = this.state.tmpS;
			type = 'single'
		}else{
			MB = this.state.tmpMB
			type = 'MB'
		}
		var banks = MB.banks.map(function (b,i) {
			// body...
			if(type == 'single'){
				return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpSingle}/>)
			}else{
				return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpGroup}/>)	
			}
			
		})
		var nameEdit;
		var submit;
		if(type == 'single'){
			nameEdit = (<input onChange={this.changetSName} type='text' value={MB.name}/>)
			submit = (<button onClick={this.submitSe}>Submit</button>)
		}else{
			nameEdit = (<input onChange={this.changetMBName} type='text' value={MB.name}/>)
			submit = (<button onClick={this.submitMBe}>Submit</button>)
		}
		return (<div>

				<label>Name:</label>{nameEdit}
		
			<table ><tbody><tr>
			<th>Available Detectors</th><th>Banks</th>
			</tr><tr>
			<td style={{width:300, border:'1px solid black', minHeight:50}}>
				{detectors}
			</td><td style={{width:300,  border:'1px solid black', minHeight:50}}>
				{banks}
			</td><td><div style={{height:30}}/></td></tr></tbody></table>
			{submit}<button onClick={this.cancel}>Cancel</button>
		</div>)
		}else if(mode == 1){

				var detectors = this.state.dets.map(function(det, i){
						if(self.state.detL[det.mac]){
	
			return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}>
					</DetItemView>)
		}
		})
			var MB = this.state.tmpMB;
			var banks = MB.banks.map(function (b,i) {
			// body...
			return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpGroup}/>)
			})
			return (<div>
				<label>Name:</label><input onChange={this.changetMBName} type='text' value={MB.name}/>
		
			<table ><tbody><tr>
			<th>Available Detectors</th><th>Banks</th>
			</tr><tr>
			<td style={{width:300, border:'1px solid black', minHeight:50}}>
				{detectors}
			</td><td style={{width:300,  border:'1px solid black', minHeight:50}}>
				{banks}
			</td><td><div style={{height:30}}/></td></tr></tbody></table>
			<button onClick={this.submitMB}>Submit</button><button onClick={this.cancel}>Cancel</button>
		</div>)
		}else{
				var detectors = this.state.dets.map(function(det, i){
						if(self.state.detL[det.mac]){
	
			return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpSingle}>
					</DetItemView>)
		}
		})
			var MB = this.state.tmpS;//{name:"new", type:"single", banks:[]}
			var banks = MB.banks.map(function (b,i) {
			// body...
			return(<DetItemView det={b} i={i} type={1} addClick={self.removeFromTmpSingle}/>)
			})
			return (<div>
				<label>Name:</label><input onChange={this.changetSName} type='text' value={MB.name}/>
		
			<table ><tbody><tr>
			<th>Available Detectors</th><th>Banks</th>
			</tr><tr>
			<td style={{width:300, border:'1px solid black', minHeight:50}}>
				{detectors}
			</td><td style={{width:300,  border:'1px solid black', minHeight:50}}>
				{banks}
			</td><td><div style={{height:30}}/></td></tr></tbody></table>
			<button onClick={this.submitS}>Submit</button><button onClick={this.cancel}>Cancel</button>
		</div>)
		}
	},
	renderPModal: function () {
		// body...
		var self = this;
		var mbSetup = this.state.mbunits.map(function(mb,ind) {
			return <MbSetup remove={self.removeMb} move={self.move} mb={mb} edit={self.editMb} index={ind} singleUnits={self.state.single}/>	// body...
		})
		var detList = this.state.dets.map(function(d){
			return d.name
		})
	if(this.state.curModal == 'edit'){
			var MB = this.renderMBGroup(0)// <MBGroupView unit={this.state.mbunits[this.state.curIndex]} index={this.state.curIndex} call={this.callFromMB} singleUnits={this.state.dets}/>
		
			return (<div>
				<button onClick={this.changeModalMode}>back</button>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newMB'){
			var MB = this.renderMBGroup(1)
			return (<div>
				<button onClick={this.changeModalMode}>back</button>
				{MB}
			</div>)
		}else if(this.state.curModal == 'newSingle'){
			var MB = this.renderMBGroup(2)
			return (<div>
				<button onClick={this.changeModalMode}>back</button>
				{MB}
			</div>)
		}
		return (<div>
						<div className='prefInterface'>
								<button onClick={this.locateUnits}>Automatically Locate Units</button>
								<button onClick={this.addNewMBUnit}>Add new MultiBankUnit</button>
								<button onClick={this.addNewSingleUnit}>Add new Single Unit</button>
								<button onClick={this.save}>Save Settings</button>
								<button onClick={this.loadPrefs}>Load Saved Settings </button>
							
								<List data={detList}/>
						</div>
						<div className='mbManager'>
								{mbSetup}
						</div></div>)
	},
	renderLanding: function () {
		var self = this;
		var detectors = this.renderDetectors()
		console.log('detectors rendered')
		var config = 'config'
		var find = 'find'
		// body...
		var lstyle = {height: 72,marginRight: 20}
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var mbunits = this.state.mbunits.map(function(mb,i){
			if(mb.type == 'mb'){
				return <MultiBankUnit onSelect={self.switchUnit} ref={'mbu' + i} name={mb.name} data={mb.banks}/>	
			}else{
				if(mb.banks[0]){
					return <MultiScanUnit ref={mb.banks[0].ip} onSelect={self.switchUnit} unit={mb.banks[0]}/>	
				}						
			}
			
		})
		
		var modalContent = this.renderModal();
		return (<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell" hidden><button onClick={this.setPrefs} className={config}/></td>
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal'>
						{modalContent}
						
					
					</Modal>

				
					<Modal ref='prefModal'>
						{this.renderPModal()}
					</Modal>
				 	{detectors}
				 	{mbunits}
			</div>)	
	},
	renderMB: function () {
		var MB = <MBGroupView unit={this.state.mbunits[this.state.curIndex]} index={this.state.curIndex} call={this.callFromMB} singleUnits={this.state.dets}/>
		// body...
		var lstyle = {height: 72,marginRight: 20}
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var config = 'config'
		var find = 'find'
		return(<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell"><button onClick={this.setPrefs} className={config}/></td>
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
							</tr>
						</tbody>
					</table>
					{MB}
		</div>

		)
	},
	renderDetector: function () {
		// body...
		//socket.emit()
		return (<DetectorView br={this.state.brPoint} ref='dv' logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip}/>)
	},
	render: function () {
		var cont;
		if(this.state.currentPage == 'landing'){
			console.log('here')
			cont = this.renderLanding();
		}else if(this.state.currentPage == 'detector'){
			//alert('render Detector')
			cont = this.renderDetector();
		}else if(this.state.currentPage == 'multibank'){
			cont = this.renderMB();
		}
		return (<div>
			{cont}
		</div>)
		// body...
	}
})
var DetItemView = React.createClass({
	addClick: function () {
		// body...
		this.props.addClick(this.props.i)
	},
	render: function () {
		console.log(this.props)
		// body...
		var addText = 'Add'
		if(this.props.type == 1){
			addText = 'Remove'
		}
		return (<div>
				<label onClick={this.addClick}>{this.props.det.name}</label>
			</div>)
	}
})
var MBGroupView = React.createClass({
	getInitialState: function () {
		// body...
		return ({font:2})
	},

	render: function() {
		var banks = this.props.unit.banks;
		var lab = "Config Multibank Unit"
	    var titlediv = (<span  ><h2 style={{textAlign:'center'}} ><div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>
)
	    if (this.state.font == 1){
	    	titlediv = (<span  ><h2 style={{textAlign:'center', fontSize:30}} ><div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span  ><h2 style={{textAlign:'center', fontSize:24}} ><div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
	    }

		// body...
		return(<div className='settingsDiv'>
				<div className='menuCategory'>
				{titlediv}
				<TreeNode nodeName="Config banks">
					{this.props.unit.name}
				</TreeNode>
			</div>
		</div>)
	}
})
var MbSetup = React.createClass({
		getInitialState: function () {
			return({mode:false})
			// body...
		},
		editMb:function () {
			// body...
			console.log(this.props.index)
			this.props.edit(this.props.index)
		},
		remove:function () {
			this.props.remove(this.props.index)
			// body...
		},
		moveUp: function () {
			// body...
			this.props.move(this.props.index,'up')
		},
		moveDown: function (){
			this.props.move(this.props.index,'down')
		},
		toggleOptions: function () {
			// body...
			this.setState({mode:!this.state.mode})
		},
		render:function () {
			var editRow;
			if(this.state.mode){
				editRow = (<div>
					<button onClick={this.editMb}>Edit</button>
					<button onClick={this.remove}>Remove</button>
					<button onClick={this.moveUp}>move up</button>
					<button onClick={this.moveDown}>move down</button>
					</div>)
			}
			// body...
			return (<div className="sItem" onClick={this.toggleOptions}>
						<label >Name:{this.props.mb.name}</label>
						{editRow}
					</div>)	
		}
	})

var DetectorView = React.createClass({
	getInitialState: function () {
		// body...
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 467px)'),
			window.matchMedia('(min-width: 600px)')
		]
		var minMq = window.matchMedia("(min-width: 400px)");
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		minMq.addListener(this.listenToMq);
		return {faultArray:[],currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, 
		minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, peak:0, rej:0, phase:0}
	},
	componentDidMount: function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})
	},
	componentWillReceiveProps: function (newProps) {
		// body...
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})

	},
	toggleAttention: function () {
		// body...
		this.refs.fModal.toggle();

	},
	onRMsg:function (e,d) {
		// body...
		console.log([e,d])
		if(this.props.det.ip != d.ip){
			return;
		}
		var msg = e.data
		var data = new Uint8Array(msg);
		if(data[1] == 18){
			//prodList
			console.log('prodList')
			var prodbits = data.slice(3)
			var dat = []
			for(var i = 0; i < 99; i++){
			if(prodbits[i] ==2){
					dat.push(i+1)
				}
			}
			if(this.refs.dm){
				console.log(dat)
				this.refs.dm.setState({prodList:dat})
			}

		}else if(data[1] == 24){
			console.log(data)
		}
	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[2].matches){
			console.log(1)
		}else if(this.state.mqls[1].matches){
			console.log(2)
		}else if(this.state.mqls[0].matches){
			console.log(3)
		}else{
			console.log(4)
		}
		
		this.setState({minW:this.state.minMq.matches})
		
	},
	onParamMsg: function (e,d) {
		// body...
		
		if(this.props.det.ip != d.ip){
		//	console.log('wrong')
			return;
		}
		var self = this;
   	
   			var msg = e.data;
   	var data = new Uint8Array(msg);
    
   	var dv = new DataView(msg);
	var lcd_type = dv.getUint8(0);
  	      var n = data.length;
 if(cnt < 2){
   		console.log(Vdef)
		console.log(isVdefSet)
		cnt++;
   	}

   	 	if(lcd_type== 0){
				//system
				console.log('sysrec sent')
				if(isVdefSet){
				var sysArray = [];
					for(var i = 0; i<((n-1)/2); i++){
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
    						var setting = self.getVal(sysArray,4, p)
    						sysRec[p] = setting;
    					}
    				}
    				sysSettings = sysRec;
    				if(this.state.currentView == "SettingsDisplay"){
						if(this.refs.sd){
							this.refs.sd.parseInfo(sysSettings, prodSettings)	
						}
					}
    
    			}
			}else if(lcd_type == 1){
				console.log('prodrec sent')
				if(isVdefSet ){
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
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
    						var setting = self.getVal(prodArray,4, p)
    						prodRec[p] = setting;
    					}
    				}
					prodSettings = prodRec;
					var prodName = prodSettings['ProdName']
					var prodNo =  sysSettings['ProdNo']		
					var sens = prodSettings['Sens']
					var phaseMode = prodSettings['PhaseMode']
					var phaseSpeed = Vdef['@labels']['PhaseSpeed']['english'][prodSettings['PhaseSpeed']]
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
					if(this.state.currentView == "SettingsDisplay"){
						if(this.refs.sd){
							this.refs.sd.parseInfo(sysSettings, prodSettings)	
						}
					}
						
						if(this.refs.dm){
							if((this.refs.dm.state.pn != prodName)||(this.refs.dm.state.sens != sens)||(this.refs.dm.state.prodNo != prodNo)||(this.refs.dm.state.phaseMode != phaseMode)||(this.refs.dm.state.phaseSpeed != phaseSpeed)){
								console.log(prodNo)
								this.refs.dm.setState({pn:prodName, sens:sens, prodNo:prodNo, phaseMode:phaseMode, phaseSpeed:phaseSpeed})
							}
						}
							
					
					
				}
			}else if(lcd_type==2){
			//	console.log('on param msg dyn')
				if(isVdefSet ){
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 2){
    						var setting = self.getVal(prodArray, 2,p["@name"])
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 2){
    						var setting = self.getVal(prodArray,4, p)
    						prodRec[p] = setting;
    					}
    				}
					//prodSettings = prodRec;

					
					var peak = prodRec['Peak']
					var rej = prodRec['RejCount']
					var sig = uintToInt(prodRec['DetectSignal'],16)
					var phase = (uintToInt(prodRec['PhaseAngleAuto'],16)/100).toFixed(2)
					//console.log(phase)
					var phaseSpeed = prodRec['PhaseFastBit'];
					var rpeak = prodRec['ProdPeakR']
					var xpeak = prodRec['ProdPeakX']
					var faultArray = [];
					pVdef[6].forEach(function(f){
					if(self.getVal(prodArray,2,f) != 0){
						faultArray.push(f)
						}
					});
				//	console.log(this.refs)
					if(this.state.currentView == 'MainDisplay'){
						if((this.refs.dm.state.peak !=peak)||(this.refs.dm.state.rpeak != rpeak)||(this.refs.dm.state.xpeak != xpeak)||(this.refs.dm.state.rej != rej)||(this.refs.dm.state.phase != phase)){
						
							this.refs.dm.setState({peak:peak, rej:rej, phase:phase, phaseFast:phaseSpeed, rpeak:rpeak, xpeak:xpeak})
						
						}
					}
					if(this.refs.lv){
						//console.log(sig)
  						this.refs.lv.update(sig)	
  					}
  					if(this.refs.dg){
  						this.refs.dg.stream({t:Date.now(),val:sig})
  					}
  					if(this.state.faultArray.length != faultArray.length){
  						this.setState({faultArray:faultArray})
  					}else{
  						var diff = false;
  						faultArray.forEach(function (f) {
  							if(self.state.faultArray.indexOf(f) == -1){
  								diff = true;
  							}
  							// body...
  						})
  						if(diff){
  							this.setState({faultArray:faultArray})
  						}
  					}				
			}

   		}else if(lcd_type == 3){
   			if(isVdefSet ){
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 3){
    						var setting = self.getVal(prodArray, 3,p["@name"])
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 3){
    						var setting = self.getVal(prodArray,4, p)
    						prodRec[p] = setting;
    					}
    				}
					prodSettings = prodRec;
				}
   		}
	},
	getVal: function(arr, rec, key){
		var param = pVdef[rec][key]
		if(typeof param == 'undefined'){
			console.log([rec,key])
		}
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

	showSettings: function () {
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
		// body...
		
	},
	showFinder: function () {
		// body...
	},
	logoClick: function () {
		// body...
		this.props.logoClick();
	},
	goBack: function () {
		// body...
		if(this.state.stack.length > 0){
			var stack = this.state.stack;
			var d = stack.pop();
			
				setTimeout(this.setState({currentView:d[0], data: d[1], stack: stack, setttings:(d[0] == 'SettingsDisplay') }),100);
			
		}
	},
	clearFaults: function () {
		// body...
		alert('todo')
	},
	maskFault:function (f) {
		// body...
		alert('set ' +f +'Mask to 1')
	},
	changeView: function (d) {
		// body...
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]); //immediate parent will be at top of stack
		console.log(d)
		console.log(st)
		this.setState({currentView:d[0], data:d[1]})
	},
	settingClick: function (s) {
		// body...
		var set = this.state.data.slice(0)
		set.push(s[0])
		this.changeView(['SettingsDisplay',set]);
	},
	clear: function (param) {
		// body...
		var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1]) 
		var buf = new Uint8Array(packet);
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
	},
	sendPacket: function (n,v) {
		// body...
		console.log([n,v])
		if(typeof n == 'string'){
			if(n == 'Sens'){
			console.log(this.props.ip)
			var packet = dsp_rpc_paylod_for(0x13,[0x16,parseInt(v)]);
			console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			//wRSockets[this.props.ip].send(buf.buffer)
		}else if(n == 'ProdNo'){
			var packet = dsp_rpc_paylod_for(0x13,[0x8, parseInt(v)]);
			console.log(packet)
			var buf = new Uint8Array(packet)
		socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
			}else if(n == 'ProdName'){
			console.log(v)
			var str = (v + "                    ").slice(0,20)
			console.log(str)
			var packet = dsp_rpc_paylod_for(0x13,[0x2a],str);
			console.log(packet)
			var buf = new Uint8Array(packet)
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		}else if(n == 'cal'){
			var packet = dsp_rpc_paylod_for(0x13, [0x1e,1])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		
		}else if(n == 'test'){
			console.log('test')
		}else if(n == 'getProdList'){
			var packet = dsp_rpc_paylod_for(0x13, [0x12])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n =='getProdName'){
			var packet = dsp_rpc_paylod_for(0x13, [24,parseInt(v)])
				var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}else if(n=='refresh'){
			var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.det.ip, data:buf.buffer})	
		}else if(n=='rpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[474,0,0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}else if(n=='xpeak'){
			console.log(n)
			var packet = dsp_rpc_paylod_for(19,[474,0,0])
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.det.ip, data:buf.buffer})
		}
		}else{
		if(n['@rpc']['toggle']){

			var arg1 = n['@rpc']['toggle'][0];
			var arg2 = [];
			for(var i = 0; i<n['@rpc']['toggle'][1].length;i++){
				if(!isNaN(n['@rpc']['toggle'][1][i])){
					arg2.push(n['@rpc']['toggle'][1][i])
				}else{
					arg2.push(parseInt(v))
				}
			}
			var packet = dsp_rpc_paylod_for(arg1, arg2);
			var buf = new Uint8Array(packet);
			socket.emit('rpc', {ip:this.props.ip, data:buf.buffer})
		}
		}
		/**/
	},
	render: function () {
		// body...
		var attention = 'attention'
		if(this.state.faultArray.length != 0){
			attention = 'attention_clear'
		}
		var config = 'config'
		if(this.state.settings){
			config = 'config_active'
		}
		var find = 'find'
		console.log('detview render')

		var SD ="";
		var MD ="";
	 	//console.log(this.state.currentView)	
	 	var lstyle = {height: 72,marginRight: 20}
	 	var np = (<NetPollView ref='np' eventCount={15}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		if(this.state.settings){
			console.log('yer')
				SD = (<SettingsDisplay 
					goBack={this.goBack} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip}/>)
	
		}else{
			MD = (<div style={{margin:5}}>
					<table className='mainContTable'><tbody><tr><td className='defCont'>
					<DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm'/></td><td style={{width:400}} className='defCont'>
					<DummyGraph ref='dg' canvasId={'dummyCanvas'}/>

					</td></tr></tbody></table>
					<div className='prefInterface'>{np}</div>
					
					</div>)
		}
		var finder =(<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>)
		var lmtable = (<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td onClick={this.logoClick}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className='mobCell'><MobLiveBar ref='lv'/></td>
								<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
								<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>
						</tr>
						</tbody>
					</table>)
		if(!this.state.br){
			lmtable = (<div><table className='landingMenuTable'>
						<tbody>
							<tr>
								<td onClick={this.logoClick}><img style={lstyle} src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								
								<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
								<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>
						</tr>
						</tbody>
					</table>
					<MobLiveBar ref='lv'/>
					
					
					</div>)
			if(!this.state.settings){
				MD = (<div><div className='prefInterface' ><DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm'/></div>
					<div className='prefInterface' ><DummyGraph ref='dg' canvasId={'dummyCanvas'}/> </div>
					<div className='prefInterface'>{np}</div>
					</div>)
			}
			
		}
	
		return(<div>
				{lmtable}
			
						{MD}
						{SD}
						<Modal ref='fModal'>
							<FaultDiv maskFault={this.maskFault} clearFaults={this.clearFaults} faults={this.state.faultArray}/>
						</Modal>
					
					</div>)
	}
})
var NetPollView = React.createClass({
	getInitialState: function () {
		// body...
		
		
		return({events:[{timeStamp:"Mon, 31 Oct 2016 21:47:49 GMT",event:'Reject'}, {timeStamp:"Mon, 31 Oct 2016 21:48:39 GMT",event:'Reference Fault'}]})
	},

	pushEvent: function (e) {
		// body...
		var events = this.state.events
		if(events.length == this.props.eventCount){
			events.splice(0,1);
		}
		events.push(e);
		this.setState({events:events})
	},
	dummyEvent: function () {
		// body...
		this.pushEvent({timeStamp:(new Date(Date.now())).toUTCString(), event:'Reject - dummy'})
	},
	render:function () {
		var events = this.state.events.map(function(e){
			return (<tr><td>{e.timeStamp}</td><td>{e.event}</td></tr>)
		})
		// body...
		return (<div>
			<label onClick={this.dummyEvent}>Events Log</label>
			<table className='npTable'><tbody>
			{events}
			</tbody></table>

		</div>)
	}
})
var DetMainInfo = React.createClass({
	getInitialState: function () {
		// body...
		return({pn:'',rpeak:0,xpeak:0, sens:0, peak:0,phase:0, rej:0,phaseMode:0, tmp:'', prodNo:1, prodList:[], phaseSpeed:'', phaseFast:0})
	},
	clearRej: function () {
		// body...
		var param = pVdef[2]['RejCount']
		//var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1]) 
		this.props.clear(param )

		//alert('reject cleared')
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
		var param = pVdef[2]['Peak']
		//var packet = dsp_rpc_paylod_for(param['@rpcs']['clear'][0],param['@rpcs']['clear'][1])
		this.props.clear(param) 
		//alert('Peak cleared')
	},
	calibrate: function () {
		// body...
		//this.props.sendPacket('cal',1)
		this.refs.calbModal.toggle()
	},
	showEditor: function () {
		// body...\
		this.props.sendPacket('getProdList')
		this.refs.pedit.toggle()
	},
	editSens: function () {
		// body...
		this.refs.sensEdit.toggle()
	},
	setTest: function () {
		// body...
		this.refs.testModal.toggle()
	},
	updateTmp:function (e) {
		// body...
		e.preventDefault();
		this.setState({tmp:e.target.value})
	},
	submitTmpSns:function () {
		// body...
		this.props.sendPacket('Sens',this.state.tmp)
		this.cancel()
		//this.setState({tmp:""})
	},
	refresh: function () {
		// body...
		this.props.sendPacket('refresh')
	},
	cancel:function () {
		// body...
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	},
	cal: function () {
		// body...
		this.props.sendPacket('cal')
	},
	render: function () {
		console.log('render here')
		var self = this;
		var info = (<div><div><span><label>Current Product: {this.state.pn}</label></span></div>
						<div><span><label>Sensitivity: {this.state.sens}</label></span></div>
						<div><span><label>Signal: {this.state.peak}</label></span></div>
						<div><span><label>Rejects: {this.state.rej}</label></span></div>

						</div>)
		var tdstyle = {paddingLeft:10}
		var list = ['dry', 'wet', 'DSA']
		var ps = this.state.phaseSpeed;
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
		var tab = (
		<table className='dtmiTab'>
			<tbody>
				<tr><td>Name</td><td style={tdstyle}>{this.props.det.name}</td></tr>
				<tr onClick={this.showEditor}><td>Product</td><td style={tdstyle}>{this.state.pn}</td></tr>
				<tr onClick={this.editSens}><td>Sensitivity</td><td style={tdstyle}>{this.state.sens}</td></tr>
				<tr><td>Signal</td><td style={tdstyle} onClick={this.clearPeak}>{this.state.peak}</td></tr>
				<tr><td>Rejects</td><td style={tdstyle} onClick={this.clearRej}>{this.state.rej}</td></tr>
				<tr><td>Phase</td><td style={tdstyle} onClick={this.calibrate}>{this.state.phase + ' ' + list[this.state.phaseMode]}</td></tr>
				<tr hidden><td>Test</td><td style={tdstyle}><input type='text'></input> <button onClick={this.setTest}>Test</button></td>
				</tr>		
			</tbody>
		</table>)
		// body...

		var prodList = this.state.prodList.map(function(p){
			var sel = false
			//console.log([p,self.state.prodNo])
			if(p==self.state.prodNo){
				sel = true;
			}

			return (<ProductItem selected={sel} p={p} switchProd={self.switchProd}/>)
		})
		return (<div className='detInfo'>
						{tab}
							<Modal ref='pedit'>
							{prodList}
						</Modal>
						<Modal ref='sensEdit'>
							<div>Sensitivity: <input type='text' onChange={this.updateTmp} value={this.state.tmp}></input><button onClick={this.submitTmpSns}>OK</button><button onClick={this.cancel}>Cancel</button></div>
						</Modal>
						<Modal ref='testModal'>
							<TestInterface/>
						</Modal>
						<Modal ref='calbModal'>
							<CalibInterface sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} phase={[this.state.phase, this.state.phaseMode, ps]} peaks={[this.state.rpeak,this.state.xpeak]}ref='ci'/>
						</Modal>
					</div>)
	}
})
var ProductItem = React.createClass({
	switchProd:function () {
		// body...
		this.props.switchProd(this.props.p)
	},
	render: function () {
		// body...
		var st = {color:'grey'}
		if(this.props.selected){
			st = {color:'green'}
		}
		return (<div onClick={this.switchProd}><label style={st}>{'Product '+this.props.p}</label></div>)
	}
})
var CalibInterface = React.createClass({
	getInitialState: function () {
		// body...
		return({phaseSpeed:0,phase:0,phaseMode:0, edit:false, tmpStr:''})
	},
	calibrate: function () {
		// body...
		this.props.calib()
	}, 
	editPhase: function () {
		// body...
		this.setState({edit:!this.state.edit})
	},
	refresh: function () {
		// body...
		this.props.refresh()
	},
	onChangePhase: function (e) {
		// body...
		e.preventDefault();
		this.setState({tmpStr:e.target.value})
	},
	clearR: function () {
		// body...
		this.props.sendPacket('rpeak','clear')
	},
	clearX: function(){
		this.props.sendPacket('xpeak','clear')
	},
	render: function () {
		// body...
		var list = ['dry', 'wet', 'DSA']
		var phase = (<div> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>)
		if(this.state.edit){
			phase = (<div><div> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>
					<div><input type='text' onChange={this.onChangePhase}>{this.state.tmpStr}</input></div>
				</div>)
		}
		return (<div className='calib'>
				<label>
					Calibration Menu
				</label>
				<table><tbody>
					<tr><td>Phase Speed:</td><td>{this.props.phase[2]}</td></tr>
					<tr><td onClick={this.editPhase}>Phase:</td><td >{phase}</td></tr>
					<tr><td>R Peak:</td><td onClick={this.clearR}>{this.props.peaks[0]}</td></tr>
					<tr><td>X Peak:</td><td onClick={this.clearX}>{this.props.peaks[1]}</td></tr>
				</tbody></table>
				<button onClick={this.calibrate}>Calibrate</button>
				<button onClick={this.refresh}>Refresh</button>
			</div>)
	}
})
var TestInterface = React.createClass({
	run: function () {
		// body...
	},
	render: function () {
		// body...
		return(<div className='testInt'>
			<label>Select Test</label>
			<select>
				<option value={1}>Test 1</option>
				<option value={2}>Test 2</option>
				<option value={3}>Test 3</option>
			</select>
					<table><tbody>
						<tr>
							<td>Test Mode</td><td><select><option>Manual</option><option>Halo</option><option>Halo2</option></select></td>
						</tr>
						<tr><td>FE</td><td><input type='text'/></td></tr><tr><td>NFE</td><td><input type='text'/></td></tr><tr><td>SS</td><td><input type='text'/></td></tr>
					</tbody></table>
					<button onClick={this.run}>Run Test</button>
			</div>)
	}
})
var DummyGraph = React.createClass({
	getInitialState: function () {
		// body...
		var mqls = [
			window.matchMedia('(min-width: 300px)'),
			window.matchMedia('(min-width: 444px)'),
			window.matchMedia('(min-width: 600px)'),
			window.matchMedia('(min-width: 850px)')
		]
		for (var i=0; i<mqls.length; i++){
			mqls[i].addListener(this.listenToMq)
		}
		return({width:400, height:200, mqls:mqls})
	},
	listenToMq: function () {
		// body...
		if(this.state.mqls[3].matches){
			this.setState({width:400})
		}else if(this.state.mqls[2].matches){
			this.setState({width:558})
		}else if(this.state.mqls[1].matches){
			this.setState({width:400})
		}else{
			this.setState({width:280})
		}
	},
	componentDidMount: function () {
		// body...
		this.listenToMq()
	},
	renderCanv: function () {
		// body...
		return(<CanvasElem canvasId={this.props.canvasId} ref='cv' w={this.state.width} h={this.state.height}/>)
	},
	stream:function (dat) {
		this.refs.cv.stream(dat)
		// body...
	},
	render: function () {
		var cv = this.renderCanv()
		return (<div className='detGraph'>
			{cv}
			</div>)
	/*return(	<div className='DummyGraph'>

			<img style={{width:400}}src='assets/dummygraph.png'/>
		</div>)*/
		// body...
	}

})

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
		// body...
		var l1 = new TimeSeries();
		return ({line:l1})
	},
	componentDidMount: function(){
		var smoothie = new SmoothieChart({millisPerPixel:25,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
		horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],labels:{fillStyle:'#000000'}, grid:{fillStyle:'#ffffff'}, yRangeFunction:yRangeFunc});
		smoothie.streamTo(document.getElementById(this.props.canvasId));
		//var line1 = new TimeSeries();
		
		smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'#000000'});
	},
	stream:function (dat) {
			this.state.line.append(dat.t, dat.val);
		// body...
	},
	render: function(){
		return(
			<div className="canvElem">
				<canvas id={this.props.canvasId} height={this.props.h} width={this.props.w}></canvas>
			</div>
		);
	}
});
ReactDOM.render(<Container/>,document.getElementById('content'))

