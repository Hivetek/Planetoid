var config = require('shared/config');
var fs = require('fs')
  , path = require('path')
  , browserify = require('browserify')
  , express = require('express')
  , staticServer = express();

var clientPath = "../client";

// Express

// Static files
staticServer.use("/static/", express.static("../static"));

// Client hosting (here is a couple of aliases)
staticServer.use("/",        express.static(clientPath));
staticServer.use("/app/",    express.static(clientPath));
staticServer.use("/client/", express.static(clientPath));

// Use browserify to serve complete module file made to work on client
staticServer.get("/bundle.js", function(req, res) {
    res.setHeader('content-type', 'application/javascript');
    var b = browserify(__dirname + '/build.js').bundle();
    b.on('error', console.error);
    b.pipe(res);
});

// Respond with list of certian directories
staticServer.get(["/files/", "/resources/", "/resources/:type"], function(req, res) {
    var dir = path.join(clientPath, req.url);
    var filelist = getFileList(dir);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(JSON.stringify(filelist));
    res.end();
});

function getFileList(dir) {
    var filelist = [];
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for(var i in files){
            if (!files.hasOwnProperty(i)) continue;
            var name = path.join(dir, files[i]);
            if (!fs.statSync(name).isDirectory()) {
                filelist.push(files[i]);
            }
        }
    }
    return filelist;
}

// Export module
module.exports = staticServer;

