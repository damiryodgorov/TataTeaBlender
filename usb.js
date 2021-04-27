const usb = require('usb')
const fs = require('fs')
const exec = require('child_process').exec
const dgram = require('dgram');
const net = require('net')
const Fti = require('./fti-flash-node')

const MOUNT_DIR = "/media/usb_stick"

function run_command(command, cb, errCb){
	exec(command, function(err, stdout, stderr){
		if(err || stderr){
			errCb(err, stderr)
		}else{
			cb(stdout)
		}
	})
}

function uuid_from_line(line){
	var start_str = 'UUID=\"'
	var example_uuid = "6784-3407"
	var uuid_start = line.indexOf(start_str)
	var uuid_end = uuid_start + example_uuid.length;
	return line.slice(uuid_start+start_str.length, uuid_end+start_str.length)
}

usb.on('attach',function(dev){
	console.log('attach')
	setTimeout(function(){

		run_command("blkid | grep /dev/sd", function(cb){
			if(cb.length > 0){
				var array = cb.split('\n');
				var line = array[0];

				if(!fs.existsSync(MOUNT_DIR)){
					console.log('exists')
					fs.mkdirSync(MOUNT_DIR)
				}

				console.log('Mounting')

				exec("mount --uuid " + uuid_from_line(line) + " "+ MOUNT_DIR, function (err, stdout, stderr) {
					console.log(err)
					// body...
					if(err || stderr){
						console.log(err, stderr)
					}else{
						if(fs.existsSync('/tmp/host.txt')){
						fs.readFile('/tmp/host.txt', function(err, data){
							console.log("ip", data.toString())
							var server_ip = data.toString().trim();
							
							var buf = Buffer.alloc(1,'1');
//							buf.writeUInt8(1)
							
							var client = dgram.createSocket('udp4')

							client.send(buf,16448, server_ip, (err) =>{
								console.log('error',err)
							})

						})
					}
					}
					
				})
			}
		}, function(e,f){
			console.log(e,f)
		})
	},2000)

})

usb.on('detach',function(dev){
	console.log('detach',dev)
	if(fs.existsSync('/tmp/host.txt')){
						fs.readFile('/tmp/host.txt', function(err, data){
							console.log("ip", data.toString())
							var server_ip = data.toString().trim();
							
							var buf = Buffer.alloc(1,'0');
//							buf.writeUInt8(1)
							
							var client = dgram.createSocket('udp4')

							client.send(buf,16448, server_ip, (err) =>{
								console.log('error',err)
							})

						})
					}
	exec('umount /media/usb_stick',function (argument) {
		// body...
	})

})
