var MenuStack = React.createClass({
	getInitialState: function(){
		return ({currentView:'MainDisplay', data:[], stack:[], settings:false, attention:"attention", query: '' })
	},
	changeView: function(d){
		var st = this.state.stack;
		st.push([this.state.currentView, data]); //immediate parent will be at top of stack
		console.log(d)
		console.log(st)
		this.setState({currentView:d[0], data:d[1]})
		//console.log(this.props.data)
		//this.setState({data: d, stack: st });
	},
	toggleAttention: function(){

	},
	toggleSettings: function(){
		if(this.state.settings){
			this.goBack();
		}
		else{
			this.setState({settings:true});
			var SettingArray = ['SettingsDisplay',[]]
			this.changeView(SettingArray);
		}

	},
	settingClick:function(s){

		this.changeView(['SettingsDisplay',s]);
	},
	render: function(){
		var display;
		if(this.state.currentView == 'MainDisplay'){
			display = <MainDisplay ws={self.props.ws} ref='md'/>
		}else if(this.state.currentView == 'SettingsDisplay'){
			display = <SettingsDisplay ws={self.props.ws} ref = 'sd' data={this.state.data} onHandleClick={this.settingClick}/>
		}
		return(<div className="menuContainer">
			<table className="menuTable"><tr><td className="buttCell" hidden={!back} ><button className="backButton" onClick={this.goBack}/></td>
			<td><h1>Menu</h1></td>
			<td className="buttCell"><button onClick={this.toggleAttention} className={attention}/></td>
			<td className="buttCell"><button onClick={this.toggleSettings} className="config"/></td></tr></table>
			{display}
			</div>)
	}
})
var SettingsDisplay = React.createClass({
	handleClick: function(d){
		this.props.onHandleClick(d)
	},


	//should take ws as sole prop
	render: function (){
		var data = this.props.data
		var lvl = data.length
		console.log(lvl)
		var nodes;
		 var clis = [];
			for(var c in combinedSettings){
				console.log(c)
				clis.push([c,combinedSettings[c]])
			}
		if(lvl == 0){
			nodes = clis.map(function (item) {
	        console.log(item)
	     //   return(<SettingItem data={item} onItemClick={handler} isHidden={ih}/>)
	      return (
	      	<SettingItem lkey={item[0]} name={item[0]} isHidden={ih} hasChild={false} 
	      	data={item} onItemClick={handler} hasContent={true}/>
	      );
	    });

		}
		return (<div></div>)
	}
})

var SettingItem = React.createClass({
	onItemClick: function(){
		this.onItemClick(this.props.data)
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