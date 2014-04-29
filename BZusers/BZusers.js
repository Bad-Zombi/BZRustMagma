// User tools for remote and offline data

var plugin = {};
	plugin.name = "BZusers";
	plugin.author = "BadZombi";
	plugin.version = "0.4";


// support functions:

	function playersonlineCallback () {
		try{
			var players = Server.Players;
			var online = players.Count;
					
			
			var data = {};
			data['action'] = "update_online";


			if(online >= 1){
				var count = 1;
				var playerData = "{";
				for (var x in players){
					
					playerData += '"' + count + '":"' + x.SteamID+ '"';
					if(count != online){
						playerData += ',';
					}	
					count++;
				}
				playerData += "}";

				data['players'] = playerData;
			} else {
				data['players'] = 'nope';
			}
				
			var response = {};
			response = sendData(data);

			var admin_console_debug = DataStore.Get("BZ0core", "admin_console_debug");

			if(admin_console_debug == 1){

				if(response.status == "error"){
					Util.ConsoleLog("message: " + response.reason, true);
				} else {
					Util.ConsoleLog("message: " + response.message, true);
				}

			}
				
		} catch (err) {
			handleError("playersonlineCallback", err);
	    }
	}

// Name filter thanks to Shawn Mueller (Fe2O3NameFilter)

	function ContainsOnlyUSKeyboardChars(str){
		return str.match(/^[a-zA-Z0-9 '\`\?\~<>{}|:;,\/!@#\$%\^\&*\[\]\)\(+=._-]+$/g);
	}

	function FilterNonUSKeyboardChars(str){
		var new_str = "";
		for(var i = 0; i < Data.StrLen(str);i++){
			var chr = Data.Substring(str, i, 1);
			if(ContainsOnlyUSKeyboardChars(chr)){
				new_str = new_str + chr;
			}
		}
		return new_str;
	}

	function FilterLeadingWhitespace(str){
		var new_str = "";
		var first_non_ws_found = false;
		for(var i = 0; i < Data.StrLen(str);i++){
			var chr = Data.Substring(str, i, 1);
			if(chr != " "){
				first_non_ws_found = true;
			}
			if(first_non_ws_found){
				new_str = new_str + chr;
			}
		}
		
		return new_str;
	}

	function FilterTrailingWhitespace(str){
		var new_str = "";
		var first_non_ws_found = false;
		for(var i = 0; i < Data.StrLen(str);i++){
			var chr = Data.Substring(str, Data.StrLen(str)-i-1, 1);
			if(chr != " "){
				first_non_ws_found = true;
			}
			if(first_non_ws_found){
				new_str = chr + new_str;
			}
		}

		return new_str;
	}

	function FixName(str){
		var new_str = FilterNonUSKeyboardChars(str);
		new_str = FilterLeadingWhitespace(new_str);
		new_str = FilterTrailingWhitespace(new_str);
		if(Data.StrLen(new_str) == 0){
			new_str = "InvalidName"+Math.floor(Math.random()*10000);
			Player.Message("Your name is invalid.");
			Player.Message("You wont be allowed to connect until you change it.");
			Player.Disconnect();	
		}
		return new_str;
	}

// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
	        	Config['send_online_to_web'] = 0;
		        Config['poll_time_in_seconds'] = 600;
		        Config['filter_usernames'] = 1;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	    if(confSetting("send_online_to_web") == 1){
	    	Plugin.CreateTimer("playersonline", confSetting("poll_time_in_seconds") * 1000).Start();
	    	Util.ConsoleLog(" -- Users online being sent to web every " + confSetting("poll_time_in_seconds") + " seconds.", true);
	    }
	}

	function On_PlayerConnected(Player){
		
		if(confSetting("filter_usernames") == 1){

			// Fix user names thanks to Shawn Mueller (Fe2O3NameFilter)
			if (!ContainsOnlyUSKeyboardChars(Player.Name)){
				var fixed_name = FixName(Player.Name);
				Player.Name = fixed_name;
			}
		}

		// save steamID -> name in datastore for offline usage
		try{
			DataStore.Add(Player.SteamID, "BZName", Player.Name);
			DataStore.Save();
		} catch(err) {
			handleError("On_PlayerConnected users save name to datastore", err);
		}

		// log connection status to website:
		if(confSetting("send_online_to_web") == 1){
			var data = {};
			data['action'] = "connect";
			data['name'] = Player.Name;
			data['sid'] = Player.SteamID;
			data['ip'] = Player.IP;

			var response = {};
			response = sendData(data);
		}

	}

	function On_PlayerDisconnected(Player){	
		// log Disconnect to website
		if(confSetting("send_online_to_web") == 1){

			var data = {};
			data['action'] = "disconnect";
			data['sid'] = Player.SteamID;
			sendData(data);
		}
	}

