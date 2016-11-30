import React from 'react'
import { findDOMNode } from 'react-dom'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'

import { selectSidebar, closeSidebar, toggleDropdown, promptModal, logout } from '../actions'
import { Notifications as NotificationsModel } from '../models'

import Notifications from './Notifications.react'
import Icon from './shared/Icon.react'
import Logo from './shared/Logo.react'
import SmallLogo from './shared/SmallLogo.react'
import Dropdown from './shared/Dropdown.react'

class Topbar extends React.Component {

    constructor(props) {
        super(props);

        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
        this.toggleNotificationsDropdown = this.toggleNotificationsDropdown.bind(this);

        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleSignupClick = this.handleSignupClick.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);

        this.sidebarIsHidden = this.sidebarIsHidden.bind(this);

        this.renderNotificationsDropdown = this.renderNotificationsDropdown.bind(this);
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

    toggleNotificationsDropdown() {
        const { app, dispatch } = this.props
        if (app.get('width') === 'small') {
            // navigate to page instead of showing dropdown
            browserHistory.push({ pathname: '/notifications' })
        } else {
            dispatch(toggleDropdown('notifications'))
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


    // Queries

    sidebarIsHidden() {
        const { user, app, routes } = this.props;

        // show menu icon if medium width or in room
        const inRoom = routes[routes.length-1].path.substring(0, 3) === '/r/'
        return app.get('width') === 'small'
            || app.get('width') === 'medium'
            || (app.get('width') === 'room-medium' && inRoom) 
    }


    // Render

    renderLoggedIn(includeSmallClass) {
        const { user, notifications } = this.props;

        const profpic_url = user.profileThumbnailUrl();
        const profpicStyle = { backgroundImage: profpic_url ? `url(${profpic_url})` : '' }
        const smallClass = includeSmallClass ? 'topbar_icon-small' : '';
        const unreadCount = notifications.totalUnreadCount();

        return [
            <div key='notifications' id="dropdown-notifications_toggle" className={`topbar_icon topbar_icon-notifications ${smallClass}`} onClick={this.toggleNotificationsDropdown}>
                <Icon type="notifications" />
                { unreadCount > 0 && <div className="topbar_notifications-badge">{unreadCount}</div> }
            </div>,
            <Link key='upload' className={`topbar_icon topbar_icon-upload ${smallClass}`} to="/upload"><Icon type="file-upload" /></Link>,
            <div key='user' id="dropdown-topbar_toggle" className={`topbar_icon topbar_icon-user ${smallClass}`} onClick={this.toggleUserDropdown} style={profpicStyle}>
                { !profpic_url && <Icon type="person" /> }
            </div>
        ]
    }

    renderGuest(includeSmallClass) {
        const { user } = this.props;
        const smallClass = includeSmallClass ? 'topbar_icon-small' : '';

        return [
            <a key='login' className={`topbar_icon btn topbar_login ${smallClass}`} onClick={this.handleLoginClick}>Log In</a>,
            <a key='signup' className={`topbar_icon btn btn-secondary topbar_signup ${smallClass}`} onClick={this.handleSignupClick}>Sign Up</a>
        ]
    }

    renderUserDropdown() {
        const { user, app } = this.props 
        return (
            <Dropdown type="topbar" triangleMargin={12}>
                <Link to={`/u/${user.get('username')}`} className="dropdown-option">Profile</Link>
                <a onClick={this.handleLogoutClick} className="dropdown-option">Log Out</a>
            </Dropdown>
        )   
    }

    renderNotificationsDropdown() {
        const { app } = this.props;
        return (
            <Dropdown type="notifications">
                { app.isActiveDropdown('notifications') && 
                    <div className="topbar_notifications_container">
                        <Notifications />
                    </div> 
                }
            </Dropdown>
        )
    }

    render() {
        const { user, app } = this.props;
        const loggedInClass = user.isLoggedIn() ? 'topbar-logged-in' : 'topbar-guest';

        return (
            <div className="topbar">
                { this.sidebarIsHidden() && <div className="topbar_icon topbar_icon-menu" onClick={this.toggleSidebar}><Icon type="menu" /></div> }
                
                <div className={`topbar_logo-container ${loggedInClass}`}>
                    <span className="topbar_logo"><Link to="/"><Logo /></Link></span>
                    <span className="topbar_logo-small"><Link to="/"><SmallLogo /></Link></span>
                </div>

                <Link className={`topbar_icon topbar_icon-search ${loggedInClass}`} to="/search"><Icon type="search" /></Link>
                <div className={`topbar_search ${loggedInClass}`}>
                    <input className="topbar_search-bar" type="text" placeholder="Search" ref="search_bar" onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
                </div>

                <div className="topbar_right">
                    { user.isLoggedIn() ? this.renderLoggedIn(false) : this.renderGuest(false) }
                </div>
                { user.isLoggedIn() ? this.renderLoggedIn(true) : this.renderGuest(true) }

                { this.renderUserDropdown() }
                { this.renderNotificationsDropdown() }

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        notifications: new NotificationsModel(state)
    }
}

export default connect(mapStateToProps)(Topbar);
