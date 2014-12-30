/**
 * Input
 */
function Input(game) {
    // Capture a snapshot of the current inputs
    this.mouse = Core.clone(game.mouse); 
    this.keyboard = Core.clone(game.keyboard); 
}

Input.init = function(game) {
    // Add keyboard and mouse to game
    game.keyboard = new Keyboard();
    game.mouse = new Mouse();

    // Add a ring buffer to the game
    game.inputs = new RingBuffer(64);

    // Add initial input
    game.inputs.enq(new Input(game));

    // Add a short-hand to the newest input
    Object.defineProperty(game, "input", { 
        get: function() {
            return game.inputs.peekLast();
        }, 
        set: function(val) {
            game.inputs.enq(val);
            return game.inputs.peekLast();
        }
    });
};
