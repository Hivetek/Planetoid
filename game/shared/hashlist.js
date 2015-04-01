// NodeJS requires
if (typeof global !== "undefined") {
    var Core = require('./core.js');
}

/**
 * HashList
 * HashTable with iteration abilities
 *
 * Objects can be used as dictionaries from key to value.
 * In V8 (Chrome, NodeJS) the objects can be in the following two modes:
 *  - dictionary mode (hash map)
 *  - fast mode (structs)
 *
 * To keep the iterations fast, we must stay in fast-mode.
 * Things that can get the object out of fast-mode:
 *  - Using integers or special chars as keys (e.g. the primus id 1420053701814$0)
 *  - Adding too many objects (according to my research 13 is max)
 *  - Using delete
 * 
 * Test fast-mode:
 *   var l = new HashList();
 *   -- Perform operations --
 *   console.log(%HasFastProperties(l.list));
 * Run in NodeJS with
 *    node --allow-natives-syntax file.js
 *
 * See http://stackoverflow.com/a/24989927
 */
function HashList(game, type) {
    this.list = Object.create(null); // Create an empty object
    this.length = 0;
    this.game = game;
    this.type = type;
}

HashList.prototype.add = function(key, value) {
    if (!key) throw new TypeError("HashList.add: Key is undefined");
    if (!value) throw new TypeError("HashList.add: Value is undefined");
    var k = HashList.formatKey(key);
    if (!this.list[k]) {
        this.length++;
    }
    this.list[k] = value;
};

HashList.prototype.get = function(key) {
    if (!key) throw new TypeError("HashList.get: Key is undefined");
    var k = HashList.formatKey(key);
    return this.list[k];
};

HashList.prototype.remove = function(key) {
    if (!key) throw new TypeError("HashList.remove: Key is undefined");
    var k = HashList.formatKey(key);
    if (this.list[k]) {
        this.list[k] = undefined; // If we use delete, we step out of fast-mode
        this.length--;
    }
};

// Iterate over the HashList given a callback function.
// The callback can take the following arguments (in order):
//   element, key, index
HashList.prototype.iterate = function(fn) {
    if (!fn) throw new TypeError("HashList.iterate: Callback function is undefined");
    if (typeof fn !== "function") throw new TypeError("HashList.iterate: Callback function is not a function");
    var i = 0, 
        ks = Object.keys(this.list), 
        l = ks.length,
        key, elem;
    for (; i < l; i++) {
        key = ks[i];
        elem = this.list[key];
        if (elem) {
            fn(elem, key, i);
        }
    }
};

// Return a list of keys
HashList.prototype.keys = function() {
    var l = [];
    this.iterate(function (_, key) {
        l.push(key);
    });
    return l;
};

// Return a list of values
HashList.prototype.values = function() {
    var l = [];
    this.iterate(function (value) {
        l.push(value);
    });
    return l;
};

HashList.prototype.export = function() {
    if (this.type) {
        var o = Object.create(null);
        this.iterate(function(elem, key) {
            if (elem && elem.export) {
                o[key] = elem.export();
            }
        });
        return o;
    } else {
        var c = Core.clone(this.list);
        return c;
    }
};

// NOTE: This method modifies o
HashList.prototype.import = function(o) {
    if (!o) return;
    var self = this;
    this.iterate(function(elem, key) {
        if (o[key]) { // Key exists in both list and o -- Update
            if (elem.import) {
                elem.import(o[key]);
            } else {
                self.add(key, o[key]);
            }
            delete o[key]; // Remove this from o (see below)
        } else { // Does not exist in o -- Delete
            self.remove(key);
        }
    });
    // Iterate over o to see the remaining objects
    // These are in o, but not in the list, thus
    // they should be added -- New
    var i = 0, 
        ks = Object.keys(o),
        l = ks.length,
        key, elem;
    for (; i < l; i++) {
        key = ks[i];
        elem = o[key];
        if (elem) { // Exists in o but not in list -- New
            if (self.type) {
                var newElem = new self.type(elem, self.game);
            } else {
                var newElem = Core.clone(elem);
            }
            self.add(key, newElem);
        }
    }
};

// Make sure that the key does not
// start with an interger
HashList.formatKey = function(key) {
    return key;
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = HashList;
}
