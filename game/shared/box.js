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
    });
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
