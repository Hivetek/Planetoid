var primus;

var keys = [];
var canvas, ctx;
var fps = 60;
var pmx, mx, pmy, my, newmx, newmy;
var lmd, rmd, plmd, prmd;

var lastTime;
var deltaTime;
var timeScale;
var paused;


var cube_server = {
    x: 0,
    y: 0
};

function init() {
    // Init shared
    _shared = shared(new RingBuffer(config.inputBufferSize));

    update.input(function(oldInput, newInput) {
        newInput.mouse = {};
        newInput.keyboard = {};

        newInput.mouse.x = newmx;
        newInput.mouse.y = newmy;
        
        newInput.keyboard.left = !!keys[37];
        newInput.keyboard.up = !!keys[38];
        newInput.keyboard.right = !!keys[39];
        newInput.keyboard.down = !!keys[40];

        // Controls
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

        return newInput;
    });

    canvas = document.getElementById('canvas');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx = canvas.getContext('2d');

    input.mouse.x = pmx = mx = newmx = canvas.width / 2;
    input.mouse.y = pmy = my = newmy = canvas.width / 2;

    lmd = rmd = false;
    
    lastTime = Date.now();
    timeScale = 1.0;

    paused = false;

    $(window).mousemove(function(event) {
        newmx = (event.pageX - canvas.offsetLeft) || newmx;
        newmy = (event.pageY - canvas.offsetTop) || newmy;
    });

    requestAnimFrame(function() {
        loop();
    });
}

function loop() {
    //console.time("loop");
    deltaTime = getTime() - lastTime;
    timeScale = deltaTime / (1000 / fps);

    if (!paused)
        update(state, undefined, primus);
    
    draw();
    
    lastTime = getTime();
    
    //console.timeEnd("loop");
    requestAnimFrame(function() {
        loop();
    });
}




function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fillText('Prediction (client side)', 10, 20);
    ctx.fillStyle = 'rgba(0,0,255,0.5)';
    ctx.fillText('Actual (server side)', 10, 30);

    var w = 20;
    var w2 = w / 2;

    ctx.beginPath();
    ctx.arc(state.cube.x, state.cube.y, 10, 0, Math.PI*2, false);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(state.cube.x, state.cube.y, 10, 0, Math.PI*2, false);
    ctx.fillStyle = 'rgba(0,0,255,0.5)';
    ctx.fill();
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


function primus_init() {
    // Load Primus client library
    var base_url = config.protocol + "://" + config.hostname + ":" + config.port;
    var primus_lib_url = base_url + "/primus/primus.js";
    $.getScript(primus_lib_url).done(function() {
        // Instantiate Primus connection
        primus = new Primus(base_url);

        primus.on("open", function() {
            //console.log("Connection opened");
            init();
        });

        primus.on("init", function(data) {
            console.log("Initial state:");
            var c = data["cube"];
            console.log(c);
            state = data;
            cube_server.x = c.x;
            cube_server.y = c.y;
        });

        primus.on("update", function(data) {
            var c = data["cube"];
            state = data;
            cube_server.x = c.x;
            cube_server.y = c.y;
        });
    }).fail(function(jqxhr, settings, exception) {
        console.error("Could not load Primus client library: " + primus_lib_url);
    });
}

function sqr(x) {
    return x*x;
}

$(document).ready(function(){
    // config is now available
    primus_init();
});
