const React = require('react');
const ReactDOM = require('react-dom')
const ifvisible = require('ifvisible');
const timezoneJSON = require('./timezones.json')
import {CustomFileInput,TrendBar,TickerBox, CanvasElem, SlimGraph, DummyGraph, Modal,GraphModal, AuthfailModal, ProgressModal, MessageModal, AlertModal, AccModal, MessageConsole, LockModal, ScrollArrow} from './components.jsx'
import {CircularButton, CircularButton2, ButtonWrapper, CustomAlertButton, CustomAlertClassedButton} from './buttons.jsx'
import {PopoutWheel} from './popwheel.jsx'
import {CustomKeyboard, KeyboardInputTextButton, EmbeddedKeyboard} from './keyboard.jsx'
var onClickOutside = require('react-onclickoutside');
import Notifications, {notify} from 'react-notify-toast';
import {ToastContainer, toast,Zoom, cssTransition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {css} from 'glamor'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {XYPlot,MarkSeries,Borders, LabelSeries, XAxis, YAxis,VerticalGridLines, HorizontalGridLines,  HorizontalRectSeries, VerticalRectSeries, HorizontalBarSeries, AreaSeries, VerticalBarSeries, LineSeries} from 'react-vis';
import {Uint64LE, Int64LE, Uint64BE, Int64BE} from 'int64-buffer';
import {v4 as uuidv4} from 'uuid';
import ErrorBoundary from './ErrorBoundary.jsx'

var createReactClass = require('create-react-class');
var fileDownload = require('js-file-download');
const FtiSockIo = require('./ftisockio.js')
const Params = require('./params.js')

var _wsurl = 'ws://' +location.host 
var socket = new FtiSockIo(_wsurl,true);
socket.on('vdef', function(vdf){
  console.log('on vdef')
	var json = vdf[0];
	_Vdef = json
	var res = [];
    res[0] = {};
    res[1] = {};
    res[2] = {};
    res[3] = {};
    res[4] = {};
    res[5] = {}
    res[9] = {};
    res[10] = {};
    res[11] = {};
    res[12] = {};
   	var nVdf = [[],[],[],[],[],[],[],[],[]];
    json["@params"].forEach(function(p ){
      var rec = p['@rec']
      if(p['@rec'] > 5){
        rec = rec + 4
      }
      res[rec][p["@name"]] = p;
      res[9][p["@name"]] = p;
      nVdf[p["@rec"]].push(p['@name'])
    }
    );

     var bob = {}
     var rob = {}
     var dob = {}
      dob['@name'] = '@dispversion'
    dob['@rpcs'] = {'dispversion':[0]}
     rob['@name'] = '@customstrn'
    rob['@labels'] = 'usecustom'
    rob['@rpcs'] = {'customstrn':[0]}
    bob['@name'] = '@branding'
    bob['@labels'] = 'theme'
    bob['@rpcs'] = {'theme':[0]}
    res[0]['@branding'] =  bob
    res[9]['@branding'] =  bob
    res[0]['@customstrn'] =  rob
    res[0]['@dispversion'] = dob
    res[9]['@customstrn'] =  rob
    res[6] = json["@deps"];
    res[7] = json["@labels"]
    res[7]['theme'] = {'english':['SPARC','FORTRESS']}
    res[7]['usecustom'] =  {'english':['disabled','enabled']}
    res[8] = [];
    res[9] = [];
   for(var par in res[2]){  
      if(par.indexOf('Fault') != -1){
        res[8].push(par)
      }
    }
    for(var par in res[2]){  
      if(par.indexOf('Warn') != -1){
        res[9].push(par)
      }
    }

    _pVdef = res;
    if(json['@defines']['LOGICAL_OUTPUT_NAMES']){
    	outputSrcArr = json['@defines']['LOGICAL_OUTPUT_NAMES'].slice(0)
      inputSrcArr = json['@defines']['PHYSICAL_INPUT_NAMES'].slice(0)
    }
    vdefByMac[vdf[1].mac] = [json, res, nVdf, categories, [vdefMapV2["@pages"]['XSys']], vdefMapV2['@vMap'], vdefMapV2['@pages'], vdefMapV2['@acc']]
})

class Container  extends React.Component {
	constructor(props){
		super(props)
	}
	render(){
		return <div>
    <ErrorBoundary autoReload={false}>
    <LandingPage/>

				<ToastContainer position="top-center" autoClose={1500} hideProgressBar newestOnTop closeOnClick closeButton={false} rtl={false}
			pauseOnVisibilityChange draggable pauseOnHover transition={FastZoom} toastClassName='notifications-class'/>
			</ErrorBoundary>
		</div>
	}
}

class LandingPage extends React.Component{
	constructor(props){
		super(props)
	}
	render(){
		return <div></div>
	}
}



ReactDOM.render(<Container/>,document.getElementById('content'))