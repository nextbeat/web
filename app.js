import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Map } from 'immutable'
import configureStore from './store'
import Theater from './containers/Theater.react'

const id = $('#state').text()
const store = configureStore(Map({
    stack: {
        id,
        isFetching: false
    }
}))

render(
    <Provider store={store}>
        <Theater id={id} />
    </Provider>,
    document.getElementById('react')
);