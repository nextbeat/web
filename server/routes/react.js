import routes from '../../routes'
import React from 'react'
import { match, RouterContext } from 'react-router'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'

import configureStore from '../../../client/store'
import { Map, fromJS } from 'immutable'
import { assign } from 'lodash'

function getInitialState(req) {
    let state = {
        app: {
            environment: process.env.NODE_ENV || "development"
        }
    }
    // if user is logged in, requests include user info
    if (req.user && req.user.id) {
        assign(state, {
            user: {
                meta: { id: req.user.id }
            },
            entities: {
                users: { [user.id.toString()]: user }
            }
        })
    }
    // todo: not sure if this is still needed...
    if (req.authInfo && req.authInfo.error) {
        assign(state, {
            user: {
                meta: { error: req.authInfo.error }
            }
        })
    }
    return fromJS(state) 
}

// todo: use handlebars
function renderFullPage(html, initialState) {
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

            <title>Nextbeat</title>

            <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
            <script src="/js/modernizr.js"></script>

            <link rel="stylesheet" href="/css/main.css" />
        </head>

        <body> 
            <div id="react">${html}</div>
            <script src="/js/bundle.js"></script>
            <script>
                window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
            </script>
        </body>
        </html>
    `
}

export function handleReactRender(req, res) {
    match({ routes, location: req.url }, ( error, redirectLocation, renderProps) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search)
        } else if (renderProps) {
            const store = configureStore(getInitialState(req))
            const html = renderToString(
                <Provider store={store}>
                    <RouterContext {...renderProps} />
                </Provider>
            )
            const initialState = store.getState()
            res.status(200).send(renderFullPage(html, initialState))
        }
    })
}

