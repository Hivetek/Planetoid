(function(exports) {

var config = {};

config.hostname = "localhost";
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";

exports.config = config;

})(typeof global === "undefined" ? window : module.exports);
