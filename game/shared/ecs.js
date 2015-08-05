// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
}

var ECS = {};
ECS.entities = {};
ECS.components = {};

ECS.nextId = 0;
ECS.getNextId = function() {
    ECS.nextId++;
    return ECS.nextId;
};

ECS.entityCount = 0;
ECS.componentCount = 0;

ECS.entityExists = function(id) {
    return ECS.entities.hasOwnProperty(id);
}

ECS.componentExists = function(name) {
    return ECS.components.hasOwnProperty(name);
}

ECS.createEntity = function(id, setup) {
    id = id || ECS.getNextId();

    if (ECS.entityExists(id)) {
        console.log("Entity with id " + id + " already exists.");
        console.log("My course of action: ¯\_(ツ)_/¯");
    }

    var entity = {
        id: id,
        components: {}
    };

    ECS.entities[id] = entity;

    ECS.entityCount++;

    return entity;
};

ECS.deleteEntity = function(id) {
    delete ECS.entities[id];
    ECS.entityCount--;
};

ECS.createComponent = function(name, defaults) {
    ECS.components[name] = defaults;
    ECS.componentCount++;
    return ECS.components[name];
};

ECS.deleteComponent = function(name) {
    delete ECS.components[name];
    ECS.componentCount--;
};

ECS.addComponent = function(id, componentName, componentData) {
    if (ECS.entityExists(id)) {
        if (ECS.componentExists(componentName) {
            var entity = ECS.entities[id];
            var defaults = Core.clone(ECS.components[componentName]);
            var data = Core.override(defaults, componentData);
            entity.components[componentName] = data;
        } else {
            console.log("Component " + componentName + " does not exist");
        }
    } else {
        console.log("Entity " + id + " does not exist");
    }
};

ECS.removeComponent = function(id, componentName) {
    if (ECS.entityExists(id)) {
        var entity = ECS.entities[id];
        delete entity.components[componentName];
    } else {
        console.log("Entity " + id + " does not exist");
    }
};


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = ECS;
}
