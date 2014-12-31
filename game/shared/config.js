var config = {};

// Game server
config.server = {};
config.server.hostname = "localhost"; // Unused - where the client should connect to load file lists
config.server.protocol = "http";
config.server.port = 1337;
config.server.transformer = "websockets";
config.server.tickrate = 1000/60;

// Client
config.client = {};

// Game (shared between client and server)
config.game = {};
config.game.inputBufferSize = 16;

config.game.player = {};

// Static server
config.staticServer = {};
config.staticServer.port = 8080;

// Helper for config.serverlist
config.newServer = function(name, url) {
    return {
        name: name,
        url: url
    };
};

// Server list
config.serverlist = [
    config.newServer("Localhost", "localhost")
];

// Export module to either client or server
if (typeof global === "undefined") {
    window.config = config;
} else {
    module.exports = config;
}
