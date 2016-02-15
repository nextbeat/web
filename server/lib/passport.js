var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    api             = require('./api');

module.exports = {

    init: function(app) {

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(
            function(username, password, done) {
                api.post('login?resource=web', {}, { 
                    user: username,
                    pass: password
                }).then(function(res) {
                    done(null, res);
                }).catch(function(e) {
                    var message = e.error ? e.error.error : "";
                    done(null, false, { message: message });
                })
            })
        );

        passport.serializeUser(function(user, done) {
            done(null, {
                id: user.id,
                username: user.username,
                token: user.token
            });
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        })

        return passport;
    },

}

