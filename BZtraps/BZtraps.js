// Set traps in rust!

var plugin = {};
	plugin.name = "BZtraps";
	plugin.author = "BadZombi";
	plugin.version = "0.6";

// BZtrap stuff:



	// maybe add something that refreshes the trap list from time to time so if trigger or target items are removed it doesnt just sit there taking up space?
	function triggerTrap(Player, type, item) {
		
		var trapped = DataStore.Get("BZtraps", item);
		var trapowner = DataStore.Get("BZtraps", item+"_owner"); // check for references to this and remove them?
		
		
		try{
			
			switch(type){
				case "floor":
					if(trapped != undefined){
						Player.Notice("Aaaah! Its a Trap!");
						Server.Broadcast(Player.Name + " triggered a trap set by " + trapowner.name);
						//var newone = trapped;
						trapped.Destroy();	
						//newone.CreateInstance();					
						DataStore.Remove("BZtraps", item);
					}
				break;
			}
			
		} catch(err){
			Server.Broadcast("Error Message: " + err.message);
			Server.Broadcast("Error Description: " + err.description);
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
	        	Config['trap_price'] = 500;
		        Config['require_resources'] = 0;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);
	}

	

	function On_PlayerConnected(Player){
		
		
	}

	function On_PlayerDisconnected(Player){	
		
	}

	function On_PlayerSpawned(Player, spawnEvent) {
		
		
	}

	function On_PlayerHurt(he) {

	}

	function On_PlayerKilled(DeathEvent) {

		
	}

	

	function On_EntityHurt(he) {

		var OwnerSteamID = he.Entity.OwnerID.ToString();
		var OwnerName = DataStore.Get(OwnerSteamID, "BZName");

		

	    try{
		    if(he.Attacker == he.Entity.Owner){

		    	

			    if(he.Entity.Name == "WoodCeiling" || he.Entity.Name == "MetalCeiling"){
			    	var pendingtrap = DataStore.Get(he.Attacker.SteamID, "BZTpending");
			    	if(pendingtrap != undefined && pendingtrap != "none"){
				    	he.Attacker.Message("Trap set!");
				    	//pendingtrap.Open
				    	DataStore.Add("BZtraps", pendingtrap, he.Entity);
				    	var ownerinfo = {}
				    	ownerinfo['name'] = he.Attacker.Name;
				    	ownerinfo['sid'] = he.Attacker.SteamID;
				    	DataStore.Add("BZtraps", pendingtrap+"_owner", ownerinfo);
						Datastore.Remove(he.Attacker.SteamID, "BZTpending");
						DataStore.Remove(he.Attacker.SteamID, "BZpending");
						//DataStore.Save();	
					}
			    }
			}
		} catch(err){
			Server.Broadcast("Error Message: " + err.message);
			Server.Broadcast("Error Description: " + err.description);
		}
	    
	}

	function On_DoorUse(Player, de) {
	    
	    if(Player == de.Entity.Owner) {
	        
	    	

	        var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");

	        if(pendingtrap != undefined && pendingtrap == "setTrap"){
				DataStore.Add(Player.SteamID, "BZTpending", de.Entity.InstanceID);
				Player.Message("Trap will be set on selected door.");
				Player.Message("Now hit the floor outside the door to mark it.");
				de.Open = false;

			} else {
				try{
				//triggerTrap(Player, 'floor', de.Entity.InstanceID);
				var trapped = DataStore.Get("BZtraps", de.Entity.InstanceID);
				if(trapped != undefined){
					Player.Notice("This door has an active trap set!");
				}
				
			} catch(err){
				Server.Broadcast("Error Message 1: " + err.message);
				Server.Broadcast("Error Description 1: " + err.description);
			}
		}
	        //var pendingtrap = DataStore.Get("BZtraps", de.Entity.InstanceID);
	        
	    return;
	    } else {
	    	triggerTrap (Player, 'floor', de.Entity.InstanceID);
	    }
	}

	

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "trap":
				
				if(args.Length == 1){
					var type = Data.ToLower(args[0]);
					if(type == "list"){
						Player.MessageFrom("Traps", "Current trap types are \"[color#FFFF00]floor[/color]\" \"[color#FFFF00]spike[/color]\" and \"[color#FFFF00]C4[/color]\"");
						Player.MessageFrom("Traps", "All traps cost 100 Paper to set. You must have 100 paper in your inventory.");
						Player.MessageFrom("Traps", "Floor traps will destroy a selected floor/ceiling so victim will fall through.");
						Player.MessageFrom("Traps", "Spike traps will drop a spike wall on the victim.");
						Player.MessageFrom("Traps", "C4 traps will detonate the trapped object. Best used on empty (decoy) storage devices.");
						Player.MessageFrom("Traps", "---------------------------------------------");
						break;
					} else if(type == "floor" || type == "spike" || type == "c4"){
						// add process to check for paper before continuing. paper will not be removed until the trap is completed.
						DataStore.Add(Player.SteamID, "BZpending", "setTrap");
						DataStore.Add(Player.SteamID, "trapType", type);
						Player.MessageFrom("Traps", "Select a door, box or stash to set a trap on. You must own this item.");
						Player.MessageFrom("Traps", "---------------------------------------------");
						break;
					} else if(type == "cancel"){
						var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");
						if(pendingtrap != undefined && pendingtrap == "setTrap"){
							DataStore.Remove(Player.SteamID, "BZpending");
							DataStore.Remove(Player.SteamID, "trapType");
							Player.MessageFrom("Traps", "Canceled trap setting.");
						} else {
							Player.MessageFrom("Traps", "No traps are being set right now.");
						}
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

// callbacks
	function resetTrapCallback (object, trigger) {
		//World.Spawn(";struct_wood_ceiling", object.X, object.Y, object.Z);
	}

