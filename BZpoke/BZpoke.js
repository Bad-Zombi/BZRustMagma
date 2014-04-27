// User tools for remote and offline data

var plugin = {};
	plugin.name = "BZpoke";
	plugin.author = "BadZombi";
	plugin.version = "0.7";


// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	}

	function On_PlayerConnected(Player){
			
			DataStore.Add(Player.SteamID, "BZpoke", "off");
			
	}

	function On_EntityHurt(he) {

		// TODO... use some sort of table to give actual object names.

		var OwnerSteamID = he.Entity.OwnerID.ToString();
		var OwnerName = DataStore.Get(OwnerSteamID, "BZName");

		try{

			var ProbeStatus = DataStore.Get(he.Attacker.SteamID, "BZProbe");
			
			if(OwnerSteamID != he.Attacker.SteamID && ProbeStatus == "on"){
				//he.Attacker.Notice("You hit " + OwnerName + "'s object!");
				if (OwnerName == undefined || OwnerName == null){
					he.Attacker.Notice("You have no idea who owns this object!");
				} else {
					he.Attacker.Notice(OwnerName + " owns this object.");
				}	
			} else if(OwnerSteamID == he.Attacker.SteamID && ProbeStatus == "on") {
				he.Attacker.Notice("You own this object.");
			}

		} catch(err) {

			handleError("On_EntityHurt", err);
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
						Player.Message("Poker is active. Hit an object to find out the owner name.");
					}
				} catch(err) {
					handleError("On_Command", err);
				}
			break;

	    }
	}