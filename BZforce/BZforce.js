// Force some settings on users when they connect

var plugin = {};
    plugin.name = "BZforce";
    plugin.author = "BadZombi";
    plugin.version = "1.0";

// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
		        Config['nudity_on'] = true;
		        Config['no_grass'] = true;
		        Config['hide_branding'] = true;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);
	    
	}

	function On_PlayerConnected(Player){
		
		if(confSetting("nudity_on") == true){
			Player.SendCommand("censor.nudity False");
		}

		if(confSetting("no_grass") == true){
			Player.SendCommand("grass.on False");
		}

		if(confSetting("hide_branding") == true){
			Player.SendCommand("gui.hide_branding False");
		}

	}


	// check for users trying to change setting and stop them.