/**
 * Input
 */
function Input(game) {
    // Capture a snapshot of the current inputs
    this.mouse = Core.clone(game.mouse); 
    this.keys = new Keys(game.keyboard);
    this.timestamp = game.getTime();
}

Input.init = function(game, size) {
    // Add keyboard and mouse to game
    game.keyboard = new Keyboard();
    game.mouse = new Mouse();

    // Add a ring buffer to the game
    game.inputs = new RingBuffer(size || 64);

    // Add initial previous and current input
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

    // Add a short-hand to the previous input
    Object.defineProperty(game, "prevInput", { 
        get: function() {
            return game.inputs.get(game.inputs.size-2);
        }
    });
};
