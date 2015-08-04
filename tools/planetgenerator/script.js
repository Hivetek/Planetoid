var keys = [];

var planetConfig = {
    waves:  5,
    minFreq: 1,
    maxFreq: 20,
    maxAmplitude: 5,
    minRadius: 180,
    maxRadius: 220,
    x: 0,
    y: 0
}

var camera = {
    x: 0,
    y: 0,
    rotation: 0,
    zoom: 1.0,
    width: 800,
    height: 800
}

function Hull(x1, y1, points, radius){
    this.points = [];
    this.x = x1;
    this.y = y1;

    for(var i = 0; i < points; i++){
        var r = Math.random()*radius;
        var a = Math.random()*Math.PI*2;
        var x = x1 + Math.cos(a)*r;
        var y = y1 + Math.sin(a)*r;
        this.points[i] = {
            x: x,
            y: y
        }
    }

    this.points = grahamScan(this.points);
}

function Planet(config){
    this.x = config.x;
    this.y = config.y;
    this.rotation = 0;
    this.waves = [];
    this.radius = config.minRadius + Math.random()*(config.maxRadius-config.minRadius);
    this.delta;

    this.hulls = [];

    for(var i = 0; i < config.waves; i++){
        var freq = config.minFreq+Math.random()*(config.maxFreq-config.minFreq);
        var amp = Math.random()*config.maxAmplitude;
        var phase = Math.random()*Math.PI*2;

        this.waves.push({
            frequency: freq,
            amplitude: amp,
            phaseshift: phase
        });
    }

    var h1 = 0;
    var h2 = 0;
    for(var i = 0; i < this.waves.length; i++){
        h1 += Math.cos(this.waves[i].phaseshift)*this.waves[i].amplitude;
        h2 += Math.cos(Math.PI*2*this.waves[i].frequency + this.waves[i].phaseshift)*this.waves[i].amplitude;
    }
    this.delta = h2 - h1;

    for(var i = 0; i < 100; i++){
        var a = Math.random()*Math.PI*2;
        var r = this.getHeight(a);
        var x = this.x + Math.cos(a)*r;
        var y = this.y + Math.sin(a)*r;
        this.hulls[i] = new Hull(x, y, 64, 10);
    }
}

Planet.prototype.getHeight = function(angle){
    var r = this.radius;
    r -= (angle*this.delta)/(Math.PI*2);
    for(var i = 0; i < this.waves.length; i++){
        r += Math.cos(angle*this.waves[i].frequency + this.waves[i].phaseshift)*this.waves[i].amplitude;
    }
    return r;
}

Planet.prototype.getPolygon = function(resolution){
    var polygon = [];
    var i = 0;
    for(var a = 0; a < Math.PI * 2; a += (Math.PI*2)/resolution){
        var r = this.getHeight(a);
        var x = this.x + Math.cos(a + this.rotation)*r;
        var y = this.y + Math.sin(a + this.rotation)*r;
        polygon[i] = {x: x, y: y};
        i++;
    }
    return polygon;
}

Planet.prototype.draw = function(ctx, resolution){
    drawPolygon(this.getPolygon(resolution));
    ctx.fill();

    for(var i = 0; i < this.hulls.length; i++){
        drawPolygon(this.hulls[i].points);
        ctx.fill();
    }
}

function generateHull(x1, y1) {
    var points = [];
    for(var i = 0; i < 64; i++){
        var r = Math.random()*48;
        var a = Math.random()*Math.PI*2;
        var x = x1 + Math.cos(a)*r;
        var y = y1 + Math.sin(a)*r;
        points[i] = {
            x: x,
            y: y
        }
    }

    points = grahamScan(points);

    ctx.beginPath();
    for(var i = 0; i < points.length; i++){
        if(i === 0){
            ctx.moveTo(points[i].x, points[i].y);
        } else {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    ctx.closePath();
    ctx.fill();
}

function loop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    planet.draw(ctx, Math.round(180*camera.zoom));
    if(!!keys[37])
        camera.rotation += (Math.PI*2)/600;
    if(!!keys[39])
        camera.rotation -= (Math.PI*2)/600;
    if(!!keys[38])
        camera.zoom *= 1.01;
    if(!!keys[40])
        camera.zoom *= 0.99;

    if(!!keys[188]) {
        camera.x -= Math.cos(-camera.rotation+Math.PI/2)*10/camera.zoom;
        camera.y -= Math.sin(-camera.rotation+Math.PI/2)*10/camera.zoom;
    }
    if(!!keys[79]) {
        camera.x += Math.cos(-camera.rotation+Math.PI/2)*10/camera.zoom;
        camera.y += Math.sin(-camera.rotation+Math.PI/2)*10/camera.zoom;
    }
    if(!!keys[65]) {
        camera.x -= Math.cos(-camera.rotation)*10/camera.zoom;
        camera.y -= Math.sin(-camera.rotation)*10/camera.zoom;
    }
    if(!!keys[69]) {
        camera.x += Math.cos(-camera.rotation)*10/camera.zoom;
        camera.y += Math.sin(-camera.rotation)*10/camera.zoom;
    }

    requestAnimFrame(function() {
        loop();
    });
}

function drawPolygon(points){
    ctx.beginPath();
    for(var i = 0; i < points.length; i++){
        var x = camera.zoom*((points[i].x-camera.x)*Math.cos(camera.rotation) - (points[i].y-camera.y)*Math.sin(camera.rotation))+camera.width/2;
        var y = camera.zoom*((points[i].x-camera.x)*Math.sin(camera.rotation) + (points[i].y-camera.y)*Math.cos(camera.rotation))+camera.height/2;


        if(i === 0){
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000.0 / 60.0);
        };
})();

window.addEventListener('keydown', function(event) {
    console.log(event.keyCode);
    keys[event.keyCode] = true;
}, false);
window.addEventListener('keyup', function(event) {
    keys[event.keyCode] = false;
}, false);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#FF0000";

var planet = new Planet(planetConfig);

loop();