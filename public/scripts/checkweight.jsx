const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
var SmoothieChart = require('./smoothie.js').SmoothieChart;
var TimeSeries = require('./smoothie.js').TimeSeries;
import {TickerBox, CanvasElem, SlimGraph, DummyGraph, Modal,GraphModal, AuthfailModal, MessageModal, AlertModal, MessageConsole, ScrollArrow} from './components.jsx'
import {CircularButton, ButtonWrapper, CustomAlertButton, CustomAlertClassedButton} from './buttons.jsx'
import {PopoutWheel} from './popwheel.jsx'
import {CustomKeyboard, KeyboardInputTextButton} from './keyboard.jsx'
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {css} from 'glamor'
import {XYPlot,MarkSeries, LabelSeries, XAxis, YAxis,VerticalGridLines, HorizontalGridLines, LineSeries, HorizontalRectSeries, VerticalRectSeries, HorizontalBarSeries, AreaSeries, VerticalBarSeries} from 'react-vis';

var createReactClass = require('create-react-class');

const FtiSockIo = require('./ftisockio.js')

function tickFormatter(t,i) {
	var text = t.split(' ').map(function(v,j){
		return <tspan x="0" dy={j+'em'}>{v}</tspan>
	})
  return (<text x="0"  transform='translate(-5,-5)' style={{textAnchor:"end", fontSize:16}}>
    {text}
  </text>);
}

class Container extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return <LandingPage/>
	}
}
class LandingPage extends React.Component{
	constructor(props){
		super(props)
		this.state = {start:true,x:null}
		this.simulateData = this.simulateData.bind(this);
		this.simStart = this.simStart.bind(this);
	}
	simulateData(){
		var data = []

		for(var i=0;i<30;i++){
			var pos = 15 + (Math.random() - 0.5);
			var x = (15 - 0.5*(i-pos)*(i-pos))
			if(x<=1){
				x = Math.pow(2,x-1)
			}

			data.push(x + Math.random()*3);
		}
		var pack = Math.random()*100
		this.refs.hh.parsePack(pack)
		this.refs.ss.parsePack(Math.max(...data));
		this.refs.lg.parseDataset(data, pack)

	}
	simStart(){
		var self = this;
		var x = this.state.x
		if(this.state.start){
			x = setInterval(function(){
				self.simulateData()
			},100)
		}else{
			clearInterval(x)
		}
		this.setState({x:x,start:!this.state.start})
	}
	render(){
	

		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
			var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}

		var config = 'config_w'
    	var find = 'find_w'
    	var klass = 'interceptorDynamicView'
		return  (<div className='interceptorMainPageUI' style={{background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}}>
         <table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
            <tbody>
              <tr>
                <td><img style={{height: 50,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td>

                  <td className="buttCell"><button onClick={this.showFinder} className={find}/></td>
                <td className="buttCell"><button onClick={this.showDisplaySettings} className={config}/></td>
              </tr>
            </tbody>
          </table>
          <table><tbody><tr style={{verticalAlign:'top'}}><td>
         	<StatSummary ref='ss'/>
          </td><td><div><SparcElem name={'Gross Weight'} value={'0g'} width={600} font={32}/></div>
          <div><div style={{display:'table-cell'}}><SparcElem name={'Gross Weight'} value={'0g'} width={290} font={28}/></div>

          <div style={{display:'table-cell'}}><SparcElem name={'Gross Weight'} value={'0g'} width={290} font={28}/></div>
          </div><div style={{background:'black',border:'5px solid #818a90', borderRadius:20,overflow:'hidden'}}><LineGraph ref='lg' prodName={'Product 1'}/></div>
          </td><td>
          	<HorizontalHisto ref='hh'/>
          </td></tr></tbody></table>
          <CircularButton style={{width:180, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43}} lab={'Check Weight'}/>
          <CircularButton style={{width:180, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43}} lab={'Tare'}/>
          <CircularButton style={{width:180, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43}} lab={'Home Actuator'}/>
          <CircularButton style={{width:180, display:'inline-block',marginLeft:5, marginRight:5, borderWidth:5,height:43}} lab={'Simulate'} onClick={this.simStart}/>
      </div>) 
	}
}
class SparcElem extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		var innerWidth = Math.min((this.props.width*0.55),160);
		var innerFont = Math.min(Math.floor(this.props.font/2), 16);
		return(<div style={{width:this.props.width,background:'#818a90', borderRadius:10, margin:5, border:'2px #818a90 solid', borderTopLeftRadius:0}}>

			<div><div style={{background:'#5d5480', borderBottomRightRadius:15, height:24, width:innerWidth,paddingLeft:4, fontSize:innerFont, color:'#e1e1e1'}}>{this.props.name}</div></div><div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:this.props.font}}>{this.props.value}</div>
		</div>)
	}
}
class SettingItem extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		var style = Object.assign({},this.props.style)
		var vlabelStyle = {display:'block', borderRadius:20, boxShadow:' -50px 0px 0 0 #5d5480'}
		var vlabelswrapperStyle = {width:536, overflow:'hidden', display:'table-cell'}
		var st = {textAlign:'center',lineHeight:'60px', height:60, width:536}
		let lvst = {display: 'table-cell',fontSize: 24,width: '310',background: '#5d5480',borderTopLeftRadius: 20,borderBottomLeftRadius: 20,textAlign: 'center', color: '#eee'}
		var self = this;
		var vlength = 536/this.props.value.length;
		var vlabels = this.props.value.map(function (v,i) {
			// body...
			return <div style={{textAlign:'center',lineHeight:'30px', height:60, width:vlength}}><div>{self.props.labels[i]}</div><div>{v}</div></div>

		})


		
		return <div className={'sItem noChild'} style={style}><div><label style={lvst}>{this.props.name + ': '}</label><div style={vlabelswrapperStyle}><div style={vlabelStyle}><div style={st}>{vlabels}</div></div></div></div></div>
	}
}
class CwMainScreen extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
				// body...
		var home = 'home'
		var login = 'login'

		var style = {background:'#362c66', width:'100%',display:'block', height:'-webkit-fill-available'}
		if(this.props.mobile){
			style.overflowY = 'scroll'
		}
		var lstyle = {height: 50,marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}
		var self = this;
		var lgs = ['english','french','spanish','portuguese','german','italian','polish','turkish']// ['english','korean']
		var lg = 'english'// lgs[this.props.language]
		var levels = ['Not Logged In', 'Operator', 'Engineer', 'Fortress']
		
		if(vdefMapV2['@languages'].indexOf(lg) == -1){
			lg = 'english'
		}
	
		var logincell = <td className="logbuttCell" style={{height:60}} onClick={this.login}><button className='login' style={{height:50}} /></td>
		var logintext = ''
		if(this.props.level > 0){
			logincell = <td className="logbuttCell" style={{height:60}} onClick={this.logout}><button className='logout' style={{height:50}} /></td>
			logintext =	<td style={{height:60, width:100, color:'#eee'}}><label onClick={this.login}>{this.props.username}</label></td>
		}

		var dv = <InterceptorDynamicViewDF interceptor={this.props.interceptor} mobile={this.props.mobile}  offline={this.props.offline} onDeny={this.onDeny} mac={this.props.mac} testReq={this.props.testReq}  language={lg} onButton={this.onButton} onSens={this.onSens} rejOn={this.props.rejOn} faultArray={this.props.faultArray} warningArray={this.props.warningArray}
							ref='dv' sys={this.state.sysRec} sens={this.state.prodRec['Sens']} sig={this.state.peak} pleds={this.state.pled_a} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} clearFaults={this.props.clearFaults} 
							clearWarnings={this.props.clearWarnings} rejLatch={this.props.rejLatch} prodName={this.state.prodRec['ProdName']}
										rej={this.state.rej} onKeyboardOpen={this.keyboardOpen} onKeyboardClose={this.keyboardClose} level={this.props.level}/>
		
			//var dfLab = <label style={{fontSize:30,lineHeight:'50px',display:'inline-block',position:'relative',top:-10,color:'#FFF'}}>DF</label>
		

    var imsrc = 'assets/Stealth-white-01.svg'
    if(this.props.interceptor){
      imsrc = 'assets/Interceptor-white-01.svg'
    }
		return (<div className='interceptorMainPageUI' style={style}>
					<table className='landingMenuTable' style={{marginBottom:-4, marginTop:-7}}>
						<tbody>
							<tr>
								<td style={{width:380}}><img style={lstyle}  src='assets/NewFortressTechnologyLogo-WHT-trans.png'/></td><td hidden={this.props.mobile}>
								<img style={{height:45, marginRight: 10, marginLeft:10, display:'inline-block', marginTop:7}}  src={imsrc}/>
								</td>
							{logintext}	{logincell}
							
								<td className="buttCell" style={{height:60}}><button onClick={this.gohome} className={home}/></td>
				
							</tr>
						</tbody>
					</table>
		
			
		<InterceptorNav interceptor={this.props.interceptor} mobile={this.props.mobile} offline={this.props.offline} onDeny={this.onDeny} df={this.props.df} testReq={this.props.testReq} isSyncing={this.props.isSyncing} isUpdating={this.props.isUpdating} clearRejLatch={this.clearRejLatch}  status={this.props.status} language={lg} onButton={this.onButton} ref='nv' clearFaults={this.props.clearFaults} clearWarnings={this.props.clearWarnings} 
		rejOn={this.props.rejOn} rejLatch={this.props.rejLatch}  faultArray={this.props.faultArray} warningArray={this.props.warningArray} prodName={this.state.prodRec['ProdName']} combineMode={this.state.prodRec['SigModeCombined']} sens={this.state.prodRec['Sens']} thresh={this.state.prodRec['DetThresh']}>
			<DspClock mobile={this.props.mobile} dst={this.state.sysRec['DaylightSavings']} sendPacket={this.sendPacket} language={lg} ref='clock'/>
		</InterceptorNav>
				<Modal ref='testModal'>
					<TestReq ip={this.props.det.ip} toggle={this.toggleTestModal}/>
				</Modal>
				<Modal mobile={this.props.mobile} ref='pedit' intMeter={true} dfMeter={this.props.df} clear={this.clearSig}>
				

				{peditCont}
				</Modal>
				
				<Modal mobile={this.props.mobile} ref='netpolls' intMeter={true} dfMeter={this.props.df}  clear={this.clearSig}>
					<NetPollView mobile={this.props.mobile} language={lg} ref='np' eventCount={15} events={this.props.netpoll} ip={this.props.det.ip} mac={this.props.det.mac}/>
				</Modal>
				<Modal ref='configs'>
				</Modal>
		</div>)
	
	}
}
class CWMainConsole extends React.Component{
	render(){
			return (
			<div style={{marginTop:2}}>
			<div className={klass} style={{overflow:'hidden', display:'block', width:956, marginLeft:'auto', marginRight:'auto', textAlign:'center', borderRadius:20,boxShadow:'0px 0px 0px 12px #818a90'}}>
				<table  style={{borderSpacing:0,background:'#818a90'}}><tbody>
				<tr>
				<td colSpan={3} style={{padding:0,display:'inline-block',overflow:'hidden', width:956}}>
				<div style={{padding:10, paddingTop:5, paddingBottom:5, display:'block', width:936}}></div></td></tr>
				
				<tr>
				<td style={{padding:0, height:123, overflow:'hidden',display:'inline-block'}}>
				<div  style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative', marginTop:5}}>
					<KeyboardInputTextButton language={'english'} acc={true} tooltip={''} label={'Gross Weight'} lab2={' '} num={true} isEditable={true} value={this.props.sens} onInput={this.onSens} onFocus={this.props.onKeyboardOpen} onRequestClose={this.props.onKeyboardClose} inverted={false}/></div>
				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:280, height:123}}>
				<div style={{textAlign:'center', display:'block', width:260, marginTop:5, marginLeft:10}}><div><KeyboardInputTextButton language={this.props.language}  acc={rejacc} label={vdefMapV2['@labels']['Rejects'][this.props.language]['name']} isEditable={false} onClick={this.onRej} value={this.props.rej} inverted={false}/></div>
				</div>

				</div>
				</td>
				<td style={{padding:0, height:123, overflow:'hidden', display:'inline-block'}}>
				<div style={{display:'inline-block', width:330, height:123}}>
					<div style={{position:'relative',marginTop:5}}>
					<KeyboardInputTextButton language={this.props.language} overrideBG={true} bgColor={'rgba(200,200,200,1)'} rstyle={{backgroundColor:pled[this.props.pleds]}} label={vdefMapV2['@labels']['Signal'][this.props.language]['name']} lab2={''} onClick={this.onSig} isEditable={false} value={this.state.peak} inverted={false}/>
					</div>
					
				</div>
				</td>
				</tr>
				<tr><td colSpan={3} style={{display:'inline-block', padding:0,overflow:'hidden', display:'none'}}><div style={{width:936,height:116, overflow:'hidden', display:'none'}}>
					<MessageConsole mobile={false} offline={this.props.offline} ref='mc' isUpdating={this.props.isUpdating} isSyncing={this.props.isSyncing} status={this.props.status} clearWarnings={this.props.clearWarnings} clearRejLatch={this.clearRejLatch} testReq={this.props.testReq} 
				toggleTest={this.onTestReq} rejOn={this.props.rejOn} rejLatch={this.props.rejLatch} language={this.props.language} clearFaults={this.props.clearFaults} warningArray={this.props.warningArray} faultArray={this.props.faultArray} prodName={this.props.prodName}/>

				</div></td></tr>
				</tbody></table>
				
				</div>
				</div>)
	}
}
class RotatedArea extends React.Component{
	constructor(props){
		super(props)
	}	
	render(){
		var xDomain = [15,-15]
		var yDomin = [this.props.max, 0]
		var data = [{y: 2, x: 1}, {y: 4, x: 2}, {y: 5, x: 3}, {y: 1, x: 4}, {y: 3, x: 5}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]

		return <div style={{transform:'rotate(270deg) translateX(-120px) translateY(-95px)'}}> <XYPlot style={{fill:'#818a90'}}	height={300} width= {515}>		
  
  <VerticalBarSeries data={data} />
  <XAxis orientation="bottom" tickSizeOuter={0}/>
  <YAxis orientation="right" tickSizeOuter={0}/>
		</XYPlot></div>
	}
}


class HorizontalHisto extends React.Component{
	constructor(props){
		super(props)
		this.state = {data:[0, 0, 0, 0, 0, 0, 0, 0]}
	}
	parsePack(pack){
		var data = this.state.data.slice(0)
		data[0]++;
		if(pack<85){
			data[1]++;
		}else if(pack<88){
			data[2]++
		}else if(pack<92){
			data[3]++
		}else if(pack<94){
			data[4]++
		}else if(pack<96){
			data[5]++
		}else if(pack<98){
			data[6]++
		}else if(pack<100){
			data[7]++
		}
		this.setState({data:data})
	}	
	render(){

		var xDomain = [0,15]
		var yDomin = [0, 5]
		var data = [{x: this.state.data[0], y:'Total'}, {x: this.state.data[1], y:'Good'}, {x: this.state.data[2], y:'Under'}, {x: this.state.data[3], y:'Over'}, {x:this.state.data[4], y:'Unstable'}, {x:this.state.data[5], y:'Check Weights'}, {x:this.state.data[6], y:'Metal Rejects'}, {x:this.state.data[7], y:'Over Capacity'}]//[{x0:2, x:3, y:5},{x0:3, x:4, y:2},{x0:4, x:6, y:5}]
		var labelData = data.map(function(d){
			var lax = 'start'
			if(d.x > (data[0].x*0.75)){
				lax = 'end'
				return {x:d.x,y:d.y,label:d.x, xOffset:-10, yOffset:0, size:0, style:{fill:'#e1e1e1',textAnchor:lax}}
			}
			return	{x:d.x,y:d.y,label:d.x, xOffset:10, yOffset:0, size:0, labelAnchorX:lax}
		})
		//var hh = 
		return <div style={{width:400, height:490,background:'#818a90', borderRadius:10, margin:5, border:'2px #818a90 solid', borderTopLeftRadius:0}}>

			<div><div style={{background:'#5d5480', borderBottomRightRadius:15, height:24, width:150,paddingLeft:2, fontSize:16, color:'#e1e1e1'}}>Statistics</div></div>

		<XYPlot	height={450} width= {400} margin={{left: 80, right: 30, top: 10, bottom: 40}} yType='ordinal'>		
  
  <HorizontalBarSeries data={data} color="#362c66" />
  <LabelSeries data={labelData} labelAnchorY='middle' labelAnchorX='start'/>
  <XAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="bottom" tickSizeOuter={0}/>
  <YAxis style={{line:{stroke:'transparent'}, ticks:{stroke:'transparent'}}} orientation="left" tickSizeOuter={0} tickFormat={tickFormatter}/>
		</XYPlot>
		</div>
	}
}
class LineGraph extends React.Component{
	constructor(props){
		super(props)
		this.parseDataset = this.parseDataset.bind(this);
		this.state = {decisionRange:[12,18],dataSets:[[8,9,13,15,16,16,14,13,10,4],[9,10,12,14,15,14,13,11,9,3],[9,10,14,15,17,17,15,9,8,2]],reject:false}
	}
	parseDataset(data,pack){
		var dataSets = this.state.dataSets;
		if(dataSets.length > 5){
			dataSets = dataSets.slice(-5)
		}
		dataSets.push(data)
		this.setState({dataSets:dataSets, reject:pack>85});
	}
	render(){
		var opc = [0.8,0.6,0.4,0.3,0.2,0.1]
		var dsl = this.state.dataSets.length;
		var max = 0;
		var min = 0;
		var self = this;
		if(dsl != 0){
			var decSet =  this.state.dataSets[dsl-1].slice(this.state.decisionRange[0],this.state.decisionRange[1])
			max = Math.max(...decSet);
			min = Math.min(...decSet)
		}

		var graphs = this.state.dataSets.map(function(set,i){
			var data = set.map(function(d,j){
				return {y:d, x:j}
			})
			if(i+1 == dsl){
				
				return <AreaSeries curve='curveMonotoneX' opacity={opc[dsl-1-i]} color="#362c66" data={data}/>
			}else{
				
				return <AreaSeries curve='curveMonotoneX' opacity={opc[dsl-1-i]} color="#818a90" data={data}/>
			}
		})
	var bg = 'transparent';
	var bg2 = 'rgba(200,200,200,0.5)'
	var str = 'Good Weight'
	if(this.state.reject){
		bg = 'rgba(255,255,0,0.2)'
		bg2 = 'rgba(255,255,0,0.5)'
		str = 'Over Weight'
	}
	return	<div style={{background:bg, textAlign:'center'}}>
		<div style={{background:bg2,color:'#e1e1e1',marginBottom:-58,marginLeft:'auto',marginRight:'auto',padding:4,width:150, height:72,lineHeight:'36px'}}><div>{this.props.prodName}</div>
		{str}
		</div>
	<XYPlot height={311} width={610} yDomain={[0,20]} stackBy='y' margin={{left:0,right:0,bottom:0,top:50}}>
		<XAxis hideTicks />
		{graphs}
		<VerticalRectSeries curve='curveMonotoneX' stack={true} opacity={0.8} stroke="#ff0000" fill='transparent' strokeWidth={3} data={[{y0:min,y:max,x0:this.state.decisionRange[0],x:this.state.decisionRange[1]}]}/>
		
		</XYPlot></div>
	}
}
class StatSummary extends React.Component{
	constructor(props){
		super(props)
		this.parsePack = this.parsePack.bind(this);
		this.state = {count:0, grossWeight:0,currentWeight:0}
	}
	parsePack(max){
		this.setState({count:this.state.count+1,grossWeight:this.state.grossWeight + max,currentWeight:max})

	}
	render(){
		var av = 0;
		if(this.state.count != 0){
			av = (this.state.grossWeight/this.state.count)
		}
		var grstr;
		if(this.state.grossWeight < 10000){
			grstr = this.state.grossWeight.toFixed(1)+'g'
		}else if(this.state.grossWeight < 10000000){
			grstr = (this.state.grossWeight/1000).toFixed(3)+'kg'
		}else{
			grstr = (this.state.grossWeight/1000000).toFixed(3)+'t'
		}
	return	<div style={{width:220,background:'#818a90', borderRadius:10, margin:5, border:'2px #818a90 solid', borderTopLeftRadius:0}}>

			<div><div style={{background:'#5d5480', borderBottomRightRadius:15, height:24, width:140,paddingLeft:2, fontSize:16, color:'#e1e1e1'}}>Statistics</div></div>
			<StatControl name='Gross Weight' value={grstr}/>
			<StatControl name='Gross Weight (Live)' value={this.state.currentWeight.toFixed(1)+'g'}/>
			<StatControl name='Net Weight' value='0g'/>
			<StatControl name='Average Weight' value={av.toFixed(1)+'g'}/>
			<StatControl name='Standard Deviation' value='0g'/>
			<StatControl name='Giveaway (Batch)' value='0g'/>
			<StatControl name='Giveaway (Sample)' value='0g'/>
			<StatControl name='Production Rate' value='0g'/>

		</div>
	}
}
class StatControl extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		return <div>
		<div style={{textAlign:'left', paddingLeft:2, fontSize:16}}>{this.props.name}</div>
		<div style={{textAlign:'center', marginTop:-4,lineHeight:1.4, fontSize:25}}>{this.props.value}</div></div>
	}
}
ReactDOM.render(<Container/>,document.getElementById('content'))