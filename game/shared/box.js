// NodeJS requires
if (typeof global !== "undefined") {
    var config = require('./config.js');
    var Core = require('./core.js');
    var ECS = require('./ecs.js');
    var VectorMath = require('./vectorMath.js');
    var Input = require('./input.js');
}

function Box(params, game) {
    params = params || {};
    var entity = game.ECS.createEntity();
    game.ECS.addComponent(entity.id, "box", params);
    game.ECS.addComponent(entity.id, "render", params);
    game.ECS.addComponent(entity.id, "position", params);
    game.ECS.addComponent(entity.id, "physics", params);
    game.ECS.addComponent(entity.id, "jetpack", params);
    game.ECS.addComponent(entity.id, "living", params);
    game.ECS.addComponent(entity.id, "input", params);
    game.ECS.addComponent(entity.id, "playerControlled", params);
    return entity;
}

Box.component = function(game) {
    game.ECS.createComponent("box", {
        size: 50
    });

    game.ECS.createComponent("render");

    game.ECS.createComponent("position", {
        x: 0,
        y: 0
    });

    game.ECS.createComponent("jetpack", {
        fuel: 100
    });

    game.ECS.createComponent("living", {
        health: 100,
        isAlive: true
    });

    game.ECS.createComponent("physics", {
        gravity: true,
        collision: true,
        friction: true,
        drag: true,
        grounded: false,
        ppos: {
            x: 0,
            y: 0
        },
        a: {
            x: 0,
            y: 0
        },
        m: 1
    }, ["position"]);

    game.ECS.createComponent("input", {
        curr: Input.InputStructure(),
        prev: Input.InputStructure()
    });
    game.ECS.createComponent("playerControlled", {}, ["input"]);

    game.ECS.addSystem("render", function(entities, ctx) {
        var ecs = this;
        var player = game.player;
        for (var id in entities) {
            var entity = entities[id];

            if (ecs.hasComponent(id, "render")) {

                if (ecs.hasAllComponents(id, ["box", "position"])) {
                    var box = entity.components.box;
                    var pos = entity.components.position;
                    ctx.fillStyle = 'rgba(255,0,0,0.2)';
                    ctx.fillRect(
                        pos.x - game.cameraX - box.size,
                        pos.y - game.cameraY - box.size,
                        box.size * 2,
                        box.size * 2
                    );
                }

            }
        }
    });

    game.ECS.addSystem("physics", function(entities) {
        var ecs = this;
        var dt = config.game.physTick / 1000;
        var dt2 = dt * dt;
        for (var id in entities) {
            var entity = entities[id];
            if (ecs.hasComponent(id, "physics")) {
                // Garantied to exist
                var body = entity.components.physics;
                var pos  = entity.components.position; // Dependency of physics

                // Might be undefined
                var input   = entity.components.input;
                var jetpack = entity.components.jetpack;
                var living  = entity.components.living;


                // Living component
                if (living) {
                    // Only living can shoot. Also check for input component. Also check for input component
                    if (input && input.curr.mouse.left && !input.prev.mouse.left && living.isAlive) {
                        //game.events.trigger("player::fired", this.id);
                        if (jetpack) {
                            jetpack.fuel = 0;
                        }
                    }

                    // Detect death
                    if (living.hp <= 0) {
                        if (living.isAlive) {
                            //game.events.trigger("player::killed", this.id);
                        }
                        living.isAlive = false;
                    }

                    // Don't waste CPU power on updating a dead player
                    if (!living.isAlive) {
                        break;
                    }
                }


                // Reset acceleration
                body.a.x = 0;
                body.a.y = 0;

                // If component uses gravity, it should be added here:
                if (body.gravity || body.collision || input) {
                    var gravX = config.game.planetX - pos.x;
                    var gravY = config.game.planetY - pos.y;
                    var gravity = {
                        x: gravX,
                        y: gravY
                    };
                    var d = VectorMath.magnitude(gravity);
                    gravity = VectorMath.scale(gravity, 1 / d);
                }

                // If component uses vx and vy, it should be added here
                if (body.friction || body.drag) {
                    var vx = pos.x - body.ppos.x;
                    var vy = pos.y - body.ppos.y;
                }


                // Gravity
                if (body.gravity) {
                    if (d > 0) {
                        body.a.x += gravity.x * config.game.gravity;
                        body.a.y += gravity.y * config.game.gravity;
                    }
                }

                // Collision detection
                if (body.collision) {
                    // We know how to do collision detection with
                    // a box and the planet.
                    if (ecs.hasComponent(id, "box")) {
                        var box = entity.components.box;
                        if (d <= config.game.planetSize + box.size) { // On the ground
                            body.grounded = true;

                            // Move the box up from the ground, if necessary
                            var m = (config.game.planetSize + box.size) - d;
                            pos.x -= gravity.x * m;
                            pos.y -= gravity.y * m;
                        } else { // In the air
                            body.grounded = false;
                        }
                    }
                }

                // Input
                if (input) {
                    if (body.grounded) {
                        // Move along the planet
                        body.a.x += config.game.player.landAccel * gravity.y * (input.curr.keys.right - input.curr.keys.left);
                        body.a.y += config.game.player.landAccel * gravity.x * (input.curr.keys.left - input.curr.keys.right);

                        // Jump
                        if (input.curr.keys.up && !input.prev.keys.up) {
                            body.a.x -= gravity.x * config.game.player.jumpSpeed;
                            body.a.y -= gravity.y * config.game.player.jumpSpeed;
                        }
                    }
                }

                // Friction
                if (body.friction && body.grounded) {
                    body.a.x -= config.game.player.friction * vx / dt2;
                    body.a.y -= config.game.player.friction * vy / dt2;
                }

                // Drag
                if (body.drag && !body.grounded) {
                    body.a.x -= config.game.player.drag * vx / dt2;
                    body.a.y -= config.game.player.drag * vy / dt2;
                }

                // Jetpack
                if (jetpack) {
                    if (body.grounded) {
                        if (jetpack.fuel < 100) {
                            jetpack.fuel += config.game.player.rechargeRate * dt;
                        }

                        if (jetpack.fuel > 100) {
                            jetpack.fuel = 100;
                        }
                    } else {
                        if (input && jetpack.fuel > 0) {
                            if (input.curr.keys.up) {
                                jetpack.fuel -= config.game.player.burnRate * dt;
                            } else if (input.curr.keys.left || input.curr.keys.right) {
                                jetpack.fuel -= config.game.player.burnRate * dt * (config.game.player.thrustSide / config.game.player.thrustUp);
                            }
                        }

                        if (jetpack.fuel < 0) {
                            jetpack.fuel = 0;
                        }

                        if (input) {
                            var thrustSide = config.game.player.thrustSide * (jetpack.fuel > 0); //Available sideways thrust
                            var horX = gravity.y * (input.curr.keys.right - input.curr.keys.left) * thrustSide;
                            var horY = gravity.x * (input.curr.keys.left - input.curr.keys.right) * thrustSide;

                            var thrustUp = config.game.player.thrustUp - (thrustSide * (input.curr.keys.left || input.curr.keys.right));
                            var vertX = -gravity.x * thrustUp * input.curr.keys.up * (jetpack.fuel > 0);
                            var vertY = -gravity.y * thrustUp * input.curr.keys.up * (jetpack.fuel > 0);

                            var mx = horX + vertX;
                            var my = horY + vertY;

                            body.a.x += mx;
                            body.a.y += my;
                        }
                    }
                }

                // Verlet
                var newx = 2 * pos.x - body.ppos.x + body.a.x * dt2;
                var newy = 2 * pos.y - body.ppos.y + body.a.y * dt2;
                body.ppos.x = pos.x;
                body.ppos.y = pos.y;
                pos.x = newx;
                pos.y = newy;
            }
        }
    });

    game.ECS.addSystem("input", function(entities) {
        for (var id in entities) {
            if (this.hasComponent(id, "input")) {
                var input = entities[id].components.input;

                // Predict the next current input to be the same as the old current,
                // meaning that the new previous is the old current.
                input.prev = input.curr;
            }
        }
    });

    game.ECS.addSystem("playerControlled", function(entities) {
        for (var id in entities) {
            if (this.hasComponent(id, "playerControlled")) {
                var input = entities[id].components.input; // Input is a dependency of playerControlled

                // Update the current input of the entity 
                input.curr = Input.fromUserInput(game);

                // Send the new input to the server
                game.network.primus.send("entityinput", input.curr);
            }
        }
    });
};

// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = Box;
}
