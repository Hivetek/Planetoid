'use strict';

var Primus = require('primus')
  , http = require('http')
  , config = require('./config').config;

console.log(config);

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.transformer});

primus.on("connection", function(spark) {
    console.log("New connection");

    // Stats
    console.log(spark.headers);
    console.log(spark.address);
    console.log(spark.query);
    console.log(spark.id);
    console.log(spark.request);

    spark.on("data", function(data) {
        console.log(data);
    });

    spark.write("Hej");
});

// Start listening
server.listen(config.port);
