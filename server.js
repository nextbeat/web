require("babel-core/register");

var express = require('express'),
    web = express(),
    api = require('./lib/api'),
    routes = require('./routes');

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

routes.init(web);
api.init().then(function() {
    console.log('app initialized!');
    web.listen(3000);
});

