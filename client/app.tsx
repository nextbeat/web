import * as React from 'react'
import { hydrate, render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, match } from 'react-router'
import { Map, fromJS } from 'immutable'
import * as Promise from 'bluebird'
import * as $ from 'jquery'

import { configureStore } from './store'
import routes from '../routes'

import './layout/main.scss'

// expose jQuery globally and add plugins
(window as any).$ = (window as any).jQuery = $;
require('dotdotdot');
require('jquery-bez');

// load twitter global object
if (typeof window !== 'undefined') {
    let $script = require('scriptjs') as any
    $script('https://platform.twitter.com/widgets.js', 'twitter-widgets')
}

let initialState = (window as any).__INITIAL_STATE__;

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

// hydrate() is the correct method to use for SSR as of React 16,
// but because it doesn't update mismatched attributes it's
// inconvenient to use for local development
const renderMethod = initialState.app.environment === 'mac' ? render : hydrate;

match({ history: browserHistory, routes: r }, (error, redirectLocation, renderProps) => {
    renderMethod(
        <Provider store={store}>
            <Router {...renderProps}>
                { r }
            </Router>
        </Provider>,
        document.getElementById('react')
    );
})
