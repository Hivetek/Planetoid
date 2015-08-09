'use strict';

var config = require('shared/config');
var colors = require('colors');

// Create game
var Game = require("app/game");
var game = new Game();

// Start listening for static file requests
var staticServer = require("app/staticserver");
staticServer.listen(config.staticServer.port);

// Start the game
game.init();
game.start();

game.log("Server is running!".green);
