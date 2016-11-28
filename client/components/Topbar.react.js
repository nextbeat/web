import React from 'react'
import { findDOMNode } from 'react-dom'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'

import { selectSidebar, closeSidebar, toggleDropdown, promptModal, logout } from '../actions'

import Icon from './shared/Icon.react'
import Logo from './shared/Logo.react'
import SmallLogo from './shared/SmallLogo.react'
import Dropdown from './shared/Dropdown.react'

class Topbar extends React.Component {

    constructor(props) {
        super(props);

        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.toggleUserDropdown = this.toggleUserDropdown.bind(this);

        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleSignupClick = this.handleSignupClick.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
    }


    // Events

    toggleSidebar() {
        const { app, dispatch } = this.props
        if (app.get('activeOverlay') === 'sidebar') {
            dispatch(closeSidebar())
        } else {
            dispatch(selectSidebar())
        }
    }

    toggleUserDropdown() {
        this.props.dispatch(toggleDropdown('topbar'))
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

    handleLoginClick(e) {
        e.preventDefault()
        this.props.dispatch(promptModal('login'))
    }

    handleSignupClick(e) {
        e.preventDefault()
        this.props.dispatch(promptModal('signup'))
    }           

    handleLogoutClick(e) {
        e.preventDefault()
        this.props.dispatch(logout())
    }


    // Render

    renderLoggedIn() {
        const { user } = this.props;
        const profpic_url = user.profileThumbnailUrl();

        const profpicStyle = { backgroundImage: profpic_url ? `url(${profpic_url})` : '' }

        return (
            <div className="topbar_user">
                <Link to="/upload" className="btn topbar_upload">Upload</Link>
                <span id="dropdown-topbar_toggle" className="topbar_user-icon" onClick={this.toggleUserDropdown} style={profpicStyle}>
                    { !profpic_url && <Icon type="person" /> }
                </span>
            </div>
        )
    }

    renderGuest() {
        const { user } = this.props;
        return (
            <div className="topbar_user">
                <a className="btn topbar_login" onClick={this.handleLoginClick}>Log In</a>
                <a className="btn btn-secondary topbar_signup" onClick={this.handleSignupClick}>Sign Up</a>
            </div>
        )
    }

    renderUserDropdown() {
        const { user, app } = this.props 
        const showUpload = app.get('width') === 'small'
        return (
            <Dropdown type="topbar" triangleMargin={12}>
                <Link to={`/u/${user.get('username')}`} className="dropdown-option">Profile</Link>
                { showUpload && <Link to="/upload" className="dropdown-option">Upload</Link> }
                <a onClick={this.handleLogoutClick} className="dropdown-option">Log Out</a>
            </Dropdown>
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
