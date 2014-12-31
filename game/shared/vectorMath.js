var VectorMath = {};

VectorMath.dot = function(v1, v2) {
    return (v1.x * v2.x) + (v1.y * v2.y);
};

VectorMath.magnitude = function(v1) {
    return Math.sqrt((v1.x * v1.x) + (v1.y * v1.y));
};

VectorMath.argument = function(v1) {
    return Math.atan2(v1.y, v1.x);
};

VectorMath.angle = function(v1, v2) {
    var d = VectorMath.dot(v1, v2);
    var m1 = VectorMath.magnitude(v1);
    var m2 = VectorMath.magnitude(v2);
    return (d / (m1 * m2));
};

VectorMath.add = function(v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
};

VectorMath.subtract = function(v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
};

VectorMath.scale = function(v, r) {
    return {
        x: v.x * r,
        y: v.y * r
    };
};

VectorMath.project = function(v1, v2) {
    var m = VectorMath.magnitude(v2);
    var d = VectorMath.dot(v1, v2) / (m * m);
    return VectorMath.scale(v2, d);
};

VectorMath.hat = function(v1) {
    return {
        x: -v1.y,
        y: v1.x
    };
};

VectorMath.multiply = function(v1, v2) {
    return {
        x: (v1.x * v2.x) - (v1.y * v2.y),
        y: (v1.x * v2.y) + (v1.y * v2.x)
    };
};

VectorMath.divide = function(v1, v2) {

};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = VectorMath;
}
