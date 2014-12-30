/**
 * Core library
 */
Core = {};
Core.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj))
};


// Export module to either client or server
if (typeof global === "undefined") {
    window.Core = Core;
} else {
    module.exports = Core;
}
