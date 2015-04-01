/**
 * Mouse
 */
function Mouse(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.left = false;
    this.middle = false;
    this.right = false;
    this.dir = 0;
}

Mouse.prototype.move = function(event) {
    this.x = event.clientX;
    this.y = event.clientY;
};

Mouse.prototype.down = function(event) {
    switch(event.which) {
        case 1:
            this.left = true;
            break;
        case 2:
            this.middle = true;
            break;
        case 3:
            this.right = true;
            break;
    }
};

Mouse.prototype.up = function(event) {
    switch(event.which) {
        case 1:
            this.left = false;
            break;
        case 2:
            this.middle = false;
            break;
        case 3:
            this.right = false;
            break;
    }
};

// Add event listeners
Mouse.prototype.listen = function() {
    var self = this;
    document.addEventListener('mousemove', function(event) {
        self.move(event);
        self.game.updateInput();
    }, false);
    window.addEventListener('mousedown', function(event) {
        self.down(event);
        self.game.updateInput();
    }, false);
    window.addEventListener('mouseup', function(event) {
        self.up(event);
        self.game.updateInput();
    }, false);
};
