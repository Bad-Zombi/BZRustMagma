// Zero Core : Required for all BadZombi Magma plugins.

var plugin = {};
	plugin.name = "BadZombi Zero Core";
	plugin.author = "BadZombi";
	plugin.version = "0.1";

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

function confSetting(name) {
	var conf = loadConfig();
	return conf.GetSetting("Config", name);
}

function bzCoreCheck(){
	return 'loaded';
}

function On_PluginInit() { 
    Util.ConsoleLog(plugin.name + " loaded.", true);
}



// Some things I have yet to rewrite for this:
/*
	// Use this for logging stuff -- demove after dev stage 
	// Ideally have one function which data is sent to that lets you choose chat, broadcast, console or file log?


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