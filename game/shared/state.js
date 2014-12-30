// NodeJS requires
if (typeof global !== "undefined") {
    var RingBuffer = require('./ringbuffer');
}

/**
 * State
 */
function State(game) {
    //this.game = game; - Is this needed?
}

State.init = function(game, size) {
    // Add a ring buffer to the game
    game.states = new RingBuffer(size || 64);

    // Add initial input
    game.states.enq(new State(game));

    // Add a short-hand to the newest input
    Object.defineProperty(game, "state", { 
        get: function() {
            return game.states.peekLast();
        }, 
        set: function(val) {
            game.states.enq(val);
            return game.states.peekLast();
        }
    });
};

// Export module to either client or server
if (typeof global === "undefined") {
    window.State = State;
} else {
    module.exports = State;
}
