var keys = [];

var planetConfig = {
    layers: 5,
    persistence: 0.7,
    hulls: 120,
    minHullSize: 5,
    maxHullSize: 60,
    amplitude: 300,
    minRadius: 3600,
    maxRadius: 4200,
    x: 0,
    y: 0
}

var camera = {
    x: 0,
    y: -4000,
    rotation: 0,
    zoom: 1.0,
    width: 800,
    height: 800
}

function Hull(x1, y1, points, radius){
    this.points = [];
    this.x = x1;
    this.y = y1;
    this.radius = 0;

    for(var i = 0; i < points; i++){
        var r = Math.seedRandom()*radius;
        var a = Math.seedRandom()*Math.PI*2;
        var x = x1 + Math.cos(a)*r;
        var y = y1 + Math.sin(a)*r;
        this.points[i] = {
            x: x,
            y: y
        }
    }

    this.points = grahamScan(this.points);
    for(var i = 0; i < this.points.length; i++){
        var dx = this.points[i].x - this.x;
        var dy = this.points[i].y - this.y;
        var r = Math.sqrt(dx*dx + dy*dy);
        this.radius = Math.max(this.radius, r);
    }
}

function Planet(config){
    this.points = [];
    this.x = config.x;
    this.y = config.y;
    this.radius = config.minRadius + Math.seedRandom()*(config.maxRadius-config.minRadius);

    this.hulls = [];

    //Fill the noise layers
    for(var l = 0; l < config.layers; l++){
        var f = 8*Math.pow(2, l);
        var a = Math.pow(config.persistence, l)*config.amplitude;
        this.points[l] = {
            h: [f]
        };
        for(var i = 0; i < f; i++){
            this.points[l].h[i] = -a + Math.seedRandom()*a*2;
        }
    }

    for(var i = 0; i < config.hulls; i++){
        var a = Math.seedRandom()*Math.PI*2;
        var r = this.getHeight(a);
        var x = this.x + Math.cos(a)*r;
        var y = this.y + Math.sin(a)*r;
        this.hulls[i] = new Hull(x, y, 64, config.minHullSize + Math.seedRandom()*(config.maxHullSize - config.minHullSize));
    }
}

Planet.prototype.getHeight = function(angle){
    var r = this.radius;

    //Loop through all layers of noise
    for(var i = 0; i < this.points.length; i++) {
        var n = this.points[i].h.length; //Number of samples in this layer of noise
        var a = angle%(Math.PI*2/n);
        //P1 and P2 are the two points that is being sampled between
        var p1 = Math.floor(angle / (Math.PI * 2 / n));
        var p2 = p1 + 1;
        if (p2 >= n)
            p2 = 0;

        var w = a/(Math.PI * 2 / n); //Weighting for interpolation
        var dr = cosineInterpolation(this.points[i].h[p1], this.points[i].h[p2], w); //Do a cosine interpolation between the two points
        r += dr;
    }
    return r;
}

Planet.prototype.getPolygon = function(resolution){
    var polygon = [];
    var i = 0;
    for(var a = 0; a < Math.PI * 2; a += (Math.PI*2)/resolution){
        var r = this.getHeight(a);
        var x = this.x + Math.cos(a)*r;
        var y = this.y + Math.sin(a)*r;
        polygon[i] = {x: x, y: y};
        i++;
    }
    return polygon;
}

Planet.prototype.draw = function(ctx, resolution){
    ctx.fillStyle = "#8A8A8A";
    ctx.strokeStyle = "#464646";
    ctx.lineWidth = 1*camera.zoom;

    for(var i = 0; i < this.hulls.length; i++) {
        var coords = transformPoint(this.hulls[i].x, this.hulls[i].y);
        var r = this.hulls[i].radius*camera.zoom;
        if (coords.x > -r && coords.x < camera.width + r && coords.y > -r && coords.y < camera.height + r) {
            if(this.hulls[i].radius * camera.zoom > 1) {
                drawPolygon(this.hulls[i].points);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    ctx.fillStyle = "#5C483A";
    ctx.strokeStyle = "#462B19";
    drawPolygon(this.getPolygon(resolution));
    ctx.fill();
    ctx.stroke();
}

function generateHull(x1, y1) {
    var points = [];
    for(var i = 0; i < 64; i++){
        var r = Math.seedRandom()*48;
        var a = Math.seedRandom()*Math.PI*2;
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
    planet.draw(ctx, Math.round(720*camera.zoom));
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

function transformPoint(x, y){
    var x1 = camera.zoom*((x-camera.x)*Math.cos(camera.rotation) - (y-camera.y)*Math.sin(camera.rotation))+camera.width/2;
    var y1 = camera.zoom*((x-camera.x)*Math.sin(camera.rotation) + (y-camera.y)*Math.cos(camera.rotation))+camera.height/2;
    var p = {x: x1, y: y1};
    return p;
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