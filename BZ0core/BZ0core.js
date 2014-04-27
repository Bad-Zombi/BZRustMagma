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
		Util.ConsoleLog("Error logged in " + plugin.name + ".", true);
		Plugin.Log("Error_log", "in " + funcName + " -- Error Message: " + err.message + " (" + plugin.name + ")");
	    if(err.description != undefined){
	        Plugin.Log("Error_log", "in " + funcName + " -- Error Description: " + err.description + " (" + plugin.name + ")")
	    }
	    Plugin.Log("Error_log", "-------------------------------------------------------------------------");
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
			 	Util.ConsoleLog(key + ": " + value, true);
			 }
		}

		if(admin_console_debug == 1){
		 	Util.ConsoleLog("chunk: " + chunk, true);
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
				//Util.ConsoleLog("sendData: " + debug, true);
			}
		}

		if(confSetting("admin_console_debug") == 1){
			Util.ConsoleLog("sendData response: " + request.ToString(), true);
		}
		return eval("(function(){return " + request + ";})()");
	}

	function bzCoreCheck(){

		return 'loaded';
	}

// Plugin stuff:

	function On_PluginInit() { 

		if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
		        Config['global_chat_name'] = "Rustard";
		        Config['admin_console_debug'] = 0;

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