var request = require('request-promise'),

    baseUrl,
    token;

module.exports = {

    init: function() {

        var node_env = process.env.NODE_ENV || "development";

        if (node_env === 'local') {
            baseUrl = 'http://app/v1/';
        } else if (node_env === 'development') {
            baseUrl = 'https://api.dev.getbubble.int/v1/';
        } else {
            baseUrl = 'https://api.getbubble.int/v1/';
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
        }).catch(function(e) {
            console.log(e);
        });

    },

    request: function(method, url, body) {
        return request[method]({
            url: url,
            baseUrl: baseUrl,
            body: body,
            auth: {
                bearer: token
            }
        });
    }

};