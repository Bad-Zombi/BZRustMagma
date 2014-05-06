// Force some settings on users when they connect

var BZF = {
	name: 		'BZforce',
	author: 	'BadZombi',
	version: 	'1.1.0'
}

// Hooks:

function On_PluginInit() { 

	if(BZCore.loaded == undefined){
        Util.ConsoleLog("Could not load " + BZF.name+ "! (Core not loaded)", true);
        return false;
    }

    if ( !Plugin.IniExists( 'Config' ) ) {

        var Config = {};
	        Config['nudity_on'] = 1;
	        Config['no_grass'] = 1;
	        Config['hide_branding'] = 1;

        var iniData = {};
        	iniData["Config"] = Config;

        var conf = BZCore.createConfig(iniData, BZF.name);

    } 

    Util.ConsoleLog(BZF.name + " v" + BZF.version + " loaded.", true);
}

function On_PlayerConnected(Player){
	
	if(confSetting("nudity_on") == 1){
		Player.SendCommand("censor.nudity false");
	}

	if(confSetting("no_grass") == 1){
		Player.SendCommand("grass.on false");
	}

	if(confSetting("hide_branding") == 1){
		Player.SendCommand("gui.hide_branding false");
	}

}


// maybe TODO check for users trying to change setting and stop them.