import React from 'react'
import { Route } from 'react-router'

import App from '../client/components/App.react'
import Bookmarks from '../client/components/Bookmarks.react'
import Room from '../client/components/Room.react'
import Profile from '../client/components/Profile.react'
import Tag from '../client/components/Tag.react'
import Home from '../client/components/Home.react'
import Section from '../client/components/Section.react'
import Search from '../client/components/Search.react'
import PasswordResetRequest from '../client/components/support/PasswordResetRequest.react'
import PasswordReset from '../client/components/support/PasswordReset.react'
import NoMatch from '../client/components/NoMatch.react'


export default [
    <Route path="/support">
        <Route path="password-reset-request" component={PasswordResetRequest} />
        <Route path="password-reset" component={PasswordReset} />
    </Route>,
    <Route component={App}>
        <Route path="/" component={Home} /> 
        <Route path="/s/:slug" component={Section} />
        <Route path="/r/:stack_id" component={Room} />
        <Route path="/u/:username" component={Profile} />
        <Route path="/t/:name" component={Tag} />
        <Route path="/search" component={Search} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="*" component={NoMatch} />
    </Route>
]