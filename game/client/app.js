/**
 *  ____  _                  _        _     _ 
 * |  _ \| | __ _ _ __   ___| |_ ___ (_) __| |
 * | |_) | |/ _` | '_ \ / _ \ __/ _ \| |/ _` |
 * |  __/| | (_| | | | |  __/ || (_) | | (_| |
 * |_|   |_|\__,_|_| |_|\___|\__\___/|_|\__,_|
 *                                            
 * Thomas Tølbøl Sørensen
 *           &
 * Peter Severin Rasmussen
 * 
 *  ------  2015  -------
 */

/**
 * App
 * 
 * Requires jQuery
 */
var App = (function() {
    var configFile = "shared/config.js";
    var gameFilesFile = "gamefiles.json";

    // Disable AJAX caching globally 
    // Remove this later on
    $.ajaxSetup({
        cache: false
    });

    var configDefer = $.getScript(configFile); // Load the config file and wrap it in a deferred object
    var gameFilesDefer = $.getJSON(gameFilesFile); // Load the config file and wrap it in a deferred object
    var gamefiles = {};
    var _gamefiles;

    var game;
    var currentStage;
    var stages = {};
    var server = {};

    /**
     * Staging
     * 
     * Edit this to change how the game is loaded 
     * and presented to the user
     */
    function staging() {
        stage("loading", function() {
            this.presentation({
                html: "stages/loading.html",
                css: "stages/loading.css"
            });
            this.execution(function() {

                fetchSourceResourceList().done(function() {
                    loadAllSourceFiles().done(function() {
                        if (typeof Game === "undefined") {
                            progressbar.error("Game constructor cannot be found.");
                            return;
                        }

                        game = new Game(); // Create a new Game instance

                        loadAllResources().done(function() {
                            goto("serverlist");
                        });
                    });
                });
            });
        });

        stage("serverlist", function() {
            this.presentation({
                html: "stages/serverlist.html",
                css: "stages/loading.css"
            });
            this.execution(function() {
                game.keyboard.switchBindings("dvorak"); // Set the default key bindings

                if (!("serverlist" in config) || (!$.isArray(config.serverlist))) {
                    $("#serverlist").addClass("error").html("No serverlist available");
                    return;
                }

                config.serverlist.forEach(function(element) {
                    var obj = $('<div class="item">' + element.name + '</div>').on("click", function() {
                        serverSelect(element.url);
                    });
                    $("#serverlist").append(obj);
                });

                var obj = $('<div class="item">' + 'Custom...' + '</div>').on("click", function() {
                    $("#serverlist-custom").show();
                    $("#serverlist-custom input[type=text]").focus();
                    $("#serverlist").hide();
                });
                $("#serverlist").append(obj);

                $("#keyboard-link").on("click", function() {
                    modal.setHeader("Key bindings");
                    var list = $('<div class="list">');
                    var allBindings = Object.keys(game.keyboard.allBindings).sort();
                    allBindings.forEach(function(element) {
                        var bindings = game.keyboard.allBindings[element];
                        list.append($('<div class="item">' + bindings.title + '</div>').on("click", function() {
                            game.keyboard.switchBindings(bindings.name);
                            modal.hide();
                        }));
                    });
                    modal.setContent(list);
                    modal.show();
                });

                $("#serverlist-custom-back").on("click", function() {
                    $("#serverlist").show();
                    $("#serverlist-custom").hide();
                });

                $("#serverlist-custom form").on("submit", function(event) {
                    serverSelect($("#serverlist-custom input[type=text]").val());
                    event.preventDefault();
                });
            });
        });

        stage("game", function() {
            this.presentation({
                html: "stages/game.html",
                css: "stages/game.css"
            });
            this.execution(function() {
                game.bindAllEvents();
                bindHTML();

                game.network.init(server.url);
                game.events.on("primus::open", function() {
                    game.init(); // Start the game
                });
            });
        });
    }

    /*
     * ======================
     * === Under the hood ===
     * ======================
     */

    function stage(name, setupFn) {
        if (name && setupFn && $.isFunction(setupFn)) {
            var stage = new Stage(setupFn);
            if (!stage.name) {
                stage.name = name;
            }
            stages[name] = stage;
        }
    }

    function goto(name) {
        if (name && (name in stages)) {
            if (currentStage in stages) {
                stages[currentStage].clear();
            }
            stages[name].show();
            currentStage = name;
        }
    }

    /**
     * Progressbar controller
     */
    var progressbar = (function() {
        var loaded = 0;
        var length = -1;
        function next() {
            loaded++;
            redraw();
        }
        function redraw() {
            $("#progress").val((loaded / length) * 100);
        }
        function len(val) {
            length = (val === 0) ? -1 : val; // Hack to avoid division be zero;
        }
        function error(msg) {
            $("#progress-text").append('<span class="error">' + msg + '</span><br />').show();
        }
        function clear(clearLen) {
            loaded = 0;
            if (clearLen) {
                length = -1;
            }
            redraw();
        }
        return {
            next: next,
            redraw: redraw,
            len: len,
            error: error,
            clear: clear
        };
    })();

    /**
     * Simple modal controller
     */
    var modal = (function() {
        var id = "#modal";
        var header;
        var content;

        function show() {
            draw();
            $(id).show();
        }
        function hide() {
            $(id).hide();
        }
        function clear() {
            header = null;
            content = null;
            $(id).html("");
        }

        function setHeader(obj) {
            header = obj;
        }
        function setContent(obj) {
            content = obj;
        }

        function draw() {
            $(id).children(".modal-footer").children(".modal-close").on("click", function() {
                hide();
            });
            $(id).children(".modal-header").html(header);
            $(id).children(".modal-content").html(content);
        }

        return {
            show: show,
            hide: hide,
            clear: clear,
            setHeader: setHeader,
            setContent: setContent,
            draw: draw
        };
    })();

    /*
     * Helper functions
     */
    function fetchFilelist(dir) {
        return $.getJSON(dir);
    }

    function fetchSourceResourceList() {
        // Fills gamefiles object with content

        var len = 0;
        var deferreds = [];

        gamefiles.files = [];
        gamefiles.sourcecode = {};
        _gamefiles.sourcecode.forEach(function(element) {
            if (endsWith(element, ".js")) {
                gamefiles.files.push(element);
            } else {
                // Fetching file list
                deferreds.push(fetchFilelist(element + "/").done(function(filelist) {
                    gamefiles.sourcecode[element] = filelist;
                    len += filelist.length;
                }));
            }
        });

        gamefiles.resources = {};
        // _gamefiles must be loaded
        _gamefiles.resources.forEach(function(element) {
            deferreds.push(fetchFilelist("resources/" + element + "/").done(function(resourceList) {
                gamefiles.resources[element] = resourceList;
                len += resourceList.length;
            }));
        });

        return $.when.apply($, deferreds).done(function() {
            progressbar.len(len);
        });
    }

    function loadAllSourceFiles() {
        var deferreds = [];
        var list = gamefiles.sourcecode;
        var others = gamefiles.files;
        var listOfDirs;

        if ($.isPlainObject(list)) {
            listOfDirs = Object.keys(list);
            listOfDirs.forEach(function(type) {
                deferreds.push(loadSourceFiles({
                    path: type + "/", 
                    list: list[type]
                }));
            });
        }

        deferreds.push(loadSourceFiles({
            path: "",
            list: others
        }));

        return $.when.apply($, deferreds);
    }

    function loadSourceFiles(profile) {
        var deferreds = [];
        var re = new RegExp("^.*\.(js)$");
        profile = $.extend({
            path: "files/",
            list: gamefiles.files
        }, profile);

        if (profile.list && $.isArray(profile.list)) {
            profile.list.forEach(function(element) {
                var file = profile.path + element + (element.match(re) ? "" : ".js");
                if (file === configFile) {
                    // If we try to load the config file, 
                    // ignore and count as already loaded.
                    progressbar.next();
                    return;
                }
                var defer = $.ajax({
                    url: file,
                    dataType: "script",
                    crossDomain: true
                }).done(function() {
                    progressbar.next();
                }).fail(function(error) {
                    progressbar.error("Game file: " + file + (error && error.responseText ? " - " + error.responseText : ""));
                });
                deferreds.push(defer);
            });
        }

        return $.when.apply($, deferreds);
    }

    function loadAllResources(profile) {
        var deferreds = [];
        var listOfTypes;
        profile = $.extend({
            path: "resources",
            list: gamefiles.resources
        }, profile);

        if ($.isPlainObject(profile.list)) {
            listOfTypes = Object.keys(profile.list);
            listOfTypes.forEach(function(type) {
                deferreds.push(loadResources(type, profile.list[type]));
            });
        }

        return $.when.apply($, deferreds);
    }

    function loadResources(type, list) {
        list = list || gamefiles.resources[type];
        var deferreds = [];

        if (list && $.isArray(list)) {
            list.forEach(function(element) {
                var deferred;
                if (type in resourceHandlers) {
                    deferred = resourceHandlers[type].start(element);
                    deferred.done(function() {
                        progressbar.next();
                    }).fail(function(error) {
                        progressbar.error("Resource " + type + ":" + element + " (" + deferred.file + ") could not load." + (error && error.responseText ? " <br /> Error: " + error.responseText : ""));
                    });
                } else {
                    deferred = $.Deferred().reject();
                    progressbar.error("No resource handler exists for given type: " + type);
                }
                deferreds.push(deferred);
            });
        }

        return $.when.apply($, deferreds);
    }

    var resourceHandlers = {};

    function addResourceHandler(type, ext, fn) {
        resourceHandlers[type] = new ResourceHandler(type, ext, fn);
    }

    function loadSocket(url) {
        var deferred = $.ajax({
            url: url,
            dataType: "script",
            crossDomain: true,
            timeout: 1000
        });
        return deferred;
    }

    function bindHTML() {

        function resize() {

        }

        $(window).resize(resize);
        resize();
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    function serverSelect(rawUrl) {
        var protocolRegex = new RegExp("^[a-z]+://");
        var urlSliceRegex = new RegExp("^[a-z]+://(.*?)(/.*)?$");
        var portRegex = new RegExp("^(.*?):[0-9]{1,5}$");
        var urlRegex = new RegExp(".*"); // TODO: Correct url regex
        var url = rawUrl;
        var urlSlice;
        var domain;
        var domainSlice;

        if (url === "") {
            return;
        }

        if (!url.match(protocolRegex)) {
            url = config.protocol + "://" + url;
        }

        urlSlice = url.match(urlSliceRegex);

        if (urlSlice) {
            var domain = urlSlice[1];
            domainSlice = domain.match(portRegex);
            if (!domainSlice) {
                url = url.replace(domain, domain.replace(/:/g, "") + ":" + config.port);
            }
        }

        if (url.match(urlRegex)) {
            server.url = url;
            server.socket_url = server.url + "/primus/primus.js";

            $.when(loadSocket(server.socket_url)).done(function() {
                goto("game");
            }).fail(function(error) {
                $("#serverlist-message").html('<div class="error">Server not available</div>').show();
            });
        } else {
            $("#serverlist-message").html('<div class="error">Invalid url: ' + url + '</div>').show();
        }
    }

    /*
     * Resource Handlers
     */

    addResourceHandler("weapons", "json", function(file, element) {
        return $.getJSON(file).done(function(data) {
            //game.weapons.add(element, data);
        });
    });

    addResourceHandler("images", "png", function(file, element) {
        return $.getImage(file).done(function(image) {
            //game.images.add(element, image);
        });
    });

    addResourceHandler("bindings", "json", function(file, element) {
        return $.getJSON(file).done(function(bindings) {
            var name = bindings.name || element;
            game.keyboard.addBindings(name, bindings);
        });
    });

    /*
     * The function that starts everything
     */
    function start() {
        staging(); // Define the stages

        $.when(configDefer, gameFilesDefer).done(function(cfg, gf) { // Load the config file
            //config = cfg[0]; // Config is updated differently now
            _gamefiles = gf[0];
            goto("loading"); // And load the first stage
        }).fail(function() {
            throw "Could not load config file";
        });
    }

    // Only expose the start function to the global scope
    return {
        start: start
    };
})();

/**
 * Stage
 * 
 * @param setup function The function that sets up the stage
 */
function Stage(setup) {
    this.data = {};

    if (setup && $.isFunction(setup)) {
        setup.apply(this, []);
    }
}

Stage.prototype.show = function() {
    var self = this;
    var fetch = [];
    if ("html" in this.data) {
        fetch.push($.get(this.data.html));
    }
    if ("css" in this.data) {
        fetch.push($.getCSS(this.data.css));
    }
    $.when.apply($, fetch).done(function(html, css) {
        self.html = html[0];
        self.css = css[0];
        $("body").html(html[0]);
        if ("fn" in self.data) {
            self.data.fn.apply(self, []);
        }
    });
};

Stage.prototype.clear = function() {
    if (this.html) {
        $("body").html("");
    }
    if (this.css) {
        this.css.remove();
    }
};


Stage.prototype.presentation = function(data) {
    if ("html" in data) {
        this.data.html = data.html;
    }
    if ("css" in data) {
        this.data.css = data.css;
    }
};

Stage.prototype.execution = function(fn) {
    if (fn && $.isFunction(fn)) {
        this.data.fn = fn;
    }
};


/**
 * @param type The resource type, e.g. weapons
 * @param ext The file extension of the resource, e.g. json
 * @param fn A function that takes a filename and returns a jQuery Deferred object
 * @param setup A setup function
 */

function ResourceHandler(type, ext, fn, setup) {
    this.type = type;
    this.ext = ext;
    if ($.isFunction(fn)) {
        this.fn = fn;
    } else {
        throw new Error("ResourceHandler: Third argument is not a function");
    }
    this.basepath = "resources/";
    this.resourcepath = this.basepath + this.type + "/";
    this.extRegExp = new RegExp("^.*\.(" + this.ext + ")$");
    if ($.isFunction(setup)) {
        setup.apply(this, []);
    }
}

ResourceHandler.prototype.start = function(element) {
    if (element.indexOf(this.ext, element.length - this.ext.length) !== -1) {
        element = element.substring(0, element.indexOf(this.ext)-1);
    }
    var file = this.resourcepath + element + (element.match(this.extRegExp) ? "" : "." + this.ext);
    var deferred = this.fn.apply(this, [file, element]);
    deferred.file = file;
    return deferred;
};

/**
 * jQuery extensions
 */
jQuery.extend({
    getCSS: function(url, callback, nocache) {
        var deferred = $.Deferred();

        if (typeof nocache === 'undefined') {
            nocache = false; // Default don't refresh
        }

        if (nocache) { // Refresh? 
            url += '?_ts=' + new Date().getTime();
        }

        var obj = $('<link>', {rel: 'stylesheet', type: 'text/css', 'href': url}).on('load', function() {
            deferred.resolve(obj);
            if (callback && {}.toString.call(callback) === "[object Function]") {
                callback();
            }
        });
        obj.appendTo('head');

        return deferred.promise();
    },
    getImage: function(url) {
        var deferred = $.Deferred();
        var image = new Image();
        image.onload = function() {
            deferred.resolve(image);
        };
        image.onerror = function(error) {
            deferred.reject(error);
        };
        image.src = url;
        return deferred.promise();
    }
});

/**
 * Bootstrap
 */
(function($) {
    $(document).ready(function() {
        App.start();
    });
})(jQuery);
