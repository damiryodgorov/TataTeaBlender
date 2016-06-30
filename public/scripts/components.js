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
