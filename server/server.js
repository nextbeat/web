require("babel-core/register");

var express = require('express'),
    web = express(),
    api = require('./lib/api'),
    routes = require('./routes'),
    path = require('path');

var exphbs = require('express-handlebars'),
    favicon = require('serve-favicon');


web.use(express.static(path.join(__dirname, '../public/html')));
web.use(express.static(path.join(__dirname, '../public')));

// Handlebars
web.set('views', './server/views');
web.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: 'server/views/layouts'
}));
web.set('view engine', 'handlebars');

// Favicon
web.use(favicon(path.join(__dirname, '../public/images/favicon.ico')));

routes.init(web);
api.init().then(function() {
    console.log('app initialized!');
    web.listen(3000);
});

