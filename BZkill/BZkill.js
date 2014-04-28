// Kill messages and web logging...

var plugin = {};
	plugin.name = "BZkill";
	plugin.author = "BadZombi";
	plugin.version = "0.9";


// Thanks to DreTaX (DeathMSG) for these functions
	function BD(bodyp) {
		var ini = Bodies();
		var name = ini.GetSetting("bodyparts", bodyp);
		return name;
	}

	function Bodies() {
		if(!Plugin.IniExists("bodyparts"))
			Plugin.CreateIni("bodyparts");
		return Plugin.GetIni("bodyparts");
	}

// custom "random" Message stuff
	function make_message (max, file, data) {
		var d = Math.round(Math.random()*10);
		if(d < 1 || d > max){
			d = 1;
		}

		var s = sentence(d, file);
		for(var x in data){
			s = s.replace(x, data[x]);
		}
		return s;
	}

	function sentence(num, file) {
		var ini = sentences(file);
		var value = ini.GetSetting(file, num);
		return value;
	}

	function sentences(file) {
		if(!Plugin.IniExists(file))
			Plugin.CreateIni(file);
		return Plugin.GetIni(file);
	}

// main plugin stuff:

	function On_PluginInit() { 
	    if(bzCoreCheck() != 'loaded'){
	        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
	        return false;
	    }

	    if ( !Plugin.IniExists( getFilename() ) ) {

	        var Config = {};
	        	Config['save_for_later'] = 0

	        var iniData = {};
	        	iniData["Config"] = Config;

	        var conf = createConfig(iniData);

	    } 

	    Util.ConsoleLog(plugin.name + " plugin loaded.", true);
	}

	function On_PlayerHurt(he) {

		
	    if(he.Attacker.SteamID != he.Victim.SteamID && he.Victim.SteamID != undefined){
	    	he.Attacker.InventoryNotice(parseInt(he.DamageAmount) + " damage");
	    }   
	}

	function On_PlayerKilled(DeathEvent) {

		// Determine if its murder:
		try{

			var attId = String(DeathEvent.DamageEvent.attacker.id);
			var attIdMain = String(DeathEvent.DamageEvent.attacker.idMain);

			
			if(attIdMain.indexOf(DeathEvent.Victim.SteamID, 0) >= 0){
				var murder = false;
				
			} else if(DeathEvent.Attacker.SteamID != undefined && DeathEvent.Attacker.SteamID != DeathEvent.Victim.SteamID){
				var murder = true;
				
				//DeathEvent.Attacker.InventoryNotice(parseInt(DeathEvent.DamageAmount) + " damage");
			    
			} else {
				var murder = false;
				
			}
		} catch(err) {
			Plugin.Log("Error_log", "Error Message: " + err.message + " in On_PlayerKilled murder test");
	        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_PlayerKilled murder test")
		}
		
		

	    //Server.Broadcast("COD: " + cod);

	    var victim = DeathEvent.Victim.Name;

	    if(murder == true){

	    	if(DeathEvent.DamageType == "Melee" && DeathEvent.WeaponName == undefined){
				var weapon = "a hunting bow";
				var wweapon = 'hunting bow';
			} else if(DeathEvent.DamageType == "Explosion" && DeathEvent.WeaponName == undefined) {

				if(attIdMain.indexOf('ExplosiveCharge', 0) >= 0){
					var weapon = "C4";
					var wweapon = 'C4';
				} else if(attIdMain.indexOf('F1GrenadeWorld', 0) >= 0){
					var weapon = "a grenade";
					var wweapon = 'grenade';
				} else {
					var weapon = "explosives";
					var wweapon = 'explosives';
				}
				
			} else {
				
				if(DeathEvent.WeaponName == "M4" || DeathEvent.WeaponName == "MP54A"){
					var weapon = "an " + DeathEvent.WeaponName;
				} else {
					var weapon = "a " + DeathEvent.WeaponName;
				}
				var wweapon = DeathEvent.WeaponName;

			}

			if(DeathEvent.WeaponName != "M4" && DeathEvent.WeaponName != "MP54A" && DeathEvent.WeaponName != "P250" && weapon != "C4"){
				var weapon = Data.ToLower(weapon);
				var wweapon = Data.ToLower(wweapon);
			} 

			var distance = Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location);
			var part = Data.ToLower(BD(DeathEvent.DamageEvent.bodyPart));
	    	
	    	var killer = DeathEvent.Attacker.Name;

	    	var msg = {};
	    	msg['KILLER'] = killer;
	    	msg['VICTIM'] = victim;
	    	msg['PART'] = part;
	    	msg['WEAPON'] = weapon;
	    	msg['DISTANCE'] = Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location);


			//Server.Broadcast("⊕" + killer + " just murdered " + victim + " right in the " + part + " with " + weapon + " from " + Util.GetVectorsDistance(DeathEvent.Attacker.Location, DeathEvent.Victim.Location) + " meters!");

			Server.BroadcastFrom("⊕", "[color#FF0000]" + make_message(9, "pvp_messages", msg));

			var data = {};
			
			data['action'] = "kill";
			data['type'] = "playerkill";
			data['killer'] = DeathEvent.Attacker.Name;
			data['ksid'] = DeathEvent.Attacker.SteamID;
			data['kpos'] = loc2web(DeathEvent.Attacker);
			data['victim'] = victim;
			data['vsid'] = DeathEvent.Victim.SteamID;
			data['vpos'] = loc2web(DeathEvent.Victim);
			data['weapon'] = wweapon;
			data['distance'] = distance;
			data['part'] = part;
		

			var response = sendData(data);

	    } else {

	    	// Determine COD and death category:
			var cod = "unknown";
			var wtype = "unknown";
			var deathtype = "unknown";

			if(attIdMain.indexOf('DeployableObject', 0) >= 0){

		        if(attIdMain.indexOf('LargeWoodSpikeWall', 0) >= 0){
		        	deathtype = "item";
		        	cod = "some large spikes";
		        	wtype = 'spikes';
		        } else if(attIdMain.indexOf('WoodSpikeWall', 0) >= 0){
		        	deathtype = "item";
		        	cod = "a spike wall";
		        	wtype = 'spikes';
		        } else if(attIdMain.indexOf('ExplosiveCharge', 0) >= 0){
		        	deathtype = "explosives";
		        	cod = "C4";
		        	wtype = 'C4';
		        }

		    } else if(attId.indexOf('TimedGrenade', 0) >= 0){

		    	deathtype = "explosives";
		    	cod = "a grenade";
		    	wtype = 'grenade';

		    } else if(attIdMain.indexOf('Wolf', 0) >= 0 || attIdMain.indexOf('Bear', 0) >= 0){

		    	deathtype = "ai";

		    	if(attIdMain.indexOf('MutantWolf', 0) >= 0){
		        	cod = "a mutant wolf";
		        	wtype = 'mutant wolf';
		        } else if(attIdMain.indexOf('MutantBear', 0) >= 0){
		        	cod = "a mutant bear";
		        	wtype = 'mutant bear';
		        } else if(attIdMain.indexOf('Wolf', 0) >= 0){
		        	cod = "a wolf";
		        	wtype = 'wolf';
		        } else if(attIdMain.indexOf('Bear', 0) >= 0){
		        	cod = "a bear";
		        	wtype = 'bear';
		        }

		    } else if(attId.indexOf('Metabolism', 0) >= 0){

		    	deathtype = "environmental";
		    	if(DeathEvent.DamageAmount < 1){
		    		cod = "starvation";
		    		wtype = 'starvation';
		    	} else {
		    		cod = "radiation poisoning";
		    		wtype = 'radiation';
		    	}

		    } else if(DeathEvent.Attacker.SteamID == DeathEvent.Victim.SteamID && DeathEvent.DamageAmount == 'Infinity'){
		    	deathtype = "manual";
		    	cod = "suicide";
		    	wtype = 'suicide';
		    } else {

		    	if(DeathEvent.Victim.IsInjured == true){
		    		deathtype = "environmental";
		    		cod = 'a nasty fall';
		    		wtype = 'fall';
		    	} else if(DeathEvent.DamageAmount >= 15){
		    		deathtype = "water";
		    		cod = 'drowned';
		    		wtype = 'drowned';
		    	} else {
		    		cod = "bled out";
		    		wtype = 'bled out';
		    	}

		    }
	    	
	    	switch(deathtype){

	    		case "item":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " just was gutted by " + cod + "!");
	    		break;

	    		case "explosives":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " just blew himself up with " + cod + "!");
	    		break;

	    		case "ai":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " just got jacked up by " + cod + "!");
	    		break;

	    		case "environmental":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " died from " + cod + "!");
	    		break;

	    		case "manual":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " has died from autoerotic asphyxiation!");
	    		break;

	    		case "water":
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " should have taken swimming lessons.");
	    		break;

	    		default:
	    			Server.BroadcastFrom("⊕", "[color#FFA500]" + victim + " has died under mysterious circumstances.");
	    		break;



	    	}

	    	var data = {};
			
			data['action'] = "kill";

			if(deathtype == 'ai'){
				data['type'] = "aikill";
				data['killer'] = wtype;
			} else {
				data['type'] = wtype;
			}

			data['victim'] = victim;
			data['vsid'] = DeathEvent.Victim.SteamID;
			data['vpos'] = loc2web(DeathEvent.Victim);

			var response = sendData(data);
	    }

	    /*
		if(DeathEvent.Victim != null && DeathEvent.Attacker != null && DeathEvent.Attacker != "undefined" && DeathEvent.Victim != "undefined" ){
			// we have both a killer and a victim

			if(DeathEvent.Attacker.SteamID == DeathEvent.Victim.SteamID){
				//is a suicide
				if(DeathEvent.DamageType == "Melee"){
					Server.Broadcast(DeathEvent.Attacker.Name + " just gutted himself on a spike.");
				} else if(DeathEvent.DamageType == "Explosion") {
					Server.Broadcast(DeathEvent.Attacker.Name + " just blew himself up.");
				} else {
					Server.Broadcast(DeathEvent.Attacker.Name + " just killed himself.");
				}
			} else {
				// not a suicide
			
				var killer = DeathEvent.Attacker.Name;
				var victim = DeathEvent.Victim.Name;
				
				Server.Broadcast(killer + " just killed " + victim);
			}
		}
		*/
	}

	function On_NPCHurt(he) {

		he.Attacker.InventoryNotice(parseInt(he.DamageAmount) + " damage");
		//he.Attacker.InventoryNotice("npc"); // ----------------------------- Remove This!
	}

	function On_NPCKilled(DeathEvent) {

		

		try{
			DeathEvent.Attacker.InventoryNotice(parseInt(DeathEvent.DamageAmount) + " damage");

			var attacker = DeathEvent.Attacker.Name;
			var attackerSid = DeathEvent.Attacker.SteamID;
			var attackerPos = loc2web(DeathEvent.Attacker);

			if(DeathEvent.DamageType == "Melee" && DeathEvent.WeaponName == undefined){
				var weapon = "a hunting bow";
				var wweapon = 'hunting bow';
			} else if(DeathEvent.DamageType == "Explosion" && DeathEvent.WeaponName == undefined) {
				var weapon = "explosives";
				var wweapon = 'explosives';
			} else {
				
				if(DeathEvent.WeaponName == "M4" || DeathEvent.WeaponName == "MP54A"){
					var weapon = "an " + DeathEvent.WeaponName;
				} else {
					var weapon = "a " + DeathEvent.WeaponName;
				}
				var wweapon = DeathEvent.WeaponName;

			}

			if(DeathEvent.WeaponName != "M4" && DeathEvent.WeaponName != "MP54A" && DeathEvent.WeaponName != "P250"){
				var weapon = Data.ToLower(weapon);
				var wweapon = Data.ToLower(wweapon);
			} 


			
			var victim = "undefined";
			var wvictim = "undefined";
			var reward = false;
			switch(DeathEvent.Victim.Name){
				case "Chicken_A":
					victim = "a chicken";
					wvictim = "chicken";
				break;

				case "Rabbit_A":
					victim = "a bunny";
					wvictim = "bunny";
				break;

				case "Stag_A":
					victim = "a deer";
					wvictim = "deer";
				break;

				case "Boar_A":
					victim = "a pig";
					wvictim = "pig";
				break;

				case "MutantWolf":
					victim = "a mutant wolf";
					wvictim = "mutant wolf";
					reward = "reward";
				break;

				case "MutantBear":
					victim = "a mutant bear";
					wvictim = "mutant bear";
					reward = "reward";
				break;

				case "Wolf":
					victim = "a wolf";
					wvictim = "wolf";
					reward = "reward";
				break;

				case "Bear":
					victim = "a bear";
					wvictim = "bear";
					reward = "reward";
				break;
			}

			
			Server.BroadcastFrom("⊕", "[color#808000]" + attacker + " killed " + victim + " with " + weapon);


			var data = {};
			data['action'] = "kill";
			data['type'] = "animalkill";
			data['killer'] = attacker;
			data['ksid'] = attackerSid;
			data['kpos'] = attackerPos;
			data['victim'] = wvictim;
			data['weapon'] = wweapon;
			data['callback'] = reward;

			var response = sendData(data);

			if(response.reward != undefined){
				DeathEvent.Attacker.InventoryNotice(response.reward);
			}
		} catch(err) {

			Plugin.Log("Error_log", "Error Message: " + err.message + " in On_NPCKilled");
	        Plugin.Log("Error_log", "Error Description: " + err.description + " in On_NPCKilled")

		}
	}

	function On_EntityHurt(he) {

		if (he.Entity.Name == "MaleSleeper") {

			var OwnerSteamID = he.Entity.OwnerID.ToString();
			var OwnerName = DataStore.Get(OwnerSteamID, "BZName");

			try{
		        Server.Broadcast(he.Attacker.Name + " murdered " + OwnerName + " in his sleep!");

		        
		        var data = {};

		        data['action'] = "kill";
				data['type'] = "sleeper";
				data['killer'] = he.Attacker.Name;
				data['ksid'] = he.Attacker.SteamID;
				data['kpos'] = loc2web(he.Attacker);
				data['victim'] = OwnerName;
				data['vsid'] = OwnerSteamID;

				var posx = parseInt(he.Entity.X);
				var posy = parseInt(he.Entity.Y);
				var posz = parseInt(he.Entity.Z);

				data['vpos'] = posx+"|"+posy+"|"+posz;


				var response = sendData(data);

				if(response.reward != undefined){
					DeathEvent.Attacker.InventoryNotice(response.reward);
				}
			} catch(err) {
				Server.Broadcast("Error Message: " + err.message);
				Server.Broadcast("Error Description: " + err.description);
			}

	    }

	}

	function On_Command(Player, cmd, args) { 

		cmd = Data.ToLower(cmd);
		switch(cmd) {

			case "test":
				
			break;

	    }
	}

