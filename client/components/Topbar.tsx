import * as PropTypes from 'prop-types'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { selectSidebar, closeSidebar, toggleDropdown, promptModal, logout, markAllAsRead, loadActivity, clearUpload } from '../actions'
import { Notifications as NotificationsModel, Upload, CurrentUser, App } from '../models'

import Notifications from './pages/Notifications.react'
import Icon from '@components/shared/Icon'
import Logo from '@components/shared/Logo'
import SmallLogo from '@components/shared/SmallLogo'
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
        this.handleUploadClick = this.handleUploadClick.bind(this);

        this.renderNotificationsDropdown = this.renderNotificationsDropdown.bind(this);
        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
    }


    // Events

    toggleSidebar() {
        const { activeOverlay, dispatch } = this.props
        if (activeOverlay === 'sidebar') {
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
        const { width, hasNavigated, dispatch } = this.props
        const { router } = this.context

        if (width === 'small') {
            if (router.isActive('/notifications')) {
                // go back to previous page if available
                if (hasNavigated) {
                    router.goBack();
                } else {
                    // run componentDidMount operations of Notifications component to simulate reload
                    dispatch(loadActivity())
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

    handleUploadClick(e) {
        this.hideSidebar()
        // If user is on upload page and a submission
        // has completed, reset the upload process
        const { dispatch, uploadStackSubmitted } = this.props 
        const { router } = this.context
        if (router.isActive('/upload') && uploadStackSubmitted) {
            dispatch(clearUpload())
        }
    }


    // Render

    renderLoggedIn(includeSmallClass) {
        const { unreadCount, profilePictureUrl, width, uploadStackSubmitted } = this.props;

        const profpicStyle = { backgroundImage: profilePictureUrl ? `url(${profilePictureUrl})` : '' }
        const smallClass = includeSmallClass ? 'topbar_icon-small' : '';

        return [
            <div key='notifications' className={`topbar_icon topbar_icon-notifications dropdown-notifications_toggle ${smallClass}`} onClick={this.toggleNotificationsDropdown}>
                <Icon type="notifications" />
                { unreadCount > 0 && <div className="topbar_notifications-badge" /> }
            </div>,

            <ToggleLink 
                key='upload' 
                disableToggle={width !== 'small' || uploadStackSubmitted}
                className={`topbar_icon topbar_icon-upload ${smallClass}`} 
                to="/upload" 
                onClick={this.handleUploadClick}>
            <Icon type="file-upload" />
            </ToggleLink>,
            
            <div key='user' className={`topbar_icon topbar_icon-user dropdown-topbar_toggle ${smallClass}`} onClick={this.toggleUserDropdown} style={profpicStyle}>
                { !profilePictureUrl && <Icon type="person" /> }
            </div>
        ]
    }

    renderGuest(includeSmallClass) {
        const smallClass = includeSmallClass ? 'topbar_icon-small' : '';

        return [
            <a key='login' className={`topbar_icon btn topbar_login ${smallClass}`} onClick={this.handleLoginClick}>Log In</a>,
            <a key='signup' className={`topbar_icon btn topbar_signup ${smallClass}`} onClick={this.handleSignupClick}>Sign Up</a>
        ]
    }

    renderUserDropdown() {
        const { username } = this.props 
        return (
            <Dropdown type="topbar" triangleMargin={12}>
                <Link to={`/u/${username}`} className="dropdown-option">Profile</Link>
                <a onClick={this.handleLogoutClick} className="dropdown-option">Log Out</a>
            </Dropdown>
        )   
    }

    renderNotificationsDropdown() {
        const { isNotificationsActiveDropdown } = this.props;
        return (
            <Dropdown type="notifications">
                { isNotificationsActiveDropdown && 
                    <div className="topbar_notifications_container">
                        <Notifications />
                    </div> 
                }
            </Dropdown>
        )
    }

    render() {
        const { isLoggedIn, width } = this.props;
        const loggedInClass = isLoggedIn ? 'topbar-logged-in' : 'topbar-guest';

        return (
            <div className="topbar" id="topbar">
                <div className="topbar_inner">
                    <div className="topbar_search-container">
                        <div className="topbar_search">
                            <input className="topbar_search-bar" type="text" placeholder="Search" ref="search_bar" onKeyPress={this.handleSearchKeyPress} /><Icon type="search" />
                        </div>
                    </div>

                    { isLoggedIn && <div className="topbar_icon topbar_icon-menu" onClick={this.toggleSidebar}><Icon type="menu" /></div> }
                    
                    <div className={`topbar_logo-container ${loggedInClass}`}>
                        <span className="topbar_logo" onClick={this.hideSidebar}><Link to="/"><Logo /></Link></span>
                        <span className="topbar_logo-small" onClick={this.hideSidebar}><Link to="/"><SmallLogo /></Link></span>
                    </div>

                    <ToggleLink 
                        disableToggle={width !== 'small'} 
                        className={`topbar_icon topbar_icon-search ${loggedInClass}`} 
                        to="/search" 
                        onClick={this.hideSidebar}>
                    <Icon type="search" />
                    </ToggleLink>

                    <div className="topbar_right">
                        { isLoggedIn ? this.renderLoggedIn(false) : this.renderGuest(false) }
                    </div>
                    { isLoggedIn ? this.renderLoggedIn(true) : this.renderGuest(true) }

                    { this.renderUserDropdown() }
                    { this.renderNotificationsDropdown() }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    let notifications = new NotificationsModel(state)
    let upload = new Upload(state)
    let app = new App(state)
    let currentUser = new CurrentUser(state)

    return {
        isLoggedIn: currentUser.isLoggedIn(),
        username: currentUser.get('username'),
        profilePictureUrl: currentUser.profileThumbnailUrl(),

        width: app.get('width'),
        hasNavigated: app.hasNavigated(),
        activeOverlay: app.get('activeOverlay'),

        isNotificationsActiveDropdown: app.isActiveDropdown('notifications'),
        unreadCount: notifications.unreadCount(),

        uploadStackSubmitted: upload.get('stackSubmitted')
    }
}

Topbar.contextTypes = {
    router: PropTypes.object.isRequired
}

export default connect(mapStateToProps)(Topbar);
