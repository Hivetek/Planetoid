var config = {};

config.hostname = "localhost";
config.protocol = "http";
config.port = 1337;
config.transformer = "websockets";
config.inputBufferSize = 16;
config.serverTickrate = 1000/60;
config.staticPort = 8080;

config.serverlist = [
{
    "name": "Localhost",
    "url": "localhost"
},
{
    "name": "Thomas' server",
    "url": "95.166.29.100"
}
];

// Export module to either client or server
if (typeof global === "undefined") {
    window.config = config;
} else {
    module.exports = config;
}
