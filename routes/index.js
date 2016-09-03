import React from 'react'
import { Route } from 'react-router'
import { assign } from 'lodash'

import App from '../client/components/App.react'
import Bookmarks from '../client/components/Bookmarks.react'
import Room from '../client/components/Room.react'
import Profile from '../client/components/Profile.react'
import Tag from '../client/components/Tag.react'
import Home from '../client/components/Home.react'
import Section from '../client/components/Section.react'
import Search from '../client/components/Search.react'
import Upload from '../client/components/Upload.react'
import EditProfile from '../client/components/EditProfile.react'
import PasswordResetRequest from '../client/components/support/PasswordResetRequest.react'
import PasswordReset from '../client/components/support/PasswordReset.react'
import Unsubscribe from '../client/components/support/Unsubscribe.react'
import NoMatch from '../client/components/NoMatch.react'

import { analyticsPage } from '../client/actions'

export default store => {

    class AnalyticsRoute extends Route {}
    AnalyticsRoute.defaultProps = assign({}, AnalyticsRoute.defaultProps, {
        onEnter: function(nextState) {
            if (typeof window !== 'undefined') { // in browser only
                store.dispatch(analyticsPage())
            }
        }
    })

    return [
        <Route path="/support">
            <AnalyticsRoute path="password-reset-request" component={PasswordResetRequest} />
            <AnalyticsRoute path="password-reset" component={PasswordReset} />
            <AnalyticsRoute path="unsubscribe" component={Unsubscribe} />
        </Route>,
        <Route component={App}>
            <AnalyticsRoute path="/" component={Home} /> 
            <AnalyticsRoute path="/s/:slug" component={Section} />
            <AnalyticsRoute path="/r/:hid" component={Room} />
            <AnalyticsRoute path="/u/:username" component={Profile} />
            <AnalyticsRoute path="/t/:name" component={Tag} />
            <AnalyticsRoute path="/search" component={Search} />
            <AnalyticsRoute path="/bookmarks" component={Bookmarks} />
            <AnalyticsRoute path="/upload" component={Upload} />
            <AnalyticsRoute path="/edit-profile" component={EditProfile} />
            <AnalyticsRoute path="*" component={NoMatch} />
        </Route>
    ]

} 