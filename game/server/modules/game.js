var config = require('shared/config');
var Core = require('shared/core');
var VectorMath = require('shared/vectorMath');

var events = require('shared/events');
var State = require('shared/state');
var Input = require("shared/input");
var Network = require("app/network");

var Player = require("shared/player");
var HashList = require("shared/hashlist");

var ECS = require("shared/ecs");
var Box = require("shared/box");

function Game() {
    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

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

    this.ECS = new ECS(this);
}

Game.prototype.init = function() {

    // Start listening of game server
    this.network.init();

    this.events.trigger("init::begin");

    // Add init code between here

    var self = this;
    this.events.on("player::killed", function(id) {
        setTimeout(function() {
            self.network.primus.send("remote::player::respawn", id);
        }, 2000);
    });

    Box.component(this);

    var g = this;
    this.events.on("player::fired", function(id) {
        console.log("Pew!");
    });

    this.events.trigger("init::end");
};


Game.prototype.loop = function() {
    //this.time("loop");
    this.currentTime = this.getTime();
    this.deltaTime = this.currentTime - this.lastTime;
    this.timeScale = this.deltaTime / (1000 / this.fps);
    this.timeAccumulator += this.deltaTime;

    //this.ECS.runSystem("input");

    if (!this.paused)
        this.update();

    this.network.sendSnapshot();

    this.lastTime = this.currentTime;

    //this.timeEnd("loop");
    var g = this;
    setTimeout(function() {
        g.loop();
    }, config.server.tickrate);
}

Game.prototype.update = function() {
    this.updatePhysics();
}

Game.prototype.updatePhysics = function() {
    while (this.timeAccumulator > config.game.physTick) {
        this.ECS.runSystem("physics");
        this.timeAccumulator -= config.game.physTick;
    }
}

Game.prototype.snapshot = function() {
    var self = this;
    return {
        entities: self.ECS.entities,
        timestamp: self.getTime()
    };
};

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

Game.prototype.getInputId = function() {
    return undefined;
};

Game.prototype.start = function() {
    this.events.trigger("loop::begin");
    this.startTime = this.getTime();
    this.currentTime = this.startTime;
    this.lastTime = this.currentTime;
    this.loop();
};

Game.prototype.log = function() {
    var d = new Date();
    var n = d.toLocaleTimeString(); // Get local time
    var args = ["[Planetoid]".gray, ("[" + n + "]").gray];
    args.push.apply(args, Array.prototype.slice.call(arguments)); // Convert arguments to array and append args
    console.log.apply(undefined, args);
};

module.exports = Game;
