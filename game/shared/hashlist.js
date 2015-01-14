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
function HashList() {
    this.list = Object.create(null); // Create an empty object
    this.length = 0;
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

// Make sure that the key does not
// start with an interger
HashList.formatKey = function(key) {
    return "E" + key;
};
