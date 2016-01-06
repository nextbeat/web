var express     = require('express'),

    channels    = require('../controllers/channels'),
    support     = require('../controllers/support');


module.exports = {

    init: function(web) {

        var router = express.Router();
        web.use('/', router);

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