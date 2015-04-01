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

    this.primus.on("init", function(data) {
        g.events.trigger("primus::init", data);
        console.log("Initial state from server:");
        console.log(data);
        g.state.import(data.state);
        console.log("Initial game state:");
        console.log(g.state);
    });

    this.primus.on("update", function(data) {
        g.events.trigger("primus::update", data);
        var input;
        // Queue inputs to be re-applied from data.inputId and forward
        //for (var i = data.inputId; i < g.inputId; i++) {
        //    input = g.inputs.getRaw(i);
        //    if (i != input.id) {
        //        console.log("Input ID mismatch:", i, input.id);
        //        return;
        //    }
        //    g.physicsQueue.enq(i);
        //}
        //g.pendingState = data.state;
        g.state.import(data.state);
    });

    this.primus.on("ping", function(ping){
        self.ping = g.currentTime-ping;
        self.lastPing = g.currentTime;
        self.pingReceived = true;
    });
};
