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
			iJSON.stringify = function (value) { gap = ''; indent = ' '; return str('', {'': value}); };
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
					 	if(name2 != ignore && typeof(value2) != "function"){
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