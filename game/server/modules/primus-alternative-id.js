module.exports = {
    server: function(primus) {
        primus.on("connection", function(spark) {
            spark._id = spark.id;
            var idx = spark.id.split("$")[1];
            spark.id = idx;
        });
    }
};
