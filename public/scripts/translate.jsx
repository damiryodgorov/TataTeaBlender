const React = require('react');
const ReactDOM = require('react-dom');

const vdefMapV2 = require('./vdefmap.json')
import {Modal} from './components.jsx'
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
const FastZoom = cssTransition({ 
	enter: 'zoomIn',
  exit: 'zoomOut',
  duration: 300  
})
//var vmap = JSON.parse(JSON.stringify(vdefMapV2));

class Container extends React.Component{
	constructor(props){
		super(props)
		this.state = {vmap:JSON.parse(JSON.stringify(vdefMapV2))}
		this.prams = React.createRef();
		this.download = this.download.bind(this);
		this.uploadParams = this.uploadParams.bind(this);
		this.uploadCats = this.uploadCats.bind(this);
		this.save = this.save.bind(this);
		this.saveModal = React.createRef();
		this.prams = React.createRef();	
		this.cats = React.createRef();
	}
	parse(vmapstr){
		this.setState(JSON.parse(vmapstr))
	}
	download(){
		this.prams.current.download();
		this.cats.current.download();
	}
	uploadParams(params){
		var vmap = JSON.parse(JSON.stringify(this.state.vmap))
		vmap['@vMap'] = params;
		toast('ready to download')
		this.setState({vmap:vmap})

	}
	uploadCats(params){
		var vmap = JSON.parse(JSON.stringify(this.state.vmap))
		vmap['@catmap'] = params;
		toast('ready to download')
		this.setState({vmap:vmap})

	}
	save(){
		this.saveModal.current.toggle()
	}
	render(){
		return <div style={{width:'100%'}}>
			<div style={{textAlign:'center', fontSize:32, marginBottom:10}}>
				Menu Translator for Checkweigher and Metal Detector
			<div style={{fontSize:24}}><button onClick={this.download}>Prepare download</button>
				<button onClick={this.save}>Save File</button></div>
			</div>
			<Parameters upload={this.uploadParams} ref={this.prams} prams={this.state.vmap['@vMap']}/>
			<Categories upload={this.uploadCats} ref={this.cats} cats={this.state.vmap['@catmap']}/>
			<Modal innerStyle={{background:'#e1e1e1'}} ref={this.saveModal}>
			<label>Copy and Paste the following to a text editor</label>
				<textarea name="paragraph_text" cols="100" rows="10">
					{JSON.stringify(this.state.vmap)}
				</textarea>
			</Modal>
							<ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
			pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
		</div>
	}
}
class Parameters extends React.Component{
	constructor(props){
		super(props)
		this.state = {prams:this.props.prams, collapsed:false}
		this.download = this.download.bind(this);
		for(var p in this.props.prams){
			this[p] = React.createRef();
		}
		
	}
	componentWillReceiveProps(newProps){
		this.setState({prams:newProps.prams})
	}
	download(){
		var params = this.state.prams
		for(var p in this.state.prams){
			params[p] = this[p].current.state.pram
		}
		this.props.upload(params)
	}
	render(){
		var prams = []
		for(var p in this.state.prams){
			prams.push(<Pram ref={this[p]} pram={this.state.prams[p]} name={p}/>);
		}

		return <div style={{width:'100%'}}>
		<div>Parameters <button onClick={()=>this.setState({collapsed:!this.state.collapsed})}>Collapse/Expand</button> </div>
		<div hidden={this.state.collapsed}>
		{prams}</div></div>
	}
}
class Pram extends React.Component{
	constructor(props){
		super(props)
		this.state = {pram:this.props.pram}
		this.onNameChange = this.onNameChange.bind(this);
		this.onDescChange = this.onDescChange.bind(this);
		for(var l in this.props.pram['@translations']){
			this[l] = React.createRef();
		}
	}
	componentWillReceiveProps(newProps){
		if(JSON.stringify(this.state.pram) != JSON.stringify(newProps.pram)){
			this.setState({pram:newProps.pram})
		}
	}
	onNameChange(v,l){
		console.log(v)
		var pram = this.state.pram;

		pram['@translations'][l]['name'] = v;
		this.setState({pram:pram})
	}
	onDescChange(v,l){
		var pram = this.state.pram;
		pram['@translations'][l]['description'] = v;
		this.setState({pram:pram})
	}
	render(){
		var inputs = []
		var languages = []
		for(var l in this.props.pram['@translations']){
			languages.push(l)
		}
		var self = this;
		inputs = languages.map(function (lang) {
			// body...
			return(<div style={{display:'inline-block',fontSize:17,margin:3}}><div>{lang}</div>
				<div><div style={{display:'inline-block',width:100}}>
					name:</div><input type="text" onChange={(e)=>self.onNameChange(e.target.value,lang)} value={self.state.pram['@translations'][lang]['name']}/>
				</div>
				<div><div style={{display:'inline-block',width:100}}>
					description: </div><input type="text" onChange={(e)=>self.onDescChange(e.target.value,lang)} value={self.state.pram['@translations'][lang]['description']}/>
				</div>
				</div>)
		});
		return <div style={{marginTop:10}}>
			<div>{this.props.name}</div>
			{inputs}
		</div>
	}
}
class Categories extends React.Component{
	constructor(props){
		super(props)
		this.state = {cats:this.props.cats, collapsed:true}
		for(var p in this.props.cats){
			this[p] = React.createRef();
		}
		
	}
	componentWillReceiveProps(newProps){
		this.setState({cats:newProps.cats})
	}
	download(){
		var params = this.state.cats
		for(var p in this.state.cats){
			params[p] = this[p].current.state.cat
		}
		this.props.upload(params)
	}
	render(){
		var cats = [];
		for(var c in this.state.cats){
			cats.push(<Cat ref={this[c]} name={c} cat={this.state.cats[c]}/>)
		}
		return <div>
			<div>Categories  <button onClick={()=>this.setState({collapsed:!this.state.collapsed})}>Collapse/Expand</button></div>
			<div hidden={this.state.collapsed}>{cats}</div>
		</div>
	}
}
class Cat extends React.Component{
	constructor(props){
		super(props);
		this.onNameChange = this.onNameChange.bind(this);
		this.state = {cat:this.props.cat}
	}
	onNameChange(v,l){
		var pram = this.state.cat;
		pram['@translations'][l] = v;
		this.setState({cat:pram})
	}
	render(){
		var inputs = []
		var languages = []
		for(var l in this.props.cat['@translations']){
			languages.push(l)
		}
		var self = this;
		inputs = languages.map(function (lang) {
			// body...
			return(<div style={{display:'inline-block',fontSize:17,margin:3}}><div>{lang}</div>
				<div><input type="text" onChange={(e)=>self.onNameChange(e.target.value,lang)} value={self.state.cat['@translations'][lang]}/>
				</div>
				</div>)
		});
		return <div style={{marginTop:10}}>
			<div>{this.props.name}</div>
			{inputs}
		</div>
	}
}
ReactDOM.render(<Container/>,document.getElementById('content'))