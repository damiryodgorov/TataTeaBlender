'use strict'

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
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
	static rec_date(val){
		//needs to be swapped..
		//0xac26 -> 0x26ac
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
		//console.log(wet);
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
		//console.log(tpm);
		if(tack!=0){

			return tpm;
		}
		var speed = (231.0/tpm) * 60;
		if(metric==0){
			return speed
		}else{
			return speed
		}
		//do we want to handle this on the front end or here?
		//might be better to do it here
		//okay.
	}
	static password8(words){
			var arr = words.match(/../g).map(function(c){
				return parseInt((("00" + c.charCodeAt(0).toString(16)).substr(-2)
				 +("00" + c.charCodeAt(1).toString(16)).substr(-2)),16);
			});
		//console.log(arr);

		var res = arr.map(function(w){
			return ((w & 0xffff).toString(16)) //hex format string
		}).join(',')
	//	console.log(res);
		return(res)

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
	static prod_name(val){
		return val;
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
		//console.log(patt)
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

	static	swap16(val){
    	return ((val & 0xFF) << 8) | ((val >> 8) & 0xFF);
	}

	static 	convert_word_array_BE(byteArr){
		var b = new Buffer(byteArr)
		var length = byteArr.length/2;
		var wArray = []
		//console.log(length)
		for(var i = 0; i<length; i++){
			wArray.push(b.readUInt16BE(i*2));
		}
		//console.log(wArray)
		return wArray;

	}

	static convert_word_array_LE(byteArr){
		var b = new Buffer(byteArr)
		var length = byteArr.length/2;
		var wArray = []
		//console.log(length)
		for(var i = 0; i<length; i++){
			wArray.push(b.readUInt16LE(i*2));
		}
		//console.log(wArray)
		return wArray;

	}
	static ipv4_address(ip){
		//todo
		return ip
	}
}

module.exports = {}
module.exports.Params = Params
