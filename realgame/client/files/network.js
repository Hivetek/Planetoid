/**
 * Network
 */
function Network(game) {
    this.game = game;
    this.primus = undefined;
}

Network.prototype.init = function(url) {
    var g = this.game;
    this.primus = new Primus(url);
    g.events.trigger("primus::create", this.primus);

    this.primus.on("open", function() {
        console.log("Connection opened");
        g.events.trigger("primus::open");
    });

    this.primus.on("init", function(data) {
        console.log("Initial state:");
        console.log(data);
        g.events.trigger("primus::init", data);
    });

    this.primus.on("update", function(data) {
        console.log(data);
        g.events.trigger("primus::update", data);
    });
};
