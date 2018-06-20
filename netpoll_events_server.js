'use strict';
var Fti = require('./fti-flash-node');
var arloc = Fti.ArmFind;
var dgram = require('dgram');

const KAPI_RPC_ETHERNETIP = 100;
const KAPI_RPC_REJ_DEL_CLOCK_READ = 70;
var KAPI_RPC_NETPOLLSTREAM;
const DRPC_NUMBER = 19;
const NP_RPC = 13;

class NetPollEvents{
	constructor(detector_ip, vdef, callback)
	{
		var self = this;
		this.ip = detector_ip;
		this.vdef = vdef;
		KAPI_RPC_NETPOLLSTREAM = vdef['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0];
		this.record_deps = [];
		this.param_last_val = [];
		this.param_last_val["ProdName"] = "*********************";
		this.faults = "";
		this.faults_array = [];
		this.event_info = {string: "",
											date_time:{year: null, month: null, day: null, hours: null, min: null, sec: null},
											net_poll_h: null,
											parameters: null,
											rejects:{signal: null, number: null},
											test:{operator_no: null, request: null, type: null, signal: null},
											faults:[] };
		this.callback = callback;
		self.init_net_poll_events_server();
	}


	init_net_poll_events_server(){
		var self = this;
		var so = dgram.createSocket('udp4')

		so.on("listening", function () {
			self.init_net_poll_events(so.address().port);
		});
		so.on('message', function(e,rinfo){
//				console.log("new message from: "+rinfo.address)
			if(self.ip == rinfo.address){
//		      console.log(e)
				if(e)
				{
					self.parse_net_poll_event(e);
				}
				e = null;
				rinfo = null;
			}
		});

		so.bind({address: '0.0.0.0',port: 0,exclusive: true});
	}

	init_net_poll_events(port){
	  var FtiRpc = Fti.Rpc.FtiRpc;
		var self = this;
		var dsp = FtiRpc.udp(this.ip);
		console.log(port)
		dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
		setTimeout(function () {
			dsp.rpc0(NP_RPC,[]);
			setTimeout(function () {
				dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_REJ_DEL_CLOCK_READ]);
			}, 100)
		}, 100)
		/*setInterval(function () {
			dsp.rpc0(DRPC_NUMBER,[KAPI_RPC_ETHERNETIP,port]);
			setTimeout(function () {
				dsp.rpc0(NP_RPC,[]);
			}, 100)
		},10000)*/

		dsp.port.socket.on('message', function (message, remote) {
		   // CAN I HANDLE THE RECIVED REPLY HERE????
			 if(message.readUInt16LE(1)==KAPI_RPC_REJ_DEL_CLOCK_READ)
			 {
				 self.record_deps["ProdRec.RejModeEmu"]=message.readUInt16LE(3);
			 }
//			console.log(message);
		});
  }

	parse_net_poll_event(buf){
		var key = buf.readUInt16LE(0);
	  	var res = "";
		var self = this;
//	  console.log("packet received: " + buf.toString('hex'));
//	  console.log("Key: " + "0x" + key.toString(16));
		var value = buf.readUInt16LE(2);

	  for(var e in this.vdef["@net_poll_h"])
	  {
	    if((this.vdef["@net_poll_h"][e] == (key & 0xf000)) && ((e=="NET_POLL_PROD_SYS_VAR") || (e=="NET_POLL_PROD_REC_VAR")))
	    {
	    		//ignore these for now
				this.event_info = this.parse_rec(buf,e);
			//	if((this.event_info.parameters[0].param_name != 'PRecordDate') && (this.event_info.parameters[0].param_name != 'SRecordDate')){
					this.callback(this.event_info, this.ip);
			//	}
				
	    }
	    else if((this.vdef["@net_poll_h"][e] == key) && (e=="NET_POLL_FAULT"))
	    {
	      var value = buf.readUInt16LE(2);
	      var date_time = this.parse_date_time(buf.slice(4,8));

	      var idx = key & 0xff;
				this.faults = this.parse_faults(key,value).string;
				this.faults_array = this.parse_faults(key,value).faults;
	    }
		else if(((this.vdef["@net_poll_h"][e]+1) == key) && (e=="NET_POLL_FAULT"))
	    {
	      var value = buf.readUInt16LE(2);
	      var date_time = this.parse_date_time(buf.slice(4,8));
				this.clear_event_info();
				this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)
																	+ ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;
				this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};
				this.event_info.net_poll_h = e;
	      var idx = key & 0xff;
				this.faults = this.faults + this.parse_faults(key,value).string;
				if(this.faults == "")
					this.faults = "No faults";
				if(this.parse_faults(key,value) != "")
				{
					this.event_info.string = this.event_info.string + ": " + this.faults;
					this.event_info.faults = this.faults_array.concat(this.parse_faults(key,value).faults);
					this.callback(this.event_info, this.ip);
				}
	    }
	    else if(this.vdef["@net_poll_h"][e] == key)
	    {
	      var value = buf.readUInt16LE(2);
	      var date_time = this.parse_date_time(buf.slice(4,8));

				this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)
																	+ ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;
				this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};
				this.event_info.net_poll_h = e;
				this.event_info.parameters = [];
				this.event_info.faults = [];

				if(e == "NET_POLL_REJECT_ID")
				{
					this.event_info.string = this.event_info.string + ", Signal: " + this.event_info.rejects.signal + ", Rejects: " + value;
					this.event_info.rejects.number = value;
				}
				else if(e == "NET_POLL_OPERATOR_NO")
				{
					this.event_info.string = this.event_info.string + " " + (value&0xff).toString();
					this.event_info.test.operator_no = value & 0xff;
					if((value&0xff00) == 256)
					{
						this.event_info.string = this.event_info.string + ", Test Request Manual1";
						this.event_info.test.request = "Manual1";
					}
					else if((value&0xff00) == 512)
					{
						this.event_info.string = this.event_info.string + ", Test Request Halo1";
						this.event_info.test.request = "Halo1";
					}
					else if((value&0xff00) == 768)
					{
						this.event_info.string = this.event_info.string + ", Test Request Manual2";
						this.event_info.test.request = "Manual2";
					}
					else if((value&0xff00) == 1024)
					{
						this.event_info.string = this.event_info.string + ", Test Request Halo2";
						this.event_info.test.request = "Halo2";
					}
				}
				this.callback(this.event_info, this.ip);
	    }
			else if(this.vdef["@net_poll_h"][e] == (key & 0xff00))
			{
				var value = buf.readUInt16LE(2);

				if(e == "NET_POLL_REJECT")
				{
					var date_time = this.parse_date_time(buf.slice(4,8));
					this.event_info.string = date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2) + " " + this.pad(date_time[3],2)
																		+ ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2) + " => " + e;
					this.event_info.date_time = {year: date_time[0], month: date_time[1], day: date_time[2], hours: date_time[3], min: date_time[4], sec: date_time[5]};
					this.event_info.net_poll_h = e;
					this.event_info.parameters = [];
					this.event_info.faults = [];
					if((key & 1<<2) && !(key & 1<<3))
					{
						this.event_info.string = this.event_info.string + " => Test: Fe, " + value.toString();
						this.event_info.test.type = "Fe";
						this.event_info.test.signal = value;
						this.callback(this.event_info, this.ip);
					}
					else if(!(key & 1<<2) && (key & 1<<3))
					{
						this.event_info.string = this.event_info.string + " => Test: NFe, " + value.toString();
						this.event_info.test.type = "NFe";
						this.event_info.test.signal = value;
						this.callback(this.event_info, this.ip);
					}
					else if((key & 1<<2) && (key & 1<<3))
					{
						this.event_info.string = this.event_info.string + " => Test: SS, " + value.toString();
						this.event_info.test.type = "SS";
						this.event_info.test.signal = value;
						this.callback(this.event_info, this.ip);
					}
					else
					{
						this.event_info.test = {operator_no: null, request: null, type: null, signal: null};
						this.event_info.string = this.event_info.string + ": " + value.toString();
						this.event_info.rejects.signal = value;
						this.callback(this.event_info, this.ip);
					}

				}
			}
	  }
	  buf = null;
//	  return event_info;
	}

	pad(num, size){
	  return ('000000000' + num).substr(-size);
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

	parse_rec(buf, e){
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
	    var word_array = this.convert_word_array(buf.slice(9));
//	    console.log("Date(yyyy/mm/dd): " + date_time[0] + "/" + this.pad(date_time[1],2) + "/" + this.pad(date_time[2],2));
//	    console.log("Time(hh:mm:ss): " + this.pad(date_time[3],2) + ":" + this.pad(date_time[4],2) + ":" + this.pad(date_time[5],2));
//	    console.log("Product No.: " + prod_no);
			var i = 0;
	    for(var dep in this.vdef["@deps"])
	    {
	      if(rec == this.vdef["@deps"][dep]["@rec"])
	      {
	        var array_pos = this.vdef["@deps"][dep]["@i_var"];
	        var bit_pos = this.vdef["@deps"][dep]["@bit_pos"];
	        var bit_len = this.vdef["@deps"][dep]["@bit_len"];
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
		event_info.net_poll_h = e;
		var self = this;
		var pos = 0;
	  this.vdef['@params'].forEach(function(p,i){
	    if(rec == p["@rec"])
	    {
	      if(idx == 0)
	        var value = (word_array[p["@i_var"]] >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);
	      else if(idx == p["@i_var"])
	        var value = (word >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1);

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
//	          console.log(p["@name"] + ": " + self.mm(value, self.record_deps[p['@dep'][0]], i));
//            console.log("Record_deps mm/in: "+p['@dep'][0]+" "+self.record_deps[p['@dep'][0]]);
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
							event_info.parameters[pos].label.type = self.vdef['@deps'][p['@dep'][0]]['@labels'];
							event_info.parameters[pos].label.value = self.phase(value, p, i);

							if(event_info.parameters[pos].label.value == 0)
								event_info.parameters[pos].value = ((self.frac_value(value)*45)+90).toFixed(2);
							else
								event_info.parameters[pos].value = (self.frac_value(value)*45).toFixed(2);

							event_info.string = event_info.string + p["@name"] + ": " + event_info.parameters[pos].value + ' ' + self.vdef['@labels'][event_info.parameters[pos].label.type]['english'][event_info.parameters[pos].label.value] + '\n';
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
							event_info.parameters[pos].label.type = self.vdef['@deps'][p['@dep'][0]]['@labels'];
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
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][aux] + '\n';
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
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][aux] + '\n';
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
						if((self.param_last_val[p["@name"]]!=self.vdef['@labels'][p['@labels']]['english'][aux]) || (idx == 0))
						{
	            event_info.string = event_info.string + p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][aux] + '\n';
							self.param_last_val[p["@name"]]=self.vdef['@labels'][p['@labels']]['english'][aux];
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].label.type = p['@labels'];
							event_info.parameters[pos].label.value = self.parse_and_print_param_1_dep(value, p, idx, i, word);
							pos = pos + 1;
						}

        	}
	        else if(p["@labels"])
	        {
//	          console.log(p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][value]);
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
	          	event_info.string = event_info.string + p["@name"] + ": " + self.vdef['@labels'][p['@labels']]['english'][value] + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: null, label:{type: p['@labels'], value: value}, units: null};
							pos = pos + 1;
						}
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
//	          console.log(p["@name"] + ": " + value);
//	          if(idx != 0)
						if((self.param_last_val[p["@name"]]!=value) || (idx == 0))
						{
							self.param_last_val[p["@name"]]=value;
							event_info.string = event_info.string + p["@name"] + ": " + value + '\n';
							event_info.parameters[pos] = {param_name: p["@name"], value: value, label:{type: null, value: null}, units: null};
							event_info.parameters[pos].value = value;
							pos = pos + 1;
						}
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
	  var label_type = this.vdef['@deps'][p['@dep'][0]]['@labels'];
	  var label = this.vdef['@labels'][label_type]['english'][clock_val];

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
	    var bit_pos = this.vdef['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef['@deps'][p['@dep'][0]]['@bit_len'];
	    photo = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[p['@dep'][0]]=photo;
	    bit_pos = this.vdef['@deps'][p['@dep'][1]]['@bit_pos'];
	    bit_len = this.vdef['@deps'][p['@dep'][1]]['@bit_len'];
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
	  else if(idx == this.vdef['@deps'][p['@dep'][0]]['@i_var'])
	  {
	    var bit_pos = this.vdef['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef['@deps'][p['@dep'][0]]['@bit_len'];
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
	    var bit_pos = this.vdef['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = this.vdef['@deps'][p['@dep'][0]]['@bit_len'];
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
