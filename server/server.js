require("babel-core/register");

var express     = require('express'),
    web         = express(),
    api         = require('./lib/api'),
    redis       = require('./lib/redis'),
    session     = require('express-session'),
    RedisStore  = require('connect-redis')(session),
    bodyParser  = require('body-parser'),
    routes      = require('./routes'),
    path        = require('path');

var exphbs      = require('express-handlebars'),
    favicon     = require('serve-favicon');

web.use(express.static(path.join(__dirname, '../client/public/html')));
web.use(express.static(path.join(__dirname, '../client/public')));

// todo: look into using a reverse proxy

web.use(bodyParser.json({
    limit: '1mb'
}));
web.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));

web.use(session({
    store: new RedisStore({ client: redis.client() }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

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
    var port = process.env.NODE_ENV === 'mac' ? 3000 : 80;
    web.listen(port);
}).catch(function(e) {
    console.log(e);
})

