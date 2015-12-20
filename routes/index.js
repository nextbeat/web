var support = require('../controllers/support');

module.exports = {
    init: function() {

        var web = express.Router();
        app.use('/', web);

        web.get('/password-reset', support.getPasswordReset);
        web.post('/password-reset', support.postPasswordReset);
        web.get('/password-reset-request', support.getPasswordResetRequest);
        web.post('/password-reset-request', support.postPasswordResetRequest);

        web.post('/get-app-sms', support.sendGetAppSMS);

        web.get('/app', support.redirectToAppStore);

    }
};