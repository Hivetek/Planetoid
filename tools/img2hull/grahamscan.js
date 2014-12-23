/***************************************************/
/************** GRAHAM SCAN ALGORITHM **************/
/***************************************************/
/********** Written by Thomas T. Sørensen **********/
/***************************************************/
/********************** 2014 ***********************/
/****************  GPL V2 Licensed *****************/
/****** Source: github.com/ninjinx/Graham-Scan *****/
/***************************************************/

function distance(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist;
}

function crossProduct(p1, p2, p3) {
    var v1x = p1.x - p2.x;
    var v1y = p1.y - p2.y;

    var v2x = p3.x - p2.x;
    var v2y = p3.y - p2.y;

    var d = (v1x * v2y) - (v1y * v2x);
    return d;
}

function grahamScan(points) {
    if (points.length >= 3) {
        var p = [
            {
                x: points[0].x,
                y: points[0].y,
                a: 0,
                d: 0
            }
        ];

        var start = 0;
        //Find point with lowest y
        for (var i = 1; i < points.length; i++) {
            if (points[i].y < p[0].y) {
                p[0].x = points[i].x;
                p[0].y = points[i].y;
                start = i;
            }
        }

        //Copy the rest of the points to the array and find the angle
        for (var i = 0; i < points.length; i++) {
            if (i !== start) { //Don't copy the starting point again
                p.push({
                    x: points[i].x,
                    y: points[i].y,
                    a: Math.atan2(p[0].y - points[i].y, p[0].x - points[i].x),
                    d: distance(points[0].x, points[0].y, points[i].x, points[i].y)
                });
            }
        }

        //Sort by angle
        function sort(a, b) {
            if (a.a < b.a) {
                return -1;
            } else if (a.a > b.a) {
                return 1;
            } else {
                if (a.d < b.d) {
                    return -1;
                } else if (a.d > b.d) {
                    return 1;
                }
            }
            return 0;
        }
        p.sort(sort);

        var completed = false;

        while (!completed) {
            if ((p.length) <= 3) {
                completed = true;
                break;
            }

            for (var i = 0; i < p.length; i++) {
                var a = i - 1;
                var b = i;
                var c = i + 1;

                if (a < 0) {
                    a += p.length;
                }

                if (c > p.length - 1) {
                    b -= p.length;
                }

                if (c === p.length - 1) {
                    completed = true;
                    break;
                } else {
                    if (crossProduct(p[a], p[b], p[c]) >= 0) {
                        p.splice(b, 1);
                        break;
                    }
                }
            }
        }

        return p;
    } else {
        return points;
    }
}