var plugin = {};
    plugin.name = "Test Two";
    plugin.author = "BadZombi";
    plugin.version = "0.1";

function On_PluginInit() { 

    if(bzTestCoreCheck() != 'loaded'){
        Server.Broadcast(bzCoreCheck());
        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
        return false;
    }

    if ( !Plugin.IniExists( getFilename() ) ) {

        var Config = {};
        Config['setting1'] = "example1";
        Config['setting2'] = "example2";
        Config['setting3'] = "example3";

        var iniData = {};
        iniData["Config"] = Config;

        var conf = createConfig(iniData);

    } 

    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

}


function On_Command(Player, cmd, args) { 

    cmd = Data.ToLower(cmd);
    switch(cmd) {

        case "value":
            var setting1 = confSetting("setting1");
            Player.Message("returns: " + setting1);
        break;
        
    }
}

