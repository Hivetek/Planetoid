var keys = [];
var canvas, ctx;
var fps = 60;
var pmx, mx, pmy, my, newmx, newmy;
var lmd, rmd, plmd, prmd;

var lastTime;
var deltaTime;
var timeScale;
var paused;

function init() {
    canvas = document.getElementById('canvas');
    canvas.width = mapSize;
    canvas.height = mapSize;
    ctx = canvas.getContext('2d');

    pmx = mx = newmx = canvas.width / 2;
    pmy = my = newmy = canvas.width / 2;

    lmd = rmd = false;
    
    lastTime = Date.now();
    timeScale = 1.0;

    paused = false;

    requestAnimFrame(function() {
        loop();
    });
}

function loop() {
    //console.time("loop");
    deltaTime = getTime() - lastTime;
    timeScale = deltaTime / (1000 / fps);

    if (!paused)
        update();
    
    draw();
    
    lastTime = getTime();
    
    //console.timeEnd("loop");
    requestAnimFrame(function() {
        loop();
    });
}

function update() {
    pmx = mx;
    pmy = my;
    mx = newmx;
    my = newmy;

    if (!plmd && lmd) {
        leftClick();
    }

    if (!prmd && rmd) {
        rightClick();
    }

    plmd = lmd;
    prmd = rmd;
}

function draw() {
    ctx.clearRect(0, 0, mapSize, mapSize);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = "4";
    for (var i = 0; i < players.length; i++) {
        players[i].draw(ctx);
    }

    for (var i = 0; i < explosions.length; i++) {
        explosions[i].draw(ctx);
    }
}

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
}

function leftClick() {
}

function rightClick() {
}

function getTime() {
    //return performance.now() + startTime; //highest precision
    return Date.now(); //Higest performance
}

/*window.oncontextmenu = function(event) {
 event.preventDefault();
 return false;
 };*/

$(window).mousemove(function(event) {
    newmx = (event.pageX - canvas.offsetLeft) || newmx;
    newmy = (event.pageY - canvas.offsetTop) || newmy;
});

$(window).mouseup(function(event) {
    if (event.button === 0) {
        lmd = false;
    } else if (event.button === 2) {
        rmd = false;
    }
});

$(window).mousedown(function(event) {
    if (event.button === 0) {
        lmd = true;
    } else if (event.button === 2) {
        rmd = true;
    }
});

window.addEventListener('keydown', function(event) {
    keys[event.keyCode] = true;
}, false);
window.addEventListener('keyup', function(event) {
//console.log(event.keyCode);
    keys[event.keyCode] = false;
}, false);

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000.0 / 60);
            };
})();