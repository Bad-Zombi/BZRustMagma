// User tools for remote and offline data

var plugin = {};
	plugin.name = "BZpoke";
	plugin.author = "BadZombi";
	plugin.version = "0.7";



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

		

	}

	function On_EntityHurt(he) {

		
		if(!he.Attacker.Admin){
			return;
		}
		
		var obj = he.Entity.Object;

		if (DataStore.Get(he.Attacker.SteamID, "BZtdest") == "on"){

			try {
		        he.Attacker.Message(he.Entity.Name);
		        var AllComponents = he.Entity;
		        var AC = AllComponents.GetLinkedStructs();
		        for(var EachEntity in AC) {
		            
		            var d = Math.random() * 100;
		            he.Attacker.Message(EachEntity.Name + " : " + d);
		            if(d < 50){
		            	EachEntity.Destroy();
		            }

		        }
		        he.Entity.Destroy();
		    } catch(err) {
		        he.Attacker.Message("Exception Message: " + err.message);
		        he.Attacker.Message("Exception Description: " + err.description);
		    }
			
			

		} else if(DataStore.Get(he.Attacker.SteamID, "BZdupe") == "on") {

			var newObj = World.Spawn(";struct_wood_ceiling", he.Entity.X, he.Entity.Y + 3, he.Entity.Z, he.Entity.Object.transform.rotation);

			he.Entity.Object._master.AddStructureComponent(newObj.Object);

		} else if(DataStore.Get(he.Attacker.SteamID, "BZrepceil") == "on") {

			// the problem here is referencing and setting the object as a chile of the existing structuremaster.
			// may need to find it by id somehow rather than referencing it through the destroyed object?
			// either way... will work this out later.

			if(he.Entity.Name == "WoodCeiling"){
				try{
				
					var params = new ParamsList();
		            	params.Add(he.Entity.X);
		            	params.Add(he.Entity.Y);
		            	params.Add(he.Entity.Z);
		            	params.Add(he.Entity.Object.transform.rotation);
		            	params.Add(he.Attacker);
		            	//params.Add(he.Entity.Object._master);

		            Plugin.CreateTimer("replaceFloor", 5 * 1000, params).Start();

		            he.Entity.Destroy();

				} catch (err){
					he.Attacker.MessageFrom("Error", err.message);
					he.Attacker.MessageFrom("Description", err.description);
				}

			} else {

				he.Attacker.Message("Ceiling replace only works on wood ceilings when in test mode.");

			}
			
		}


		
	}

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			var active = DataStore.Get(Player.SteamID, "BZ" + cmd);

			case "tdest":
				if(Player.Admin){
					try{
						if(active == "on"){
							DataStore.Add(Player.SteamID, "BZ" + cmd, "off");
							Player.Message("test destroy deactivated.");
						} else {
							DataStore.Add(Player.SteamID, "BZ" + cmd, "on");
							Player.Message("test destroy is active. Hit an object to destroy it and some of its linked structures.");
						}
					} catch(err) {
						handleError("On_Command", err);
					}
				} else {
					Player.Message("nope.");
				}
			break;

			case "dupe":
				if(Player.Admin){
					try{
						if(active == "on"){
							DataStore.Add(Player.SteamID, "BZ" + cmd, "off");
							Player.Message("Dupe deactivated.");
						} else {
							DataStore.Add(Player.SteamID, "BZ" + cmd, "on");
							Player.Message("Dupe is active. Be Careful!");
							Player.Message("Remember that this may screw up the server and require a wipe.");
							Player.Message("Possibly of datastore as well.");
						}
					} catch(err) {
						handleError("On_Command", err);
					}
				} else {
					Player.Message("nope.");
				}
			break;

			case "repceil":
				if(Player.Admin){
					try{
						if(active == "on"){
							DataStore.Add(Player.SteamID, "BZ" + cmd, "off");
							Player.Message("Ceiling replace is off.");
						} else {
							DataStore.Add(Player.SteamID, "BZ" + cmd, "on");
							Player.Message("Ceiling replace is active. Be Careful!");
							Player.Message("Remember that this may screw up the server and require a wipe.");
							Player.Message("Possibly of datastore as well.");
						}
					} catch(err) {
						handleError("On_Command", err);
					}
				} else {
					Player.Message("nope.");
				}		
			break;

			case "entities":
				
				for (var x in World.Entities) {
					Plugin.Log("Entities", x.Name + " " + x.X + " " + x.Y + " " + x.Z);
				}

				Plugin.Log("Entities", "---------------------------------------------------------------------------------------------- ");
				Plugin.Log("Entities", " . ");
				Plugin.Log("Entities", " . ");
			break;

	    }
	}


	function replaceFloorCallback(params){
		var owner = params.Get(4);
		//Server.Broadcast('x2: ' + owner.Name);
		try{
			
			var newSM = World.CreateSM(owner, params.Get(0), params.Get(1), params.Get(2), params.Get(3));
			var newObj = World.Spawn(";struct_wood_ceiling", params.Get(0), params.Get(1), params.Get(2), params.Get(3));

			//fileDump(newObj.Object, '-', "newObj.Object");
			newSM.AddStructureComponent(newObj.Object);

			//fileDump(master, '-', "master");

			SMobj.GenerateLinks();
			SMobj.RecalculateBounds();
			SMobj.RecalculateStructureSize();
			SMobj.RecalculateStructureLinks();

			//fileDump(master, '-', "master");

			Plugin.KillTimer("replaceFloor");

		} catch(err){
			Server.Broadcast(err.ToString());
		}
		Plugin.KillTimer("replaceFloor");

	}

	function BZTreminderCallback(params){

	}

	// bits to reference stuff later if needed: 

		// stuff for quick checking that item has been added
			//fileDump(he.Entity, '-', "entity");
			//fileDump(he.Entity.Object._master, '-', "master");
			//fileDump(he.Entity.Object._master._structureComponents, '-', "master");

		//var linked = he.Entity.GetLinkedStructs();

			//fileDump(linked, '-', "linked");

		// duplicate ceiling test stuff from before

			//var newObj = World.Spawn(";struct_wood_ceiling", he.Entity.X, he.Entity.Y + 3, he.Entity.Z, he.Entity.Object.transform.rotation);

			//he.Entity.Object._master.AddStructureComponent(newObj.Object);

		// dont really remember whay I saved this lot:

			//
			//consoleDump(newObj, '-', "Spawned");
			//consoleDump(newObj.Object, '-', "Spawned.Entity");
			
			//var obj = he.Entity.Object = false;
			//dataWrite (he.Attacker, "New Object", obj);
			//consoleDump(obj, '-', "Entity.Object");


			//-------------------
			//try{
			//	//he.Entity.Object.Width = 0;
			//	//he.Entity.Object.Height = 0;
			//	//obj.set_active (false);
			//	//obj.guiText = "Hi there!";

			//	var quat = obj.Entity.transform.rotation;
			//	//Server.Broadcast(quat.ToString());

			//	var newObj = World.Spawn(";struct_wood_foundation", obj.X, obj.Y + 5, obj.Z, quat);

			//	//newObj._master = he.Entity._master;
			//	//newObj.Creator = he.Entity.Creator;
			//	//newObj.CreatorID = he.Entity.CreatorID;
			//	//newObj.Owner = he.Entity.Owner;
			//	//newObj.OwnerID = he.Entity.OwnerID;

			//	//he.Entity.Destroy();
			//	//obj.Instantiate(obj, loc, quat);
			//	//obj.set_active (false);
			//} catch (err){
			//	he.Attacker.MessageFrom("Error", err.message);
			//	he.Attacker.MessageFrom("Description", err.description);
			//}
			////var obj = he.Entity.Object = false;
			////dataWrite (he.Attacker, "New Object", obj);
			////consoleDump(obj, '-', "Spawned");
			////consoleDump(obj.Entity, '-', "Spawned.Entity");

			//-----------------------
			

			//he.Entity.Location = Util.CreateVector(he.Entity.X, he.Entity.Y + 2, he.Entity.Z);