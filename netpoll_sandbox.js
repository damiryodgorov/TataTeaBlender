'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');


const KAPI_RPC_ETHERNETIP = 100;

const REMOTE_RPC_PORT = 10010;
const SOURCE_RPC_PORT = 20010;
const NETPOLL_PORT = 20100;

const SET_DIFFERENT_PORTS_PER_DEVICE = false

const DRPC_NUMBER = 19;

const MAX_NUM_ROWS = 50
const LOG_RPC = 'LOG_RPC'
const LOG_NP = 'LOG_NP'
const LOG_DATETIME = 'LOG_DATETIME'

const COUNT_NONE = 0;
const COUNT_REJECTS = 1;
const COUNT_SETTING_CHANGES = 2;
const COUNT_FAULTS = 3;
const COUNT_PRODUCT_CHANGES = 4;
const COUNT_TESTS = 5;
const COUNT_WARNINGS = 6;
const COUNT_RECORDS = 7;
class NetPollEvents{
	constructor(detectorsList, vdefs, callback, relaySock)
	{
		var self = this;
	//	this.db = db_processin
		this.callbackToDisplay = callback
		this.relaySockMsg = relaySock
		this.init_callback = this.init_callback.bind(this);
		this.prod_rec = []
		this.sys_rec = []
		this.detectorsList = detectorsList
		this.record_deps = [];
		this.rejects = [];
		this.rejects_B = [];
		this.reject_peak = [];
		this.reject_peak_B = [];
		this.packet_peak = [];
		this.faults = [];
		this.faults_bin = [];
		this.faults_db = [];
		this.test_type = [];
		this.test_type_B = [];
		this.test_status = [];
		this.test_status_B = [];
		this.param_last_val = [];
		this.param_last_val_db = [];
		this.param_last_name_db = [];
		this.packets_count = [];
	    this.vdef = vdefs;
		this.test_bin_opNum = [];
		this.test_bin_testReq = [];
		this.test_bin_metalType = [];
		this.test_bin_signal = [];
		this.test_bin_B = [];
		this.test_bin_opNum_B = [];
		this.test_bin_testReq_B = [];
		this.test_bin_metalType_B = [];
		this.test_bin_signal_B = [];
		this.interval = [];
		this.interval2 = [];
		this.packCountRpc = [];
		this.peakRpc = [];
		this.peakBRpc = [];
		this.rejCountRpc = [];
		this.rejCountBRpc = [];
		this.rejDelClock = [];
		this.isInterceptor = [];
		this.det_connection = []
		this.prodRec = [];
		this.sysRec = [];
		this.prodDeps = {};
		this.sysDeps = {}
		this.netpoll_queue = [];
		this.netpoll_queue_ptr = [];
		this.wr_ptr = [];
		this.flag_queue_is_busy = []
		this.db_processing = false;
		this.collecting_events = true;
		this.filters = {datetime: {from: new Date(), to: new Date(), enabled: false}, type: {selectedType: '', types: [], enabled: false}, detectors: []}
		this.detectorFilter = []
		this.types = []
		this.groups = []
		//this.productEmailCallback = function(){}
		console.log("Initializing object variables...")
//		this.writing_tables = [];
		this.detector_ptr = 0
		this.events_table = []
		this.parameters_table = []
	//	this.language = this.read_language_db()
		this.table_updated = false;
		this.sys_rec_ref = []
		this.prod_rec_ref = []
		this.fram_rec_ref = []
		this.sys_prod_refs_ready = []
		this.rpc_state = []
		console.log(this.detectorsList)
		this.detectorsList.forEach(function(d,j){
//			self.version[j] = parseInt(self.vdef[j]["@version"].replace("/","").replace("/","").substring(2),10)
			self.isInterceptor[j] = 0;
			self.det_connection[j] = false;
			if (self.vdef[j])
			{
				self.vdef[j]["@params"].forEach(function(p,i){
					if(p["@name"] == "Sens_A")
						self.isInterceptor[j] = 1;
				});
			}
		});
		this.detectorsList.forEach(function(d,j){
        console.log("detector ip: " + d.ip)
				self.prod_rec[j] = [];
				self.sys_rec[j] = [];
				self.record_deps[j] = [];
  			self.param_last_val[j] = [];
  	//		self.param_last_val_db[j] = [];
				self.param_last_name_db[j] = "                ";
				self.netpoll_queue[j] = 0;
				self.netpoll_queue_ptr[j] = 0;
				self.wr_ptr[j] = 0;
				self.flag_queue_is_busy[j] = false
//				self.db_processing[j] = false;
//				self.writing_tables[j] = 0;
				self.sys_rec_ref[j] = 1;
				self.prod_rec_ref[j] = 1;
				self.fram_rec_ref[j] = 1;
				self.sys_prod_refs_ready[j] = false;
//				self.parameters_table[j] = [];
  			self.faults[j] = "";
				self.faults_bin[j] = [];
				self.faults_db[j] = "";
  			self.rejects[j] = 0;
				if(self.isInterceptor[j])
				{
					self.rejects_B[j] = 0;
					self.reject_peak_B[j] = 0;
//					self.test_bin_B[j] = [0, 0, 0, 0];
					self.test_bin_opNum_B[j] = 0;
					self.test_bin_testReq_B[j] = 0;
					self.test_bin_metalType_B[j] = 0;
					self.test_bin_signal_B[j] = 0;

	  			self.test_type_B[j] = "";
	  			self.test_status_B[j] = "";
				}
  			self.reject_peak[j] = 0;
				self.packet_peak[j] = 0;
  			self.test_type[j] = "";
  			self.test_status[j] = "";
			//	self.reset_faults(j);
//				self.test_bin[j] = [0, 0, 0, 0];
				self.test_bin_opNum[j] = 0;
				self.test_bin_testReq[j] = 0;
				self.test_bin_metalType[j] = 0;
				self.test_bin_signal[j] = 0;
				self.filters.detectors.push(d)
				self.rpc_state[j] = 'START'
		});
//		this.init_process_messages();
		//this.get_sys_prod_rec_ref_db()
//		this.get_events_table()

//		if ((vdefs.length > 0) && vdefs[0]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
//			KAPI_RPC_NETPOLLSTREAM = vdefs[0]['@net_poll_h']['NET_POLL_STREAM_EVENT'][1][0];
		this.rpc = Fti.Rpc.FtiRpc.udp(this.detectorsList[0].ip);
  	this.netpollSocket = null
		this.init_net_poll_events_server();
	//	this.init_write_netpoll_event_into_db_queue();
	//	this.get_netpoll_types();
		//this.vdefMap = vdefMap;
		this.last_packet_id = [];
		this.detectorsList.forEach(function(det,i){
			self.last_packet_id[i] = null
		})
		//this.initWrDatabaseInterval = null;
		this.wr_db_interval = null;
 		
		this.vdefQuery = vdefs
		//this.vdefId = vdefIds
		this.prodChangeKey = []
		this.param_prod_no = []
		if (this.vdef && this.vdef.length > 0)
		{
			this.vdef.forEach(function(vdef,i){
				if (vdef)
				{
					vdef["@params"].forEach(function(p){
						if (p["@name"] == "ProdNo")
							self.param_prod_no[i] = p;
					})
					self.prodChangeKey[i] = vdef["@net_poll_h"]["NET_POLL_PROD_SYS_VAR"] | self.param_prod_no[i]["@i_var"]
				}
			})
		}
  	}

	init_net_poll_events_server(){
		var self = this;
		this.netpollSocket = dgram.createSocket({'type':'udp4'})
		var last_packet_id = [];
		this.detectorsList.forEach(function(d){
			last_packet_id.push(0)
		})
		this.netpollSocket.on("listening", function () {
			console.log('listening 210 netpoll')
			self.init_net_poll_events(self.netpollSocket.address().port);
		});
		this.netpollSocket.on('message', function(e,rinfo){
			console.log("new message from: "+rinfo.address)
			self.detectorsList.forEach(function(d,i){
				if(e && self.detectorsList[i].ip == rinfo.address){
					console.log(e)
					if (self.vdef[i] && self.vdef[i]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
					{
						if (e.length > 22)
						{
							var packet_id = e.slice(0,4);
							self.netpollSocket.send(packet_id,0,4,rinfo.port,rinfo.address)
							if (last_packet_id[i] != packet_id.readUInt32LE(0))
							{
								last_packet_id[i] = packet_id.readUInt32LE(0)
								/*if (i == 0)
								{
									if (updateDatetime && DATETIME_UPDATE_DETECTOR)
									{
										updateDatetime = false
										var datetimeFromDetector = self.parse_date_time(e.slice(4,9));
										log(datetimeFromDetector,LOG_DATETIME)
										exec('sudo date --set="'+datetimeFromDetector+'"',function(err,stdout,errStd){
											if (!err)
												//log(stdout,LOG_DATETIME)
										})
									}
								}*/
								self.parse_net_poll_event(e,i);
							}
							console.log("Packet Id: ");
							console.log(packet_id);
						}
						else
							console.log("Wrong Length Netpoll event",LOG_NP)
					}
				}
			});
		});
		this.netpollSocket.bind({address: '0.0.0.0'});
	}
	init_callback(message,remote){
		var self = this;
		this.detectorsList.forEach(function(d,i){
			if (self.vdef[i])
					{
	/*				else
					{
						dsp[i].rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
						setTimeout (function(){
							dsp[i].rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP]);
						},1000)
					}
	*/
	//				dsp[i].port.socket.on('message', function (message, remote) {
						if (self.detectorsList[i] && (self.detectorsList[i].ip == remote.address))
						{
							if (message.readUInt16LE(1)==self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0])
							{
								if (self.rpc_state[i] == 'START')
								{
									console.log("KAPI_RPC_NETPOLLSTREAM ACK. Ip: "+remote.address,LOG_RPC)
									self.rpc_state[i] = 'NP_REGISTERED'
	//								dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
									if (SET_DIFFERENT_PORTS_PER_DEVICE)
										self.rpc.rpc_cb(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]],null,self.init_callback);
									else
										self.rpc.rpc_cb(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]],null,self.init_callback);
								}
								else if (self.rpc_state[i] == 'NP_REGISTERED')
								{
									console.log("KAPI_RPC_NETPOLLSTREAM RECORDS_REQUESTED. Ip: "+remote.address,LOG_RPC)
									//not needed for my application
									/*self.rpc_state[i] = 'RECORDS_REQUESTED'
									self.interval[i] = setInterval(function(){
											log("Init KAPI_RPC_NETPOLLSTREAM Interval. Ip: "+remote.address,LOG_RPC)			
	//										dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
											if (SET_DIFFERENT_PORTS_PER_DEVICE)
												self.rpc.rpc0(d.ip,REMOTE_RPC_PORT+i,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
											else
												self.rpc.rpc0(d.ip,REMOTE_RPC_PORT,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
									},10000)*/
								}
							}
						}
					}
		})
	}
	init_net_poll_events(port){
	  var FtiRpc = Fti.Rpc.FtiRpc;
		var self = this;
		var dsp = []

		this.detectorsList.forEach(function(d,i){
			if (self.vdef && self.vdef[i] && self.vdef[i]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
			{
				if (self.rpc_state[i] == 'START')
				{
					console.log("Init KAPI_RPC_NETPOLLSTREAM. Ip: "+d.ip,LOG_RPC)			
					//dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
					if (SET_DIFFERENT_PORTS_PER_DEVICE)
						self.rpc.rpc_cb(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port],null,self.init_callback);
					else
						self.rpc.rpc_cb(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port],null, self.init_callback);
				}
			}
		})
	/*	if (this.detectorsList.length > 0)
		{
			this.rpc.port.on('message', function (message, remote) {
				self.detectorsList.forEach(function(d,i){
				//dsp[i] = FtiRpc.udp(d.ip, CONTACT_RPC_PORT, 1, CONTACT_RPC_PORT);
					if (self.vdef[i])
					{
				else
					{
						dsp[i].rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
						setTimeout (function(){
							dsp[i].rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP]);
						},1000)
					}
	
	//				dsp[i].port.socket.on('message', function (message, remote) {
						if (self.detectorsList[i] && (self.detectorsList[i].ip == remote.address))
						{
							if (message.readUInt16LE(1)==self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0])
							{
								if (self.rpc_state[i] == 'START')
								{
									console.log("KAPI_RPC_NETPOLLSTREAM ACK. Ip: "+remote.address,LOG_RPC)
									self.rpc_state[i] = 'NP_REGISTERED'
	//								dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
									if (SET_DIFFERENT_PORTS_PER_DEVICE)
										self.rpc.rpc0(d.ip,REMOTE_RPC_PORT+i,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
									else
										self.rpc.rpc0(d.ip,REMOTE_RPC_PORT,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
								}
								else if (self.rpc_state[i] == 'NP_REGISTERED')
								{
									console.log("KAPI_RPC_NETPOLLSTREAM RECORDS_REQUESTED. Ip: "+remote.address,LOG_RPC)
									//not needed for my application
									/*self.rpc_state[i] = 'RECORDS_REQUESTED'
									self.interval[i] = setInterval(function(){
											log("Init KAPI_RPC_NETPOLLSTREAM Interval. Ip: "+remote.address,LOG_RPC)			
	//										dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
											if (SET_DIFFERENT_PORTS_PER_DEVICE)
												self.rpc.rpc0(d.ip,REMOTE_RPC_PORT+i,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
											else
												self.rpc.rpc0(d.ip,REMOTE_RPC_PORT,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
									},10000)
								}
							}
						}
					}
				})
			});
		}*/

  }
  relaySock(cont){
  	console.log('relaySock')
  	this.relaySockMsg('testusb', cont)
  }
  parse_net_poll_event(buf,detector_index){
		var username = 'NO USER   '
		var key;
		var size;
		var group_id;
		var valuesBuffer;
		var packet_id = buf.slice(0,4);

		var np_string = '';

		if (this.last_packet_id[detector_index] != packet_id)
		{
			this.last_packet_id[detector_index] = packet_id;
			username = buf.toString('ascii', 9, 19)
			key = buf.readUInt32LE(19);
			group_id = buf.readUInt32LE(23);
			size = buf.readUInt16LE(27);
			var date_time = this.parse_date_time(buf.slice(4,9));

			console.log(date_time)
			//log(buf)
			console.log('NPEvent => key: '+key+', group_id: '+group_id, LOG_NP)

			for (var e in this.vdefQuery[detector_index]["@net_poll_h"])
			{
				if (this.vdefQuery[detector_index]["@net_poll_h"][e] == key)
				{
					console.log(e)
					var eventInfo = {string: np_string,
							date_time:{year: null, month: null, day: null, hours: null, min: null, sec: null},
							username:username, 
							value:null,
							net_poll_h: e,
							parameters: null,
							rejects:{signal: null, number: null},
							test:{operator_no: null, request: null, type: null, signal: null},
							faults:[] };
					eventInfo.date_time.year = date_time[0];
					eventInfo.date_time.month = date_time[1];
					eventInfo.date_time.day = date_time[2];
					eventInfo.date_time.hours = date_time[3];
					eventInfo.date_time.min = date_time[4];
					eventInfo.date_time.sec = date_time[5];
					eventInfo.username = username
					if (e == 'NETPOLL_STREAM_INTERCEPTOR_REJECT')
					{
						if (buf.length > 34)
						{
							valuesBuffer = buf.slice(29,35)
						//	log("Interceptor Reject",LOG_NP)

							//log("Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2) + ", Count: " + valuesBuffer.readUInt16LE(4),LOG_NP)
							np_string = "Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2) + ", Count: " + valuesBuffer.readUInt16LE(4) 
							eventInfo.rejects = {signal_a:valuesBuffer.readUInt16LE(0),signal_b:valuesBuffer.readUInt16LE(2), number:valuesBuffer.readUInt16LE(4)}
							this.queue_db_wr_netpoll_event(detector_index, key, valuesBuffer, null, eventInfo, e, username, group_id, np_string, date_time)
						}
						else
							console.log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
					}
					else if (e == 'NETPOLL_STREAM_TEST_REJECT')
					{
						if (buf.length > 38)
						{
							valuesBuffer = buf.slice(29,39)
						//	log("Test Reject",LOG_NP)
							//log("Signal: " + valuesBuffer.readUInt16LE(0),LOG_NP)
							np_string = "Signal: " + valuesBuffer.readUInt16LE(0)
							eventInfo.rejects = {signal:valuesBuffer.readUInt16LE(0)}
							this.queue_db_wr_netpoll_event(detector_index, key, valuesBuffer, null, event_info, e, username, group_id, np_string, date_time)
						}
						else{
							console.log('buflength wrong')
							//log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
						}
					}
					else if (e == 'NETPOLL_STREAM_INTERCEPTOR_TEST_REJECT')
					{
						if (buf.length > 40)
						{
							valuesBuffer = buf.slice(29,41) 
							//log("Interceptor Test Reject",LOG_NP)
						//	log("Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2),LOG_NP)
						np_string = "Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2);
							var metal;
							if (valuesBuffer.readUInt16LE(10) == 0) {
								metal = "FE"
							} else if (valuesBuffer.readUInt16LE(10) == 1) {
								metal = "NFE"
							} else { // 2
								metal = "SS"
							}
						//	log("Test " + valuesBuffer.readUInt16LE(4) + ", Metal: " + metal + " Pass " + valuesBuffer.readUInt16LE(6) + " of " + valuesBuffer.readUInt16LE(8),LOG_NP);
							np_string += "Test " + valuesBuffer.readUInt16LE(4) + ", Metal: " + metal + " Pass " + valuesBuffer.readUInt16LE(6) + " of " + valuesBuffer.readUInt16LE(8);
							this.queue_db_wr_netpoll_event(detector_index,  key, valuesBuffer, null, null, e, username, group_id, np_string,  date_time)
						}
						else
							console.log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
					}
					else if (e == 'NETPOLL_STREAM_MANUAL_REJECT')
					{
						//log("Manual Reject",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string,  date_time)
					}
					else if ( (e == 'NETPOLL_STREAM_TEST_START') || (e == 'NETPOLL_STREAM_TEST_END') || (e == 'NETPOLL_STREAM_REJECT_CLEAR') || (e == 'NETPOLL_STREAM_REJECT2_CLEAR') || (e == 'NETPOLL_STREAM_INTCPTR_SWITCH'))
					{
						valuesBuffer = buf.slice(29,31)
					//	log('Value: '+valuesBuffer.readUInt16LE(0),LOG_NP)
						//np_string
						this.queue_db_wr_netpoll_event(detector_index, key, valuesBuffer, null, null, e, username, group_id, np_string, date_time)
					}
					else if ((e == 'NETPOLL_STREAM_FAULTS_CLEAR') || (e == 'NETPOLL_STREAM_WARNINGS_CLEAR'))
					{
						//log("Faults Cleared",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string, date_time)
					}
					else if (e == 'NETPOLL_STREAM_LOGIN')
					{
						//log("User Logged In",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string, date_time)
					}
					else if (e == 'NETPOLL_STREAM_LOGOUT')
					{
						//log("User Logged Out",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string, date_time)
					}
					else if (e == 'NETPOLL_STREAM_POWERUP')
					{
						//log("Power Up",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string, date_time)
					}
					else if (e == 'NETPOLL_STREAM_SEL_UNIT')
					{
						//log("Select Unit (multi-unit)",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, key, null, null, null, e, username, group_id,np_string, date_time)
					}
					else if (e == 'NETPOLL_STREAM_FRAM')
					{
						//log("Got Fram Record",LOG_NP)
						var bitArray = buf.slice(25,49)
						var fram_rec = buf.slice(49)
//						log(bitArray)
						this.queue_db_wr_netpoll_event(detector_index, key, null, bitArray, this.parse_rec(fram_rec,e, bitArray), e, username, 0,np_string, date_time)
					}
					else if ((e == 'NETPOLL_STREAM_REJECT') || (e == 'NETPOLL_STREAM_REJECT2') || (e == 'NETPOLL_STREAM_FAULTS') || (e == 'NETPOLL_STREAM_EYE_PROD_PEAK') || (e == 'NETPOLL_STREAM_PROD_DELETE') || 
									 (e == 'NETPOLL_STREAM_PROD_BACKUP') || (e == 'NETPOLL_STREAM_PROD_COPY') || (e == 'NETPOLL_STREAM_PROD_RESTORE') || (e == 'NETPOLL_STREAM_PROD_DEFAULTS') || (e == 'NETPOLL_STREAM_WARNINGS') || 
									 (e == 'NETPOLL_STREAM_CLEAR_SCOPE'))
					{
						valuesBuffer = buf.slice(29,33)
						this.queue_db_wr_netpoll_event(detector_index, key, valuesBuffer, null, null, e, username, group_id,np_string,date_time)
					}
					else if (e == 'NET_POLL_PROD_REC_VAR')
					{
						//log("Got Product Record",LOG_NP)
					//	log("Product number " + buf.readUInt16LE(23),LOG_NP)
						valuesBuffer = buf.slice(23,25)
						var bitArray = buf.slice(25,49)
						var prod_rec = buf.slice(49)
						//this.relaySock([bitArray,prod_rec])
//						log(bitArray)

						this.queue_db_wr_netpoll_event(detector_index, key, valuesBuffer, bitArray, this.parse_rec(prod_rec,e, bitArray), e, username, 0,np_string,date_time)
					}
					else if (e == 'NET_POLL_PROD_SYS_VAR')
					{
						//log("Got System Record",LOG_NP)
						var bitArray = buf.slice(25,49)
						var sys_rec = buf.slice(49)
//						log(bitArray)
					//	var row = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[detector_index].name+" WHERE rowid = "+this.sys_rec_ref[detector_index]).get()
					//	if (row && (row.SysRec.readUInt16LE(2) != sys_rec.readUInt16LE(2))) //There is a product change
					//	{
						//	log("Product Change",LOG_NP)
						//	this.checkPrevProdChangeAutoGenRep(detector_index)
					//	}

						this.queue_db_wr_netpoll_event(detector_index, key, null, bitArray, this.parse_rec(sys_rec,e, bitArray), e, username, 0,np_string,date_time)
					}
		 			else 
					{
						console.log("Key: "+key+" not found.", LOG_NP)
					}
				}	

			}
			
		}
		//return packet_id;
		
	}
		
	pad(num, size){
	  return ('000000000' + num).substr(-size);
	}

	queue_db_wr_netpoll_event(idx, key, values, bitArray, recBuf, e, username, group_id, np_string,date_time){
		//not using db for this, so let's just fire this and forget

		var eventInfo = {string: np_string,
											date_time:{year: null, month: null, day: null, hours: null, min: null, sec: null},
											username:username, 
											value:values,
											net_poll_h: e,
											parameters: null,
											rejects:{signal: null, number: null},
											test:{operator_no: null, request: null, type: null, signal: null},
											faults:[] };


			if(e == 'NET_POLL_PROD_REC_VAR' || e == 'NET_POLL_PROD_SYS_VAR' || e == 'NETPOLL_STREAM_FRAM'){
				eventInfo = recBuf
			}
			eventInfo.date_time.year = date_time[0];
			eventInfo.date_time.month = date_time[1];
			eventInfo.date_time.day = date_time[2];
			eventInfo.date_time.hours = date_time[3];
			eventInfo.date_time.min = date_time[4];
			eventInfo.date_time.sec = date_time[5];
			eventInfo.username = username
		this.callbackToDisplay(eventInfo, this.detectorsList[idx].ip);
	}
	
	parse_date_time(data){
	  var fatfs_date_time = data.readUInt32LE(0);
	  var year = (fatfs_date_time>>25) + 1980;
	  var month = (fatfs_date_time>>21) & 0x0f;
	  var day = (fatfs_date_time>>16) & 0x1f;
	  var hours = (fatfs_date_time>>11) & 0x1f;
	  var min = (fatfs_date_time>>5) & 0x3f;
	  var sec = fatfs_date_time & 0x1f;
	  var msec = data[4];
	  data = null;
	  return [year, month, day, hours, min, sec, msec];
	}

	parse_faults(key, value){
		var mask = 1;
	  var res = "";
		var pos = 0;
	  var idx = key & 0xff;
		var faults_array = [];
		var array_pos = 0;
		while(mask < 0x10000)
		{
			if( (value & mask) == mask )
	    {
//	      console.log(this.vdef["@labels"].FaultSrc.english[pos+1+16*idx])
	      res = res + this.vdef["@labels"].FaultSrc.english[pos+1+16*idx] + ", ";
				faults_array[array_pos]=pos+1+16*idx;
				array_pos += 1;
	    }
			mask <<=1;
			pos++;
		}
	  return {string: res, faults: faults_array};
	}

	convert_word_array(byteArr){
	  var b = new Buffer(byteArr)
	  var length = byteArr.length/2;
	  var wArray = []
	  for(var i = 0; i<length; i++){
	    wArray.push(b.readUInt16LE(i*2));
	  }
	  return wArray;
	}

	parse_rec_db(buf,rec, detector_index){
		var self = this;
		if (this.record_deps[detector_index])
		{
//		if (rec == 0)
			var word_array = this.convert_word_array(buf.slice(0));
//		else if (rec == 1)
//			var word_array = this.convert_word_array(buf.slice(2));
    for (var dep in this.vdefQuery[0][detector_index]["@deps"])
    {
      if(rec == this.vdefQuery[0][detector_index]["@deps"][dep]["@rec"])
      {
        var array_pos = this.vdefQuery[0][detector_index]["@deps"][dep]["@i_var"];
        var bit_pos = this.vdefQuery[0][detector_index]["@deps"][dep]["@bit_pos"];
        var bit_len = this.vdefQuery[0][detector_index]["@deps"][dep]["@bit_len"];
        this.record_deps[detector_index][dep] = (word_array[array_pos] >> bit_pos) & ((1<<bit_len)-1);
      }
    }
		var children_table = []
		for (var p_map in params_map)
		{
			if (params_map[p_map]["children"])
			{
				params_map[p_map]["children"].forEach(function(child,i){
					if (child)
						children_table.push({Name: child, Value: "", Parent: p_map})
				})
			}
		}
		this.vdefQuery[detector_index]['@params'].forEach(function(p,i){
			var child = self.check_children(children_table, p["@name"])
			if (child.exists)
			{
				var value = (word_array[p["@i_var"]] >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);
		   	if (p["@labels"])
				{
          var lg = 'english'
          if (vdefMap["@lists"][p['@labels']][self.language] && vdefMap["@lists"][p['@labels']][self.language][value])
            lg = self.language									
					children_table[child.pos].Value = "" + vdefMap["@lists"][p['@labels']][lg][value]
				}
				else
					children_table[child.pos].Value = "" + value
				//log("Child: "+children_table[child.pos].Name+", Value: "+children_table[child.pos].Value)
			}
		})

//		log("Children Table:")
//		log(children_table)
		this.vdefQuery[detector_index]['@params'].forEach(function(p,i){
	    if(rec == p["@rec"])
	    {
				var p_name = p["@name"]
				var show_param = true;
			 
				for (var p_map in params_map)
				{
					if (p_map == p["@name"]){
						p_name = params_map[p_map]["@translations"][self.language]["name"]
						if (params_map[p_map]["hidden"] == true)
						{
							show_param = false;
						}							
					}
						
				}
				if (p_name == "Unit")
					show_param = false
				var param_is_a_child = self.check_children(children_table, p["@name"]).exists
				var children = self.check_parent(children_table, p["@name"])
				var children_values = ""
				if (children.exists)
				{
					children.pos.forEach(function(pos,j){
						if ((children_table[pos].Value != '') && (children_table[pos].Value != ' ') && (children_table[pos].Value))
							children_values += ", "+children_table[pos].Value
					})
				}
				var value = (word_array[p["@i_var"]] >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);
	    	if(p["@type"] == "rec_date")
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + (((value>>9) & 0x7f) + 1996) + "/" + self.pad(((value >> 5) & 0xf),2) + "/" + self.pad(((value) & 0x1f),2) + children_values })
	    	}
	    	else if(p['@type'] == "mm")
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + eval(vdefMap["@func"]["mm"]).apply(null,[value, self.record_deps[detector_index][p['@dep'][0]]]) + children_values})
				}
	    	else if(p['@type'] == 'prod_name_u16_le')
	    	{
				  var bytes_len = p["@bit_len"]>>3; //number of bytes occupied by the product name.
				  var prod_name_pos = p["@i_var"]*2;
//					if (rec == 1)
//						prod_name_pos += 2;
				  var prod_name_array = buf.slice(prod_name_pos, prod_name_pos + bytes_len - 1);
					var prod_name = ""
				  prod_name_array.forEach(function (val){prod_name = prod_name + String.fromCharCode(val)});
					self.param_last_name_db[detector_index] = prod_name
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: prod_name + children_values})
				}
	    	else if(p['@type'] == 'phase')
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.phase(value, p, i, detector_index, self.vdefQuery) + children_values})
				}
	    	else if(p['@type'] == 'rej_del')
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.rej_del(value, p, i, detector_index, self.vdefQuery) + children_values})
				}
	    	else if(p['@type'] == 'belt_speed')
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.belt_speed(value, p, i, detector_index) + children_values})
				}
	    	else if(p['@type'] == 'eye_rej_mode')
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.eye_rej_mode(value, p, 0, i, detector_index, word_array[p["@i_var"]], self.vdefQuery) + children_values})
	    	}
	    	else if(p['@type'] == 'phase_mode')
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.phase_mode(value, p, 0, i, detector_index, word_array[p["@i_var"]], self.vdefQuery) + children_values})
				}
	    	else if(p['@type'] == 'password8')
	    	{
	        value = word_array[p["@i_var"]];
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.password8(value, i, detector_index) +children_values})
	    	}
	    	else if((p['@type'] == 'rej_chk') || (p['@type'] == 'rej_mode') || (p['@type'] == 'rej_latch') || (p['@type'] == 'peak_mode') || ( (p['@type'] == 'ipv4_address') && (p['@dep']) ) )
	    	{
					var aux = self.parse_and_print_param_1_dep(value, p, 0, i, detector_index, word_array[p["@i_var"]], self.vdefQuery)[1];
          var lg = 'english'
          if (vdefMap["@lists"][p['@labels']][self.language] && vdefMap["@lists"][p['@labels']][self.language][aux])
            lg = self.language									
					self.param_last_val_db[detector_index][p["@name"]]=vdefMap["@lists"][p['@labels']][lg][aux];
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + self.parse_and_print_param_1_dep(value, p, 0, i, detector_index, word_array[p["@i_var"]], self.vdefQuery) + children_values})
				}
	    	else if(p["@labels"])
	    	{
					self.param_last_val_db[detector_index][p["@name"]]=value;
					if ((!param_is_a_child) && (show_param == true))
					{
						log(p["@name"])
	          var lg = 'english'
	          if (vdefMap["@lists"][p['@labels']][self.language] && vdefMap["@lists"][p['@labels']][self.language][value])
	            lg = self.language									
						self.parameters_table.push({Name: p_name, Value: "" + vdefMap["@lists"][p['@labels']][lg][value] + children_values})
					}
          if (p['@labels']=="AppUnitDist")
					{
						self.record_deps[detector_index]["SysRec.MetricUnits"]=value;
						self.vdefQuery[detector_index]['@params'].forEach(function(p,i){
							if(p['@type']=='mm')
								eval(vdefMap["@func"]["mm"]).apply(null,[self.param_last_val_db[detector_index][p["@name"]],value]);
							else if(p['@type']=='belt_speed')
								self.belt_speed(self.param_last_val_db[detector_index][p["@name"]],p,i, detector_index);
						});

					}
					else if(p['@labels']=="RejDelClock")
					{
						self.record_deps[detector_index]["ProdRec.RejModeEmu"]=value;
						self.vdefQuery[detector_index]['@params'].forEach(function(p,i){
							if(p['@type']=='rej_del')
								self.rej_del(self.param_last_val_db[detector_index][p["@name"]],p,i, detector_index, self.vdefQuery);
						});
					}
				}
	      else
	      {
					self.param_last_val_db[detector_index][p["@name"]]=value;
	      	//log(p["@name"] + ": " + value);
					if(p["@name"] == "Sens")
						self.sensitivity = value;
					if ((!param_is_a_child) && (show_param == true))
						self.parameters_table.push({Name: p_name, Value: "" + value + children_values})
	      }
			}
		})
			
		}
		//log(self.parameters_table[detector_index])
	}
	parse_rec(buf, e, bitArray){
	  var key = buf[0]|buf[1]<<8;
	  var idx = key & 0xff;
	  var rec;
	  var res = "";
		var event_info = {string: "",
											date_time:{year: null, month: null, day: null, hours: null, min: null, sec: null},
											net_poll_h: null,
											parameters: [],
											rejects:{signal: null, number: null},
											test:{operator_no: null, request: null, type: null, signal: null},
											faults:[] };

	  if((e=="NET_POLL_PROD_SYS_VAR"))
	  {
//	    console.log("System Records:");
	    rec = 0;
	  }
	  else
	  {
//	    console.log("Product Records:");
	    rec = 1;
	  }
	  if(idx == 0)
	  {
	    var date_time = this.parse_date_time(buf.slice(2,6));
			event_info.date_time.year = date_time[0];
			event_info.date_time.month = date_time[1];
			event_info.date_time.day = date_time[2];
			event_info.date_time.hours = date_time[3];
			event_info.date_time.min = date_time[4];
			event_info.date_time.sec = date_time[5];
	    var prod_no = buf[7]|buf[8]<<8;
	    var word_array = this.convert_word_array(buf.slice(0));

//	    console.log("Date(yyyy/mm/dd): " + date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2));
//	    console.log("Time(hh:mm:ss): " + this.pad(date_time[3],2) + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2));
//	    console.log("Product No.: " + prod_no);
			var i = 0;
	    for(var dep in this.vdef[0]["@deps"])
	    {
	      if(rec == this.vdef[0]["@deps"][dep]["@rec"])
	      {
	        var array_pos = this.vdef[0]["@deps"][dep]["@i_var"];
	        var bit_pos = this.vdef[0]["@deps"][dep]["@bit_pos"];
	        var bit_len = this.vdef[0]["@deps"][dep]["@bit_len"];
	        this.record_deps[dep] = (word_array[array_pos] >> bit_pos) & ((1<<bit_len)-1);
	      }
	    }
			event_info.string = event_info.string + date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2) + ":"
			+ this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e + "\n";
	  }
	  else
	  {
	    var word = buf.readUInt16LE(2);
	    var date_time = this.parse_date_time(buf.slice(4,8));
	    var word_array = this.convert_word_array(buf.slice(0));
//	    console.log("Date(yyyy/mm/dd): " + date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2));
//	    console.log("Time(hh:mm:ss): " + this.pad(date_time[3],2) + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2));
			event_info.date_time.year = date_time[0];
			event_info.date_time.month = date_time[1];
			event_info.date_time.day = date_time[2];
			event_info.date_time.hours = date_time[3];
			event_info.date_time.min = date_time[4];
			event_info.date_time.sec = date_time[5];
	
	    event_info.string = event_info.string + date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2) + ":"
			+ this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => ";
	  }
	  var buf_rec = buf.slice(0)
	  var parameters = []
	  for (var i = 0; i < bitArray.length; i++)
					{
						var byte = bitArray[i]
						if (byte && buf_rec)
						{
							var bit_mask = 1;
							for (var j = 0; j < 8; j++)
							{
								if (byte & bit_mask) //Found a changed word
								{
									var idx = i*8+j //word position in the vdef params array with a change
//									log("Found a changed word at position: "+idx)
									this.vdefQuery[0]['@params'].forEach(function(p){
										if (((idx == p["@i_var"]) && (p['@bit_len'] <= 16) && (rec == p['@rec'])) || 
										((idx >= p["@i_var"]) && (idx < (p["@i_var"] + (p['@bit_len']>>4))) && (p['@bit_len'] > 16) && (rec == p['@rec'])))
										{
											if(parameters.indexOf(p['@name'])==-1)
											{
//												log("buf_rec: ")
//												log(buf_rec)
												if (p["@bit_len"] == 32)
													var val = [buf_rec.readUInt16BE(p['@i_var']*2) , buf_rec.readUInt16BE(p['@i_var']*2+2)]
												else if (p["@bit_len"] > 32)
													var val = buf_rec.slice(p['@i_var']*2, p['@i_var']*2 + (p['@bit_len']>>3))
												else
												{
													var val = (buf_rec.readUInt16LE(p['@i_var']*2) >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1)
													if (val > 32767)
														val = (-1)*((val ^ 0xffff)+1)			
												}
//												log("Potential Parameter change: "+p['@name'])
//												log("Value: "+val)
									
													parameters.push(p['@name'])	
											}
										}
									})
								}
								bit_mask <<= 1;
							}
						}
					}
		event_info.net_poll_h = e;
		var self = this;
		var pos = 0;
	  this.vdef[0]['@params'].forEach(function(p,i){
	  	if(parameters.indexOf(p['@name'] != -1)){
	    if(rec == p["@rec"])
	    {
	    //  if(idx == 0)
	        var value = (word_array[p["@i_var"]] >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);
	      //else if(idx == p["@i_var"])
	       // var value = (word >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);

	      if((idx == 0)||(idx == p["@i_var"]))
	      {
	        if(p["@type"] == "rec_date")
	        {
//          console.log(p["@name"] + ": " + (((value>>9) & 0x7f) + 1996) + '/' + self.pad(((value >> 5) & 0xf),2) + '/' + self.pad(((value >> 5) & 0xf),2));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
							event_info.string = event_info.string + p["@name"] + ": " + (((value>>9) & 0x7f) + 1996) + '/' + self.pad(((value >> 5) & 0xf),2) + '/' + self.pad((value & 0x1f),2) + '\n';
							var date = (((value>>9) & 0x7f) + 1996) + '/' + self.pad(((value >> 5) & 0xf),2) + '/' + self.pad((value & 0x1f),2);
							event_info.parameters[pos] = {param_name: p["@name"], value: date,label:{type: null, value: null}, units: null};
							pos = pos + 1;
						}

	        }
	        else if(p['@type'] == "mm")
	        {

						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
	            event_info.string = event_info.string + p["@name"] + ": " + self.mm(value, self.record_deps[p['@dep'][0]],i) + '\n';

							event_info.parameters[pos] = {param_name: p["@name"], value: null,label:{type: null, value: null}, units: null};

							if(self.record_deps[p['@dep'][0]] == 0)
							{
								event_info.parameters[pos].value = (value/25.4).toFixed(2);
								event_info.parameters[pos].units = "in";
							}
							else
							{
								event_info.parameters[pos].value = value;
								event_info.parameters[pos].units = "mm";
							}
							pos = pos + 1;
						}
	        }
	        else if(p['@type'] == 'prod_name_u16_le')
	        {
	//          console.log(p["@name"] + ": " + self.prod_name_u16_le(buf, p, idx, i));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{

							var prod_name = self.prod_name_u16_le(buf, p, idx, i);
	            event_info.string = event_info.string + p["@name"] + ": " + prod_name + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: prod_name, label:{type: null, value: null}, units: null};
							pos = pos + 1;
						}
	        }
	        else if(p['@type'] == 'phase')
	        {
//	          console.log(p["@name"] + ": " + self.phase(value, p, i));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;

							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = self.vdef[0]['@deps'][p['@dep'][0]]['@labels'];
							event_info.parameters[pos].label.value = self.phase(value, p, i);

							if(event_info.parameters[pos].label.value == 0)
								event_info.parameters[pos].value = ((self.frac_value(value)*45)+90).toFixed(2);
							else
								event_info.parameters[pos].value = (self.frac_value(value)*45).toFixed(2);

							event_info.string = event_info.string + p["@name"] + ": " + event_info.parameters[pos].value + ' ' + self.vdef[0]['@labels'][event_info.parameters[pos].label.type]['english'][event_info.parameters[pos].label.value] + '\n';
							pos = pos + 1;
						}
	        }
	        else if(p['@type'] == 'rej_del')
	        {
	//          console.log(p["@name"] + ": " + self.rej_del(value, p, i));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
	            event_info.string = event_info.string + p["@name"] + ": " + self.rej_del(value, p, i) + '\n';

							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = self.vdef[0]['@deps'][p['@dep'][0]]['@labels'];
							event_info.parameters[pos].label.value = self.record_deps[p['@dep'][0]];
						  if(event_info.parameters[pos].label.value == 0)
								event_info.parameters[pos].value = (value/231).toFixed(2);
							else
								event_info.parameters[pos].value = value;
							pos = pos + 1;
						}
	        }
	        else if(p['@type'] == 'belt_speed')
	        {
//	          console.log(p["@name"] + ": " + self.belt_speed(value, p, i));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
	            event_info.string = event_info.string + p["@name"] + ": " + self.belt_speed(value, p, i) + '\n';

							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							var speed = 60*(231/value);

							if(self.record_deps[p['@dep'][1]] != 0)
							{
								event_info.parameters[pos].value = value;
							}
							else if(self.record_deps[p['@dep'][0]] == 0)
							{
								event_info.parameters[pos].value = (speed*3.281).toFixed(2);
								event_info.parameters[pos].units = "ft/min";
							}
							else if(self.record_deps[p['@dep'][0]] == 1)
							{
								event_info.parameters[pos].value = speed.toFixed(2);
								event_info.parameters[pos].units = "M/min";
							}
							pos = pos + 1;
						}
	        }
	        else if(p['@type'] == 'eye_rej_mode')
	        {
//	          console.log(p["@name"] + ": " + self.eye_rej_mode(value, p, idx, i, word));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
							var aux = self.eye_rej_mode(value, p, idx, i, word);
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef[0]['@labels'][p['@labels']]['english'][aux] + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = p['@labels'];
							event_info.parameters[pos].label.value = self.eye_rej_mode(value, p, idx, i, word);
							pos = pos + 1;
						}
        	}
	        else if(p['@type'] == 'phase_mode')
	        {
//	          console.log(p["@name"] + ": " + self.phase_mode(value, p, idx, i, word));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
							var aux = self.phase_mode(value, p, idx, i, word);
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef[0]['@labels'][p['@labels']]['english'][aux] + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = p['@labels'];
							event_info.parameters[pos].label.value = self.phase_mode(value, p, idx, i, word);
							pos = pos + 1;
						}
        	}
	        else if(p['@type'] == 'password8')
	        {
	          if(idx == 0)
	            value = word_array[p["@i_var"]];
	          else if(idx == array_pos)
	            value = word;
//	          console.log(p["@name"] + ": " + self.password8(value, i));
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
							//event_info.string = ""
//            	res = res + p["@name"] + ": " + self.password8(value, i) + '\n';
						}
	        }
	        else if(((p['@type'] == 'rej_chk') || (p['@type'] == 'rej_mode') || (p['@type'] == 'rej_latch') || (p['@type'] == 'peak_mode') || (p['@type'] == 'ipv4_address'))&& (typeof p['@dep'] != 'undefined'))
	        {
//	          console.log(p["@name"] + ": " + self.parse_and_print_param_1_dep(value, p, idx, i, word));
						var aux = self.parse_and_print_param_1_dep(value, p, idx, i, word);
						if((self.param_last_val[p["@name"]]!=self.vdef[0]['@labels'][p['@labels']]['english'][aux]) || (idx == 0))
						{
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef[0]['@labels'][p['@labels']]['english'][aux] + '\n';
							self.param_last_val[p["@name"]]=self.vdef[0]['@labels'][p['@labels']]['english'][aux];
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = p['@labels'];
							event_info.parameters[pos].label.value = self.parse_and_print_param_1_dep(value, p, idx, i, word);
							pos = pos + 1;
						}

        	}
	        else if(p["@labels"])
	        {
//	          console.log(p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][value]);
					
	          	event_info.string = event_info.string + p["@name"] + ": " + self.vdef[0]['@labels'][p['@labels']]['english'][value] + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: p['@labels'], value: value}, units: null};
							pos = pos + 1;
						
            if(p['@labels']=="AppUnitDist")
						{
							self.record_deps["SysRec.MetricUnits"]=value;
						}
						else if(p['@labels']=="RejDelClock")
						{
							self.record_deps["ProdRec.RejModeEmu"]=value;
						}
        	}
	        else
	        {
				event_info.string = event_info.string + p["@name"] + ": " + value + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: value, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].value = value;
							pos = pos + 1;
			}
	      }
	      else if((idx > p['@i_var']) && (idx < (p['@i_var']+(p['@bit_len']>>4))) && (p['@type'] == 'prod_name_u16_le'))
	      {
//	        console.log(p["@name"] + ": " + self.prod_name_u16_le(buf, p, idx,i, detector_index));
	        event_info.string = event_info.string + p["@name"] + ": " + self.prod_name_u16_le(buf, p, idx,i) + '\n';
					event_info.parameters[0] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
					event_info.parameters[0].value = self.prod_name_u16_le(buf, p, idx,i);
					pos = pos + 1;
	      }
	    	}
		}
	  });
	  buf = null;
	  return event_info;
	}

	mm(value, units, i){
	  var res;
	  if(units == 0)
		{
			res = (value/25.4).toFixed(2) + " in";
		}
	  else
		{
			res = value + " mm";
		}

	  return res;
	}

	prod_name_u16_le(buf, p, idx, i){
	  var res = "";
	  var bytes_len = p["@bit_len"]>>3; //number of bytes occupied by the product name.
	  if(idx == 0)
	  {
	    var prod_name_pos = 9 + p["@i_var"]*2;
	    var prod_name_array = buf.slice(prod_name_pos, prod_name_pos + bytes_len);
	    prod_name_array.forEach(function (val){res = res + String.fromCharCode(val)});
	  }
	  else if((idx >= p["@i_var"]) && (idx < p["@i_var"]+(bytes_len<<1)))
	  {
	    var char_pos = 2*(idx - p["@i_var"]);
			var str1 = this.param_last_val[p["@name"]].toString().substring(0,char_pos);
			var str2 = String.fromCharCode(buf[2]) + String.fromCharCode(buf[3]);
			var str3 = this.param_last_val[p["@name"]].toString().substring(char_pos+2,bytes_len);
			if(str1 != "0")
				res = str1 + str2 + str3;
			else {
				for(var j=0; j < char_pos; j++)
		      res = res + '*';
		    res = res + String.fromCharCode(buf[2]) + String.fromCharCode(buf[3]);
		    for(var j=0; j < bytes_len - 2 ; j++)
		      res = res + '*';
			}
	  }
		this.param_last_val[p["@name"]] = res;
//		console.log(res)
	  return res;
	}

	frac_value(value){
	  return (value/(1<<15));
	}

	phase(value, p, i){
	  var res;
	  var wet = this.record_deps[p['@dep'][0]];
	  var det = this.record_deps[p['@dep'][1]];

	  if(wet == 0)
	    res = 0;
	  else if(det == 0)
	    res = 1;
	  else
	    res = 2;


	  return res;
	}

	rej_del(value, p, i){
	  var res;
	  var clock_val = this.record_deps[p['@dep'][0]];
	  var label_type = this.vdef[0]['@deps'][p['@dep'][0]]['@labels'];
	  var label = this.vdef[0]['@labels'][label_type]['english'][clock_val];

	  if(clock_val == 0)
		{
			res = (value/231).toFixed(2) + " " + label;
		}
	  else
		{
			res = value + " " + label;
		}
	  return res;
	}

	belt_speed(value, p, i){
	  var res;
	  var units = this.record_deps[p['@dep'][0]];
	  var clock_source = this.record_deps[p['@dep'][1]];
	  var speed = 60*(231/value);

	  if(clock_source != 0)
		{
			res = value;
		}
	  else if(units == 0)
		{
			res = (speed*3.281).toFixed(2) + " ft/min";
		}
	  else if(units == 1)
		{
			res = speed.toFixed(2) + " M/min";
		}

	  return res;
	}

	eye_rej_mode(value, p, idx, i, word){
	  var res;
	  var photo;
	  var width;

	  if(idx == 0)
	  {
	    photo = this.record_deps[p['@dep'][0]];
	    width = this.record_deps[p['@dep'][1]];
	  }
	  else if(idx == p['@i_var'])
	  {
	    var bit_pos = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_len'];
	    photo = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[p['@dep'][0]]=photo;
	    bit_pos = this.vdef[0]['@deps'][p['@dep'][1]]['@bit_pos'];
	    bit_len = this.vdef[0]['@deps'][p['@dep'][1]]['@bit_len'];
	    width = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[p['@dep'][1]]=width;
	  }
	  if(photo == 0)
			res = 3;
		else if(value == 0)
		{
			if(width == 0)
				res = 0;
			else
				res = 2;
		}
		else
			res = 1;
//	  return this.vdef['@labels'][p['@labels']]['english'][res];
		return res;
	}

	phase_mode(value, p, idx, i, word){
	  var res;
	  if(idx == 0)
	  {
	    if(this.record_deps[p['@dep'][0]] == 0)
	    {
	      if(value == 0)
	        res = 0;
	      else
	        res = 1;
	    }
	    else
	      res = 2;
	  }
	  else if(idx == p['@i_var'])
	  {
	    if(value == 0)
	      res = 0;
	    else
	      res = 1;
	    this.record_deps['ProdRec.SigPath[0].PhaseWet']=value;
	  }
	  else if(idx == this.vdef[0]['@deps'][p['@dep'][0]]['@i_var'])
	  {
	    var bit_pos = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_len'];
	    var val_dep = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[p['@dep'][0]]=val_dep;
	    if(val_dep == 0)
			{
				if(value == 0)
					res = 0;
				else
					res = 1;
			}
			else
				res = 2;
	  }
//	  return this.vdef['@labels'][p['@labels']]['english'][res];
		return res;
	}

	password8(value, i){
	  var res = String.fromCharCode(((value & 0xf000) >> 12) + 48);
	  res = res + String.fromCharCode(((value & 0xf00) >> 8) + 48);
	  res = res + String.fromCharCode(((value & 0xf0) >> 4) + 48);
	  res = res + String.fromCharCode((value & 0xf) + 48);
	  return res;
	}

	parse_and_print_param_1_dep(value, p, idx, i, word){
	  var res;
	  if(idx == 0)
	  {
	  	console.log(p)
	    if(this.record_deps[p['@dep'][0]] == 0)
	    {
	      if(value == 0)
	        res = 0;
	      else
	        res = 1;
	    }
	    else
	      res = 2;
	  }
	  else if(idx == p['@i_var'])
	  {
	    var bit_pos = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef[0]['@deps'][p['@dep'][0]]['@bit_len'];
	    var val_dep = (word >> bit_pos) & ((1<<bit_len)-1);
	    if(val_dep == 0)
			{
				if(value == 0)
					res = 0;
				else
					res = 1;
			}
			else
				res = 2;
	  }
//		res = this.vdef['@labels'][p['@labels']]['english'][res];
	  return res;
	}

	clear_event_info(){
		this.event_info = {string: "",
											date_time:{year: null, month: null, day: null, hours: null, min: null, sec: null},
											net_poll_h: null,
											parameters: null,
											rejects:{signal: null, number: null},
											test:{operator_no: null, request: null, type: null, signal: null},
											faults:[] };

	}
}

var fs = require('fs');
var http = require("http"), zlib = require("zlib");

function getGzipped(url, callback) {
    // buffer to store the streamed decompression
    var buffer = [];
    var req = http.get(url, function(res) {
        // pipe the response into the gunzip to decompress
        var gunzip = zlib.createGunzip();
        res.pipe(gunzip);

        gunzip.on('data', function(data) {
            // decompression chunk ready, add it to the buffer
            buffer.push(data.toString())

        }).on("end", function() {
            // response and decompression complete, join the buffer and return
            callback("ok", buffer.join(""));

        }).on("error", function(e) {
            callback("error", null);
        })
    }).on('error', function(e) {
      console.log("error: " + e)
        callback("error")
    });
    req.on('socket', function (socket) {
    socket.setTimeout(1000);
    socket.on('timeout', function() {
        req.abort();
    });
});
}



/*
var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
    }
    ++alias;
  });
});
*/


module.exports = NetPollEvents;
