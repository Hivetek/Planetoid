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

Core.override = function(obj, override) {
    if (typeof obj !== "object") return;
    if (typeof override !== "object") return;

    for (var key in override) {
        var newValue = override[key];
        if (obj.hasOwnProperty(key)) {
            if (typeof newValue === "object") {
                Core.override(obj[key], newValue);
            } else {
                obj[key] = newValue;
            }
        }
    }

    return obj;
};


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Core;
}
