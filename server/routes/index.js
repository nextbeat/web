var express     = require('express'),
    _           = require('lodash'),
    api         = require('../lib/api'),
    passport    = require('../lib/passport'),
    React       = require('react'),
    ReactServer = require('react-dom/server'),
    Theater     = React.createFactory(require('../../client/containers/Theater.react').default);

module.exports = {

    init: function(web) {

        passport = passport.init(web);

        // API calls

        var apiRouter = express.Router();
        web.use('/api', apiRouter);

        // matches any requests with the prefix api/
        // and forwards to the api server
        apiRouter.all('*', function(req, res) {
            var method = req.method.toLowerCase();
            var token = req.user ? req.user.token : undefined;
            api[method](req.url, req.body, token).then(function(_res) {
                res.send(_res);
            }).catch(function(e) {
                console.log(e);
                res.status(404).end();
            })
        })

        // Client-side app

        var router = express.Router();
        web.use('/', router);

        // Internal checks 
        router.get('/internal/health', function(req, res) {
            res.send('Health OK!');
        });

        router.get('/.well-known/acme-challenge/C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4', function(req, res) {
            res.send('C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4.L8Y9FjWqaSJsTNtFMJYAdaeE66OYJB-fOJ9juFmMIao');
        });

        // Login

        router.post('/login',
            function(req, res, next) {
                passport.authenticate('local', function(err, user, info) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        req.authInfo = { error: info.message };
                        return res.status(401).json(req.authInfo);
                    }
                    req.logIn(user, function(err) {
                        if (err) {
                            return next(err);
                        }
                        return res.json(req.user);
                    })
                })(req, res, next);
            }
        );

        router.post('/logout', function(req, res) {
            req.logOut();
            return res.status(200).end();
        });

        // React

        router.get('*', function(req, res) {
            var state = _.assign({}, req.user, req.authInfo);
            var bundle = process.env.NODE_ENV === 'mac' ? "/js/bundle.js" : "/js/bundle.min.js";
            res.render('app', {
                bundle: bundle,
                state: JSON.stringify(state)
            });
        });

        // Support

        // router.get('/password-reset', support.getPasswordReset);
        // router.post('/password-reset', support.postPasswordReset);
        // router.get('/password-reset-request', support.getPasswordResetRequest);
        // router.post('/password-reset-request', support.postPasswordResetRequest);

        // router.post('/get-app-sms', support.sendGetAppSMS);

        // router.get('/app', support.redirectToAppStore);

    }
};