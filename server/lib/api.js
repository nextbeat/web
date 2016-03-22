var request = require('request-promise'),

    baseUrl,
    clientToken;

function _request(method, url, body, auth) {
    
    if (!auth) {
        auth = { bearer: clientToken }
    }

    if (typeof auth === 'string') {
        auth = { bearer: auth }
    }

    return request({
        method: method,
        url: url,
        baseUrl: baseUrl,
        body: body,
        auth: auth,
        resolveWithFullResponse: true
    });
}

module.exports = {

    init: function() {

        var node_env = process.env.NODE_ENV || "development";

        if (node_env === 'local') {
            baseUrl = 'http://api/v1/';
        } else if (node_env === 'development') {
            baseUrl = 'http://api.dev.getbubble.int/v1/';
        } else if (node_env === 'production') {
            baseUrl = 'http://api.getbubble.int/v1/';
        } else if (node_env === 'mac') {
            baseUrl = 'http://localhost:8000/v1/';
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
            }
        }).then(function(res) {
            clientToken = res.token;
        });

    },

    get: function(url, body, auth) {
        return _request('GET', url, body, auth);
    },

    post: function(url, body, auth) {
        return _request('POST', url, body, auth);
    },

    put: function(url, body, auth) {
        return _request('PUT', url, body, auth);
    },

    del: function(url, body, auth) {
        return _request('DELETE', url, body, auth);
    }

};