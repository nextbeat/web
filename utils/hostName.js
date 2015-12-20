module.exports = function(env) {
    var node_env = process.env.NODE_ENV || env || "development";
    if (node_env === "development") {
        return "dev.getbubble.me";
    } else if (node_env === "production") {
        return "www.getbubble.me";
    } else {
        return "web";
    }
};