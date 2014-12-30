var config = require('shared/config');

var RingBuffer = require('shared/ringbuffer');
var network = require("app/network");

function Game() {}

Game.prototype.init = function() {
    // Start listening of game server
    network.server.listen(config.port);
};

Game.prototype.start = function() {
    this.init();
};

module.exports = Game;
