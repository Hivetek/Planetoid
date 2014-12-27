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

var tickrate = 1000/60; // Target at 60 fps 

function loop() {
    primus.write({update: {
        cube: cube
    }});

    setTimeout(loop, tickrate);
}

function sqr(x) {
    return x*x;
}

loop();

primus.on("connection", function(spark) {
    console.log("New connection");

    spark.on("data", function(data) {
        // Update server cube the save way it is updated on the client

        var vx = data.mx-cube.x;
        var vy = data.my-cube.y;
        var l = Math.sqrt(sqr(vx) + sqr(vy));
        l = Math.max(l, 0.1);
        var mag = Math.min(5, l);
        cube.x += (mag/l) * vx;
        cube.y += (mag/l) * vy;
    });

    // Write the initial/current state of the cube to the client
    spark.write({init: {
        cube: cube
    }});
});

// Start listening
server.listen(config.port);
