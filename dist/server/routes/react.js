'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.handleReactRender = handleReactRender;

var _routes = require('../../routes');

var _routes2 = _interopRequireDefault(_routes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _server = require('react-dom/server');

var _reactRedux = require('react-redux');

var _store = require('../../client/store');

var _store2 = _interopRequireDefault(_store);

var _immutable = require('immutable');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getInitialState(req) {
    var state = {
        app: {
            environment: process.env.NODE_ENV || "development"
        }
    };
    // if user is logged in, requests include user info
    if (req.user && req.user.id) {
        (0, _lodash.assign)(state, {
            user: {
                meta: { id: req.user.id }
            },
            entities: {
                users: _defineProperty({}, user.id.toString(), user)
            }
        });
    }
    // todo: not sure if this is still needed...
    if (req.authInfo && req.authInfo.error) {
        (0, _lodash.assign)(state, {
            user: {
                meta: { error: req.authInfo.error }
            }
        });
    }
    return (0, _immutable.fromJS)(state);
}

// todo: use handlebars
function renderFullPage(html, initialState) {
    return '\n        <!doctype html>\n        <html lang="en">\n        <head>\n            <meta charset="utf-8" />\n            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />\n\n            <title>Nextbeat</title>\n\n            <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>\n            <script src="/js/modernizr.js"></script>\n\n            <link rel="stylesheet" href="/css/main.css" />\n        </head>\n\n        <body> \n            <div id="react">' + html + '</div>\n            <script src="/js/bundle.js"></script>\n            <script>\n                window.__INITIAL_STATE__ = ' + JSON.stringify(initialState) + '\n            </script>\n        </body>\n        </html>\n    ';
}

function renderAndSend(res, renderProps, store) {
    var html = (0, _server.renderToString)(_react2.default.createElement(
        _reactRedux.Provider,
        { store: store },
        _react2.default.createElement(_reactRouter.RouterContext, renderProps)
    ));
    var state = store.getState();
    res.status(200).send(renderFullPage(html, state));
}

function handleReactRender(req, res) {
    (0, _reactRouter.match)({ routes: _routes2.default, location: req.url }, function (error, redirectLocation, renderProps) {
        if (error) {
            res.status(500).send(error.message);
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if (renderProps) {
            var store = (0, _store2.default)(getInitialState(req));
            var component = (0, _lodash.last)(renderProps.components);
            if (typeof component.fetchData === "function") {
                console.log('fetching data');
                component.fetchData(store, renderProps.params).then(function (newStore) {
                    console.log('data fetched');
                    renderAndSend(res, renderProps, newStore);
                });
            } else {
                renderAndSend(res, renderProps, store);
            }
        }
    });
}