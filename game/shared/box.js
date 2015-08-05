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
    ECS.addComponent(entity.id, "gravity", params);
    ECS.addComponent(entity.id, "collision", params);
    return entity;
}

Box.component = function() {
    ECS.createComponent("box", {
        size: 50
    });

    ECS.createComponent("render", {});

    ECS.createComponent("gravity", {});
    ECS.createComponent("collision", {});

    ECS.createComponent("physics", {
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

    ECS.addSystem("render", function(entities) {
        var player = ECS.game.player;
        var ctx = ECS.game.ctx
        for (var id in entities) {
            var entity = entities[id];

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
    });

    ECS.addSystem("physics", function(entities) {
        var dt = config.game.physTick / 1000;
        var dt2 = dt * dt;
        for (var id in entities) {
            var entity = entities[id];
            if (ECS.hasComponent(id, "physics")) {
                var body = entity.components.physics;

                body.a.x = 0;
                body.a.y = 0;

                if (ECS.hasAnyComponents(id, ["gravity", "collision"])) {
                    var gravX = config.game.planetX - body.pos.x;
                    var gravY = config.game.planetY - body.pos.y;
                    var gravity = {
                        x: gravX,
                        y: gravY
                    };
                    var d = VectorMath.magnitude(gravity);
                    gravity = VectorMath.scale(gravity, 1 / d);
                }

                // Gravity
                if (ECS.hasComponent(id, "gravity")) {
                    if (d > 0) {
                        body.a.x += gravity.x * config.game.gravity;
                        body.a.y += gravity.y * config.game.gravity;
                    }
                }

                // Collision detection
                if (ECS.hasComponent(id, "collision")) {
                    // We know how to do collision detection with
                    // a box and the planet.
                    if (ECS.hasComponent(id, "box")) {
                        var box = entity.components.box;
                        if (d <= config.game.planetSize + box.size) { //on the ground
                            var m = (config.game.planetSize + box.size) - d;
                            body.pos.x -= gravity.x * m;
                            body.pos.y -= gravity.y * m;
                        }
                    }
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
