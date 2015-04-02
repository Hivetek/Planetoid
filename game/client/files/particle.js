/* EXAMPLE CONF
 * spread
 * speed
 * speedVar
 * mass
 * massVar
 * r
 * sizeVar
 * brownian
 * drag
 * sizeVar
 * lifetime
 * lifetimeVar
 * growth
 * growthVar
 * color
 * physics = (0, 1, 2) - 0 = no-clip, 1 = collide with ground only, 2 = collide with ground and players
 */

function Particle(conf, x, y, dir, game) {
    var speed = conf.speed * (1 - conf.speedVar / 2 + Math.random() * conf.speedVar);

    this.pos = {};
    this.dir = dir - conf.spread / 2 + Math.random() * conf.spread;
    this.pos.x = x;
    this.pos.y = y;
    this.a = {x: 0, y: 0};                 //Acceleration
    this.ppos = {};
    this.ppos.x = this.pos.x - Math.cos(this.dir) * speed;
    this.ppos.y = this.pos.y - Math.sin(this.dir) * speed;
    this.mass = conf.mass * (1 - conf.massVar / 2 + Math.random() * conf.massVar);
    this.r = conf.r * (1 - conf.sizeVar / 2 + Math.random() * conf.sizeVar);
    this.lifetime = conf.lifetime * (1 - conf.lifetimeVar / 2 + Math.random() * conf.lifetimeVar);
    this.growth = conf.growth * (1 - conf.growthVar / 2 + Math.random() * conf.growthVar);
    this.age = 0;
    this.brownian = conf.brownian;
    this.physics = conf.physics;
    this.color = conf.color;
    this.drag = conf.drag;
    this.alive = true;

    this.game = game;
}

Particle.prototype.verlet = function(dt) {
    var newx = 2 * this.pos.x - this.ppos.x + this.a.x * dt * dt;
    var newy = 2 * this.pos.y - this.ppos.y + this.a.y * dt * dt;
    this.ppos.x = this.pos.x;
    this.ppos.y = this.pos.y;
    this.pos.x = newx;
    this.pos.y = newy;
};

Particle.prototype.update = function() {
    this.a.x = 0;
    this.a.y = 0;

    this.age += config.game.physTick;
    if (this.age > this.lifetime)
        this.alive = false;

    if (this.alive) {
        this.r *= (this.growth/100) * (config.game.physTick/1000);
        var vx = this.pos.x - this.ppos.x;
        var vy = this.pos.y - this.ppos.y;
        var pt = config.game.physTick / 1000;
        pt = pt * pt;

        var gravX = config.game.planetX - this.pos.x;
        var gravY = config.game.planetY - this.pos.y;
        var gravity = {
            x: gravX,
            y: gravY
        };
        var d = VectorMath.magnitude(gravity);
        gravity = VectorMath.scale(gravity, 1 / d);

        if (d > 0) {
            this.a.x += gravity.x * config.game.gravity * this.mass;
            this.a.y += gravity.y * config.game.gravity * this.mass;
        }

        if (this.physics > 0) {
            if (d <= config.game.planetSize + this.r) {
                var m = (config.game.planetSize + config.game.player.r) - d;
                this.pos.x -= gravity.x * m;
                this.pos.y -= gravity.y * m;
            }
        }

        this.a.x -= vx * this.drag / pt;
        this.a.y -= vy * this.drag / pt;

        this.a.x += Math.random() * this.brownian / pt;
        this.a.y += Math.random() * this.brownian / pt;

        this.verlet(conf.game.physTick);
    }
};

Particle.prototype.draw = function(ctx) {
    var color = "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+","+(this.color.a*(this.age/this.lifetime))+")";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.pos.x - this.game.cameraX, this.pos.y - this.game.cameraY, this.r, 0, 2 * Math.PI, false);
    ctx.fill();
};