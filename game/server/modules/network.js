var config = require('shared/config');
var Core = require('shared/core');
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

        var pObj = {id: spark.id};
        var p = new Player(pObj, g);

        g.state.players.add(spark.id, p);

        g.inputList.add(spark.id, {input: defaultInput, prevInput: defaultInput});

        spark.on("input", function(input) {
            var playerInput = g.inputList.get(spark.id);
            playerInput.prevInput = playerInput.input;
            playerInput.input = input;
        });

        spark.on("ping", function(ping){
            spark.send("ping", ping);
        });

        // Write the initial/current state of the cube to the client
        self.sendInitSnapshot();

        spark.on("end", function() {
            g.log("Ended connection: " + spark.id);
            g.state.players.remove(spark.id);
        });
    });

    this.server.listen(config.server.port);
};

Network.prototype.sendSnapshot = function() {
    var self = this;
    var snap = this.game.snapshot();
    this.primus.forEach(function(spark, id, connections) {
        playerInput = self.game.inputList.get(id);
        snap.inputId = playerInput.input.id;
        spark.send('update', snap);
    });
}

Network.prototype.sendInitSnapshot = function() {
    this.primus.send("init", this.game.snapshot());
}

// Export module
module.exports = Network;
