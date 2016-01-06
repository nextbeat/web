var express = require('express'),
    web = express(),
    app = require('./lib/app');

var exphbs = require('express-handlebars'),
    favicon = require('serve-favicon');


web.use(express.static(__dirname + '/public/html'));
web.use(express.static(__dirname + '/public'));

// Handlebars
web.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
web.set('view engine', 'handlebars');

// Favicon
web.use(favicon(__dirname + '/public/images/favicon.ico'));

app.init().then(function() {
    web.listen(3000);
});

