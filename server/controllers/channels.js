var api     = require('../lib/api');

module.exports = {

    getChannels: function(req, res) {

        api.get('channels').then(function(resp) {
            return res.render('channels', { channels: resp });
        }).catch(function(e) {
            return res.send('404 error!');
        });
        
    }
};