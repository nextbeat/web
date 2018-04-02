var universalLinks  = require('../conf/universal-links');

import { Router } from 'express'
import * as api from '../lib/api'
import * as passportLib from '../lib/passport'

import has from 'lodash-es/has'
import assign from 'lodash-es/assign'
import { handleReactRender } from './react'

var INTERNAL_COOKIE_KEY = 'nb__int';

export function init(web) {

    var passport = passportLib.init(web);

    // API calls

    var apiRouter = Router();
    web.use('/api', apiRouter);

    // matches any requests with the prefix api/
    // and forwards to the api server
    apiRouter.all('*', function(req, res) {
        var method = req.method.toLowerCase();
        method = method === 'delete' ? 'del' : method;
        
        var token = req.user ? req.user.token : undefined;
        var options = {
            auth: token,
            headers: {
                'X-Forwarded-For': req.ip
            }
        };

        api[method](req.url, req.body, options)
        .then(function(res2) {
            // we check for the header which is set if the current token
            // is still a jwt, and update the user's token
            if (req.user && has(res2.headers, 'x-bbl-jwt-token')) {
                var newUser = assign({}, req.user, { token: res2.headers['x-bbl-jwt-token'] })
                req.logIn(newUser, function(err) {
                    res.send(res2.body);
                })
            } else {
                res.send(res2.body);
            }
        })
        .catch(function(e) {
            var statusCode = e.statusCode || 404;
            if (/^3/.test(`${statusCode}`)) {
                return void res.status(statusCode).set(e.response.headers).end();
            }
            return void res.status(statusCode).json({error: e.error});
        })
    })

    // Client-side app

    var router = Router();
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
        var options = {
            auth: req.user.token
        }
        api.post('logout', req.body, options)
            .then(function() {
                req.logOut();
                return res.status(200).end(); 
            })
            .catch(function(e) {
                return res.status(400).json({ error: 'Error logging out.' });
            });
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

    router.post('/internal/login', 
        function(req, res) {
            if ('password' in req.body && req.body.password === process.env.INTERNAL_PASSPHRASE) {
                // Not inherently secure, but currently dev website
                // is public so anything is an improvement.
                res.cookie(INTERNAL_COOKIE_KEY, 'true', { maxAge: 1000*60*60*24*365, httpOnly: true }); 
                res.status(200).end();
            } else {
                res.status(401).send({ error: 'Incorrect passphrase.' });
            }
        }
    );

    // React
    
    router.use(function(req, res, next) {
        if (process.env.NODE_ENV === 'development') {
            if (req.cookies[INTERNAL_COOKIE_KEY] !== 'true' && req.path !== '/internal/access') {
                res.redirect('/internal/access');
                return;
            }
        } 
        next();
    })

    router.get('*', handleReactRender)

}
