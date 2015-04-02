var config = require('shared/config');
var Core = require('shared/core');

var events = require('shared/events');
var State = require('shared/state');
var Input = require("shared/input");
var Network = require("app/network");

var Player = require("shared/player");
var HashList = require("shared/hashlist");

function Game() {
    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

    // Input
    this.inputList = new HashList(this);

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

    // Add init code between here

    this.events.trigger("init::end");

    var self = this;
    this.events.on("player::killed", function(id) {
        setTimeout(function() {
            var p = self.state.players.get(id);
            p.hp = 100;
            p.isAlive = true;
            var v = Math.random() * 2 * Math.PI;
            var d = 100 + config.game.planetSize;
            p.pos.x = config.game.planetX + d * Math.cos(v);
            p.pos.y = config.game.planetY + d * Math.sin(v);
            p.ppos.x = p.pos.x;
            p.ppos.y = p.pos.y;
        }, 2000);
    });


    this.events.trigger("loop::begin");
    this.startTime = this.getTime();
    this.currentTime = this.startTime;
    this.lastTime = this.currentTime;
    this.loop();
};


Game.prototype.loop = function() {
    //this.time("loop");
    this.currentTime = this.getTime();
    this.deltaTime = this.currentTime - this.lastTime;
    this.timeScale = this.deltaTime / (1000 / this.fps);
    this.timeAccumulator += this.deltaTime;

    if (!this.paused)
        this.update();

    this.network.sendSnapshot();

    this.lastTime = this.currentTime;
    
    this.inputList.iterate(function(inp){
        inp.prevInput = inp.input;
    });

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
    var self = this;
    var playerInput;
    while (this.timeAccumulator > config.game.physTick) {
        this.state.players.iterate(function(player, id) {
            playerInput = self.inputList.get(id);
            if (playerInput) {
                player.update(playerInput.input, playerInput.prevInput);
            }
        });
        this.timeAccumulator -= config.game.physTick;
    }
}

Game.prototype.snapshot = function() {
    var self = this;
    return {
        state: self.state.export(),
        input: self.inputList.export(),
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
    this.init();
};

Game.prototype.log = function() {
    var d = new Date();
    var n = d.toLocaleTimeString(); // Get local time
    var args = ["[Planetoid]".gray, ("[" + n + "]").gray];
    args.push.apply(args, Array.prototype.slice.call(arguments)); // Convert arguments to array and append args
    console.log.apply(undefined, args);
};

module.exports = Game;
