var canvas, ctx, w, h;
var CoG = []; //Center of gravity for hulls
var pixels = []; //points for hulls
var convexpoints = [];
var img;

var DRAW_VERTS = false;
var DRAW_EDGES = false;
var min_angle = 5;
var min_dist = 5;

var initialized = false;

var regions = [];

function Pixel(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.checked = false;
    this.group = -1;
    this.edge = false;
}

function PixelGrid(imageData, w, h) {
    this.pixels = [];
    this.w = w;
    this.h = h;
    this.groups = 0;

    //Copy imagedata into pixelgrid data structure
    for (var x = 0; x < this.w; x++) {
        this.pixels[x] = [];
        for (var y = 0; y < this.h; y++) {
            var i = (w * y) + x;
            i *= 4;

            var c = "" + imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] + imageData.data[i + 3];

            this.pixels[x][y] = new Pixel(x, y, c);
        }
    }

    this.findRegions();

    ctx.fillStyle = "#FF00FF";
    for (var x = 0; x < this.w; x++) {
        for (var y = 0; y < this.h; y++) {
            if (this.pixels[x][y].edge)
                ctx.fillRect(x, y, 1, 1);
        }
    }
}

PixelGrid.prototype.isEdge = function(x, y) {
    var c = this.pixels[x][y].color;

    //Check if all adjacent pixels are the same color as this one
    if (this.getPixelColor(x - 1, y) !== c) {
        return true;
    } else if (this.getPixelColor(x + 1, y) !== c) {
        return true;
    } else if (this.getPixelColor(x, y - 1) !== c) {
        return true;
    } else if (this.getPixelColor(x, y + 1) !== c) {
        return true;
    } else if (this.getPixelColor(x - 1, y - 1) !== c) {
        return true;
    } else if (this.getPixelColor(x + 1, y + 1) !== c) {
        return true;
    } else if (this.getPixelColor(x - 1, y + 1) !== c) {
        return true;
    } else if (this.getPixelColor(x + 1, y - 1) !== c) {
        return true;
    } else {
        return false;
    }
};

PixelGrid.prototype.getPixelColor = function(x, y) {
    var c = "0000";

    //Return "0000" if pixels are outside the image
    if (x > 0 && x < this.w && y > 0 && y < this.h)
        c = this.pixels[x][y].color;

    return c;
};

PixelGrid.prototype.findRegions = function() {
    for (var x = 0; x < this.w; x++) {
        for (var y = 0; y < this.h; y++) {
            if (!this.pixels[x][y].checked) {
                this.pixels[x][y].checked = true;
                if (this.pixels[x][y].color !== "0000") {
                    if (this.isEdge(x, y))
                        this.pixels[x][y].edge = true;
                }
            }
        }
    }
};

PixelGrid.prototype.findNeighbors = function(x, y, c) {
    if (!this.pixels[x][y].checked) {
        this.pixels[x][y].checked = true;
        var c1 = this.pixels[x][y].color;

        if (c === c1) {
            console.log("checked " + x + " " + y);
            this.pixels[x][y].group = this.groups;

            var neighbors = [];
            if (x > 0)
                this.findNeighbors(x - 1, y, c1);
            if (x < this.w)
                this.findNeighbors(x + 1, y, c1);
            if (y > 0)
                this.findNeighbors(x, y - 1, c1);
            if (x < this.h)
                this.findNeighbors(x, y + 1, c1);
        }
    }
};

function getPixel(data, w, x, y) {
    var i = (w * y) + x;
    i *= 4;

    var pixel = {
        r: data.data[i],
        g: data.data[i + 1],
        b: data.data[i + 2],
        a: data.data[i + 3]
    };

    return pixel;
}

function findNeighbors(data, x, y) {
    var p = getPixel(data, w, x, y);

}
;

function findRegions() {

}
;

function pixelCompare(p1, p2) {
    return(p1.r === p2.r && p1.g === p2.g && p1.b === p2.b && p1.a === p2.a);
}

function makeVector(x1, y1, x2, y2) {
    var mag = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    mag = Math.sqrt(mag);

    var v = {
        x: x2 - x1,
        y: y2 - y1,
        m: mag
    };

    return v;
}

function simplify(points, angle, dist) {
    var index = -1;
    var l = points.length;
    do {
        for (var i = 0; i < l; i++) {
            var i2 = i - 1;
            if (i2 < 0)
                i2 += l;
            i3 = (i + 1) % l;
            x1 = points[i2].x;
            y1 = points[i2].y;
            x2 = points[i].x;
            y2 = points[i].y;
            x3 = points[i3].x;
            y3 = points[i3].y;
            var v1 = makeVector(x2, y2, x1, y1);
            var v2 = makeVector(x2, y2, x3, y3);
            var dot = v1.x * v2.x + v1.y * v2.y;
            var a = dot / (v1.m * v2.m);
            a = Math.acos(a) * (180 / Math.PI);
            if (a > 180 - angle || (v1.m < dist || v2.m < dist)) {
                index = i;
                i = l; //break out of for-loop
            } else {
                index = -1;
            }
        }

        if (index >= 0) {
            points.splice(index, 1);
            l = points.length;
        }
    } while (index >= 0 && l > 3)
    return points;
}

function updatePoints() {
    min_angle = document.getElementById('angle_input').value;
    min_dist = document.getElementById('dist_input').value;

    $("#angle_label").html("Min. angle: " + min_angle + "°");
    $("#dist_label").html("Min. distance: " + min_dist + "px");

    if (initialized) {
        drawImage();
        img2hull();
    }
}

function drawImage() {
    w = img.width;
    h = img.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0);
}

function img2hull() {
    //Clear arrays
    CoG = [];
    pixels = [];
    convexpoints = [];

    var data;

    data = ctx.getImageData(0, 0, w, h);

    var grid = new PixelGrid(data, w, h);
    console.log(grid);

    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var p = getPixel(data, w, x, y);
            if (p.a > 120) {
                var col = p.r + "," + p.g + "," + p.b + "," + p.a;
                if (CoG[col]) {
                    CoG[col].x += x;
                    CoG[col].y += y;
                    CoG[col].count++;
                } else {
                    CoG[col] = {
                        x: x,
                        y: y,
                        count: 1
                    };
                }

                var pn, pe, ps, pw;
                if (x > 0)
                    pw = getPixel(data, w, x - 1, y);
                else
                    pw = p;
                if (x < w - 1)
                    pe = getPixel(data, w, x + 1, y);
                else
                    pe = p;
                if (y < h - 1)
                    ps = getPixel(data, w, x, y + 1);
                else
                    ps = p;
                if (y > 0)
                    pn = getPixel(data, w, x, y - 1);
                else
                    pn = p;
                if (!pixelCompare(p, pn) || !pixelCompare(p, ps) || !pixelCompare(p, pe) || !pixelCompare(p, pw)) {
                    if (pixels[col]) {
                        pixels[col].push({x: x, y: y});
                    } else {
                        pixels[col] = [{x: x, y: y}];
                    }
                }
            }
        }
    }

    var i = 0;
    for (var key in CoG) {
        CoG[key].x /= CoG[key].count;
        CoG[key].y /= CoG[key].count;
        convexpoints[i] = simplify(grahamScan(pixels[key]), min_angle, min_dist);
        i++;
    }


    var verts = 0;
    for (var i = 0; i < convexpoints.length; i++) {
        ctx.beginPath();
        for (var n = 0; n < convexpoints[i].length; n++) {
            verts++;
            if (DRAW_EDGES) {
                if (n === 0)
                    ctx.moveTo(convexpoints[i][n].x, convexpoints[i][n].y);
                else
                    ctx.lineTo(convexpoints[i][n].x, convexpoints[i][n].y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }

    if (DRAW_VERTS) {
        for (var i = 0; i < convexpoints.length; i++) {
            for (var n = 0; n < convexpoints[i].length; n++) {
                ctx.beginPath();
                ctx.arc(convexpoints[i][n].x, convexpoints[i][n].y, 4, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }
    }

    $("#vertcount").html("Vertices: " + verts);
    $("#hullcount").html("Hulls: " + convexpoints.length);
}

function exportJSON() {
    if (initialized) {
        var hulls = [];
        var i = 0;
        for (var key in CoG) {
            hulls[i] = new Hull(CoG[key].x, CoG[key].y, convexpoints[i]);
            i++;
        }
        console.log(hulls);
        var json = JSON.stringify(hulls);

        var a = document.createElement('a');
        a.href = 'data:attachment/json,' + json;
        a.target = '_blank';
        a.download = $("#filename").val();

        document.body.appendChild(a);

        a.click();
    }
}

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    img = new Image();

    img.onload = function() {
        drawImage();
        img2hull();
        initialized = true;
    };

    document.getElementById('file').addEventListener('change', handleFileSelect, false);
    document.getElementById('angle_input').addEventListener('change', updatePoints, false);
    document.getElementById('dist_input').addEventListener('change', updatePoints, false);
    document.getElementById('downloadfile').addEventListener('click', exportJSON, false);
}

$(document).ready(function() {
    init();
});