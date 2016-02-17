import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { Map } from 'immutable'
import configureStore from './store'

import App from './containers/App.react'
import Theater from './containers/Theater.react'
import Profile from './containers/Profile.react'

const state = JSON.parse($('#state').text())
let initialState = {
    stack: Map({
        isFetching: false
    })
}
if (state.id) {
    const { id, username, token } = state
    initialState.user = Map({ id, username, token })
}
if (state.error) {
    initialState.user = Map({ error: state.error })
}

const store = configureStore(Map(initialState))

render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="r/:stack_id" component={Theater} />
                <Route path="u/:username" component={Profile} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('react')
);