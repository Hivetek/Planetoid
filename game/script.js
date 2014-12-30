var keys = [];
var canvas, ctx;
var fps = 60;
var pmx, mx, pmy, my, newmx, newmy;
var lmd, rmd, plmd, prmd;

var lastTime;
var deltaTime;
var paused;

var player, game;
var drawCalls = [];
var input;

function init() {
    game = {
        gravity: 1.0,
        timescale: 1.0,
        planetSize: 1932, 
        planetX: 960,
        planetY: 2300,
        cameraX: 0,
        cameraY: 0
    };
    input = {
        keyboard: {
            left: false,
            up: false,
            right: false,
            down: false,
            old: {
                left: false,
                up: false,
                right: false,
                down: false
            }
        }
    };
    canvas = document.getElementById('canvas');
    resize();
    ctx = canvas.getContext('2d');

    pmx = mx = newmx = canvas.width / 2;
    pmy = my = newmy = canvas.width / 2;

    player = new Player(mx, 0, game);
    player.vx = 5 - Math.random() * 10;
    player.vy = 5 - Math.random() * 10;

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

    input.keyboard.old.left = input.keyboard.left;
    input.keyboard.old.up = input.keyboard.up;
    input.keyboard.old.right = input.keyboard.right;
    input.keyboard.old.down = input.keyboard.down;

    input.keyboard.left = !!keys[37] || !!keys[65];
    input.keyboard.up = !!keys[38] || !!keys[87];
    input.keyboard.right = !!keys[39] || !!keys[68];
    input.keyboard.down = !!keys[40] || !!keys[79];

    if (!plmd && lmd) {
        leftClick();
    }

    if (!prmd && rmd) {
        rightClick();
    }

    player.update(input);
    
    game.cameraX = player.x-canvas.width/2;
    game.cameraY = player.y-canvas.height/2;
    
    plmd = lmd;
    prmd = rmd;
}

function draw() {
    drawCalls = [];
    drawCalls.push(player.draw());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF0000";
    ctx.fillRect(20, 20, player.fuel, 10);

    ctx.strokeStyle = "#000";
    ctx.strokeRect(20, 20, 100, 10);
    
    ctx.fillStyle = "#B2B2B2";
    ctx.fillRect(955-game.cameraX, 200-game.cameraY, 10, 268);
    
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(game.planetX-game.cameraX, game.planetY-game.cameraY, game.planetSize, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc(player.x-game.cameraX, player.y-game.cameraY, player.config.r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
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
    //console.log(event.keyCode);
    keys[event.keyCode] = true;
}, false);
window.addEventListener('keyup', function(event) {
//console.log(event.keyCode);
    keys[event.keyCode] = false;
}, false);
window.addEventListener('resize', resize, false);

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

$(document).ready(function() {
    init();
});
