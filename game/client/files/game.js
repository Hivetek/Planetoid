function Game() {
    var g = this;

    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

    // Input
    // - Adds keyboard and mouse to game (game.mouse, game.keyboard)
    // - Creates input buffer (game.inputs)
    // - Creates current input short-hand (game.input)
    Input.initWithUserInput(this, config.game.inputBufferSize);

    // Add short-hand for the controlled player
    Object.defineProperty(g, "player", {
        get: function() {
            if (g.id) {
                return g.ECS.getEntity(1);
            } else {
                throw new TypeError("Game.id has not been set");
            }
        }
    });

    // Network
    // - Connects to server using Primus
    this.network = new Network(this);

    // Phyciscs and gameplay
    this.cameraX = 0;
    this.cameraY = 0;

    this.timeAccumulator = 0;
    this.timeScale = 1.0;

    this.fps = 60;
    this.fpsSamples = [];
    this.fpsSampleIndex = 0;

    this.paused = false;

    this.inputId = 0;

    this.pendingSnapshots = [];
    this.ECS = new ECS(this);
}

Game.prototype.init = function() {
    this.events.trigger("init::begin");

    this.canvas = document.getElementById('canvas');
    this.HUDcanvas = document.getElementById('hudcanvas');
    this.resize(this.canvas);
    this.resize(this.HUDcanvas);
    this.ctx = this.canvas.getContext('2d');
    this.HUDctx = this.HUDcanvas.getContext('2d');

    Box.component(this);
    var box = Box({
        x: 0,
        y: -2000,
        ppos: {
            x: 0,
            y: -2000
        }
    }, this);

    this.events.trigger("init::end");

    var g = this;
    requestAnimFrame(function() {
        g.events.trigger("loop::begin");
        g.startTime = g.getTime();
        g.currentTime = g.startTime;
        g.lastTime = g.currentTime;
        g.loop();
    });

    this.network.primus.on("remote::player::killed", function(id) {
        console.log(id + " was killed");
    });

    this.network.primus.on("remote::player::respawn", function(id) {
        g.events.trigger("player::spawn", id);
    });

    this.events.on("player::spawn", function(id) {
        console.log(id + " spawning");
    });

    this.events.on("player::fired", function(id) {
        console.log("Pew!");
    });
};


Game.prototype.loop = function() {
    //console.time("loop");
    this.currentTime = this.getTime();
    this.deltaTime = this.currentTime - this.lastTime;
    this.timeScale = this.deltaTime / (1000 / this.fps);
    this.timeAccumulator += this.deltaTime;

    this.fps = 1000 / this.deltaTime;
    if (this.fpsSampleIndex >= config.game.fpsSampleCount)
        this.fpsSampleIndex = 0;
    this.fpsSamples[this.fpsSampleIndex] = this.fps;
    this.fpsSampleIndex++;

    this.ECS.runSystem("input");
    this.ECS.runSystem("playerControlled");

    if (!this.paused) {
        this.update();
    }

    this.draw(this.ctx);
    this.drawHUD(this.HUDctx);
    this.ECS.runSystem("render", [this.ctx]);

    this.lastTime = this.currentTime;

    var g = this;
    //console.timeEnd("loop");
    requestAnimFrame(function() {
        g.loop();
    });
};

Game.prototype.update = function() {
    /*
    // Server Reconciliation
    //
    // If we have received snapshots from the server
    // we must accept the most recent snapshot and re-apply
    // our inputs from that inputId onwards
    if (this.pendingSnapshots.length > 0) {
        var snap = this.pendingSnapshots[this.pendingSnapshots.length-1];
        this.state.import(snap.state)
        this.inputList.import(snap.inputs);
        if (snap.inputId) {
            var reapplyFromIndex = undefined;
            this.inputs._elements.forEach(function(elem, index) {
                if (elem.id == snap.inputId) {
                    reapplyFromIndex = index;
                }
            });
            if (reapplyFromIndex) {
                var size = this.inputs.size;
                // Iterate over all the inputs in the input buffer
                // from reapplyFromIndex to the end of the buffer.
                for (var i = 0; i < size; i++) {
                    var j = (reapplyFromIndex + i) % size;
                    var input = this.inputs._elements[j];
                    if (input.id == snap.inputId) {
                        break;
                    } else if (input.id < snap.inputId) {
                        // This should never happen
                        break;
                    }
                    this.addInput(input);
                    this.updatePhysicsTick();
                }
            }
        }
        this.pendingSnapshots = [];
    }
    */

    //while (!this.physicsQueue.isEmpty) {
    //    var i = this.physicsQueue.deq();
    //    this.player.update(this.inputs.getRaw(i), this.inputs.getRaw(i-1));
    //}

    //this.updateInput();

    //this.network.primus.send("input", this.input);

    if ((this.currentTime - this.network.lastPing > 1000) && (this.network.pingReceived)) {
        this.network.pingReceived = false;
        this.network.primus.send("ping", this.currentTime);
    }

    this.updatePhysics();

    this.cameraX = this.player.components.position.x - this.canvas.width / 2;
    this.cameraY = this.player.components.position.y - this.canvas.height / 2;
};

Game.prototype.updateInput = function() {
    //this.addInput(Input.fromUserInput(this)); // Capture current state of mouse and keyboard
    //this.network.primus.send("input", this.input); // Send the new input to the server
};

Game.prototype.updatePhysics = function() {
    while (this.timeAccumulator > config.game.physTick) {
        this.ECS.runSystem("physics");
        this.timeAccumulator -= config.game.physTick;
    }
};

Game.prototype.draw = function(ctx) {
    var g = this;

    this.clearCanvas(ctx, this.canvas);

    //Draw background
    ctx.strokeStyle = "#0094AA";
    var px = config.game.planetX;
    var py = config.game.planetY;
    var ps = config.game.planetSize;
    var divs = 72;
    for (var a = 0; a < Math.PI * 2; a += Math.PI * 2 / divs) {
        ctx.beginPath();
        ctx.moveTo(px - this.cameraX, py - this.cameraY);
        ctx.lineTo(px + Math.cos(a) * (ps + 1000) - this.cameraX, py + Math.sin(a) * (ps + 1000) - this.cameraY);
        ctx.stroke();
    }

    for (var d = ps; d < ps + 1000; d += 100) {
        ctx.beginPath();
        for (var a = 0; a < Math.PI * 2; a += Math.PI * 2 / (3 * divs)) {
            if (a === 0)
                ctx.moveTo(px + Math.cos(a) * d - this.cameraX, py + Math.sin(a) * d - this.cameraY);
            else
                ctx.lineTo(px + Math.cos(a) * d - this.cameraX, py + Math.sin(a) * d - this.cameraY);
        }
        ctx.stroke();
    }

    // Draw planet
    ctx.fillStyle = "#000";
    ctx.beginPath();
    var divs = 180;
    var x, y;
    for (var a = 0; a < Math.PI * 2; a += Math.PI * 2 / divs) {
        x = px + Math.cos(a) * ps - this.cameraX;
        y = py + Math.sin(a) * ps - this.cameraY;
        if (a === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
};

Game.prototype.drawHUD = function(ctx) {
    this.clearCanvas(ctx, this.HUDcanvas);

    // Display ping
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText("Ping: " + Math.round(this.network.ping * 100) / 100, 20, 60);

    // Display fps
    var avgFPS = 0;
    for (var i = 0; i < this.fpsSamples.length; i++) {
        avgFPS += this.fpsSamples[i];
    }
    avgFPS = Math.round((avgFPS / this.fpsSamples.length) * 100) / 100;
    ctx.fillText("FPS: " + avgFPS, 20, 84);

    ctx.fillText("X: " + this.player.components.position.x, 20, 108);
    ctx.fillText("Y: " + this.player.components.position.y, 20, 132);
    ctx.fillText("ΔX: " + (this.player.components.position.x - this.player.components.physics.ppos.x), 20, 156);
    ctx.fillText("ΔY: " + (this.player.components.position.y - this.player.components.physics.ppos.y), 20, 180);

    // Display player HP & Fuel
    if (this.player.components.living.health > 0) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(20, 5, this.player.components.living.health, 10);
    }
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(20, 25, this.player.components.jetpack.fuel, 10);

    ctx.strokeStyle = "#000";
    ctx.strokeRect(20, 5, 100, 10);
    ctx.strokeRect(20, 25, 100, 10);
};

Game.prototype.clearCanvas = function(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Will execute and determine what clock to use
// such that we don't have to check for support for each call
Game.prototype.getTime = (function() {
    // Determine if performance is available
    if (window.performance && window.performance.now) {
        return performance.now.bind(performance);
    } else {
        return Date.now;
    }
})();

Game.prototype.getInputId = function() {
    this.inputId++;
    return this.inputId;
};


Game.prototype.resize = function(canvas) {
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
};

Game.prototype.bindAllEvents = function() {
    var self = this;

    // Disable right click
    window.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        return false;
    }, false);

    // Resize
    window.addEventListener('resize', function() {
        self.resize(self.canvas);
        self.resize(self.HUDcanvas);
    }, false);

    // Keyboard input
    this.keyboard.listen();

    // Mouse input
    this.mouse.listen();

    this.events.trigger("allEventsBound");
};


window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000.0 / config.game.targetFPS);
            };
})();
