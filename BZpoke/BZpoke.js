// Identify the owner of an object or whatever:

var BZP = {
	name: 		'BZpoke',
	author: 	'BadZombi',
	version: 	'0.8.2',
	core: 		BZCore,
	poke_player: function(he){
		he.DamageAmount = 0;
		if(he.DamageType == "Melee" || he.DamageType == "Bullet"){
			if(!he.Victim.SteamID && he.DamageEvent.victim.idMain == "MaleSleeper(Clone) (SleepingAvatar)"){
				he.Attacker.Notice("You Poked " + DataStore.Get(he.DamageEvent.sender.idMain.creatorID.ToString(), "BZName"));
			} else {
				he.Attacker.Notice("You Poked " + he.Victim.Name);
				he.Victim.Message(he.Attacker.Name + " just poked you. (No Damage)");
			}
		}
			
	}
}

// Hooks:

function On_PluginInit() { 

	if(BZP.core.loaded == undefined){
        Util.ConsoleLog("Could not load " + BZP.name+ "! (Core not loaded)", true);
        return false;
    }

    if ( !Plugin.IniExists( 'Config' ) ) {

        var Config = {};
        	Config['poke_only_for_admins'] = 0;

        var iniData = {};
        	iniData["Config"] = Config;

        var conf = BZP.core.createConfig(iniData, BZP.name);

    } 

    Util.ConsoleLog(BZP.name + " v" + BZP.version + " loaded.", true);
}

function On_PlayerConnected(Player){

	DataStore.Add(Player.SteamID, "BZpoke", "off");
}

function On_PlayerHurt(he) {
	if(BZP.core.confSetting("poke_only_for_admins") == 1){
		if(!he.Attacker.Admin){
			return;
		}
	}

	if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
		BZP.poke_player(he);
	}
}

function On_EntityHurt(he) {
	if(BZP.core.confSetting("poke_only_for_admins") == 1){
		if(!he.Attacker.Admin){
			return;
		}
	}
	
	var obj = he.Entity.Object;

	if (DataStore.Get(he.Attacker.SteamID, "BZpoke") == "on"){
		
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
				BZP.core.handleError("On_Command", err);
			}
		break;

    }
}
