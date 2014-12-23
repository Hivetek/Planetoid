'use strict';

var Primus = require('primus')
  , http = require('http');

var server = http.createServer(/* request handler */)
  , primus = new Primus(server, {transformer: "websockets"});
