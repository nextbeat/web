var request = require('request-promise'),

    baseUrl,
    token;

function _request(method, url, body) {
    return request[method]({
        url: url,
        baseUrl: baseUrl,
        body: body,
        auth: {
            bearer: token
        }
    });
}

module.exports = {

    init: function() {

        var node_env = process.env.NODE_ENV || "development";

        if (node_env === 'local') {
            baseUrl = 'http://app/v1/';
        } else if (node_env === 'development') {
            baseUrl = 'http://api.dev.getbubble.int/v1/';
        } else {
            baseUrl = 'http://api.getbubble.int/v1/';
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
            token = res.token;
        });

    },

    get: function(url) {
        return _request('get', url);
    },

    post: function(url, body) {
        return _request('post', url, body);
    },

    put: function(url, body) {
        return _request('put', url, body);
    },

    del: function(url, body) {
        return _request('delete', url, body);
    }

};