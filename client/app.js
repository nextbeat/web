import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Map, fromJS } from 'immutable'
import Promise from 'bluebird'
import configureStore from './store'

import routes from '../routes'

import './layout/main.scss'

// configure bluebird
global.Promise = Promise
Promise.config({
    cancellation: true
})

let initialState = window.__INITIAL_STATE__
const store = configureStore(fromJS(initialState))

if (initialState.app.environment !== 'production') {
    const Perf = require('react-addons-perf')
    window.Perf = Perf
}

render(
    <Provider store={store}>
        <Router history={browserHistory}>
            { /* routes(store) */}
        </Router>
    </Provider>,
    document.getElementById('react')
);