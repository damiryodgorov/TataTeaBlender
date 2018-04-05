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
	prog_erase_app(callBack){
		var bytes = Buffer.alloc(512,0xff)
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
		fs.readFile(fn,function(err,res){
			var vec_end_val = 0xffffffff
			var n = null;
			for(var i = 0; i < 2840; i = i+4){
				if(res.readUInt32LE(i) == vec_end_val){
					n = i;
					break;
				}
			}
			if(n == null){
				throw new ArmRpcError('Verify bin file: size not found');
			}
			var size = res.readUInt32LE(n+4)
			var start_addr = res.readUInt32LE(n+8)
			callBack(size,start_addr)
		})
	}
	prog_rc_block(n,i,fsize,buf,callBack){
		var self = this;
		if(n < fsize){
			var data = buf.slice(n,n+512)//pad with 0xff if less than blk_size
			//console.log('data length', data.length)
			if(data.length < 512){
				//console.log('fill', data)
				//data.fill(0xff,data.length)
				data = Buffer.concat([data,Buffer.alloc(512,0xff)]).slice(0,512);
				//console.log('filled', data)
			}
			this.prog_block(i,data,function(d){
			//	console.log(d)
				if(d.readUInt8(3) != 4){
					throw new ArmRpcError('Error Programming Block');
				}
				self.prog_rc_block(n+512, i+1, fsize,buf, callBack)
			})
		}else{
			callBack()
		}
	}
	/*
	  def verify_binary_file(bin_file)
        bf=read_binary_file(bin_file)
        vec_end_val = 0xffffffff
        n=nil; (0..2840).step(4) {|i| if bf[i,4].unpack('L')[0] == vec_end_val; n=i; break; end}
        raise "Verify bin file: size not found" unless n
        size = bf[n+4,4].unpack('L')[0] # extract the file size
        p "Program Size: #{bf[n+4,4].unpack('L')[0]}"
        raise "Verify bin file: size error" unless n < bf.size
        start_addr = bf[n+8,4].unpack('L')[0]
        p "Start Address: 0x#{start_addr.to_s(16)}"
        csum = Digest::SHA1.digest( bf[0,size] ) # compute checksum
        raise "Verify bin file: digest error" if csum != bf[size,csum.size]
        puts "check bytes: #{csum.unpack('C*').inspect}"
        [bf,start_addr]
      end
          def prog_block(i, bytes, timeout=1)
        raise "prog_block: called with wrong block size" unless bytes.size == ARM_PROG_BLOCK_SIZE
        bytes = bytes.pack('C*') if Array===bytes
        pkt = [ARM_RPC_FW_UPDATE,3,i].pack('CCS') + bytes
        res = rpc(pkt, timeout)
        return res[2]+(res[3] << 8) if res[1]==4 # ack with block number
        raise "Error prog_block: #{res.inspect}"
      end
      
      def prog_binary(binary_file, app_start=nil)
        arm = self; blk_size = ARM_PROG_BLOCK_SIZE
        fsize = File.size(binary_file)
        open(binary_file, "rb") do |fd|
          n = 0; blk = 0
          while n < fsize
            data = fd.read(blk_size)
            data << "\xff" * (blk_size - data.size) if data.size < blk_size # pad the block with 0xff
            ack_blk = arm.prog_block(blk, data)
            # arm.read(app_start+(blk_size*blk),blk_size) {|s| raise "Verify failed" unless s==data} if app_start
            n += data.size; blk+=1
            percent = ([n,fsize-1].min * 100/fsize.to_f).to_i
            yield percent if block_given?
          end # while
        end # open
        yield 100 if block_given?
      end
	*/
	/*
		def bootloader # drop to boot loader
        rpc([ARM_RPC_FW_UPDATE,1,2], 0)
        # while sh_ping; end # keep trying to ping the bootloader as the ethernet comes up
        true
      end

	*/
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
		/*var self = this;
		Sync(function(){
			console.log(215)
			self.socket = self.init_socket.sync(null);
			console.log(217)
			var d = self.init_session_key(null);
			self.enc = d[0];
			self.dec = d[1];
			console.log("keys initialized")
		})*/
		
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

module.exports = {}
module.exports.ArmRpcBase = ArmRpcBase
module.exports.ArmRpc = ArmRpc
module.exports.ArmRpcError = ArmRpcError
module.exports.ArmRpcErrorChecksum = ArmRpcErrorChecksum
module.exports.ArmRpcErrorTimeout = ArmRpcErrorTimeout
module.exports.ArmRpcAckError = ArmRpcAckError
