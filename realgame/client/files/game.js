function Game() {
    // Input
    // - Adds keyboard and mouse to game (game.mouse, game.keyboard)
    // - Create input buffer (game.inputs)
    // - Creates input (game.input)
    Input.init(this);
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
