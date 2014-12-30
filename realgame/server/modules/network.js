var config = require('shared/config');
var Primus = require('primus')
  , http = require('http');

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.transformer});

// Primus plugins
primus.use("emitter",       require("primus-emitter"));
primus.use("spark-latency", require("primus-spark-latency"));

// Primus connection
primus.on("connection", function(spark) {
    console.log("New connection");

    spark.on("input", function(input) {
        // Update server cube the save way it is updated on the client

    });
    
    spark.on("ping", function(ping){
        spark.send("ping", ping);
    });

    // Write the initial/current state of the cube to the client
    spark.send("init", {});
});

// Export module
module.exports = {
    server: server,
    primus: primus
};
