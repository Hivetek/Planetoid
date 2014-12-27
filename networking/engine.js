(function(exports) {

var config = {};

config.hostname = "localhost";
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";

exports.engine = engine;

})(typeof global === "undefined" ? window : module.exports);
