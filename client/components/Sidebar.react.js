import React from 'react'
import { Link, browserHistory } from 'react-router'

import StackItem from './shared/StackItem.react'
import Icon from './shared/Icon.react'
import Spinner from './shared/Spinner.react'
import Logo from './shared/Logo.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
        this.renderStackItem = this.renderStackItem.bind(this);
    }

    componentDidMount() {
        $('.sidebar').on('click', (e) => {
            const $section = $(e.target.closest('.sidebar_section, .sidebar_logo'))
            if ($section.hasClass('sidebar_bookmarks') || $section.hasClass('sidebar_subscriptions') 
                || $section.hasClass('sidebar_categories') || $section.hasClass('sidebar_logo')) 
            {
                $('.sidebar_expanded').removeClass('active-small');
                $('.detail-bar').removeClass('active');
            }  
        })
    }

    componentWillUnmount() {
        $('.sidebar').off('click');
    }

    // Accessors

    toggleActive() {
        if ($('.sidebar').hasClass('collapsed-side')) {
            $('.sidebar_expanded').toggleClass('active-medium');
        } else {
            $('.sidebar_expanded').toggleClass('active-small');
            $('.detail-bar').removeClass('active');
        }
        $(window).resize() // trigger resize event
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
                {sub.get('username')}
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
        return (
            <div className="sidebar">

                <div className="sidebar_expanded">
                    <div className="sidebar_collapse-icon" onClick={this.toggleActive}><Icon type="chevron-left" /></div>
                    <div className="sidebar_section">
                        <span className="sidebar_logo"><Link to="/"><Logo /></Link></span>
                        { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
                    </div>
                    <div className="separator" />
                    { user.isLoggedIn() && user.isFetchingUserData() && <Spinner type="grey" /> }
                    { user.isLoggedIn() && !user.isFetchingUserData() &&
                        <div>
                            <div className="sidebar_bookmarks sidebar_section">
                                <h1>BOOKMARKS</h1>
                                {user.bookmarkedStacks().size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                                {user.bookmarkedStacks().map(stack => this.renderStackItem(stack))}
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

                <div className="sidebar_collapsed">
                    <span className="sidebar_logo"><Link to="/"><Logo /></Link></span>
                    <div className="sidebar_menu-icon" onClick={this.toggleActive}><Icon type="menu" /></div>
                </div>
            </div>
        );
    }
}

export default Sidebar;
