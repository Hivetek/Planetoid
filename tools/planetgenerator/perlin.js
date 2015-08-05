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
console.log(Math.seed);

function lerp(a, b, weight){
    //Linear interpolator
    return (1 - weight) * a + b * weight;
}

function cosineInterpolation(a, b, weight){
    /*var ft  = 1-Math.cos(weight * Math.PI * 0.5);
    return (1 - ft) * a + b * ft;*/
    ft = weight * Math.PI;
    f = (1 - Math.cos(ft)) * .5;

    return  a*(1-f) + b*f;
}