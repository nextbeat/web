import routes from '../../routes'
import React from 'react'
import { match, RouterContext } from 'react-router'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import uaParser from 'ua-parser-js'

import configureStore from '../../client/store'
import { Map, fromJS } from 'immutable'
import assign from 'lodash/assign'
import has from 'lodash/has'
import last from 'lodash/last'
import Helmet from 'react-helmet'


function getInitialState(req) {
    const ua = uaParser(req.headers['user-agent']);

    let state = {
        app: {
            environment: process.env.NODE_ENV || "development",
            ua: {
                os: ua.os,
                browser: ua.browser,
                device: ua.device
            },
            facebookAppId: process.env.FACEBOOK_APP_ID,
        },
        push: {
            vapidPublicKey: process.env.VAPID_PUBLIC_KEY
        }
    }
    // if user is logged in, requests include user info
    if (req.user && req.user.id) {
        assign(state, {
            user: {
                meta: { 
                    id: req.user.id,
                    hasUpdatedEntity: true 
                }
            },
            entities: {
                users: { 
                    [req.user.id.toString()]: req.user 
                }
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
function renderFullPage(html, head, initialState) {
    const jsPath = (process.env.NODE_ENV === "mac" || process.env.NODE_ENV === "mac-dev") ? "http://localhost:9090/js/bundle.js" : "/js/bundle.js"
    const cssPath = (process.env.NODE_ENV === "mac" || process.env.NODE_ENV === "mac-dev") ? "http://localhost:9090/css/main.css" : "/css/main.css"
    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

            ${head.title.toString()}
            ${head.meta.toString()}

            <link rel="stylesheet" href="${cssPath}" />

            <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
            <script>
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

                ga('create', '${process.env.GOOGLE_ANALYTICS_ID}', 'auto');
            </script>

            <link rel="manifest" href="/manifest.json" />
        </head>

        <body> 
            <div id="react">${html}</div>
            <script>
                window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
            </script>
            <script src="${jsPath}"></script>
        </body>
        </html>
    `
}

function renderAndSend(res, renderProps, store) {
     const html = renderToString(
        <Provider store={store}>
            <RouterContext {...renderProps} />
        </Provider>
    )
    let state = store.getState()
    const head = Helmet.rewind()

    // strip state of any in-progress fetches
    state = state.delete('fetches')

    res.status(200).send(renderFullPage(html, head, state))
}

export function handleReactRender(req, res) {
    const store = configureStore(getInitialState(req))
    match({ routes: routes(store), location: req.url }, ( error, redirectLocation, renderProps) => {
        if (error) {
            res.status(500).send(error.message)
        } else if (redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search)
        } else if (renderProps) {
            const component = last(renderProps.components)
            // Load data before displaying page
            if (typeof component.fetchData === "function") {
                component.fetchData(store, renderProps.params).then((newStore)=> {
                    renderAndSend(res, renderProps, newStore)
                }).catch(e => {
                    // Send regardless of error
                    renderAndSend(res, renderProps, store)
                })
            } else {
                renderAndSend(res, renderProps, store)
            }
           
        }
    })
}

