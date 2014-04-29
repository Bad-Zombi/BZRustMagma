// copy structures

var plugin = {};
	plugin.name = "BZcopy";
	plugin.author = "BadZombi";
	plugin.version = "0.1";



function StringFix2(str) {

	

    for (var i = 0; i < deploynames.length; i++)
        if (str == deploynames[i][0])
            return deploynames[i][1];
    return str;
}

function On_PluginInit() { 
	if(bzCoreCheck() != 'loaded'){
        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
        return false;
    }

    if ( !Plugin.IniExists( getFilename() ) ) {

        var Config = {};
        	Config['x'] = 1;

        var iniData = {};
        	iniData["Config"] = Config;

        var conf = createConfig(iniData);

    } 

    Util.ConsoleLog(plugin.name + " plugin loaded.", true);
}

function On_EntityHurt(he) {

	var deploynames = [];
    deploynames["WoodFoundation"] = ";struct_wood_foundation";
    deploynames["WoodPillar"] = ";struct_wood_pillar";
    deploynames["WoodWall"] = ";struct_wood_wall";
    deploynames["WoodDoorFrame"] = ";struct_wood_doorway";
    deploynames["WoodCeiling"] = ";struct_wood_ceiling";
    

	// verify ownershipo on both of these
	
	var structName = DataStore.Get(he.Attacker.SteamID, "BZcopyname"); // get from command
	//he.Attacker.Message("structName" + structName);
	//he.Attacker.Message("e.n" + he.Entity.Name);
	if(he.Entity.Name == "WoodFoundation" && structName != undefined){

		var AllComponents = he.Entity;
        var originalBits = AllComponents.GetLinkedStructs();
       
       	var seedPart = {};
			seedPart.type = deploynames[he.Entity.Name];
	        seedPart.x = he.Entity.X;
	        seedPart.y = he.Entity.Y;
	        seedPart.z = he.Entity.Z;
	        seedPart.rot = he.Entity.Object.transform.rotation;
		
        try{
	        DataStore.Add("BZstruct_" + structName, "part0", seedPart);

	        var i = 1;
			for (var d in originalBits) {
				
				var part = {};
					part.type = deploynames[d.Name];
			        part.x = d.X;
			        part.y = d.Y;
			        part.z = d.Z;
			        part.rot = d.Object.transform.rotation;

			    DataStore.Add("BZstruct_" + structName, "part"+i, part);
			    i++; 
				
		    }

		    DataStore.Remove(he.Attacker.SteamID, "BZcopyname");
			he.Attacker.MessageFrom("Copy", "Structure saved!");
		} catch (err) {
			he.Attacker.Message("Exception Message: " + err.message);
			he.Attacker.Message("Exception Description: " + err.description);
		}
	    

	}

	

	var spawnName = DataStore.Get(he.Attacker.SteamID, "BZcopy_spawnName"); // get from command
	//he.Attacker.MessageFrom("Copy", spawnName);
	if(he.Entity.Name == "WoodFoundation" && spawnName != undefined){
		//he.Attacker.MessageFrom("Copy", "passed : " + DataStore.Count("BZstruct_" + spawnName));
		
		try{	
			//he.Attacker.Message(type, a, b, c, he.Entity.Object.transform.rotation.ToString());
			var seedpart = DataStore.Get("BZstruct_" + spawnName, "part0");

			var a = he.Entity.X;
			var c = he.Entity.Z;

			var b = World.GetGround(a, c);
			var x = seedpart.x;
		    var y = seedpart.y;
		    var z = seedpart.z;
		    var type = seedpart.type;

		    //var newObj = 
		    World.Spawn(type, a, b - 3, c, seedpart.rot);
		    //he.Entity.Object._master.AddStructureComponent(newObj.Object);
		} catch (err) {
			he.Attacker.Message("Exception 1 Message: " + err.message);
			he.Attacker.Message("Exception 1 Description: " + err.description);

		}

		try{	
			var keylist = DataStore.Keys("BZstruct_" + spawnName);
			//consoleDump(keylist, '--', "keylist");
			for (var d in keylist) {
				//consoleDump(d, '--', "item");
				var part = DataStore.Get("BZstruct_" + spawnName, d);
				//he.Attacker.MessageFrom("Copy", part.type);
				var e = part.x;
		        var f = part.y;
		        var g = part.z;
		        var h = part.type;
		        var n = Math.abs(x - e) + a;
		        var m = Math.abs(y - f) + b;
		        var l = Math.abs(z - g) + c;

		        he.Attacker.Message("(x:"+x+" - e:"+e+") + a:"+a+" = " + n);

		        //var sumwut = StrFix(h);
		        // get height of object type and subtract it from m?
		        //newObj = 
		        he.Attacker.Message("adding 1: " + h);
		        World.Spawn(h, n, m - 3, l, part.rot);
		        //he.Entity.Object._master.AddStructureComponent(newObj.Object);

			}

			he.Entity.Destroy();

		} catch (err) {
			he.Attacker.Message("Exception Message: " + err.message);
			he.Attacker.Message("Exception Description: " + err.description);

		}

		/*
			partslist = DataStore.Get(he.Attacker.SteamID, "BZcopy_spawnName");
			for (var d in partslist) {
				he.Attacker.MessageFrom("Copy", d.type);
			}
			//do stuff here to make a new structure using the stored parts

		    
		    DataStore.Remove(he.Attacker.SteamID, "BZcopy_spawnName");
		    he.Attacker.MessageFrom("Copy", "All done!");
	    */

	}
	
}


function On_Command(Player, cmd, args) { 

	cmd = Data.ToLower(cmd);
	switch(cmd) {

		case "copy":
			
			if(args.Length == 1){
				var name = Data.ToLower(args[0]);

				if(name == "cancel"){
					var copypending = DataStore.Get(Player.SteamID, "BZcopyname");
					if(copypending != undefined){
						DataStore.Remove(Player.SteamID, "BZcopyname");
						Player.MessageFrom("Copy", "Canceled copy.");
					} else {
						Player.MessageFrom("Copy", "You werent copying anything anyway. :p");
					}
					break;
				} else {
					// check for entry with same name and cancel if exists
					DataStore.Add(Player.SteamID, "BZcopyname", name);
					Player.MessageFrom("Copy", "Ready to copy a structure. Hit a foundation on the building you want to save.");
				}
				
			} else {
				Player.MessageFrom("Copy", "Use \"/copy <name>\" to save a structure...");
				Player.MessageFrom("Copy", "no spaces in the name for now please... I have plans for that");
				Player.MessageFrom("Copy", "---------------------------------------------");
				break;
			}

		break;

		case "sspawn":
			
			if(args.Length == 1){
				var name = Data.ToLower(args[0]);

				if(name == "cancel"){
					var copypending = DataStore.Get(Player.SteamID, "BZcopy_spawnName");
					if(copypending != undefined){
						DataStore.Remove(Player.SteamID, "BZcopy_spawnName");
						Player.MessageFrom("Copy", "Canceled spawn.");
					} else {
						Player.MessageFrom("Copy", "You werent ready to spawn anything anyway. :p");
					}
					break;
				} else {
					// check for entry with same name and cancel if doesnt exist
					DataStore.Add(Player.SteamID, "BZcopy_spawnName", name);
					Player.MessageFrom("Copy", "Ready to spawn stored structure. Place an origin foundation and hit it with something!");
				}
				
			} else {
				Player.MessageFrom("Copy", "Use \"/copy <name>\" to save a structure...");
				Player.MessageFrom("Copy", "no spaces in the name for now please... I have plans for that");
				Player.MessageFrom("Copy", "---------------------------------------------");
				break;
			}

		break;

		
		
    }
}


/*
	function copy(entity, name){


		var Config = {};
	        Config['nudity_on'] = true;
	        Config['no_grass'] = true;
	        Config['hide_branding'] = true;

	    var iniData = {};
	    	iniData["Config"] = Config;

	    var conf = createConfig(iniData);


	    Datastore.Add(name, 'x', entity.X);
	    Datastore.Add(name, 'y', entity.Y);
	    Datastore.Add(name, 'z', entity.Z);
	    Datastore.Add(name, 'type', entity.Name);
	    var linked = 0;
	    for(ee in entity.GetLinkedStructs()){
	        Datastore.Add(name, linked + 'x', ee.X);
	        Datastore.Add(name, linked + 'y', ee.Y);
	        Datastore.Add(name, linked + 'z', ee.Z);
	        Datastore.Add(name, linked + 'type', ee.Name);
	        linked++;
	    }
	    Datastore.Add(name, 'linked', linked);
	}


	function spawnStored(structureName, Player){
	    var a = Player.X + 5;
	    var c = Player.Z + 5;
	    var b = World.GetGround(a, c);
	    var x = Datastore.Get(name, "x");
	    var y = Datastore.Get(name, "y");
	    var z = Datastore.Get(name, "z");
	    var type = Datastore.Get(name, "type");
	    var obj = StrFix(type);
	    World.Spawn(obj, a, b - getheight(type), c);
	    var d = Datastore.Get(name, "linked");
	    for(var i = 0; i < d; i++){
	        var e = Datastore.Get(name, i + "x");
	        var f = Datastore.Get(name, i + "y");
	        var g = Datastore.Get(name, i + "z");
	        var h = Datastore.Get(name, i + "type");
	        var n = Math.abs(x - e) + a;
	        var m = Math.abs(y - f) + b;
	        var l = Math.abs(z - g) + c;
	        var sumwut = StrFix(h);
	        World.Spawn(sumwut, n, m - getheight(h), l);
	    }
	}

*/