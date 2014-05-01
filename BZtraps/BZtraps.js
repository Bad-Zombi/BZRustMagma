// Set traps in rust!

var plugin = {};
	plugin.name = "BZtraps";
	plugin.author = "BadZombi";
	plugin.version = "0.6";

// BZtrap stuff:

	function cancelTrapSetting(Player){
		DataStore.Remove(Player.SteamID, "BZpending");
		DataStore.Remove(Player.SteamID, "trapType");
		Player.Message("Trap building canceled.");
		DataStore.Save();
	}

	// maybe add something that refreshes the trap list from time to time so if trigger or target items are removed it doesnt just sit there taking up space?
	function triggerTrap(Player, triggerLoc) {

		var targetLoc = DataStore.Get("BZtraps", triggerLoc);
		var trapowner = DataStore.Get("BZtraps", triggerLoc+"_owner"); 
		var traptype = DataStore.Get("BZtraps", triggerLoc+"_type"); 

		Player.Notice("Aaaah! Its a Trap!");
		Server.Broadcast(Player.Name + " triggered a trap set by " + trapowner);

		if(traptype == "floor"){
			var target = 'none';
			for(var e in World.Entities){

				if(target == 'none' && e.X +"|"+ e.Y +"|"+ e.Z == targetLoc){
					target = e;
					target.Destroy();
				} 

			}

		} else if(traptype == "spike"){
			//var tloc = targetLoc.split("|");
			//Player.Message(tloc[0] + ", " + tloc[1] + ", " + tloc[2]);
			var spiketrap1 = World.Spawn(";deploy_woodspikewall", Player.X, Player.Y - 3, Player.Z);
			var params = new ParamsList();
            	params.Add(spiketrap1);

            Plugin.CreateTimer("removeSpike", 10 * 1000, params).Start();
			//var spike1 = World.SpawnAtPlayer(";deploy_woodspikewall", Player);
		}

		DataStore.Remove("BZtraps", triggerLoc);
		DataStore.Remove("BZtraps", triggerLoc+"_owner"); 
		DataStore.Remove("BZtraps", triggerLoc+"_type"); 
		DataStore.Save();
		

		
	}



// main plugin stuff:

	function On_PluginInit() { 
		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
	        	Config['trap_price_lqm'] = 15;
		        Config['require_resources'] = 1;

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);
	}

	function On_ServerInit(){

		var allEntities = World.Entities();

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

		//var OwnerSteamID = he.Entity.OwnerID.ToString();
		//var OwnerName = DataStore.Get(OwnerSteamID, "BZName");
		

	    try{
		    if(he.Attacker == he.Entity.Owner){

			    if(he.Entity.Name == "WoodCeiling" || he.Entity.Name == "MetalCeiling"){
			    	var pendingtrap = DataStore.Get(he.Attacker.SteamID, "BZTpending");
			    	if(pendingtrap != undefined && pendingtrap != "none"){

			    		if(confSetting("require_resources") == 1){
			        		var Inv = he.Attacker.Inventory;

			        		if( !Inv.HasItem( "Low Quality Metal", confSetting("trap_price_lqm") ) ){
			        			
			        			he.Attacker.Message("You need " + confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
			        			cancelTrapSetting(he.Attacker);
			        			return;
			        		} else {
			        			Inv.RemoveItem( "Low Quality Metal", confSetting("trap_price_lqm") );
			        		}
			        		// check to make sure the user has enough lqm
			        	}

			        	var pendingTrapType = DataStore.Get(he.Attacker.SteamID, "trapType");

			    		// we're setting a trap... target item location needed:

			    		var targetLoc = he.Entity.X +"|"+ he.Entity.Y +"|"+ he.Entity.Z ;
			    		// store trigger and target in ds:
			    		DataStore.Add("BZtraps", pendingtrap, targetLoc);
			    		// store owner info in ds for use later
				    	DataStore.Add("BZtraps", pendingtrap+"_owner", he.Attacker.Name);
				    	// store trap time for use when triggered.
				    	DataStore.Add("BZtraps", pendingtrap+"_type", DataStore.Get(he.Attacker.SteamID, "trapType"));

				    	// remove trap setting status stuff
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
	    
	    //consoleDump(de.Entity, ' -- ', "door stuff");
	    var doorLoc = de.Entity.X +"|"+ de.Entity.Y +"|"+ de.Entity.Z ;
	    
	    if(Player == de.Entity.Owner) {
	        
	        var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");

	        if(pendingtrap != undefined && pendingtrap == "setTrap"){

	        	if(confSetting("require_resources") == 1){
	        		var Inv = Player.Inventory;
	        		if( !Inv.HasItem( "Low Quality Metal", confSetting("trap_price_lqm") ) ){

	        			de.Open = false;
	        			Player.Message("You need " + confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
	        			cancelTrapSetting(Player);
	        			return;
	        		}
	        		// check to make sure the user has enough lqm
	        	}

	        	var pendingTrapType = DataStore.Get(Player.SteamID, "trapType");
	        	//Player.Message("type: " + pendingTrapType);


	        	switch(pendingTrapType){

	        		case "floor":			        	
						DataStore.Add(Player.SteamID, "BZTpending", doorLoc);
						Player.Message("Door selected...");
						Player.Message("Now hit the ceiling object you would like the trap to destroy.");
						Player.Message("Usually the one right outside the door.");
						Player.Message("You must be the owner of this object.");
						DataStore.Save();
						de.Open = false;
	        		break;

	        		case "spike":

	        			if(confSetting("require_resources") == 1){
			        		var Inv = Player.Inventory;

			        		if( !Inv.HasItem( "Low Quality Metal", confSetting("trap_price_lqm") ) ){
			        			
			        			Player.Message("You need " + confSetting("trap_price_lqm") + " Low Quality Metal to construct this trap.");
			        			cancelTrapSetting(Player);
			        			return;
			        		} else {
			        			Inv.RemoveItem( "Low Quality Metal", confSetting("trap_price_lqm") );
			        		}
			        		// check to make sure the user has enough lqm
			        	}

	        			DataStore.Add("BZtraps", doorLoc, "spike");
			    		// store owner info in ds for use later
				    	DataStore.Add("BZtraps", doorLoc+"_owner", Player.Name);
				    	// store trap time for use when triggered.
				    	DataStore.Add("BZtraps", doorLoc+"_type", "spike");

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

	        	

			} else {

				var trapped = DataStore.Get("BZtraps", doorLoc);
				if(trapped != undefined){
					Player.Notice("You have a trap set on this door.");
					//triggerTrap (Player, doorLoc);
				}
			}

		} else {

	    	var trapped = DataStore.Get("BZtraps", doorLoc);
			if(trapped != undefined){
				triggerTrap (Player, doorLoc);
				
			}
			
	    }
	}

	

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "saveents":

				var allEntities = World.Entities;
				for(var e in allEntities){
					Player.Message("ent: " + e.Name + "x:" + e.X + " y:" + e.Y + " z:" + e.Z);
				}

			break;

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
						DataStore.Save();
						Player.MessageFrom("Traps", "---------------------------------------------");
						break;
					} else if(type == "cancel"){
						var pendingtrap = DataStore.Get(Player.SteamID, "BZpending");
						if(pendingtrap != undefined && pendingtrap == "setTrap"){
							cancelTrapSetting(Player);
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
	function removeSpikeCallback (params) {
		var spike1 = params.Get(0);
		spike1.Destroy();
		Plugin.KillTimer("removeSpike");
		//World.Spawn(";struct_wood_ceiling", object.X, object.Y, object.Z);
	}

