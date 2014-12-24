'use strict';

var Primus = require('primus')
  , http = require('http')
  , config = require('./config').config;

console.log(config);

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: config.transformer});

// Start listening
server.listen(config.port);
