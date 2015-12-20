var express = require('express'),
    app = express();

var exphbs = require('express-handlebars'),
    favicon = require('serve-favicon');

app.use(express.static(__dirname + '/public/html'));
app.use(express.static(__dirname + '/public'));

// Handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.listen(3000);
