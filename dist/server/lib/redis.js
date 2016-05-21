'use strict';

var uuid = require('node-uuid'),
    redis = require('redis');

/**
 * Simple module which returns a client for use as a session store.
 */

module.exports = {

    client: function client() {

        var node_env = process.env.NODE_ENV || 'development';
        var options = {
            port: 6379
        };

        if (node_env === 'local') {
            options.host = 'redis';
        } else if (node_env === 'development') {
            options.host = 'redis.dev.nextbeat.int';
        } else if (node_env === 'production') {
            options.host = 'redis.nextbeat.int';
        } else if (node_env === 'mac') {
            options.host = 'localhost';
            options.port = 6380;
        }

        return redis.createClient(options);
    }

};