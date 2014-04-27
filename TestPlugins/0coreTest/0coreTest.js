// Zero Core Test
// This is just a proof of concept core test. do not use this for anything other than testing!

var plugin = {};
	plugin.name = "BadZombi Zero Core Test";
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

function bzTestCoreCheck(){
	return 'loaded';
}

function On_PluginInit() { 
    Util.ConsoleLog(plugin.name + " loaded.", true);
    Util.ConsoleLog("------------------------------------------------------------------------", true);
    Util.ConsoleLog("You are running the test core! This wont play nice with other BZplugins!", true);
    Util.ConsoleLog("Remove it if youre not just testing!", true);
    Util.ConsoleLog("------------------------------------", true);
}

