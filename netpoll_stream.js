'use strict';
const DEBUG_EN = false;
const LOG_EVENTS_DETECTOR = false
const LOG_NP = false
const LOG_RPC = false
const LOG_REPORT = false
const LOG_DATETIME = false
const LOG_EMAIL_PROD_CHANGE_REPORT = false
const LOG_SET_QUERY = false
const LOG_COUNTS = false
var Fti = require('./fti-flash-node');
const sortBy = require('sort-array');
var arloc = Fti.ArmFind;
var dgram = require('dgram');
//var sqlite3 = require('sqlite3').verbose();
//var sleep = require('sleep');
var fs = require('fs');
var moment = require('moment');
var GenReports = require('../genReports.js')
//const path = require('path');
if (fs.existsSync("/home/pi/contact_pi"))
	var vdefMap = JSON.parse(fs.readFileSync("/home/pi/contact_pi/vdefMapStealth.json"))
else if (fs.existsSync("/home/root/contact_pi"))
	var vdefMap = JSON.parse(fs.readFileSync("/home/root/contact_pi/vdefMapStealth.json"))
var params_map = vdefMap["@vMap"]
var netpoll_map = vdefMap["@netpollsmap"]

var updateDatetime = true;
const DATETIME_UPDATE_DETECTOR = false;

var exec = require('child_process').exec;

setInterval(function(){
 	 	updateDatetime = true
},60000)

const KAPI_RPC_ETHERNETIP = 100;

const REMOTE_RPC_PORT = 10010;
const SOURCE_RPC_PORT = 20010;
const NETPOLL_PORT = 20100;

const SET_DIFFERENT_PORTS_PER_DEVICE = false

const DRPC_NUMBER = 19;

const MAX_NUM_ROWS = 50

const COUNT_NONE = 0;
const COUNT_REJECTS = 1;
const COUNT_SETTING_CHANGES = 2;
const COUNT_FAULTS = 3;
const COUNT_PRODUCT_CHANGES = 4;
const COUNT_TESTS = 5;
const COUNT_WARNINGS = 6;
const COUNT_RECORDS = 7;

var hash = require('object-hash');

function log(msg,opt) {
	if (DEBUG_EN || opt)
	{
		console.log(msg)
	}
}

function clock(start) {
    if ( !start ) return process.hrtime();
    var end = process.hrtime(start);
    return Math.round((end[0]*1000) + (end[1]/1000000));
}
function getVal(arr, rec, param){
    //log([rec,key])
   // var param = pVdef[rec][key]
    if(param['@bit_len']>16){
     
      return wordValue(arr, param)
    }else{
      var val;
      if((param['@bit_pos'] + param['@bit_len']) > 16){
        var wd = (swap16(arr[param['@i_var']+1])<<16) | swap16((arr[param['@i_var']]))
        val = (wd >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
        
      }else{
        val = swap16(arr[param["@i_var"]]);
       
      } 
      if(param["@bit_len"] < 16){
        val = (val >> param["@bit_pos"]) & ((1<<param["@bit_len"])-1)
      }
      param = null;
      arr = null;
    
      return val;
    }
}
function swap16(val){
    	return val//return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
}
	
function wordValue(wordArray, p){
	var n = Math.floor(p["@bit_len"]/16);
	var sa = wordArray.slice(p["@i_var"], p["@i_var"]+n)
	if(p["@type"]){
		return Params[p['@type']](sa)
	}
	var str = sa.map(function(e){
			
		return (String.fromCharCode((e%256),(e>>8)));
				
				
	}).join("");
	return str;
}

function parseDeps(vdef, wordArray, rec){
	var data = {};
	
	for(var p in vdef["@deps"]){
		if(vdef["@deps"][p]["@rec"] == rec){
			var setting = getSetting(wordArray, vdef["@deps"][p]);
			data[vdef["@deps"][p]["@name"]] = setting;
		}
	}
		
	return data;

}

function getSetting(wordArray, p){
	if(p["@bit_len"] > 16){
		return wordValue(wordArray, p);

	}else{
		var val = swap16(wordArray[p["@i_var"]]);
		
			
		if(p["@bit_len"] < 16){
			val =  swap16(val);
			val = (val >> p["@bit_pos"]) & ((1<<p["@bit_len"])-1)
		}
		return val;

	}
}

function checkAllZerosBuffer(buf){
	var res = true
	buf.forEach(function(b){
		if (b != 0)
			res = false
	})
	return res
}

class Params{
  static frac_value(int){
    return (int/(1<<15))
  }
  static mm(dist, metric){
    if(metric==0){
      return (dist/25.4).toFixed(1) + " in"

    }
    else{
      return dist + " mm";
    }

  }
  static prod_name_u16_le(sa){
    //log(sa)
    var str = sa.map(function(e){
      return (String.fromCharCode((e%256),(e>>8)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_name_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static dsp_serno_u16_le(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val
  }
  static rec_date(val){
    //needs to be swapped..
    //0xac26 -> 0x26ac (((value>>9) & 0x7f) + 1996) + '/' + self.pad(((value >> 5) & 0xf),2) + '/' + self.pad(((value >> 5) & 0xf),2)
    var dd = val & 0x1f;
    var mm = (val >> 5) & 0xf
    var yyyy = ((val>>9) & 0x7f) + 1996
    return yyyy.toString() + '/' + mm.toString() + '/' + dd.toString();
  }
  static phase_spread(val){
    return Math.round(Params.frac_value(val)*45)
  }
  static phase_wet(val){
    return ((Params.frac_value(val) * 45)).toFixed(2);
  }
  static phase_dry(val){
    if(((Params.frac_value(val) * 45)+90) <= 135){
      return ((Params.frac_value(val) * 45)+90).toFixed(2); 
    }
    else{
      return ((Params.frac_value(val) * 45)).toFixed(2);
      
    }

  }
  static phase(val, wet){
    //log(wet);
    if(wet==0){
      return Params.phase_dry(val);
    }else{
      return Params.phase_wet(val);
    }
  }
  static rej_del(ticks, tack){
    if(tack==0){
      return (ticks/231.0).toFixed(2); //2 decimal float
    }else{
      return ticks;
    }
  }
  static belt_speed(tpm, metric, tack){
    //log(tpm);
    if(tack!=0){

      return tpm;
    }
    var speed = (231.0/tpm) * 60;
    if(metric==0){
      return (speed*3.281).toFixed(1) + ' ft/min'
    }else{
      return speed.toFixed(1) + ' M/min'
    }
  
  }
  static password8(words){
  
    var res = words.map(function(w){
      return ((w & 0xffff).toString(16)) //hex format string
    }).join(',')
  //  log(res);
    return("****")

  }
  static rej_chk(rc1, rc2){
    if (rc2==0){
      if(rc1==0){
        return 0
      }else{
        return 1
      }
    }else{
      return 2
    }
  }
  static rej_mode(photo, rev){
    if (rev==0){
      if (photo==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }

  static rej_latch(latch, toggle){
    if (toggle==0){
      if (latch==0){
        return 0;
      }else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  static prod_name(sa){
    var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();
    //return val;
  }


  static peak_mode(eye, time){
    if (eye==0){
      if (time==0){
        return 0;
      }else{
        return 2;
      }
    }else{
      return 1;
    }
  }


  static eye_rej(photo, lead, width){
    if (photo==0){
      return 3;
    }else{
      if(lead==0){
        if(width==0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
  }
  static phase_mode(wet, patt){
    //log(patt)
    if (patt==0){
      if (wet==0){
        return 0;
      }
      else{
        return 1;
      }
    }else{
      return 2;
    }
  }
  
  static bit_array(val){
    if(val == 0){
      return 0;
    }else{
      var i = 0;
      while(i<16 && ((val>>i) & 1) == 0){
        i++;
      }
      i++; //1 based index
      return i;
    }
  }

  static patt_frac(val){
    return (val/10.0).toFixed(1);
  }

  static eye_rej_mode(val, photo, width){
    if(photo == 0){
      return 3;
    }else{
      if (val == 0){
        if (width == 0){
          return 0;
        }else{
          return 2;
        }
      }else{
        return 1;
      }
    }
    
  }

  static  swap16(val){
      return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
  }

  static  convert_word_array_BE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    //log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16BE(i*2));
    }
    //log(wArray)
    return wArray;

  }

  static convert_word_array_LE(byteArr){
    var b = new Buffer(byteArr)
    var length = byteArr.length/2;
    var wArray = []
    //log(length)
    for(var i = 0; i<length; i++){
      wArray.push(b.readUInt16LE(i*2));
    }
    //log(wArray)
    return wArray;

  }
  static ipv4_address(words){
    //todo
    //log(ip)
    //return ip
   return words.map(function(w){return [(w>>8)&0xff,w&0xff].join('.')}).join('.');
  }
  static username(sa){
   var str = sa.map(function(e){
      return (String.fromCharCode((e>>8),(e%256)));
    }).join("");
    return str.replace("\u0000","").trim();

  }
  static user_opts(opts){
    return opts;
  }
  static password_hash(phash){
    var buf = Buffer.alloc(8);
    buf.writeUInt16LE(phash[1],0);
    buf.writeUInt16LE(phash[0],2);
    buf.writeUInt16LE(phash[2],6);
    buf.writeUInt16LE(phash[3],4);
    return buf;
  }
}

class NetPollEvents{
	constructor(detectorsList, vdefs, db, vdefIds, reportSettings, rpc)
	{
		var self = this;
		this.db = db
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
		this.productEmailCallback = function(){}
		log("Initializing object variables...")
//		this.writing_tables = [];
		this.detector_ptr = 0
		this.events_table = []
		this.parameters_table = []
		this.language = this.read_language_db()
		this.table_updated = false;
		this.sys_rec_ref = []
		this.prod_rec_ref = []
		this.fram_rec_ref = []
		this.sys_prod_refs_ready = []
		this.rpc_state = []

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
        log("detector ip: " + d.ip)
				self.prod_rec[j] = [];
				self.sys_rec[j] = [];
				self.record_deps[j] = [];
  			self.param_last_val[j] = [];
  			self.param_last_val_db[j] = [];
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
				self.reset_faults(j);
//				self.test_bin[j] = [0, 0, 0, 0];
				self.test_bin_opNum[j] = 0;
				self.test_bin_testReq[j] = 0;
				self.test_bin_metalType[j] = 0;
				self.test_bin_signal[j] = 0;
				self.filters.detectors.push(d)
				self.rpc_state[j] = 'START'
		});
//		this.init_process_messages();
		this.get_sys_prod_rec_ref_db()
//		this.get_events_table()

//		if ((vdefs.length > 0) && vdefs[0]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
//			KAPI_RPC_NETPOLLSTREAM = vdefs[0]['@net_poll_h']['NET_POLL_STREAM_EVENT'][1][0];
		this.rpc = rpc
  	this.netpollSocket = null
		this.init_net_poll_events_server();
		this.init_write_netpoll_event_into_db_queue();
		this.get_netpoll_types();
		this.vdefMap = vdefMap;
		this.last_packet_id = [];
		this.detectorsList.forEach(function(det,i){
			self.last_packet_id[i] = null
		})
		//this.initWrDatabaseInterval = null;
		this.wr_db_interval = null;
//		self.init_net_poll_events();
		this.vdefQuery = vdefs
		this.vdefId = vdefIds
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
  	if (reportSettings.productChange == 1)
  		this.productChangeAutoRep = true;
  	else
  		this.productChangeAutoRep = false;
//		this.clearInitWrDatabaseInterval = false
	}

	save_language_db(){
		var row = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='language'").get()
		if (row == undefined)
		{
			this.db.prepare('CREATE TABLE language (data TEXT)').run()
		}
		var stmt = this.db.prepare('INSERT INTO language VALUES (?)');
		stmt.run(this.language)
		this.language = this.read_language_db()
	}

	read_language_db(){
		var res = "english"
		var row = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='language'").get()
		if (row != undefined)
		{
			var row = this.db.prepare("SELECT * FROM language ORDER BY rowid DESC LIMIT 1").get()
			if (row && (row.data != undefined))
				res = row.data
		}
		return res
	}
	
	clear_intervals(){
		log("Clearing intervals ...")
		clearInterval(this.initWrDatabaseInterval);
		//clearInterval(this.wr_db_interval)
	}
	
	get_netpoll_types(){
		var self = this
		this.filters.type.types = []
		this.detectorsList.forEach(function(d,i){
			if (self.vdef[i])
			{
				for (var e in self.vdef[i]["@net_poll_h"])
				{
					log(e)
					if (netpoll_map[e])
					{
						var translated_event = netpoll_map[e]['@translations'][self.language]['name']
						if (translated_event != "")
						{
							var type_found = false
							self.filters.type.types.forEach(function(type){
								if (type == translated_event)
									type_found = true
							})
							if (!type_found)
								self.filters.type.types.push(translated_event)
						}
					}
				}
			}
		})
		this.filters.type.selectedType = this.filters.type.types[0]
//		log(self.filters.type.types)
	}

	init_write_netpoll_event_into_db_queue(){
		var self = this
		this.detectorsList.forEach(function(d,i){
			self.netpoll_queue_ptr[i] = 0;
			self.netpoll_queue[i] = [];
			self.netpoll_queue[i][0] = {}
			self.wr_ptr[i] = 0
		})	
		this.initWrDatabaseInterval = setInterval (this.wr_db_callback.bind(this),1000)
	}

	wr_db_callback(){
		var self = this
		var counter = 0

		//log("Cycle starts.")
		clearInterval(this.wr_db_interval)
		this.wr_db_interval = setInterval(function(){

			if (self.detector_ptr >= self.detectorsList.length)
				self.detector_ptr = 0
			var i = self.detector_ptr
			if (!self.flag_queue_is_busy[i])
			{
				if (self.netpoll_queue_ptr[i] > 0)
				{
					if (self.db_processing == false)
					{
						if (self.sys_prod_refs_ready[i])
						{
							log("Writing event into db")
							self.write_netpoll_event_into_db(self.netpoll_queue[i],i,self.netpoll_queue_ptr[i]);
							self.netpoll_queue_ptr[i] = 0;
							self.netpoll_queue[i] = [];
							self.netpoll_queue[i][0] = {}
							self.detector_ptr+=1;
							counter +=1
							if (counter >= self.detectorsList.length)
							{

								clearInterval(self.wr_db_interval)
								//log("End of cycle")

							}
						}
					}
				}
				else
				{
					self.detector_ptr+=1;
					counter +=1
					if (counter >= self.detectorsList.length)
					{

						clearInterval(self.wr_db_interval)
					//	log("End of cycle")

					}
				}
			}
		},1)
		
//		if (this.clearInitWrDatabaseInterval)
//		{
//			this.clearInitWrDatabaseInterval = false;
//			clearInterval(this.initWrDatabaseInterval);
//		}
	}
//this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, bitArray, sys_rec, 'NET_POLL_PROD_SYS_VAR', username)
	queue_db_wr_netpoll_event(idx, vdef_id, key, values, bitArray, recBuf, e, username, group_id){
		log("queue_db_wr_netpoll_event: ")
		log(e)
		this.flag_queue_is_busy[idx] = true;
		this.netpoll_queue[idx][this.netpoll_queue_ptr[idx]] = {vdef_id: vdef_id, key: key, values: values, e: e, rec_buf: recBuf, bit_array: bitArray, username: username, group_id: group_id}
		this.netpoll_queue_ptr[idx] += 1;
		this.flag_queue_is_busy[idx] = false;
	}

	convert_record_deps_to_buf(deps){
		var data = [];
		for (var dep in deps)
			data.push(deps[dep])
		return (new Buffer(data))
	}
/*	
	convert_buf_to_record_deps(buf){
		var ptr = 0;
    for(var dep in this.vdef[detector_index]["@deps"])
		{
      this.record_deps[detector_index][dep] = buf.readUInt8(ptr)
			ptr += 1		
		}
	}
*/	
	find_last_value_event(type,rec,events){
		var init = events.length - 2
		for (var i=init; i>=0;i--)
		{
			if (events[i].Rec == rec)
				return events[i].Value
		}
	}

	get_sys_prod_rec_ref_db(){
		var self = this
		this.detectorsList.forEach(function(d,i){
			var sys_rec_id = self.db.prepare('SELECT MAX(rowid) FROM sysRec'+d.name).get()
			self.sys_rec_ref[i] = sys_rec_id["MAX(rowid)"]
			var prod_rec_id = self.db.prepare('SELECT MAX(rowid) FROM prodRec'+d.name).get()
			self.prod_rec_ref[i] = prod_rec_id["MAX(rowid)"]
			var fram_rec_id = self.db.prepare('SELECT MAX(rowid) FROM framRec'+d.name).get()
			self.fram_rec_ref[i] = fram_rec_id["MAX(rowid)"]
			self.sys_prod_refs_ready[i] = true;
			log("prod_rec_ref["+i+"]: "+self.prod_rec_ref[i])
			log("sys_rec_ref["+i+"]: "+self.sys_rec_ref[i])
			log("fram_rec_ref["+i+"]: "+self.fram_rec_ref[i])
		})
	}
		
	write_netpoll_event_into_db(data,i,length_queue){
//		log("Writing Net-Poll Event")
		var self = this;

		var rec;
		var tasks_done = 0;
		log("self.netpoll_queue_ptr["+i+"]: "+this.netpoll_queue_ptr[i])
		var tstart = new Date()
		
		this.db_processing = true;
		var events_data = []
		var sys_rec_db = []
		var prod_rec_db = []
		var fram_rec_db = []
		var events_db = []
		
		for (var j=0;j<length_queue; j++)
			events_data.push(data[j])
		events_data.forEach(function(data_row,j) {
			if (data_row.e == "NET_POLL_PROD_SYS_VAR")
			{
				var row = self.db.prepare("SELECT rowid, * FROM sysRec"+self.detectorsList[i].name+" WHERE rowid = "+self.sys_rec_ref[i]).get()
				if (row && (row.SysRec.readUInt16LE(2) != data_row.rec_buf.readUInt16LE(2)))
					var countType = COUNT_PRODUCT_CHANGES
//				else if (row && (JSON.stringify(row.SysRec) != JSON.stringify(data_row.rec_buf)))
				else if (!checkAllZerosBuffer(data_row.bit_array))
					var countType = COUNT_SETTING_CHANGES
				else
					var countType = COUNT_RECORDS;
				rec = 0
				self.sys_rec_ref[i] +=1;
				sys_rec_db.push({VdefId: data_row.vdef_id, SysRec: data_row.rec_buf})
				events_db.push({VdefId: data_row.vdef_id, Key: data_row.key, Value: data_row.values, BitArray: data_row.bit_array, ProdRecRef: self.prod_rec_ref[i], SysRecRef: self.sys_rec_ref[i], FramRecRef: self.fram_rec_ref[i], Rec: rec, CountType: countType, Username: data_row.username, GroupId: data_row.group_id})
			}
			else if (data_row.e == "NET_POLL_PROD_REC_VAR")
			{
				//var row = self.db.prepare("SELECT rowid, * FROM prodRec"+self.detectorsList[i].name+" WHERE rowid = "+self.prod_rec_ref[i]).get()
				//if (row && (JSON.stringify(row.ProdRec) != JSON.stringify(data_row.rec_buf)))
				if (!checkAllZerosBuffer(data_row.bit_array))
					var countType = COUNT_SETTING_CHANGES
				else
					var countType = COUNT_RECORDS;
				rec = 1
				self.prod_rec_ref[i] +=1;
				prod_rec_db.push({VdefId: data_row.vdef_id, ProdRec: data_row.rec_buf})		
				events_db.push({VdefId: data_row.vdef_id, Key: data_row.key, Value: data_row.values, BitArray: data_row.bit_array, ProdRecRef: self.prod_rec_ref[i], SysRecRef: self.sys_rec_ref[i], FramRecRef: self.fram_rec_ref[i], Rec: rec, CountType: countType, Username: data_row.username, GroupId: data_row.group_id})
			}
			else if (data_row.e == "NETPOLL_STREAM_FRAM")
			{
//				var row = self.db.prepare("SELECT rowid, * FROM framRec"+self.detectorsList[i].name+" WHERE rowid = "+self.fram_rec_ref[i]).get()
//				if (row && (JSON.stringify(row.FramRec) != JSON.stringify(data_row.rec_buf)))
				if (!checkAllZerosBuffer(data_row.bit_array))
					var countType = COUNT_SETTING_CHANGES
				else
					var countType = COUNT_RECORDS;
				rec = 3
				self.fram_rec_ref[i] +=1;
				fram_rec_db.push({VdefId: data_row.vdef_id, FramRec: data_row.rec_buf})
				events_db.push({VdefId: data_row.vdef_id, Key: data_row.key, Value: data_row.values, BitArray: data_row.bit_array, ProdRecRef: self.prod_rec_ref[i], SysRecRef: self.sys_rec_ref[i], FramRecRef: self.fram_rec_ref[i], Rec: rec, CountType: countType, Username: data_row.username, GroupId: data_row.group_id})
			}
			else
			{					
				var countType = COUNT_NONE;
				if ((data_row.e == "NETPOLL_STREAM_REJECT")||(data_row.e == "NETPOLL_STREAM_INTERCEPTOR_REJECT")||(data_row.e == "NETPOLL_STREAM_REJECT2"))
					countType = COUNT_REJECTS;
				else if (data_row.e == "NETPOLL_STREAM_FAULTS")
					countType = COUNT_FAULTS;
				else if (data_row.e == "NETPOLL_STREAM_WARNINGS")
					countType = COUNT_WARNINGS;
				else if ((data_row.e == "NETPOLL_STREAM_TEST_REJECT")||(data_row.e == "NETPOLL_STREAM_INTERCEPTOR_TEST_REJECT"))
					countType = COUNT_TESTS;
				events_db.push({VdefId: data_row.vdef_id, Key: data_row.key, Value: data_row.values, BitArray: data_row.bit_array, ProdRecRef: self.prod_rec_ref[i], SysRecRef: self.sys_rec_ref[i], FramRecRef: self.fram_rec_ref[i], Rec: null, CountType: countType, Username: data_row.username, GroupId: data_row.group_id})
			}
			//log("Key: "+data_row.key+", Event: "+data_row.e)
		});

		if (sys_rec_db.length > 0)
		{
			log("Writing system records.")
			var text = []
			var data = {}
			sys_rec_db.forEach(function(row,j){
				text.push("INSERT INTO sysRec"+self.detectorsList[i].name+" (VdefId, SysRec) VALUES (@VdefId"+j+", @SysRec"+j+")")
				data["VdefId"+j]=row.VdefId
				data["SysRec"+j]=row.SysRec
			})
			var transaction = self.db.transaction(text);
			transaction.run(data)
		}
		if (prod_rec_db.length > 0)
		{
			log("Writing product records.")
			var text = []
			var data = {}
			prod_rec_db.forEach(function(row,j){
				text.push("INSERT INTO prodRec"+self.detectorsList[i].name+" (VdefId, ProdRec) VALUES (@VdefId"+j+", @ProdRec"+j+")")
				data["VdefId"+j]=row.VdefId
				data["ProdRec"+j]=row.ProdRec
			})
			var transaction = self.db.transaction(text);
			transaction.run(data)
		}
		if (fram_rec_db.length > 0)
		{
			log("Writing fram.")
			var text = []
			var data = {}
			fram_rec_db.forEach(function(row,j){
				text.push("INSERT INTO framRec"+self.detectorsList[i].name+" (VdefId, FramRec) VALUES (@VdefId"+j+", @FramRec"+j+")")
				data["VdefId"+j]=row.VdefId
				data["FramRec"+j]=row.FramRec
			})
			var transaction = self.db.transaction(text);
			transaction.run(data)
		}
		if (events_db.length > 0)
		{
			log("Writing events.")
			var text = []
			var data = {}
			events_db.forEach(function(row,j){
				text.push("INSERT INTO events"+self.detectorsList[i].name+" (DateTime, VdefId, Key, Value, BitArray, ProdRecRef, SysRecRef, FramRecRef, Rec, CountType, Username, GroupId) VALUES (datetime('now','localtime'), @VdefId"+j+", @Key"+j+", @Value"+j+", @BitArray"+j+", @ProdRecRef"+j+", @SysRecRef"+j+", @FramRecRef"+j+", @Rec"+j+", @CountType"+j+", @Username"+j+", @GroupId"+j+")")
				data["VdefId"+j] = row.VdefId;
				data["Key"+j] = row.Key;
				data["Value"+j] = row.Value;
				data["BitArray"+j] = row.BitArray;
				data["ProdRecRef"+j] = row.ProdRecRef;
				data["SysRecRef"+j] = row.SysRecRef;
				data["FramRecRef"+j] = row.FramRecRef;
				data["Rec"+j] = row.Rec;
				data["CountType"+j] = row.CountType;
				data["Username"+j] = row.Username;
				data["GroupId"+j] = row.GroupId;
			})
			var transaction = self.db.transaction(text);
			transaction.run(data)
			log("Events written in: "+(new Date() - tstart)+"ms")
			self.db_processing = false;
//			self.add_last_events_table(i,events_db.length)
		}
		else
		{
			self.db_processing = false;
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
			self.init_net_poll_events(self.netpollSocket.address().port);
		});
		this.netpollSocket.on('message', function(e,rinfo){
			log("new message from: "+rinfo.address,LOG_NP)
			self.detectorsList.forEach(function(d,i){
				if(e && self.detectorsList[i].ip == rinfo.address){
					log(e)
					if (self.vdef[i] && self.vdef[i]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
					{
						if (e.length > 22)
						{
							var packet_id = e.slice(0,4);
							self.netpollSocket.send(packet_id,0,4,rinfo.port,rinfo.address)
							if (last_packet_id[i] != packet_id.readUInt32LE(0))
							{
								last_packet_id[i] = packet_id.readUInt32LE(0)
								if (i == 0)
								{
									if (updateDatetime && DATETIME_UPDATE_DETECTOR)
									{
										updateDatetime = false
										var datetimeFromDetector = self.parse_date_time(e.slice(4,9));
										log(datetimeFromDetector,LOG_DATETIME)
										exec('sudo date --set="'+datetimeFromDetector+'"',function(err,stdout,errStd){
											if (!err)
												log(stdout,LOG_DATETIME)
										})
									}
								}
								self.parse_net_poll_event(e,i);
							}
							log("Packet Id: ");
							log(packet_id);
						}
						else
							log("Wrong Length Netpoll event",LOG_NP)
					}
				}
			});
		});
		this.netpollSocket.bind({address: '0.0.0.0',port: NETPOLL_PORT,exclusive: true});
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
					log("Init KAPI_RPC_NETPOLLSTREAM. Ip: "+d.ip,LOG_RPC)			
					//dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
					if (SET_DIFFERENT_PORTS_PER_DEVICE)
						self.rpc.rpc0(d.ip,REMOTE_RPC_PORT+i,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
					else
						self.rpc.rpc0(d.ip,REMOTE_RPC_PORT,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0],port]);
				}
			}
		})
		if (this.detectorsList.length > 0)
		{
			this.rpc.socket.on('message', function (message, remote) {
				self.detectorsList.forEach(function(d,i){
				//dsp[i] = FtiRpc.udp(d.ip, CONTACT_RPC_PORT, 1, CONTACT_RPC_PORT);
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
									log("KAPI_RPC_NETPOLLSTREAM ACK. Ip: "+remote.address,LOG_RPC)
									self.rpc_state[i] = 'NP_REGISTERED'
	//								dsp[i].rpc0(DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
									if (SET_DIFFERENT_PORTS_PER_DEVICE)
										self.rpc.rpc0(d.ip,REMOTE_RPC_PORT+i,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
									else
										self.rpc.rpc0(d.ip,REMOTE_RPC_PORT,DRPC_NUMBER,[self.vdef[i]['@rpc_map']['KAPI_RPC_NETPOLLSTREAM'][1][0]]);
								}
								else if (self.rpc_state[i] == 'NP_REGISTERED')
								{
									log("KAPI_RPC_NETPOLLSTREAM RECORDS_REQUESTED. Ip: "+remote.address,LOG_RPC)
									self.rpc_state[i] = 'RECORDS_REQUESTED'
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
		}

  }
	
	get_parameters_table(event,socket,callback){
		var self = this
		var table = []
		this.detectorsList.forEach(function(d,i){
			if (d["name"] == event["DetectorName"])
			{
				var row = self.db.prepare("SELECT rowid, * FROM events"+d.name+" WHERE rowid = "+event.Id).get()
				if (row && (row.VdefId != self.vdefId[i]))
				{
					var query = self.db.prepare("SELECT rowid, * FROM vdef"+d.name+" WHERE rowid="+row.VdefId+" ORDER BY rowid DESC LIMIT 1").get()
					if (query)
					{
						self.vdefId[i] = query.rowid;
						self.vdefQuery[i] = JSON.parse(query.Vdef);
					}
				}
				if (row.SysRecRef)
				{
					var row_sysRec = self.db.prepare("SELECT * FROM sysRec"+d.name+" WHERE rowid = "+row.SysRecRef).get()
				//	self.parameters_table = []
				//	self.parse_rec_db(row_sysRec.SysRec,0,i)
					self.parse_rec_db_separate(row_sysRec.SysRec,0,i)
				}
				if (row.ProdRecRef)
				{
					var row_prodRec = self.db.prepare("SELECT * FROM prodRec"+d.name+" WHERE rowid = "+row.ProdRecRef).get()
					self.parse_rec_db_separate(row_prodRec.ProdRec,1,i)

				}
				
				callback([self.sysRec,self.prodRec, row.DateTime,self.vdefQuery[i]])
				//socket.emit('parametersTable',[self.sysRec,self.prodRec, row.DateTime])
			}
		})
	}
	
	get_product_name(idx,socket){
		if (this.detectorsList[idx])
		{
			var row = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[idx].name+" ORDER BY rowid DESC LIMIT 1").get()
			if (row && (row.VdefId != this.vdefId[idx]))
			{
				var query = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[idx].name+" WHERE rowid="+row.VdefId+" ORDER BY rowid DESC LIMIT 1").get()
				if (query != undefined)
				{
					this.vdefId[idx] = query.rowid;
					this.vdefQuery[idx] = JSON.parse(query.Vdef);
				}
			}

			if (row && row.ProdRecRef)
			{
				var row_prodRec = this.db.prepare("SELECT * FROM prodRec"+this.detectorsList[idx].name+" WHERE rowid = "+(row.ProdRecRef+1)).get()
				if (row_prodRec)
				{
					this.parse_rec_db(row_prodRec.ProdRec,1,idx)
					socket.emit('productName',this.param_last_name_db[idx])
					log("Product Name: "+this.param_last_name_db[idx])
				}
				else
				{
					var row_prodRec = this.db.prepare("SELECT * FROM prodRec"+this.detectorsList[idx].name+" WHERE rowid = "+(row.ProdRecRef)).get()

					if (row_prodRec)
					{
						this.parse_rec_db(row_prodRec.ProdRec,1,idx)
						socket.emit('productName',this.param_last_name_db[idx])
						log("Product Name: "+this.param_last_name_db[idx])
					}

				}
			}
		}
	}

	get_live_events(detectors, socket, lastRowids, groups){
		log('get_live_events')
		var self = this
		var table = []
		var rowids = []
		detectors.forEach(function(det,i){
			rowids[i] = lastRowids[i];
			var events = self.db.prepare("SELECT rowid, * FROM events"+det.name+" WHERE CountType != "+COUNT_RECORDS+" AND rowid > "+lastRowids[i]+" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
			if (groups)
			{
				var groupName = ""
				groups.forEach(function(group){
					group.detectors.forEach(function(d){
						if (d.name == det.name)
							groupName += group.groupName + ", "
					})
				})
				if (groupName.length > 0)
					groupName = groupName.slice(0, groupName.length-2)
			}
			if ((events !== undefined) && (events.length > 0))
			{
				rowids[i] = events[0].rowid;
				var lastDescription = ""
				for (var j=0; j<events.length; j++)
				{
					var det_index;
					self.detectorsList.forEach(function(det, index){
						if (detectors[i].name == det.name)
							det_index = index
					})
					var data_row = self.parse_events_db(events[j],det_index)
					if (groups)
						data_row.GroupName = groupName

					if ((events[j].GroupId != 0) && ((j > 0) && (events[j].GroupId == events[j-1].GroupId)))
					{
						if (j < (events.length - 1))
						{
							if (events[j+1].GroupId != events[j].GroupId)
							{
								data_row.Description = lastDescription + "\n" + data_row.Description
								table.push(data_row)
								lastDescription = ""
							}
							else
							{
								lastDescription += "\n" + data_row.Description					
							}
						}
						else
						{
							data_row.Description = lastDescription + "\n" + data_row.Description
							table.push(data_row)
							lastDescription = ""
						}			
					}
					else
					{			
					if ((data_row.Type=="NET_POLL_PROD_SYS_VAR") || (data_row.Type=="NET_POLL_PROD_REC_VAR") || (data_row.Type=="NETPOLL_STREAM_FRAM"))
						{
							data_row.Type = self.get_netpoll_translation(data_row.Type)
							if (data_row.Description != "")
								table.push(data_row)
						}
						else
							table.push(data_row)
						lastDescription = ""
					}
				}
			}
		})
		
		if (table.length > 0)
		{
			//self.events_table = table.reverse().slice(0,MAX_NUM_ROWS-1)			
//			this.events_table = sortBy(table.slice(0).reverse(),'DateTime').reverse()		
			this.events_table = sortBy(table.slice(0),'DateTime').reverse()	
		}
		else 
			this.events_table = []
//		log('Events Table:')
//		log(this.events_table)
		socket.emit('eventsTable',this.events_table, this.language)
		socket.emit('lastRowids',rowids)
	}
		
	get_last_events_detector(queryInfo, lastRowid, socket, rowidProdChange, rowidProdChangeEnd){
		log('get_last_events_detector')
		var self = this
		var table = []
		if (this.detectorsList[queryInfo.detIdx])
		{
			if ((queryInfo.filterType == 'shift')||(queryInfo.filterType == 'period')){
				var datetimeFrom = moment(queryInfo.from).format("YYYY-MM-DD HH:mm:ss");		
				if (queryInfo.to == 'current')
					var datetimeTo = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
				else
					var datetimeTo = moment(queryInfo.to).format("YYYY-MM-DD HH:mm:ss");
				log("datetimeFrom: "+ datetimeFrom,LOG_SET_QUERY)
				log("datetimeTo: "+ datetimeTo,LOG_SET_QUERY)
				log("lastRowid: "+ lastRowid,LOG_SET_QUERY)
				log("eventType: "+ queryInfo.eventType,LOG_SET_QUERY)
				if (queryInfo.eventType == 'Rejects')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'Setting Changes')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'Faults')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'Warnings')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'Product Changes')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'Tests')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				else if (queryInfo.eventType == 'all')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType != "+COUNT_RECORDS+" AND rowid > "+lastRowid+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
/*
				if (queryInfo.to == 'current')
					var rowTo = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" ORDER BY rowid DESC LIMIT 1").get()
				else
					var rowTo = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime >= Datetime('"+datetimeTo+"') LIMIT 1").get()
				if (rowTo !== undefined)
				{
					var rowFrom = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid < "+rowTo['rowid']+" AND DateTime >= Datetime('"+datetimeFrom+"') LIMIT 1").get()
					if (rowFrom !== undefined)
					{
						var rowidFrom = rowFrom['rowid']
						var rowidTo = rowTo['rowid']
						if (lastRowid > rowidFrom)
							rowidFrom = lastRowid
						if (queryInfo.eventType == 'Rejects')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'Setting Changes')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'Faults')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'Warnings')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'Product Changes')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'Tests')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
						else if (queryInfo.eventType == 'all')
							var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid BETWEEN "+rowidFrom+" AND "+rowidTo+ " ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()

					}
				}
*/
			}
			else if (queryInfo.filterType == 'product change')
			{
				if (!rowidProdChange)
				{
					var rowidProdChange = 1;
					var event = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" ORDER BY rowid DESC LIMIT 1").get()
					if (event !== undefined)
					{
						rowidProdChange = event.rowid
						queryInfo.from = new Date(event.DateTime)
					}			
				}
				var rowidCondition = lastRowid;
				if (rowidProdChange > lastRowid)
					rowidCondition = rowidProdChange

				if (rowidProdChangeEnd)
				{
					if (queryInfo.eventType == 'Rejects')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd+" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Setting Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Faults')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Warnings')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Product Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Tests')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'all')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType != "+COUNT_RECORDS+" AND rowid > "+lastRowid+" AND rowid BETWEEN "+ rowidCondition +" AND "+rowidProdChangeEnd +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				}
				else
				{
					if (queryInfo.eventType == 'Rejects')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Setting Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Faults')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Warnings')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Product Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'Tests')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
					else if (queryInfo.eventType == 'all')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType != "+COUNT_RECORDS+" AND rowid > "+lastRowid+" AND rowid > "+ (rowidCondition-1) +" ORDER BY rowid DESC LIMIT "+MAX_NUM_ROWS).all()
				}
			}		

			if ((events !== undefined) && (events.length > 0))
			{
					//log("Parsing Events:")
				log(events,LOG_EVENTS_DETECTOR)
				if (events[events.length-1].VdefId != this.vdefId[queryInfo.detIdx])
				{
					var query = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid="+events[events.length-1].VdefId+" ORDER BY rowid DESC LIMIT 1").get()
					this.vdefId[queryInfo.detIdx] = query.rowid;
					this.vdefQuery[queryInfo.detIdx] = JSON.parse(query.Vdef);
				}	
				var lastDescription = ""
				for (var j=0; j<events.length; j++)
				{
					if (events[j].VdefId != this.vdefId[queryInfo.detIdx])
					{
						var query = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid="+events[j].VdefId+" ORDER BY rowid DESC LIMIT 1").get()
						if (query)
						{
							this.vdefId[queryInfo.detIdx] = query.rowid;
							this.vdefQuery[queryInfo.detIdx] = JSON.parse(query.Vdef);
						}
					}
					var data_row = this.parse_events_db(events[j], queryInfo.detIdx)
					if ((events[j].GroupId != 0) && ((j > 0) && (events[j].GroupId == events[j-1].GroupId)))
					{
						if (j < (events.length - 1))
						{
							if (events[j+1].GroupId != events[j].GroupId)
							{
								data_row.Description = lastDescription + "\n" + data_row.Description
								table.push(data_row)
								lastDescription = ""
							}
							else
							{
								lastDescription += "\n" + data_row.Description					
							}
						}
						else
						{
							data_row.Description = lastDescription + "\n" + data_row.Description
							table.push(data_row)
							lastDescription = ""
						}			
					}
					else
					{			
						if ((data_row.Type=="NET_POLL_PROD_SYS_VAR") || (data_row.Type=="NET_POLL_PROD_REC_VAR") || (data_row.Type=="NETPOLL_STREAM_FRAM"))
						{
							data_row.Type = this.get_netpoll_translation(data_row.Type)
							if (data_row.Description != "")
								table.push(data_row)
						}
						else
							table.push(data_row)
						lastDescription = ""
					}
				}
				
				if (table.length > 0)
				{
					//self.events_table = table.reverse().slice(0,MAX_NUM_ROWS-1)			
					this.events_table = table.slice(0)			
				}
				else 
					this.events_table = []
				this.table_updated = true;
			
			}
			else
				this.events_table = []
			if (lastRowid == 0)
				socket.emit('eventsTable',this.events_table, this.language)
			else
				socket.emit('eventsTable',this.events_table, this.language, true)
		}
		return queryInfo;
	}
	
	get_event_counts(queryInfo, socket){
		log("get_event_counts")
		var self = this
		var rejectsCount = 0;
		var faultsCount = 0;
		var testsCount = 0;
		var settingChangeCount = 0;
		var productChangeCount = 0;
		var warningsCount = 0;

		if (this.detectorsList[queryInfo.detIdx])
		{
			if ((queryInfo.filterType == 'shift')||(queryInfo.filterType == 'period'))
			{
				var datetimeFrom = moment(queryInfo.from).format("YYYY-MM-DD HH:mm:ss");		
				if (queryInfo.to == 'current')
					var datetimeTo = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
				else
					var datetimeTo = moment(queryInfo.to).format("YYYY-MM-DD HH:mm:ss");

				if (queryInfo.to == 'current')
					var rowTo = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" ORDER BY rowid DESC LIMIT 1").get()
				else
					var rowTo = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid DESC LIMIT 1").get()
				if (rowTo !== undefined)
				{
//					var rowFrom = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid < "+rowTo['rowid']+" AND DateTime >= Datetime('"+datetimeFrom+"') LIMIT 1").get()
					var rowFrom = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') ORDER BY rowid LIMIT 1").get()
					log("Datetime From: "+datetimeFrom,LOG_COUNTS)
					log("rowFrom: "+rowFrom['rowid'],LOG_COUNTS)
					log("Datetime To: "+datetimeTo,LOG_COUNTS)
					log("rowTo: "+rowTo['rowid'],LOG_COUNTS)
					if (rowFrom !== undefined)
					{
						rejectsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
						settingChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
						faultsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
						testsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
						productChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
						warningsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid BETWEEN "+rowFrom['rowid']+" AND "+rowTo['rowid']).get()['count(*)']
					}
				}
			}
			else if (queryInfo.filterType == 'product change')
			{
				log('product change')
				var rowidProdChange = 1;
				var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" ORDER BY rowid DESC LIMIT "+ (queryInfo.productsBack+1)).all()
				if (events !== undefined)
				{
					//log(events)
					if (events.length > 0)
					{
						rowidProdChange = events[events.length-1].rowid
						queryInfo.from = new Date(events[events.length-1].DateTime)
					}
					if (events.length > 1)
					{
						var rowidProdChangeEnd = events[events.length-2].rowid-1
						queryInfo.to = new Date(events[events.length-2].DateTime)
						log("Products Back: "+queryInfo.productsBack)
						log("rowidProdChange: "+rowidProdChange+ "Datetime: "+queryInfo.from)
						log("rowidProdChangeEnd: "+rowidProdChangeEnd+ "Datetime: "+queryInfo.to)
						rejectsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']
						settingChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']
						faultsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']
						testsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']
						productChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']
						warningsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid BETWEEN "+ rowidProdChange + " AND "+ rowidProdChangeEnd).get()['count(*)']						
					}
					else
					{
						rejectsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']
						settingChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']
						faultsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']
						testsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']
						productChangeCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']
						warningsCount = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid > "+ (rowidProdChange-1)).get()['count(*)']						
					}
				}



			}

			var lastRowid = 0
			var row = this.db.prepare("SELECT rowid FROM events"+this.detectorsList[queryInfo.detIdx].name+" ORDER BY rowid DESC LIMIT 1").get()
			if (row != undefined && row['rowid'])
				lastRowid = row['rowid']

			var counts = {rejects: rejectsCount, settingChanges: settingChangeCount, faults: faultsCount, productChanges: productChangeCount, tests: testsCount, warnings: warningsCount, eventType:queryInfo.eventType}
			log(counts,LOG_COUNTS)
			if (socket)
			{
				log('Emit detectorCounts')
				socket.emit('detectorCounts',counts,lastRowid)
					//log("allCount: "+allCount+", totalCounts: "+totalCounts)
					//if ((allCount != totalCounts)||(allCount == 0))
					if (rowidProdChange && rowidProdChangeEnd)
					{
						socket.emit('prodChangeRange',rowidProdChange,rowidProdChangeEnd)
						self.get_last_events_detector(queryInfo, 0, socket, rowidProdChange, rowidProdChangeEnd)						
					}
					else if (rowidProdChange)
					{
						socket.emit('prodChangeRange',rowidProdChange,0)
						self.get_last_events_detector(queryInfo, 0, socket, rowidProdChange)
					}
					else
						self.get_last_events_detector(queryInfo, 0, socket)
			}
			return {counts: counts, queryInfo: queryInfo};
		}
		else
			return {counts: {rejects: 0, settingChanges: 0, faults: 0, warnings:0, productChanges: 0, tests: 0, eventType: queryInfo.eventType}, queryInfo: queryInfo}
	}
	
	get_all_events_and_gen_report(queryInfo, socket, reports, detectorInfo, filter, callback){
		var self = this
		var processingQueries = true;
		var table = []
		log(queryInfo)
		var rejectsCount = 0;
		var faultsCount = 0;
		var testsCount = 0;
		var settingChangeCount = 0;
		var productChangeCount = 0;
		var warningsCount = 0;
		var BLOCK_LENGTH = 1000

		if ((queryInfo.filterType == 'shift')||(queryInfo.filterType == 'period'))
		{
			var datetimeFrom = moment(queryInfo.from).format("YYYY-MM-DD HH:mm:ss");		
			if (queryInfo.to == 'current')
				var datetimeTo = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			else
				var datetimeTo = moment(queryInfo.to).format("YYYY-MM-DD HH:mm:ss");
		}
		else if (queryInfo.filterType == 'product change')
		{
			var rowidProdChange = 0;
			var event = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" ORDER BY rowid DESC LIMIT 1").get()
			if (event !== undefined)
			{
				rowidProdChange = event.rowid
				queryInfo.from = new Date(event.DateTime)
			}			
		}
		var rowid = 0;
		//socket.emit('eventsTable',[])
		while (processingQueries)
		{
			if ((queryInfo.filterType == 'shift')||(queryInfo.filterType == 'period'))
			{
					var count = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid).get()['count(*)']
	//				var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+MAX_NUM_ROWS).all()
				if (queryInfo.eventType == 'Rejects')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'Setting Changes')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'Faults')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'Warnings')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'Product Changes')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'Tests')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
				else if (queryInfo.eventType == 'all')
					var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE DateTime BETWEEN Datetime('"+datetimeFrom+"') AND Datetime('"+datetimeTo+"') AND rowid > "+rowid+" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()


					log("Count: "+count,LOG_REPORT)
					log(events,LOG_REPORT)
					if (count >= BLOCK_LENGTH)
					{
						rowid = events[events.length-1].rowid;
					}
					else
						processingQueries = false;
				}
			else if (queryInfo.filterType == 'product change')
			{
					var count = this.db.prepare("SELECT count(*) FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid > "+ (rowidProdChange-1)).get()['count(*)']
	//				var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+MAX_NUM_ROWS).all()
					log("Count: "+count)
					if (queryInfo.eventType == 'Rejects')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_REJECTS+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'Setting Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_SETTING_CHANGES+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'Faults')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_FAULTS+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'Warnings')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_WARNINGS+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'Product Changes')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'Tests')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE CountType = "+COUNT_TESTS+" AND rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					else if (queryInfo.eventType == 'all')
						var events = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid > "+ (rowidProdChange-1) +" ORDER BY rowid LIMIT "+BLOCK_LENGTH).all()
					if (count >= BLOCK_LENGTH)
					{
						rowidProdChange = events[events.length-1].rowid
					}
					else
						processingQueries = false;
				}
			else
				processingQueries = false;		

			if ((events !== undefined) && (events.length > 0))
			{
					if (events[events.length-1].VdefId != this.vdefId[queryInfo.detIdx])
					{
						var query = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid="+events[events.length-1].VdefId+" ORDER BY rowid DESC LIMIT 1").get()
						if (query)
						{
							this.vdefId[queryInfo.detIdx] = query.rowid;
							this.vdefQuery[queryInfo.detIdx] = JSON.parse(query.Vdef);
						}
					}			
					var sysRecRef = events[events.length-1].SysRecRef
					var prodRecRef = events[events.length-1].ProdRecRef
					var sysRec = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid = "+sysRecRef).get()
					var prodRec = this.db.prepare("SELECT rowid, * FROM prodRec"+this.detectorsList[queryInfo.detIdx].name+" WHERE rowid = "+prodRecRef).get()		
					if (sysRec)
						this.parse_rec_db(sysRec.SysRec,0,queryInfo.detIdx)
					if (prodRec)
						this.parse_rec_db(prodRec.ProdRec,1,queryInfo.detIdx)
					var block = []
					//for (var j=events.length-1; j>=0; j--)
					var lastDescription = ""
					for (var j=0; j<events.length; j++)
					{
						var data_row = this.parse_events_db(events[j],queryInfo.detIdx)
						//table.push(data_row)

						if ((events[j].GroupId != 0) && ((j > 0) && (events[j].GroupId == events[j-1].GroupId)))
						{
							if (j < (events.length - 1))
							{
								if (events[j+1].GroupId != events[j].GroupId)
								{
									data_row.Description = lastDescription + "\n" + data_row.Description
									table.push(data_row)
									lastDescription = ""
								}
								else
								{
									lastDescription += "\n" + data_row.Description					
								}
							}
							else
							{
								data_row.Description = lastDescription + "\n" + data_row.Description
								table.push(data_row)
								lastDescription = ""
							}			
						}
						else
						{			
							if ((data_row.Type=="NET_POLL_PROD_SYS_VAR") || (data_row.Type=="NET_POLL_PROD_REC_VAR") || (data_row.Type=="NETPOLL_STREAM_FRAM"))
							{
								data_row.Type = this.get_netpoll_translation(data_row.Type)
								if (data_row.Description != "")
									table.push(data_row)
							}
							else
								table.push(data_row)
							lastDescription = ""
						}
					}
				}
			log('Sending data')
		}
		//socket.emit('endTable')
		//this.events_table = table.slice(0).reverse();
		//log("Table length: "+this.events_table.length)
		table.forEach(function(row){
			log(row)
		})
		reports.genReport(detectorInfo, queryInfo, filter, table, callback,this.language)
		return queryInfo;
	}

	get_name_translation(param_name){
		var res = ""
		for (var p_map in params_map)
		{
			if (p_map == param_name)
				res = params_map[p_map]["@translations"][this.language]["name"]
		}	
		if (res == "")
			res = param_name
		return res;	
	}
	
	get_netpoll_translation(netpoll_name){
		var res = ""
		for (var np in netpoll_map)
		{
			if (np == netpoll_name)
				res = netpoll_map[np]["@translations"][this.language]["name"]
		}
		if (res == "")
			res = netpoll_name
		return res
	}
	
	get_label_translation(label_name){
		var res = ""
		for (var label in vdefMap['@labels'])
		{
			if (label == label_name)
				res = vdefMap['@labels'][label_name][this.language]["name"]
		}
		if (res == "")
			res = label_name
		return res
	}
	
	parameter_is_hidden(param){
		for (var p_map in params_map)
		{
			if (p_map == param)
			{
				if (params_map[p_map]["hidden"] == true)
				{
					return true
				}
			}
		}
		return false
	}

	get_param_values_db(rec, refSysRec, refProdRec, refFramRec, detIdx, parameters){
		var self = this;
		var param_values = []
		var buf_rec = null;
		if (rec == 0)
		{
			var row = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+refSysRec).get()
			if (row)
				buf_rec = row.SysRec
		}
		else if (rec == 1)
		{
			var row = this.db.prepare("SELECT rowid, * FROM prodRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+refProdRec).get()
			if (row)
				buf_rec = row.ProdRec
		}
		else if (rec == 3)
		{
			var row = this.db.prepare("SELECT rowid, * FROM framRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+refFramRec).get()
			if (row)
				buf_rec = row.FramRec
		}
		
		if (buf_rec)
		{
//			log("Previous buf_rec: ")
//			log(buf_rec)
			var vdef = this.vdefQuery[detIdx]
			if (row.VdefId != this.vdefId[detIdx])
			{
				var query = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[detIdx].name+" WHERE rowid="+row.VdefId+" ORDER BY rowid DESC LIMIT 1").get()
				if (query)
					vdef = JSON.parse(query.Vdef);
			}			
			parameters.forEach(function(param){
				vdef['@params'].forEach(function(p, i){
					var param_found = false;
					param_values.forEach(function(par){
						if(par.name == p['@name'])
							param_found = true;
					})
					if (!param_found)
					{
						if ((param.param) && (param.param['@name'] == p['@name']) && (rec == p['@rec']))
						{
							if (p['@bit_len'] == 32)
								var val = [buf_rec.readUInt16BE(p['@i_var']*2) , buf_rec.readUInt16BE(p['@i_var']*2+2)]
							else if (p['@bit_len'] > 32)
								var val = buf_rec.slice(p['@i_var']*2, p['@i_var']*2 + (p['@bit_len']>>3))
							else
							{
								var val = (buf_rec.readUInt16LE(p['@i_var']*2) >> p['@bit_pos']) & ((1 << p['@bit_len'])-1)					
								if (val > 32767)
									val = (-1)*((val ^ 0xffff)+1)			
							}
							if (p['@dep'])
							{
								var deps = []
								p['@dep'].forEach(function(dep){
									var d = self.vdefQuery[detIdx]['@deps'][dep];
									if (d['@rec']!=p['@rec'])
									{
										if (d['@rec'] == 0)
											var ref_dep = refSysRec
										else if (d['@rec'] == 1)
											var ref_dep = refProdRec
										else if (d['@rec'] == 3)
											var ref_dep = refFramRec
										var buf_rec_dep = self.get_prod_sys_rec_db(d['@rec'], ref_dep, detIdx)
										deps[dep] = (buf_rec_dep.readUInt16LE(d['@i_var']*2) >> d["@bit_pos"]) & ((1<<d["@bit_len"])-1)
									}
									else
										deps[dep] = (buf_rec.readUInt16LE(d['@i_var']*2) >> d["@bit_pos"]) & ((1<<d["@bit_len"])-1)
								})
								param_values.push({name: p['@name'], value: val, deps: deps})
							}
							else
								param_values.push({name: p['@name'], value: val})
						}
					}
				})	
			})
		}
		return param_values;
	}
	
	get_prod_sys_rec_db(rec, ref, detIdx){
		var buf_rec = null;
		if (rec == 0)
		{
			var row = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+ref).get()
			if (row)
				buf_rec = row.SysRec
		}
		else if (rec == 1)
		{
			var row = this.db.prepare("SELECT rowid, * FROM prodRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+ref).get()
			if (row)
				buf_rec = row.ProdRec
		}
		else if (rec == 3)
		{
			var row = this.db.prepare("SELECT rowid, * FROM framRec"+this.detectorsList[detIdx].name+" WHERE rowid = "+ref).get()
			if (row)
				buf_rec = row.FramRec
		}
		return buf_rec
	}
	
//	parse_events_db(row, prev_row, prev_description, detector_index){
	parse_events_db(row, detector_index){
//		log("Parsing events db")
		//log(row)
		var self = this;
		//log("Time: "+ new Date())
		var tz_offset = new Date().getTimezoneOffset()
//		log("Timezone: "+tz_offset)
//		var datetime = moment(row.DateTime).utcOffset(tz_offset).format("YYYY-MM-DD HH:mm:ss");	
		log(row.DateTime)
		var datetime = moment(row.DateTime).format("YYYY-MM-DD HH:mm:ss");	
		var res = {Id: row.rowid, DateTime: datetime, Username: row.Username, Type: "", Description: "", DetectorName: this.detectorsList[detector_index].name}
//		if ((row.GroupId != 0) && (row.GroupId == prev_row.GroupId))
//			res.Description = prev_description + '\n';
		for (var e in this.vdefQuery[detector_index]["@net_poll_h"])
		{
			if (this.vdefQuery[detector_index]["@net_poll_h"][e] == row.Key)
			{
				var parameters = []
				if ((e=="NET_POLL_PROD_SYS_VAR") || (e=="NET_POLL_PROD_REC_VAR") || (e=="NETPOLL_STREAM_FRAM"))
				{
//					log("Settings change.")
					res.Type = e;
	        var rec;
					if (e=="NET_POLL_PROD_SYS_VAR")
					{						
	          rec = 0;
						var ref = row.SysRecRef
						var row_rec = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[detector_index].name+" WHERE rowid = "+ref).get()
						if (row_rec)
							var buf_rec = row_rec.SysRec									
					}
	        else if (e=="NET_POLL_PROD_REC_VAR")
					{
	          rec = 1;
						var ref = row.ProdRecRef
						var row_rec = this.db.prepare("SELECT rowid, * FROM prodRec"+this.detectorsList[detector_index].name+" WHERE rowid = "+ref).get()
						if (row_rec)
							var buf_rec = row_rec.ProdRec									
					}
					else if (e=="NETPOLL_STREAM_FRAM")
					{
						rec = 3;
						var ref = row.FramRecRef
						var row_rec = this.db.prepare("SELECT rowid, * FROM framRec"+this.detectorsList[detector_index].name+" WHERE rowid = "+ref).get()
						if (row_rec)
							var buf_rec = row_rec.FramRec
					}
				
//					log("BitArray: ")
//					log(row.BitArray)
					for (var i = 0; i < row.BitArray.length; i++)
					{
						var byte = row.BitArray[i]
						if (byte && buf_rec)
						{
							var bit_mask = 1;
							for (var j = 0; j < 8; j++)
							{
								if (byte & bit_mask) //Found a changed word
								{
									var idx = i*8+j //word position in the vdef params array with a change
//									log("Found a changed word at position: "+idx)
									this.vdefQuery[detector_index]['@params'].forEach(function(p){
										if (((idx == p["@i_var"]) && (p['@bit_len'] <= 16) && (rec == p['@rec'])) || 
										((idx >= p["@i_var"]) && (idx < (p["@i_var"] + (p['@bit_len']>>4))) && (p['@bit_len'] > 16) && (rec == p['@rec'])))
										{
											var param_found = false;
											parameters.forEach(function(par){
												if(par.param['@name'] == p['@name'])
													param_found = true;
											})
											if (!param_found)
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
												if (p['@dep'])
												{
													var deps = []
													p['@dep'].forEach(function(dep){
														var d = self.vdefQuery[detector_index]['@deps'][dep];
														if (d['@rec']!=p['@rec'])
														{
															if (d['@rec'] == 0)
																var ref_dep = row.SysRecRef
															else if (d['@rec'] == 1)
																var ref_dep = row.ProdRecRef
															var buf_rec_dep = self.get_prod_sys_rec_db(d['@rec'], ref_dep, detector_index)
															deps[dep] = (buf_rec_dep.readUInt16LE(d['@i_var']*2) >> d["@bit_pos"]) & ((1<<d["@bit_len"])-1)
														}
														else
															deps[dep] = (buf_rec.readUInt16LE(d['@i_var']*2) >> d["@bit_pos"]) & ((1<<d["@bit_len"])-1)
													})
													parameters.push({param: p, value: val, deps: deps})
												}
												else
													parameters.push({param: p, value: val})	
											}
										}
									})
								}
								bit_mask <<= 1;
							}
						}
					}
//					log("Parameters inside the word that might have been changed:")
//					log(parameters)
					var previous_param_values = []
					if (rec == 0)
					{
						if (row.SysRecRef > 0)
							previous_param_values = this.get_param_values_db(rec, row.SysRecRef-1, row.ProdRecRef, row.FramRecRef, detector_index, parameters)
					}
					else if (rec == 1)
					{
						if (row.ProdRecRef > 0)
							previous_param_values = this.get_param_values_db(rec, row.SysRecRef, row.ProdRecRef-1, row.FramRecRef, detector_index, parameters)
					}
					else if (rec == 3)
					{
						if (row.FramRecRef > 0)
							previous_param_values = this.get_param_values_db(rec, row.SysRecRef, row.ProdRecRef, row.FramRecRef-1, detector_index, parameters)
					}

//					log("Previous parameters:")
//					log(previous_param_values)
					parameters.forEach(function(p){
						if (p.param['@name'].substring(0,12) != "PasswordHash")
						{
							previous_param_values.forEach(function(pp){
								if (pp.name == p.param['@name'])
								{
									var dep_change = false
									for (var dep in p.deps)
									{
										if (p.deps[dep] != pp.deps[dep])
										{
	//										log("Dependency change "+dep+": "+pp.deps[dep]+" -> "+p.deps[dep])
											dep_change = true;
										}
									}
									if (dep_change||(pp.value != p.value))
									{
										var p_name = self.get_name_translation(p.param["@name"])
	//									log("Parameter: "+p.param['@name'])
										if (p.param['@type'])
										{
	//										log("Paramter Type: "+p.param['@type'])
											if (p.param['@type'] == 'prod_name_u16_le')
											{
												res.Description += p_name + ": " + pp.value + " -> " + p.value + "\n" 
												return res;
											}
											else if (p.param["@type"] == "rec_date")
					    	      {
												var old_date = (((pp.value>>9) & 0x7f) + 1996) + '/' + self.pad(((pp.value >> 5) & 0xf),2) + '/' + self.pad(((pp.value >> 5) & 0xf),2);
												var new_date = (((p.value>>9) & 0x7f) + 1996) + '/' + self.pad(((p.value >> 5) & 0xf),2) + '/' + self.pad(((p.value >> 5) & 0xf),2);
					              res.Description += p_name + ": " + old_date + " -> " + new_date + "\n" 
					            }
											else if ((p.param['@type'] == 'phase') || (p.param['@type'] == 'rej_del') || (p.param['@type'] == 'mm'))
											{
												var old_val = eval(vdefMap["@func"][p.param['@type']]).apply(null,[pp.value, pp.deps[p.param['@dep'][0]]])
												var new_val = eval(vdefMap["@func"][p.param['@type']]).apply(null,[p.value, p.deps[p.param['@dep'][0]]])
												res.Description += p_name + ": " + old_val + " -> " + new_val + "\n" 
											}
											else if (p.param['@type'] == 'belt_speed')
											{
												var old_speed = eval(vdefMap["@func"][p.param['@type']]).apply(null,[pp.value, pp.deps[p.param['@dep'][0]], pp.deps[p.param['@dep'][1]]])
												var new_speed = eval(vdefMap["@func"][p.param['@type']]).apply(null,[p.value, p.deps[p.param['@dep'][0]], p.deps[p.param['@dep'][1]]])
												res.Description += p_name + ": " + old_speed + " -> " + new_speed + "\n" 
											}
											else if ((p.param['@type'] == 'rej_chk') || (p.param['@type'] == 'rej_mode') || (p.param['@type'] == 'rej_latch') || (p.param['@type'] == 'peak_mode') || (p.param['@type'] == 'phase_mode'))
											{
												if (vdefMap["@func"][p.param['@type']])
												{
													var old_pos = eval(vdefMap["@func"][p.param['@type']]).apply(null,[pp.value, pp.deps[p.param['@dep'][0]]])
													var new_pos = eval(vdefMap["@func"][p.param['@type']]).apply(null,[p.value, p.deps[p.param['@dep'][0]]])
				                  var lg = 'english'
				                  if (vdefMap["@lists"][p.param['@labels']][self.language] && vdefMap["@lists"][p.param['@labels']][self.language][old_pos] && vdefMap["@lists"][p.param['@labels']][self.language][new_pos])
				                    lg = self.language									
													var old_label = vdefMap["@lists"][p.param['@labels']][lg][old_pos]
													var new_label = vdefMap["@lists"][p.param['@labels']][lg][new_pos]
													res.Description += p_name + ": " + old_label + " -> " + new_label + "\n" 
												}
											}
											else if (p.param['@type'] == 'ipv4_address')
											{
												var old_ip = eval(vdefMap["@func"][p.param['@type']]).apply(null,[pp.value])
												var new_ip = eval(vdefMap["@func"][p.param['@type']]).apply(null,[p.value])
												res.Description += p_name + ": " + old_ip + " -> " + new_ip + "\n" 
											}
											else if (p.param['@type'] == 'eye_rej_mode')
											{
												var old_pos = eval(vdefMap["@func"][p.param['@type']]).apply(null,[pp.value, pp.deps[p.param['@dep'][0]], pp.deps[p.param['@dep'][1]]])
												var new_pos = eval(vdefMap["@func"][p.param['@type']]).apply(null,[p.value, p.deps[p.param['@dep'][0]], p.deps[p.param['@dep'][1]]])
			                  var lg = 'english'
			                  if (vdefMap["@lists"][p.param['@labels']][self.language] && vdefMap["@lists"][p.param['@labels']][self.language][old_pos] && vdefMap["@lists"][p.param['@labels']][self.language][new_pos])
			                    lg = self.language									
												var old_label = vdefMap["@lists"][p.param['@labels']][lg][old_pos]
												var new_label = vdefMap["@lists"][p.param['@labels']][lg][new_pos]
												res.Description += p_name + ": " + old_label + " -> " + new_label + "\n" 
											}
											else
											{
												res.Description += p_name + ": " + pp.value + " -> " + p.value + "\n" 
											}
										}
										else if (p.param['@labels'])
										{
		                  var lg = 'english'
		                  if (vdefMap["@lists"][p.param['@labels']][self.language] && vdefMap["@lists"][p.param['@labels']][self.language][pp.value] && vdefMap["@lists"][p.param['@labels']][self.language][p.value])
		                    lg = self.language									
											var old_label = vdefMap["@lists"][p.param['@labels']][lg][pp.value]
											var new_label = vdefMap["@lists"][p.param['@labels']][lg][p.value]
											res.Description += p_name + ": " + old_label + " -> " + new_label + "\n" 
										}									
										else
										{
											var old_val = pp.value;
											var new_val = p.value;
											if (p.param['@decimal'])
											{
												for (var k=0; k < p.param['@decimal']; k++)
												{
													old_val /= 10;
													new_val /= 10;
												}
											}											
											res.Description += p_name + ": " + old_val + " -> " + new_val + "\n" 
										}
									}
								}
							})
						}
					})
				}
				else if (e == 'NETPOLL_STREAM_REJECT')
				{
					res.Type = this.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Signal') + ": " + row.Value.readUInt16LE(0) + ", "+this.get_label_translation('Count') + ": " + row.Value.readUInt16LE(2)
				}
				else if (e == 'NETPOLL_STREAM_INTERCEPTOR_REJECT')
				{
					res.Type = this.get_netpoll_translation('NETPOLL_STREAM_REJECT')
					res.Description = this.get_label_translation("Signal") + " A: "+ row.Value.readUInt16LE(0) + ", "+this.get_label_translation("Signal")+" B: "+ row.Value.readUInt16LE(2) + ", "+this.get_label_translation("Count")+": " + row.Value.readUInt16LE(4)
				}
				else if (e == 'NETPOLL_STREAM_TEST_REJECT')
				{
					res.Type = this.get_netpoll_translation(e)
					var metal = row.Value.readUInt16LE(8)
					var metalType = "FE"
					if (metal == 1)
						metalType = "NFE"
					else if (metal == 2)
						metalType = "SS"
					var testNum = row.Value.readUInt16LE(2)
					var testPass = row.Value.readUInt16LE(4)
					var numPasses = row.Value.readUInt16LE(6)
					//res.Description = this.get_label_translation("Signal") + " A: "+ row.Value.readUInt16LE(0)
					res.Description = metalType+ ", " + this.get_label_translation("Signal") + ": "+ row.Value.readUInt16LE(0)
				}
				else if (e == 'NETPOLL_STREAM_INTERCEPTOR_TEST_REJECT')
				{
					res.Type = this.get_netpoll_translation(e)
					var metal = row.Value.readUInt16LE(10)
					var metalType = "FE"
					if (metal == 1)
						metalType = "NFE"
					else if (metal == 2)
						metalType = "SS"
					var testNum = row.Value.readUInt16LE(4)
					var testPass = row.Value.readUInt16LE(6)
					var numPasses = row.Value.readUInt16LE(8)
					res.Description = metalType+ ", " + this.get_label_translation("Signal") + " A: "+ row.Value.readUInt16LE(0) + ", "+this.get_label_translation("Signal")+" B: " + row.Value.readUInt16LE(2)
				}
				else if (e == 'NETPOLL_STREAM_MANUAL_REJECT')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_REJECT2')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Signal') + ": "+ row.Value.readUInt16LE(0) + ", "+this.get_label_translation('Count') + ": "+ row.Value.readUInt16LE(2)
				}
				else if (e == 'NETPOLL_STREAM_RETEST_REJECT')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Signal') + ": "+ row.Value.readUInt16LE(0) + ", "+this.get_label_translation('Count') + ": "+ row.Value.readUInt16LE(2)
				}
				else if (e == 'NETPOLL_STREAM_TEST_START')
				{
					res.Type = self.get_netpoll_translation(e)
					var type = row.Value.readUInt16LE(0)
					if (type == 0)
						res.Description = this.get_label_translation("Manual Test")
					else if (type == 1)
						res.Description = this.get_label_translation("Halo Test")
					else if (type == 2)
						res.Description = this.get_label_translation("Manual2 Test")
					else if (type == 3)
						res.Description = this.get_label_translation("Halo2 Test")
				}
				else if (e == 'NETPOLL_STREAM_TEST_END')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if ((e == 'NETPOLL_STREAM_FAULTS') || (e == 'NETPOLL_STREAM_WARNINGS'))
				{
					res.Type = self.get_netpoll_translation(e)
					var mask = 1
					res.Description = ""
					var numberOfFaults = this.vdefQuery[detector_index]['@labels']['FaultSrc'][this.language].length
					for (var i = 0; i < numberOfFaults; i++)
					{
						if (row.Value.readUInt32LE(0) & mask)
						{
							var lg = 'english'
							if (vdefMap['@lists']['FaultSrc'][this.language][i+1])
								lg = this.language
							res.Description += vdefMap['@lists']['FaultSrc'][lg][i+1] + ", "
						}
						mask <<= 1
					}
					if (res.Description != "")
						res.Description = res.Description.substring(0,res.Description.length - 2)
				}
				else if ((e == 'NETPOLL_STREAM_FAULTS_CLEAR') || (e == 'NETPOLL_STREAM_WARNINGS_CLEAR'))
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_LOGIN')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_LOGOUT')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_POWERUP')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_EYE_PROD_PEAK')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Signal') + ": "+ row.Value.readUInt32LE(0)				
				}
				else if (e == 'NETPOLL_STREAM_SEL_UNIT')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_INTCPTR_SWITCH')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = ""				
				}
				else if (e == 'NETPOLL_STREAM_PROD_DELETE')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Product') + ": " + row.Value.readUInt32LE(0)	
				}
				else if (e == 'NETPOLL_STREAM_PROD_BACKUP')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Product') + ": " + row.Value.readUInt32LE(0)	
				}
				else if (e == 'NETPOLL_STREAM_PROD_COPY')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Product') + ": " + row.Value.readUInt32LE(0)			
				}
				else if (e == 'NETPOLL_STREAM_PROD_RESTORE')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Product') + ": " + row.Value.readUInt32LE(0)		
				}
				else if (e == 'NETPOLL_STREAM_PROD_DEFAULTS')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Product') + ": " + row.Value.readUInt32LE(0)		
				}
				else if (e == 'NETPOLL_STREAM_REJECT_CLEAR')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Count') + ": " + row.Value.readUInt16LE(0)			
				}
				else if (e == 'NETPOLL_STREAM_REJECT2_CLEAR')
				{
					res.Type = self.get_netpoll_translation(e)
					res.Description = this.get_label_translation('Count') + ": " + row.Value.readUInt16LE(0)			
				}
			}
		}	
//		log(res.Description)		
		return res;				
	}		

	checkPrevProdChangeAutoGenRep(i){
		log('checkPrevProdChangeAutoGenRep',LOG_EMAIL_PROD_CHANGE_REPORT)
		if (this.productChangeAutoRep)
		{
			var queryInfo = {from: null, to: new Date(), eventType: 'all', filterType: 'product change', detIdx: i, rowid: 0}

			var detectorInfo = {detName: this.detectorsList[i].name, status: '', productName: "", rejects: 0, settingChanges: 0, faults: 0, warnings: 0, productChanges: 0, tests: 0, detectorIdx: i}
			var event = this.db.prepare("SELECT rowid, * FROM events"+this.detectorsList[i].name+" WHERE CountType = "+COUNT_PRODUCT_CHANGES+" ORDER BY rowid DESC LIMIT 1").get()
			if (event !== undefined)
			{
				var rowid_prodRec = event.ProdRecRef
				queryInfo.from = new Date(event.DateTime)
				queryInfo.rowid = event.rowid
				var row_prodRec = this.db.prepare("SELECT * FROM prodRec"+this.detectorsList[i].name+" WHERE rowid = "+rowid_prodRec+" LIMIT 1").get()
				if (row_prodRec)
				{
					this.parse_rec_db(row_prodRec.ProdRec,1,i)
					detectorInfo.productName = this.param_last_name_db[i]
					log("Product Name: "+this.param_last_name_db[i])
				}
			}

			log("Email Product Change Report",LOG_EMAIL_PROD_CHANGE_REPORT)
			this.productEmailCallback(detectorInfo,queryInfo,"Product Change")
			//})
		}
	}

	parse_net_poll_event(buf,detector_index){
		var username = 'NO USER   '
		var key;
		var size;
		var group_id;
		var valuesBuffer;
		var packet_id = buf.slice(0,4);

		if (this.last_packet_id[detector_index] != packet_id)
		{
			this.last_packet_id[detector_index] = packet_id;
			username = buf.toString('ascii', 9, 19)
			key = buf.readUInt32LE(19);
			group_id = buf.readUInt32LE(23);
			size = buf.readUInt16LE(27);
			log(buf)
			log('NPEvent => key: '+key+', group_id: '+group_id, LOG_NP)
			for (var e in this.vdefQuery[detector_index]["@net_poll_h"])
			{
				if (this.vdefQuery[detector_index]["@net_poll_h"][e] == key)
				{
					if (e == 'NETPOLL_STREAM_INTERCEPTOR_REJECT')
					{
						if (buf.length > 34)
						{
							valuesBuffer = buf.slice(29,35)
							log("Interceptor Reject",LOG_NP)
							log("Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2) + ", Count: " + valuesBuffer.readUInt16LE(4),LOG_NP)
							this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, null, null, e, username, group_id)
						}
						else
							log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
					}
					else if (e == 'NETPOLL_STREAM_TEST_REJECT')
					{
						if (buf.length > 38)
						{
							valuesBuffer = buf.slice(29,39)
							log("Test Reject",LOG_NP)
							log("Signal: " + valuesBuffer.readUInt16LE(0),LOG_NP)
							this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, null, null, e, username, group_id)
						}
						else
							log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
					}
					else if (e == 'NETPOLL_STREAM_INTERCEPTOR_TEST_REJECT')
					{
						if (buf.length > 40)
						{
							valuesBuffer = buf.slice(29,41) 
							log("Interceptor Test Reject",LOG_NP)
							log("Signal A: " + valuesBuffer.readUInt16LE(0) + ", Signal B: " + valuesBuffer.readUInt16LE(2),LOG_NP)
							var metal;
							if (valuesBuffer.readUInt16LE(10) == 0) {
								metal = "FE"
							} else if (valuesBuffer.readUInt16LE(10) == 1) {
								metal = "NFE"
							} else { // 2
								metal = "SS"
							}
							log("Test " + valuesBuffer.readUInt16LE(4) + ", Metal: " + metal + " Pass " + valuesBuffer.readUInt16LE(6) + " of " + valuesBuffer.readUInt16LE(8),LOG_NP);
							this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, null, null, e, username, group_id)
						}
						else
							log("There is something wrong with the length of the buffer: "+buf.length, LOG_NP)
					}
					else if (e == 'NETPOLL_STREAM_MANUAL_REJECT')
					{
						log("Manual Reject",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if ( (e == 'NETPOLL_STREAM_TEST_START') || (e == 'NETPOLL_STREAM_TEST_END') || (e == 'NETPOLL_STREAM_REJECT_CLEAR') || (e == 'NETPOLL_STREAM_REJECT2_CLEAR') || (e == 'NETPOLL_STREAM_INTCPTR_SWITCH'))
					{
						valuesBuffer = buf.slice(29,31)
						log('Value: '+valuesBuffer.readUInt16LE(0),LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, null, null, e, username, group_id)
					}
					else if ((e == 'NETPOLL_STREAM_FAULTS_CLEAR') || (e == 'NETPOLL_STREAM_WARNINGS_CLEAR'))
					{
						log("Faults Cleared",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if (e == 'NETPOLL_STREAM_LOGIN')
					{
						log("User Logged In",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if (e == 'NETPOLL_STREAM_LOGOUT')
					{
						log("User Logged Out",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if (e == 'NETPOLL_STREAM_POWERUP')
					{
						log("Power Up",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if (e == 'NETPOLL_STREAM_SEL_UNIT')
					{
						log("Select Unit (multi-unit)",LOG_NP)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, null, null, e, username, group_id)
					}
					else if (e == 'NETPOLL_STREAM_FRAM')
					{
						log("Got Fram Record",LOG_NP)
						var bitArray = buf.slice(25,49)
						var fram_rec = buf.slice(49)
//						log(bitArray)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, bitArray, fram_rec, e, username, 0)
					}
					else if ((e == 'NETPOLL_STREAM_REJECT') || (e == 'NETPOLL_STREAM_REJECT2') || (e == 'NETPOLL_STREAM_FAULTS') || (e == 'NETPOLL_STREAM_EYE_PROD_PEAK') || (e == 'NETPOLL_STREAM_PROD_DELETE') || 
									 (e == 'NETPOLL_STREAM_PROD_BACKUP') || (e == 'NETPOLL_STREAM_PROD_COPY') || (e == 'NETPOLL_STREAM_PROD_RESTORE') || (e == 'NETPOLL_STREAM_PROD_DEFAULTS') || (e == 'NETPOLL_STREAM_WARNINGS') || 
									 (e == 'NETPOLL_STREAM_CLEAR_SCOPE'))
					{
						valuesBuffer = buf.slice(29,33)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, null, null, e, username, group_id)
					}
					else if (e == 'NET_POLL_PROD_REC_VAR')
					{
						log("Got Product Record",LOG_NP)
						log("Product number " + buf.readUInt16LE(23),LOG_NP)
						valuesBuffer = buf.slice(23,25)
						var bitArray = buf.slice(25,49)
						var prod_rec = buf.slice(49)
//						log(bitArray)
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, valuesBuffer, bitArray, prod_rec, e, username, 0)
					}
					else if (e == 'NET_POLL_PROD_SYS_VAR')
					{
						log("Got System Record",LOG_NP)
						var bitArray = buf.slice(25,49)
						var sys_rec = buf.slice(49)
//						log(bitArray)
						var row = this.db.prepare("SELECT rowid, * FROM sysRec"+this.detectorsList[detector_index].name+" WHERE rowid = "+this.sys_rec_ref[detector_index]).get()
						if (row && (row.SysRec.readUInt16LE(2) != sys_rec.readUInt16LE(2))) //There is a product change
						{
							log("Product Change",LOG_NP)
							this.checkPrevProdChangeAutoGenRep(detector_index)
						}
						this.queue_db_wr_netpoll_event(detector_index, this.vdefId[detector_index], key, null, bitArray, sys_rec, e, username, 0)
					}
		 			else 
					{
						log("Key: "+key+" not found.", LOG_NP)
					}
				}	

			}
			
		}
		//return packet_id;
		
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
		return this.pad(year,4)+"-"+this.pad(month,2)+"-"+this.pad(day,2)+" "+this.pad(hours,2)+":"+this.pad(min,2)+":"+this.pad(sec,2)
//	  return [year, month, day, hours, min, sec, msec];
	}

	reset_faults(detector_index){
		var self = this;
		if (this.vdef[detector_index])
		{
			this.vdef[detector_index]["@labels"]["FaultSrc"]["english"].forEach(function(fault, i){
				if(i>0)
					self.faults_bin[detector_index][i-1] = false;
			});
		}
	}

	parse_faults(key, value, detector_index, vdefs){
		var mask = 1;
	  var res = "";
		var pos = 0;
	  var idx = key & 0xff;
		while(mask < 0x10000)
		{
			if( (value & mask) == mask )
	    {
				var fault_number = pos+1+16*idx;
//	      log(this.vdef[detector_index]["@labels"].FaultSrc.english[fault_number])
	      res = res + vdefs[detector_index]["@labels"].FaultSrc.english[fault_number] + ", ";
				this.faults_bin[detector_index][fault_number-1] = true;
	    }
			mask <<=1;
			pos++;
		}
		if(value == 32)
			this.test_status[detector_index] = "Test Signal Fault"
		return res;
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

	word_array_to_buffer(array){
		var byteArray = []
		array.forEach(function(val){
			byteArray.push(val & 0xff)
			byteArray.push(val >> 8)
		})
		return (new Buffer(byteArray))
	}

	check_children(children_table, param){
		var res = {exits: false, pos: 0}
		children_table.forEach(function(child,i){
				if (child.Name == param)
				{
					res.exists = true
					res.pos = i
				}
		})
		return res;
	}
	
	check_parent(children_table, param){
		var res = {exits: false, pos: []}
		children_table.forEach(function(child,i){
				if (child.Parent == param)
				{
					res.exists = true
					res.pos.push(i)
				}
		})
		return res;
	}

	parse_rec_db_separate(buf,rec,detector_index){
		var self = this;
		var word_array;
		var vdef = this.vdefQuery[detector_index]
		var prec = []
			var nvdf = [[],[],[],[],[],[],[]];
			var defList = ['SRecordDate','PRecordDate','Sens','Sens_A','Sens_B','ProdName','ProdNo','PhaseAngle','PhaseMode','PhaseAngle_A',
			'PhaseAngle_B','DetMode','DetMode_A','DetMode_B','PhaseMode_A','PhaseMode_B','RejMode']
        var pVdef = [{},{},{},{},{},{},{}];
        vdef['@params'].forEach(function (p) {
          // body...
          if(("username" == p["@type"])||("user_opts" == p["@type"])||("password_hash" == p["@type"])){
            nvdf[6].push(p['@name'])
            pVdef[6][p['@name']] = p
          }else{


            nvdf[p["@rec"]].push(p['@name'])
            pVdef[p['@rec']][p['@name']] = p
          }
        })

        pVdef[5] = vdef["@deps"]

//		if (rec == 0){
			word_array = this.convert_word_array(buf.slice(0));
//		}
//		else if (rec == 1){
//			word_array = this.convert_word_array(buf.slice(2));
			
//		}
		  for (var dep in this.vdef[detector_index]["@deps"])
		    {
		      if(rec == this.vdef[detector_index]["@deps"][dep]["@rec"])
		      {
		        var array_pos = this.vdef[detector_index]["@deps"][dep]["@i_var"];
		        var bit_pos = this.vdef[detector_index]["@deps"][dep]["@bit_pos"];
		        var bit_len = this.vdef[detector_index]["@deps"][dep]["@bit_len"];
		        this.record_deps[detector_index][dep] = (word_array[array_pos] >> bit_pos) & ((1<<bit_len)-1);
		      }
		    }
		    if(rec == 0){
		    	this.sysDeps = parseDeps(vdef,word_array,0)
		    }else if(rec == 1){
		    	this.prodDeps = parseDeps(vdef,word_array,1)
		    }
		
		 nvdf[rec].forEach(function(p){
		 	prec.push({Name:p, Value:getVal(word_array, rec,pVdef[rec][p])});
		 })
		 if(rec == 0){
		 	this.sysRec = prec.map(function(e){
								var label = false;
								var val = e.Value
								var changed = false
								/*if(val != defaults.Sys[e.Name]){
									changed = true

								}*/
								if(typeof pVdef[0][e.Name] != 'undefined'){
									var pram = pVdef[0][e.Name]
									var deps = [];
										if(pram["@type"]){
											var f =	pram["@type"]
											if(pram["@dep"]){
												deps = pram["@dep"].map(function(d){
													
													return self.sysDeps[d] || 0; 
												});
											}	
											if(pram['@bit_len']<=16){
												val =  Params[f].apply(this, [].concat.apply([], [val, deps]));
											}
					
										}
									if(pram["@labels"]){
										label = true
									}
								}
								if(label){
                  var lg = 'english'
									log(pram['@labels'])
                  if(vdefMap['@lists'][pram['@labels']][self.language]){
                    lg = self.language
                  }
                  val = vdefMap['@lists'][pram['@labels']][lg][val]
                }
					                var nm = e.Name;
					                if(nm.indexOf('TestConfigCount') != -1){
					                	var testTypes = ['Manual Test', 'Halo Test', 'Manual Test 2', 'Halo Test 2']

										nm = testTypes[parseInt(nm.slice(-3,-2))] + ' Pass ' + (parseInt(nm.slice(-1))+1);
					                }else if(params_map[nm]){
					                	nm = params_map[nm]['@translations'][self.language]['name']
					                }else if(nm.slice(-2) == '_A' || nm.slice(-2) == '_B'){
				                	if(params_map[nm.slice(0,-2)]){
				                		nm = params_map[nm.slice(0,-2)]['@translations'][self.language]['name'] +" "+ nm.slice(-1)
				                	}
				                }
								return {Name:nm, Value:val, changed:changed, pname:e.Name, val:e.Value}
							})
;
		 }else if(rec == 1){
		 	this.prodRec = prec.map(function(e){
								var label = false;
								var val = e.Value
								var changed = false
								/*if(val != defaults.Sys[e.Name]){
									changed = true

								}*/
								if(typeof pVdef[1][e.Name] != 'undefined'){
									var pram = pVdef[1][e.Name]
									var deps = [];
										if(pram["@type"]){
											var f =	pram["@type"]
											if(pram["@dep"]){
												deps = pram["@dep"].map(function(d){
													if(pVdef[5][d]["@rec"]==0){
														return self.sysDeps[d] || 0; 
													}else{
														return self.prodDeps[d] || 0; 
													}
												});
											}	
											if(pram['@bit_len']<=16){
												val =  Params[f].apply(this, [].concat.apply([], [val, deps]));
											}
					
										}
									if(pram["@labels"]){
										label = true
									}
								}
								if(label){
                  var lg = 'english'
                  if(vdefMap['@lists'][pram['@labels']][self.language]){
                    lg = self.language
                  }
                  val = vdefMap['@lists'][pram['@labels']][lg][val]
                }
				                   var nm = e.Name;
				                if(nm.indexOf('TestConfigCount') != -1){
				                	var testTypes = ['Manual Test', 'Halo Test', 'Manual Test 2', 'Halo Test 2']

									nm = testTypes[parseInt(nm.slice(-3,-2))] + ' Pass ' + (parseInt(nm.slice(-1))+1);
				                }else if(params_map[nm]){
				                	nm = params_map[nm]['@translations'][self.language]['name']
				                }else if(nm.slice(-2) == '_A' || nm.slice(-2) == '_B'){
				                	if(params_map[nm.slice(0,-2)]){
				                		nm = params_map[nm.slice(0,-2)]['@translations'][self.language]['name'] +" "+ nm.slice(-1)
				                	}
				                }
								return {Name:nm, Value:val, changed:changed, pname:e.Name, val:e.Value}
							});
		 }
	}

	load_vdef_db(rowid,detector_index){
		var row = this.db.prepare("SELECT rowid, * FROM vdef"+this.detectorsList[detector_index].name+" WHERE rowid="+rowid+" ORDER BY rowid DESC LIMIT 1").get()
		log("Loading Vdef:")
		return JSON.parse(row.Vdef)
	}

	parse_rec_db(buf,rec, detector_index){
		var self = this;
		if (this.record_deps[detector_index])
		{
//		if (rec == 0)
			var word_array = this.convert_word_array(buf.slice(0));
//		else if (rec == 1)
//			var word_array = this.convert_word_array(buf.slice(2));
    for (var dep in this.vdefQuery[detector_index]["@deps"])
    {
      if(rec == this.vdefQuery[detector_index]["@deps"][dep]["@rec"])
      {
        var array_pos = this.vdefQuery[detector_index]["@deps"][dep]["@i_var"];
        var bit_pos = this.vdefQuery[detector_index]["@deps"][dep]["@bit_pos"];
        var bit_len = this.vdefQuery[detector_index]["@deps"][dep]["@bit_len"];
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

	mm(value, units){
	  if(units == 0)
			return (value/25.4).toFixed(2) + " in";
	  else
			return value + " mm";
	}

	prod_name_u16_le(buf, p, idx, i, detector_index){
	  var res = "";
	  var bytes_len = p["@bit_len"]>>3; //number of bytes occupied by the product name.

	  if(idx == 0)
	  {
			if (this.vdef[detector_index]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
				var prod_name_pos = 13 + p["@i_var"]*2;
			else
	    	var prod_name_pos = 9 + p["@i_var"]*2;
	    var prod_name_array = buf.slice(prod_name_pos, prod_name_pos + bytes_len);
	    prod_name_array.forEach(function (val){res = res + String.fromCharCode(val)});
	  }
	  else if((idx >= p["@i_var"]) && (idx < p["@i_var"]+(bytes_len<<1)))
	  {
	    var char_pos = 2*(idx - p["@i_var"]);

			if (this.param_last_val[detector_index][p["@name"]])
				var str1 = this.param_last_val[detector_index][p["@name"]].toString().substring(0,char_pos);
			else
				var str1 = ""
			if (this.vdef[detector_index]['@net_poll_h']['NET_POLL_STREAM_EVENT'])
				var str2 = String.fromCharCode(buf[11]) + String.fromCharCode(buf[12]);
			else
				var str2 = String.fromCharCode(buf[2]) + String.fromCharCode(buf[3]);
			if (this.param_last_val[detector_index][p["@name"]])	
				var str3 = this.param_last_val[detector_index][p["@name"]].toString().substring(char_pos+2,bytes_len);
			else
				var str3 = ""
 
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
		this.param_last_val[detector_index][p["@name"]] = res;
		
	  return res;
	}

	prod_name_u16_db_event(row, p, idx, last_name){
		var res = "";
		var bytes_len = p["@bit_len"]>>3;
		var char_pos = 2*(idx - p["@i_var"]);
		var str1 = last_name.substring(0,char_pos);
		var str2 = String.fromCharCode(row.Value & 0xff) + String.fromCharCode(row.Value >> 8);
		var str3 = last_name.substring(char_pos+2,bytes_len)
		if(str1 != "0")
			res = str1 + str2 + str3;
		return res;
	}

	frac_value(value){
	  return (value/(1<<15));
	}

	phase(value, p, i, detector_index, vdefs){
	  var res;
	  var wet = this.record_deps[detector_index][p['@dep'][0]];
	  var det = this.record_deps[detector_index][p['@dep'][1]];

	  if(wet == 0)
	    res = 0;
	  else if(det == 0)
	    res = 1;
	  else
	    res = 2;

	  var label_type = vdefs[detector_index]['@deps'][p['@dep'][0]]['@labels'];
    var lg = 'english'
    if (vdefMap["@lists"][label_type][this.language] && vdefMap["@lists"][label_type][this.language][res])
      lg = this.language									
		var label = vdefMap["@lists"][label_type][lg][res];
		
	  if(res == 0)
		{
			res = ((this.frac_value(value)*45)+90).toFixed(2) + ' ' + label;
		}
	  else
		{
			res = (this.frac_value(value)*45).toFixed(2) + ' ' + label;
		}
	  return res;
	}

	rej_del(value, p, i, detector_index, vdefs){
	  var res;
	  var clock_val = this.record_deps[detector_index][p['@dep'][0]];
	  var label_type = vdefs[detector_index]['@deps'][p['@dep'][0]]['@labels'];
    var lg = 'english'
    if (vdefMap["@lists"][label_type][this.language] && vdefMap["@lists"][label_type][this.language][clock_val])
      lg = this.language									
	  var label = vdefMap["@lists"][label_type][lg][clock_val];

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

	belt_speed(value, p, i, detector_index){
	  var res;
	  var units = this.record_deps[detector_index][p['@dep'][0]];
	  var clock_source = this.record_deps[detector_index][p['@dep'][1]];
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

	eye_rej_mode(value, p, idx, i, detector_index, word, vdefs){
	  var res;
	  var photo;
	  var width;

	  if(idx == 0)
	  {
	    photo = this.record_deps[detector_index][p['@dep'][0]];
	    width = this.record_deps[detector_index][p['@dep'][1]];
	  }
	  else if(idx == p['@i_var'])
	  {
	    var bit_pos = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_len'];
	    photo = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[detector_index][p['@dep'][0]]=photo;
	    bit_pos = vdefs[detector_index]['@deps'][p['@dep'][1]]['@bit_pos'];
	    bit_len = vdefs[detector_index]['@deps'][p['@dep'][1]]['@bit_len'];
	    width = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[detector_index][p['@dep'][1]]=width;
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
    var lg = 'english'
    if (vdefMap["@lists"][p['@labels']][this.language] && vdefMap["@lists"][p['@labels']][this.language][res])
      lg = this.language									
	  return vdefMap["@lists"][p['@labels']][lg][res];
	}

	phase_mode(value, p, idx, i, detector_index, word, vdefs){
	  var res;
	  if(idx == 0)
	  {
	    if(this.record_deps[detector_index][p['@dep'][0]] == 0)
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
	    this.record_deps[detector_index]['ProdRec.SigPath[0].PhaseWet']=value;
	  }
	  else if(idx == vdefs[detector_index]['@deps'][p['@dep'][0]]['@i_var'])
	  {
	    var bit_pos = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_len'];
	    var val_dep = (word >> bit_pos) & ((1<<bit_len)-1);
	    this.record_deps[detector_index][p['@dep'][0]]=val_dep;
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
    var lg = 'english'
    if (vdefMap["@lists"][p['@labels']][this.language] && vdefMap["@lists"][p['@labels']][this.language][res])
      lg = this.language									
	  return vdefMap["@lists"][p['@labels']][lg][res];
	}

	password8(value, i, detector_index){
	  var res = String.fromCharCode(((value & 0xf000) >> 12) + 48);
	  res = res + String.fromCharCode(((value & 0xf00) >> 8) + 48);
	  res = res + String.fromCharCode(((value & 0xf0) >> 4) + 48);
	  res = res + String.fromCharCode((value & 0xf) + 48);
	  return res;
	}

	parse_and_print_param_1_dep(value, p, idx, i, detector_index, word, vdefs){
	  var res;
	  if(idx == 0)
	  {
	    if(this.record_deps[detector_index][p['@dep'][0]] == 0)
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
	    var bit_pos = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_pos'];
	    var bit_len = vdefs[detector_index]['@deps'][p['@dep'][0]]['@bit_len'];
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
    var lg = 'english'
    if (vdefMap["@lists"][p['@labels']][this.language] && vdefMap["@lists"][p['@labels']][this.language][res])
      lg = this.language									
	  return [vdefMap["@lists"][p['@labels']][lg][res], res];
	}
}

module.exports = NetPollEvents;
exports

