var express         = require('express') as any,
    web             = express() as any,
    api             = require('./lib/api') as any,
    redis           = require('./lib/redis') as any,
    session         = require('express-session') as any,
    serveStatic     = require('serve-static') as any,
    RedisStore      = require('connect-redis')(session) as any,
    bodyParser      = require('body-parser') as any,
    cookieParser    = require('cookie-parser') as any,
    routes          = require('./routes') as any,
    path            = require('path') as any;

var exphbs          = require('express-handlebars') as any,
    favicon         = require('serve-favicon') as any;

function setCustomHeaders(res, path) {
    if (serveStatic.mime.lookup(path) === 'text/html') {
        // html files should not be cached
        res.setHeader('Cache-Control', 'no-cache');
    } 
}

var staticOptions = {
    maxAge: '1y',
    setHeaders: setCustomHeaders
};

web.use(serveStatic(path.join(__dirname, '../client/public/html'), staticOptions));
web.use(serveStatic(path.join(__dirname, '../client/public'), staticOptions));
web.use(serveStatic(path.join(__dirname, '../client/workers'), staticOptions));

web.set('trust proxy', true);

web.use(bodyParser.json({
    limit: '1mb'
}));
web.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));

web.use(cookieParser(process.env.SESSION_SECRET));

web.use(session({
    store: new RedisStore({ client: redis.client() }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 3 // three months
    }
}));

web.set('json spaces', 2);

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
    console.log('app initialized!', process.env.NODE_ENV);
    var port = (process.env.NODE_ENV === 'mac' || process.env.NODE_ENV === 'mac-dev') ? 3000 : 8000;
    web.listen(port);
}).catch(function(e) {
    console.log(e);
})

