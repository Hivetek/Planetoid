'use strict';

// Libraries
var Primus = require('primus')
  , RingBuffer = require('./ringbuffer')
  , http = require('http');

// Config
var config = require('./config').config;

// Own modules
var shared = require('./shared').shared(new RingBuffer(config.inputBufferSize));

//console.log(config);

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.transformer});

// Primus plugins
primus.use("emitter",       require("primus-emitter"));
primus.use("spark-latency", require("primus-spark-latency"));


var tickrate = 1000/60; // Target at 60 fps 

function loop() {
    primus.send("update", shared.state);

    setTimeout(loop, tickrate);
}

function sqr(x) {
    return x*x;
}

loop();

primus.on("connection", function(spark) {
    console.log("New connection");

    spark.on("input", function(input) {
        // Update server cube the save way it is updated on the client

        shared.state = shared.update(shared.state, input, undefined);
    });

    // Write the initial/current state of the cube to the client
    spark.send("init", shared.state);
});

// Start listening
server.listen(config.port);