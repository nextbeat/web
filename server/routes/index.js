var express     = require('express'),
    
    api         = require('../lib/api'),
    React       = require('react'),
    ReactServer = require('react-dom/server'),
    Theater     = React.createFactory(require('../../client/containers/Theater.react').default);

module.exports = {

    init: function(web) {

        var router = express.Router();
        web.use('/', router);

        // Internal checks 
        router.get('/internal/health', function(req, res) {
            res.send('Health OK!');
        });

        router.get('/.well-known/acme-challenge/C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4', function(req, res) {
            res.send('C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4.L8Y9FjWqaSJsTNtFMJYAdaeE66OYJB-fOJ9juFmMIao');
        });

        // React test

        router.get('/', function(req, res) {
            res.render('index', {
                react: ReactServer.renderToString(Theater())
            });
        });

        // Theater

        router.get('/stacks/:id', function(req, res) {
            res.render('theater', {
                state: req.params.id
            });
        });

        // Api calls

        var apiRouter = express.Router();
        web.use('/api', apiRouter);

        // matches any requests with the prefix api/
        // and forwards to the api server
        apiRouter.all('*', function(req, res) {
            var method = req.method.toLowerCase();
            api[method](req.url, req.body).then(function(_res) {
                res.send(_res);
            }).catch(function(e) {
                res.status(404).end();
            })
        })

        // Support

        // router.get('/password-reset', support.getPasswordReset);
        // router.post('/password-reset', support.postPasswordReset);
        // router.get('/password-reset-request', support.getPasswordResetRequest);
        // router.post('/password-reset-request', support.postPasswordResetRequest);

        // router.post('/get-app-sms', support.sendGetAppSMS);

        // router.get('/app', support.redirectToAppStore);

    }
};