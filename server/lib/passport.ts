var Passport        = require('passport').Passport as any,
    LocalStrategy   = require('passport-local').Strategy as any,
    _               = require('lodash') as any,
    api             = require('./api') as any;

export function init(app) {

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
        var url = `users/${user.username}`,
            options = {
                auth: user.token
            };

        api.get(url, undefined, options).then(function(res) {
            var userObj = _.assign({}, res.body, { token : user.token });
            done(null, userObj);
            return null;
        }).catch(function(e) {
            done(null, null);
        });
    })

    return passport;
}

