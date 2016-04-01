var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    api             = require('./api');

module.exports = {

    init: function(app) {

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(
            function(username, password, done) {
                api.post('login', {}, { 
                    user: username,
                    pass: password
                }).then(function(res) {
                    done(null, res.body);
                }).catch(function(e) {
                    var message = e.error ? e.error.error : "";
                    done(null, false, { message: message });
                })
            })
        );

        // TODO: store id only, deserialize with full data
        passport.serializeUser(function(user, done) {
            done(null, {
                id: user.id,
                username: user.username,
                token: user.token,
                uuid: user.uuid
            });
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        })

        return passport;
    },

}

