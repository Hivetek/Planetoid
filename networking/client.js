var primus;

$(document).ready(function(){
    console.log("Ready");

    // config is now available
    
    // Load Primus client library
    var base_url = config.protocol + "://" + config.hostname + ":" + config.port;
    var primus_lib_url = base_url + "/primus/primus.js";
    $.getScript(primus_lib_url).done(function() {
        // Instantiate Primus connection
        primus = new Primus(base_url);
    }).fail(function(jqxhr, settings, exception) {
        console.error("Could not load Primus client library: " + primus_lib_url);
    });
});
