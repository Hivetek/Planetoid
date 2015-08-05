// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
    var ECS = require('./ecs.js');
}

function Box(params) {
    params = params || {};
    var entity = ECS.createEntity();
    ECS.addComponent(entity.id, "box", params);
    ECS.addComponent(entity.id, "render", params);
    ECS.addComponent(entity.id, "physics", params);
    return entity;
}

Box.component = function() {
    ECS.createComponent("box", {});

    ECS.createComponent("render", {});

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

            if (ECS.hasComponents(id, ["box", "physics"])) {
                var size = 50;
                var box = entity.components.physics;
                ctx.fillStyle = 'rgba(255,0,0,0.2)';
                ctx.fillRect(
                    box.pos.x - ECS.game.cameraX - size,
                    box.pos.y - ECS.game.cameraY - size,
                    size * 2,
                    size * 2
                );
            }
        }
    });

    ECS.addSystem("physics", function(entities) {
        var dt = config.game.physTick / 1000;
        for (var id in entities) {
            var entity = entities[id];
            if (ECS.hasComponent(id, "physics")) {
                var body = entity.components.physics;

                // Verlet
                var newx = 2 * body.pos.x - body.ppos.x + body.a.x * dt * dt;
                var newy = 2 * body.pos.y - body.ppos.y + body.a.y * dt * dt;
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
