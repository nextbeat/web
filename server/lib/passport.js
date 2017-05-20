var Passport        = require('passport').Passport,
    LocalStrategy   = require('passport-local').Strategy,
    _               = require('lodash'),
    api             = require('./api');

module.exports = {

    init: function(app) {

        var passport = new Passport();

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy(
            function(username, password, done) {
                api.post('login', {}, { 
                    auth: {
                        user: username,
                        pass: password
                    }
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
            var url = 'users/' + user.username;
            api.get(url).then(function(res) {
                var userObj = _.assign({}, res.body, { token : user.token });
                done(null, userObj);
                return null;
            }).catch(function(e) {
                console.log(e);
                done(null, null);
            });
        })

        return passport;
    },

    internalInit: function(app) {
        // Used for accessing internal versions of the product
        // (for example, the development environment). Since there's
        // only one 'user' who is authorized with a simple shared
        // passphrase, we do not need to store any unique identifying
        // information in req.internalUser.
        var internalPassport = new Passport();

        app.use(internalPassport.initialize({ userProperty: 'internalUser' }));
        app.use(internalPassport.session());

        internalPassport.use(new LocalStrategy(
            function(username, password, done) {
                // check passphrase
                done(null, password === process.env.INTERNAL_PASSPHRASE);
            }
        ));

        internalPassport.serializeUser(function(user, done) {
            done(null, true);
        })

        internalPassport.deserializeUser(function(user, done) {
            done(null, true);
        })

        return internalPassport;
    }

}

