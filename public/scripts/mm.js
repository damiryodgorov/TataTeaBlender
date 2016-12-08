var MobileMenu = React.createClass({
	//This display will allow for navigating back to previous pages - 
	getInitialState: function(){
		var mq = window.matchMedia("(min-width: 800px)");

		mq.addListener(this.listenToMq)
		console.log(mq.matches)
	
		return ({modalIsOpen:false, currentView:'MultiScan', data:[], stack:[], dspips:[], curIp:'',curDetName:'', dsps:[],
			settings:false, attention:"attention", query: '' , faults:[], mq:mq, br7:mq.matches, multi:false, 
			units:[{type:'Stealth', name:'Detector1', ip:'192.168.10.3'},{type:'MultiBank', name:'MultiBank 1', ip:['192.168.10.4','192.168.10.5','192.168.10.6','192.168.10.7']}]})
	},
	handleDisplay: function(msg,ip){
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
    		if(this.refs.ms.refs[ip].lv.refs.tb.state.ticks != ((lcd_leds & 0xf)- 5)*50){
    			this.refs.ms.updateMeter(((lcd_leds & 0xf)- 5)*50,ip)
    		}
    		
	},
	handleMsg: function(evt){
		var msg = evt.data
	//	console.log(msg)
		
		if (msg instanceof ArrayBuffer) {
	//			console.log('yes')
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
    		var lcd_leds = dv.getUint8(1);
    //		console.log(lcd_leds)
    		this.refs.lv.update((((lcd_leds & 0xf)- 5)*50))

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
					else if(this.state.currentView == "SettingsDisplay"){
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
		console.log(vdefList)
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
   showMulti:function () {
   	// body...
   	if(this.state.multi){
			var st = [];
			var currentView = 'MainDisplay';
			this.setState({currentView:currentView, stack:[], data:[], multi:false})
   	}else{
   			this.setState({multi:true})
   			this.changeView(['MultiScan', []])
   	}
   
   },
   componentDidMount: function () {
   	// body...
   	var self = this;
   	socket.on('location', function(data){
   		data.forEach(function(d){
   			wSockets[d.ip] = new WebSocket('ws://'+ d.ip + '/panel')
   			wParamSockets[d.ip] = new WebSocket('ws://' +d.ip +'/parameters');
   			wParamSockets[d.ip].binaryType = 'arraybuffer';
   			wParamSockets[d.ip].onmessage = function (e) {
   				// body...
   				self.onParamMsg(e,d)
   			}


			wSockets[d.ip].binaryType = 'arraybuffer'
			wSockets[d.ip].onmessage = function(evt){
				self.onMsg(evt, d)
			}

			wRSockets[d.ip] = new WebSocket('ws://' + d.ip + '/rpc');
			wRSockets[d.ip].binaryType = 'arraybuffer';
			wRSockets[d.ip].onmessage = function(evt){ console.log(evt)}

   		})
   		console.log(data)
   		self.setState({dspips:data})
   	})
   },
   onParamMsg: function (e,d) {
   	if(d.ip == this.state.curIp){
   		var self = this;
   	
   			var msg = e.data;
   	var data = new Uint8Array(msg);
    
   	var dv = new DataView(msg);
	var lcd_type = dv.getUint8(0);
  	      var n = data.length;
   //       console.log('n:' + n);
     //     console.log(lcd_type);
       //   console.log(data);
     	
   	 	//console.log()
   	// console.log(data)
   	if(cnt < 2){
   		console.log(Vdef)
		console.log(isVdefSet)
		cnt++;
   	}

   	 	if(lcd_type== 0){
				//system

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
    						var setting = self.getVal(sysArray,2, p)
    						sysRec[p] = setting;
    					}
    				}
    				sysSettings = sysRec;
    
    			}
			}else if(lcd_type == 1){
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

					//if((this.refs.md.state.productName != prodName)||(this.refs.md.state.sens != sens)){
					//	this.refs.md.setState({productName:prodName, sens:sens})
					//}
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
   	// body...
   },
   onMsg:function (e,d) {
   	// body...
   //	console.log(d)
  // 	console.log(this.state.curIp)

  	if(e.data instanceof ArrayBuffer ){
  		var dv = new DataView(e.data)
  		if(dv.getUint8(0) == 0x1){
  			var lcd_leds = dv.getUint8(1)
  			//display packet
  			if(this.refs.ms){
  				this.refs.ms.updateMeter(((lcd_leds & 0xf)- 5)*50, d.ip)	
  			}
  			
  		}
  	}
   	if(this.state.curIp == d.ip){
   		
   		//console.log('yesese')
   		this.handleMsg(e)
   	}
   		 

   },
   switchUnit:function (u) {
   	// body...
   	this.setState({curIp:u.ip, curDetName:u.name})
   },
   addUnit: function (argument) {
   	// body...
   },
   addMBUnit: function (argument) {
   	// body...
   },
   returnHome: function () {
   	// body...
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
			display = 	<MainView ws={this.props.ws} ref='mv'/>
		}else if(this.state.currentView == 'SettingsDisplay'){
			display = <SettingsDisplay goBack={this.goBack} ws={this.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick} dsp={this.state.curIp}/>
		}else if(this.state.currentView == 'MultiScan'){
			console.log('multiscan should rerender')
			console.log(this.state.dspips)
			display = <MultiScan SwitchUnit={this.switchUnit} ref='ms' data={this.state.dspips}/>
		}
		var panel = <Panel ws={this.props.ws} ref={'pn'}/>;
		var faults = this.state.faults.map(function(f){
			return <FaultItem data={f}/>
		})
		var menuString = 'Stealth'
		var config = 'config'
		var burger = 'burger'
		if(this.state.currentView == 'SettingsDisplay'){
			menuString = 'Settings'
			config = 'config_active'
		}else if(this.state.currentView == 'MultiScan'){
			menuString = 'MultiBank'
			burger = 'burger_active'
		}
		var addUnit = (<button onClick={this.addUnit}>Add Unit</button>);
		var addMBUnit = (<button onClick={this.addMBUnit}>Add MB Unit</button>);
		var stealths = [];
		var mbs = []
		var unitsTesting = this.state.units.map(function (u) {
			if(u.type == 'Stealth'){
				stealths.push(u.ip)
			}else{
				mbs.push(u)
			}
			// body...
		})
		var multbanks = mbs.map(function (mb) {
			return <MultiBankUnit name={mb.name} data={mb.ip}/>
			// body...
		})
		if (!this.state.br7){


		return(<div className="menuContainer">
			<table className="menuTable"><tbody><tr><td className="buttCell" hidden={true} ><button className="backButton" onClick={this.goBack}/></td>
			<td onClick={this.returnHome}><img className='logo' src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className={config}/></td>
			<td className="buttCell"><button onClick={this.showMulti} className={burger}/></td>
			
			</tr></tbody></table>
			<Modal
          ref={'faultModal'} >

          <h2 ref="subtitle">Faults</h2>
          <button onClick={this.closeModal}>close</button>
          <div>Current Faults</div>
       		{faults}
        </Modal>
        	<LiveView ref='lv'/>
        	{display}

        	<ProductEditor products={products}/>
        	{multbanks}
     		<MultiBankUnit name={'MultiBankUnit'} data={[]}/>
			</div>)
		}else{
			return (<div className="menuContainer">
			<table className="menuTable"><tbody><tr><td className="buttCell" hidden={true} ><button className="backButton" onClick={this.goBack}/></td>
			<td onClick={this.returnHome}><img className='logo' src='assets/NewFortressTechnologyLogo-BLK-trans.png'/></td><td className='mobCell'><MobLiveBar ref='lv'/></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className={config}/></td>
				<td className="buttCell"><button onClick={this.showMulti} className={burger}/></td>
		</tr></tbody></table>
			<div><label>Detector Ip:</label><label>{this.state.curIp}</label></div>
			<div><label>Detector Name:</label><label>{this.state.curDetName}</label></div>

			<Modal
          ref={'faultModal'} >

          <h2 ref="subtitle">Faults</h2>
          <button onClick={this.closeModal}>close</button>
          <div>Current Faults</div>
       		{faults}
        </Modal>
        <Modal ref='addUnitModal'>
        </Modal>
        <Modal ref='addMBUnitModal'>
        </Modal>
        
        	{display}
        	<ProductEditor products={products}/>
        	{multbanks}
        	<MultiBankUnit name={'MultiBankUnit'} data={[]}/>
     		</div>)
		}
	}

})