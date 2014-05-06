// Zero Core : Required for all BadZombi Magma plugins.

var BZCore = {
	name: 		'Zero Core',
	author: 	'BadZombi',
	version: 	'0.2.0',
	DStable: 	'BZ0core',
	loaded: 	true,
	createConfig: function(data, name){
		
		try {

			Util.ConsoleLog("Config does not exist... creating Config.ini for " + name, true);

		    Plugin.CreateIni('Config');
		    var newConf = Plugin.GetIni('Config');

		    for (var x in data) {
		        var section_name = x;
		        var section_data = data[x];
		        
		        if(typeof(section_data) == "object"){
		            for (var d in section_data) {
		                var itemName = d;
		                var itemValue = section_data[d];
		                newConf.AddSetting(section_name, itemName, itemValue);
		                Util.ConsoleLog("  --  Adding \"" + itemName + "\" = \"" + itemValue + "\" to " + section_name + " section...", true);
		            }
		        } 
		    }

		    newConf.Save();

		    return newConf;

		} catch (err) {

	    	this.handleError("createConfig", err);

	    }
	},
	loadConfig: function(){
	    try {
	    	var readConf = Plugin.GetIni('Config');
	    	return readConf;
	    } catch (err) {
	    	this.handleError("loadConfig", err);
	    }
	},
	handleError: function(funcName, err){
		var log_errors_to_file = DataStore.Get(this.DStable, "log_errors_to_file");
		if(log_errors_to_file == 1){
			Util.ConsoleLog("Error logged in " + funcName + ".", true);
			Plugin.Log("Error_log", "in " + funcName + " -- Error Message: " + err.message);
		    if(err.description != undefined){
		        Plugin.Log("Error_log", "in " + funcName + " -- Error Description: " + err.description)
		    }
		    Plugin.Log("Error_log", "-------------------------------------------------------------------------");
		} else {
			Util.ConsoleLog("Unlogged error...", true);
		}
	},
	confSetting: function(name, section) {
		if(section == undefined){
			section = "Config";
		}
		var conf = this.loadConfig();
		return conf.GetSetting(section, name);
	},
	loc2web: function(worldObj, delim) {
		// almost a duplicate function. remove after replacing all places its called in other plugins.
		if(delim == undefined){
			delim = "|";
		}
		var location = worldObj.Location.ToString();	
		location = location.replace("(", "");
		location = location.replace(")", "");
		location = location.replace(", ", delim);
		location = location.replace(", ", delim);
		return location;
	},
	v32str: function(vector, delim){
		if(delim == undefined){
			delim = "|";
		}
		var location = vector.ToString();	
		location = location.replace("(", "");
		location = location.replace(")", "");
		location = location.replace(", ", delim);
		location = location.replace(", ", delim);
		return location;
	},
	sendData: function (data, pluginName, method) {

		if(pluginName == undefined){
			pluginName = 'not specified';
		}
		
	    var server = DataStore.Get(this.DStable, "server"),
	    	serverID = DataStore.Get(this.DStable, "serverID"),
	    	serverPass = DataStore.Get(this.DStable, "serverPass"),
	    	serverScript = DataStore.Get(this.DStable, "serverScript"),
	    	admin_console_debug = DataStore.Get(this.DStable, "admin_console_debug");

	    if(serverID == 0){
	    	Util.ConsoleLog("RemoteHost config is still set to default. Not sending.", true);
	    	return false;
	    }

	    var chunk = "";

	    for (var x in data) {
			 var key = x;
			 var value = data[x];
			 chunk = chunk + "&" + key + "=" + value;
			 if(admin_console_debug == 1){
			 	//Util.ConsoleLog(key + ": " + value, true);
			 }
		}

		if(admin_console_debug == 1){
		 	//Util.ConsoleLog("chunk: " + chunk, true);
		 }

		if(method == true){
			var url= server + "/" + serverScript + "?serverID=" + serverID + "&pass=" + serverPass + chunk;
			var request = Web.GET(url);
			if(admin_console_debug == 1){
				//Util.ConsoleLog("sendData: " + debug, true);
			}
		} else {
			// default method it POST
			var url= server + "/" + serverScript;
			var chunk = "serverID=" + serverID + "&pass=" + serverPass + chunk;
			var request = Web.POST(url, chunk);
			if(admin_console_debug == 1){
				//Util.ConsoleLog("sendUrl: " + url, true);
				Util.ConsoleLog("sendData: " + chunk, true);
				Util.ConsoleLog("req: " + request, true);
			}
		}

		
		return eval("(function(){return " + request + ";})()");
	}
}

// In Rust We Trust JSON serializer adapted (by mikec) from json2.js 2014-02-04 Public Domain.
// Most recent version from https://github.com/douglascrockford/JSON-js/blob/master/json2.js
var iJSON = {};
(function () {
	'use strict';
	function f(n) {
		return n < 10 ? '0' + n : n;
	}
	var cx,	escapable, gap, indent,	meta, rep;
	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}
	function str(key, holder) {
		var i, k, v, length, mind = gap, partial, value = holder[key];
		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
		case 'object':
			if (!value) { return 'null'; }
			gap += indent;
			partial = [];
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}
				v = partial.length === 0 ? '[]' : gap ? '[ ' + gap + partial.join(', ' + gap) + ' ' + mind + ']' : '[' + partial.join(',') + ']';
				// v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}
			for (k in value) {
				if (Object.prototype.hasOwnProperty.call(value, k)) {
					v = str(k, value);
					if (v) { partial.push(quote(k) + (gap ? ': ' : ':') + v); }
				}
			}
			v = partial.length === 0 ? '{}' : gap ? '{ ' + gap + partial.join(', ' + gap) + ' ' + mind + '}' : '{' + partial.join(',') + '}';
			// v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}	
	if (typeof iJSON.stringify !== 'function') {
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		meta = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\' };
		iJSON.stringify = function (value) { gap = ''; indent = ''; return str('', {'': value}); };
	}
	if (typeof iJSON.parse !== 'function') {
		cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		iJSON.parse = function (text, reviver) {
			var j;
			function walk(holder, key) {
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
					return '\\u' +
						('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
						.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
						.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				j = eval('(' + text + ')');
				return typeof reviver === 'function'
					? walk({'': j}, '')
					: j;
			}
			throw new SyntaxError('JSON.parse');
		};
	}
}());	

var HASH = {
	RotateLeft: function(lValue, iShiftBits) {

		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	},
	AddUnsigned: function(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	},
 	F: function(x,y,z) { return (x & y) | ((~x) & z); },
 	G: function(x,y,z) { return (x & z) | (y & (~z)); },
 	H: function(x,y,z) { return (x ^ y ^ z); },
	I: function(x,y,z) { return (y ^ (x | (~z))); },
	FF: function(a,b,c,d,x,s,ac) {
		a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.F(b, c, d), x), ac));
		return this.AddUnsigned(this.RotateLeft(a, s), b);
	},
	GG: function(a,b,c,d,x,s,ac) {
		a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.G(b, c, d), x), ac));
		return this.AddUnsigned(this.RotateLeft(a, s), b);
	},
	HH: function(a,b,c,d,x,s,ac) {
		a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.H(b, c, d), x), ac));
		return this.AddUnsigned(this.RotateLeft(a, s), b);
	},
	II: function(a,b,c,d,x,s,ac) {
		a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.I(b, c, d), x), ac));
		return this.AddUnsigned(this.RotateLeft(a, s), b);
	},
	ConvertToWordArray: function(string) {
		try{
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		}catch(err){
			Util.ConsoleLog("Error: " + err.message + " in ConvertToWordArray", true);
			Util.ConsoleLog("Description: " + err.description, true);
		}
	},
	WordToHex: function(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	},
	Utf8Encode: function(string) {
		try{
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		}catch(err){
			Util.ConsoleLog("Error: " + err.message + " in Utf8Encode", true);
			Util.ConsoleLog("Description: " + err.description, true);
		}
	},
	get: function(string) {
		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;
	 
		string = this.Utf8Encode(string);
	 	
		x = this.ConvertToWordArray(string);
	 
		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
	 
		for (k=0;k<x.length;k+=16) {
			AA=a; BB=b; CC=c; DD=d;
			a=this.FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=this.FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=this.FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=this.FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=this.FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=this.FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=this.FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=this.FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=this.FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=this.FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=this.FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=this.FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=this.FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=this.FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=this.FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=this.FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=this.GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=this.GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=this.GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=this.GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=this.GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=this.GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=this.GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=this.GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=this.GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=this.GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=this.GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=this.GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=this.GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=this.GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=this.GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=this.GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=this.HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=this.HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=this.HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=this.HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=this.HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=this.HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=this.HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=this.HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=this.HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=this.HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=this.HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=this.HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=this.HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=this.HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=this.HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=this.HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=this.II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=this.II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=this.II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=this.II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=this.II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=this.II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=this.II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=this.II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=this.II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=this.II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=this.II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=this.II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=this.II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=this.II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=this.II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=this.II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=this.AddUnsigned(a,AA);
			b=this.AddUnsigned(b,BB);
			c=this.AddUnsigned(c,CC);
			d=this.AddUnsigned(d,DD);
		}
	 	
		var temp = this.WordToHex(a)+this.WordToHex(b)+this.WordToHex(c)+this.WordToHex(d);
	 
		return Data.ToLower(temp);
	}


};





// Hooks:

function On_PluginInit() { 

	if ( !Plugin.IniExists( 'Config' ) ) {

        var Config = {};
	        Config['global_chat_name'] = "Rustard";
	        Config['admin_console_debug'] = 0;
	        Config['log_errors_to_file'] = 1;
	        Config['send_init_to_web'] = 0;

        var RemoteHost = {};
	        RemoteHost['server'] = "notset";
			RemoteHost['serverID'] = 0;
			RemoteHost['serverPass'] = "notset";
			RemoteHost['serverScript'] = "notset";

        var iniData = {};
        	iniData["Config"] = Config;
        	iniData["RemoteHost"] = RemoteHost;


        var conf = BZCore.createConfig(iniData, BZCore.name);

    } 

    DataStore.Add("BZ0core", "server", BZCore.confSetting("server", "RemoteHost"));
    DataStore.Add("BZ0core", "serverID", BZCore.confSetting("serverID", "RemoteHost"));
    DataStore.Add("BZ0core", "serverPass", BZCore.confSetting("serverPass", "RemoteHost"));
    DataStore.Add("BZ0core", "serverScript", BZCore.confSetting("serverScript", "RemoteHost"));
    DataStore.Add("BZ0core", "admin_console_debug", BZCore.confSetting("admin_console_debug"));
    DataStore.Add("BZ0core", "log_errors_to_file", BZCore.confSetting("log_errors_to_file"));

    Server.server_message_name = BZCore.confSetting("global_chat_name");    

    Util.ConsoleLog(BZCore.name + " v" + BZCore.version + " loaded.", true);
}

function On_ServerInit() { 
	if(BZCore.confSetting("send_init_to_web") == 1){
		var data = {};
		data['action'] = "ServerInit";
		var response = {};
		response = BZCore.sendData(data);
	}
	
}



// Some things I have yet to rewrite for this:

function consoleDump(ev, indent, title, sub){

	if(sub != undefined){
		Util.ConsoleLog("--------------------- x -------------------", true);
		Plugin.Log("dump", "-- meh --");
		return;
	}

	if(title != undefined){
		Util.ConsoleLog(title + "----------------------------------------", true);
		Plugin.Log("dump", title + "----------------------------------------");
	} else {
		Util.ConsoleLog("----------------------------------------", true);
		Plugin.Log("dump", "-------------------------------------------------------------------------");
	}

	if(indent != undefined){
		var indent = ' -- ';
	}
	
	
	for (var x in ev) {
	     var output_name = x;
		 var output_value = ev[x];

		 if(typeof(output_value) == "object"){
		 	Util.ConsoleLog(indent + "(" + typeof(output_value) + ") " + output_name + " : " + output_value, true);
		 	Plugin.Log("dump", indent + "(" + typeof(output_value) + ") " + output_name + " : " + output_value);

		 	for (var y in output_value) {

		 		//consoleDump(y, indent+'--', output_name, 1);
			     var name2 = y;
				 var value2 = output_value[y];
				 if(typeof(value2) == "object"){
				 	Util.ConsoleLog(" o--- " + name2 + " : " + value2, true);
				 	Plugin.Log("dump", " o--- " + name2 + " : " + value2);
				 } else {
				 	if(typeof(value2) != "function"){
				 		Util.ConsoleLog(" s--- " + name2 + " : " + value2, true);
				 		Plugin.Log("dump", " s--- " + name2 + " : " + value2);
				 	}
				 	
				 }
			}

		 } else {
		 	if(typeof(output_value) != "function"){
		 		Util.ConsoleLog(indent + output_name + " : " + output_value, true);
		 		Plugin.Log("dump", indent + output_name + " : " + output_value);
		 	}
		 	
		 }
	}
	
	Util.ConsoleLog("----------------------------------------", true);
	Plugin.Log("dump", "------------------ end --------------------");
}

function fileDump(ev, title, ignore, indent, sub){

	if(sub != undefined){
		Plugin.Log("dump", "-- meh --");
		return;
	}

	if(ignore == undefined){
		ignore = "ignore";
	} 

	if(title != undefined){
		Plugin.Log("dump", title + "----------------------------------------");
	} else {
		Plugin.Log("dump", "-------------------------------------------------------------------------");
	}

	if(indent == undefined){
		var indent = ' -- ';
	}
	
	
	for (var x in ev) {
	     var output_name = x;
		 var output_value = ev[x];

		 if(typeof(output_value) == "object"){
		 	Plugin.Log("dump", indent + "(" + typeof(output_value) + ") " + output_name + " : " + output_value);

		 	for (var y in output_value) {

		 		//consoleDump(y, indent+'--', output_name, 1);
			     var name2 = y;
				 var value2 = output_value[y];
				 if(typeof(value2) == "object"){
				 	Plugin.Log("dump", " o--- " + name2 + " : " + value2);
				 } else {
				 	if(name2 != ignore && typeof(value2) != "functidon"){
				 		Plugin.Log("dump", " s--- " + name2 + " : " + value2);
				 	}
				 	
				 }
			}

		 } else {
		 	if(output_name != ignore && typeof(output_value) != "function"){
		 		Plugin.Log("dump", indent + output_name + " : " + output_value);
		 	}
		 	
		 }
	}
	
	Plugin.Log("dump", "------------------ end --------------------");
}

function dataWrite (Player, eventName, dataObj, indent) {
	if(indent == undefined){
		var indent = " - ";
	}
	Player.Message(eventName+": ");
	Player.Message("------");
	for (var x in dataObj) {
	     var output_name = x;
		 var output_value = dataObj[x];
		 if(typeof(output_value) != "function"){
		 	Player.Message(indent + output_name + " : " + output_value);
		 }
	}
	
	Player.Message("----------------------------------------");
}


/*
	// Use this for logging stuff -- demove after dev stage 
	// Ideally have one function which data is sent to that lets you choose chat, broadcast, console or file log?
	// also check debug setting? perhaps add debug level?


	function dataDump (fileName, eventName, dataObj, indent) {
		if(indent == undefined){
			var indent = " - ";
		}
		Plugin.Log(fileName, eventName+": ");
		Plugin.Log(fileName, "------");
		for (var x in dataObj) {
		     var output_name = x;
			 var output_value = dataObj[x];
			 if(typeof(output_value) != "function"){
			 	Plugin.Log(fileName, indent + output_name + " : " + output_value);
			 }
		}
		
		Plugin.Log(fileName, "---------------------------------------------------------------------------------------------- ");
	}

	function dataWrite (Player, eventName, dataObj, indent) {
		if(indent == undefined){
			var indent = " - ";
		}
		Player.Message(eventName+": ");
		Player.Message("------");
		for (var x in dataObj) {
		     var output_name = x;
			 var output_value = dataObj[x];
			 if(typeof(output_value) != "function"){
			 	Player.Message(indent + output_name + " : " + output_value);
			 }
		}
		
		Player.Message("----------------------------------------");
	}


try {
		    var check = checkCore();

		    if(check != undefined){
		    	Util.ConsoleLog("Core check from force passed: " + check, true);
		    } else {
		    	Util.ConsoleLog("Core check from force failed.", true);
		    }
		} catch (err) {

	        Util.ConsoleLog("Error_log", "On_PluginInit -- Error Message: " + err.message, true);
	        if(err.description != undefined){
	        	Util.ConsoleLog("Error_log", "On_PluginInit -- Error Description: " + err.description, true)
	        }
	        Util.ConsoleLog("Error_log", "-------------------------------------------------------------------------", true);
	        
	    }

*/