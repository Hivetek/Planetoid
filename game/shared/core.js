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
    if (typeof obj !== "object") throw new TypeError("Core.override: obj is not an object");
    if (typeof override !== "object") throw new TypeError("Core.override: override is not an object");

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

Core.deletions = function(obj, deletions) {
    if (typeof obj !== "object") throw new TypeError("Core.deletions: obj is not an object");

    // Check if we are dealing with an array
    if (Object.prototype.toString.call(deletions) === '[object Array]') {
        var i, j,
            len = deletions.length,
            deletion, split,
            splitLen, splitElem,
            descension;
        for (i = 0; i < len; i++) {
            deletion = deletions[i];
            split = deletion.split(".");
            splitLen = split.length
            descension = obj;
            for (j = 0; j < splitLen; j++) {
                splitElem = split[j];
                if (descension.hasOwnProperty(splitElem)) {
                    if (j < splitLen-1) {
                        descension = descension[splitElem];
                    } else {
                        delete descension[splitElem];
                    }
                } else {
                    break;
                }
            }
        }
    } else if (typeof deletions === "object") {

    } else {
        throw new TypeError("Core.deletions: deletions is neither object nor array");
    }

    return obj;
};

Core.insertions = function(obj, insertions) {
    if (typeof obj !== "object") throw new TypeError("Core.insertions: obj is not an object");
    if (typeof insertions !== "object") throw new TypeError("Core.insertions: insertions is not an object");

    for (var key in insertions) {
        var insertion = insertions[key];
        if (obj.hasOwnProperty(key)) {
            var existing = obj[key];
            if (typeof existing === "object") {
                Core.insertions(existing, insertion);
            } // Else, do not override
        } else {
            obj[key] = insertion;
        }
    }

    return obj;
};

Core.sync = function(obj, instructions) {
    if (instructions.hasOwnProperty("delete")) {
        var deletions = instructions["delete"];
        Core.deletions(obj, deletions);
    }
    if (instructions.hasOwnProperty("insert")) {
        var insertions = instructions["insert"];
        Core.insertions(obj, insertions);
    }
    if (instructions.hasOwnProperty("update")) {
        var updates = instructions["update"];
        Core.override(obj, updates);
    }
    return obj;
};


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Core;
}
