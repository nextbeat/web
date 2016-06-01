// TODO: finish transition to ES6
var express         = require('express'),
    _               = require('lodash'),

    api             = require('../lib/api'),
    passport        = require('../lib/passport'),
    universalLinks  = require('../conf/universal-links');

import { handleReactRender } from './react'

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
            api[method](req.url, req.body, { auth: token }).then(function(_res) {
                // we check for the header which is set if the current token
                // has expired, and update the user's token
                if (req.user && _.has(_res.headers, 'x-bbl-jwt-token')) {
                    var newUser = _.assign({}, req.user, { token: _res.headers['x-bbl-jwt-token'] })
                    req.logIn(newUser, function(err) {
                        res.send(_res.body);
                    })
                } else {
                    res.send(_res.body);
                }
            }).catch(function(e) {
                var statusCode = e.statusCode || 404;
                res.status(statusCode).json({error: e.error});
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

        // Universal links
        router.get('/apple-app-site-association', function(req, res) {
            res.json(universalLinks);
        })

        // Login/signup

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

        router.post('/signup', function(req, res) {
            api.post('signup', { 
                email: req.body.email,
                phone: '' // avoids db null error (todo: migrate db column status)
            }, { 
                auth: {
                    user: req.body.username,
                    pass: req.body.password
                }
            }).then(function(_res) {
                res.status(200).json(_res);
            }).catch(function(e) {
                var errorObj = e.error && e.error.error ? { error: e.error.error } : { error: 'Error signing up. Please try again in a few minutes.' }
                res.status(400).json({ error: e.error.error });
            })
        });

        // React

        router.get('*', handleReactRender)

    }
};