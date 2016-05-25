import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Map, fromJS } from 'immutable'
import Promise from 'bluebird'
import configureStore from './store'

import routes from '../routes'

// configure bluebird
Promise.config({
    cancellation: true
})

let initialState = window.__INITIAL_STATE__
const store = configureStore(fromJS(initialState))

render(
    <Provider store={store}>
        <Router history={browserHistory} children={routes} />
    </Provider>,
    document.getElementById('react')
);