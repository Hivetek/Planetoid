var config = require('shared/config');
var browserify = require('browserify')
  , express = require('express')
  , staticServer = express();

// Express
staticServer.use("/", express.static("../client"));
staticServer.use("/app/", express.static("../client"));
staticServer.use("/static/", express.static("../static"));

// Use browserify to serve complete module file made to work on client
staticServer.get("/bundle.js", function(req, res) {
    res.setHeader('content-type', 'application/javascript');
    var b = browserify(__dirname + '/build.js').bundle();
    b.on('error', console.error);
    b.pipe(res);
});

// Export module
module.exports = staticServer;

