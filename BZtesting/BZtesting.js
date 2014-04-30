// User tools for remote and offline data

var plugin = {};
	plugin.name = "BZtesting";
	plugin.author = "BadZombi";
	plugin.version = "0.1";


// main plugin stuff:

	function On_PluginInit() { 

		if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

	}

	function On_PlayerConnected(Player){
			
			DataStore.Add(Player.SteamID, "BZtdest", "off");
			DataStore.Add(Player.SteamID, "BZdupe", "off");
			DataStore.Add(Player.SteamID, "BZrepceil", "off");
			
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
		var active = DataStore.Get(Player.SteamID, "BZ" + cmd);
		switch(cmd) {

			case "testkit":
				if(Player.Admin){
					if(args.Length == 1){
						var giveto = Player.Find(args[0]);

						if(giveto.SteamID){
							giveTestKit(giveto);
							Player.MessageFrom("Test tool", "Test kit given to: " + giveto.Name);
							break;
						} else {
							Player.MessageFrom("Test tool", "No player named " + args[0] + "was found.");
							break;
						}

						break;
						
					} else {
						giveTestKit(Player);
						break;
					}
				} else {
					Player.Message("nope.");
				}
			break;

			case "mods":
				if(Player.Admin){
					if(args.Length == 1){
						var giveto = Player.Find(args[0]);

						if(giveto.SteamID){
							giveMods(giveto);
							Player.MessageFrom("Test tool", "Mods kit given to: " + giveto.Name);
							break;
						} else {
							Player.MessageFrom("Test tool", "No player named " + args[0] + "was found.");
							break;
						}

						break;
						
					} else {
						giveMods(Player);
						break;
					}
				} else {
					Player.Message("nope.");
				}
			break;

			case "woodparts":
				if(Player.Admin){
					if(args.Length == 1){
						var giveto = Player.Find(args[0]);

						if(giveto.SteamID){
							giveWB(giveto);
							Player.MessageFrom("Test tool", "Mods kit given to: " + giveto.Name);
							break;
						} else {
							Player.MessageFrom("Test tool", "No player named " + args[0] + "was found.");
							break;
						}

						break;
						
					} else {
						giveWB(Player);
						break;
					}
				} else {
					Player.Message("nope.");
				}
			break;

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

			case "takemoney":
                try{
                    if (!Player.Admin){
                        Player.Message("You can't take money you twit.");
                    } else if (args.Length == 0){
                        Player.Message("Please enter a player's name!");
                        Player.Message("Example: /takemoney Kuhlkid 100");
                        return;
                    } else if (args.Length < 2){
                        Player.Message("Please enter an ammount to give the player!");
                        Player.Message("Example: /takemoney Kuhlkid 100");
                        return;
                    } else {
                        var user = Player.Find(args[0]);
                        if(user != undefined && user != null){
                            var amount = args[1];
                            //RemoveMoney(user, amount);
                            user.Message("$" + amount + " has been removed from your account!");
                            Player.Message("You have taken $" + amount + " from " + args[0] + ".");
                            break;
                        } else {
                            Player.Message("Sorry. A user named " + args[0] + " was not found!");
                        }                      
                    }
                } catch(err) {
                    Player.MessageFrom("Error", err.message);
                    Player.MessageFrom("Description", err.description);
                }
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


	function giveTestKit(Player){

		var Inv = Player.Inventory;

		Player.Inventory.DropAll();

		Player.Inventory.AddItemTo("Sleeping Bag", 0, 1);
		Player.Inventory.AddItemTo("Arrow", 6, 10);
		Player.Inventory.AddItemTo("Arrow", 12, 10);
		Player.Inventory.AddItemTo("Arrow", 18, 10);
		Player.Inventory.AddItemTo("556 Ammo", 19, 250);
		placeandcheckweapon(Player, "M4", 20);
		placeandcheckweapon(Player, "Bolt Action Rifle", 21);
		Player.Inventory.AddItemTo("Explosive Charge", 22, 5);
		Player.Inventory.AddItemTo("Small Rations", 23, 30);
		Player.Inventory.AddItemTo("Hunting Bow", 24, 1);
		Player.Inventory.AddItemTo("9mm Ammo", 25, 250);
		Player.Inventory.AddItemTo("9mm Ammo", 26, 250);
		Player.Inventory.AddItemTo("Shotgun Shells", 27, 250);
		Player.Inventory.AddItemTo("Supply Signal", 28, 1);
		Player.Inventory.AddItemTo("Large Medkit", 29, 5);
		
		// belt items
		Player.Inventory.AddItemTo("Hatchet", 30, 1);
		placeandcheckweapon(Player, "P250", 31, "belt");
		placeandcheckweapon(Player, "MP5A4", 32, "belt");
		placeandcheckweapon(Player, "Shotgun", 33, "belt");
		Player.Inventory.AddItemTo("F1 Grenade", 34, 5);
		Player.Inventory.AddItemTo("Large Medkit", 35, 5);

		// armor
		Player.Inventory.AddItemTo("Kevlar Helmet", 36, 1);
		Player.Inventory.AddItemTo("Kevlar Vest", 37, 1);
		Player.Inventory.AddItemTo("Kevlar Pants", 38, 1);
		Player.Inventory.AddItemTo("Kevlar Boots", 39, 1);

		Player.MessageFrom("Test tool", "Woo! You got a test kit!");
	}

	function giveMods(Player){
		Player.Inventory.AddItem("Holo sight");
		Player.Inventory.AddItem("Silencer");
		Player.Inventory.AddItem("Flashlight Mod");
		Player.Inventory.AddItem("Laser Sight");
	}

	function giveWB(Player){
		Player.Inventory.AddItem("Wood Foundation", 250);
		Player.Inventory.AddItem("Wood Pillar", 250);
		Player.Inventory.AddItem("Wood Wall", 250);
		Player.Inventory.AddItem("Wood Window", 250);
		Player.Inventory.AddItem("Wood Doorway", 250);
		Player.Inventory.AddItem("Wood Ceiling", 250);
		Player.Inventory.AddItem("Wood Stairs", 250);
		Player.Inventory.AddItem("Wood Ramp", 250);
	}

	function giveDoors(Player){
		Player.Inventory.AddItem("Metal Door", 250);
	}

	function placeandcheckweapon(Player, name, slot, group, count){
		try{
			Player.Inventory.AddItemTo(name, slot, 1);

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
					var item = Player.Inventory.Items[slot];
				break;

				case "belt":
					var item = Player.Inventory.BarItems[slot - 30];
				break;

				case "armor":
					var item = Player.Inventory.ArmorItems[slot];
				break;

			}
			
			var itemSlots = item.InventoryItem.freeModSlots;

			//Player.Message(name + " try " + count);
			if(name == "Bolt Action Rifle"){
				var minslots = 4;
			} else {
				var minslots = 5;
			}
			if(itemSlots < minslots && count < 50){
				Player.Inventory.RemoveItem(slot);
				placeandcheckweapon(Player, name, slot, group, count);
			}
		} catch(err) {
			Player.MessageFrom("Error", err.message);
			Player.MessageFrom("Description", err.description);
		}
	}

	function dump_inventory(Player){

		var ignore = [];
		ignore["idMain"] = 1;
		ignore["character"] = 1;
		ignore["controller"] = 1;
		ignore["controllable"] = 1;
		ignore["iface"] = 1;
		ignore["inventory"] = 1;

		var Inv = Player.Inventory;
		
		
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