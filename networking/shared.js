(function(exports) {

exports.shared = function(buffer) {

    exports.inputs = buffer;
    var input = function() {
        return buffer.peek();
    }

    // The full description of a state
    var state = {
        cube: {
            x: 0,
            y: 0
        }
    };

}

})(typeof global === "undefined" ? window : module.exports);
