var config = require('shared/config');
var Primus = require('primus')
  , http = require('http');

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.server.transformer});

// Primus plugins
primus.use("emitter",       require("primus-emitter"));
primus.use("spark-latency", require("primus-spark-latency"));

function Network(game) {
    this.game = game;
    this.server = server;
    this.primus = primus;
}

Network.prototype.init = function() {
    var self = this;
    var g = this.game;

    // Primus connection
    primus.on("connection", function(spark) {
        console.log("New connection");

        spark.on("input", function(input) {
            //console.log(input);
            g.prevInput = g.input;
            g.input = input;
        });

        spark.on("ping", function(ping){
            spark.send("ping", ping);
        });

        // Write the initial/current state of the cube to the client
        spark.send("init", g.player.export());
    });

    this.server.listen(config.server.port);
};

// Export module
module.exports = Network;
