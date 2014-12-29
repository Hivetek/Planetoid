(function(exports) {

exports.shared = function(buffer) {

    // Default input
    var _input = {
        mouse: {
            x: 0,
            y: 0,
            left: false,
            right: false
        }
    };

    // Add the default input to the buffer
    buffer.enq(_input);

    exports.inputs = buffer;
    Object.defineProperty(exports, "input", { 
        get: function() {
            return buffer.peekLast();
        }, 
        set: function(val) {
            buffer.enq(val);
            return buffer.peekLast();
        }
    });

    // The full description of a state
    exports.state = {
        cube: {
            x: 0,
            y: 0
        }
    };

    // State is required
    // If input is specified, it will use that as the source of input
    // If primus is specified, it will use that Primus instance
    // to send the input (should only be use client-side)
    exports.update = function(state, input, primus) {
        var newInput;
        if (input) {
            newInput = input;
        } else {
            var oldInput = exports.input;
            newInput = exports.update.inputFunction.apply(oldInput, [oldInput,  JSON.parse(JSON.stringify(oldInput))]);
            exports.input = newInput;
        }
        if (primus) {
            primus.send("input", newInput);
        }
        var oldState = state;
        var state = exports.update.state(oldState, newInput, 0, JSON.parse(JSON.stringify(oldState)));
        return state;
    }

    exports.update.inputFunction = undefined;

    exports.update.input = function(callback) {
        if (typeof(callback) == "function") {
            exports.update.inputFunction = callback;
        } else {
            throw new Error('Update Input expects a function');
        }
    };

    exports.update.state = function(oldState, input, time, newState) {
        // Update state here
        // Use only old state, input and time to do so

        // Actual updating
        var vx = input.mouse.x-oldState.cube.x;
        var vy = input.mouse.y-oldState.cube.y;
        var l = Math.sqrt(vx*vx + vy*vy);
        l = Math.max(l, 0.1);
        var mag = Math.min(5, l);
        newState.cube.x += (mag/l) * vx;
        newState.cube.y += (mag/l) * vy;

        return newState;
    };

    return exports;
}

})(typeof global === "undefined" ? window : module.exports);
