// Zero Core : Required for all BadZombi Magma plugins.
var plugin = {};
	plugin.name = "BadZombi Zero Core";
	plugin.author = "BadZombi";
	plugin.version = "0.1";



// Shared stuff:

	function getFilename(){
		var filename = plugin.name;
	    return filename.replace(" ", "_");
	}

	function createConfig(data){
		try {

			var filename = getFilename(plugin);

			Util.ConsoleLog("Config does not exist... creating " + filename + ".ini", true);

		    Plugin.CreateIni(filename);
		    var newConf = Plugin.GetIni(filename);

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

	    	handleError("createConfig", err, plugin);

	    }
	}

	function loadConfig(){

	    try {

	    	var readConf = Plugin.GetIni(getFilename(plugin));
	    	return readConf;
	        
	    } catch (err) {
	    	handleError("loadConfig", err, plugin);
	    }
	}

	function handleError(funcName, err){
		var log_errors_to_file = DataStore.Get("BZ0core", "log_errors_to_file");

		if(log_errors_to_file == 1){
			Util.ConsoleLog("Error logged in " + plugin.name + ".", true);
			Plugin.Log("Error_log", "in " + funcName + " -- Error Message: " + err.message + " (" + plugin.name + ")");
		    if(err.description != undefined){
		        Plugin.Log("Error_log", "in " + funcName + " -- Error Description: " + err.description + " (" + plugin.name + ")")
		    }
		    Plugin.Log("Error_log", "-------------------------------------------------------------------------");
		} else {
			Util.ConsoleLog("Unlogged error...", true);
		}
	}

	function confSetting(name, section) {
		if(section == undefined){
			section = "Config";
		}
		var conf = loadConfig();
		return conf.GetSetting(section, name);
	}

	function sendData (data, method) {
		
	    var server = DataStore.Get("BZ0core", "server");
	    var serverID = DataStore.Get("BZ0core", "serverID");
	    var serverPass = DataStore.Get("BZ0core", "serverPass");
	    var serverScript = DataStore.Get("BZ0core", "serverScript");
	    var admin_console_debug = DataStore.Get("BZ0core", "admin_console_debug");

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
			}
		}

		if(confSetting("admin_console_debug") == 1){
			Util.ConsoleLog("sendData response: " + request.ToString(), true);
		}
		return eval("(function(){return " + request + ";})()");
	}

	function loc2web (worldObj) {
		var location = worldObj.Location.ToString();	
		location = location.replace("(", "");
		location = location.replace(")", "");
		location = location.replace(", ", "|");
		location = location.replace(", ", "|");
		return location;
	}

	function v32str(vector, delim){
		if(delim == undefined){
			delim = "|";
		}
		var location = vector.ToString();	
		location = location.replace("(", "");
		location = location.replace(")", "");
		location = location.replace(", ", delim);
		location = location.replace(", ", delim);
		return location;
	}

	function bzCoreCheck(){

		return 'loaded';
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

	// MD5 tool for Rust Magma... implemented by BadZombi
	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
	function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
	function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
	function hex_hmac_md5(k, d)
	  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function b64_hmac_md5(k, d)
	  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function any_hmac_md5(k, d, e)
	  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of a raw string
	 */
	function rstr_md5(s)
	{
	  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data (raw strings)
	 */
	function rstr_hmac_md5(key, data)
	{
	  var bkey = rstr2binl(key);
	  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input)
	{
	  try { hexcase } catch(e) { hexcase=0; }
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var output = "";
	  var x;
	  for(var i = 0; i < input.length; i++)
	  {
	    x = input.charCodeAt(i);
	    output += hex_tab.charAt((x >>> 4) & 0x0F)
	           +  hex_tab.charAt( x        & 0x0F);
	  }
	  return output;
	}

	/*
	 * Convert a raw string to a base-64 string
	 */
	function rstr2b64(input)
	{
	  try { b64pad } catch(e) { b64pad=''; }
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var output = "";
	  var len = input.length;
	  for(var i = 0; i < len; i += 3)
	  {
	    var triplet = (input.charCodeAt(i) << 16)
	                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
	                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
	      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
	    }
	  }
	  return output;
	}

	/*
	 * Convert a raw string to an arbitrary string encoding
	 */
	function rstr2any(input, encoding)
	{
	  var divisor = encoding.length;
	  var i, j, q, x, quotient;

	  /* Convert to an array of 16-bit big-endian values, forming the dividend */
	  var dividend = Array(Math.ceil(input.length / 2));
	  for(i = 0; i < dividend.length; i++)
	  {
	    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
	  }

	  /*
	   * Repeatedly perform a long division. The binary array forms the dividend,
	   * the length of the encoding is the divisor. Once computed, the quotient
	   * forms the dividend for the next step. All remainders are stored for later
	   * use.
	   */
	  var full_length = Math.ceil(input.length * 8 /
	                                    (Math.log(encoding.length) / Math.log(2)));
	  var remainders = Array(full_length);
	  for(j = 0; j < full_length; j++)
	  {
	    quotient = Array();
	    x = 0;
	    for(i = 0; i < dividend.length; i++)
	    {
	      x = (x << 16) + dividend[i];
	      q = Math.floor(x / divisor);
	      x -= q * divisor;
	      if(quotient.length > 0 || q > 0)
	        quotient[quotient.length] = q;
	    }
	    remainders[j] = x;
	    dividend = quotient;
	  }

	  /* Convert the remainders to the output string */
	  var output = "";
	  for(i = remainders.length - 1; i >= 0; i--)
	    output += encoding.charAt(remainders[i]);

	  return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input)
	{
	  var output = "";
	  var i = -1;
	  var x, y;

	  while(++i < input.length)
	  {
	    /* Decode utf-16 surrogate pairs */
	    x = input.charCodeAt(i);
	    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
	    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
	    {
	      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
	      i++;
	    }

	    /* Encode output as utf-8 */
	    if(x <= 0x7F)
	      output += String.fromCharCode(x);
	    else if(x <= 0x7FF)
	      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0xFFFF)
	      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0x1FFFFF)
	      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
	                                    0x80 | ((x >>> 12) & 0x3F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	  }
	  return output;
	}

	/*
	 * Encode a string as utf-16
	 */
	function str2rstr_utf16le(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
	                                  (input.charCodeAt(i) >>> 8) & 0xFF);
	  return output;
	}

	function str2rstr_utf16be(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
	                                   input.charCodeAt(i)        & 0xFF);
	  return output;
	}

	/*
	 * Convert a raw string to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binl(input)
	{
	  var output = Array(input.length >> 2);
	  for(var i = 0; i < output.length; i++)
	    output[i] = 0;
	  for(var i = 0; i < input.length * 8; i += 8)
	    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
	  return output;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2rstr(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length * 32; i += 8)
	    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
	  return output;
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 */
	function binl_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);
	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

// Plugin stuff:

	function On_PluginInit() { 

		if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
		        Config['global_chat_name'] = "Rustard";
		        Config['admin_console_debug'] = 0;
		        Config['log_errors_to_file'] = 0;

	        var RemoteHost = {};
		        RemoteHost['server'] = "notset";
				RemoteHost['serverID'] = 0;
				RemoteHost['serverPass'] = "notset";
				RemoteHost['serverScript'] = "notset";

	        var iniData = {};
	        	iniData["Config"] = Config;
	        	iniData["RemoteHost"] = RemoteHost;


	        var conf = createConfig(iniData);

	    } 

	    DataStore.Add("BZ0core", "server", confSetting("server", "RemoteHost"));
	    DataStore.Add("BZ0core", "serverID", confSetting("serverID", "RemoteHost"));
	    DataStore.Add("BZ0core", "serverPass", confSetting("serverPass", "RemoteHost"));
	    DataStore.Add("BZ0core", "serverScript", confSetting("serverScript", "RemoteHost"));
	    DataStore.Add("BZ0core", "admin_console_debug", confSetting("admin_console_debug"));
	    DataStore.Add("BZ0core", "log_errors_to_file", confSetting("log_errors_to_file"));

	    Server.server_message_name = confSetting("global_chat_name");    

	    Util.ConsoleLog(plugin.name + " loaded.", true); 
	}

	function On_ServerInit() { 
		var data = {};
		data['action'] = "ServerInit";
		var response = {};
		response = sendData(data);
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