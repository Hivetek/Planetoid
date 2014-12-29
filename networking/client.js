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

var input = {
    mouse: {
        left: false,
        right: false,
        x: 0,
        y: 0
    }
};

var state = {
    cube: {
        x: 0,
        y: 0
    }
};


var cube_server = {
    x: state.cube.x,
    y: state.cube.y
};

function init() {
    // Init shared
    shared = shared(new RingBuffer(config.inputBufferSize));

    canvas = document.getElementById('canvas');
    var offset = 5;
    canvas.width = $(document).width()-offset;
    canvas.height = $(document).height()-offset;
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
        update(state);
    
    draw();
    
    lastTime = getTime();
    
    //console.timeEnd("loop");
    requestAnimFrame(function() {
        loop();
    });
}

function update(state) {
    var input = updateInput();
    primus.send("input", input);
    var oldState = state;
    var state = updateState(oldState, input);
}

function updateInput() {

    input.mouse.x = newmx;
    input.mouse.y = newmy;

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

    return input;
}

function updateState(s, input, time) {
    var newState = {};
    newState.cube = {x:0, y:0};

    // Actual updating
    var vx = input.mouse.x-s.cube.x;
    var vy = input.mouse.y-s.cube.y;
    var l = Math.sqrt(sqr(vx) + sqr(vy));
    l = Math.max(l, 0.1);
    var mag = Math.min(5, l);
    newState.cube.x += (mag/l) * vx;
    newState.cube.y += (mag/l) * vy;

    return newState;
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
    ctx.rect(state.cube.x - w2, state.cube.y - w2, w, w);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(cube_server.x - w2, cube_server.y - w2, w, w);
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
            state.cube.x = c.x;
            state.cube.y = c.y;
            cube_server.x = c.x;
            cube_server.y = c.y;
        });

        primus.on("update", function(data) {
            var c = data["cube"];
            state.cube.x = c.x;
            state.cube.y = c.y;
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
