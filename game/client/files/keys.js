/**
 * Keys
 */
function Keys(keyboard) {
    this.up    = keyboard.is(38) || keyboard.is("up")    || false;
    this.left  = keyboard.is(37) || keyboard.is("left")  || false;
    this.right = keyboard.is(39) || keyboard.is("right") || false;
    this.down  = keyboard.is(40) || keyboard.is("down")  || false;
}
