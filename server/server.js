require("babel-core/register");

var express     = require('express'),
    web         = express(),
    api         = require('./lib/api'),
    session     = require('express-session'),
    bodyParser  = require('body-parser'),
    flash       = require('connect-flash'),
    routes      = require('./routes'),
    path        = require('path');

var exphbs      = require('express-handlebars'),
    favicon     = require('serve-favicon');

web.use(express.static(path.join(__dirname, '../client/public/html')));
web.use(express.static(path.join(__dirname, '../client/public')));

web.use(bodyParser.json({
    limit: '1mb'
}));
web.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));

web.use(flash());

// todo: make secure for production
web.use(session({
    secret: 'foo',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}))

// Handlebars
web.set('views', './server/views');
web.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: 'server/views/layouts'
}));
web.set('view engine', 'handlebars');

// Favicon
web.use(favicon(path.join(__dirname, '../client/public/images/favicon.ico')));

routes.init(web);
api.init().then(function() {
    console.log('app initialized!');
    web.listen(3000);
});

