var config = require('shared/config');

var events = require('shared/events');
var State = require('shared/state');
var network = require("app/network");

var Player = require("shared/player");

function Game() {
    this.tickrate = 48;

    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

    // State
    // - Create state buffer (game.states)
    // - Creates input short-hand (game.state)
    State.init(this);

    // Network
    // - Connects to server using Primus
    this.network = network;

    // Phyciscs and gameplay
    this.gravity = 1.0;
    this.timescale = 1.0;
    this.planetSize = 1932;
    this.planetX = 0; //960;
    this.planetY = 0; //2300;
    this.cameraX = 0;
    this.cameraY = 0;

    this.physTick = 16;
    this.targetFPS = 60;
    this.timeAccumulator = 0;

    this.timeScale = 1.0;
    this.fps = 60;

    this.paused = false;
}

Game.prototype.init = function() {
    console.log("Init");

    // Start listening of game server
    network.server.listen(config.port);

    this.events.trigger("init::begin");

    this.player = new Player(0, -2300, this);

    this.currentTime = this.getTime();
    this.lastTime = this.currentTime;

    this.events.trigger("init::end");


    this.events.trigger("loop::begin");

    //console.timeEnd("loop");
    this.loop();
};


Game.prototype.loop = function() {
    //console.time("loop");
    this.currentTime = this.getTime();
    this.deltaTime = this.currentTime - this.lastTime;
    this.timeScale = this.deltaTime / (1000 / this.fps);
    this.timeAccumulator += this.deltaTime;

    if (!this.paused)
        this.update();

    this.lastTime = this.currentTime;

    //console.timeEnd("loop");
    var g = this;
    setTimeout(function() {
        g.loop();
    }, g.tickrate);
}

Game.prototype.update = function() {
    this.updatePhysics();
}

Game.prototype.updatePhysics = function() {
    while (this.timeAccumulator > this.physTick) {
        //this.player.update(this.input, this.prevInput);
        this.timeAccumulator -= this.physTick;
    }
}

Game.prototype.getTime = function() {
    var hrTime = process.hrtime();
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
}

Game.prototype.start = function() {
    this.init();
};

module.exports = Game;
