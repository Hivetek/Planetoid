var config = {};

config.hostname = "localhost"; // Unused - where the client should connect to load file lists
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";
config.inputBufferSize = 16;
config.serverTickrate = 1000/60;
config.staticPort = 8080;

// Server list with helper function
// server that does not need
// to be exposed to global scope
// It simply return the arguments wrappen
// in an abject.
// It is passed to the function below
// such that it is available there.
config.serverlist = (function(server){
    return [ // Edit list here
        server("Localhost", "localhost")
    ];
})(function server(name, url) { return { name: name, url: url }; });


// Export module to either client or server
if (typeof global === "undefined") {
    window.config = config;
} else {
    module.exports = config;
}
