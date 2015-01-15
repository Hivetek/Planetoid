// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var VectorMath = require('./vectorMath.js');
}

function Player(o, game) {
    this.x = o.x || 0;
    this.y = o.y || -2300;
    this.fuel = o.fuel || 100;
    this.vx = o.vx || 0;
    this.vy = o.vy || 0;
    this.grounded = o.grounded || false;
    this.game = game;
}

Player.prototype.update = function(input, prevInput) {
    var gravX = config.game.planetX - this.x;
    var gravY = config.game.planetY - this.y;
    var gravity = {
        x: gravX,
        y: gravY
    };
    var d = VectorMath.magnitude(gravity);
    gravity = VectorMath.scale(gravity, 1 / d);
    if (d > 0) {
        this.vx += gravity.x * config.game.player.mass;
        this.vy += gravity.y * config.game.player.mass;
    }
    if (d <= config.game.planetSize + config.game.player.r + 1) { //on the ground
        this.grounded = true;
        if (this.fuel < 100)
            this.fuel += config.game.player.rechargeRate;

        if (this.fuel > 100)
            this.fuel = 100;

        var m = (config.game.planetSize + config.game.player.r) - d;
        this.x -= gravity.x * m;
        this.y -= gravity.y * m;


        var speedVector = VectorMath.project({x: this.vx, y: this.vy}, {x: -gravity.y, y: gravity.x});
        this.vx = speedVector.x;
        this.vy = speedVector.y;

        this.vx += config.game.player.landAccel * gravity.y * (input.keys.right - input.keys.left);
        this.vy += config.game.player.landAccel * gravity.x * (input.keys.left - input.keys.right);
        this.vx -= this.vx * config.game.player.friction;
        this.vy -= this.vy * config.game.player.friction;
        if (input.keys.up && !prevInput.keys.up)
            this.jump(gravity);
    } else { //in the air
        this.grounded = false;
        if (input.keys.up && this.fuel > 0)
            this.fuel -= config.game.player.burnRate;

        if (this.fuel < 0)
            this.fuel = 0;

        var horX = gravity.y * (input.keys.right - input.keys.left);
        var horY = gravity.x * (input.keys.left - input.keys.right);
        var vertX = -gravity.x * input.keys.up * (this.fuel > 0);
        var vertY = -gravity.y * input.keys.up * (this.fuel > 0);
        this.vx += horX * config.game.player.thrustSide + vertX * config.game.player.thrustUp;
        this.vy += horY * config.game.player.thrustSide + vertY * config.game.player.thrustUp;
        this.vx -= this.vx * config.game.player.drag;
        this.vy -= this.vy * config.game.player.drag;
    }

    this.x += this.vx;
    this.y += this.vy;
};

Player.prototype.jump = function(gravity) {
    this.vx -= gravity.x * config.game.player.jumpSpeed;
    this.vy -= gravity.y * config.game.player.jumpSpeed;
};

Player.prototype.draw = function(ctx) {
    if (this.grounded)
        ctx.fillStyle = "#00FF00";
    else
        ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.arc(this.x - this.game.cameraX, this.y - this.game.cameraY, config.game.player.r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
};

Player.prototype.export = function() {
    var p = this;
    return {
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        fuel: p.fuel,
        grounded: p.grounded
    };
};

Player.prototype.import = function(obj) {
    var p = this;
    for(var key in obj) {
        if (obj.hasOwnProperty(key) && p.hasOwnProperty(key)) {
            p[key] = obj[key];
        }
    }
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
