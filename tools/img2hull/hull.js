function Hull(x, y, points) {
    this.centerX = x;
    this.centerY = y;
    this.r = 0;
    this.points = points;
    this.init(x, y);
}

Hull.prototype.init = function() {
    var d = 0;
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].x -= this.centerX;
        this.points[i].y -= this.centerY;

        var x = this.points[i].x;
        var y = this.points[i].y;
        x *= x;
        y *= y;
        if (x + y > d)
            d = x + y;
    }
    this.r = Math.sqrt(d);
};