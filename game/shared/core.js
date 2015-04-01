/**
 * Core library
 */
Core = {};
Core.clone = function(obj) {
    if (!obj) return null;
    if (obj.game || (obj.hasOwnProperty && obj.hasOwnProperty("game"))) {
        var g = obj.game;
        delete obj.game;
    }
    var c = JSON.parse(JSON.stringify(obj))
    if (g) {
        obj.game = g;
    }
    return c;
};


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Core;
}
