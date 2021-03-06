import routes from '../../routes'
import * as React from 'react'
import { match, RouterContext } from 'react-router'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import uaParser from 'ua-parser-js'

import { configureStore } from '../../client/store'
import { Map, fromJS } from 'immutable'
import assign from 'lodash-es/assign'
import has from 'lodash-es/has'
import last from 'lodash-es/last'
import Helmet from 'react-helmet'

var vendorsManifest = require('../../client/public/js/vendors.cache.manifest.json')
var appManifest = require('../../client/public/js/app.cache.manifest.json');

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
            googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID
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
                    token: req.user.token,
                    cookie: req.headers.cookie,
                    hasUpdatedEntity: true 
                },
                notifications: {
                    unreadCount: req.user.unread_count
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

function renderFullPage(html, head, initialState) {
    function envPath(local, prod) {
        return (process.env.NODE_ENV === "mac" || process.env.NODE_ENV === "mac-dev") ? local : prod
    }

    let localHost = 'localhost'

    let jsPath = envPath(`http://${localHost}:9090/js/bundle.js`, `/${appManifest['app.js']}`)
    let vendorsPath = envPath(`http://${localHost}:3000/js/vendors.dll.js`, `/js/${vendorsManifest['vendors.js']}`)
    let cssPath = envPath(`http://${localHost}:9090/css/main.css`, `/${appManifest['app.css']}`)

    // Note: initial pageview is removed from the GA snippet because it is handled in middleware

    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

            ${head.title.toString()}
            ${head.meta.toString()}

            <link rel="stylesheet" href="${cssPath}" />
            <link rel="manifest" href="/manifest.json" />
        </head>

        <body> 
            <div id="react">${html}</div>
            <script>
                window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
            </script>
            <script src="${vendorsPath}"></script>
            <script src="${jsPath}"></script>
            <script async src='https://www.google-analytics.com/analytics.js'></script>
            <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <script>
                (adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: "ca-pub-6179673641751101",
                    enable_page_level_ads: true
                });
            </script>
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
            const component = last(renderProps.components) as any
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

