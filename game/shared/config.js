var config = {};

// Game server
config.server = {};
config.server.hostname = "localhost"; // Unused - where the client should connect to load file lists
config.server.protocol = "http";
config.server.port = 1337;
config.server.transformer = "websockets";
config.server.tickrate = 48;

// Client
config.client = {};

// Game (shared between client and server)
config.game = {};
config.game.inputBufferSize = 64;
config.game.stateBufferSize = 64;
config.game.gravity = 1600.0;
config.game.planetSize = 1932;
config.game.planetX = 0; //960;
config.game.planetY = 0; //2300;
config.game.physTick = 16;
config.game.targetFPS = 60;
config.game.fpsSampleCount = 30;

// Player
config.game.player = {
    r: 16,
    mass: 0.5,
    friction: 0.08,
    landAccel: 3000,
    jumpSpeed: 10000,
    thrustSide: 800,
    thrustUp: 2000,
    drag: 0.016,
    burnRate: 37.5,
    rechargeRate: 52.5
};

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

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = config;
}
