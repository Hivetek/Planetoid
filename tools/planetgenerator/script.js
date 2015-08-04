var planetConfig = {
    waves:  5,
    minFreq: 1,
    maxFreq: 20,
    maxAmplitude: 5,
    minRadius: 180,
    maxRadius: 220,
    x: 400,
    y: 400
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

Planet.prototype.draw = function(ctx, resolution){
    ctx.beginPath();

    for(var a = 0; a < Math.PI * 2; a += (Math.PI*2)/resolution){
        var r = this.getHeight(a);
        var x = this.x + Math.cos(a + this.rotation)*r;
        var y = this.y + Math.sin(a + this.rotation)*r;
        if(a === 0){
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.fill();

    for(var i = 0; i < this.hulls.length; i++){
        ctx.beginPath();
        for(var n = 0; n < this.hulls[i].points.length; n++){
            if(n === 0){
                ctx.moveTo(this.hulls[i].points[n].x, this.hulls[i].points[n].y);
            } else {
                ctx.lineTo(this.hulls[i].points[n].x, this.hulls[i].points[n].y);
            }
        }
        ctx.closePath();
        ctx.stroke();
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
    //planet.rotation += (Math.PI*2)/600;
    planet.draw(ctx, 180);

    requestAnimFrame(function() {
        loop();
    });
}

/*
for(var i = 0; i < 360; i+=10){

    r = 170 + Math.random()*60;
    var a = i * Math.PI/180;
    var cx = canvas.width/2 + Math.cos(a) * r;
    var cy = canvas.height/2 + Math.sin(a) * r;

    generateHull(cx, cy);
}*/

/*ctx.strokeStyle = "#00FF00";
for(var i = 0; i < waveFreqs.length; i++){
    ctx.beginPath();

    for(var a = 0; a < Math.PI * 2; a += 0.01){
        var r = 200 + Math.cos(a * waveFreqs[i]) * waveAmps[i];
        var x = canvas.width/2 + Math.cos(a)*r;
        var y = canvas.height/2 + Math.sin(a)*r;
        if(a === 0){
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();
    ctx.stroke();
}*/

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

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#FF0000";

var planet = new Planet(planetConfig);

loop();