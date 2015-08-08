var config = require('shared/config');
var Core = require('shared/core');
var Input = require('shared/input');
var Primus = require('primus')
  , http = require('http');

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.server.transformer});

// Primus plugins
primus.use("emitter",       require("primus-emitter"));
primus.use("spark-latency", require("primus-spark-latency"));

// Game objects
var Player = require("shared/player");
var Input = require("shared/input");

function Network(game) {
    this.game = game;
    this.server = server;
    this.primus = primus;
}


Network.prototype.init = function() {
    var self = this;
    var g = this.game;

    var defaultInput = new Input({}, g);

    // Primus connection
    primus.on("connection", function(spark) {
        g.log("New connection: " + spark.id);

        // Handle new player

        spark.on("entityinput", function(input) {
            Core.override(g.ECS.entities[1].components.input.curr, input);
        });

        spark.on("ping", function(ping){
            spark.send("ping", ping);
        });

        // Write the initial/current state of the cube to the client
        //self.sendInitSnapshot();

        spark.on("end", function() {
            g.log("Ended connection: " + spark.id);
        });


        // Spark-specific remote events
        // Out

        // In
        spark.on("remote::mousedown", function() {
            g.log(spark.id + " mousedown");
        });

        spark.on("remote::mouseup", function() {
            g.log(spark.id + " mouseup");
        });
    });

    // Global remote events
    // Out
    g.events.on("player::killed", function(id) {
        primus.send("remote::player::killed", id);
    });

    // In

    this.server.listen(config.server.port);
};

Network.prototype.sendSnapshot = function() {
    var self = this;
    var snap = this.game.snapshot();
    this.primus.forEach(function(spark, id, connections) {
        spark.send("entities", self.game.ECS.entities);
    });
}

Network.prototype.sendInitSnapshot = function() {
    this.primus.send("init", this.game.snapshot());
}

// Export module
module.exports = Network;
