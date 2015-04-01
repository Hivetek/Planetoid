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
    Input.init(this, config.game.inputBufferSize);

    // State
    // - Creates state buffer (game.states)
    // - Creates current state short-hand (game.state)
    State.init(this, config.game.stateBufferSize);

    // Add short-hand for the controlled player
    Object.defineProperty(g, "player", {
        get: function() {
            if (g.id) {
                return g.state.players.get(g.id);
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

    this.physicsQueue = new RingBuffer(config.game.inputBufferSize);

    this.inputList = new HashList(this);
}

Game.prototype.init = function() {
    this.events.trigger("init::begin");

    this.canvas = document.getElementById('canvas');
    this.HUDcanvas = document.getElementById('hudcanvas');
    this.resize(this.canvas);
    this.resize(this.HUDcanvas);
    this.ctx = this.canvas.getContext('2d');
    this.HUDctx = this.HUDcanvas.getContext('2d');

    this.events.trigger("init::end");

    var g = this;
    requestAnimFrame(function() {
        g.events.trigger("loop::begin");
        g.startTime = g.getTime();
        g.currentTime = g.startTime;
        g.lastTime = g.currentTime;
        g.loop();
    });
};


Game.prototype.loop = function() {
    //console.time("loop");
    this.currentTime = this.getTime();
    this.deltaTime = this.currentTime - this.lastTime;
    this.timeScale = this.deltaTime / (1000 / this.fps);
    this.timeAccumulator += this.deltaTime;
    
    this.fps = 1000/this.deltaTime;
    if(this.fpsSampleIndex >= config.game.fpsSampleCount)
        this.fpsSampleIndex = 0;
    this.fpsSamples[this.fpsSampleIndex] = this.fps;
    this.fpsSampleIndex++;

    if (!this.paused)
        this.update();

    this.draw(this.ctx);
    this.drawHUD(this.HUDctx);

    this.lastTime = this.currentTime;

    var g = this;
    //console.timeEnd("loop");
    requestAnimFrame(function() {
        g.loop();
    });
};

Game.prototype.update = function() {
    if (this.pendingState) {
        this.state.import(this.pendingState); // Creates jittering
        this.pendingState = undefined;
    }
    //while (!this.physicsQueue.isEmpty) {
    //    var i = this.physicsQueue.deq();
    //    this.player.update(this.inputs.getRaw(i), this.inputs.getRaw(i-1));
    //}

    //this.updateInput();

    //this.network.primus.send("input", this.input);

    if ((this.currentTime - this.network.lastPing > 1000) && (this.network.pingReceived)){
        this.network.pingReceived = false;
        this.network.primus.send("ping", this.currentTime);
    }

    this.updatePhysics();

    this.cameraX = this.player.pos.x - this.canvas.width / 2;
    this.cameraY = this.player.pos.y - this.canvas.height / 2;
};

Game.prototype.updateInput = function() {
    this.input = Input.fromUserInput(this); // Capture current state of mouse and keyboard
    this.network.primus.send("input", this.input); // Send the new input to the server
};

Game.prototype.updatePhysics = function() {
    var self = this;
    var playerInput;
    while (this.timeAccumulator > config.game.physTick) {
        this.state.players.iterate(function(player, id) {
            if (id != self.id) {
                playerInput = self.inputList.get(id);
                if (playerInput) {
                    player.update(playerInput.input, playerInput.prevInput);
                }
            }
        });
        this.player.update(this.input, this.prevInput);
        this.timeAccumulator -= config.game.physTick;
    }
};

Game.prototype.draw = function(ctx) {
    drawCalls = [];
    drawCalls.push(this.player.draw(ctx));

    this.clearCanvas(ctx, this.canvas);
    
    //Draw background
    ctx.strokeStyle = "#0094AA";
    var px = config.game.planetX;
    var py = config.game.planetY;
    var ps = config.game.planetSize;
    var divs = 72;
    for(var a = 0; a < Math.PI * 2; a += Math.PI * 2 / divs){
        ctx.beginPath();
        ctx.moveTo(px - this.cameraX, py - this.cameraY);
        ctx.lineTo(px + Math.cos(a) * (ps+1000) - this.cameraX, py + Math.sin(a) * (ps+1000) - this.cameraY);
        ctx.stroke();
    }
    
    for(var d = ps; d < ps+1000; d += 100){
        ctx.beginPath();
        for(var a = 0; a < Math.PI * 2; a += Math.PI * 2 / (3*divs)){
            if(a === 0)
                ctx.moveTo(px + Math.cos(a)*d - this.cameraX, py + Math.sin(a)*d - this.cameraY);
            else
                ctx.lineTo(px + Math.cos(a)*d - this.cameraX, py + Math.sin(a)*d - this.cameraY);
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

    this.state.players.iterate(function(player) {
        player.draw(ctx);
    });
};

Game.prototype.drawHUD = function(ctx){
    this.clearCanvas(ctx, this.HUDcanvas);
    
    // Display ping
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText("Ping: "+Math.round(this.network.ping*100)/100, 20,60);

    // Display fps
    var avgFPS = 0;
    for(var i = 0; i < this.fpsSamples.length; i++){
        avgFPS += this.fpsSamples[i];
    }
    avgFPS = Math.round((avgFPS/this.fpsSamples.length)*100)/100;
    ctx.fillText("FPS: "+avgFPS, 20,84);
    
    ctx.fillText("X: "+this.player.pos.x, 20,108);
    ctx.fillText("Y: "+this.player.pos.y, 20,132);
    ctx.fillText("ΔX: "+(this.player.pos.x-this.player.ppos.x), 20,156);
    ctx.fillText("ΔY: "+(this.player.pos.y-this.player.ppos.y), 20,180);
    
    // Display player fuel
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(20, 20, this.player.fuel, 10);

    ctx.strokeStyle = "#000";
    ctx.strokeRect(20, 20, 100, 10);
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

    // Resize
    window.addEventListener('resize', function(){self.resize(self.canvas); self.resize(self.HUDcanvas);}, false);

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
