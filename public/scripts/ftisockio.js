'use strict'

class FtiSockIo{
	constructor(url){
		this.sock = new WebSocket(url)
		this.handlers = {}
		var self = this;
		this.sock.onmessage = function (message) {
			// body...
			var msg = JSON.parse(message.data)
			self.handle(msg.event, msg.data);
			message = null;
			msg = null;
			//packetPool.recycle(obj);
		}
		this.sock.onopen = function (argument) {
			// body...
		//	self.emit('locateReq');
			self.emit('getVersion');
			self.emit('getPrefs');
		}

	}
	handle(ev,data){
		if(this.handlers[ev]){
			this.handlers[ev](data)
			data = null;
		}else{
			//console.log(465,ev)
		}

	}
	on(handle, func){
		////////console.log(handle)
		this.handlers[handle] = func
	}
	off(handle){
		this.handlers[handle] = 0;
	}
	emit(handle,data){
		if(data){
			//////console.log('data is present')
		}else{
			//////console.log('data null')
			data = 1
		}
		//data = data || 1
		this.sock.send(JSON.stringify({event:handle,data:data}));
		data = null;
	}
}

module.exports = FtiSockIo;