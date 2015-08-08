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

function ECS(game) {
    this.game = game;

    this.entities = {};
    this.components = {};
    this.systems = {};

    this.nextId = 0;

    this.entityCount = 0;
    this.componentCount = 0;
    this.systemCount = 0;
}

ECS.prototype.init = function() {};


ECS.prototype.getNextId = function() {
    this.nextId++;
    return this.nextId;
};



/*
 * ------------
 *    Entity
 * ------------
 */

ECS.prototype.entityExists = function(id) {
    return this.entities.hasOwnProperty(id);
};

ECS.prototype.getEntity = function(id) {
    if (this.entityExists(id)) {
        return this.entities[id];
    } else {
        throw new ECS.EntityDoesNotExist(id);
    }
};

ECS.prototype.createEntity = function(id, setup) {
    id = id || this.getNextId();

    if (this.entityExists(id)) {
        console.log("Entity with id " + id + " already exists.");
        console.log("My course of action: ¯\_(ツ)_/¯");
    }

    var entity = {
        id: id,
        components: {}
    };

    this.entities[id] = entity;

    this.entityCount++;

    return entity;
};

ECS.prototype.deleteEntity = function(id) {
    delete this.entities[id];
    this.entityCount--;
};


/*
 * ---------------
 *    Component
 * ---------------
 */

ECS.prototype.componentExists = function(name) {
    return this.components.hasOwnProperty(name);
};

ECS.prototype.getComponent = function(name) {
    if (this.componentExists(name)) {
        return this.components[name];
    } else {
        throw new ECS.ComponentDoesNotExist(name);
    }
};

ECS.prototype.createComponent = function(name, defaults, dependencies) {
    defaults = defaults || {};
    dependencies = dependencies || [];
    if (!Core.isPlainObject(defaults)) {
        throw new ECS.ComponentError(name, "defaults is not plain object");
    }
    if (!Core.isArray(dependencies)) {
        throw new ECS.ComponentError(name, "dependencies is not an array");
    }
    this.components[name] = {
        defaults: defaults,
        dependencies: dependencies
    };
    this.componentCount++;
    return this.components[name];
};

ECS.prototype.deleteComponent = function(name) {
    delete this.components[name];
    this.componentCount--;
};

ECS.prototype.addComponent = function(id, componentName, componentData) {
    var entity = this.getEntity(id);
    var component = this.getComponent(componentName);
    componentData = componentData || {};

    if (component.dependencies.length > 0) {
        var i,
        len = component.dependencies.length,
        dep;
        for (i = 0; i < len; i++) {
            dep = component.dependencies[i];
            if (!this.hasComponent(id, dep)) {
                throw new ECS.MissingDependencyError(componentName, dep);
            }
        }
    }

    var defaults = Core.clone(component.defaults);
    var data = Core.override(defaults, componentData);
    entity.components[componentName] = data;
};

ECS.prototype.removeComponent = function(id, componentName) {
    var entity = this.getEntity(id);
    delete entity.components[componentName];
};

ECS.prototype.hasComponent = function(id, componentName) {
    return this.entityExists(id) && this.getEntity(id).components.hasOwnProperty(componentName);
};

ECS.prototype.hasAllComponents = function(id, componentList) {
    var i,
        len = componentList.length,
        comp;
    for (i = 0; i < len; i++) {
        comp = componentList[i];
        if (!this.hasComponent(id, comp)) {
            return false;
        }
    }

    return true;
};

ECS.prototype.hasAnyComponents = function(id, componentList) {
    var i,
        len = componentList.length,
        comp;
    for (i = 0; i < len; i++) {
        comp = componentList[i];
        if (this.hasComponent(id, comp)) {
            return true;
        }
    }

    return false;
};

ECS.prototype.addComponents = function(id, componentMap) {
    for (var componentName in componentMap) {
        if (componentMap.hasOwnProperty(conponentName)) {
            this.addComponent(id, componentName, componentMap[componentName]);
        }
    }
};

ECS.prototype.removeComponents = function(id, componentList) {
    var self = this;
    componentList.forEach(function(comp) {
        this.removeComponent(id, comp);
    });
};


/*
 * ------------
 *    System
 * ------------
 */

ECS.prototype.systemExists = function(name) {
    return this.systems.hasOwnProperty(name);
};

ECS.prototype.getSystem = function(name) {
    if (this.systemExists(name)) {
        return this.systems[name];
    } else {
        throw new ECS.SystemDoesNotExist(name);
    }
};

ECS.prototype.addSystem = function(name, func) {
    this.systems[name] = func;
    this.systemCount++;
    return func;
};

ECS.prototype.removeSystem = function(name) {
    delete this.systems[name];
    this.systemCount--;
};

ECS.prototype.runSystem = function(name, args) {
    var system = this.getSystem(name)
    if (system) {
        args = args || [];
        if (!Core.isArray(args)) {
            throw new ECS.SystemError(name, "runSystem: args is not an array");
        }
        args.unshift(this.entities);
        system.apply(this, args);
    }
};


/*
 * ----------
 *    Misc
 * ----------
 */

ECS.prototype.entityConstructor = function(setup) {
    var constr = function(params) {
        params = params || {};
        var entity = this.createEntity();
        if (Core.isFunction(setup)) {
            setup.apply(this, [params]);
        }
    };

    return constr;
};

ECS.prototype.namedEntityConstructor = function(name, setup) {
    var constr = this.entityConstructor(setup);
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
