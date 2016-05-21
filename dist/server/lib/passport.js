'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('lodash'),
    api = require('./api');

module.exports = {

    init: function init(app) {

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(function (username, password, done) {
            api.post('login', {}, {
                auth: {
                    user: username,
                    pass: password
                }
            }).then(function (res) {
                done(null, res.body);
            }).catch(function (e) {
                var message = e.error ? e.error.error : "";
                done(null, false, { message: message });
            });
        }));

        // TODO: store id only, deserialize with full data
        passport.serializeUser(function (user, done) {
            done(null, {
                id: user.id,
                username: user.username,
                token: user.token,
                uuid: user.uuid
            });
        });

        passport.deserializeUser(function (user, done) {
            var url = 'users/' + user.username;
            api.get(url).then(function (res) {
                var userObj = _.assign({}, res.body, { token: user.token });
                done(null, userObj);
            });
        });

        return passport;
    }

};