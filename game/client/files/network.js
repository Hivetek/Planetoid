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

        // Ask the server for the client's id
        p.id(function(id) {
            // Tie it to the game object
            g.id = id;
            g.events.trigger("primus::id", id);
        });
    });

    this.primus.on("entities", function(data) {
        // Accept the entities
        Core.override(g.ECS.entities, data);
    });

    this.primus.on("ping", function(ping){
        self.ping = g.currentTime-ping;
        self.lastPing = g.currentTime;
        self.pingReceived = true;
    });
};
