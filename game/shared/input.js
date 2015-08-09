// NodeJS requires
if (typeof global !== "undefined") {
    // Import things using
    //var Module = require('./module');
}


/**
 * Input
 */

var Input = {};

Input.initWithUserInput = function(game, size) {
    // Add keyboard and mouse to game
    game.keyboard = new Keyboard(game);
    game.mouse = new Mouse(game);

    Input.init(game, size);
}

Input.init = function(game, size) {};

Input.InputStructure = function(game) {
    game = game || Input.fakeGame;
    return {
        mouse: Input.MouseStructure(game.mouse   || Input.fakeMouse),
        keys : Input.KeysStructure(game.keyboard || Input.fakeKeyboard),
        id: game.getInputId(),
        timestamp: game.getTime()
    };
}

Input.MouseStructure = function(m) {
    return {
        x:      m.x      || 0,
        y:      m.y      || 0,
        left:   m.left   || false,
        middle: m.middle || false,
        right:  m.right  || false
    };
}

Input.KeysStructure = function(k) {
    return {
        up:    k.is(38) || k.is("up")    || false,
        left:  k.is(37) || k.is("left")  || false,
        right: k.is(39) || k.is("right") || false,
        down:  k.is(40) || k.is("down")  || false
    };
}

Input.fakeMouse    = {};
Input.fakeKeyboard = {is: function(_) {return undefined;}};
Input.fakeGame     = {
    getInputId: function() { return -1; },
    getTime:    function() { return -1; },
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Input;
}
