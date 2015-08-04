Math.seed = 0;
Math.originalSeed = 0;

Math.setSeed = function(s){
    Math.originalSeed = s;
    Math.seed = s;
}

Math.seedRandom = function(){
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280;
    return rnd;
}

Math.setSeed(Math.round(Math.random()*100000));

function lerp(a, b, weight){
    //Linear interpolator
    return (1 - weight) * a + b * weight;
}