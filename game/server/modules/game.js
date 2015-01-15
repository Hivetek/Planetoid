var config = require('shared/config');
var Core = require('shared/core');

var events = require('shared/events');
var State = require('shared/state');
var Network = require("app/network");

var Player = require("shared/player");

function Game() {
    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

    this.input = this.prevInput = {
        mouse: {
            x: 0,
            y: 0
        },
        keys: {
            up: false,
            left: false,
            right: false,
            down: false
        }
    };

    // State
    // - Create state buffer (game.states)
    // - Creates input short-hand (game.state)
    State.init(this);
    
    // Network
    // - Connects to server using Primus
    this.network = new Network(this);

    // Phyciscs and gameplay
    this.cameraX = 0;
    this.cameraY = 0;

    this.timeAccumulator = 0;

    this.timeScale = 1.0;
    this.fps = 60;

    this.paused = false;
}

Game.prototype.init = function() {

    // Start listening of game server
    this.network.init();

    this.events.trigger("init::begin");

    this.player = new Player({x: 0, y: -2300}, this);

    this.events.trigger("init::end");


    this.events.trigger("loop::begin");
    this.startTime = this.getTime();
    this.currentTime = this.startTime;
    this.lastTime = this.currentTime;
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

    this.network.primus.send("update", this.state.export());

    this.lastTime = this.currentTime;

    //console.timeEnd("loop");
    var g = this;
    setTimeout(function() {
        g.loop();
    }, config.server.tickrate);
}

Game.prototype.update = function() {
    this.updatePhysics();
}

Game.prototype.updatePhysics = function() {
    var i = Core.clone(this.input);
    var ip = Core.clone(this.prevInput);
    while (this.timeAccumulator > config.game.physTick) {
        this.state.players.iterate(function(player) {
            player.update(i, ip);
        });
        this.timeAccumulator -= config.game.physTick;
    }
}

Game.prototype.getTime = (function() {
    function getNanoSeconds() {
        var hrTime = process.hrtime();
        return (hrTime[0] * 1e+9 + hrTime[1]);
    }
    var startTime = getNanoSeconds();
    return function() {
        return (getNanoSeconds() - startTime) / 1e+6;
    };
})()

Game.prototype.start = function() {
    this.init();
};

module.exports = Game;
