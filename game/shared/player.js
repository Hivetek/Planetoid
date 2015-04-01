// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
    var VectorMath = require('./vectorMath.js');
}

function Player(o, game) {
    if (!this.id) {
        if (o.id) {
            this.id = o.id
        } else {
            throw new TypeError("Player has no id");
        }
    }
    this.pos = {};
    this.pos.x = (o.pos && o.pos.x ? o.pos.x : 0);
    this.pos.y = (o.pos && o.pos.y ? o.pos.y : -2300);
    this.a = o.a || {x: 0, y: 0};                 //Acceleration
    this.m = o.m || config.game.player.mass;    //Mass
    this.fuel = o.fuel || 100;
    this.hp = o.hp || 100;
    this.ppos = {};
    this.ppos.x = (o.ppos && o.ppos.x ? o.ppos.x : this.pos.x);
    this.ppos.y = (o.ppos && o.ppos.y ? o.ppos.y : this.pos.y);
    this.grounded = o.grounded || false;
    this.isAlive = o.isAlive || false;
    this.game = game;
}

Player.prototype.verlet = function(dt) {
    var newx = 2 * this.pos.x - this.ppos.x + this.a.x * dt * dt;
    var newy = 2 * this.pos.y - this.ppos.y + this.a.y * dt * dt;
    this.ppos.x = this.pos.x;
    this.ppos.y = this.pos.y;
    this.pos.x = newx;
    this.pos.y = newy;
};

Player.prototype.update = function(input, prevInput) {
    if (this.hp > 0)
        this.hp -= 0.5;

    if (this.hp <= 0) {
        if (this.isAlive) {
            this.game.events.trigger("player::killed", this.id);
        }
        this.isAlive = false;
    }

    // Don't waste CPU power on updating a dead player
    if (!this.isAlive) return false;

    this.a.x = 0;
    this.a.y = 0;

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
        this.a.x += gravity.x * config.game.gravity;
        this.a.y += gravity.y * config.game.gravity;
    }

    if (d <= config.game.planetSize + config.game.player.r) { //on the ground
        this.grounded = true;
        if (this.fuel < 100)
            this.fuel += config.game.player.rechargeRate * (config.game.physTick / 1000);

        if (this.fuel > 100)
            this.fuel = 100;

        var m = (config.game.planetSize + config.game.player.r) - d;
        this.pos.x -= gravity.x * m;
        this.pos.y -= gravity.y * m;

        //CONTROLS
        if (this.hp > 0) {
            this.a.x += config.game.player.landAccel * gravity.y * (input.keys.right - input.keys.left);
            this.a.y += config.game.player.landAccel * gravity.x * (input.keys.left - input.keys.right);

            if (input.keys.up && !prevInput.keys.up)
                this.jump(gravity);
        }

        this.a.x -= config.game.player.friction * vx / pt;
        this.a.y -= config.game.player.friction * vy / pt;
    } else {//in the air
        this.grounded = false;

        //CONTROLS
        if (this.hp > 0) {
            if (this.fuel > 0) {
                if (input.keys.up)
                    this.fuel -= (config.game.physTick / 1000) * config.game.player.burnRate;
                else if (input.keys.left || input.keys.right)
                    this.fuel -= (config.game.physTick / 1000) * config.game.player.burnRate * (config.game.player.thrustSide / config.game.player.thrustUp);
            }

            if (this.fuel < 0)
                this.fuel = 0;

            var thrustSide = config.game.player.thrustSide * (this.fuel > 0); //Available sideways thrust
            var horX = gravity.y * (input.keys.right - input.keys.left) * thrustSide;
            var horY = gravity.x * (input.keys.left - input.keys.right) * thrustSide;

            var thrustUp = config.game.player.thrustUp - (thrustSide * (input.keys.left || input.keys.right));
            var vertX = -gravity.x * thrustUp * input.keys.up * (this.fuel > 0);
            var vertY = -gravity.y * thrustUp * input.keys.up * (this.fuel > 0);

            var mx = horX + vertX;
            var my = horY + vertY;

            this.a.x += mx;
            this.a.y += my;
        }

        this.a.x -= vx * config.game.player.drag / pt;
        this.a.y -= vy * config.game.player.drag / pt;
    }

    this.verlet(config.game.physTick / 1000);
};

Player.prototype.jump = function(gravity) {
    this.a.x -= gravity.x * config.game.player.jumpSpeed;
    this.a.y -= gravity.y * config.game.player.jumpSpeed;
};

Player.prototype.draw = function(ctx) {
    if (this.hp > 0) {
        ctx.fillStyle = "#FF0000";
        ctx.beginPath();
        ctx.arc(this.pos.x - this.game.cameraX, this.pos.y - this.game.cameraY, config.game.player.r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }
};

Player.prototype.export = function() {
    var g = this.game;
    delete this.game;
    var c = Core.clone(this);
    this.game = g;
    return c;
};

Player.prototype.import = function(obj) {
    var p = this;
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && p.hasOwnProperty(key)) {
            p[key] = obj[key];
        }
    }
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
