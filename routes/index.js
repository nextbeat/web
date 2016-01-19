var express     = require('express'),

    channels    = require('../controllers/channels'),
    support     = require('../controllers/support');


module.exports = {

    init: function(web) {

        var router = express.Router();
        web.use('/', router);

        // Internal checks 
        router.get('/internal/health', function(req, res) {
            res.send('Health OK');
        });

        router.get('/.well-known/acme-challenge/C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4', function(req, res) {
            res.send('C4NnuJ1Egr1ntyVrehoMMqr2Ggxt-4M3M9Lm6J9yWK4.L8Y9FjWqaSJsTNtFMJYAdaeE66OYJB-fOJ9juFmMIao');
        });

        // Channels

        router.get('/channels', channels.getChannels);

        // Support

        // router.get('/password-reset', support.getPasswordReset);
        // router.post('/password-reset', support.postPasswordReset);
        // router.get('/password-reset-request', support.getPasswordResetRequest);
        // router.post('/password-reset-request', support.postPasswordResetRequest);

        // router.post('/get-app-sms', support.sendGetAppSMS);

        // router.get('/app', support.redirectToAppStore);

    }
};