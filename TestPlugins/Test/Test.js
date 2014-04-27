var plugin = {};
    plugin.name = "Test One";
    plugin.author = "BadZombi";
    plugin.version = "0.1";

function On_PluginInit() { 

    if(bzTestCoreCheck() != 'loaded'){
        Util.ConsoleLog("Could not load " + plugin.name + "! (Zero Core not loaded yet)", true);
        return false;
    }

    if ( !Plugin.IniExists( getFilename() ) ) {

        var Config = {};
        Config['setting'] = "example";

        var iniData = {};
        iniData["Config"] = Config;

        var conf = createConfig(iniData);

    } 

    Util.ConsoleLog(plugin.name + " plugin loaded.", true);

}
