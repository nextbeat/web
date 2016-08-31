import React from 'react'
import { findDOMNode } from 'react-dom'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'

import { selectSidebar, closeSidebar } from '../actions'

import Icon from './shared/Icon.react'
import Logo from './shared/Logo.react'
import SmallLogo from './shared/SmallLogo.react'

class Topbar extends React.Component {

    constructor(props) {
        super(props);

        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);

        this.toggleSidebar = this.toggleSidebar.bind(this);
    }

    toggleSidebar() {
        const { app, dispatch } = this.props
        if (app.get('activeOverlay') === 'sidebar') {
            dispatch(closeSidebar())
        } else {
            dispatch(selectSidebar())
        }
    }

    toggleUserDropdown() {
        const $dropdown = $('.topbar_dropdown');
        const $userIcon = $('.topbar_user-icon');
        if (!$dropdown.is(':visible')) {
            $dropdown.show();
            // add event which detects clicks outside of dropdown to close it
            $(document).on('mouseup.hideDropdown', function(e) {
                // check that target isn't dropdown or user icon. note that we DO want to hide 
                // if the target is one of the dropdown's descendants, since all of those are 
                // links which should, on click, collapse the dropdown
                if (!($dropdown.is(e.target)
                    || $userIcon.is(e.target) 
                    || $userIcon.has(e.target).length > 0)) 
                {
                    $(document).off('.hideDropdown');
                    $dropdown.hide();
                }
            });
        } else {
            // unbind event when dropdown is hidden
            $(document).off('.hideDropdown');
            $dropdown.hide();
        }

    }

    handleSearchKeyPress(e) {
        if (e.charCode === 13) { // enter
            const query = findDOMNode(this.refs.search_bar).value;
            if (query && query.length > 0) {
                browserHistory.push({
                    pathname: '/search',
                    query: { q: query }
                })
                findDOMNode(this.refs.search_bar).value = '';
            }
        }
    }

    renderLoggedIn() {
        const { user } = this.props;
        const profpic_url = user.profileThumbnailUrl();
        return (
            <div className="topbar_user">
                <Link to="/upload" className="btn topbar_upload">Upload</Link>
                <span className="topbar_user-icon" onClick={this.toggleUserDropdown} >{ profpic_url ? <img src={profpic_url} /> : <Icon type="person" /> }</span>
            </div>
        )
    }

    renderGuest() {
        const { user, handleLoginClick, handleSignupClick } = this.props;
        return (
            <div className="topbar_user">
                <a className="btn topbar_login" onClick={handleLoginClick}>Log In</a>
                <a className="btn btn-secondary topbar_signup" onClick={handleSignupClick}>Sign Up</a>
            </div>
        )
    }

    renderUserDropdown() {
        const { user, handleLogoutClick } = this.props 
        return (
            <div className="topbar_dropdown">
                <Link to={`/u/${user.get('username')}`} className="topbar_dropdown-option">Profile</Link>
                <a onClick={handleLogoutClick} className="topbar_dropdown-option">Log Out</a>
            </div>
        )   
    }

    render() {
        const { user, app } = this.props;

        // show menu icon if medium width or in room
        const inRoom = this.props.routes[this.props.routes.length-1].path.substring(0, 3) === '/r/'
        const showTopbarMenuIcon = app.get('width') === 'small'
                                || app.get('width') === 'medium'
                                || (app.get('width') === 'room-medium' && inRoom) 

        return (
            <div className="topbar">
                { showTopbarMenuIcon && <div className="topbar_menu-icon" onClick={this.toggleSidebar}><Icon type="menu" /></div> }
                <div className="topbar_logo-container">
                    <span className="topbar_logo"><Link to="/"><Logo /></Link></span>
                    <span className="topbar_logo-small"><Link to="/"><SmallLogo /></Link></span>
                </div>
                <div className="topbar_search">
                    <input className="topbar_search-bar" type="text" placeholder="Search" ref="search_bar" onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
                </div>
                { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
                { this.renderUserDropdown() }
            </div>
        );
    }
}

export default connect()(Topbar);
