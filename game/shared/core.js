/**
 * Core library
 */
Core = {};
Core.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj))
};


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Core;
}
