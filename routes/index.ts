import * as React from 'react'
import { Route, Redirect } from 'react-router'
import assign from 'lodash-es/assign'
import last from 'lodash-es/last'

import App from '../client/components/App'
import AppModel from '../client/models/state/app'

import { gaPage } from '../client/actions/ga'

// require.ensure shim for server
if (typeof require.ensure !== "function") require.ensure = (d,c) => c(require)

export default store => {
   
    function analyticsRoute(path: string | undefined, getComponent: (cb: any) => void) {
        return {
            path,
            getComponent: (nextState, cb) => { getComponent(cb) },
            onEnter: function(nextState, replace) {
                if (typeof window !== 'undefined') { 
                    store.dispatch(gaPage())
                }
            }
        }
    }

    return [
        {
            'path': 'internal/access',
            getComponent: (nextState, cb) => {
                let environment = process.env.NODE_ENV || 'development'
                if (environment !== 'development') {
                    require.ensure([], (require) => {
                        return cb(null, require('../client/components/pages/NoMatch.react').default)
                    })
                } else {
                    require.ensure([], (require) => {
                        return cb(null, require('../client/components/pages/InternalAccess.react').default)
                    })
                }
            }
        },
        {
            component: App,
            childRoutes: [
                analyticsRoute('/', cb => {
                    require.ensure([], (require) => {
                        return cb(null, require('../client/components/pages/Home.react').default)
                    })
                }),
                analyticsRoute('s/:slug', cb => {
                    import('../client/components/pages/Section').then(component => {
                        return cb(null, component)
                    })
                }),
                {
                    path: 'r',
                    childRoutes: [
                        {
                            path: ':hid',
                            indexRoute: analyticsRoute(undefined, cb => {
                                require.ensure([], (require) => {
                                    return cb(null, require('../client/components/pages/RoomPage.react').default)
                                })
                            }),
                            childRoutes: [
                                analyticsRoute('edit', cb => {
                                    require.ensure([], (require) => {
                                        return cb(null, require('../client/components/pages/EditRoom.react').default)
                                    })
                                }),
                                analyticsRoute('upload/:comment', cb => {
                                    require.ensure([], (require) => {
                                        return cb(null, require('../client/components/pages/UploadResponse.react').default)
                                    })
                                }),
                                analyticsRoute(':index', cb => {
                                    require.ensure([], (require) => {
                                        return cb(null, require('../client/components/pages/RoomPage.react').default)
                                    })
                                }),
                            ]
                        }
                    ]
                },
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
                analyticsRoute('subscriptions', cb => {
                    require.ensure([], (require) => {
                        return cb(null, require('../client/components/pages/Subscriptions.react').default)
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
        }
    ]
} 