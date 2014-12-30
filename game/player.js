function Player(x, y, game) {
    this.x = x;
    this.y = y;
    this.fuel = 100;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.oldInput = {
        keyboard: {
            left: false,
            up: false,
            right: false,
            down: false
        }
    };
    this.game = game;
    this.config = {
        r: 16,
        mass: 0.5,
        friction: 0.25,
        landAccel: 2,
        jumpSpeed: 6,
        thrustSide: 0.3,
        drag: 0.035,
        thrustUp: 0.65,
        burnRate: 0.55,
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
    gravity = VectorMath.scale(gravity, 1 / d);
    if (d > 0) {
        this.vx += gravity.x * this.config.mass;
        this.vy += gravity.y * this.config.mass;
    }
    if (d <= this.game.planetSize + this.config.r + 1) { //on the ground
        this.grounded = true;
        if (this.fuel < 100)
            this.fuel += this.config.rechargeRate;

        if (this.fuel > 100)
            this.fuel = 100;

        var m = (this.game.planetSize + this.config.r) - d;
        this.x -= gravity.x * m;
        this.y -= gravity.y * m;


        var speedVector = VectorMath.project({x: this.vx, y: this.vy}, {x: -gravity.y, y: gravity.x});
        this.vx = speedVector.x;
        this.vy = speedVector.y;

        this.vx += this.config.landAccel * gravity.y * (input.keyboard.right - input.keyboard.left);
        this.vy += this.config.landAccel * gravity.x * (input.keyboard.left - input.keyboard.right);
        this.vx -= this.vx * this.config.friction;
        this.vy -= this.vy * this.config.friction;
        if (input.keyboard.up && !this.oldInput.keyboard.up)
            this.jump(gravity);
    } else { //in the air
        this.grounded = false;
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
        this.vx -= this.vx * this.config.drag;
        this.vy -= this.vy * this.config.drag;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.oldInput = JSON.parse(JSON.stringify(input));
};

Player.prototype.jump = function(gravity) {
    console.log("jumped");
    this.vx -= gravity.x * this.config.jumpSpeed;
    this.vy -= gravity.y * this.config.jumpSpeed;
};
Player.prototype.draw = function() {

};