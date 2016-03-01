import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { Map } from 'immutable'
import configureStore from './store'
import { CurrentUser } from './models'

import App from './components/App.react'
import Room from './components/Room.react'
import Profile from './components/Profile.react'
import Splash from './components/Splash.react'
import PasswordResetRequest from './components/support/PasswordResetRequest.react'
import PasswordReset from './components/support/PasswordReset.react'
import NoMatch from './components/NoMatch.react'

const state = JSON.parse($('#state').text())
let initialState = {}
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

function checkAuth(nextState, replace) {
    const currentUser = new CurrentUser(store.getState())
    if (currentUser.isLoggedIn()) {
        replace(`/u/${currentUser.get('username')}`)
    }
}

render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={Splash} onEnter={checkAuth} /> 
            <Route path="/support">
                <Route path="password-reset-request" component={PasswordResetRequest} />
                <Route path="password-reset" component={PasswordReset} />
            </Route>
            <Route component={App}>
                <Route path="/r/:stack_id" component={Room} />
                <Route path="/u/:username" component={Profile} />
                <Route path="*" component={NoMatch} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('react')
);