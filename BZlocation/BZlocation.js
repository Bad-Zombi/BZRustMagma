// Track player locations on website...

	var BZL = {
		name: 		'BZlocation',
		author: 	'BadZombi',
		version: 	'0.3.5',
		core: 		BZCore,
		locator: function(P) {
			try{

				var location = this.core.loc2web(P);
				var yaw = P.PlayerClient.controllable.idMain.eyesYaw;
				var angle = this.getAngle(yaw);
				var direction = this.getDirection( angle );

				var data = {};
					data['action'] = "loc";
					data['sid'] = P.SteamID;
					data['position'] = location;
				
				var response = this.core.sendData(data, BZL.name);
				
				
				return "You are facing " + direction;
			} catch(err){
				this.core.handleError("locator", err);
			}
		},
		getDirection: function(dir) {
			// Thanks to Razztak (N4 Essentials)
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
		}, 
		getAngle: function(angle) {
			// Thanks to Razztak (N4 Essentials)
		    if (angle < 0 ) {
		        angle += 360;
		    }
		    return angle;
		}

	}

// Hooks:
	function On_PluginInit() { 

		if(BZL.core.loaded == undefined){
	        Util.ConsoleLog("Could not load " + BZL.name+ "! (Core not loaded)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( 'Config' ) ) {

	        var Config = {};
	        	Config['chatName'] = "Locator";
	        	Config['send_locations_to_web'] = 0;
		        Config['poll_time_in_seconds'] = 10;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = BZL.core.createConfig(iniData, BZL.name);

	    } 

	    Util.ConsoleLog(BZL.name + " v" + BZL.version + " loaded.", true);

	    if(BZL.core.confSetting("send_locations_to_web") == 1){
	    	Plugin.CreateTimer("playerLocations", BZL.core.confSetting("poll_time_in_seconds") * 1000).Start();
	    	Util.ConsoleLog(" -- User locations being sent to web every " + BZL.core.confSetting("poll_time_in_seconds") + " seconds.", true);
	    }
	}

	function On_PlayerDisconnected(P){

			BZL.locator(P);
	}

	function On_PlayerSpawned(P, se) {

			response = BZL.locator(P);
	}

	function On_Command(P, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "location":
				P.MessageFrom(BZL.core.confSetting("chatName"), BZL.locator(P));
			break;

	    }
	}

// Callbacks: 

	function playerLocationsCallback () {
		try{

			//Util.ConsoleLog("Starting player locations poll: -------------------------------------------------- ", true);

			var online = Server.Players.Count;
			//Util.ConsoleLog("online count: " + online, true);
			if(online >= 1){

				var plist = {};
				var send = false;

				for (var p in Server.Players) {
					var location = BZL.core.loc2web(p);
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
					response = BZL.core.sendData(data, BZL.name);

					var admin_console_debug = DataStore.Get(BZL.core.DStable, "admin_console_debug");

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
			BZL.core.handleError("playerLocationsCallback", err);
	    }
	}