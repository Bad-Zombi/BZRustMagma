// User tools for remote and offline data

var plugin = {};
	plugin.name = "BZpoke";
	plugin.author = "BadZombi";
	plugin.version = "0.8";



function poke_player(he){
	he.DamageAmount = 0;
			
	if(!he.Victim.SteamID && he.DamageEvent.victim.idMain == "MaleSleeper(Clone) (SleepingAvatar)"){
		var creator = he.DamageEvent.sender.idMain.creatorID;
		var cSid = he.DamageEvent.sender.idMain.creatorID.ToString();
		he.Attacker.Notice("You Poked " + DataStore.Get(cSid, "BZName"));
	} else {
		he.Attacker.Notice("You Poked " + he.Victim.Name);
		he.Victim.Message(he.Attacker.Name + " just poked you. (No Damage)");
	}
}


// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
	        	Config['poke_only_for_admins'] = 0;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	}

	function On_PlayerConnected(Player){
			
			DataStore.Add(Player.SteamID, "BZpoke", "off");
			
	}


	

	function On_PlayerHurt(he) {

		if(confSetting("poke_only_for_admins") == 1){
			if(!he.Attacker.Admin){
				return;
			}
		}

		if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
			poke_player(he);
		}

	}

	function On_EntityHurt(he) {

		if(confSetting("poke_only_for_admins") == 1){
			if(!he.Attacker.Admin){
				return;
			}
		}
		
		var obj = he.Entity.Object;

		if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
			
			he.DamageAmount = 0;
			
			if(he.Entity.Owner != undefined){
				// owner is online.
				if(he.Entity.Owner.SteamID == he.Attacker.SteamID){
					he.Attacker.Notice("You're poking your own stuff.");
				} else {
					he.Attacker.Notice("That stuff is owned by " + he.Entity.Owner.Name);
				}
			} else {

				var OwnerSteamID = he.Entity.OwnerID.ToString();
				var OwnerName = DataStore.Get(OwnerSteamID, "BZName");

				if (OwnerName == undefined || OwnerName == null){
					he.Attacker.Notice("You have no idea who's stuff that is!");
				} else {
					he.Attacker.Notice("That stuff is owned by " + OwnerName);
				}	
			}

		} 
		
	}

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "poke":

				try{
					var ProbeStatus = DataStore.Get(Player.SteamID, "BZpoke");

					if(ProbeStatus == "on"){
						DataStore.Add(Player.SteamID, "BZpoke", "off");
						Player.Message("Poker deactivated.");
					} else {
						DataStore.Add(Player.SteamID, "BZpoke", "on");
						Player.Message("Poker is active. Hit an object to find out who owns them. (Will do zero damage)");
					}
				} catch(err) {
					handleError("On_Command", err);
				}
			break;

	    }
	}
