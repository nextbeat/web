import React from 'react'
import { Route, Redirect } from 'react-router'
import assign from 'lodash/assign'

import App from '../client/components/App.react'
// import Bookmarks from '../client/components/Bookmarks.react'
// import Room from '../client/components/Room.react'

// import Profile from '../client/components/Profile.react'
// import Tag from '../client/components/Tag.react'
// import Home from '../client/components/Home.react'
// import Section from '../client/components/Section.react'
// import Search from '../client/components/Search.react'
// import Upload from '../client/components/Upload.react'
// import Notifications from '../client/components/Notifications.react'
// import EditProfile from '../client/components/EditProfile.react'
// import PasswordResetRequest from '../client/components/support/PasswordResetRequest.react'
// import PasswordReset from '../client/components/support/PasswordReset.react'
// import Unsubscribe from '../client/components/support/Unsubscribe.react'
// import NoMatch from '../client/components/NoMatch.react'

import { gaPage } from '../client/actions'

if (typeof require.ensure !== "function") require.ensure = (d,c) => c(require)

export default store => {

    class AnalyticsRoute extends Route {}
    AnalyticsRoute.defaultProps = assign({}, AnalyticsRoute.defaultProps, {
        onEnter: function(nextState) {
            if (typeof window !== 'undefined') { // in browser only
                store.dispatch(gaPage())
            }
        }
    })

    return [{
        component: App,
        childRoutes: [
            {
                path: '/',
                // component: require('../client/components/Home.react').default
                getComponent: (nextState, cb) => {
                    require.ensure([], (require) => {
                        cb(null, require('../client/components/Home.react').default)
                    })
                }
            },

        ]
    }]

    // return [
    //     <Route component={App}>
    //         <AnalyticsRoute path="/" component={Home} /> 
    //         <AnalyticsRoute path="/s/:slug" component={Section} />
    //         <AnalyticsRoute path="/r/:hid" component={Room} />
    //         <AnalyticsRoute path="/r/:hid/:index" component={Room} />
    //         <AnalyticsRoute path="/u/:username" component={Profile} />
    //         <AnalyticsRoute path="/t/:name" component={Tag} />
    //         <AnalyticsRoute path="/search" component={Search} />
    //         <AnalyticsRoute path="/bookmarks" component={Bookmarks} />
    //         <AnalyticsRoute path="/upload" component={Upload} />
    //         <AnalyticsRoute path="/notifications" component={Notifications} />
    //         <AnalyticsRoute path="/edit-profile" component={EditProfile} />
    //         <Route path="/support">
    //             <AnalyticsRoute path="password-reset-request" component={PasswordResetRequest} />
    //             <AnalyticsRoute path="password-reset" component={PasswordReset} />
    //             <AnalyticsRoute path="unsubscribe" component={Unsubscribe} />
    //         </Route>
    //         <AnalyticsRoute path="*" component={NoMatch} />
    //     </Route>
    // ]

} 