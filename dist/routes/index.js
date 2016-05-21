'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _App = require('../../client/components/App.react');

var _App2 = _interopRequireDefault(_App);

var _Bookmarks = require('../../client/components/Bookmarks.react');

var _Bookmarks2 = _interopRequireDefault(_Bookmarks);

var _Room = require('../../client/components/Room.react');

var _Room2 = _interopRequireDefault(_Room);

var _Profile = require('../../client/components/Profile.react');

var _Profile2 = _interopRequireDefault(_Profile);

var _Tag = require('../../client/components/Tag.react');

var _Tag2 = _interopRequireDefault(_Tag);

var _Home = require('../../client/components/Home.react');

var _Home2 = _interopRequireDefault(_Home);

var _Section = require('../../client/components/Section.react');

var _Section2 = _interopRequireDefault(_Section);

var _Search = require('../../client/components/Search.react');

var _Search2 = _interopRequireDefault(_Search);

var _PasswordResetRequest = require('../../client/components/support/PasswordResetRequest.react');

var _PasswordResetRequest2 = _interopRequireDefault(_PasswordResetRequest);

var _PasswordReset = require('../../client/components/support/PasswordReset.react');

var _PasswordReset2 = _interopRequireDefault(_PasswordReset);

var _NoMatch = require('../../client/components/NoMatch.react');

var _NoMatch2 = _interopRequireDefault(_NoMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = [_react2.default.createElement(
    _reactRouter.Route,
    { path: '/support' },
    _react2.default.createElement(_reactRouter.Route, { path: 'password-reset-request', component: _PasswordResetRequest2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: 'password-reset', component: _PasswordReset2.default })
), _react2.default.createElement(
    _reactRouter.Route,
    { component: _App2.default },
    _react2.default.createElement(_reactRouter.Route, { path: '/', component: _Home2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/s/:slug', component: _Section2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/r/:stack_id', component: _Room2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/u/:username', component: _Profile2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/t/:name', component: _Tag2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/search', component: _Search2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '/bookmarks', component: _Bookmarks2.default }),
    _react2.default.createElement(_reactRouter.Route, { path: '*', component: _NoMatch2.default })
)];