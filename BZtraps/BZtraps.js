// Set traps in rust!

var BZT = {
	name: 		'BZtraps',
	author: 	'BadZombi',
	version: 	'0.6.2',
	DStable: 	'BZtraps',
	core: 		BZCore,
	cancel: function(P){
		DataStore.Remove(P.SteamID, "BZpending");
		DataStore.Remove(P.SteamID, "trapType");
		P.Message("Trap building canceled.");
		DataStore.Save();
	},
	trigger: function(Player, trapID) {

		var trapData = iJSON.parse(Datastore.Get(BZT.DStable, trapID));
		var trapowner = trapData.owner; 
		var traptype = trapData.type; 

		Player.Notice("Aaaah! Its a Trap!");
		Server.Broadcast(Player.Name + " triggered a trap set by " + trapowner);

		var p = Math.random() * 100;
		var injuryChance = this.core.confSetting("chance_of_injury");
		if (p < injuryChance){
			Player.IsInjured = true;
		}

		if(traptype == "floor"){
			var targetLoc = trapData.target;
			
			for(var e in World.Entities){
				if(e.X +"|"+ e.Y +"|"+ e.Z == targetLoc){
					var target = e;
					target.Destroy();
				} 
			}

		} else if(traptype == "spike"){
			var spikeLoc = {};
				spikeLoc.X = parseInt(Player.X);
				spikeLoc.Y = parseInt(Player.Y) - 2;
				spikeLoc.Z = parseInt(Player.Z);

			World.Spawn(";deploy_woodspikewall", spikeLoc.X, spikeLoc.Y, spikeLoc.Z);
			var epoch = Plugin.GetTimestamp();
			DataStore.Add("spikeTraps",  String(epoch.ToString()), iJSON.stringify(spikeLoc));

			if(!Plugin.GetTimer("removeSpikes")){
				Util.ConsoleLog("Starting spike removal timer", true);
				Plugin.CreateTimer("removeSpikes", this.core.confSetting("spike_timeout") * 1000).Start();
			} else {
				Util.ConsoleLog("Not starting spike removal timer", true);
			}

		}

		DataStore.Remove(BZT.DStable, trapID);
		DataStore.Save();
	}
}



// Hooks:

function On_PluginInit() { 

	if(BZT.core.loaded == undefined){
        Util.ConsoleLog("Could not load " + BZT.name+ "! (Core not loaded)", true);
        return false;
    }

    if ( !Plugin.IniExists( 'Config' ) ) {

        var Config = {};
	        	Config['trap_price_lqm'] = 15;
		        Config['require_resources'] = 1;
		        Config['return_on_remove'] = 1;
		        Config['return_percentage'] = 50;
		        Config['chance_of_injury'] = 60;
		        Config['spike_timeout'] = 10;
		        

        var iniData = {};
        	iniData["Config"] = Config;

        var conf = BZT.core.createConfig(iniData, BZT.name);

    } 

    Util.ConsoleLog(BZT.name + " v" + BZT.version + " loaded.", true);
}

function On_PlayerSpawned(Player, spawnEvent) {
	// make sure the trap flags arent gonna last after a new spawn event
	Datastore.Remove(he.Attacker.SteamID, "BZTpending");
	DataStore.Remove(he.Attacker.SteamID, "BZpending");
	DataStore.Remove(he.Attacker.SteamID, "trapType");
}

function On_EntityHurt(he) {	

    try{
	    if(he.Attacker == he.Entity.Owner){

		    if(he.Entity.Name == "WoodCeiling" || he.Entity.Name == "MetalCeiling"){

		    	var pendingtrap = DataStore.Get(he.Attacker.SteamID, "BZTpending");
		    	if(pendingtrap != undefined && pendingtrap != "none"){

		    		if(BZT.core.confSetting("require_resources") == 1){
		        		var Inv = he.Attacker.Inventory;

		        		if( !Inv.HasItem( "Low Quality Metal", BZT.core.confSetting("trap_price_lqm") ) ){
		        			
		        			he.Attacker.Message("You need " + BZT.core.confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
		        			BZT.cancel(he.Attacker);
		        			return;
		        		} else {
		        			Inv.RemoveItem( "Low Quality Metal", BZT.core.confSetting("trap_price_lqm") );
		        		}
		        	}

		        	he.DamageAmount = 0;

		    		var trapData = {};
		        		trapData['owner'] = String(he.Attacker.Name.ToString());
		        		trapData['target'] = he.Entity.X +"|"+ he.Entity.Y +"|"+ he.Entity.Z;
		        		trapData['type'] = "floor";

        			DataStore.Add(BZT.DStable, String(pendingtrap.ToString()), iJSON.stringify(trapData));

			    	
					Datastore.Remove(he.Attacker.SteamID, "BZTpending");
					DataStore.Remove(he.Attacker.SteamID, "BZpending");
					DataStore.Remove(he.Attacker.SteamID, "trapType");
					DataStore.Save();
			    	he.Attacker.Message("Trap set!");
				}
		    }
		}

	} catch(err){
		Server.Broadcast("Error Message: " + err.message);
		Server.Broadcast("Error Description: " + err.description);
	}    
}

function On_DoorUse(Player, de) {
    
    var doorID = HASH.get(de.Entity.X +"|"+ de.Entity.Y +"|"+ de.Entity.Z);
    
    if(Player == de.Entity.Owner) {
        
        var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");

        if(pendingtrap != undefined && pendingtrap == "setTrap"){

        	var existingcheck = DataStore.Get(BZT.DStable, doorID);

        	if(existingcheck != undefined){
        		de.Open = false;
    			Player.Message("There is already a trap set on this door.");
    			Player.Message("Use \"/trap remove\" to get rid of it first.");
    			BZT.cancel(Player);
    			return;
        	}


        	if(BZT.core.confSetting("require_resources") == 1){
        		var Inv = Player.Inventory;
        		if( !Inv.HasItem( "Low Quality Metal", BZT.core.confSetting("trap_price_lqm") ) ){

        			de.Open = false;
        			Player.Message("You need " + BZT.core.confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
        			BZT.cancel(Player);
        			return;
        		}
        	}

        	var pendingTrapType = DataStore.Get(Player.SteamID, "trapType");

        	switch(pendingTrapType){

        		case "floor":			        	
					DataStore.Add(Player.SteamID, "BZTpending", doorID);
					Player.Message("Door selected...");
					Player.Message("Now hit the ceiling object you would like the trap to destroy.");
					Player.Message("Usually the one right outside the door.");
					Player.Message("You must be the owner of this object.");
					de.Open = false;
					DataStore.Save();
					
        		break;

        		case "spike":

        			if(BZT.core.confSetting("require_resources") == 1){
		        		var Inv = Player.Inventory;

		        		if( !Inv.HasItem( "Low Quality Metal", BZT.core.confSetting("trap_price_lqm") ) ){
		        			
		        			Player.Message("You need " + BZT.core.confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
		        			BZT.cancel(Player);
		        			return;
		        		} else {
		        			Inv.RemoveItem( "Low Quality Metal", BZT.core.confSetting("trap_price_lqm") );
		        		}
		        	}
		        	var trapData = {};
		        		trapData['owner'] = String(Player.Name.ToString());
		        		trapData['type'] = "spike";

        			DataStore.Add(BZT.DStable, doorID, iJSON.stringify(trapData));

			    	DataStore.Remove(Player.SteamID, "BZpending");
					DataStore.Remove(Player.SteamID, "trapType");
					DataStore.Save();

					Player.Message("Trap set!");
					de.Open = false;
        		break;

        		default:
        			DataStore.Remove(Player.SteamID, "BZpending");
					DataStore.Remove(Player.SteamID, "trapType");
					Player.Message("There was a problem. Please start over.");
					DataStore.Save();
        			return;
        		break;
        	}

        	

		} else if(pendingtrap != undefined && pendingtrap == "removeTrap"){
			var trapped = DataStore.Get(BZT.DStable, doorID);
			if(trapped != undefined){
				if(BZT.core.confSetting("require_resources") == 1 && BZT.core.confSetting("return_on_remove") == 1){
					var pct = BZT.core.confSetting("return_percentage") * 0.01;
					var returnamount = Math.round(BZT.core.confSetting("trap_price_lqm") * pct);
					Player.Inventory.AddItem("Low Quality Metal", returnamount);
					Player.InventoryNotice("+"+returnamount + " LQM");
				}
				DataStore.Remove(Player.SteamID, "BZpending");
				DataStore.Remove(BZT.DStable, doorID);
				Player.Notice("Trap removed!");

			}
			
			

		} else {

			var trapped = DataStore.Get(BZT.DStable, doorID);
			if(trapped != undefined){
				Player.Notice("You have a trap set on this door.");
				//BZT.trigger(Player, doorID);
			}
		}

	} else {

    	var trapped = DataStore.Get(BZT.DStable, doorID);
		if(trapped != undefined){
			BZT.trigger(Player, doorID);
		}
		
    }
}

function On_Command(Player, cmd, args) { 

	cmd = Data.ToLower(cmd);
	switch(cmd) {

		case "trap":
			
			if(args.Length == 1){
				var type = Data.ToLower(args[0]);

				if(type == "list"){
					Player.MessageFrom("Traps", "Current trap types are \"[color#FFFF00]floor[/color]\" and \"[color#FFFF00]spike[/color]\"");
					Player.MessageFrom("Traps", "All traps cost 100 Paper to set. You must have 100 paper in your inventory.");
					Player.MessageFrom("Traps", "Floor traps will destroy a selected floor/ceiling so victim will fall through.");
					Player.MessageFrom("Traps", "Spike traps will drop a spike wall on the victim.");
					//Player.MessageFrom("Traps", "C4 traps will detonate the trapped object. Best used on empty (decoy) storage devices.");
					Player.MessageFrom("Traps", "---------------------------------------------");
					break;
				} else if(type == "floor" || type == "spike"){
					// add process to check for paper before continuing. paper will not be removed until the trap is completed.
					DataStore.Add(Player.SteamID, "BZpending", "setTrap");
					DataStore.Add(Player.SteamID, "trapType", type);
					Player.MessageFrom("Traps", "Select a door (open or close it) to set a trap on. You must own this item.");
					//DataStore.Save();
					Player.MessageFrom("Traps", "---------------------------------------------");
					break;
				} else if(type == "cancel"){
					var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");
					if(pendingtrap != undefined && pendingtrap == "setTrap"){
						cancel(Player);
					} else {
						Player.MessageFrom("Traps", "No traps are being set right now.");
					}
					break;
				} else if(type == "remove"){

					DataStore.Add(Player.SteamID, "BZpending", "removeTrap");
					Player.MessageFrom("Traps", "Select a door (open it) to remove the trap from. It must be your trap.");
					//DataStore.Save();
					Player.MessageFrom("Traps", "---------------------------------------------");

					break;
				}

				break;
				
			} else {
				Player.MessageFrom("Traps", "Use \"/trap list\" for a lits of available traps and their prices.");
				Player.MessageFrom("Traps", "\"/trap [color#FFFF00]type[/color]\" will start the process.");
				Player.MessageFrom("Traps", "\"/trap cancel\" will cancel any trap setting.");
				Player.MessageFrom("Traps", "---------------------------------------------");
				break;
			}

		break;

		
		
    }
}

// Callbacks:

function removeSpikesCallback(){
	var epoch = Plugin.GetTimestamp();
	var spikeLife = BZT.core.confSetting("spike_timeout");
	
	if(Datastore.Count("spikeTraps") >= 1){
		var spikes = Datastore.Keys("spikeTraps");
		for (var s in spikes){
			if(parseInt(epoch) >= parseInt(s) + parseInt(spikeLife)){
				
				var spikedata = iJSON.parse(Datastore.Get("spikeTraps", s));
				

				for(var e in World.Entities){
					if(e.X == spikedata.X && e.Y == spikedata.Y && e.Z == spikedata.Z){
						Datastore.Remove("spikeTraps", s)
						e.Destroy();
						
					} 
				}

			} 
				
		}
	} else {
		Plugin.KillTimer("removeSpikes");
	}

		
}
