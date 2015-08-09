/**
 * Network
 */
function Network(game) {
    this.ping = 0;
    this.pingReceived = true;
    this.lastPing = 0;
    this.game = game;
    this.primus = undefined;
};

Network.prototype.init = function(url) {
    var self = this;
    var g = this.game;

    this.primus = new Primus(url);

    g.events.trigger("primus::create", this.primus);

    var p = this.primus;
    this.primus.on("open", function() {
        console.log("Connection opened");
        g.events.trigger("primus::open");
    });

    this.primus.on("snapshot", function(snap) {
        g.acceptSnapshot(snap);
    });

    this.primus.on("init", function(snap) {
        g.events.trigger("primus::init");
        g.acceptSnapshot(snap);
        self.requestId();
    });

    this.primus.on("ping", function(ping){
        self.ping = g.currentTime-ping;
        self.lastPing = g.currentTime;
        self.pingReceived = true;
    });
};

Network.prototype.requestId = function() {
    var p = this.primus
        g = this.game;
    // Ask the server for the client's id
    p.id(function(id) {
        g.events.trigger("primus::id", id);
    });
};
