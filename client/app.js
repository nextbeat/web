import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Map, fromJS } from 'immutable'
import Promise from 'bluebird'
import configureStore from './store'

import routes from '../dist/routes'

// configure bluebird
Promise.config({
    cancellation: true
})

// const state = JSON.parse($('#state').text())
// let initialState = {}
// initialState.app = Map({
//     environment: state.environment
// })

// if (state.user && state.user.id) {
//     const { id, username, token, uuid } = state.user
//     initialState.user = Map({ 
//         meta: {
//             id
//         }
//     })
//     initialState.entities = fromJS({
//         users: {
//             [state.user.id.toString()]: state.user
//         }
//     })
// }
// if (state.error) {
//     initialState.user = Map({ meta: {
//         error: state.error
//     }})
// }

let initialState = window.__INITIAL_STATE__
const store = configureStore(fromJS(initialState))

render(
    <Provider store={store}>
        <Router history={browserHistory} children={routes} />
    </Provider>,
    document.getElementById('react')
);