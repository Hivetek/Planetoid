/**
 * Input
 */
function Input(o, game) {
    this.import(o);
    this.timestamp = game.getTime();
    this.id = game.getInputId();
}

Input.prototype.export = function() {
    return Core.clone(this);
};

Input.prototype.import = function(o) {
    o = o || {};
    o.mouse = o.mouse || {};
    this.mouse = {
        x: o.mouse.x || 0,
        y: o.mouse.y || 0,
        left: o.mouse.left || false,
        middle: o.mouse.middle || false,
        right: o.mouse.right || false,
        dir: o.mouse.dir || 0
    };
    o.keys = o.keys || {};
    this.keys = {
        up:    o.keys.up    || false,
        left:  o.keys.left  || false,
        right: o.keys.right || false,
        down:  o.keys.down  || false
    };
};

Input.init = function(game, size) {
    // Add keyboard and mouse to game
    game.keyboard = new Keyboard(game);
    game.mouse = new Mouse(game);

    // Add a ring buffer to the game
    game.inputs = new RingBuffer(size || 64);

    // Add initial previous and current input
    game.inputs.enq(Input.fromUserInput(game));


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
        },
        set: function(val) {
            game.inputs.set(game.inputs.size-2, val);
            return val;
        }
    });
};

Input.fromUserInput = function(game) {
    // Capture a snapshot of the current inputs
    var o = {};
    o.mouse = game.mouse.export();
    o.keys  = game.keyboard.export();
    return new Input(o, game);
}

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Input;
}
