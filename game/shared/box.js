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
    ECS.addComponent(entity.id, "position", params);
    ECS.addComponent(entity.id, "physics", params);
    ECS.addComponent(entity.id, "input", params);
    ECS.addComponent(entity.id, "playerControlled", params);
    return entity;
}

Box.component = function() {
    ECS.createComponent("box", {
        size: 50
    });

    ECS.createComponent("render");

    ECS.createComponent("position", {
        x: 0,
        y: 0
    });

    ECS.createComponent("physics", {
        gravity: true,
        collision: true,
        friction: true,
        drag: true,
        grounded: false,
        ppos: {
            x: 0,
            y: 0
        },
        a: {
            x: 0,
            y: 0
        },
        m: 1
    }, ["position"]);

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

                if (ECS.hasAllComponents(id, ["box", "position"])) {
                    var box = entity.components.box;
                    var pos = entity.components.position;
                    ctx.fillStyle = 'rgba(255,0,0,0.2)';
                    ctx.fillRect(
                        pos.x - ECS.game.cameraX - box.size,
                        pos.y - ECS.game.cameraY - box.size,
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
                var pos  = entity.components.position;
                var body = entity.components.physics;

                // Reset acceleration
                body.a.x = 0;
                body.a.y = 0;

                // If component uses gravity, it should be added here:
                if (body.gravity || body.collision || ECS.hasComponent(id, "input")) {
                    var gravX = config.game.planetX - pos.x;
                    var gravY = config.game.planetY - pos.y;
                    var gravity = {
                        x: gravX,
                        y: gravY
                    };
                    var d = VectorMath.magnitude(gravity);
                    gravity = VectorMath.scale(gravity, 1 / d);
                }

                // If component uses vx and vy, it should be added here
                if (body.friction || body.drag) {
                    var vx = pos.x - body.ppos.x;
                    var vy = pos.y - body.ppos.y;
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
                            pos.x -= gravity.x * m;
                            pos.y -= gravity.y * m;
                        } else { // In the air
                            body.grounded = false;
                        }
                    }
                }

                // Input
                if (ECS.hasComponent(id, "input")) {
                    var input = entity.components.input;

                    if (body.grounded) {
                        // Move along the planet
                        body.a.x += config.game.player.landAccel * gravity.y * (input.curr.keys.right - input.curr.keys.left);
                        body.a.y += config.game.player.landAccel * gravity.x * (input.curr.keys.left - input.curr.keys.right);

                        // Jump
                        if (input.curr.keys.up && !input.prev.keys.up) {
                            body.a.x -= gravity.x * config.game.player.jumpSpeed;
                            body.a.y -= gravity.y * config.game.player.jumpSpeed;
                        }
                    }
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
                var newx = 2 * pos.x - body.ppos.x + body.a.x * dt2;
                var newy = 2 * pos.y - body.ppos.y + body.a.y * dt2;
                body.ppos.x = pos.x;
                body.ppos.y = pos.y;
                pos.x = newx;
                pos.y = newy;
            }
        }
    });

    ECS.addSystem("input", function(entities) {
        for (var id in entities) {
            if (ECS.hasComponent(id, "input")) {
                var entity = entities[id];
                var input = entity.components.input;

                // Predict the next current input to be the same as the old current,
                // meaning that the new previous is the old current.
                input.prev = input.curr;

                if (ECS.hasComponent(id, "playerControlled")) {
                    input.curr = Input.fromUserInput(ECS.game);
                }
            }
        }
    });
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
