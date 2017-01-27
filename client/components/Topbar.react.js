import React from 'react'
import { findDOMNode } from 'react-dom'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { selectSidebar, closeSidebar, toggleDropdown, promptModal, logout, markAllAsRead, loadNotifications } from '../actions'
import { Notifications as NotificationsModel } from '../models'

import Notifications from './pages/Notifications.react'
import Icon from './shared/Icon.react'
import Logo from './shared/Logo.react'
import SmallLogo from './shared/SmallLogo.react'
import Dropdown from './shared/Dropdown.react'
import ToggleLink from './shared/ToggleLink.react'

class Topbar extends React.Component {

    constructor(props) {
        super(props);

        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.hideSidebar = this.hideSidebar.bind(this);
        this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
        this.toggleNotificationsDropdown = this.toggleNotificationsDropdown.bind(this);

        this.handleSearchKeyPress = this.handleSearchKeyPress.bind(this);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleSignupClick = this.handleSignupClick.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);

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

    hideSidebar() {
        this.props.dispatch(closeSidebar())
    }

    toggleUserDropdown() {
        this.props.dispatch(toggleDropdown('topbar'))
    }

    toggleNotificationsDropdown() {
        const { app, dispatch, routes } = this.props
        const { router } = this.context

        if (app.get('width') === 'small') {
            if (router.isActive('/notifications')) {
                // go back to previous page if available
                if (app.hasNavigated()) {
                    router.goBack();
                } else {
                    // run componentDidMount operations of Notifications component to simulate reload
                    dispatch(markAllAsRead())
                    dispatch(loadNotifications())
                }
            } else {
                // navigate to page instead of showing dropdown
                router.push({ pathname: '/notifications' })
            }
            this.hideSidebar()
        } else {
            dispatch(toggleDropdown('notifications'))
        }
    }

    handleSearchKeyPress(e) {
        if (e.charCode === 13) { // enter
            const query = findDOMNode(this.refs.search_bar).value;
            if (query && query.length > 0) {
                this.context.router.push({
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

    renderLoggedIn(includeSmallClass) {
        const { user, notifications, app } = this.props;

        const profpic_url = user.profileThumbnailUrl();
        const profpicStyle = { backgroundImage: profpic_url ? `url(${profpic_url})` : '' }
        const smallClass = includeSmallClass ? 'topbar_icon-small' : '';
        const unreadCount = notifications.totalUnreadCount();

        return [
            <div key='notifications' id="dropdown-notifications_toggle" className={`topbar_icon topbar_icon-notifications ${smallClass}`} onClick={this.toggleNotificationsDropdown}>
                <Icon type="notifications" />
                { unreadCount > 0 && <div className="topbar_notifications-badge">{unreadCount}</div> }
            </div>,
            <ToggleLink 
                key='upload' 
                disableToggle={app.get('width') !== 'small'}
                className={`topbar_icon topbar_icon-upload ${smallClass}`} 
                to="/upload" 
                onClick={this.hideSidebar}>
            <Icon type="file-upload" />
            </ToggleLink>,
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
            <a key='signup' className={`topbar_icon btn topbar_signup ${smallClass}`} onClick={this.handleSignupClick}>Sign Up</a>
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
                <div className="topbar_inner">
                    <div className="topbar_search-container">
                        <div className="topbar_search">
                            <input className="topbar_search-bar" type="text" placeholder="Search" ref="search_bar" onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
                        </div>
                    </div>

                    { user.isLoggedIn() && <div className="topbar_icon topbar_icon-menu" onClick={this.toggleSidebar}><Icon type="menu" /></div> }
                    
                    <div className={`topbar_logo-container ${loggedInClass}`}>
                        <span className="topbar_logo" onClick={this.hideSidebar}><Link to="/"><Logo /></Link></span>
                        <span className="topbar_logo-small" onClick={this.hideSidebar}><Link to="/"><SmallLogo /></Link></span>
                    </div>

                    <ToggleLink 
                        disableToggle={app.get('width') !== 'small'} 
                        className={`topbar_icon topbar_icon-search ${loggedInClass}`} 
                        to="/search" 
                        onClick={this.hideSidebar}>
                    <Icon type="search" />
                    </ToggleLink>

                    <div className="topbar_right">
                        { user.isLoggedIn() ? this.renderLoggedIn(false) : this.renderGuest(false) }
                    </div>
                    { user.isLoggedIn() ? this.renderLoggedIn(true) : this.renderGuest(true) }

                    { this.renderUserDropdown() }
                    { this.renderNotificationsDropdown() }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        notifications: new NotificationsModel(state)
    }
}

Topbar.contextTypes = {
    router: React.PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Topbar);
