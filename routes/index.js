import React from 'react'
import { Route, Redirect } from 'react-router'
import assign from 'lodash/assign'
import last from 'lodash/last'

import App from '../client/components/App.react'

import { gaPage } from '../client/actions'

// require.ensure shim for server
if (typeof require.ensure !== "function") require.ensure = (d,c) => c(require)

export default store => {
   
    function analyticsRoute(path, getComponent) {
        return {
            path,
            getComponent: (nextState, cb) => { getComponent(cb) },
            onEnter: function(nextState, replace /*, cb */) {
                if (typeof window !== 'undefined') { 
                    store.dispatch(gaPage())
                    // last(nextState.routes).getComponent(nextState, (err, component) => {
                    //     if (typeof component.fetchData === 'function') {
                    //         component.fetchData(store, nextState.params)
                    //             .then(() => { cb(null); return null; })
                    //             .catch(err => { cb(err); return null; })
                    //     } else {
                    //         cb(null)
                    //     }
                    // })
                } else {
                    // cb(null);
                }
            }
        }
    }

    return [{
        component: App,
        childRoutes: [
            analyticsRoute('/', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Home.react').default)
                })
            }),
            analyticsRoute('s/:slug', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Section.react').default)
                })
            }),
            analyticsRoute('r/:hid', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/RoomPage.react').default)
                })
            }),
            analyticsRoute('r/:hid/:index', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/RoomPage.react').default)
                })
            }),
            analyticsRoute('u/:username', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Profile.react').default)
                })
            }),
            analyticsRoute('t/:name', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Tag.react').default)
                })
            }),
            analyticsRoute('search', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Search.react').default)
                })
            }),
            analyticsRoute('bookmarks', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Bookmarks.react').default)
                })
            }),
            analyticsRoute('upload', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Upload.react').default)
                })
            }),
            analyticsRoute('notifications', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/Notifications.react').default)
                })
            }),
            analyticsRoute('edit-profile', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/EditProfile.react').default)
                })
            }),
            {
                path: 'support',
                childRoutes: [
                    analyticsRoute('password-reset-request', cb => {
                        require.ensure([], (require) => {
                            return cb(null, require('../client/components/pages/support/PasswordResetRequest.react').default)
                        })
                    }),
                    analyticsRoute('password-reset', cb => {
                        require.ensure([], (require) => {
                            return cb(null, require('../client/components/pages/support/PasswordReset.react').default)
                        })
                    }),
                    analyticsRoute('unsubscribe', cb => {
                        require.ensure([], (require) => {
                            return cb(null, require('../client/components/pages/support/Unsubscribe.react').default)
                        })
                    }),
                ]
            },
            analyticsRoute('*', cb => {
                require.ensure([], (require) => {
                    return cb(null, require('../client/components/pages/NoMatch.react').default)
                })
            })
        ]
    }]
} 