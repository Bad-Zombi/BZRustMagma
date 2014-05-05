// Recover arrows from animals and players in a non magical way 
// You have to retrieve them from the corpse rather then having them just return to you
// Parts of this are based on ArrowRecovery (Fraccas)

	var BZA = {
		name: 		'BZarrows',
		author: 	'BadZombi',
		version: 	'0.5.6',
		DStable: 	'BZArrows',
		core: 		BZCore,
		get: function(SteamID, type){

			if(type == "animal"){
				var arrows = DataStore.Get(this.DStable, SteamID+"_animal");
			} else {
				var arrows = DataStore.Get(this.DStable, SteamID);
			}

			if (arrows == undefined || arrows == null)
				arrows = 0;

			return parseInt(arrows);
		},
		hitPlayer: function(ev) {
			// gonna have to change the way damage is checked here to determin if its an arrow. its not a constant on player hits. 
			if (ev.WeaponName == undefined && ev.DamageAmount == 75){
				var d = Math.random() * 100;
				var BreakChance = this.core.confSetting("break_percentage");
				if (d < BreakChance){
					if(this.core.confSetting("notify_on_break") == true){
						ev.Attacker.InventoryNotice("Snap!");
					}
				} else {
					var arrows = this.get(ev.Victim.SteamID, 'player') + 1;
					if(this.core.confSetting("notify_on_stick") == 1){
						ev.Attacker.InventoryNotice(arrows + " arrows are stuck in " + ev.Victim.Name + ".");
					}
					DataStore.Add("BZArrows", ev.Victim.SteamID, arrows);
				}
					
			}
		},
		hitAnimal: function(ev){
			// would be nice to have a way to maintain different instances of animals. maybe check for corpse type on gather if its in the render info or something and then pull arrow count from the ds for that animal type?
			if (ev.WeaponName == undefined && ev.DamageAmount == 75){
				var d = Math.random() * 100;
				var BreakChance = this.core.confSetting("break_percentage");
				if (d < BreakChance){
					if(this.core.confSetting("notify_on_break") == true){
						ev.Attacker.InventoryNotice("Snap!");
					}
				} else {
					var arrows = this.get(ev.Attacker.SteamID, 'animal') + 1;
					
					if(this.core.confSetting("notify_on_stick") == 1){
						ev.Attacker.InventoryNotice(arrows + " arrows are stuck in body.");
					}

					DataStore.Add("BZArrows", ev.Attacker.SteamID+"_animal", arrows);
				}
					
			}
		},
		clear: function(P){

			Datastore.Remove(this.DStable, P.SteamID);	
		}
	};

// Hooks:

	function On_PluginInit() { 

		if(BZA.core.loaded == undefined){
	        Util.ConsoleLog("Could not load " + BZA.name+ "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( 'Config' ) ) {

	        var Config = {};
	        	Config['chatName'] = 'Arrows';
		        Config['break_percentage'] = 60;
		        Config['notify_on_break'] = 0;
		        Config['notify_on_stick'] = 0;
		        Config['use_colors'] = 1;
		        Config['gather_color'] = "008000";

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = BZA.core.createConfig(iniData);

	    } 

	    Util.ConsoleLog(BZA.name + " v" + BZA.version + " loaded.", true);
	}

	function On_PlayerSpawned(Player, spawnEvent) {

		BZA.clear(Player);	
	}

	function On_PlayerHurt(he) {

	    if(he.Attacker.SteamID != he.Victim.SteamID && he.Victim.SteamID != undefined){
	    	BZA.hitPlayer(he);
	    }   
	}

	function On_PlayerKilled(de) {

		if(de.Attacker.SteamID != de.Victim.SteamID && de.Victim.SteamID != undefined){
	    	
	    	BZA.hitPlayer(de);
	    	
	    }   
		// TODO: check for arrows stuck in body and add them to drop loot	
	}

	function On_NPCHurt(he) {

		BZA.hitAnimal(he);
	}

	function On_NPCKilled(de) {

		BZA.hitAnimal(de);
	}

	function On_PlayerGathering(P, ge) {
		
		
		switch(ge.Type){

			case "Animal":

				if(ge.PercentFull == 1){
					// maybe use this to force the first gather to be arrows and leave the other stuff for later?
				}

				var arrows = BZA.get(P.SteamID, 'animal');

				if(BZA.core.confSetting("use_colors") == 1){
					var color = "[color#"+BZA.core.confSetting("gather_color")+"]";
				} else {
					var color = '';
				}

				if(arrows == 1){
					P.MessageFrom(BZA.core.confSetting("chatName"), color+"You recovered an arrow from the corpse.");
					P.Inventory.AddItem("Arrow", arrows);
					DataStore.Remove(BZA.DStable, P.SteamID+'_animal');
				} else if(arrows >= 2){
					if(arrows > 4){
						arrows = 4;
					}
					P.MessageFrom(BZA.core.confSetting("chatName"), color+"You recovered " + arrows + " arrows from the corpse.");
					P.Inventory.AddItem("Arrow", arrows);
					DataStore.Remove(BZA.DStable, P.SteamID+"_animal");
				}
				
			break;

			
		}
	}