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
