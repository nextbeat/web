import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Map } from 'immutable'
import Promise from 'bluebird'
import configureStore from './store'

import App from './components/App.react'
import Bookmarks from './components/Bookmarks.react'
import Room from './components/Room.react'
import Profile from './components/Profile.react'
import Tag from './components/Tag.react'
import Home from './components/Home.react'
import Section from './components/Section.react'
import PasswordResetRequest from './components/support/PasswordResetRequest.react'
import PasswordReset from './components/support/PasswordReset.react'
import NoMatch from './components/NoMatch.react'

// configure bluebird
Promise.config({
    cancellation: true
})

const state = JSON.parse($('#state').text())
let initialState = {}
initialState.app = Map({
    environment: state.environment
})
if (state.id) {
    const { id, username, token, uuid } = state
    initialState.user = Map({ meta: {
        id, username, token, uuid
    }})
}
if (state.error) {
    initialState.user = Map({ meta: {
        error: state.error
    }})
}


const store = configureStore(Map(initialState))

render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/support">
                <Route path="password-reset-request" component={PasswordResetRequest} />
                <Route path="password-reset" component={PasswordReset} />
            </Route>
            <Route component={App}>
                <Route path="/" component={Home} /> 
                <Route path="/s/:slug" component={Section} />
                <Route path="/r/:stack_id" component={Room} />
                <Route path="/u/:username" component={Profile} />
                <Route path="/t/:name" component={Tag} />
                <Route path="/bookmarks" component={Bookmarks} />
                <Route path="*" component={NoMatch} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('react')
);