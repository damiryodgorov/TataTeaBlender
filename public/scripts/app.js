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
    return uint;
}
function getVal(arr, rec, key, pVdef){
		var param = pVdef[rec][key]
		if(!param){
			console.log([rec,key])
			console.log(pVdef)
		}
		if(param['@bit_len']>16){

			return wordValue(arr, param)
		}else{
			var val;
			if((param['@bit_pos'] + param['@bit_len']) > 16){
				var wd = (Params.swap16(arr[param['@i_var']+1])<<16) | Params.swap16((arr[param['@i_var']]))
				val = (wd >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
				
			}else{
				val = Params.swap16(arr[param["@i_var"]]);
				
				if(param['@name'] == 'DetectSignal_B'){
					//console.log([(val & 0xFF), (val >> 8) & 0xFF]);
				}
			}	
			if(param["@bit_len"] < 16){
				val = (val >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
			}
			return val;
		}
}
function wordValue(arr, p){

		var n = Math.floor(p["@bit_len"]/16);
		var sa = arr.slice(p["@i_var"], p["@i_var"]+n)
		//console.log(sa)
		if(p['@type']){
			if(p['@name'] == 'PW1'){
				console.log(sa)
			}
			return Params[p['@type']](sa)
		}else{
			var str = sa.map(function(e){
			return (String.fromCharCode((e>>8),(e%256)));
		}).join("");
		return str;	
		}
		
}
function isDiff(x, y){
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
        console.log(bytes.length)
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

var socket = io();

var sysSettings = {};
var prodSettings ={};
var framSettings ={};
var combinedSettings = [];
var liveTimer = {}
var myTimers = {}

var located = false;
var cnt = 0;

socket.on('vdef', function(vdf){

var json = vdf[0];
_Vdef = json
console.log(_Vdef)

  var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
   var nVdf = {};
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
     if(p["@rec"]!=2){


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
    res[4] = json["@deps"];
    res[5] = json["@labels"]
    res[6] = [];
   for(var par in res[2]){ 	
     	if(par.indexOf('Fault') != -1){
    		console.log("fault found")
    		res[6].push(par)
    	}
    }
    _pVdef = res;
    vdefList[json['@version']] = [json, res, nVdf]
    vdefByIp[vdf[1]] = [json, res, nVdf]
    isVdefSet = true;

})


var Container = React.createClass({
	getInitialState:function(){
		return({ data:[]})
	},
	render: function (){
		return (<div>
			<LandingPage/>		
		</div>)
	}
});
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
		return ({currentPage:'landing', curIndex:0, minMq:minMq, minW:minMq.matches, mq:mq, brPoint:mq.matches, 
			curModal:'add',detectors:[], mbunits:[],ipToAdd:'',curDet:'',dets:[], curUser:'',tmpUid:'',level:0,
			detL:{}, macList:[], tmpMB:{name:'NEW', type:'mb', banks:[]},tmpS:{name:'NEW', type:'single', banks:[]}})
	},
	listenToMq: function (argument) {
		// body...
		if(this.refs.dv){
			this.refs.dv.setState({br:this.state.mq.matches})
		}
		this.setState({brPoint:this.state.mq.matches})
	},
	locateUnits: function (callback) {
		
		located = false;
		socket.emit('hello','landing')
		
		this.refs.findDetModal.toggle();
	},
	locateB: function(){
		socket.emit('locateReq', 'b')
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
		socket.on('noVdef', function(ip){
			console.log(ip)
			setTimeout(function(){
				socket.emit('vdefReq', ip);
			}, 1000)
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
				socket.emit('vdefReq', d.ip);
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
		socket.on('loggedIn', function(data){
			self.refs.logIn.toggle();
			self.setState({curUser:data.id, level:data.level})
		})

		socket.on('logOut', function(){
			self.setState({curUser:'', level:0})
		})
	},
	onRMsg: function (e,d) {
		console.log([e,d])
		var msg = e.data
		var data = new Uint8Array(msg);

		if(this.refs.dv){
			this.refs.dv.onRMsg(e,d)
		}else if(this.refs[d.ip]){
			this.refs[d.ip].onRMsg(e,d)
		}else {
			var ind = -1
			this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  					if(b.ip == d.ip){
  						ind = i;
  					}
  				})
  			}) 
  			if(ind != -1){
  				if(this.refs['mbu' + ind]){
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
		var res = vdefByIp[d.ip];
		//var pVdef = 
		for(var i = 0; i<((n-1)/2); i++){
			prodArray[i] = dv.getUint16(i*2 + 1);	
		}
		if(res){
			var Vdef = res[0]
			var pVdef = res[1]
			if(lcd_type == 1)
			{
				if(this.refs[d.ip]){
					this.refs[d.ip].onParamMsg(e);//.setProdVars(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens', pVdef),getVal(prodArray,1,'PhaseMode', pVdef))
				}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  					m.banks.forEach(function (b) {
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].onParamMsg(e,d);//.setPnSens(getVal(prodArray, 1, 'ProdName',pVdef),getVal(prodArray, 1, 'Sens',pVdef),d)
  	
  						}
  					}
  				}
  			}else if(lcd_type == 2){
				if(this.refs[d.ip]){
					this.refs[d.ip].onParamMsg(e)
				}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].onParamMsg(e,d)
  					}
  					}
  				}

  				/*var detsig = 'DetectSignal'
  				 var _phs = 'PhaseAngleAuto', _pk = 'Peak'
  				if(Vdef['@defines']['NUMBER_OF_SIGNAL_CHAINS'] == 2){
  					detsig = 'DetectSignal_A'
  					_phs = 'PhaseAngleAuto_A', _pk = 'Peak_A'
  				}
				var signal = uintToInt(getVal(prodArray,2,detsig,pVdef),16);
				var phase = uintToInt( getVal(prodArray,2,_phs, pVdef),16);
				var peak = getVal(prodArray, 2, _pk, pVdef);
				var rejs = getVal(prodArray,2, 'RejCount',pVdef);
				var rled = getVal(prodArray,2,'Reject_LED', pVdef);
				var pled = getVal(prodArray,2,'Prod_LED',pVdef);
				var phled = getVal(prodArray,2,'Prod_HI_LED', pVdef)
				var pwet = getVal(prodArray,2,'PhaseWetBit', pVdef);
				var faultArray = [];
				pVdef[6].forEach(function(f){
					if(getVal(prodArray,2,f, pVdef) != 0){
						faultArray.push(f)
					}
				});
				if(this.refs[d.ip]){
					this.refs[d.ip].setDyn(phase,peak,rejs,faultArray)
					this.refs[d.ip].setLEDS(rled,pled,phled)
					this.refs[d.ip].updateMeter(signal)
				}else{
  				var ind = -1;
  				this.state.mbunits.forEach(function(m,i){
  				m.banks.forEach(function (b) {
  						if(b.ip == d.ip){
  							ind = i;
  						}
  					})
  				}) 
  				if(ind != -1){
  					if(this.refs['mbu' + ind]){
  						this.refs['mbu'+ind].setDyn(phase,pwet,peak,rejs,faultArray,d)
  						this.refs['mbu'+ind].updateMeter(signal,d)	
  						this.refs['mbu'+ind].setLEDs(rled,pled,phled,d)
  					}
  				}
			}*/
    	}
		
		if(this.refs.dv){
			this.refs.dv.onParamMsg(e,d)
			}
		}
	},
	ipChanged: function (e) {
		e.preventDefault();
		this.setState({ipToAdd:e.target.value})
	},
	renderDetectors: function () {
		var self = this;
		var units = this.state.detectors.map(function (u) {
			// body...
			return <MultiScanUnit ref={u.ip} onSelect={self.switchUnit} unit={u}/>
		})
		return units;
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
	switchUnit: function (u) {
		// body...
		console.log(u)
		this.setState({curDet:u, currentPage:'detector'})
	},
	addNewMBUnit:function () {
		// body...
		this.setState({curModal:'newMB'})
	}, 
	addNewSingleUnit: function () {
		// body...
		this.setState({curModal:'newSingle'})
	},
	addMBUnit: function (mb) {
		// body...
		var mbunits = this.state.mbunits
		mbunits.push(mb)
		this.setState({mbunits:mbunits})
	},
	editMb:function (i) {
		
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
	addToTmp:function(e, type){
		var cont;
		var dsps = this.state.dets
		var detL = this.state.detL
		var mbUnits;
		if(type == 'single'){
			cont = this.state.tmpS.banks;
			mbUnits = this.state.tmpS
			if(cont.length != 0){
				return;
			}
			mbUnits.name = dsps[e].name
		}else{
			cont = this.state.tmpMB.banks;
			mbUnits = this.state.tmpMB
		}
		cont.push(dsps[e])
		detL[dsps[e].mac] = null;
		mbUnits.banks = cont;
		if(type == 'single'){
			this.setState({tmps:mbUnits, detL:detL})
		}else{
			this.setState({tmpMB:mbUnits, detL:detL})
		}

	},
	addToTmpGroup: function (e) {
		this.addToTmp(e,'multi')
	},
	addToTmpSingle: function (e) {
		this.addToTmp(e,'single')
	},
	removeFromTmpGroup: function (e) {
		var cont = this.state.tmpMB.banks;
		var dsps = this.state.dets;
		var detL = this.state.detL
		detL[cont[e].mac] = cont[e]
		cont.splice(e,1)
		var mbUnits = this.state.tmpMB;
		mbUnits.banks = cont;
		this.setState({tmpMB:mbUnits, detL:detL})
	},
	removeFromTmpSingle: function (e) {
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
			detL[b.mac] = b
		})
		this.state.tmpMB.banks.forEach(function (b) {
			detL[b.mac]= b
		})
		this.setState({curModal:'add',detL:detL, tmpS:{name:'NEW',type:'single',banks:[]}, tmpMB:{name:'NEW',type:'mb',banks:[]}})
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
			var MB = this.renderMBGroup(0)
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
	},
	changetMBName: function (e) {
		e.preventDefault();
		if(this.state.mbunits)
		var MB = this.state.tmpMB//this.state.mbunits[this.state.curIndex]
		MB.name = e.target.value;
		this.setState({tmpMB:MB})		// body...
	},
	changetSName: function (e) {
		e.preventDefault();
		var mbs = this.state.mbunits;
		var MB = this.state.tmpS//mbunits[this.state.curIndex]
		MB.name = e.target.value;
		this.setState({tmps:MB})		// body...
	},
	renderMBGroup: function (mode) {
		var self = this;
		if(mode == 0){
			var detectors = this.state.dets.map(function(det, i){
				if(self.state.detL[det.mac]){
					if(type=='single'){
						return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpSingle}/>)
					}else{
						return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}/>)
					}
				}
			})

			var MB; 
			var type;
			if(this.state.mbunits[this.state.curIndex].type == 'single'){
				MB = this.state.tmpS;
				type = 'single'
			}else{
				MB = this.state.tmpMB
				type = 'MB'
			}
			var banks = MB.banks.map(function (b,i) {
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
			return (<div><label>Name:</label>{nameEdit}
					<table><tbody><tr>
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
					return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpGroup}/>)
				}
			})
			var MB = this.state.tmpMB;
			var banks = MB.banks.map(function (b,i) {
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
					return (<DetItemView det={det} i={i} type={0} addClick={self.addToTmpSingle}/>)
				}
			})
			var MB = this.state.tmpS;//{name:"new", type:"single", banks:[]}
			var banks = MB.banks.map(function (b,i) {
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
	showLogin: function(){
		this.refs.logIn.toggle();
	},
	renderLanding: function () {
		var self = this;
		var detectors = this.renderDetectors()
		console.log('detectors rendered')
		var config = 'config'
		var find = 'find'
		var login = 'login'
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
								<td className="buttCell"><button onClick={this.showLogin} className={login}/></td>
								<td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
							</tr>
						</tbody>
					</table>
					<Modal ref='findDetModal'>
						{modalContent}
					</Modal>
				 	{detectors}
				 	{mbunits}
			</div>)	
	},
	renderDetector: function () {
		return (<DetectorView br={this.state.brPoint} ref='dv' acc={this.state.level} logoClick={this.logoClick} det={this.state.curDet} ip={this.state.curDet.ip}/>)
	},
	renderAccounts: function(){
		
		if(this.state.level == 5){
			return <AccountControlView showLogin={this.showLogin} minW={this.state.minW} ref='acc' active={true} logoClick={this.logoClick}/>
		}else{
			return <AccountControlView showLogin={this.showLogin} minW={this.state.minW} ref='acc' active={false} logoClick={this.logoClick}/>
		}
	},
	configAccounts: function(){
		this.setState({currentPage:'userSetup'})
	},
	render: function () {
		var cont;
		if(this.state.currentPage == 'landing'){
			console.log('here')
			cont = this.renderLanding();
		}else if(this.state.currentPage == 'detector'){
			cont = this.renderDetector();
		}else if(this.state.currentPage == 'userSetup'){
			cont = this.renderAccounts();
		}
		return (<div>
			<Modal ref='logIn'>
				<LogInControl level={this.state.level} userName={this.state.curUser}/>
				<button onClick={this.configAccounts}>Configure Accounts</button>
			</Modal>
			{cont}
		</div>)
		// body...
	}
})
var AccountControlView = React.createClass({
	getInitialState: function(){
		return ({userList:[], newuser:'',password:'',level:0})
	},
	logoClick: function(){
		this.props.logoClick();
	},
	showLogin: function(){
		this.props.showLogin();
	},
	componentDidMount: function(){
		var self = this;
		socket.emit('getUsers','data');
		socket.on('userList', function(data){
			self.setState({userList:data})
		})
	},
	addNew:function(){
		socket.emit('addUser', {id:this.state.newuser, pw:this.state.password, level:parseInt(this.state.level)})
		this.setState({newuser:'', password:'', level:0})
	},
	userNameChange:function(e){
		this.setState({newuser:e.target.value});
	},
	passwordChange:function(e){
		this.setState({password:e.target.value});
	},
	levelChange: function(e){
		this.setState({level:e.target.value})
	},
	render: function(){
		var cont = '';
		var login = 'login';
		// body...
		var lstyle = {height: 72,marginRight: 20}
		if(!this.props.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		var users = this.state.userList.map(function(u){
			return(<UserObj user={u}/>)
		})
		if(this.props.active){
			cont = <div><label>Users</label>
				<div>
					{users}
				</div>
				<table><tbody>
				<tr><td>User</td><td><input type='text' onChange={this.userNameChange} value={this.state.newuser}/></td></tr>
				<tr><td>Password</td><td><input type='text' onChange={this.passwordChange} value={this.state.password}/></td></tr>
				<tr><td>level</td><td><input type='text' onChange={this.levelChange} value={this.state.level}/></td></tr>
				</tbody></table>
				<button onClick={this.addNew}>Add User</button>
			</div>
		}else{
			cont = <div><label>Log in as admin to access this page</label></div>
		}
		return(<div className = 'landingPage'>
					<table className='landingMenuTable'>
						<tbody>
							<tr>
								<td><img onClick={this.logoClick}style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
								<td className="buttCell"><button onClick={this.showLogin} className={login}/></td>
							</tr>
						</tbody>
					</table>
					{cont}
			</div>)	
	}
})
var UserObj = React.createClass({
	delete:function(){
		socket.emit('delUser', this.props.user.id)
	},
	render: function(){
		var u = this.props.user
		return(<div><label>{'Username:' + u.id + '  Level:' + u.level}</label><button onClick={this.delete}>Delete This user</button></div>)
	}
})
var LogInControl = React.createClass({
	getInitialState: function(){
		return ({userName:'',password:'',alert:''})
	},
	componentDidMount: function(){
		var self = this;
		socket.on('access denied', function(alert){
			console.log(alert)
			self.setState({alert:alert})
		})
	},
	userNameChange: function(e){
		this.setState({userName:e.target.value})
	},
	passwordChange: function(e){
		this.setState({password:e.target.value})
	},
	loginSubmit: function(){
		socket.emit('login',{id:this.state.userName, pw:this.state.password})
		this.setState({password:'', alert:''})
	},
	logOut:function(){
		socket.emit('logOut')
	},
	render:function(){
		if(this.props.level>0){
			return (<div>
				<label>{'Logged In as ' + this.props.userName}</label>
				<button onClick={this.logOut}>Log Out</button>
			</div>)
		}else{
		return (<div>
			<table>
				<tbody>
					<tr><td>Username:</td><td><input onChange={this.userNameChange} type='text' value={this.state.userName}/></td></tr>
					<tr><td>Password:</td><td><input onChange={this.passwordChange} type='text' value={this.state.password}/></td></tr>
				</tbody>
			</table>
			<label style={{color:'red'}}>{this.state.alert}</label>
			<button onClick={this.loginSubmit}>Log in</button>
		</div>)
		}
	}
})

var TickerBox = React.createClass({
	getInitialState: function(){
		return{ticks:0}
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
var LEDBarInt = React.createClass({
	getInitialState: function(){
		return ({pled_a:0, dled_a:0,pled_b:0, dled_b:0})
	},
	update:function (pa,pb,da,db) {
		// body...
		if((this.state.pled_a != pa) || (this.state.dled_a != da)||(this.state.pled_b != pb) || (this.state.dled_b != db)){
			this.setState({pled_a:pa, dled_a:da,pled_b:pb, dled_b:db})
		}
	},
	render: function(){
		var rej_a = 'black';
		var rej_b = 'black';
		
		var prod_a = 'black';
		var prod_b = 'black';
		
		var fault = 'black';
			if(this.state.pled_a == 1){
			prod_a = 'green';
		}else if(this.state.pled_a == 2){
			prod_a = 'red'
		}
		if(this.state.dled_a == 1){
			rej_a = 'red'
		}
			if(this.state.pled_b == 1){
			prod_b = 'green';
		}else if(this.state.pled_b == 2){
			prod_b = 'red'
		}
		if(this.state.dled_b == 1){
			rej_b = 'red'
		}
		return(<div className='ledBar' >
				<table><tbody><tr><td style={{width:'17px'}}><LEDi color={rej_a}/><LEDi color={rej_b}/></td><td>Detection</td><td className='txtLeft'>Product:</td><td style={{width:'17px'}}><LEDi color={prod_a}/><LEDi color={prod_b}/></td></tr></tbody></table>
			</div>
			)
	}
});
var LEDi = React.createClass({
	render: function(){
		return(<div className='ledi' style={{ backgroundColor:this.props.color}}/>)
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
	render: function(){
		var type = this.props.fault
		return <div><label>{"Fault type: " + type}</label>
		</div>
	}
})

var SettingsDisplay = React.createClass({
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
		}

		return({
		 sysRec:sysSettings, prodRec:prodSettings, mqls:mqls, font:font, fram:framSettings
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
		}
	},
	handleItemclick: function(dat){
		this.props.onHandleClick(dat);
	},
	parseInfo: function(sys, prd){
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			this.setState({sysRec:sys, prodRec:prd})
		}
	},
	parseFRAM: function(fram){
		if(isDiff(fram, this.state.fram)){
			this.setState({fram:fram})
		}
	},
	componentDidMount: function () {
		// body...
		var packet = dsp_rpc_paylod_for(19,[556,0,0])
		var buf =  new Uint8Array(packet)
		socket.emit('rpc',{ip:this.props.dsp, data:buf.buffer})
	},

	sendPacket: function (n,v) {
		// body...
		var self = this;
		console.log([n,v])
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
		}else if(n['@rpcs']['apiwrite']){
			var arg1 = n['@rpcs']['apiwrite'][0];
			var arg2 = [];
			var strArg = null;
			for(var i = 0; i<n['@rpcs']['apiwrite'][1].length;i++){
				if(!isNaN(n['@rpcs']['apiwrite'][1][i])){
					arg2.push(n['@rpcs']['apiwrite'][1][i])
				}else if(n['@rpcs']['apiwrite'][1][i] == n['@name']){
					if(!isNaN(v)){
						//console.log(n)
						arg2.push(v)
					}
					else{
						strArg=v
						
					}
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
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
			var buf = new Uint8Array(packet);
			console.log(buf)
			socket.emit('rpc', {ip:this.props.dsp, data:buf.buffer})
		}else if(n['@rpcs']['write']){
			var arg1 = n['@rpcs']['write'][0];
			var arg2 = [];
			var strArg = null;
			for(var i = 0; i<n['@rpcs']['write'][1].length;i++){
				if(!isNaN(n['@rpcs']['write'][1][i])){
					arg2.push(n['@rpcs']['write'][1][i])
				}else if(n['@rpcs']['write'][1][i] == n['@name']){
					if(!isNaN(v)){
						arg2.push(v)
					}
					else{
						arg2.push(0)
						strArg=v
					}
				}else{
					var dep = n['@rpcs']['write'][1][i]
					if(dep.charAt(0) == '%'){

					}
				}
			}
			if(n['@rpcs']['write'][2]){
				strArg = n['@rpcs']['write'][2]
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
			var packet = dsp_rpc_paylod_for(arg1, arg2,strArg);
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
			//console.log(clis)
		var nav =''
		var backBut = ''
		var catList = ['Sensitivity', 'Calibration','Faults','Rej Setup', 'Test','Input','Output','Password','Other'];
		if(lvl == 0){
			nodes = [];
			for(var i = 0; i < catList.length; i++){
				var ct = catList[i]
				nodes.push(<SettingItem ip={self.props.dsp} ref={ct} activate={self.activate} font={self.state.font} sendPacket={self.sendPacket} lkey={ct} name={ct} hasChild={ct} data={[ct,combinedSettings[ct]]} onItemClick={handler} hasContent={true}/>)
			}
			nav = nodes;
		}else if(lvl == 1 ){

			var cat = data[0];
			lab = cat
			var accLevel = 0;
			var accMap = {'Sensitivity':'PassAccSens', 'Calibration':'PassAccCal', 'Other':'PassAccProd', 
			'Faults':'PassAccClrFaults','Rej Setup':'PassAccClrRej','Test':'PassAccTest'}
			if(accMap[cat]){
				accLevel = this.state.sysRec[accMap[cat]]
			}
			var list = combinedSettings[cat]
			console.log(list)
			nodes = []
			for (var l in list){
				nodes.push((<SettingItem ip={self.props.dsp} ref={l} activate={self.activate} font={self.state.font} sendPacket={this.sendPacket} dsp={this.props.dsp} lkey={l} name={l} hasChild={false} data={list[l]} onItemClick={handler} hasContent={true}  acc={this.props.accLevel>=accLevel}/>))
			}
			nav = (<div className='setNav'>
					{nodes}
				</div>)

			backBut =(<div className='bbut' onClick={this.props.goBack}><img style={{marginBottom:-5}} src='assets/angle-left.svg'/><label style={{color:'blue', fontSize:ft}}>Settings</label></div>)

		}
			 
	     var className = "menuCategory expanded";
	    
	    console.log(lab)
	    var titlediv = (<span ><h2 style={{textAlign:'center'}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>
)
	    if (this.state.font == 1){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:30}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
	    }else if (this.state.font == 0){
	    	titlediv = (<span><h2 style={{textAlign:'center', fontSize:24}} >{backBut}<div style={{display:'inline-block', textAlign:'center'}}>{lab}</div></h2></span>)
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
			this.props.activate(this.props.name)
	},
	deactivate: function () {
		// body...
		this.refs.ed.deactivate()
	},
	render: function(){
		var ft = [14,16,20];
		var wd = [190,210,260]
		var st = {display:'inline-block', fontSize:ft[this.state.font], width:wd[this.state.font]}
		var vst = {display:'inline-block', fontSize:ft[this.state.font]}
	
		if(Array.isArray(this.props.data)&&(this.props.data.length > 1)){
		return (<div className='sItem hasChild' onClick={this.onItemClick}><label>{this.props.name}</label></div>)
		}else{
			var pram;
			var val;
			var label = false
			var res = vdefByIp[this.props.ip];
			var pVdef = _pVdef;
			if(res){
				pVdef = res[1];
			}
			if(typeof pVdef[0][this.props.name] != 'undefined'){
				pram = pVdef[0][this.props.name]
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
					}
					
				}
				if(pram["@labels"]){
					label = true
				}
			}else if(typeof pVdef[1][this.props.name] != 'undefined'){
				pram = pVdef[1][this.props.name]
				var deps = []
				val = this.props.data
				if(pram["@type"]){
					var f =	pram["@type"]
					if(pram["@dep"]){
						deps = pram["@dep"].map(function(d){
							if(pVdef[4][d]["@rec"] == 0){
								return sysSettings[d];
							}else{
								return prodSettings[d];
							}
						});
					}
					if(pram['@bit_len']<=16){
						val = Params[f].apply(this, [].concat.apply([], [val, deps]));
					}
				}

				if(pram["@labels"]){
					label = true
				}
			}else{
				val = this.props.data
			} 
		
			var edctrl = <EditControl acc={this.props.acc} activate={this.activate} ref='ed' vst={vst} lvst={st} param={pram} size={this.state.font} sendPacket={this.sendPacket} data={val} label={label}/>
			return (<div className='sItem'> {edctrl}
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
		var val = e.target.value;
		if(this.props.bitLen == 16){
			val = VdefHelper.swap16(val)
		}
		if(this.props.label){
			this.props.sendPacket(this.props.param, parseInt(val));
		}
		this.setState({val:e.target.value})
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({size:newProps.size, val:newProps.data})
	},
	deactivate:function () {
		// body...
		this.setState({mode:0})
	},
	_handleKeyPress: function (e) {
		// body...
		if(e.key === 'Enter'){
			this.sendPacket();
		}
	},
	switchMode: function () {
		// body...
		if(this.props.acc){
			if(this.props.param['@rpcs']){
				if((this.props.param['@rpcs']['write'])||(this.props.param['@rpcs']['toggle'])){
					var m = Math.abs(this.state.mode - 1)
					this.props.activate()
					this.setState({mode:m})
				}
			}
		}	
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
	render: function(){
		var lab = (<label>{this.state.val}</label>)
		var style = {display:'inline-block',fontSize:20}
		if(this.state.size == 1){
			style = {display:'inline-block',fontSize:16}
		}else if(this.state.size == 0){
			style = {display:'inline-block',fontSize:14}
		}
		var namestring = this.props.param['@name'];
		if(namestring.indexOf('INPUT_')!= -1){
			console.log(namestring)
			namestring = namestring.slice(6);
		}else if(namestring.indexOf('OUT_')!=-1){
			namestring = namestring.slice(4)
		}
		if(namestring.indexOf('PHY_')!= -1){
			namestring = namestring.slice(4)
		}
		var dval = this.props.data
		if(this.props.label){
			dval=_pVdef[5][this.props.param["@labels"]]['english'][this.props.data]
		}
		
			if(this.state.mode == 0){
				return <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
			}else{
				if(this.props.label){
					var selected = this.state.val;
					var options = _pVdef[5][this.props.param["@labels"]]['english'].map(function(e,i){
						if(i==selected){
							return (<option value={i} selected>{e}</option>)
						}else{
							return (<option value={i}>{e}</option>)
						}
					})
					return(<form className='editControl' onSubmit={this.onSubmit}>
							<div onClick={this.changeMode}><label style={this.props.lvst}>{namestring + ': '}</label><label style={this.props.vst}> {dval}</label></div>
							<div className='customSelect'>
							<select onChange={this.valChanged}>
							{options}
							</select>
							</div>
							</form>)

				}else{
					return (<div> <div onClick={this.switchMode}><label style={this.props.lvst}>{namestring + ": "}</label><label style={this.props.vst}>{dval}</label></div>
						<div style={{display:'inline-block',width:200,marginRight:10}}><input width={10} onKeyPress={this._handleKeyPress} style={{fontSize:18}} onChange={this.valChanged} type='text' value={this.state.val}></input></div>
						<label style={{fontSize:16,marginLeft:20, border:'1px solid grey',padding:2, paddingLeft:5,paddingRight:5, background:'#e6e6e6',borderRadius:10}} onClick={this.sendPacket}>Submit</label></div>)	
			}
		}
	}
})
var FRamView =React.createClass({
	getInitialState: function(){
		return({dspName:'',XPortIp:'',internalIp:'',haloIp:'',ioIp:''})
	},
	render:function(){
		return(<div></div>)
	}
	
})

var LiveView = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (data) {
		this.refs.st.update(data)
	},
	setLEDs: function (p,d) {
		this.refs.st.setLEDs(p,d)
	},
	render: function(){
		console.log('rendering st')
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBar ref='st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBar ref='st'/>
			</div>
			)
	}
})
var LiveViewInt = React.createClass({
	getInitialState: function(){
		return ({rejects:0, mode:0, phase:90,pled:0,dled:0})
	},
	update: function (a,b) {
		
		this.refs.st.update(a,b)
	},
	setLEDs: function (pa,da,pb,db) {
		this.refs.st.setLEDs(pa,pb,da,db)
	//	this.refs.sta.setLEDs(pb,db)
	},
	render: function(){
		console.log('rendering int')
		var style = {fontSize:20}
		if(this.props.layout =='mobile'){
			style = {fontSize:16}
		}else if(this.props.layout == 'tab'){
			return (<div className='liveView' style={{fontSize:16, height:50, paddingTop:0}}>
			<table style={{width:'100%'}}><tbody><tr><td style={{width:280}}>
			{this.props.children}
			</td><td>
			<StatBarInt ref = 'st'/>
			</td></tr></tbody></table>
			</div>
			)
		}

		return (<div style={this.props.st} className='liveView' style={style}>
			{this.props.children}
			<StatBarInt ref = 'st'/>		
			</div>
			)
	}
})


var FaultDiv = React.createClass({
	clearFaults: function () {
	this.props.clearFaults()
	},
	maskFault: function (f) {
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
		this.refs.tb.update(data)
	},
	setLEDs: function (p,d) {
		this.refs.lb.update(p,d)
	},
	render: function(){
		return (<div className='statBar'>
			<TickerBox ref='tb' int={false}/>
			<LEDBar ref='lb'/>
			</div>)
	}
})
var StatBarInt = React.createClass({
	update: function (a,b) {
		this.refs.ta.update(a)
		this.refs.tb.update(b)
	},
	setLEDs: function (pa,pb,da,db) {
		this.refs.lb.update(pa,pb,da,db)
	},
	render: function(){
		return (<div className='statBar'>
			<TickerBox ref='ta' int={true}/>
			<TickerBox ref='tb' int={true}/>
			<LEDBarInt ref='lb'/>
			</div>)
	}
})
	
var Modal = React.createClass({
	getInitialState: function () {
		var klass = 'custom-modal'
		if(this.props.className){
			klass = this.props.className
		}
		return({className:klass, show:false})
	},
	toggle: function () {
		this.setState({show:!this.state.show})
	},
	render: function () {
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

var MultiBankUnit = React.createClass({
	getInitialState: function () {
		// body...
		var dat = []
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
	onParamMsg:function(e,d){
		if(this.refs[d.ip]){
			console.log(d)
			this.refs[d.ip].onParamMsg(e,d)
	
		}
	},
	componentWillReceiveProps: function (nextProps) {
		this.setState({banks:nextProps.data})
	},
	setDyn: function(p,w,pk,r,f,d){
		this.refs[d.ip].setDyn(p,w,pk,r,f)
	},
	setPnSens: function(p,s,d){
		this.refs[d.ip].setPnSens(p,s);
	},
	setLEDs:function (det,prod,prodhi,d) {
		// body...
		this.refs[d.ip].setLEDs(det,prod,prodhi);
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
		var self = this;
		var banks = this.state.banks.map(function (b,i) {
			console.log(b)
			return <StatBarMB unit={b} onSelect={self.switchUnit} ref={b.ip} name={b.name}/>
		
		})
		return (<div className='multiBankUnit'>
			<div className='nameLabel'>
				<label>{this.props.name}</label></div>
			{banks}</div>)
	

	}
})

var StatBarMB = React.createClass({
	getInitialState: function () {
		var br = window.matchMedia('(min-width:600px)')
		br.addListener(this.listenToMq)
		var interceptor = (this.props.unit.board_id == 4)
		return({pn:'',phase:9000, phasemode:0,sens:100, peak:0,br:br, mobile:br.matches, interceptor:interceptor, rejs:2, fault:false, live:false, pled:0,dled:0, rpcResp:false})
	},
	listenToMq: function () {
		this.setState({mobile:this.state.br.matches});
	},
	 update: function (data) {
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		this.refs.lv.update(data)
	},
	setDyn: function(p,w,pk,r,f){
		var faults = (f.length != 0);
		if((this.state.phase != p)||(this.state.phasemode != w)||(this.state.peak!=pk)||(this.state.rejs != r)||(this.state.fault!=faults)){
			this.setState({phase:p,phasemode:w,peak:pk,rejs:r,fault:faults})
		}
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
		clearInterval(myTimers[this.props.unit.ip]);
	},
	onRMsg: function (e,d) {
		// body...
		if(d.ip = this.props.unit.ip){
			this.setState({rpcResp:true})	
		}		

	},
	onParamMsg: function(e){

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
		var klass =''
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
				<LiveView ref='lv' layout='tab'>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td></tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td></tr></tbody></table>
				</LiveView>
			</div>
		)

	},
	renderMob: function () {
		var klass =''
		if(this.state.fault){
			klass = 'faultactive'
		}
		if(!this.state.live){
			klass = 'inactive'
		}
		var list = ['dry','wet','DSA']
		
		return (
			<div onClick={this.switchUnit} className={klass}>
				<LiveView ref='lv' layout='mobile'>

					<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase/100).toFixed(2).toString() +' ' +list[this.state.phasemode]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs}</label></td>

				</tr></tbody></table>
				</LiveView>
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
		var interceptor = (this.props.unit.board_id == 4)
		return ({font:font,mq:mobMqs,phasemode_A:0,live:false, fault:false, pn:'', sens_A:0,peak_A:0,rejs_A:0,phase_A:0,pled_A:0,dled_A:0,
			sens_B:0,peak_B:0,rejs_B:0,phase_B:0,pled_B:0,dled_B:0,rpcResp:false, interceptor:interceptor})
	},
	onClick: function () {
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
	updateMeterInt: function(a,b){
		liveTimer[this.props.unit.ip] = Date.now();
		if(!this.state.live){
			this.setState({live:true})
		}
		//console.log([a,b])
		this.refs.lv.update(a,b)	
	},
	onRMsg: function (e,d) {
		this.setState({rpcResp:true})
	},
	onParamMsg: function(e){
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
   		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
		var prodArray = [];
		var res = vdefByIp[this.props.unit.ip]
		for(var i = 0; i<((n-1)/2); i++){
			prodArray[i] = dv.getUint16(i*2 + 1);	
		}
		if(res){
			var pVdef = res[1]
			if(lcd_type == 1){
				if(!this.state.interceptor){
					this.setProdVars(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens', pVdef),getVal(prodArray,1,'PhaseMode', pVdef))
					
				}else{
					this.setProdVarsInt(getVal(prodArray, 1, 'ProdName', pVdef),getVal(prodArray, 1, 'Sens_A', pVdef),getVal(prodArray, 1, 'Sens_B', pVdef),getVal(prodArray,1,'PhaseMode_A', pVdef),getVal(prodArray,1,'PhaseMode_B', pVdef))
					
				}
				

			}else if(lcd_type == 2){


			
				var faultArray = [];
				pVdef[6].forEach(function(f){
					if(getVal(prodArray,2,f, pVdef) != 0){
						faultArray.push(f)
					}
				});
				if(!this.state.interceptor){
					this.setDyn(uintToInt(getVal(prodArray,2,'PhaseAngleAuto',pVdef),16),getVal(prodArray,2,'Peak',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.updateMeter(uintToInt(getVal(prodArray,2,'DetectSignal',pVdef),16))
				/*	var rled = getVal(prodArray,2,'Reject_LED', pVdef);
				var pled = getVal(prodArray,2,'Prod_LED',pVdef);
				var phled = getVal(prodArray,2,'Prod_LED',pVdef)*/
				
					this.setLEDS(getVal(prodArray,2,'Reject_LED', pVdef),getVal(prodArray,2,'Prod_LED',pVdef),getVal(prodArray,2,'Prod_HI_LED',pVdef))
				}else{
					this.updateMeterInt(uintToInt(getVal(prodArray,2,'DetectSignal_A',pVdef),16),uintToInt(getVal(prodArray,2,'DetectSignal_B',pVdef),16))
					this.setDynInt(uintToInt(getVal(prodArray,2,'PhaseAngleAuto_A',pVdef),16),getVal(prodArray,2,'Peak_A',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray, uintToInt(getVal(prodArray,2,'PhaseAngleAuto_B',pVdef),16),getVal(prodArray,2,'Peak_B',pVdef), getVal(prodArray,2,'RejCount',pVdef), faultArray)
					this.setLEDSInt(getVal(prodArray,2,'Reject_LED_A', pVdef),getVal(prodArray,2,'Prod_LED_A',pVdef),getVal(prodArray,2,'Prod_HI_LED_A',pVdef),getVal(prodArray,2,'Reject_LED_B', pVdef),getVal(prodArray,2,'Prod_LED_B',pVdef),getVal(prodArray,2,'Prod_HI_LED_B',pVdef))
				}
			}
		}
		
	},
	onFault: function () {
		this.setState({fault:!this.state.fault})

	},
	componentDidMount: function () {
		var self = this;
		this._isMounted = true;
		myTimers[this.props.unit.ip] = setInterval(function(){
			if((Date.now() - liveTimer[self.props.unit.ip]) > 1000){
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
		clearInterval(myTimers[this.props.unit.ip]);
	},
	setProdVars: function(pn,sns,pm){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.phasemode_A != pm)){
			this.setState({pn:pn, sens_A:sns, phasemode_A:pm})
		}
	},
	setProdVarsInt: function(pn,sns, snsb,pm, pmb){
		if((this.state.pn != pn) || (this.state.sens_A != sns)||(this.state.sens_B != snsb)||(this.state.phasemode_A != pm)||(this.state.phasemode_B != pmb)){
			this.setState({pn:pn, sens_A:sns,sens_B:snsb, phasemode_A:pm,phasemode_B:pmb})
		}
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
	setDyn: function(phase,pk,rc,fa){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults})
		}
	},
	setLEDSInt:function(det_a,prod_a,prodhi_a,det_b,prod_b,prodhi_b){
		var pled_a = 0
		if(prodhi_a == 1){
			pled_a = 2
		}else if(prod_a == 1){
			pled_a = 1
		}
		var pled_b = 0
		if(prodhi_b == 1){
			pled_b = 2
		}else if(prod_b == 1){
			pled_b = 1
		}
		this.refs.lv.setLEDs(pled_a,det_a,pled_b,det_b)
	},
	setDynInt: function(phase,pk,rc,fa,phase_b,pk_b){
		var faults = (fa.length != 0);
		if((phase!=this.state.phase_A)||(this.state.peak_A != pk)||(phase_b!=this.state.phase_B)||(this.state.peak_B != pk_b) || (this.state.rejs_A != rc)||(faults != this.state.fault)){
			this.setState({phase_A:phase,peak_A:pk,rejs_A:rc,fault:faults, phase_B:phase_b,peak_B:pk_b})
		}
	},
	render: function(){
		if(this.state.interceptor){
			return this.renderInt()
		}else{
			return this.renderST()
		}
	},
	renderInt:function(){
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
		var list = ['dry','wet','DSA']
		return(<div className={classname}>
			<LiveViewInt st={st} ref = 'lv'>
			<div onClick={this.onClick}>
			<div><label>Name: </label><label>{this.props.unit.name}</label></div>
				<div><label>Product:{this.state.pn}</label></div>
				<table className='mtab'><tbody>
				<tr><td><label>Sensitivity:{this.state.sens_A+ "  "+ this.state.sens_B}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A] 
				+ "  "+ (this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A+ "  "+ this.state.peak_B}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
			</div>
			</LiveViewInt>
			</div>)
	},
	renderST: function () {
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
				<tr><td><label>Sensitivity:{this.state.sens_A}</label></td><td><label style={{paddingLeft:15}}>Phase:{(this.state.phase_A/100).toFixed(2).toString() +' ' +list[this.state.phasemode_A]}</label></td>
			</tr>
				<tr><td><label>Peak:{this.state.peak_A}</label></td>
				
				<td><label style={{paddingLeft:15}}>Rejects:{this.state.rejs_A}</label></td>

				</tr></tbody></table>
				</div>
			</LiveView>
		</div>)
	}
})


var DetItemView = React.createClass({
	addClick: function () {
		// body...
		this.props.addClick(this.props.i)
	},
	render: function () {
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
		var interceptor = (this.props.det.board_id == 4);
		//if(vdefByIp[this.props.det.ip])
		return {faultArray:[],currentView:'MainDisplay', data:[], stack:[], pn:'', sens:0, 
		minMq:minMq, minW:minMq.matches, br:this.props.br, mqls:mqls, fault:false, peak:0, rej:0, phase:0, interceptor:interceptor}
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
			return;
		}
		var self = this;
   		var msg = e.data;
   		var data = new Uint8Array(msg);
		var dv = new DataView(msg);
		var lcd_type = dv.getUint8(0);
  	    var n = data.length;
 
   	 	if(lcd_type== 0){
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
				var sysArray = [];
				for(var i = 0; i<((n-1)/2); i++){
					sysArray[i] = dv.getUint16(i*2 + 1);	
				}
				var sysRec = {}
    			Vdef["@params"].forEach(function(p){
    				if(p["@rec"] == 0){
    					var setting = getVal(sysArray, 0, p["@name"], pVdef)
    					sysRec[p["@name"]] = setting;
    				}
    			})
    			for(var p in Vdef["@deps"]){
    				if(Vdef["@deps"][p]["@rec"] == 0){
    					var setting = getVal(sysArray,4, p, pVdef)
    					sysRec[p] = setting;
    				}
    			}
    			sysSettings = sysRec;
    			if(this.state.currentView == "SettingsDisplay"){
					if(this.refs.sd){
						this.refs.sd.parseInfo(sysSettings, prodSettings)	
					}
				}else{
					if(this.refs.dm){
						this.refs.dm.parseInfo(sysSettings, prodSettings)
					}	
				}
    
    		}
		}else if(lcd_type == 1){
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var pVdef = vdefByIp[d.ip][1]
				var nVdf = vdefByIp[d.ip][2]
				var prodArray = [];
				for(var i = 0; i<((n-1)/2); i++){
					prodArray[i] = dv.getUint16(i*2 + 1);	
				}
				var prodRec = {}
    			Vdef["@params"].forEach(function(p){
    				if(p["@rec"] == 1){
    					var setting = getVal(prodArray, 1,p["@name"], pVdef)
    					prodRec[p["@name"]] = setting;
    				}
    			})
   				for(var p in Vdef["@deps"]){
   					if(Vdef["@deps"][p]["@rec"] == 1){
    					var setting = getVal(prodArray,4, p, pVdef)
    					prodRec[p] = setting;
    				}
    			}
				prodSettings = prodRec;
				var phaseMode = prodSettings['PhaseMode']
				var phaseSpeed = Vdef['@labels']['PhaseSpeed']['english'][prodSettings['PhaseSpeed']]
				var comb = [];
				for(var c in nVdf){
					comb[c] = {};
					for(var i = 0; i < nVdf[c].length; i++){
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
				}else{
					if(this.refs.dm){
						this.refs.dm.parseInfo(sysSettings, prodSettings)
					}
				}
			}			
		}else if(lcd_type==2){
			//	console.log('on param msg dyn')
			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var nVdf = vdefByIp[d.ip][2]
				var pVdef = vdefByIp[d.ip][1]
				var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 2){
    						var setting = getVal(prodArray, 2,p["@name"], pVdef)
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 2){
    						var setting = getVal(prodArray,4, p, pVdef)
    						prodRec[p] = setting;
    					}
    				}
					
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
					if(getVal(prodArray,2,f,pVdef) != 0){
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
  						})
  						if(diff){
  							this.setState({faultArray:faultArray})
  						}
  					}				
			}

   		}else if(lcd_type == 3){
   			if(vdefByIp[d.ip]){
				var Vdef = vdefByIp[d.ip][0]
				var nVdf = vdefByIp[d.ip][2]
				var pVdef = vdefByIp[d.ip][1]
					var prodArray = [];
					for(var i = 0; i<((n-1)/2); i++){
						prodArray[i] = dv.getUint16(i*2 + 1);	
					}
					var prodRec = {}
    				Vdef["@params"].forEach(function(p){
    					if(p["@rec"] == 3){
    						var setting = getVal(prodArray, 3,p["@name"],pVdef)
    						prodRec[p["@name"]] = setting;
    					}
    				})
    				for(var p in Vdef["@deps"]){
    					if(Vdef["@deps"][p]["@rec"] == 3){
    						var setting = getVal(prodArray,4, p, pVdef)
    						prodRec[p] = setting;
    					}
    				}
					console.log(prodRec);
				}
   		}
   		
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

	},
	maskFault:function (f) {
		// body...
		alert('set ' +f +'Mask to 1')
	},
	changeView: function (d) {
		// body...
		var st = this.state.stack;
		st.push([this.state.currentView, this.state.data]);
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
		}else if(n=='phaseEdit'){
			var phase = Math.round(parseFloat(v)*100)
			var packet = dsp_rpc_paylod_for(19,[48,phase,0])
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
		
		var SD ="";
		var MD ="";
		var dm = <DetMainInfo clear={this.clear} det={this.props.det} sendPacket={this.sendPacket} ref='dm'/>
		var dg = <DummyGraph ref='dg' canvasId={'dummyCanvas'}/>
		var ce = <ConcreteElem h={400} w={400} concreteId={'concreteCanvas'}/>
	 	var lstyle = {height: 72,marginRight: 20}
	 	var np = (<NetPollView ref='np' eventCount={15}/>)
		if(!this.state.minW){
			lstyle = { height: 60, marginRight: 15}
		}
		if(this.state.settings){
			SD = (<SettingsDisplay goBack={this.goBack} accLevel={this.props.acc} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.props.ip}/>)
	
		}else{
			MD = (<div style={{margin:5}}>
					<table className='mainContTable'><tbody><tr><td className='defCont'>{dm}
					</td><td style={{width:400}} className='defCont'>{dg}
					</td></tr></tbody></table>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
					</div>)
		}
		var lbut = (<td onClick={this.logoClick}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>)
		var abut = (<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>)
		var cbut = (<td className="buttCell"><button onClick={this.showSettings} className={config}/></td>)
		var lmtable = (<table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								<td className='mobCell'><MobLiveBar ref='lv'/></td>
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>)
		if(!this.state.br){
			lmtable = (<div><table className='landingMenuTable'>
						<tbody>
							<tr>
								{lbut}
								{abut}
								{cbut}
						</tr>
						</tbody>
					</table>
					<MobLiveBar ref='lv'/>
					</div>)
			if(!this.state.settings){
				MD = (<div><div className='prefInterface' >{dm}</div>
					<div className='prefInterface' >{dg} </div>
					<div className='prefInterface'>{np}</div>
					<div>{ce}</div>
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
		return({events:[]})
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
		var res = vdefByIp[this.props.det.ip]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];
		} 
		
		return({rpeak:0,xpeak:0, peak:0,phase:0, rej:0, sysRec:{},prodRec:{}, tmp:'', prodList:[], phaseFast:0, pVdef:pVdef})
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
		var param = this.state.pVdef[2]['Peak']
		this.props.clear(param) 
	},
	calibrate: function () {
		this.refs.calbModal.toggle()
	},
	parseInfo: function(sys, prd){
		console.log('parseInfo')
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			console.log([sys,prd])
			this.setState({sysRec:sys, prodRec:prd})
		}
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
		if(!isNaN(this.state.tmp)){
			this.props.sendPacket('Sens',this.state.tmp)
			this.cancel()
		}
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
	_handleKeyPress: function (e) {
		// body...
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	},
	render: function () {
			
		console.log('render here')
		var self = this;
		var tdstyle = {paddingLeft:10}
		var list = ['dry', 'wet', 'DSA']
		var ps = this.state.pVdef[5]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
		var tab = (
		<table className='dtmiTab'>
			<tbody>
				<tr><td>Name</td><td style={tdstyle}>{this.props.det.name}</td></tr>
				<tr onClick={this.showEditor}><td>Product</td><td style={tdstyle}>{this.state.prodRec['ProdName']}</td></tr>
				<tr onClick={this.editSens}><td>Sensitivity</td><td style={tdstyle}>{this.state.prodRec['Sens']}</td></tr>
				<tr><td>Signal</td><td style={tdstyle} onClick={this.clearPeak}>{this.state.peak}</td></tr>
				<tr><td>Rejects</td><td style={tdstyle} onClick={this.clearRej}>{this.state.rej}</td></tr>
				<tr><td>Phase</td><td style={tdstyle} onClick={this.calibrate}>{this.state.phase + ' ' + list[this.state.prodRec['PhaseMode']]}</td></tr>
				<tr><td>Test</td><td style={tdstyle}><input type='text'></input> <button onClick={this.setTest}>Test</button></td>
				</tr>		
			</tbody>
		</table>)
		// body...

		var prodList = this.state.prodList.map(function(p){
			var sel = false
			//console.log([p,self.state.prodNo])
			if(p==self.state.sysRec['ProdNo']){
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
							<div>Sensitivity: <input type='text' onKeyPress={this._handleKeyPress} onChange={this.updateTmp} value={this.state.tmp}></input><button onClick={this.submitTmpSns}>OK</button><button onClick={this.cancel}>Cancel</button></div>
						</Modal>
						<Modal ref='testModal'>
							<TestInterface prodRec={this.state.prodRec}/>
						</Modal>
						<Modal ref='calbModal'>
							<CalibInterface sendPacket={this.sendPacket} refresh={this.refresh} calib={this.cal} phase={[this.state.phase, this.state.prodRec['PhaseMode'], ps]} peaks={[this.state.rpeak,this.state.xpeak]}ref='ci'/>
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
		//e.preventDefault();
		this.setState({tmpStr:e.target.value})
	},
	clearR: function () {
		// body...
		this.props.sendPacket('rpeak','clear')
	},
	submitPhase: function () {
		// body...
		this.props.sendPacket('phaseEdit',this.state.tmpStr)
	},
	clearX: function(){
		this.props.sendPacket('xpeak','clear')
	},
	_handleKeyPress: function (e) {
		// body...
		if(e.key === 'Enter'){
			this.submitPhase();
		}
	},
	render: function () {
		// body...
		var list = ['dry', 'wet', 'DSA']
		var phase = (<div onClick={this.editPhase}> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>)
		if(this.state.edit){
			phase = (<div><div onClick={this.editPhase}> {this.props.phase[0] + '-' + list[this.props.phase[1]]}</div>
					<div><input type='text' onKeyPress={this._handleKeyPress} onChange={this.onChangePhase} value={this.state.tmpStr}/> <button onClick={this.submitPhase}>Submit</button></div>
				</div>)
		}
		return (<div className='calib'>
				<label>
					Calibration Menu
				</label>
				<table><tbody>
					<tr><td>Phase Speed:</td><td>{this.props.phase[2]}</td></tr>
					<tr><td >Phase:</td><td>{phase}</td></tr>
					<tr><td>R Peak:</td><td onClick={this.clearR}>{this.props.peaks[0]}</td></tr>
					<tr><td>X Peak:</td><td onClick={this.clearX}>{this.props.peaks[1]}</td></tr>
				</tbody></table>
				<button onClick={this.calibrate}>Calibrate</button>
				<button onClick={this.refresh}>Refresh</button>
			</div>)
	}
})
var TestInterface = React.createClass({
	getInitialState: function () {
		// body...
		return {prodRec:this.props.prodRec}
	},
	componentWillReceiveProps: function (newProps) {
		this.setState({prodRec:newProps.prodRec})
		this.render();
	},
	render: function () {
		var prod = this.state.prodRec;
		console.log(prod)
		var testConfigs = _testMap.map(function(_test, i){
			var test = _test.map(function(conf){
				console.log(conf)
				return ({count:prod[conf.count], metal:prod[conf.metal]})
			})	
			console.log(test)
			return <TestItem metalCounts={test} ind={i+1}/>
		})  
		console.log(testConfigs)
		// body...
		return(<div className='testInt'>
			{testConfigs}
		

					<table hidden><tbody>
						<tr><td>Test Mode</td><td><select><option>Manual</option><option>Halo</option><option>Halo2</option></select></td></tr>
						<tr><td>FE</td><td><input type='text'/></td></tr><tr><td>NFE</td><td><input type='text'/></td></tr><tr><td>SS</td><td><input type='text'/></td></tr>
					</tbody></table>
					<button onClick={this.run}>Run Test</button>
			</div>)
	}
})
var TestItem = React.createClass({
	render:function(){
		var metList = ['FE','NFE', 'SS']
		var tests = this.props.metalCounts.map(function(mc){

			return(<tr><td style={{marginRight:10, width:100, display:'inline-block'}}>Metal:{metList[mc.metal]}</td><td>Count:{mc.count}</td></tr>)
		})
		return(<div>
			<TreeNode nodeName={'Test ' + this.props.ind}>
			<table><tbody>
			{tests}
			</tbody></table>
			</TreeNode>
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
		return ({line:l1})
	},
	componentDidMount: function(){
		var smoothie = new SmoothieChart({millisPerPixel:25,interpolation:'linear',maxValueScale:1.1,minValueScale:1.2,
		horizontalLines:[{color:'#000000',lineWidth:1,value:0},{color:'#880000',lineWidth:2,value:100},{color:'#880000',lineWidth:2,value:-100}],labels:{fillStyle:'#000000'}, grid:{fillStyle:'#ffffff'}, yRangeFunction:yRangeFunc});
		smoothie.streamTo(document.getElementById(this.props.canvasId));
		smoothie.addTimeSeries(this.state.line, {lineWidth:2,strokeStyle:'#000000'});
	},
	stream:function (dat) {
		this.state.line.append(dat.t, dat.val);
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
			// if(wrapper.getIntersection(e.clientX - boundingRect.left, e.clientY - boundingRect.top)){
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		console.log('move');
			 	}
			 	
			 //}
			
		});
		concreteContainer.addEventListener('mouseup', function(e){
			 var boundingRect = concreteContainer.getBoundingClientRect();
			// if(wrapper.getIntersection(e.clientX - boundingRect.left, e.clientY - boundingRect.top)){
			 	var x = e.clientX - boundingRect.left
			 	var y = e.clientY - boundingRect.top
			 	if((x>0&&x<400)&&(y>0&&y<400)){
			 		console.log([x,y]);
			 	}
			 	
			 //}
			
		});
		wrapper.add(this.state.axisLayer)
		wrapper.add(this.state.gridLayer)
		var plotLayers = this.state.plotLayers;
		for(var i = 0; i<5;i++){
			//plotLayers[i] = new Concrete.Layer();
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
		if(xr.x>maxX){
			maxX=xr.x;
			minX= 0-xr.x
			redraw = true
		}
		if(xr.x<minX){
			minX=xr.x
			maxX= 0-xr.x
			redraw = true
		}
		if(xr.r>maxR){
			maxR=xr.r
			minR = 0-xr.r
			redraw = true
		}
		if(xr.r<minR){
			minR=xr.r
			maxR = 0-xr.r
			redraw = true
		}
		var Xscale = (maxX-minX)/this.props.w;
		var Rscale = (maxR-minR)/this.props.h;
		this.setState({ axis:{x:[minX,maxX],r:[minR,maxR]},Xscale:Xscale,Rscale:Rscale, redraw:redraw, packs:packs})
		this.drawPacksSim();
	},
	drawPacks: function(){
		//var canv = document.getElementById(this.props.canvasId)
		var ctx = this.state.plotLayers[this.state.curPack].sceneCanvas.context;//canv.getContext('2d')
		var strokeStyles = ['#FF0000', '#d8bab3', '#aa938d', '#7a6965', '493f3d']
		//var strokeStyles = ['#000000', '#8B8B8B','#FF0000','#00FF00','#0000FF']
		var alpha = [1.0,0.8,0.7,0.6,0.5,0.4]
		var lW = [2,1,1,1,1]	
		if(this.state.redraw){
			//this.state.plotLayers[this.state.curPack].sceneCanvas.clear();
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
			//var strokeStyles = ['#000000','#FF0000','#00FF00','#0000FF']
			//ctx.strokeStyle = 'black';//strokeStyles[this.state.curStyle]
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
			// body...
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
		//this.state.plotLayers[this.state.curPack].moveToTop();
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
					//l.sceneCanvas.context.beginPath();
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
		//var canv = document.getElementById(this.props.canvasId)
		var ctx = this.state.axisLayer.sceneCanvas.context//canv.getContext('2d')
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
		//console.log(xcnt)
		ctx.beginPath()
		for(var i=0;i<xcnt;i++){
			ctx.moveTo(((-100)*(i+1)*xfactor - this.state.axis.x[0])/this.state.Xscale, (this.state.axis.r[1])/this.state.Rscale - 5)
			ctx.lineTo(((-100)*(i+1)*xfactor - this.state.axis.x[0])/this.state.Xscale, (this.state.axis.r[1])/this.state.Rscale + 5)
			ctx.moveTo(((100)*(i+1)*xfactor - this.state.axis.x[0])/this.state.Xscale, (this.state.axis.r[1])/this.state.Rscale - 5)
			ctx.lineTo(((100)*(i+1)*xfactor - this.state.axis.x[0])/this.state.Xscale, (this.state.axis.r[1])/this.state.Rscale + 5)
		}
		for(var j = 0; j<ycnt;j++){
			ctx.moveTo(xlim/this.state.Xscale - 5,((-100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.lineTo(xlim/this.state.Xscale + 5,((-100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.moveTo(xlim/this.state.Xscale - 5,((100)*(j+1)*rfactor + rlim)/this.state.Rscale)
			ctx.lineTo(xlim/this.state.Xscale + 5,((100)*(j+1)*rfactor + rlim)/this.state.Rscale)
		}
		ctx.stroke();
		//ctx.moveTo((-100 - this.state.axis.x[0])/this.state.Xscale, (this.state.axis.r[1])/this.state.Rscale - 5)
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
})
ReactDOM.render(<Container/>,document.getElementById('content'))

