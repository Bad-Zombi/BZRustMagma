// Track player locations on website...

var plugin = {};
	plugin.name = "BZlocation";
	plugin.author = "BadZombi";
	plugin.version = "0.3";


// support functions:

	function playerLocationsCallback () {
		try{

			//Util.ConsoleLog("Starting player locations poll: -------------------------------------------------- ", true);

			var online = Server.Players.Count;
			//Util.ConsoleLog("online count: " + online, true);
			if(online >= 1){

				var plist = {};
				var send = false;

				for (var p in Server.Players) {
					var location = loc2web(p);
					var lastLoc = DataStore.Get(p.SteamID, "BZloc");

					if(location != lastLoc){
						plist[p.SteamID] = location;
						DataStore.Add(p.SteamID, "BZloc", location);
						send = true;
					} 
										
				}

				

				if(send == true){
					var data = {};
					data['action'] = "updatePlayerPositions";
					data['playerData'] = iJSON.stringify(plist);

					var response = {};
					response = sendData(data);

					var admin_console_debug = DataStore.Get("BZ0core", "admin_console_debug");

					if(admin_console_debug == 1){

						if(response.status == "error"){
							Util.ConsoleLog("message: " + response.reason, true);
						} else if(response.status == "success"){
							Util.ConsoleLog("message: " + response.message, true);
						} else {
							Util.ConsoleLog("error: strange things happened in playerLocationsCallback", true);
						}

					}

				} 

			}  else {
				//Util.ConsoleLog("No players online... doing nothing... -------------------------------------------------- ", true);
			}

		} catch (err) {
			handleError("playerLocationsCallback", err);
	    }
	}

	function locator(Player) {
		try{

			var location = loc2web(Player);

			var data = {};
			data['action'] = "loc";
			data['sid'] = Player.SteamID;
			data['position'] = location;

			var response = {};
			response = sendData(data);
			
			var yaw = getDirection(getAngle(Player.PlayerClient.controllable.idMain.eyesYaw));
			return "You are facing " + yaw;
			
		} catch(err){
			Server.Broadcast("Error Message: " + err.message);
			Server.Broadcast("Error Description: " + err.description);
		}
	}

// Thanks to Razztak (N4 Essentials) for these functions
	function getDirection(dir) {
	    if ((dir > 337.5) || (dir < 22.5)) {
	        return "North";
	    } else if ((dir >= 22.5) && (dir <= 67.5)) {
	        return "Northeast";
	    } else if ((dir > 67.5) && (dir < 112.5)) {
	        return "East";
	    } else if ((dir >= 112.5) && (dir <= 157.5)) {
	        return "Southeast";
	    } else if ((dir > 157.5) && (dir < 202.5)) {
	        return "South";
	    } else if ((dir >= 202.5) && (dir <= 247.5)) {
	        return "Southwest";
	    } else if ((dir >247.5) && (dir < 292.5)) {
	        return "West";
	    } else if ((dir >= 292.5) && (dir <= 337.5)) {
	        return "Northwest";
	    }
	}

	function getAngle(angle) {
	    if (angle < 0 ) {
	        angle += 360;
	    }
	    return angle;
	}

// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
	        	Config['send_locations_to_web'] = 0;
		        Config['poll_time_in_seconds'] = 10;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	    if(confSetting("send_locations_to_web") == 1){
	    	Plugin.CreateTimer("playerLocations", confSetting("poll_time_in_seconds") * 1000).Start();
	    	Util.ConsoleLog(" -- User locations being sent to web every " + confSetting("poll_time_in_seconds") + " seconds.", true);
	    }

	}

	function On_PlayerDisconnected(Player){

			locator(Player);
	}

	function On_PlayerSpawned(Player, se) {

			response = locator(Player);
	}

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "location":
				Player.Message(locator(Player));
			break;

			
			
	    }
	}

