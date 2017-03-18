var request = require('request-promise'),
    Promise = require('bluebird'),
    _       = require('lodash'),

    baseUrl,
    clientToken;

var MAX_CONNECTION_RETRIES  = 10,
    BASE_DELAY_IN_MSEC      = 500;

function _request(method, url, body, options) {
    
    options = options || {};

    var isAuthorized = !!options.auth,
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

function _tryInitialRequest(baseUrl, triesAttempted, triesLeft, baseDelayInMsec, cb) {
    console.log("api connection attempt");
    if (triesLeft === 0) {
        cb(new Error("Exceeded maximum connection retries."));
    }

    request.post({
        url: 'clients/authenticate',
        baseUrl: baseUrl,
        auth: {
            user: process.env.CLIENT_NAME,
            pass: process.env.CLIENT_SECRET
        },
        resolveWithFullResponse: true
    }).then(function(res) {
        cb(null, res.body.token);
    }).catch(function(err) {
        var delay = Math.pow(2, Math.min(5, triesAttempted))*baseDelayInMsec;
        setTimeout(function() {
            _tryInitialRequest(baseUrl, triesAttempted+1, triesLeft-1, baseDelayInMsec, cb);
        }, delay);
    });
}

function tryInitialRequest(baseUrl) {
    return new Promise(function(resolve, reject) {
        _tryInitialRequest(baseUrl, 0, MAX_CONNECTION_RETRIES, BASE_DELAY_IN_MSEC, function(err, token) {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        })
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

        return tryInitialRequest(baseUrl).then(function(token) {
            clientToken = token;
            return null;
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