function Game() {
    // Event system
    // - on("event" callback)
    // - trigger("event", data)
    this.events = events(this);

    // Input
    // - Adds keyboard and mouse to game (game.mouse, game.keyboard)
    // - Create input buffer (game.inputs)
    // - Creates input short-hand (game.input)
    Input.init(this);

    // State
    // - Create state buffer (game.states)
    // - Creates input short-hand (game.state)
    State.init(this);

    // Network
    // - Connects to server using Primus
    this.network = new Network(this);
}


Game.prototype.resize = function() {

};

Game.prototype.bindAllEvents = function() {
    var self = this;

    // Resize
    window.addEventListener('resize', self.resize.bind(self), false);

    // Keyboard input
    this.keyboard.listen();

    // Mouse input
    this.mouse.listen();
};
