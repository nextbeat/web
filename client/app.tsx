import * as React from 'react'
import { hydrate } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, match } from 'react-router'
import { Map, fromJS } from 'immutable'
import * as Promise from 'bluebird'
import * as $ from 'jquery'

import { configureStore } from './store'
import routes from '../routes'

import './layout/main.scss'

// require.ensure shim for server
// if (typeof require.ensure !== "function") require.ensure = (d: any, c: any) => c(require)

// configure bluebird
// Promise.config({
//     cancellation: true
// })

// expose jQuery globally and add plugins
(window as any).$ = (window as any).jQuery = $;
require('dotdotdot');
require('jquery-bez');

let initialState = (window as any).__INITIAL_STATE__

// Initialize the command queue in case analytics.js hasn't loaded yet.
(window as any).ga = (window as any).ga || ((...args: any[]) => (ga.q = ga.q || []).push(args));
// Load rest of analytics module asynchronously
import('./analytics').then(analytics=> {
    analytics.init(initialState.app.googleAnalyticsId);
})

let store = configureStore(fromJS(initialState))
let r = routes(store)

// Since we use async routing, we need to resolve the async behavior
// before rendering so that the client-side markup initially matches 
// the server-side markup.
match({ history: browserHistory, routes: r }, (error, redirectLocation, renderProps) => {
    hydrate(
        <Provider store={store}>
            <Router {...renderProps}>
                { r }
            </Router>
        </Provider>,
        document.getElementById('react')
    );
})
