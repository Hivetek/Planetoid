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
config.game.gravity = 1.0;
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
    friction: 0.25,
    landAccel: 2,
    jumpSpeed: 6,
    thrustSide: 0.3,
    drag: 0.035,
    thrustUp: 0.6,
    burnRate: 0.6,
    rechargeRate: 0.84
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

// Export module to either client or server
if (typeof global === "undefined") {
    window.config = config;
} else {
    module.exports = config;
}
