// Recover arrows from animals and players in a non magical way 
// You have to retrieve them from the corpse rather then having them just return to you

var plugin = {};
    plugin.name = "BZarrows";
    plugin.author = "BadZombi";
    plugin.version = "0.5";

// This section is based in part off of ArrowRecovery (Fraccas)

	function getArrows(SteamID, type){

		if(type == "animal"){
			var arrows = DataStore.Get("BZArrows", SteamID+"_animal");
		} else {
			var arrows = DataStore.Get("BZArrows", SteamID);
		}
		

		if (arrows == undefined || arrows == null)
			arrows = 0;

		return parseInt(arrows);
	}

	function arrowHit(type, event) {
		if (event.WeaponName == undefined && event.DamageAmount == 75){
			var d = Math.random() * 100;
			var BreakChance = confSetting("break_percentage");
			if (d < BreakChance){
				if(confSetting("notify_on_break") == true){
					event.Attacker.InventoryNotice("Snap!");
				}
			} else {
				if(type == 'animal'){
					var arrows = getArrows(event.Attacker.SteamID, 'animal') + 1;
					
					if(confSetting("notify_on_stick") == 1){
						event.Attacker.InventoryNotice(arrows + " arrows are stuck in body.");
					}

					DataStore.Add("BZArrows", event.Attacker.SteamID+"_animal", arrows);
				} else {
					var arrows = getArrows(event.Victim.SteamID, 'player') + 1;
					if(confSetting("notify_on_stick") == 1){
						event.Attacker.InventoryNotice(arrows + " arrows are stuck in " + event.Victim.Name + ".");
					}
					DataStore.Add("BZArrows", event.Victim.SteamID, arrows);
				}
			}
				
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
		        Config['break_percentage'] = 60;
		        Config['notify_on_break'] = 0;
		        Config['notify_on_stick'] = 0;
		        Config['use_colors'] = 1;
		        Config['gather_color'] = "008000";

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	}

	function On_PlayerSpawned(Player, spawnEvent) {
		
		// Remove any arrows currently stuck in player.
		Datastore.Remove("BZArrows", Player.SteamID);	
	}

	function On_PlayerHurt(he) {

	    if(he.Attacker.SteamID != he.Victim.SteamID && he.Victim.SteamID != undefined){
	    	
	    	// add arrow to players datastore count
	    	arrowHit('player', he);
	    	
	    }   
	}

	function On_PlayerKilled(DeathEvent) {

		if(DeathEvent.Attacker.SteamID != DeathEvent.Victim.SteamID && DeathEvent.Victim.SteamID != undefined){
	    	
	    	// add arrow to players datastore count
	    	arrowHit('player', DeathEvent);
	    	
	    }   
		// TODO: check for arrows stuck in body and add them to drop loot	
	}

	function On_NPCHurt(he) {

		arrowHit('animal', he);
	}

	function On_NPCKilled(DeathEvent) {

		arrowHit('animal', DeathEvent);
	}

	function On_PlayerGathering(Player, ge) {
		
		
		switch(ge.Type){

			case "Animal":

				if(ge.PercentFull == 1){
					// maybe use this to force the first gather to be arrows and leave the other stuff for later?
				}

				var arrows = getArrows(Player.SteamID, 'animal');

				if(confSetting("use_colors") == 1){
					var color = "[color#"+confSetting("gather_color")+"]";
				} else {
					var color = '';
				}

				if(arrows == 1){
					//Player.InventoryNotice("+1 arrow");
					Player.Message(color+"You recovered an arrow from the corpse.");
					Player.Inventory.AddItem("Arrow", arrows);
					DataStore.Remove("BZArrows", Player.SteamID+'_animal');
				} else if(arrows >= 2){
					if(arrows > 4){
						arrows = 4;
					}
					//Player.InventoryNotice("+" + arrows + " arrows");
					Player.Message(color+"You recovered " + arrows + " arrows from the corpse.");
					Player.Inventory.AddItem("Arrow", arrows);
					DataStore.Remove("BZArrows", Player.SteamID+"_animal");
				}
				
			break;

			
		}
	}

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);

		switch(cmd){

			case "arrows":
				// just saving for possible use later...
			break;

		}
	}