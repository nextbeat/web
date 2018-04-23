import * as React from 'react'
import { Route, Redirect } from 'react-router'

import App from '../client/components/App'
import { gaPage } from '../client/actions/ga'
import { Store } from '../client/types'
import AppModel from '../client/models/state/app'
import CurrentUser from '../client/models/state/currentUser'

export default (store: Store) => {
   
    function analyticsRoute(path: string | undefined, getComponent: (cb: any) => void) {
        return {
            path,
            getComponent: (nextState: any, cb: any) => { getComponent(cb) },
            onEnter: function(nextState: any, replace: any) {
                if (typeof window !== 'undefined') { 
                    store.dispatch(gaPage())
                }
            }
        }
    }

    return [
        {
            path: 'internal/access',
            getComponent: (nextState: any, cb: any) => {
                let environment = process.env.NODE_ENV || 'development'
                if (environment !== 'development') {
                    import('../client/components/pages/NoMatch').then(component => {
                        return cb(null, component.default)
                    })
                } else {
                    import('../client/components/pages/InternalAccess').then(component => {
                        return cb(null, component.default)
                    })
                }
            }
        },
        {
            path: 'social/:platform/auth/success',
            getComponent: (nextState: any, cb: any) => {
                import('../client/components/pages/social/ConnectSuccess').then(component => {
                    return cb(null, component.default)
                })
            }
        },
        {
            component: App,
            childRoutes: [
                { 
                    path: 'company',
                    indexRoute: { onEnter: (nextState: any, replace: any) => replace('/company/contact') },
                    getComponent: (nextState: any, cb: any) => {
                        import('../client/components/pages/company/Company').then(component => {
                            return cb(null, component.default)
                        })
                    },
                    childRoutes: [
                        {
                            path: 'legal',
                            indexRoute: { onEnter: (nextState: any, replace: any) => replace('/company/legal/terms') },
                            getComponent: (nextState: any, cb: any) => {
                                import('../client/components/pages/company/legal/Legal').then(component => {
                                    return cb(null, component.default)
                                })
                            },
                            childRoutes: [
                                analyticsRoute('terms', cb => {
                                    import(/* webpackChunkName: 'terms' */ '../client/components/pages/company/legal/Terms').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('privacy', cb => {
                                    import(/* webpackChunkName: 'privacy' */ '../client/components/pages/company/legal/Privacy').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('attributions', cb => {
                                    import(/* webpackChunkName: 'attributions' */ '../client/components/pages/company/legal/Attributions').then(component => {
                                        return cb(null, component.default)
                                    })
                                })
                            ]
                        },
                        {
                            path: 'contact',
                            getComponent: (nextState: any, cb: any) => {
                                import(/* webpackChunkName: contact' */ '../client/components/pages/company/contact/Contact').then(component => {
                                    return cb(null, component.default)
                                })
                            },
                            indexRoute: analyticsRoute(undefined, cb => {
                                import('../client/components/pages/company/contact/ContactForm').then(component => {
                                    return cb(null, component.default)
                                })
                            }),
                            childRoutes: [
                                analyticsRoute('success', cb => {
                                    import('../client/components/pages/company/contact/ContactSuccess').then(component => {
                                        return cb(null, component.default)
                                    })
                                })
                            ]
                        },
                        analyticsRoute('advertise', cb => {
                            import(/* webpackChunkName: 'advertising' */ '../client/components/pages/company/Advertising').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        {
                            path: 'about',
                            indexRoute: analyticsRoute(undefined, cb => {
                                import(/* webpackChunkName: 'about' */ '../client/components/pages/company/About').then(component => {
                                    return cb(null, component.default)
                                })
                            }),
                            childRoutes: [
                                analyticsRoute('creators/youtube', cb => {
                                    import('../client/components/pages/company/articles/creators/Youtube').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('creators/twitch', cb => {
                                    import('../client/components/pages/company/articles/creators/Twitch').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('creators/snapchat', cb => {
                                    import('../client/components/pages/company/articles/creators/Snapchat').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('creators/instagram', cb => {
                                    import('../client/components/pages/company/articles/creators/Instagram').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('brands', cb => {
                                    import('../client/components/pages/company/articles/AboutBrands').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('mod', cb => {
                                    import('../client/components/pages/company/articles/Moderation').then(component => {
                                        return cb(null, component.default)
                                    })
                                })
                            ]
                        }
                        
                    ]
                },
                {
                    path: undefined,
                    getComponent: (nextState: any, cb: any) => {
                        import('../client/components/Main').then(component => {
                            return cb(null, component.default)
                        })
                    },
                    childRoutes: [
                        analyticsRoute('/', cb => {
                            import(/* webpackChunkName: 'home' */ '../client/components/pages/Home').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('s/:slug', cb => {
                            import(/* webpackChunkName: 'section' */ '../client/components/pages/Section').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        {
                            path: 'r',
                            childRoutes: [
                                {
                                    path: ':hid',
                                    indexRoute: analyticsRoute(undefined, cb => {
                                        import(/* webpackChunkName: 'room' */ '../client/components/pages/RoomPage').then(component => {
                                            return cb(null, component.default)
                                        })
                                    }),
                                    childRoutes: [
                                        analyticsRoute('edit', cb => {
                                            import(/* webpackChunkName: 'edit-room' */ '../client/components/pages/EditRoom').then(component => {
                                                return cb(null, component.default)
                                            })
                                        }),
                                        analyticsRoute('upload/:comment', cb => {
                                            import(/* webpackChunkName: 'edit-room' */ '../client/components/pages/UploadResponse').then(component => {
                                                return cb(null, component.default)
                                            })
                                        }),
                                        analyticsRoute(':index', cb => {
                                            import('../client/components/pages/RoomPage').then(component => {
                                                return cb(null, component.default)
                                            })
                                        }),
                                    ]
                                }
                            ]
                        },
                        analyticsRoute('u/:username', cb => {
                            import(/* webpackChunkName: 'profile' */ '../client/components/pages/Profile').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('t/:name', cb => {
                            import(/* webpackChunkName: 'tag' */ '../client/components/pages/Tag').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('search', cb => {
                            import(/* webpackChunkName: 'search' */ '../client/components/pages/Search').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('bookmarks', cb => {
                            import(/* webpackChunkName: 'bookmarks' */ '../client/components/pages/Bookmarks').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('subscriptions', cb => {
                            import(/* webpackChunkName: 'subscriptions' */ '../client/components/pages/Subscriptions').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('upload', cb => {
                            import(/* webpackChunkName: 'upload' */ '../client/components/pages/Upload').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        analyticsRoute('notifications', cb => {
                            import(/* webpackChunkName: 'notifications' */ '../client/components/pages/Notifications').then(component => {
                                return cb(null, component.default)
                            })
                        }),
                        {
                            path: 'creator',
                            childRoutes: [
                                analyticsRoute('edit', cb => {
                                    import(/* webpackChunkName: 'edit-profile' */ '../client/components/pages/creator/EditProfile').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('community', cb => {
                                    import(/* webpackChunkName: 'community' */ '../client/components/pages/creator/Community').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('stats', cb => {
                                    import(/* webpackChunkName: 'stats' */ '../client/components/pages/creator/Stats').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('stats/:hid', cb => {
                                    import(/* webpackChunkName: 'stats' */ '../client/components/pages/creator/StatsRoom').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                            ]
                        },
                        {
                            path: 'support',
                            childRoutes: [
                                analyticsRoute('password-reset-request', cb => {
                                    import('../client/components/pages/support/PasswordResetRequest').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('password-reset', cb => {
                                    import('../client/components/pages/support/PasswordReset').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('unsubscribe', cb => {
                                    import('../client/components/pages/support/Unsubscribe').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                            ]
                        },
                        {
                            path: 'studio',
                            getComponent: (nextState: any, cb: any) => {
                                if (!CurrentUser.isPartner(store.getState())) {
                                    import('../client/components/pages/NoMatch').then(component => {
                                        return cb(null, component.default)
                                    })
                                } else {
                                    import ('../client/components/pages/partner/StudioContainer').then(component => {
                                        return cb(null, component.default)
                                    })
                                }
                            },
                            indexRoute: analyticsRoute(undefined, cb => {
                                import ('../client/components/pages/partner/Studio').then(component => {
                                    return cb(null, component.default)
                                })
                            }),
                            childRoutes: [
                                analyticsRoute('campaigns/:id', cb => {
                                    import('../client/components/pages/partner/Campaign').then(component => {
                                        return cb(null, component.default)
                                    })
                                }),
                                analyticsRoute('campaigns/:campaignId/rooms/:roomHid', cb => {
                                    import('../client/components/pages/partner/CampaignRoom').then(component => {
                                        return cb(null, component.default)
                                    })
                                })
                            ]
                        },
                        analyticsRoute('*', cb => {
                            import('../client/components/pages/NoMatch').then(component => {
                                return cb(null, component.default)
                            })
                        })
                    ]
                },
            ]
        }
    ]
} 