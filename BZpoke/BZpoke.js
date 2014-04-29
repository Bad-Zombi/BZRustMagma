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


	

	function On_PlayerHurt(he) {

		
		if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
			
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
	}

	function On_EntityHurt(he) {

		/*
		try
	    {
	        he.Attacker.Message(he.Entity.Name);
	        var AllComponents = he.Entity;
	        var AC = AllComponents.GetLinkedStructs();
	        for(var EachEntity in AC)
	        {
	            
	            var d = Math.random() * 100;
	            he.Attacker.Message(EachEntity.Name + " : " + d);
	            if(d < 50){
	            	EachEntity.Destroy();
	            }

	        }
	        he.Entity.Destroy();
	    }
	    catch(err)
	    {
	        he.Attacker.Message("Exception Message: " + err.message);
	        he.Attacker.Message("Exception Description: " + err.description);
	    }*/
		
		//he.Entity.Object.renderer.enabled = false;
		//he.Entity.Object.gameObject.active = false;
		//he.Entity.Object.gameObject.activeSelf = false;
		//he.Entity.Object.collider.enabled = false;
		//he.Entity.Object.active = false;
		//he.Entity.Object.enabled = false;
		//he.Entity.Object.transform = false;
		//he.Entity.Object.gameObject = false;
		var obj = he.Entity.Object;



		

		if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
			
			// stuff for quick checking that item has been added
			//fileDump(he.Entity, '-', "entity");
			//fileDump(he.Entity.Object._master, '-', "master");
			//fileDump(he.Entity.Object._master._structureComponents, '-', "master");

			//var linked = he.Entity.GetLinkedStructs();
			//fileDump(linked, '-', "linked");


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

		} else if(he.Attacker.Admin && DataStore.Get(he.Attacker.SteamID, "BZdupe") == "on") {

			var newObj = World.Spawn(";struct_wood_ceiling", he.Entity.X, he.Entity.Y + 3, he.Entity.Z, he.Entity.Object.transform.rotation);

			he.Entity.Object._master.AddStructureComponent(newObj.Object);

			//he.Entity.Destroy();

			/*
			try{
				
				var params = new ParamsList();
	            	params.Add(he.Entity.X);
	            	params.Add(he.Entity.Y);
	            	params.Add(he.Entity.Z);
	            	params.Add(he.Entity.Object.transform.rotation);
	            	params.Add(he.Attacker);
	            Plugin.CreateTimer("replaceFloor", 5 * 1000, params).Start();

	            he.Entity.Destroy();

				
			} catch (err){
				he.Attacker.MessageFrom("Error", err.message);
				he.Attacker.MessageFrom("Description", err.description);
			}
			*/


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


			case "dupe":
				if(Player.Admin){
					try{
						var DupeStatus = DataStore.Get(Player.SteamID, "BZdupe");

						if(DupeStatus == "on"){
							DataStore.Add(Player.SteamID, "BZdupe", "off");
							Player.Message("Dupe deactivated.");
						} else {
							DataStore.Add(Player.SteamID, "BZdupe", "on");
							Player.Message("Dupe is active. Be Careful!");
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

		newSM.GenerateLinks();
		newSM.RecalculateBounds();
		newSM.RecalculateStructureSize();
		newSM.RecalculateStructureLinks();

		//fileDump(master, '-', "master");

		Plugin.KillTimer("replaceFloor");

	} catch(err){
		Server.Broadcast(err.ToString());
	}
	Plugin.KillTimer("replaceFloor");

}