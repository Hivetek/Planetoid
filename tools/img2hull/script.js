function init() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var w, h, data;
    var points = [];

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

    img.onload = function() {
        w = img.width;
        h = img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);
        data = ctx.getImageData(0, 0, w, h);
        ctx.fillStyle = "rgb(0,0,0)";

        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var p = getPixel(data, w, x, y);
                if (x == 10 && y == 10)
                    console.log(p);
                if (p.r < 250) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    };

    img.src = "img.png";
}

$(document).ready(function() {
    init();
});