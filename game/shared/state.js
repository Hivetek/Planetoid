// NodeJS requires
if (typeof global !== "undefined") {
    var RingBuffer = require('./ringbuffer');
    var HashList = require('./hashlist.js');
    var Player = require('./player');
}

/**
 * State
 */
function State(game) {
    this.players = new HashList(game, Player);
}

State.prototype.export = function() {
    var o = Object.create(null),
        s = this,
        keys = Object.keys(s),
        l = keys.length,
        key,
        value,
        i = 0;

    for (; i < l; i++) {
        key   = keys[i];
        value = s[key];
        if (value && value.export) { // Property must have export function
            o[key] = value.export();
        }
    }
    return o;
};

State.prototype.import = function(o) {
    var okeys = Object.keys(o),
        ol = okeys.length,
        key, value,
        i = 0;

    for (; i < ol; i++) {
        key = okeys[i];
        value = o[key];
        if (this.hasOwnProperty(key) && this[key].import) {
            this[key].import(value);
        }
    }
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

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = State;
}
