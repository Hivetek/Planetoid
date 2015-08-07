// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
    var ECS = require('./ecs.js');
    var VectorMath = require('./vectorMath.js');
}

function Box(params) {
    params = params || {};
    var entity = ECS.createEntity();
    ECS.addComponent(entity.id, "box", params);
    ECS.addComponent(entity.id, "render", params);
    ECS.addComponent(entity.id, "physics", params);
    ECS.addComponent(entity.id, "input", params);
    return entity;
}

Box.component = function() {
    ECS.createComponent("box", {
        size: 50
    });

    ECS.createComponent("render");

    ECS.createComponent("physics", {
        gravity: true,
        collision: true,
        friction: true,
        drag: true,
        grounded: false,
        pos: {
            x: 0,
            y: 0
        },
        ppos: {
            x: 0,
            y: 0
        },
        a: {
            x: 0,
            y: 0
        },
        m: 1
    });

    ECS.createComponent("input", {
        curr: InputStructure(),
        prev: InputStructure()
    });
    ECS.createComponent("playerControlled", {}, ["input"]);

    ECS.addSystem("render", function(entities, ctx) {
        var player = ECS.game.player;
        for (var id in entities) {
            var entity = entities[id];

            if (ECS.hasComponent(id, "render")) {

                if (ECS.hasAllComponents(id, ["box", "physics"])) {
                    var box = entity.components.box;
                    var boxPhys = entity.components.physics;
                    ctx.fillStyle = 'rgba(255,0,0,0.2)';
                    ctx.fillRect(
                        boxPhys.pos.x - ECS.game.cameraX - box.size,
                        boxPhys.pos.y - ECS.game.cameraY - box.size,
                        box.size * 2,
                        box.size * 2
                    );
                }

            }
        }
    });

    ECS.addSystem("physics", function(entities) {
        var dt = config.game.physTick / 1000;
        var dt2 = dt * dt;
        for (var id in entities) {
            var entity = entities[id];
            if (ECS.hasComponent(id, "physics")) {
                var body = entity.components.physics;

                // Reset acceleration
                body.a.x = 0;
                body.a.y = 0;

                // If component uses gravity, it should be added here:
                if (body.gravity || body.collision || ECS.hasComponent(id, "input")) {
                    var gravX = config.game.planetX - body.pos.x;
                    var gravY = config.game.planetY - body.pos.y;
                    var gravity = {
                        x: gravX,
                        y: gravY
                    };
                    var d = VectorMath.magnitude(gravity);
                    gravity = VectorMath.scale(gravity, 1 / d);
                }

                // If component uses vx and vy, it should be added here
                if (body.friction || body.drag) {
                    var vx = body.pos.x - body.ppos.x;
                    var vy = body.pos.y - body.ppos.y;
                }


                // Gravity
                if (body.gravity) {
                    if (d > 0) {
                        body.a.x += gravity.x * config.game.gravity;
                        body.a.y += gravity.y * config.game.gravity;
                    }
                }

                // Collision detection
                if (body.collision) {
                    // We know how to do collision detection with
                    // a box and the planet.
                    if (ECS.hasComponent(id, "box")) {
                        var box = entity.components.box;
                        if (d <= config.game.planetSize + box.size) { // On the ground
                            body.grounded = true;

                            // Move the box up from the ground, if necessary
                            var m = (config.game.planetSize + box.size) - d;
                            body.pos.x -= gravity.x * m;
                            body.pos.y -= gravity.y * m;
                        } else { // In the air
                            body.grounded = false;
                        }
                    }
                }

                // Input
                if (ECS.hasComponent(id, "input")) {
                    var input = entity.components.input;
                    body.a.x += config.game.player.landAccel * gravity.y * (input.curr.keys.right - input.curr.keys.left);
                    body.a.y += config.game.player.landAccel * gravity.x * (input.curr.keys.left - input.curr.keys.right);
                }

                // Friction
                if (body.friction && body.grounded) {
                    body.a.x -= config.game.player.friction * vx / dt2;
                    body.a.y -= config.game.player.friction * vy / dt2;
                }

                // Drag
                if (body.drag && !body.grounded) {
                    body.a.x -= config.game.player.drag * vx / dt2;
                    body.a.y -= config.game.player.drag * vy / dt2;
                }

                // Verlet
                var newx = 2 * body.pos.x - body.ppos.x + body.a.x * dt2;
                var newy = 2 * body.pos.y - body.ppos.y + body.a.y * dt2;
                body.ppos.x = body.pos.x;
                body.ppos.y = body.pos.y;
                body.pos.x = newx;
                body.pos.y = newy;
            }
        }
    });
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
