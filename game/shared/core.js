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

Core.extend = function(obj, other) {
    if (typeof obj !== "object") throw new TypeError("Core.extend: obj is not an object");
    if (typeof other !== "object") throw new TypeError("Core.extend: other is not an object");

    for (var key in other) {
        var val = other[key];
        if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
            Core.extend(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
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


// Borrowed from jQuery

Core.hasOwn = ({}).hasOwnProperty;

Core.isFunction = function(obj) {
    return Core.type(obj) === "function";
};

Core.isArray = Array.isArray;

Core.isNumeric = function(obj) {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    // adding 1 corrects loss of precision from parseFloat (#15100)
    return !Core.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
};

Core.isPlainObject = function(obj) {
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not "[object Object]"
    // - DOM nodes
    // - window
    if (Core.type(obj) !== "object" || obj.nodeType) {
        return false;
    }

    if (obj.constructor &&
            !Core.hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
};

Core.isEmptyObject = function(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

Core.type = function(obj) {
    if (obj == null) {
        return obj + "";
    }
    // Support: Android<4.0 (functionish RegExp)
    return typeof obj === "object" || typeof obj === "function" ?
        Core.class2type[ toString.call(obj) ] || "object" :
        typeof obj;
};

Core.trim = function(text) {
    return text == null ?
        "" : ( text + "" ).replace( rtrim, "" );
};

Core.isArrayLike = function(obj) {
	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = "length" in obj && obj.length,
		type = jQuery.type(obj);

	if (type === "function") {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && (length - 1) in obj;
}

Core.class2type = {};
("Boolean Number String Function Array Date RegExp Object Error".split(" ")).forEach(function(name) {
	Core.class2type["[object " + name + "]"] = name.toLowerCase();
});



// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Core;
}
