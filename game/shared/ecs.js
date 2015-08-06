// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
}

var ECS = {};

ECS.init = function(game) {
    ECS.game = game;
};

ECS.entities = {};
ECS.components = {};
ECS.systems = {};

ECS.nextId = 0;
ECS.getNextId = function() {
    ECS.nextId++;
    return ECS.nextId;
};

ECS.entityCount = 0;
ECS.componentCount = 0;
ECS.systemCount = 0;

ECS.entityExists = function(id) {
    return ECS.entities.hasOwnProperty(id);
}

ECS.componentExists = function(name) {
    return ECS.components.hasOwnProperty(name);
}

ECS.systemExists = function(name) {
    return ECS.systems.hasOwnProperty(name);
}

ECS.getEntity = function(id) {
    if (ECS.entityExists(id)) {
        return ECS.entities[id];
    } else {
        return undefined;
    }
};

ECS.getComponent = function(name) {
    if (ECS.componentExists(name)) {
        return ECS.components[name];
    } else {
        return undefined;
    }
};

ECS.getSystem = function(name) {
    if (ECS.systemExists(name)) {
        return ECS.systems[name];
    } else {
        return undefined;
    }
};

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
        if (ECS.componentExists(componentName)) {
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

ECS.hasComponent = function(id, componentName) {
    return ECS.entityExists(id) && ECS.getEntity(id).components.hasOwnProperty(componentName);
}

ECS.hasAllComponents = function(id, componentList) {
    var i,
        len = componentList.length,
        comp;
    for (i = 0; i < len; i++) {
        comp = componentList[i];
        if (!ECS.hasComponent(id, comp)) {
            return false;
        }
    }

    return true;
}

ECS.hasAnyComponents = function(id, componentList) {
    var i,
        len = componentList.length,
        comp;
    for (i = 0; i < len; i++) {
        comp = componentList[i];
        if (ECS.hasComponent(id, comp)) {
            return true;
        }
    }

    return false;
}

ECS.addComponents = function(id, componentMap) {
    for (var componentName in componentMap) {
        if (componentMap.hasOwnProperty(conponentName)) {
            ECS.addComponent(id, componentName, componentMap[componentName]);
        }
    }
};

ECS.removeComponents = function(id, componentList) {
    componentList.forEach(function(comp) {
        ECS.removeComponent(id, comp);
    });
};

ECS.entityConstructor = function(setup) {
    var constr = function(params) {
        params = params || {};
        var entity = ECS.createEntity();
        if (typeof setup === "function") {
            setup.apply(this, [params]);
        }
    };

    return constr;
};

ECS.namedEntityConstructor = function(name, setup) {
    var constr = ECS.entityConstructor(setup);
    window[name] = constr;
    return constr;
}

ECS.addSystem = function(name, func) {
    ECS.systems[name] = func;
    ECS.systemCount++;
    return func;
}

ECS.removeSystem = function(name) {
    delete ECS.systems[name];
    ECS.systemCount--;
}

ECS.runSystem = function(name) {
    var system = ECS.getSystem(name)
    if (system) {
        system(ECS.entities);
    }
}

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = ECS;
}
