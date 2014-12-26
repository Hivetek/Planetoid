'use strict';

var Primus = require('primus')
  , http = require('http')
  , config = require('./config').config;

//console.log(config);

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.transformer});

var cube = {
    x: 100,
    y: 100
};

var tickrate = 1000;

function loop() {
    primus.write({update: {
        cube: cube
    }});

    setTimeout(loop, tickrate);
}

loop();

primus.on("connection", function(spark) {
    console.log("New connection");

    spark.on("data", function(data) {
        // Update server cube the save way it is updated on the client
        cube.x = data.mx
        cube.y = data.my;
    });

    // Write the initial/current state of the cube to the client
    spark.write({init: {
        cube: cube
    }});
});

// Start listening
server.listen(config.port);
