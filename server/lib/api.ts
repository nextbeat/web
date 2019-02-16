var request = require('request-promise') as any
import * as Promise from 'bluebird'

import assign from 'lodash-es/assign'
import omit from 'lodash-es/omit'

var baseUrl,
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

    options = omit(options, ['auth']);

    return Promise.resolve().then(function() {
        return request(assign({}, {
            method: method,
            url: url,
            baseUrl: baseUrl,
            body: body,
            auth: auth,
            resolveWithFullResponse: true,
            followRedirect: false,
            simple: true
        }, options))
    });
}

function _tryInitialRequest(baseUrl, triesAttempted, triesLeft, baseDelayInMsec, cb) {
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

export function init() {
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
}

export function get(url: string, body, options) {
    return _request('GET', url, body, options)
}

export function post(url: string, body, options) {
    return _request('POST', url, body, options)
}

export function put(url: string, body, options) {
    return _request('PUT', url, body, options)
}

export function del(url: string, body, options) {
    return _request('DELETE', url, body, options)
}