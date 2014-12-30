function Player(x, y, game) {
    this.x = x;
    this.y = y;
    this.fuel = 100;
    this.vx = 0;
    this.vy = 0;
    this.game = game;
    this.config = {
        r: 16,
        mass: 0.5,
        friction: 0.25,
        landSpeed: 8,
        landAccel: 2,
        jumpSpeed: 4,
        thrustSide: 0.3,
        thrustUp: 0.8,
        burnRate: 0.42,
        rechargeRate: 0.84
    };
}

Player.prototype.update = function(input) {
    var gravX = this.game.planetX - this.x;
    var gravY = this.game.planetY - this.y;
    var gravity = {
        x: gravX,
        y: gravY
    };
    var d = VectorMath.magnitude(gravity);
    if (d > 0) {
        gravity = VectorMath.scale(gravity, 1 / d);
        this.vx += gravity.x * this.config.mass;
        this.vy += gravity.y * this.config.mass;
    }

    this.x += this.vx;
    this.y += this.vy;
    if (d < this.game.planetSize + this.config.r) {
        if (!input.keyboard.up && this.fuel < 100)
            this.fuel += this.config.rechargeRate;

        if (this.fuel > 100)
            this.fuel = 100;

        var m = (this.game.planetSize + this.config.r) - d;
        this.x -= gravity.x * m;
        this.y -= gravity.y * m;

        var speedVector = VectorMath.project({x: this.vx, y: this.vy}, {x: -gravity.y, y: gravity.x});
        this.vx = speedVector.x;
        this.vy = speedVector.y;
        if (this.vx > this.config.friction)
            this.vx -= this.config.friction;
        else if (this.vx < -this.config.friction)
            this.vx += this.config.friction;
        else
            this.vx = 0;
        if (this.vy > this.config.friction)
            this.vy -= this.config.friction;
        else if (this.vy < -this.config.friction)
            this.vy += this.config.friction;
        else
            this.vy = 0;
        this.vx += this.config.landAccel * gravity.y * (input.keyboard.right - input.keyboard.left);
        this.vy += this.config.landAccel * gravity.x * (input.keyboard.left - input.keyboard.right);
        if (input.keyboard.up && !input.keyboard.old.up) {//jump
            this.x -= gravity.x;
            this.y -= gravity.y;
            this.vx -= gravity.x * this.config.jumpSpeed;
            this.vy -= gravity.y * this.config.jumpSpeed;
        }
    } else {
        if (input.keyboard.up && this.fuel > 0)
            this.fuel -= this.config.burnRate;

        if (this.fuel < 0)
            this.fuel = 0;

        var horX = gravity.y * (input.keyboard.right - input.keyboard.left);
        var horY = gravity.x * (input.keyboard.left - input.keyboard.right);
        var vertX = -gravity.x * input.keyboard.up * (this.fuel > 0);
        var vertY = -gravity.y * input.keyboard.up * (this.fuel > 0);
        this.vx += horX * this.config.thrustSide + vertX * this.config.thrustUp;
        this.vy += horY * this.config.thrustSide + vertY * this.config.thrustUp;
    }
};
Player.prototype.draw = function() {

};