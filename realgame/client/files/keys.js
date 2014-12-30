/**
 * Keys
 */
function Keys(keyboard) {
    this.up    = keyboard.is(38) || false;
    this.left  = keyboard.is(37) || false;
    this.right = keyboard.is(39) || false;
    this.down  = keyboard.is(40) || false;
}
