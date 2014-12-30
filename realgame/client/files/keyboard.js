/**
 * Keyboard
 */
function Keyboard() {
    this.allBindings = {};
    this.bindings = null;
    this.keys = {};
    this.modifiers = {};
    this.events = {};
}

// Add event listeners
Keyboard.prototype.listen = function() {
    var self = this;
    window.addEventListener('keydown', function(event) {
        self.keyUpdate(event, true);
    }, false);
    window.addEventListener('keyup', function(event) {
        self.keyUpdate(event, false);
    }, false);
};

// Is a key pressed down
Keyboard.prototype.is = function(key) {
    if (this.bindings && (key in this.bindings.keys)) {
        var keyCode = this.bindings.keys[key];
        return (keyCode in this.keys) && this.keys[keyCode];
    } else {
        return (key in this.keys) && this.keys[key];
    }
};

// Press down key
Keyboard.prototype.press = function(keyCode) {
    this.keys[keyCode] = true;
};

// Stop pressing down key
Keyboard.prototype.lift = function(keyCode) {
    this.keys[keyCode] = false;
};

// Change the key according to the event
Keyboard.prototype.keyUpdate = function(event, pressed) {
    var keyCode = event.keyCode;

    if (pressed) {
        this.press(keyCode);
    } else {
        this.lift(keyCode);
    }

    this.modifiers['shift'] = event.shiftKey;
    this.modifiers['ctrl'] = event.ctrlKey;
    this.modifiers['alt'] = event.altKey;
    this.modifiers['meta'] = event.metaKey;
};

// Add event on key press
Keyboard.prototype.on = function(key, func) {
    if (!(key in this.events)) {
        this.events[key] = [];
    }

    if (func && Object.prototype.toString.call(func) === "[object Function]") {
        this.events[key].push(func);
    }
};

// Trigger added event
Keyboard.prototype.trigger = function(key) {
    if (key in this.events) {
        this.events[key].forEach(function(element) {
            element.apply(this, []);
        });
    }
};


Keyboard.prototype.addBindings = function(name, bindings) {
    if (name && bindings) {
        this.allBindings[name] = bindings;
    }
};

Keyboard.prototype.switchBindings = function(name) {
    if (name && (name in this.allBindings)) {
        this.setBindings(this.allBindings[name]);
    }
};

// Set the key bindings
Keyboard.prototype.setBindings = function(bindings) {
    this.bindings = bindings;
    this.bindings.keyCodes = {};

    // Flip the key and keyCode pairs
    var key;
    for (key in bindings.keys) {
        if (bindings.keys.hasOwnProperty(key)) {
            this.bindings.keyCodes[bindings.keys[key]] = key;
        }
    }
};
