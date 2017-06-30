import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { CurrentUser, App } from '../models'
import { selectSidebar, closeSidebar } from '../actions'
import { secureUrl } from '../utils'

import StackItem from './shared/StackItem.react'
import Icon from './shared/Icon.react'
import Spinner from './shared/Spinner.react'
import Logo from './shared/Logo.react'
import Badge from './shared/Badge.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderStackItem = this.renderStackItem.bind(this);
    }

    componentDidMount() {
        $('.sidebar').on('click', (e) => {
            const $section = $(e.target.closest('.sidebar_section'))
            if ($section.hasClass('sidebar_bookmarks') || $section.hasClass('sidebar_subscriptions') 
                || $section.hasClass('sidebar_categories') || $section.hasClass('sidebar_topnav')) 
            {
                this.props.dispatch(closeSidebar())
            }  
        })
    }

    componentWillUnmount() {
        $('.sidebar').off('click');
    } 

    // Render

    renderStackItem(stack) {
        return (
            <StackItem key={`bk${stack.get('id')}`} stack={stack} static={true} showBadge={true} />
        )
    }

    renderSubscription(sub) {
        const url = secureUrl(sub.thumbnail('small').get('url'))
        const iconStyle = url ? { backgroundImage: `url(${url})`} : {}
        return (
            <Link key={`sub${sub.get('id')}`} to={`/u/${sub.get('username')}`} activeClassName="selected" className="sidebar_item">
                <div className="sidebar_icon" style={iconStyle}>{ !url && <Icon type="person" /> }</div>
                { sub.get('username') }
                { sub.get('open_stacks') > 0 && <Badge elementType="sidebar" type="open" /> }
            </Link>
        )
    }

    render() {
        const { isLoggedIn, activeOverlay, sidebarAnimating, sidebarDataIsLoaded,
                username, profilePictureUrl, openBookmarkedStacks, subscriptions } = this.props;

        // hide sidebar if user is not logged in
        const guestClass = isLoggedIn ? '' : 'no-sidebar'

        // display sidebar if selected
        const activeClass = activeOverlay === 'sidebar' ? 'active' : ''
        const animatingClass = sidebarAnimating ? 'animating' : ''

        // set style for displaying profile picture
        const profileStyle = { backgroundImage: profilePictureUrl ? `url(${profilePictureUrl})` : ''}

        return (
            <div className={`sidebar ${activeClass} ${guestClass} ${animatingClass}`} id='sidebar'>
                { sidebarDataIsLoaded &&
                <div>
                    <div className="sidebar_section sidebar_topnav">
                        <Link to="/" activeClassName="selected" className="sidebar_item">
                            <div className="sidebar_icon"><Icon type="home" /></div>Home
                        </Link>
                        <Link to={`/u/${username}`} activeClassName="selected" className="sidebar_item">
                            <div className="sidebar_icon" style={profileStyle}>{ !profilePictureUrl && <Icon type="person" /> }</div>
                            My Profile
                        </Link>
                    </div>
                    <div className="sidebar_bookmarks sidebar_section">
                        <Link to="/bookmarks" className="sidebar_header">BOOKMARKS</Link>
                        {openBookmarkedStacks.size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                        {openBookmarkedStacks.map(stack => this.renderStackItem(stack))}
                    </div>
                    <div className="sidebar_subscriptions sidebar_section">
                        <Link to="/subscriptions" className="sidebar_header">SUBSCRIPTIONS</Link>
                        {subscriptions.size === 0 && <div className="sidebar_no-content">You have no subscriptions.</div>}
                        {subscriptions.map(sub => this.renderSubscription(sub))}
                    </div>
                </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    let currentUser = new CurrentUser(state)
    let app = new App(state)
    return {
        isLoggedIn: currentUser.isLoggedIn(),
        username: currentUser.get('username'),
        profilePictureUrl: currentUser.profileThumbnailUrl(),
        sidebarDataIsLoaded: currentUser.sidebarDataIsLoaded(),

        activeOverlay: app.get('activeOverlay'),
        sidebarAnimating: app.get('sidebarAnimating'),

        openBookmarkedStacks: currentUser.openBookmarkedStacks(),
        subscriptions: currentUser.subscriptions()
    }
}

export default connect(mapStateToProps)(Sidebar);
