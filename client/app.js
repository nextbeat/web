import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, match } from 'react-router'
import { AppContainer } from 'react-hot-loader'
import { Map, fromJS } from 'immutable'
import Promise from 'bluebird'
import $ from 'jquery'
import configureStore from './store'
import routes from '../routes'

import './layout/main.scss'

// require.ensure shim for server
if (typeof require.ensure !== "function") require.ensure = (d,c) => c(require)

// configure bluebird
global.Promise = Promise
Promise.config({
    cancellation: true
})

// expose jQuery globally and add plugins
window.$ = window.jQuery = $
require('dotdotdot')

let initialState = window.__INITIAL_STATE__
const store = configureStore(fromJS(initialState))

if (initialState.app.environment !== 'production') {
    const Perf = require('react-addons-perf')
    window.Perf = Perf
}

// Load analytics asynchronously
// require.ensure([], (require) => {
    var analytics = require('./analytics');
    analytics.init();
// })

let r = routes(store)

// Since we use async routing, we need to resolve the async behavior
// before rendering so that the client-side markup initially matches 
// the server-side markup.
match({ history: browserHistory, routes: r }, (error, redirectLocation, renderProps) => {
    render(
        <Provider store={store}>
            <Router {...renderProps}>
                { r }
            </Router>
        </Provider>,
        document.getElementById('react')
    );
})
