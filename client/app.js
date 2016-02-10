import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Map } from 'immutable'
import configureStore from './store'
import Theater from './containers/Theater.react'
import XMPP from 'stanza.io'

const state = JSON.parse($('#state').text())
let initialState = {
    stack: Map({
        id: state.stack_id,
        isFetching: false
    })
}
if (state.id) {
    const { id, username, token } = state
    initialState.user = Map({ id, username, token })
}
const store = configureStore(Map(initialState))

render(
    <Provider store={store}>
        <Theater id={state.stack_id} />
    </Provider>,
    document.getElementById('react')
);