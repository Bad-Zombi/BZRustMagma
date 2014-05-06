// User tools for remote and offline data

	var BZU = {
		name: 		'BZusers',
		author: 	'BadZombi',
		version: 	'0.4.5',
		core: 		BZCore,
		ContainsOnlyUSKeyboardChars: function(str){
			// Thanks to Shawn Mueller (Fe2O3NameFilter)
			return str.match(/^[a-zA-Z0-9 '\`\?\~<>{}|:;,\/!@#\$%\^\&*\[\]\)\(+=._-]+$/g);
		},
		FilterNonUSKeyboardChars: function(str){
			// Thanks to Shawn Mueller (Fe2O3NameFilter)
			var new_str = "";
			for(var i = 0; i < Data.StrLen(str);i++){
				var chr = Data.Substring(str, i, 1);
				if(this.ContainsOnlyUSKeyboardChars(chr)){
					new_str = new_str + chr;
				}
			}
			return new_str;
		},
		FilterLeadingWhitespace: function(str){
			// Thanks to Shawn Mueller (Fe2O3NameFilter)
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
		},
		FilterTrailingWhitespace: function(str){
			// Thanks to Shawn Mueller (Fe2O3NameFilter)
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
		},
		FixName: function(P){
			// Thanks to Shawn Mueller (Fe2O3NameFilter)
			var new_str = this.FilterNonUSKeyboardChars(P.Name);
			new_str = this.FilterLeadingWhitespace(new_str);
			new_str = this.FilterTrailingWhitespace(new_str);
			if(Data.StrLen(new_str) == 0){
				new_str = "InvalidName"+Math.floor(Math.random()*10000);
				P.Message("Your name is invalid.");
				P.Message("You won't be allowed to connect until you change it.");
				P.Disconnect();	
			}
			return new_str;
		}
	}



// Hooks:

	function On_PluginInit() { 

		if(BZU.core.loaded == undefined){
	        Util.ConsoleLog("Could not load " + BZU.name+ "! (Core not loaded)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( 'Config' ) ) {

	        var Config = {};
	        	Config['send_online_to_web'] = 0;
		        Config['poll_time_in_seconds'] = 600;
		        Config['filter_usernames'] = 1;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = BZL.core.createConfig(iniData, BZU.name);

	    } 

	    Util.ConsoleLog(BZU.name + " v" + BZU.version + " loaded.", true);

	    if(BZU.core.confSetting("send_online_to_web") == 1){
	    	Plugin.CreateTimer("playersonline", BZU.core.confSetting("poll_time_in_seconds") * 1000).Start();
	    	Util.ConsoleLog(" -- Users online being sent to web every " + BZU.core.confSetting("poll_time_in_seconds") + " seconds.", true);
	    }
	}

	function On_PlayerConnected(P){
		
		if(BZU.core.confSetting("filter_usernames") == 1){

			// Fix user names thanks to Shawn Mueller (Fe2O3NameFilter)
			if (!BZU.ContainsOnlyUSKeyboardChars(P.Name)){
				var fixed_name = BZU.FixName(P.Name);
				P.Name = fixed_name;
			}
		}

		// save steamID -> name in datastore for offline usage
		try{
			DataStore.Add(P.SteamID, "BZName", P.Name);
			DataStore.Save();
		} catch(err) {
			BZU.core.handleError("On_PlayerConnected users save name to datastore", err);
		}

		// log connection status to website:
		if(BZU.core.confSetting("send_online_to_web") == 1){
			var data = {};
			data['action'] = "connect";
			data['name'] = P.Name;
			data['sid'] = P.SteamID;
			data['ip'] = P.IP;

			var response = {};
			response = BZU.core.sendData(data, BZU.name);

			var admin_console_debug = DataStore.Get("BZ0core", "admin_console_debug");

			if(admin_console_debug == 1){

				if(response.status == "error"){
					Util.ConsoleLog("message: " + response.reason, true);
				} else if(response.status == "success"){
					Util.ConsoleLog("message: " + response.message, true);
				} else {
					Util.ConsoleLog("error: strange things happened in On_PlayerConnected", true);
				}

			}
		}

	}

	function On_PlayerDisconnected(P){	
		// log Disconnect to website
		if(BZU.core.confSetting("send_online_to_web") == 1){

			var data = {};
			data['action'] = "disconnect";
			data['sid'] = P.SteamID;
			BZU.core.sendData(data, BZU.name);
		}
	}

// Callbacks:

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
			response = BZU.core.sendData(data);

			var admin_console_debug = DataStore.Get(BZU.core.DStable, "admin_console_debug");

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