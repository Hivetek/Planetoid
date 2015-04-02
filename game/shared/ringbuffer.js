/**
 * Based on RingBufferJS by janogonzalez
 * License: MIT
 * npm:     https://www.npmjs.com/package/ringbufferjs
 * GitHub:  https://github.com/janogonzalez/ringbufferjs
 */

/**
 * Initializes a new empty `RingBuffer` with the given `capacity`, when no
 * value is provided uses the default capacity (50).
 *
 * @param {capacity}
 * @return {RingBuffer}
 * @api public
 */
function RingBuffer(capacity) {
    this._elements = new Array(capacity || 64);
    this._first = 0;
    this._end = 0;
    this._size = 0;
}

/**
 * Returns the size of the queue.
 *
 * @return {Number}
 * @api public
 */
Object.defineProperty(RingBuffer.prototype, "size", { get: function() {
    return this._size;
}});

/**
 * Returns the capacity of the ring buffer.
 *
 * @return {Number}
 * @api public
 */
Object.defineProperty(RingBuffer.prototype, "capacity", { get: function() {
    return this._elements.length;
}});

/**
 * Returns whether the ring buffer is empty or not.
 *
 * @return {Boolean}
 * @api public
 */
Object.defineProperty(RingBuffer.prototype, "isEmpty", { get: function() {
    return this.size === 0;
}});

/**
 * Returns whether the ring buffer is full or not.
 *
 * @return {Boolean}
 * @api public
 */
Object.defineProperty(RingBuffer.prototype, "isFull", { get: function() {
    return this.size === this.capacity;
}});

/**
 * Peeks at the top element of the queue.
 *
 * @return {Object}
 * @throws {Error} when the ring buffer is empty.
 * @api public
 */
RingBuffer.prototype.peekFirst = function() {
    if (this.isEmpty) throw new Error('RingBuffer is empty');

    return this._elements[this._first];
};

/**
 * Peeks at the last element of the queue.
 *
 * @return {Object}
 * @throws {Error} when the ring buffer is empty.
 * @api public
 */
RingBuffer.prototype.peekLast = function() {
    if (this.isEmpty) throw new Error('RingBuffer is empty');

    return this._elements[this._end];
};


/**
 * Get element by index
 *
 * @return {Object}
 * @throws {Error} when the ring buffer is empty.
 * @api public
 */
RingBuffer.prototype.get = function(index) {
    if (this.isEmpty) throw new Error('RingBuffer is empty');

    var i = (this._first + index) % this.capacity;
    return this._elements[i];
};

RingBuffer.prototype.getRaw = function(index) {
    if (this.isEmpty) throw new Error('RingBuffer is empty');

    var i = index % this.capacity;
    return this._elements[i];
};


/**
 * Set element by index
 *
 * @return {Object}
 * @throws {Error} when the ring buffer is empty.
 * @api public
 */
RingBuffer.prototype.set = function(index, value) {
    if (this.isEmpty) throw new Error('RingBuffer is empty');

    var i = (this._first + index) % this.capacity;
    this._elements[i] = value;
};


/**
 * Dequeues the top element of the queue.
 *
 * @return {Object}
 * @throws {Error} when the ring buffer is empty.
 * @api public
 */
RingBuffer.prototype.deq = function() {
    var element = this.peekFirst();

    this._size--;
    this._first = (this._first + 1) % this.capacity;

    return element;
};

/**
 * Enqueues the `element` at the end of the ring buffer and returns its new size.
 *
 * @param {Object} element
 * @return {Number}
 * @api public
 */
RingBuffer.prototype.enq = function(element) {
    this._end = (this._first + this.size) % this.capacity;
    this._elements[this._end] = element;

    if (this.isFull) {
        this._first = (this._first + 1) % this.capacity;
    } else {
        this._size++;
    }

    return this.size;
};

/**
 * Expose `RingBuffer`.
 */
if (typeof global !== "undefined") {
    module.exports = RingBuffer;
}
