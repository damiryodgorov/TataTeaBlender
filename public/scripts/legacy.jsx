class InterceptorDynamicViewV2 extends React.Component{
	constructor(props) {
		super(props)
		this.state = {peaka:0,peakb:0, cipSec:0}
		this.update = this.update.bind(this)
		this.onSens = this.onSens.bind(this)
		this.onSensB = this.onSensB.bind(this);
		this.onSigA = this.onSigA.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onRej = this.onRej.bind(this);
		this.onDeny = this.onDeny.bind(this);
		this.updatePeak = this.updatePeak.bind(this);
	}
	setCipSec(sec){
		if(sec != 0){
				if(this.state.cipSec == 0){
					this.setState({cipSec:1})
				}
			}else{
				if(this.state.cipSec == 1){
					this.setState({cipSec:0})
				}
			}
	}
	update (siga, sigb) {
		this.refs.tba.update(siga)
		this.refs.tbb.update(sigb)
	}
	updatePeak(a,b){
		if((this.state.peaka != a)||(this.state.peakb != b)){
			this.setState({peaka:a, peakb:b})
		}
	}
	onSens (e) {
		this.props.onSens(e, 'Sens_A')
	}
	onSensB(e){
		this.props.onSens(e, 'Sens_B')
	}
	onSigA () {
		this.props.onButton('sig_a')
	}
	onSigB () {
		this.props.onButton('sig_b')
	}
	onRej () {
		this.props.onButton('rej')
	}
	onDeny(){
		this.props.onDeny()
	}
	render () {
		var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		var klass = 'interceptorDynamicView'
		var bcolor = 'black';
		var pled = ['#e1e1e1', '#6eed6e', '#ee0000']
		if(this.props.faultArray.length >0){
			if(this.props.faultArray.length > this.props.warningArray.length){

			}else{
				//warning should look different?
			}
			klass = 'interceptorDynamicView_f'
		}else if(this.props.rejOn == 1){
			klass = 'interceptorDynamicView_r'
		}else if(this.props.testReq == 1){
			klass = 'interceptorDynamicView_t'
		}else if(this.props.testReq == 2){
			klass = 'interceptorDynamicView_tf'
		}
		if(this.state.cipSec == 1){
			klass = 'interceptorDynamicView_tf'
		}
		// accessControl
		var sensacc = (this.props.sys['PassAccSens'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 2); //	(vdefByMac[this.props.mac][7]['SensEdit'].indexOf(0) != -1) || (vdefByMac[this.props.mac][7]['SensEdit'].indexOf(this.props.level) != -1)||(this.props.level > 2)
		var rejacc = (this.props.sys['PassAccClrRej'] <= this.props.level)||(this.props.sys['PassOn'] == 0)||(this.props.level > 2);
		return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'linear-gradient(55deg,#818a90, #818a90 49.9%, #362c66 50.1%, #362c66)'}}><tbody>
				<tr><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:26}}></div></td>
				<td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:615}}>
				<div style={{paddingRight:10, paddingTop:5, paddingBottom:5, display:'block', width:511,marginLeft:70,paddingLeft:20}}><TickerBox ref='tbb'/>
				</div></td></tr>
				
				<tr>
				<td style={{padding:0, height:180, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:180}}>
					<label style={{float:'left',fontSize:28,marginTop:56, marginLeft:10,marginRight:-34}}>A</label>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}>
					<KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' A'} num={true} isEditable={false} value={this.props.sens[0]} onClick={() => this.props.onButton('sens')} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} overrideBG={true} rstyle={{backgroundColor:pled[this.props.pleds[0]]}} bgColor={'rgba(200,200,200,1)'} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' A'} onClick={this.onSigA} isEditable={false} value={this.state.peaka} inverted={false}/></div>
					
				</div>
				</td>
				<td style={{padding:0, height:180, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:180}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:48}}><div><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:180, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:180}}>
					<label style={{float:'right',fontSize:28,color:"#e1e1e1", marginTop:56, marginLeft:-34, marginRight:10}}>B</label>
					<div style={{position:'relative', marginTop:0, marginBottom:-7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language}  acc={sensacc} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Sensitivity'][this.props.language]['name']} lab2={' B'} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} num={true} onClick={() => this.props.onButton('sens')} isEditable={false} value={this.props.sens[1]} onInput={this.onSensB} inverted={true}/></div>
					<div style={{position:'relative',marginBottom:7}}><KeyboardInputTextButton onDeny={this.onDeny} language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds[1]]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={' B'} onClick={this.onSigB} isEditable={false} value={this.state.peakb} inverted={true}/></div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={2} style={{padding:0,display:'inline-block',overflow:'hidden', width:615}}><div style={{paddingLeft:10, paddingTop:5, paddingBottom:5, display:'block', width:511,marginLeft:-7,paddingLeft:20}}><TickerBox ref='tba'/></div></td><td style={{display:'inline-block', padding:0,width:336,overflow:'hidden'}}><div style={{width:356,height:26}}></div></td></tr>
				</tbody></table>
				
				</div>
				</div>)
	}
}

class InterceptorSensitivityUI extends React.Component{
	constructor(props){
		super(props);
		this.onSensA = this.onSensA.bind(this);
		this.onSensB = this.onSensB.bind(this);
	}
	onSensA(sens){
		this.props.onSens(sens,'Sens_A');
	}
	onSensB(sens){
		this.props.onSens(sens,'Sens_B')
	}
	render(){
		return <div style={{ overflow: 'hidden',borderRadius: 20, border: '8px solid #818a90',boxShadow: '0 0 14px black'}}>
		<table style={{borderSpacing:0}}>
			<tbody><tr>
					<td style={{width:340, background:'#818a90', textAlign:'center'}}>
						<div style={{marginTop:15}}>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel A'][this.props.language]['name']} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensA} onInput={this.onSensA} inverted={false} /></div>
						</td>
					<td  style={{width:220,textAlign:'center', background:'linear-gradient(55deg, #818a90, #818a90 49.9%,#362c66 50.1%, #362c66)'}}></td>
					<td  style={{width:340, textAlign:'center', background:'#362c66'}}>
						<div style={{marginTop:15}}>
						<KeyboardInputTextButton language={this.props.language} tooltip={vMapV2['Sens_A']['@translations'][this.props.language]['description']} label={vdefMapV2['@labels']['Channel B'][this.props.language]['name']}  onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.props.sensB} onInput={this.onSensB} inverted={true}/></div>
					</td>
				
			</tr></tbody>
		</table>
		</div>
	}

}

class StealthNav extends React.Component{
	constructor(props) {
		super(props)
		this.onConfig = this.onConfig.bind(this);
		this.onTest = this.onTest.bind(this);
		this.onLog = this.onLog.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onProd = this.onProd.bind(this);
		this.streamTo = this.streamTo.bind(this);
	}
	onConfig () {
		this.props.onButton('config')
	}
	onTest () {
		this.props.onButton('test')
	}
	onLog () {
		this.props.onButton('log')
	}
	onSens () {
		this.props.onButton('sens')
	}
	onCal () {
		this.props.onButton('cal')
	}
	onProd () {
		this.props.onButton('prod')
	}
	streamTo (dat) {
		this.refs.sg.stream(dat);
	}
	render () {
		return (<div className='interceptorNav' style={{display:'block', width:930, marginLeft:'auto',marginRight:'auto', background:'black'}}>
				
				<div style={{overflow:'hidden',width:930,height:250}}>
				<table className='intNavTable' style={{height:240, borderSpacing:0, borderCollapse:'collapse'}}><tbody><tr>
				<td>
				<div className='slantedRight'>
					<div style={{background:'#362c66', borderTopRightRadius:'30px 40px', height:240, textAlign:'center'}}>
					<CircularButton lab={'Config'} onClick={this.onConfig}/>
					<CircularButton lab={'Test'} onClick={this.onTest}/>
					<CircularButton lab={'Log'} onClick={this.onLog}/>
					</div>
				</div>
				</td><td>
				<div style={{display:'inline-block', width:430, height:220, borderBottom:'20px solid #818a90',position:'relative', borderBottomLeftRadius:'100px 402px', borderBottomRightRadius:'100px 402px'}}>
						
				
				<StealthNavContent ref='nv' prodName={this.props.prodName}><DummyGraph int={false} ref='sg' canvasId={'sgcanvas2'}/>	</StealthNavContent>
				</div></td><td>
				<div className='slantedLeft'><div style={{background:'#362c66', borderTopLeftRadius:'30px 40px', height:240, textAlign:'center'}}>
				<CircularButton lab={'Sensitivity'} inverted={true} onClick={this.onSens}/>
				<CircularButton lab={'Learn'} inverted={true} onClick={this.onCal}/>
				<CircularButton lab={'Product'} inverted={true} onClick={this.onProd}/>
				</div>	</div></td></tr></tbody></table></div>
			</div>)
	}
}
class StealthNavContent extends React.Component{
	constructor(props) {
		super(props)
		this.state = {prodName:'PRODUCT 1'}
	}
	stream (dat) {
	}
	render () {
		var style = {width:345,height:220,background:'rgb(225,225,225)',marginLeft:'auto',marginRight:'auto'}
		var wrapper = {width:480, height:230, marginTop: -20,marginLeft:-20}
		return (<div className='interceptorNavContent' style={wrapper}>
			<table className='noPadding'>
				<tbody>
				<tr><td>
				{this.props.children}
				
				</td></tr>
				</tbody>
			</table>
				</div>)
	}
}
class StealthMainPageUI extends React.Component{
	constructor(props) {
		super(props)
		// body...
		var res = vdefByMac[this.props.det.mac]
		var pVdef = _pVdef;
		if(res){
			pVdef = res[1];

		}
		var res = null;
		this.state ({rpeak:0,xpeak:0,peak:0,phase:0,rej:0, sysRec:{},prodRec:{},tmp:'',prodList:[],phaseFast:0,pVdef:pVdef})
				this.keyboardOpen = this.keyboardOpen.bind(this);
		this.keyboardClose = this.keyboardClose.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onButton = this.onButton.bind(this);
		this.clearRej = this.clearRej.bind(this);
		this.switchProd = this.switchProd.bind(this);
		this.clearPeak = this.clearPeak.bind(this);
		this.sendPacket = this.sendPacket.bind(this);
		this.parseInfo = this.parseInfo.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.calibrate = this.calibrate.bind(this);
		this.setTest = this.setTest.bind(this);
		this.updateTmp = this.updateTmp.bind(this);
		this.submitTmpSns = this.submitTmpSns.bind(this);
		this.refresh = this.refresh.bind(this);
		this.gohome = this.gohome.bind(this);
		this.setProdList = this.setProdList.bind(this);
		this.getProdName = this.getProdName.bind(this);
		this.prodFocus = this.prodFocus.bind(this);
		this.prodClose = this.prodClose.bind(this);
		this.changeProdEditMode = this.changeProdEditMode.bind(this);
		this.copyCurrentProd = this.copyCurrentProd.bind(this);
		this.deleteProd = this.deleteProd.bind(this);
		this.editName = this.editName.bind(this);
	}
	sendPacket (n,v) {
		//
		this.props.sendPacket(n,v)
	}
	parseInfo(sys, prd){
		if(isDiff(sys,this.state.sysRec)||isDiff(prd,this.state.prodRec)){
			this.setState({sysRec:sys, prodRec:prd, tmp:prd['Sens']})
		}
	}
	componentDidMount(){
		var self = this;
		this.sendPacket('refresh','')
		socket.on('prodNames', function (pack) {
			// body...
			//////console.log(['5369', pack])
			if(self.props.det.ip == pack.ip){
				self.setState({prodList:pack.list, prodNames:pack.names})
			}
		})
	}
	clearRej () {
		var param = this.state.pVdef[2]['RejCount']
		this.props.clear(param )
	}
	switchProd (p) {
		//
		this.props.sendPacket('ProdNo',p)
	}
	clearPeak () {
		var p = 'Peak'
		
		var param = this.state.pVdef[2][p]
		this.props.clear(param) 
	}
	update (sig) {
		var dat = {t:Date.now(),val:sig}
		this.refs.nv.streamTo(dat)
		this.refs.dv.update(sig)
	}
	refresh () {
		//
		this.props.sendPacket('refresh')
	}
	cancel () {
		this.refs.sensEdit.toggle()
		this.setState({tmp:''})
	}
	showEditor () {

		var self = this;
		this.refs.pedit.toggle()
		setTimeout(function () {
			// body...
			self.setState({peditMode:false})
			socket.emit('getProdList', self.props.det.ip)
		//	self.props.sendPacket('getProdList')
		},100)		
	}
	calibrate () {
		//
		this.refs.calibModal.toggle()
	}
	_handleKeyPress (e) {
		if(e.key === 'Enter'){
			this.submitTmpSns();
		}
	}
	sensFocus(){
		//
		this.refs.sensEdit.setState({override:true})
	}
	sensClose(){
		//
		var self = this;
		setTimeout(function(){
			self.refs.sensEdit.setState({override:false})	
		}, 100)
	}
	gohome () {
		//
		this.props.gohome();
	}
	toggleNetpoll () {
		//
		this.refs.netpolls.toggle();
	}
	onButton (f) {
			
		if(f == 'test'){
			if(typeof this.state.prodRec['TestMode'] != 'undefined'){
			if(this.state.prodRec['TestMode'] != 0){
				this.props.sendPacket('test', this.state.prodRec['TestMode'] - 1)
			}else{
				//this.toggleTestModal()
				this.props.toggleTestModal();
			}
			
		}	
		}else if(f == 'log'){
			this.toggleNetpoll();
		}else if(f == 'config'){
			this.props.toggleConfig();
		}else if(f == 'prod'){
			this.showEditor();
		}else if(f == 'cal'){
			this.props.toggleCalib();
		}else if(f=='sig'){
			this.clearPeak();
		}else if(f=='rej'){
			this.clearRej();
		}else if(f=='sens'){
			this.props.toggleSens();
		}
	}
	onSens (e,s) {
		this.props.sendPacket(s,e);
	}
	setProdList (prodList) {
		var self = this;
		this.setState({prodList:prodList, curInd:0})
		setTimeout(function () {
			self.getProdName(prodList[0],self.setProdName,0)

		},100)
	}
	getProdName (p,cb,i) {
		this.props.getProdName(p,cb,i)
	}
	setProdName (name, ind) {
		var sa = []
		name.slice(3,23).forEach(function (i) {
			sa.push(i)
		})
		var self = this;
		var str = sa.map(function(ch){
			return String.fromCharCode(ch)
		}).join("").replace("\u0000","").trim();
		//////console.log(['5888',str])
		var prodNames = this.state.prodNames;
		prodNames[ind] = str
		if(ind + 1 < this.state.prodList.length){
			var i = self.state.prodList[ind+1]
			self.setState({prodNames:prodNames})
			setTimeout(function () {
				self.getProdName(i, self.setProdName, ind+1)
				
			},100)
			
		}else{
			this.setState({prodNames:prodNames})
		}
	}
	prodFocus(){
		this.refs.pedit.setState({override:true})
	}
	prodClose(){
		var self = this;
		setTimeout(function(){
			self.refs.pedit.setState({override:false})	
		}, 100)
	}
	changeProdEditMode () {
		this.setState({peditMode:!this.state.peditMode})
	}
	copyCurrentProd () {
		var nextNum = this.state.prodList[this.state.prodList.length - 1] + 1;
		this.sendPacket('copyCurrentProd', nextNum);
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	deleteProd (p) {
		this.sendPacket('deleteProd',p)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	editName (name) {
		this.sendPacket('ProdName',name)
		var self = this;
		setTimeout(function (argument) {
			socket.emit('getProdList', self.props.det.ip)
		},100)
	}
	defaultSave(){
		this.sendPacket('DefaultSave')
	}
	defaultRestore(){
		this.sendPacket('DefaultRestore')
	}
	onCalFocus () {
		this.refs.calibModal.setState({override:true})
	}
	onCalClose () {
		var self = this;
		setTimeout(function () {
			// body...
				self.refs.calibModal.setState({override:false})
		},100)
	
	}
	render () {
		// body...
		var home = 'home'
		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		var lstyle = {height: 50,marginRight: 20, marginLeft:10}
		var self = this;
		var prodNames = this.state.prodNames
		//////console.log(this.state.prodList.chunk(8))
		var prodList = this.state.prodList.map(function(p, i){
			var sel = false
			if(p==self.state.sysRec['ProdNo']){
				sel = true;
			}
			var name = ""
			if(typeof prodNames[i] != 'undefined'){
				name = prodNames[i]
			}
			return (<ProductItem onFocus={self.prodFocus} onRequestClose={self.prodClose} selected={sel} p={p} name={name} editName={self.editName} editMode={self.state.peditMode} copy={self.copyCurrentProd} delete={self.deleteProd} switchProd={self.switchProd}/>)
		})
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = lgs[this.props.language]
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
			//default to english
		}
		
		var ps = this.state.pVdef[6]['PhaseSpeed']['english'][this.state.prodRec['PhaseSpeed']]
		if(this.state.phaseFast == 1){
			ps = 'fast'
		}
			var peditCont = (<div>
				<div><button style={{float:'right'}} className='editButton' onClick={this.changeProdEditMode}>Edit Products</button></div>
				<div style={{display:'inline-block', width:600, maxHeight:400, overflowY:'scroll'}}>{prodList}</div><div style={{float:'right'}}></div>
			</div>)
		return(<div className='stealthMainPageUI' style={style}>
			<table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
						<tbody>
							<tr>
								<td><img style={lstyle}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td>
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
							</tr>
						</tbody>
					</table>
			<StealthDynamicView language={lg} onButton={this.onButton} onSens={this.onSens} ref='dv' prodName={this.state.prodRec['ProdName']} sens={[this.state.prodRec['Sens']]} sig={[this.state.peak]} rej={this.state.rej}/>
			<StealthNav language={lg} onButton={this.onButton} ref='nv' prodName={this.state.prodRec['ProdName']}/>
			<Modal ref='testModal'>
					<TestReq mobile={this.props.mobile}  ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal ref='pedit'>
				{peditCont}
				</Modal>
				<Modal ref='netpolls'>
					<NetPollView ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip} mac={this.props.det.mac}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
			</div>)
	}
}
class StealthDynamicView extends React.Component{
	constructor(props) {
		super(props)
		this.update = this.update.bind(this);
		this.onSens = this.onSens.bind(this);
		this.onSig = this.onSig.bind(this);
		this.onRej = this.onRej.bind(this);
	}
	update (sig) {
		this.refs.tb.update(sig)
	}
	onSens (e) {
		this.props.onSens(e, 'Sens')
	}
	onSig () {
		this.props.onButton('sig')
	}
	onRej () {
		this.props.onButton('rej')
	}
	render () {
			var labstyleb = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'start'}
			var centerLab = {textAlign:'center', marginRight:'auto', marginLeft:'auto', color:"#000"}
		var labstylea = {width:60, display:'inline-block',position:'relative',top:-20, color:'rgb(225,225,225)', textAlign:'end'}
		var contb = {position:'relative', display:'inline-block'} 
		var conta = {position:'relative', display: 'inline-block'}
		return(
			<div style={{marginTop:2}}>
			<div style={{padding:10, borderRadius:20, border:'5px black solid', display:'block', width:940, marginLeft:'auto',marginRight:'auto',background:'rgb(225,225,225)', boxShadow:'0px 0px 0px 10px #818a90'}}>
			<div className='stealthDynamicView'  style={{overflow:'hidden', display:'block', width:940,height:232, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:10, border:'2px solid black'}}>
			<div style={{background:'#818a90', height:232}}>
				<div><TickerBox ref='tb'/></div>
						<table style={{marginLeft:'auto', marginRight:'auto', marginTop:5}}><tbody><tr><td style={{borderColor:'#e1e1e1',borderStyle:'solid',borderWidth:10,borderRadius:20,height:75,background:'#818a90', width:330}}>
						
						<div style={{display:'block', height:34, width:470}}>{vdefMapV2['@labels']['Running Product']['@translations'][this.props.language]['name']}</div>
				<div style={{display:'block', height:34, width:470, fontSize:24}}>{this.props.prodName}</div>

				</td></tr> 
				</tbody></table>
				<div><div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Sensitivity</div><div ><KeyboardInputButton num={true} isEditable={true} value={this.props.sens[0]} onInput={this.onSens} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3, marginBottom:7}}><div style={centerLab} >Signal</div><div ><KeyboardInputButton onClick={this.onSig} isEditable={false} value={this.props.sig[0]} inverted={false}/></div></div>
				
				</div>
				<div style={{display:'inline-block'}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:3}}><div style={centerLab}>Reject</div><div><KeyboardInputButton  isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div></div>
				
				</div></div>

			</div>
			</div>
			</div>
			</div>)
	}
}
class StealthCalibrateUI extends React.Component{
	constructor(props) {
		super(props)
		this.state = ({phaseSpeed:0,phase:0,phaseMode:0, tmpStr:'' })
		this.onCalA = this.onCalA.bind(this);
		this.onPhaseA = this.onPhaseA.bind(this);
		this.onModeA = this.onModeA.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	componentWillReceiveProps (newProps) {
		// body...
	}
	onCalA () {
		// body...
		this.props.calib()
	}
	onPhaseA (p) {
		// body...
		this.props.sendPacket('phaseEdit',p)
	}
	onModeA (m) {
		this.props.sendPacket('phaseMode',parseInt(m.target.value))
	}
	onFocus () {
		this.props.onFocus();
	}
	onRequestClose () {
		this.props.onRequestClose();
	}
	render () {
		var ls = {display:'inline-block', width:120}
		var self = this;
		var modes = ['dry','wet','DSA']
		var colors = ['#c8c8c8',"#c8c800","#00c8c8", "#0000c8"]


		var opsA = modes.map(function (m,i) {
			// body...
			if(self.state.phaseMode == i){
				return <option value={i} selected>{m}</option>
			}else{
				return <option value={i}>{m}</option>
			}
		})
	
		return	<div>
		<table style={{borderSpacing:0}}>
			<tbody>
				<tr>
					<td style={{width:880, background:'#818a90', textAlign:'center'}}>
						<div><KeyboardInputButton language={this.props.language} onFocus={this.onFocus} onRequestClose={this.onRequestClose} num={true} isEditable={true} value={this.state.phase} onInput={this.onPhaseA} inverted={false} bgColor={colors[this.state.phaseSpeed]} overrideBG={true}/></div>
						<div hidden><div className='customSelect' style={{width:150}}><select onChange={this.onModeA}>{opsA}</select></div></div>
				
						<div><CircularButton lab={'Calibrate'} isTransparent={true} inverted={false} onClick={this.onCalA}/></div>
					</td>
					
				</tr>
			</tbody>
		</table>
			
		</div>
		
	}
}
class KeyboardInputButton extends React.Component{
	constructor(props) {
		super(props)
		this.editValue = this.editValue.bind(this)
		this.onInput = this.onInput.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onRequestClose = this.onRequestClose.bind(this);
	}
	onInput (e) {
		// body...
		this.props.onInput(e)
	}
	onFocus () {
		// body...
		if(this.props.onFocus){
			this.props.onFocus()
		}
	}
	onRequestClose () {
		// body...
		if(this.props.onRequestClose){
			this.props.onRequestClose();
		}
	}
	editValue () {
		// body...
		var self = this;
		if(this.props.isEditable){
			setTimeout(function () {
				// body...
				self.refs.input.toggle()
			},100)
			
		}else{
			this.props.onClick()
		}
		
	}
	render () {
		// body...

		var bgColor='rgba(200,200,200,1)'
		var rstyle = {}
	
		if(this.props.overrideBG){
			bgColor = this.props.bgColor
			rstyle = this.props.rstyle || {}
		}
		var boxShadow = '0px 0px 0px 50px '+bgColor
		var ckb = <CustomKeyboard language={this.props.language} ref='input' onRequestClose={this.onRequestClose} onFocus={this.onFocus} num={this.props.num} onChange={this.onInput} value={this.props.value} label={this.props.value}/>
		
		var	kb = <label style={{fontSize:25, textAlign:'center', width:100, display:'inline-block', lineHeight:2}} onClick={this.editValue}>{this.props.value}</label>
		
		if(this.props.inverted){
		var before = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:0,backgroundColor:bgColor,borderRadius:30, height:50}
		var after = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:126,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:50, height:50}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2}
   		return(<div className='keyboardInputButton' >
			<div className='round-bg' style={rstyle}>

				<div className='pbContain' style={{left:10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
				<div className='pbDiv' style={{position:'relative', paddingRight:5}}>
				<button className='playButtonInv' onClick={this.editValue}/>
				</div>
				</div>
				{ckb}
				</div>)
		}else{


		var after = {position: 'absolute',height:'100%',display: 'inline-block',top:0,width:44,left:94,backgroundColor:bgColor,borderRadius:30, height:50}
		var before = {position:'absolute',height:'100%',display:'inline-block',top:0,width:44,left:-32,backgroundColor:'transparent',boxShadow:boxShadow,  borderRadius:30, height:50}
		var contStyle= {display:'inline-block',width:100,position:'absolute',left:20,overflow:'hidden', height:50, backgroundColor:bgColor, zIndex:2}
  		return(<div className='keyboardInputButton'>
			<div className='round-bg' style={rstyle}>
				<div className='pbDiv'  style={{paddingLeft:5}}>
				<button className='playButton' onClick={this.editValue}/>
				</div>
				<div className='pbContain' style={{left:-10}}>
				<div style={before}/>
				<div style={contStyle}>{kb}</div>
				<div style={after}/>
				</div>
			</div>
			{ckb}
			</div>)
		}
	}
}
class InterceptorMeterBar extends React.Component{
	constructor(props) {
		super(props)
		this.state =  ({sig:0,sigB:0})
		this.update = this.update.bind(this);
		this.onSigB = this.onSigB.bind(this);
		this.onSigA = this.onSigA.bind(this);
	}
	update (a,b) {
		this.refs.tba.update(a);
		this.refs.tbb.update(b)
	}
	onSigB () {
		this.props.clear(0)
	}
	onSigA () {
		this.props.clear(1)
	}
	render () {
		// body...
		var tbstyle = {display:'inline-block', width:333, padding:5}
		return(<div style={{background: 'linear-gradient(75deg, rgb(129, 138, 144), rgb(129, 138, 144) 49.9%,rgb(54, 44, 102) 50.1%, rgb(54, 44, 102))', borderRadius:15,border:'5px solid #818a90', boxShadow:'0 0 14px black', marginBottom:3}}><div style={{display:'inline-block'}}>
			<div className='intmetSig' style={{color:'black'}} onClick={this.onSigA}>{this.state.sig}</div></div><div style={tbstyle}><TickerBox ref='tba'/></div>
				<div style={{display:'inline-block', width:19}}></div>
				<div style={tbstyle}><TickerBox ref='tbb'/>
				</div>
				<div style={{display:'inline-block'}}><div className='intmetSig' style={{color:'#eee'}} onClick={this.onSigB}>{this.state.sigB}</div></div>
				
				</div>)
	}
}