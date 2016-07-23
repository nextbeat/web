import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'

import { CurrentUser, App } from '../models'
import { selectSidebar, closeSidebar } from '../actions'

import StackItem from './shared/StackItem.react'
import Icon from './shared/Icon.react'
import Spinner from './shared/Spinner.react'
import Logo from './shared/Logo.react'
import Badge from './shared/Badge.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
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

    renderLoggedIn() {
        const { user, handleLogoutClick } = this.props; 
        const url = user.profileThumbnailUrl();
        return (
            <div className="sidebar_user-info">
                <Link to={`/u/${user.get('username')}`}>
                    <span className="sidebar_user">
                        <div className="sidebar_icon">{ url ? <img src={url} /> : <Icon type="person" /> }</div> <span>{user.get('username')}</span>
                    </span>
                </Link>
                <a className="sidebar_logout" onClick={handleLogoutClick}>Logout</a>
            </div>
        )
    }

    renderGuest() {
        const { handleLoginClick, handleSignupClick } = this.props;
        return (
            <div className="sidebar_user-info">
                <div className="sidebar_login-buttons">
                    <a className="sidebar_login btn" onClick={handleLoginClick}>Login</a>
                    <a className="sidebar_signup btn btn-secondary" onClick={handleSignupClick}>Signup</a>
                </div>
            </div>
        )
    }

    renderStackItem(stack) {
        const { user } = this.props;
        return (
            <StackItem key={`bk${stack.get('id')}`} stack={stack} user={user} static={true} />
        )
    }

    renderSubscription(sub) {
        const url = sub.get('profpic_thumbnail_url') || sub.get('profpic_url');
        return (
            <Link key={`sub${sub.get('id')}`} to={`/u/${sub.get('username')}`} activeClassName="selected">
                <div className="sidebar_icon">{ url ? <img src={url} /> : <Icon type="person" /> }</div>
                { sub.get('username') }
                { sub.get('open_stacks') > 0 && <Badge elementType="sidebar" type="open" /> }
            </Link>
        )
    }

    renderTag(tag) {
        return (
             <Link key={`c${tag.get('id')}`} to={`/t/${tag.get('name')}`} activeClassName="selected" >
                <div className="sidebar_icon"><img src={tag.get('thumbnail_url')} /></div>
                {tag.get('name')}
             </Link>
        )
    }

    render() {
        const { user, app } = this.props;

        // collapse sidebar by default if window width below threshold
        const inRoom = this.props.routes[this.props.routes.length-1].path.substring(0, 3) === '/r/'
        const collapsedClass = app.get('width') === 'small' 
                                || app.get('width') === 'medium'
                                || (app.get('width') === 'room-medium' && inRoom) 
                                    ? 'collapsed' : ''

        // display collapsed sidebar if selected
        const activeClass = app.get('activeOverlay') === 'sidebar'
                                ? 'active' : ''

        return (
            <div className={`sidebar ${collapsedClass} ${activeClass}`}>
                <div className="sidebar_section sidebar_topnav">
                    <Link to="/" activeClassName="selected">
                        <div className="sidebar_icon"><Icon type="home" /></div>Home
                    </Link>
                    { user.isLoggedIn() && 
                        <Link to={`/u/${user.get('username')}`} activeClassName="selected">
                            <div className="sidebar_icon">{ user.profileThumbnailUrl() ? <img src={user.profileThumbnailUrl()} /> : <Icon type="person" /> }</div>
                            My Profile
                        </Link>
                    }
                    <div className="separator" />
                </div>
                { user.isLoggedIn() && user.isFetchingUserData() && <Spinner type="grey" /> }
                { user.isLoggedIn() && !user.isFetchingUserData() &&
                    <div>
                        <div className="sidebar_bookmarks sidebar_section">
                            <h1>BOOKMARKS</h1>
                            {user.openBookmarkedStacks().size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                            {user.openBookmarkedStacks().map(stack => this.renderStackItem(stack))}
                            <Link to="/bookmarks" className="sidebar_bookmarks-see-all">See All</Link>
                        </div>
                        <div className="separator" />
                        <div className="sidebar_subscriptions sidebar_section">
                            <h1>SUBSCRIPTIONS</h1>
                            {user.subscriptions().size === 0 && <div className="sidebar_no-content">You have no subscriptions.</div>}
                            {user.subscriptions().map(sub => this.renderSubscription(sub))}
                        </div>
                        <div className="separator" />
                    </div>
                }
                <div className="sidebar_categories sidebar_section">
                    <h1>POPULAR TAGS</h1>
                    { app.get('tagsFetching') && <Spinner type="grey" />}
                    { app.tags().map(tag => this.renderTag(tag)) }
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: new CurrentUser(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Sidebar);
