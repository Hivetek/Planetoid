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
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Player;
}
