'use strict';

var config = require('shared/config');

// Create game
var Game = require("app/game");
var game = new Game();

// Start listening for static file requests
var staticServer = require("app/staticserver");
staticServer.listen(config.staticServer.port);

// Start the game
game.start();

game.log("Server is running!");
