/**
 * Network
 */
function Network(game) {
    this.game = game;
    this.primus = undefined;
}

Network.prototype.init = function(url) {
    this.primus = new Primus(url);

    this.primus.on("open", function() {
        console.log("Connection opened");
    });

    this.primus.on("init", function(data) {
        console.log("Initial state:");
        console.log(data);
    });

    this.primus.on("update", function(data) {
        console.log(data);
    });
};
