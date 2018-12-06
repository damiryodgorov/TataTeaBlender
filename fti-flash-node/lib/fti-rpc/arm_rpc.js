'use strict'
var dgram = require('dgram');
var Crc = require('crc');
var crypto = require('crypto');
var aesjs = require('aes-js')
var fs = require('fs');
//var Sync = require('sync');

const ARM_RPC_PORT = 10002
const LCD_DISPLAY_PORT = 54005
const LOCATOR_PORT = 27182

const ARM_RPC_ECHO 		   =  0
const ARM_RPC_VERSION 	   =  1
const ARM_RPC_LCD		   =  2
const ARM_RPC_SYNC         =  3 // Sync RPC number
const ARM_RPC_READ         =  4 // read bytes from arm memory
const ARM_RPC_WRITE        =  5 // write bytes to arm memory
const ARM_RPC_LOG          =  6 // RPC used to log over udp
const ARM_RPC_EXTERNAL_USB =  7 // External USB RPC number
const ARM_RPC_FW_UPDATE    =  8 // RPC number for DSP-ARM firmware update
const ARM_RPC_LIVE_DATA    =  9 // RPC number for live data
const ARM_RPC_FUA_TEST     = 10 // RPC number for .FUA file test
const ARM_RPC_DSP          = 11 // RPC number for dsp control
const ARM_RPC_TESTMODE     = 13 // RPC number for setting global test-mode for hardware testing
const ARM_RPC_DEBUG        = 15 //JTAG enable/disable
  
const ARM_RPC_IOB          = 100 // RPC number for io-board
  
const ARM_PROG_BLOCK_SIZE  = 512
  
const ARM_RPC_ERROR = 255

const KEY_FRMW = Buffer.from([0x7E, 0xB2, 0x8A, 0xF9, 0x5F, 0xFB, 0xB9, 0xA7, 0x47, 0x02, 0xC8, 0x3A, 0xCE, 0xF2, 0x35, 0xF7])

class ArmRpcError extends Error{}
class ArmRpcErrorTimeout extends ArmRpcError{}
class ArmRpcErrorChecksum extends ArmRpcError{}
class ArmRpcAckError extends ArmRpcError{}

class ArmRpcBase{
	constructor(host, port,loc_port){
		if(!host){
			return this;
		}
		port = port || ARM_RPC_PORT;
		loc_port = loc_port || 0;

		this.rem_ip = host
		this.rem_port = port
		this.loc_port = loc_port
		this.callBack = function(e){
			console.log(e)
		}
		var self = this;
		this.init_socket()
		//Sync(function(){
			//self.socket = self.init_socket.sync(null);	
		//})
		
	}
	clearCB(cb,e){
		this.callBack = null;
		this.callBack = function(e){
			console.log(e)
		}	
		cb(e)	
	}
	onMessage(e){
		var data = this.verify_rpc_ack(e)
		this.callBack(data);

		
	}
	init_socket(){
		/*
		@socket.close if @socket
        @socket = UDPSocket.new
        @socket.bind('0.0.0.0', @loc_port)
		*/
		var self = this;
		console.log("socket init")
		if(this.socket){
			this.socket.close();
			this.socket.unref();
		}
		this.socket = dgram.createSocket('udp4');
		this.socket.on("bind",function(){
			console.log("bound f")
		})
		this.socket.on('message',function(e,rinfo){
			//console.log(80,rinfo.port)
			if(rinfo.port == self.rem_port){
				self.onMessage(e)

			}
		})
		this.socket.bind(0,'0.0.0.0');

	}

	rpc(data, time_out, trys){
		time_out = time_out || 1.0
		trys = trys || 1

		var self = this;
		var packet = this.packet_for(data)
		this.send(packet)
		if(time_out <= 0){
			return 0;
		}else{
		var ack, sender
		this.get_rpc_ack(time_out,trys,packet, function(data){
			//console.log(rinfo);
			ack = data[0];
			sender = data[1];
			self.verify_rpc_ack(ack);

		});
		}
		//if(!ack)
	}
	send(packet, ip, port){
		ip = ip || this.rem_ip;
		port = port || this.rem_port;
		console.log('port? ')
		console.log(port)
		this.socket.send(packet,0,packet.length,port,ip, function () {
			// body...
			console.log('sent packet!');
		});


	}
	packet_for(data, callBack){
		if(Array.isArray(data)){
			data = Buffer.from(Array.prototype.concat.apply([],data));
		}
		else{
			data = Buffer.from(data);
		}
		var crcBuff = new Buffer(4)//[Crc.crc32(data)]);
		crcBuff.writeUInt32LE(Crc.crc32(data));
		return Buffer.concat([data, crcBuff]);
	}
	packet_for0(data){
		if(Array.isArray(data)){
			data = new Buffer(Array.prototype.concat.apply([],data));
		}
		else{
			data = new Buffer(data.toString());
		}
		var crcBuff = new Buffer([Crc.crc32(data)]);
		return Buffer.concat([data, crcBuff]);
		
	}
	get_rpc_ack(sec, trys, packet, callBack){
		sec = sec || 1.0
		trys = trys || 1

		var self = this;

		var ack;
		if(!packet){
			trys =1
		}
		var timedout = false;
		sec = sec/trys
		this.socket.on('message', function(msg,rinfo){
			self.init_socket();
			callBack([msg,rinfo]);
			ack = msg;

			
		});

		var t = setInterval(function(){
			if(!ack){
				if(packet && (trys>1)){
					self.send(packet);
					console.log("trys: " + trys.toString());
					trys = trys - 1
				}
				else{
					clearTimeout(t);
					console.log('oh no')
					throw new ArmRpcErrorTimeout();

				}
			}
			else{
				clearTimeout(t);
			}
		}, sec*1000)
	}
	verify_rpc_ack(ack){
 		if(ack.length < 4){
 			throw new ArmRpcErrorChecksum("Ack size is to small");
 		}
 		var data = ack.slice(0,-4);
 		var crc = Crc.crc32(data);
 		//if(){
 			//worry about this later
 		//}
 		return data
	}
	rpc_ack_dispatch(ack){
		//var res = ack.write()
	}
	echo(){
		var self = this;
		var pkt = [ARM_RPC_ECHO,1,2,3]
		//this.rpc(pkt,0)
		this.packet_for(pkt,function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			console.log(p.byteLength)
			console.log('echo')

		})
		
	}
	rpc_cb(pkt,callBack){
		var self = this;
	//	this.callBack = null;
		this.callBack=callBack;
	//	console.log('rpc_cb',pkt)
		this.packet_for(pkt,function(p){
	//		console.log('rpc_cb packet for', p, self.rem_port)
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip)
		})
	}
	rpc_cb_to(pkt,timeout,callBack){
		var self = this;
	//	this.callBack = null;
		this.callBack=callBack;
		console.log('rpc_cb',pkt)
		this.packet_for(pkt,function(p){
			console.log('rpc_cb packet for', p, self.rem_port)
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip)

		})
	}
	echo_cb(callBack){

		var self = this;
		var pkt = [ARM_RPC_ECHO,1,2,3]
		//this.rpc(pkt,0)
		this.packet_for(pkt,function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			console.log(p.byteLength)
			console.log('echo')
			callBack();

		})
	}
	dsp_open(){
		//this.rpc([11,5],0);
		var self = this;
		
		this.packet_for([11,5],function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			console.log(p.byteLength)
			console.log('dsp_open')

		})
		
	}
	dsp_open_cb(callBack){
		//this.rpc([11,5],0);
		var self = this;
		
		this.packet_for([11,5],function(p){
			self.socket.send(p,0,p.length,self.rem_port,self.rem_ip )
			console.log(p.byteLength)
			console.log('dsp_open')
			callBack()

		})
		
	}
	reset(callBack){
		this.rpc_cb([8,0], function(e){
			console.log(e)
			if(callBack){
				callBack()
			}
		})
	}
	bootloader(callBack){
		this.rpc_cb([8,1,2],callBack)
	}
	prog_start(bootloader, callBack){
		console.log('prog start')
		var dst = 2
		if(bootloader){
			dst = 3;
		}
		this.rpc_cb([8,1,dst],callBack)
	}
	prog_start_bl(callBack){
		this.prog_start(true, callBack)
	}
	prog_erase(callBack){
		this.rpc_cb([8,11],callBack)
	}
	prog_erase_app(enc_flag,callBack){
		console.log('prog erase app')
		var bytes = Buffer.alloc(512,0xff)
		if(enc_flag != 0){
			var ksize = KEY_FRMW.length;
			var aes = crypto.createCipheriv('aes-128-ecb', new Buffer(KEY_FRMW), "")
			aes.setAutoPadding(false);
			var enc_bytes = Buffer.alloc(0);
			var n = ARM_PROG_BLOCK_SIZE /ksize;
			for(var i = 0; i <n; i++){
				enc_bytes = Buffer.concat([enc_bytes, aes.update(bytes.slice(i*ksize, (i+1)*ksize))])
			}
			enc_bytes = Buffer.concat([enc_bytes, aes.final()]);
			bytes = Buffer.from(enc_bytes)
		}
		this.prog_block(0,bytes,callBack)
	}
	prog_binary(bf,callBack){
		var self = this;
		fs.readFile(bf,function(err,res){
			self.prog_rc_block(0,0,res.length, res,callBack)
		})
	}
	prog_block(i, bytes, callBack){
		var header = Buffer.alloc(4);
		header.writeUInt8(8,0);
		header.writeUInt8(3,1);
		header.writeUInt16LE(i,2);
		var pkt = Buffer.concat([header,Buffer.from(bytes)]);
		this.rpc_cb(pkt,callBack)
	}
	verify_binary_file(fn, callBack){
		fs.readFile(fn,function(er,res){
			if(er){
				throw er
			}
			var enc_flag = 0;
			var err = 0;
			var csum = ""
			var vec_end_val = 0xffffffff
			var n = null;
			var size = 0;
			var start_addr = 0;

			console.log(res.length)
			for(var i = 0; i < 1024; i = i+4){
				console.log(i, res.readUInt32LE(i))
				if(res.readUInt32LE(i) == vec_end_val){
					n = i;
					break;
				}
			}
			if(n != null){		
				size = res.readUInt32LE(n+4)
				start_addr = res.readUInt32LE(n+8)
				if(n < res.length){
					csum = checksum(res.slice(0,size),'sha1')
					if(Buffer.compare(csum,res.slice(size,size+csum.length)) == -1){
						err = 3
					}
				}else{
					err = 2
				}
				
			}else{
				err = 1;
			}
			if(err != 0){
				console.log("Checking file encryption..")
				var bsize = KEY_FRMW.length
				var rem = res.length % bsize;
				var div = res.length/bsize
				if(0 == rem){
					var dec = crypto.createDecipheriv('aes-128-ecb', new Buffer(KEY_FRMW), "")
					dec.setAutoPadding(false)
					var dec_bf = Buffer.alloc(0);
					for(var i = 0;i<div;i++){
						dec_bf = Buffer.concat([dec_bf, dec.update(res.slice(i*bsize, (i+1)*bsize))])
					}
					dec_bf = Buffer.concat([dec_bf,dec.final()]);
					n = null;
					for(var i = 0; i < 1024; i = i+4){
						console.log(i, dec_bf.readUInt32LE(i))
						if(dec_bf.readUInt32LE(i) == vec_end_val){
							n = i;
							break;
						}
					}
					if(n != null){
						size = dec_bf.readUInt32LE(n+4)
						start_addr = dec_bf.readUInt32LE(n+8)
						if(n < dec_bf.length){
							csum = checksum(dec_bf.slice(0,size),'sha1')
							if(Buffer.compare(csum,dec_bf.slice(size,size+csum.length)) != -1){
								err = 0
							}
						}
						enc_flag = 1;
					}
				}
			}
			if(err == 0){
				callBack(size,start_addr,enc_flag)
			}else if (err == 1){
				throw "Verify bin file: size not found"
			}else if (err == 2){
				throw "Verify bin file: size error"
			}else if (err == 3){
				throw "Verify bin file: digest error"
			}
			
		})

	}
	prog_rc_block(n,i,fsize,buf,callBack){
		var self = this;
		if(n < fsize){
			var data = buf.slice(n,n+512)//pad with 0xff if less than blk_size
			//console.log('data length', data.length)
			if(data.length < 512){
				
				data = Buffer.concat([data,Buffer.alloc(512,0xff)]).slice(0,512);
			}
			this.prog_block(i,data,function(d){
				console.log(i)
				if(d.readUInt8(3) != 4){
					throw new ArmRpcError('Error Programming Block');
				}
				self.prog_rc_block(n+512, i+1, fsize,buf, callBack)
			})
		}else{
			callBack()
		}
	}
}

class ArmRpc extends ArmRpcBase{
	constructor(host, port,loc_port){
		super(host, port,loc_port);
		if(!host){
			return this;
		}
		port = port || ARM_RPC_PORT;
		loc_port = loc_port || 0;

		this.rem_ip = host
		this.rem_port = port
		this.loc_port = loc_port
		this.init_socket();
	}
	init_session_key(callBack){
		
		if(this.aesECB){
			
			callBack([this.aesECB, this.aesk]);
		}else{
		//this.KEY = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]//
		this.KEY = [138, 23, 225,  96, 151, 39,  79,  57, 65, 108, 240, 251, 252, 54, 34,  87];
		var self = this;
		var bsize = this.KEY.length;
		var pk = [3, bsize];
		for(var i = 0; i<bsize; i++){
			pk.push(0);
		}
		var pkbuffer = new Buffer(pk);
		
		self.socket.send(pkbuffer,0,pkbuffer.length, LOCATOR_PORT, this.rem_ip);
		self.get_rpc_ack(1.0,1,pkbuffer,function(data){
			var msg = data[0];
			var tmp = []
			for(var i = 0; i < msg.byteLength; i++){
				tmp.push(msg.readUInt8(i));
			}

			var sk = tmp.slice(2, tmp.length);

			var aes = crypto.createDecipheriv('aes-128-ecb', new Buffer(self.KEY), "")
			aes.setAutoPadding(false);
			var k = aes.update((msg.slice(2,msg.byteLength)).toString('binary'),'binary');
			console.log(k.length)
			k = Buffer.concat([k,aes.final()]);
		//	self.aesk = k;
			
			var aesEcb = new aesjs.ModeOfOperation.ecb(self.KEY);
			var ke = aesEcb.decrypt(msg.slice(2,msg.byteLength));
			

			var ka = []
			for(var ko = 0; ko < ke.length; ko++){
				ka.push(ke.readUInt8(ko))
			}
			self.aesk = Buffer.from(ka);
//			console.log('aesk', self.aesk)

			self.aesECB = new aesjs.ModeOfOperation.ecb(ka);
		
			callBack([self.aesECB]);
		})
	
		}
		
	}

	packet_for(data, callBack){
		
		var dat = super.packet_for(data);

		var self = this;

		this.init_session_key(function(c){var bsize = self.KEY.length
		var pad = bsize - ((dat.length + 2)%bsize)
		if(pad == bsize){
			pad = 0;
		}
		var parry = []
		for(var i=0;i<pad;i++){
			parry.push(0)
		}
//		console.log('pad size: ' + pad.toString())
		var bu = new Buffer(2)//[dat.length]);
		bu.writeUInt16LE(dat.length)
		dat = Buffer.concat([bu ,dat, new Buffer(parry)])
		//var pkt = new Buffer([]);
		var n = Math.floor(dat.length/bsize);
		var en = c[0];
		var t;
		
		//console.log(typeof c[1])
		//var aes = crypto.createCipher('aes-128-ecb', c[1])
		
		var pkt = Buffer.alloc(0);//concat([aes.update(dat.slice(0,bsize)),aes.final()]);
		//console.log(pkt)
		for(var i = 0; i<n; i++){
			pkt = Buffer.concat([pkt,en.encrypt(dat.slice(i*bsize,(i+1)*bsize))])
		
		}
		callBack(pkt)

	})	

		
	}
	verify_rpc_ack(data){
		var	bsize = this.KEY.length;
		var n = data.length/bsize;
		var rem = data.length%bsize;
		if(rem != 0){
	//		console.log(data.length,rem)
			throw new ArmRpcAckError('Ack size must be multiple of '+bsize);
		}
		var en = this.aesECB;
		var pkt = en.decrypt(data)
		return pkt

	}
}


function checksum(str, algorithm) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str)
    .digest()
}

module.exports = {}
module.exports.ArmRpcBase = ArmRpcBase
module.exports.ArmRpc = ArmRpc
module.exports.ArmRpcError = ArmRpcError
module.exports.ArmRpcErrorChecksum = ArmRpcErrorChecksum
module.exports.ArmRpcErrorTimeout = ArmRpcErrorTimeout
module.exports.ArmRpcAckError = ArmRpcAckError
