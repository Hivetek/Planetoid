(function(exports) {

var config = {};

config.hostname = "localhost";
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";
config.inputBufferSize = 16;
config.serverTickrate = 1000/60;
config.staticPort = 8080;

exports.config = config;

})(typeof global === "undefined" ? window : module.exports);
