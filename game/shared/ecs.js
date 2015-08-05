var ECS = {};
ECS.entities = {};

ECS.nextId = 0;
ECS.getNextId = function() {
    ECS.nextId++;
    return ECS.nextId;
};

ECS.entityCount = 0;

ECS.entityExists = function(id) {
    return ECS.entities.hasOwnProperty(id);
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

ECS.addComponent = function(id, componentName, componentData) {
    if (ECS.entityExists(id)) {
        var entity = ECS.entities[id];
        entity.components[componentName] = componentData;
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
