// User tools for remote and offline data

var BZtest = {
	name: 		'BZtesting',
	author: 	'BadZombi',
	version: 	'0.2.1',
	core: 		BZCore,
	placeandcheckweapon: function(P, name, slot, group, count){
		try{
			P.Inventory.AddItemTo(name, slot, 1);

			if(group == undefined){
				var group = "item";
			}

			if(count == undefined){
				var count = 1;
			} else {
				count++;
			}

			switch(group){

				case "item":
					var item = P.Inventory.Items[slot];
				break;

				case "belt":
					var item = P.Inventory.BarItems[slot - 30];
				break;

				case "armor":
					var item = P.Inventory.ArmorItems[slot];
				break;

			}
			
			var itemSlots = item.InventoryItem.freeModSlots;

			//P.Message(name + " try " + count);
			if(name == "Bolt Action Rifle"){
				var minslots = 4;
			} else {
				var minslots = 5;
			}
			if(itemSlots < minslots && count < 50){
				P.Inventory.RemoveItem(slot);
				this.placeandcheckweapon(P, name, slot, group, count);
			}
		} catch(err) {
			P.MessageFrom("Error", err.message);
			P.MessageFrom("Description", err.description);
		}
	},
	giveTestKit: function(P){

		var Inv = P.Inventory;

		P.Inventory.DropAll();

		P.Inventory.AddItemTo("Sleeping Bag", 0, 1);
		P.Inventory.AddItemTo("Arrow", 6, 10);
		P.Inventory.AddItemTo("Arrow", 12, 10);
		P.Inventory.AddItemTo("Arrow", 18, 10);
		P.Inventory.AddItemTo("556 Ammo", 19, 250);
		this.placeandcheckweapon(P, "M4", 20);
		this.placeandcheckweapon(P, "Bolt Action Rifle", 21);
		P.Inventory.AddItemTo("Explosive Charge", 22, 5);
		P.Inventory.AddItemTo("Small Rations", 23, 30);
		P.Inventory.AddItemTo("Hunting Bow", 24, 1);
		P.Inventory.AddItemTo("9mm Ammo", 25, 250);
		P.Inventory.AddItemTo("9mm Ammo", 26, 250);
		P.Inventory.AddItemTo("Shotgun Shells", 27, 250);
		P.Inventory.AddItemTo("Supply Signal", 28, 1);
		P.Inventory.AddItemTo("Large Medkit", 29, 5);
		
		// belt items
		P.Inventory.AddItemTo("Hatchet", 30, 1);
		this.placeandcheckweapon(P, "P250", 31, "belt");
		this.placeandcheckweapon(P, "MP5A4", 32, "belt");
		this.placeandcheckweapon(P, "Shotgun", 33, "belt");
		P.Inventory.AddItemTo("F1 Grenade", 34, 5);
		P.Inventory.AddItemTo("Large Medkit", 35, 5);

		// armor
		P.Inventory.AddItemTo("Kevlar Helmet", 36, 1);
		P.Inventory.AddItemTo("Kevlar Vest", 37, 1);
		P.Inventory.AddItemTo("Kevlar Pants", 38, 1);
		P.Inventory.AddItemTo("Kevlar Boots", 39, 1);

		P.MessageFrom("Test tool", "Woo! You got a test kit!");
	},
	giveMods: function(P){
		P.Inventory.AddItem("Holo sight");
		P.Inventory.AddItem("Silencer");
		P.Inventory.AddItem("Flashlight Mod");
		P.Inventory.AddItem("Laser Sight");
	},
	giveWB: function(P){
		P.Inventory.AddItem("Wood Foundation", 250);
		P.Inventory.AddItem("Wood Pillar", 250);
		P.Inventory.AddItem("Wood Wall", 250);
		P.Inventory.AddItem("Wood Window", 250);
		P.Inventory.AddItem("Wood Doorway", 250);
		P.Inventory.AddItem("Wood Ceiling", 250);
		P.Inventory.AddItem("Wood Stairs", 250);
		P.Inventory.AddItem("Wood Ramp", 250);
	},
	giveDoors: function(P){

		P.Inventory.AddItem("Metal Door", 250);
	},
	giveCheat: function(P){
		P.Inventory.AddItem("Wood Foundation BP", 1);
		P.Inventory.AddItem("Wood Pillar BP", 1);
		P.Inventory.AddItem("Wood Wall BP", 1);

		P.Inventory.AddItem("Wood Window BP", 1);
		P.Inventory.AddItem("Wood Doorway BP", 1);
		P.Inventory.AddItem("Wood Ceiling BP", 1);

		P.Inventory.AddItem("Wood Stairs BP", 1);
		P.Inventory.AddItem("Wood Ramp BP", 1);
		P.Inventory.AddItem("Wood Planks Blueprint", 1);

		P.Inventory.AddItem("Metal Window Bars Blueprint", 1);
		P.Inventory.AddItem("Metal Door Blueprint", 1);
		P.Inventory.AddItem("Sleeping Bag Blueprint", 1);

		P.Inventory.AddItem("Camp Fire Blueprint", 1);
		P.Inventory.AddItem("Large Wood Storage Blueprint", 1);
		P.Inventory.AddItem("Hunting Bow Blueprint", 1);

		P.Inventory.AddItem("Wood Gate Blueprint", 1);
		P.Inventory.AddItem("Wood Gateway Blueprint", 1);
		P.Inventory.AddItem("Spike Wall Blueprint", 1);

		P.Inventory.AddItem("Pipe Shotgun Blueprint", 1);
		P.Inventory.AddItem("HandCannon Blueprint", 1);
		P.Inventory.AddItem("Handmade Shell", 250);

		P.Inventory.AddItem("Small Stash", 10);
		P.Inventory.AddItem("Wood Shelter", 2);
		P.Inventory.AddItem("Large Wood Storage", 2);
		P.Inventory.AddItem("Wooden Door", 2);
	},
	dump_inventory: function(P){

		var ignore = [];
		ignore["idMain"] = 1;
		ignore["character"] = 1;
		ignore["controller"] = 1;
		ignore["controllable"] = 1;
		ignore["iface"] = 1;
		ignore["inventory"] = 1;

		var Inv = P.Inventory;
		
		
		var Main = Inv.Items;
		for(var i in Main){
			if(i.Slot != undefined && i.Slot >= 0){

				Plugin.Log("Main", i.Name + " in slot " + i.Slot + " ------------------- ");
				for (var x in i.InventoryItem) {
				     var output_name = x;
					 var output_value = i.InventoryItem[x];

					 if(typeof(output_value) != "function" && ignore[output_name] != 1){
					 	Plugin.Log("Main", output_name + " : " + output_value);
					 }
					 
				}
				Plugin.Log("Main", " ------------------- ");
				Plugin.Log("Main", ". ");

			}
		}

		var Armor = Inv.ArmorItems;
		for(var i in Armor){
			if(i.Slot != undefined && i.Slot >= 0){

				Plugin.Log("Armor", i.Name + " in slot " + i.Slot + " ------------------- ");
				for (var x in i.InventoryItem) {
				     var output_name = x;
					 var output_value = i.InventoryItem[x];

					 if(typeof(output_value) != "function" && ignore[output_name] != 1){
					 	Plugin.Log("Armor", output_name + " : " + output_value);
					 }
					 
				}
				Plugin.Log("Armor", " ------------------- ");
				Plugin.Log("Armor", ". ");

			}
		}

		var Belt = Inv.BarItems;
		for(var i in Belt){
			if(i.Slot != undefined && i.Slot >= 0){

				Plugin.Log("Belt", i.Name + " in slot " + i.Slot + " ------------------- ");
				for (var x in i.InventoryItem) {
				     var output_name = x;
					 var output_value = i.InventoryItem[x];

					 if(typeof(output_value) != "function" && ignore[output_name] != 1){
					 	Plugin.Log("Belt", output_name + " : " + output_value);
					 }
					 
				}
				Plugin.Log("Belt", " ------------------- ");
				Plugin.Log("Belt", ". ");

			}
		}
	}
}

// Hooks:

function On_PluginInit() { 

	if(BZtest.core.loaded == undefined){
        Util.ConsoleLog("Could not load " + BZtest.name+ "! (Core not loaded)", true);
        return false;
    }

    Util.ConsoleLog(BZtest.name + " v" + BZtest.version + " loaded.", true);
}

function On_PlayerConnected(P){
	DataStore.Add(P.SteamID, "BZtdest", "off");
	DataStore.Add(P.SteamID, "BZdupe", "off");
	DataStore.Add(P.SteamID, "BZrepceil", "off");	
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

function On_Command(P, cmd, args) { 

	cmd = Data.ToLower(cmd);
	var active = DataStore.Get(P.SteamID, "BZ" + cmd);
	switch(cmd) {

		case "testkit":
			if(P.Admin){
				BZtest.giveTestKit(P);
			} else {
				P.Message("nope.");
			}
		break;

		case "mods":
			if(P.Admin){
				BZtest.giveMods(P);
			} else {
				P.Message("nope.");
			}
		break;

		case "woodparts":
			if(P.Admin){
				BZtest.giveWB(P);
			} else {
				P.Message("nope.");
			}
		break;

		case "cheat":
			if(P.Admin){
				BZtest.giveCheat(P);
			} else {
				P.Message("nope.");
			}
		break;

		case "tdest":
			if(P.Admin){
				try{
					if(active == "on"){
						DataStore.Add(P.SteamID, "BZ" + cmd, "off");
						P.Message("test destroy deactivated.");
					} else {
						DataStore.Add(P.SteamID, "BZ" + cmd, "on");
						P.Message("test destroy is active. Hit an object to destroy it and some of its linked structures.");
					}
				} catch(err) {
					BZtest.core.handleError("On_Command", err);
				}
			} else {
				P.Message("nope.");
			}
		break;

		case "dupe":
			if(P.Admin){
				try{
					if(active == "on"){
						DataStore.Add(P.SteamID, "BZ" + cmd, "off");
						P.Message("Dupe deactivated.");
					} else {
						DataStore.Add(P.SteamID, "BZ" + cmd, "on");
						P.Message("Dupe is active. Be Careful!");
						P.Message("Remember that this may screw up the server and require a wipe.");
						P.Message("Possibly of datastore as well.");
					}
				} catch(err) {
					BZtest.core.handleError("On_Command", err);
				}
			} else {
				P.Message("nope.");
			}
		break;

		case "repceil":
			if(P.Admin){
				try{
					if(active == "on"){
						DataStore.Add(P.SteamID, "BZ" + cmd, "off");
						P.Message("Ceiling replace is off.");
					} else {
						DataStore.Add(P.SteamID, "BZ" + cmd, "on");
						P.Message("Ceiling replace is active. Be Careful!");
						P.Message("Remember that this may screw up the server and require a wipe.");
						P.Message("Possibly of datastore as well.");
					}
				} catch(err) {
					BZtest.core.handleError("On_Command", err);
				}
			} else {
				P.Message("nope.");
			}		
		break;

		case "cleanse":
			
			var safeIDs = [];
				//safeIDs['76561198026242506'] = 1;
				safeIDs['76561198110711020'] = 1; // rock
				safeIDs['76561198104256366'] = 1; // c
				safeIDs['76561198126027624'] = 1; // n

			var alwaysdestroy = [];
				alwaysdestroy['Campfire'] = 1;
				alwaysdestroy['SmallStash'] = 1;
				alwaysdestroy['Wood_Shelter'] = 1;
				alwaysdestroy['MaleSleeper'] = 1;
				alwaysdestroy['SleepingBagA'] = 1;
				alwaysdestroy['WoodBoxLarge'] = 1;
				alwaysdestroy['SingleBed'] = 1;
				alwaysdestroy['Workbench'] = 1;
				alwaysdestroy['WoodSpikeWall'] = 1;
				alwaysdestroy['LargeWoodSpikeWall'] = 1;
				alwaysdestroy['Barricade_Fence_Deployable'] = 1;
				alwaysdestroy['WoodGate'] = 1;
				alwaysdestroy['WoodGateway'] = 1;
				alwaysdestroy['WoodenDoor'] = 1;
				alwaysdestroy['WoodBox'] = 1;
				alwaysdestroy['Furnace'] = 1;
				alwaysdestroy['RepairBench'] = 1;
				
			
				try{

					for(var EachEntity in World.Entities){

						if(EachEntity.Object._master != undefined){
						
							if(EachEntity.Name != undefined && alwaysdestroy[EachEntity.Name] == 1){
								//Player.Message("XX -- "+EachEntity.Name);
								EachEntity.Destroy();
							} else if(EachEntity.OwnerID != undefined && safeIDs[EachEntity.OwnerID.ToString()] != 1){
								//Player.Message("XX -- "+EachEntity.Name);
								EachEntity.Destroy();
							} else {
								//Player.Message("...");
							}

						
						} else {
							
							try{
								if(EachEntity.Name != 'MetalDoor'){
									EachEntity.Destroy();
								}
								
								//Player.Message(EachEntity.Name);
							} catch(err){

							}

						}
					}

				} catch(err) {
       				P.MessageFrom("Error", err.message);
					P.MessageFrom("Description", err.description);
       			}

       			Server.BroadcastNotice("World cleansed!");
       		

			//var safe = Player.SteamID.ToString();

			//for(var EachEntity in World.Entities){
			//		
			//	if(EachEntity.IsDeployableObject()){	
			//		
			//		var entStr = EachEntity.OwnerID.ToString();
			//		if(entStr == safe){
			//			Player.Message(EachEntity.Name);
			//			
			//		}
			//		
			//	}
			//}
		break;

		case "listall":
			
			var safeIDs = [];
				//safeIDs['76561198026242506'] = 1;
				safeIDs['76561198110711020'] = 1; // rock
				safeIDs['76561198104256366'] = 1; // c
				safeIDs['76561198126027624'] = 1; // n

			var alwaysdestroy = [];
				alwaysdestroy['Campfire'] = 1;
				alwaysdestroy['SmallStash'] = 1;
				alwaysdestroy['Wood_Shelter'] = 1;
				alwaysdestroy['MaleSleeper'] = 1;
				alwaysdestroy['SleepingBagA'] = 1;
				alwaysdestroy['WoodBoxLarge'] = 1;
				alwaysdestroy['SingleBed'] = 1;
				alwaysdestroy['Workbench'] = 1;
				alwaysdestroy['WoodSpikeWall'] = 1;
				alwaysdestroy['LargeWoodSpikeWall'] = 1;
				alwaysdestroy['Barricade_Fence_Deployable'] = 1;
				alwaysdestroy['WoodGate'] = 1;
				alwaysdestroy['WoodGateway'] = 1;
				alwaysdestroy['WoodenDoor'] = 1;
				alwaysdestroy['WoodBox'] = 1;
				alwaysdestroy['Furnace'] = 1;
				alwaysdestroy['RepairBench'] = 1;
				
			
				try{
					var count = 0;
					var list = {};
					for(var EachEntity in World.Entities){
						
						if(EachEntity.Object._master != undefined){
							count++;

							var foo = EachEntity.Object._master;
							var smId = foo.networkViewID.id.ToString();
							var owner = foo.ownerID.ToString();

							//var pc = 0;
							//for(var p in parts){
							//	pc++;
							//}

							if(list[smId] == undefined){
								var tmp = EachEntity.GetLinkedStructs();
								var bits = {};
									bits["location"] = v32str(foo.containedBounds.center, ",");;
									bits["owner"] = String(owner);
									bits["size"] = v32str(foo.containedBounds.size, ",");
									bits["extents"] = v32str(foo.containedBounds.extents, ",");
									bits["min"] = v32str(foo.containedBounds.min, ",");
									bits["max"] = v32str(foo.containedBounds.max, ",");
									bits["partCount"] = 1;
								list[smId] = bits;

								P.Message("added " + smId + " - ");
								
							} else {
								list[smId]["partCount"]++;
							}
							

							
						
						} else {
							
							//try{
							//	if(EachEntity.Name != 'MetalDoor'){
							//		EachEntity.Destroy();
							//	}
							//	
							//	//P.Message(EachEntity.Name);
							//} catch(err){
							//
							//}
							//
						}
					}

					
					var data = iJSON.stringify(list);
       				Plugin.Log("output", data);

				} catch(err) {
       				P.MessageFrom("Error", err.message);
					P.MessageFrom("Description", err.description);
       			}

       			

       			Server.BroadcastNotice("World list generated!");
       		

			//var safe = Player.SteamID.ToString();

			//for(var EachEntity in World.Entities){
			//		
			//	if(EachEntity.IsDeployableObject()){	
			//		
			//		var entStr = EachEntity.OwnerID.ToString();
			//		if(entStr == safe){
			//			Player.Message(EachEntity.Name);
			//			
			//		}
			//		
			//	}
			//}
		break;

		case "entities":
			
			for (var x in World.Entities) {
				
					Plugin.Log("Entities", x.Name + " " + x.X + " " + x.Y + " " + x.Z);
				
				
			}

			Plugin.Log("Entities", "---------------------------------------------------------------------------------------------- ");
			Plugin.Log("Entities", " . ");
			Plugin.Log("Entities", " . ");
		break;

		case "morning":
            if(P.Admin){
            	
            }
   		break;

   		case "lt":

   			P.Message("Listing traps:");
   			var trapsTable = Datastore.Keys("BZtraps");
   			for (var x in trapsTable){
   				P.Message("Trap ID: " + x);
   				var trapData = iJSON.parse(Datastore.Get("BZtraps", x));
   				P.Message("Type: " + trapData.type );
   				if(trapData.type == "floor"){
   					P.Message("Target: " + trapData.target );
   				}

   				P.Message("Owner: " + trapData.owner );

   				
       				
   			}
   		break;

   		case "flushdatastore":

   			if(!P.Admin){
   				P.Message("You need to be an admin!");
   			}

   			P.Message("Flushing DataStore!");
   			P.Message("BZtraps table...");

   			Datastore.Flush("BZtraps");

   			P.Message("BZtraps spikes...");
   			Datastore.Flush("spikeTraps");
   		break;

   		case "epoch":
   			var epoch = Plugin.GetTimestamp();
   			P.MessageFrom("epoch", epoch);
   		break;

   		case "md5":
	   		//P.Message('x');
	   		//try{
	   			P.Message(HASH.get('password'));
	   			P.Message(HASH.get('boobs'));
	   			P.Message(HASH.get('computer'));
	   			P.Message(HASH.get('wanker'));
	   			P.Message(HASH.get('1'));
	   		//} catch(err) {
	   			//P.MessageFrom("Error", err.message);
				//P.MessageFrom("Description", err.description);
	   		//}
   		break;

   		case "jsontest":

       		var players = Server.Players;
       		var online = players.Count;


       		var playerData = iJSON.stringify(players);

       		for (var x in players){
				
				var location = BZT.core.loc2web(x);
				var lastLoc = DataStore.Get(x.SteamID, "BZloc");
				if(lastLoc != undefined && location == lastLoc){
					online = online - 1;
				} else {
					//Util.ConsoleLog("player has moved! adding to array...", true);
					count++;

					DataStore.Add(x.SteamID, "BZloc", location);
					playerData += '"' + x.SteamID+ '": "' + location + '"';
					if(count != online){
						playerData += ',';
					}
					
				}
				
			}

   			try{
       			Plugin.Log("jsondump", playerData);
       		} catch(err) {
       			Server.Broadcast(err.ToString());
       		}
   		break;

    }
}

// Callbacks:

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