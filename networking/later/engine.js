(function(exports) {

var engine = {};

engine.state = state.create(function(self) {
    self.cube = state.entity({
        x: 0,
        y: 0
    });
});

engine.updateState = function(state) {

};

exports.engine = engine;

})(typeof global === "undefined" ? window : module.exports);
