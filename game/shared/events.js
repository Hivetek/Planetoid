/**
 * Events
 */
var events = (function(context){
    var context = context || {};
    var topics = {};
    var hOP = topics.hasOwnProperty;

    return {
        on: function(topic, listener) {
            // Create the topic's object if not yet created
            if(!hOP.call(topics, topic)) topics[topic] = [];

            if (typeof(listener) === "function") {
                // Add the listener to queue
                var index = topics[topic].push(listener) -1;

                // Provide handle back for removal of topic
                return {
                    remove: function() {
                        delete topics[topic][index];
                    }
                };
            } else {
                return false;
            }
        },
        trigger: function(topic) {
            // If the topic doesn't exist, or there's no listeners in queue, just leave
            if(!hOP.call(topics, topic)) return;

            var args = Array.prototype.slice.call(arguments, 1);

            // Cycle through topics queue, fire!
            topics[topic].forEach(function(item) {
                item.apply(context, args);
            });
        }
    };
});


// Export module in NodeJS
if (typeof global !== "undefined") {
    module.exports = events;
}
