var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

ctx.fillStyle = "#000000";
ctx.strokeStyle = "#FF0000";
//ctx.arc(canvas.width/2, canvas.height/2, 200, 0, Math.PI*2);
//ctx.fill();

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

for(var i = 0; i < 360; i+=10){

    r = 170 + Math.random()*60;
    var a = i * Math.PI/180;
    var cx = canvas.width/2 + Math.cos(a) * r;
    var cy = canvas.height/2 + Math.sin(a) * r;

    generateHull(cx, cy);
}

var waveFreqs = [];
var waveAmps = [];
var wavePhases = [];

for(var i = 0; i < 10; i++){
    waveFreqs[i] = 1+Math.random()*10;
    waveAmps[i] = Math.random()*5;
    wavePhases[i] = Math.random()*Math.PI*2;
}

var h1 = 0;
var h2 = 0;
for(var i = 0; i < waveFreqs.length; i++){
    h1 += Math.cos(wavePhases[i])*waveAmps[i];
    h2 += Math.cos(Math.PI*2*waveFreqs[i] + wavePhases[i])*waveAmps[i];
}
var delta = h2 - h1;

ctx.beginPath();
for(var a = 0; a < Math.PI * 2; a += 0.01){
    var r = 200 - (delta/(Math.PI*2))*a;
    for(var i = 0; i < waveFreqs.length; i++){
        r += Math.cos(a*waveFreqs[i] + wavePhases[i])*waveAmps[i];
    }
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