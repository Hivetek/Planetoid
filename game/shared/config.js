var config = {};

config.hostname = "localhost"; // Unused - where the client should connect to load file lists
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";
config.inputBufferSize = 16;
config.serverTickrate = 1000/60;
config.staticPort = 8080;

config.newServer = function(name, url) {
    return {
        name: name,
        url: url
    };
};

config.serverlist = [
    config.newServer("Localhost", "localhost")
];

// Export module to either client or server
if (typeof global === "undefined") {
    window.config = config;
} else {
    module.exports = config;
}
