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
config.game.gravity = 9.82; //m/s^2
config.game.planetSize = 193.2; //m
config.game.planetX = 0; //960;
config.game.planetY = 0; //2300;
config.game.physTick = 16;
config.game.targetFPS = 60;
config.game.fpsSampleCount = 30;

// Player
config.game.player = {
    r: 1.6, //meters
    mass: 80, //kg
    us: 0.7, //Static friction-coefficient
    uk: 0.66, //Kinematic friction coefficient
    friction: 0.08, //TODO: switch to µs and µk
    landAccel: 3000, //TODO: switch to m/s^2
    jumpSpeed: 10000, //TODO: switch to m/s
    thrustSide: 800, //TODO: switch to m/s^2
    thrustUp: 2000, //TODO: switch to m/s^2
    drag: 2.31,    //Fd = drag*v^2, drag = 1/2 * A * Cd * rho, A = r^2 * pi, Cd = 0.47, rho = 1.225kg/m^3 
    burnRate: 37.5, //fuel-units per second
    rechargeRate: 52.5 //fuel-units per second
};

//Particle configurations
/* EXAMPLE CONF
     * spread
     * speed
     * speedVar
     * mass
     * massVar
     * r
     * sizeVar
     * brownian
     * drag
     * lifetime
     * lifetimeVar
     * growth
     * growthVar
     * color
     * physics = (0, 1, 2) - 0 = no-clip, 1 = collide with ground only, 2 = collide with ground and players
     */

config.particles = {};
config.particles.blood = {
    spread: Math.PI * 2,
    speed: 10,
    speedVar: 0.1,
    mass: 1,
    massVar: 0.00,
    r: 3.5,
    sizeVar: 0.2,
    brownian: 0,
    drag: 0.01,
    lifetime: 1000,
    lifetimeVar: 0.05,
    growth: -2, //percentage per tick 
    growthVar: 0.5,
    color: {r: 255, g: 0, b: 0, a: 1.0},
    physics: 1
};
config.particles.smoke = {
    spread: Math.PI * 2,
    speed: 5,
    speedVar: 0.3,
    mass: -0.5,
    massVar: 0.05,
    r: 3,
    sizeVar: 0.2,
    brownian: 1,
    drag: 0.05,
    lifetime: 1000,
    lifetimeVar: 0.05,
    growth: 2, //percentage per tick 
    growthVar: 0.5,
    color: {r: 128, g: 128, b: 128, a: 1.0},
    physics: 0
};
config.particles.smokestreak = {
    spread: 0.00,
    speed: 0,
    speedVar: 0.3,
    mass: -0.3,
    massVar: 0.05,
    r: 3,
    sizeVar: 0.2,
    brownian: 1,
    drag: 0.05,
    lifetime: 300,
    lifetimeVar: 0.05,
    growth: 2, //percentage per tick 
    growthVar: 0.5,
    color: {r: 128, g: 128, b: 128, a: 1.0},
    physics: 0
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

