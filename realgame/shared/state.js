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
