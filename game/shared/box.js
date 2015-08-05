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
    return entity;
}

Box.component = function() {
    ECS.createComponent("box", {
        x: 0,
        y: 0
    });

    ECS.addSystem("render", function(entities) {
        var player = ECS.game.player;
        var ctx = ECS.game.ctx
        for (var id in entities) {
            var entity = entities[id];
            entity.components.box.x = player.pos.x - ECS.game.cameraX;
            entity.components.box.y = player.pos.y - ECS.game.cameraY;
            if (ECS.hasComponent(id, "box")) {
                var size = 50;
                var box = entity.components.box;
                ctx.fillStyle = 'rgba(255,0,0,0.2)';
                ctx.fillRect(
                    box.x - size,
                    box.y - size,
                    size * 2,
                    size * 2
                );
            }
        }
    });
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
