'use strict'
var dgram = require('dgram');
var net = require('net');

const DSP_SCOPE_PORT = 10004

class FtiRpc{
	constructor(host, port, unit){
		unit = unit || 1
		port = port || 10001
		this.unit = unit
		if(!host){return this}
		
			this.port = new FtiRpcSocket(host,port)
			console.log("ftirpc.new")
			//console.log(this.port)
	}
	close(){
		if(this.port){
			this.port.close();
		}
	}

	rpc_n(func,args,string,timeout,callBack){
		var trys = 0;
		var err = null;
		var ack;
		while( trys <3){
			trys = trys + 1;
			//ack
		}
	}
	rpc(func,args,string,timeout,callBack){

	}
	rpc2(payload,callback){
		var packet = this.frame(payload);
		this.port.write(packet)
		this.port.callBack = callback;
	}
	rpc1(func,args,string,timeout,callBack){
		var payload = this.payloadForRpc(func,args,string);
		var packet = this.frame(payload);
		this.port.write(packet);
		this.port.callBack = callBack
		
		
	}
	send_packet(packet, timeout){

	}
	rpc0(func,args,string,callBack){
		var payload = this.payloadForRpc(func,args,string);
		var packet = this.frame(payload);
		this.port.write(packet);
		this.port.callBack = function(){
//			console.log('no callBack set')
		}
	}
	payloadForRpc(func,args,string){
		var payload = [func]//String.fromCharCode(func)
		
		var argByte = args.length%4
		if(string){
			payload.push(argByte + 4)
		}else{
			payload.push(argByte)// = payload.concat(argByte)
		}
		for(var i = 0; i<argByte; i++){
			var word = args[i]
			if(!Number.isInteger(word)){
				word = Math.round(word);
			}
			payload.push(word & 0xff)
			payload.push((word>>8)&0xff)
		}
		if(string){
			//	string = new Buffer(string); not going to deal with this yet
		}
		
		
		payload = this.addCheckSum(payload);
		
		return new Buffer(payload);

	}
	addCheckSum(str){
		var cs = this.checkBytes(str);
		str.push(cs[0]);
		str.push(cs[1]);
		return str;//str.concat(String.fromCharCode(cs[0])).concat(String.fromCharCode(cs[1])); 
	}
	checkBytes(str){
		var c = this.fletcherCheckbytes(str)
		var cs = []; 
		cs[0] = 255-((c[0]+c[1])%255);
		cs[1] = 255-((c[0]+cs[0])%255);
		return cs;
	}
	fletcherCheckbytes(str){
		var c1 = 0;
		var c2 = 0;
		var bytes = []
		for(var i = 0; i < str.length; i++){
			var b = str[i]
			c1 = c1 + b;
			if(c1>= 255){
				c1 = c1 - 255
			}
			c2 = c2 + c1;
			if (c2>=255){
				c2 = c2 - 255
			}
		}
		return [c1,c2];

	}
	frame(string){
		//for udp not required...
		//will implement for non-udp in the future
		return string
		//var pak =
	}

	static udp(host, port, unit){
		return new FtiRpcUdp(host, port, unit)
	}

	/* RPC's */
	/*version(){}
	findUnits(){}
	uart1_speed_high(){}
	serialLoad(){}
	sboot(){}
	trigger_fss(){}
	program_flash_hex(){}
	program_flash_img(){}
	program_flash_unlock(){}
	program_sector(){}
	verify_sec(){}
	lastSectorWritten(){}
	flash_func_version(){}
	echo(){}
	ssi_cfg(){}
	sst(){}
	default_rec(){}
	f_vdef(){}
	f_defaults(){}
	default_records(){}
	set_vdef_records(){}
	load_vdef(){}
	load_defaults(){}
	vdef(){}
	p_vdef(){}
	*/
	/*********************************************************/
	/*  net-poll											 */
	/*********************************************************/

	parse_netpoll_packet(data){}
	fat_time_to_s(time){}
	parse_pkg_phase(integer){}


	pdm(){}
	read(){}
	write(){}
	value_segments(str,seg_size){}

	/* conversion fns - todo when there is more time */

	/* RPC's will be implemented in the future to mirror the original fti-flash */

	
}
class FtiRpcSocket extends net.Socket{

}

class FtiRpcUdp extends FtiRpc{
	constructor(host, port, unit){
		super();
		port = port || 10001;
		unit = unit || 1;

		this.unit = unit;
		if(!host){
			return this;
		}
		this.port = new FtiRpcUdpSocket(host,port)
	}
	scope_comb_test(n){
		var ra =[];
		var xa =[];
		var idx ;
		var s = dgram.createSocket('udp4');
		var self = this
		s.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
			self.rpc0(6,[n,0]);
			
		});
		s.on('message', function(e,rinfo){
			console.log('receiving');
			if(e){
				//console.log(e.byteLength)
				idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				console.log([r,x,idx]);
				if (idx == 1){
					console.log(ra);
					console.log(xa);
					s.close();
					s.unref();
				}
			}else{
				s.close();

			}
		});
		s.on('close', function(){
			console.log('closing')
			s.unref();
		})
		setTimeout(function(){
			if(idx != 1){
				s.close();
			}else{
				s.unref();
			}
		}, 1000);

	}
	dsp_manual_test(callBack){
		var ra =[]
		var xa =[]
		var idx 
		var s = dgram.createSocket('udp4');
		var self = this
		s.bind(DSP_SCOPE_PORT,'0.0.0.0', function(){
			self.rpc0(6,[3*231,3]);
			
		});
		s.on('message', function(e,rinfo){
			console.log('receiving')
			if(e){
				//console.log(e.byteLength)
				idx = e.readInt16LE(0);
				var r = e.readInt16LE(2);
				var x = e.readInt16LE(4);
				ra.push(r);
				xa.push(x);
				console.log([r,x,idx]);
				if (idx == 1){
					console.log(ra);
					console.log(xa);
					callBack([ra,xa]);
					s.close();
					s.unref();
				}
			}else{
				s.close();

			}
		});
		s.on('close', function(){
			console.log('closing')
			s.unref();
		})
		setTimeout(function(){
			if(idx != 1){
				s.close();
			}else{
				s.unref();
			}
		}, 1000);
	}
}

class FtiRpcUdpSocket{
	constructor(host,port){
		port = port || 10001
		this.rem_ip = host;
		this.callBack = function(){
		//	console.log('no callback set')
		}
		this.rem_port = port;
		this.socket = dgram.createSocket('udp4');
		this.socket.bind(0,'0.0.0.0', function(){
			console.log('socket bound')
		});
		var self = this;

		this.socket.on('message',function(e, rinfo){
			self.callBack(e, rinfo)
		})
		return this
	}
	write(packet){
		
//		console.log('writing packet')
		this.socket.send(packet, 0, packet.length, this.rem_port, this.rem_ip, function(){
//			console.log('packet written')
		});

	}
	purge(){/*does nothing for udp*/}
	getPayload(sec, callBack){
		var ack =""
		var err;
		var sender;
		var timer = setTimeout(function(){
			err = "Rpc Ack Timeout"
			callBack(ack, err)
			return;
		}, sec*1000);
		this.socket.on('message', function(e,rinfo){
			ack = e;
			sender = rinfo;
			//console.log(sender)
			callBack(ack,err)
			return;
		})
	}
	close(){
		this.socket.close(function(){
			console.log("shut down dsp")
		})
	}


}

module.exports ={}
module.exports.FtiRpc = FtiRpc;
module.exports.FtiRpcUdp = FtiRpcUdp;
module.exports.FtiRpcSocket = FtiRpcSocket;
module.exports.FtiRpcUdpSocket = FtiRpcUdpSocket;	