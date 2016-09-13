var request = require('request-promise'),
    Promise = require('bluebird'),
    _       = require('lodash'),

    baseUrl,
    clientToken;

function _request(method, url, body, options) {
    
    var options = options || {},
        isAuthorized = !!options.auth,
        auth = options.auth;

    if (!isAuthorized) {
        auth = { bearer: clientToken }
    }

    if (typeof auth === 'string') {
        auth = { bearer: auth }
    }

    options = _.omit(options, ['auth']);

    return Promise.resolve().then(function() {
        return request(_.assign({}, {
            method: method,
            url: url,
            baseUrl: baseUrl,
            body: body,
            auth: auth,
            resolveWithFullResponse: true
        }, options))
    }).tap(function(res) {
        if (!isAuthorized && _.has(res.headers, 'x-bbl-jwt-token')) {
            clientToken = res.headers['x-bbl-jwt-token'];
        }
    });
}

module.exports = {

    init: function() {

        var node_env = process.env.NODE_ENV || "development";

        if (node_env === 'local') {
            baseUrl = 'http://api/v1/';
        } else if (node_env === 'development') {
            baseUrl = 'http://api.dev.nextbeat.int/v1/';
        } else if (node_env === 'production') {
            baseUrl = 'http://api.nextbeat.int/v1/';
        } else if (node_env === 'mac') {
            baseUrl = 'http://localhost:8000/v1/';
        } else if (node_env === 'mac-dev') {
            baseUrl = 'http://api.dev.nextbeat.co/v1/';
        }

        request = request.defaults({
            json: true
        });

        return request.post({
            url: 'clients/authenticate',
            baseUrl: baseUrl,
            auth: {
                user: process.env.CLIENT_NAME,
                pass: process.env.CLIENT_SECRET
            },
            resolveWithFullResponse: true
        }).then(function(res) {
            clientToken = res.body.token;
        });

    },

    get: function(url, body, options) {
        return _request('GET', url, body, options);
    },

    post: function(url, body, options) {
        return _request('POST', url, body, options);
    },

    put: function(url, body, options) {
        return _request('PUT', url, body, options);
    },

    delete: function(url, body, options) {
        return _request('DELETE', url, body, options);
    }

};