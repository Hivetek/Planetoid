function Game() {
    this.keyboard = new Keyboard();
    this.mouse = new Mouse();
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
