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
    var b = browserify(path.resolve("build.js")).bundle();
    b.on('error', console.error);
    b.pipe(res);
});

// Respond with list of certian directories
staticServer.get(["/files/", "/shared/", "/resources/", "/resources/:type"], function(req, res) {
    var dir = path.dirname(path.resolve(path.join(clientPath, req.url)));
    var filelist = getFileList(dir);
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(JSON.stringify(filelist));
    res.end();
});

staticServer.get("/module/:module", function(req, res) {
    var mod = req.params.module;
    res.setHeader('content-type', 'application/javascript');
    var b = browserify(require.resolve(mod)).bundle();
    b.on('error', console.error);
    b.pipe(res);
});

function getFileList(dir) {
    var filelist = [];
    var file, name;
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        for(var i in files){
            if (!files.hasOwnProperty(i)) continue;
            file = files[i];
            if (file.indexOf(".") == 0) continue; // Ignore hidden files
            name = path.join(dir, file);
            if (!fs.statSync(name).isDirectory()) {
                filelist.push(file);
            }
        }
    }
    return filelist;
}

// Export module
module.exports = staticServer;

