// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
}

/*
 * =========
 *    ECS
 * =========
 */

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


/*
 * ------------
 *    Entity
 * ------------
 */

ECS.entityExists = function(id) {
    return ECS.entities.hasOwnProperty(id);
};

ECS.getEntity = function(id) {
    if (ECS.entityExists(id)) {
        return ECS.entities[id];
    } else {
        throw new EntityDoesNotExist(id);
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


/*
 * ---------------
 *    Component
 * ---------------
 */

ECS.componentExists = function(name) {
    return ECS.components.hasOwnProperty(name);
};

ECS.getComponent = function(name) {
    if (ECS.componentExists(name)) {
        return ECS.components[name];
    } else {
        throw new ComponentDoesNotExist(name);
    }
};

ECS.createComponent = function(name, defaults, dependencies) {
    defaults = defaults || {};
    dependencies = dependencies || [];
    if (!Core.isPlainObject(defaults)) {
        throw new ECS.ComponentError(name, "defaults is not plain object");
    }
    if (!Core.isArray(dependencies)) {
        throw new ECS.ComponentError(name, "dependencies is not an array");
    }
    ECS.components[name] = {
        defaults: defaults,
        dependencies: dependencies
    };
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
            var component = ECS.components[componentName];
            if (component.dependencies.length > 0) {
                var i,
                len = component.dependencies.length,
                dep;
                for (i = 0; i < len; i++) {
                    dep = component.dependencies[i];
                    if (!ECS.hasComponent(id, dep)) {
                        throw new ECS.MissingDependencyError(componentName, dep);
                    }
                }
            }
            var defaults = Core.clone(component.defaults);
            var data = Core.override(defaults, componentData);
            entity.components[componentName] = data;
        } else {
            throw new ComponentDoesNotExist(componentName);
        }
    } else {
        throw new EntityDoesNotExist(id);
    }
};

ECS.removeComponent = function(id, componentName) {
    if (ECS.entityExists(id)) {
        var entity = ECS.entities[id];
        delete entity.components[componentName];
    } else {
        throw new EntityDoesNotExist(id);
    }
};

ECS.hasComponent = function(id, componentName) {
    return ECS.entityExists(id) && ECS.getEntity(id).components.hasOwnProperty(componentName);
};

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
};

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
};

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


/*
 * ------------
 *    System
 * ------------
 */

ECS.systemExists = function(name) {
    return ECS.systems.hasOwnProperty(name);
};

ECS.getSystem = function(name) {
    if (ECS.systemExists(name)) {
        return ECS.systems[name];
    } else {
        throw new SystemDoesNotExist(name);
    }
};

ECS.addSystem = function(name, func) {
    ECS.systems[name] = func;
    ECS.systemCount++;
    return func;
};

ECS.removeSystem = function(name) {
    delete ECS.systems[name];
    ECS.systemCount--;
};

ECS.runSystem = function(name, args) {
    var system = ECS.getSystem(name)
    if (system) {
        args = args || [];
        if (!Core.isArray(args)) {
            throw new ECS.SystemError(name, "runSystem: args is not an array");
        }
        args.unshift(ECS.entities);
        system.apply({}, args);
    }
};


/*
 * ----------
 *    Misc
 * ----------
 */

ECS.entityConstructor = function(setup) {
    var constr = function(params) {
        params = params || {};
        var entity = ECS.createEntity();
        if (Core.isFunction(setup)) {
            setup.apply(this, [params]);
        }
    };

    return constr;
};

ECS.namedEntityConstructor = function(name, setup) {
    var constr = ECS.entityConstructor(setup);
    window[name] = constr;
    return constr;
};


/*
 * ------------
 *    Errors
 * ------------
 */

ECS.EntityError = function(ent, message) {
    this.name = "EntityError";
    this.message = "Entity '"+ent+"': " + message;
}
ECS.EntityError.prototype = Object.create(Error.prototype);

ECS.ComponentError = function(comp, message) {
    this.name = "ComponentError";
    this.message = "Component '"+comp+"': " + message;
}
ECS.ComponentError.prototype = Object.create(Error.prototype);

ECS.SystemError = function(sys, message) {
    this.name = "SystemError";
    this.message = "System '"+sys+"': " + message;
}
ECS.SystemError.prototype = Object.create(Error.prototype);


ECS.EntityDoesNotExist = function(ent) {
    this.name = "EntityDoesNotExist";
    this.message = ent + "";
}
ECS.EntityDoesNotExist.prototype = Object.create(Error.prototype);

ECS.ComponentDoesNotExist = function(comp) {
    this.name = "ComponentDoesNotExist";
    this.message = comp + "";
}
ECS.ComponentDoesNotExist.prototype = Object.create(Error.prototype);

ECS.SystemDoesNotExist = function(sys) {
    this.name = "SystemDoesNotExist";
    this.message = sys + "";
}
ECS.SystemDoesNotExist.prototype = Object.create(Error.prototype);


ECS.MissingDependencyError = function(comp, dep) {
    this.name = "MissingDependencyError";
    this.message = "Component '"+comp+"': Missing dependency '"+dep+"'";
}
ECS.MissingDependencyError.prototype = Object.create(Error.prototype);


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = ECS;
}
