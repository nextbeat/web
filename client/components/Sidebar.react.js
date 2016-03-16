import React from 'react'
import { Link, browserHistory } from 'react-router'

import StackItem from './shared/StackItem.react'
import Icon from './shared/Icon.react'
import Spinner from './shared/Spinner.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
        this.renderStackItem = this.renderStackItem.bind(this);
    }

    // Lifecycle

    resize() {
        const contentWidth = parseInt($('.content').css('width'));
        const sidebarWidth = parseInt($('.sidebar').css('width'));
        const $detailBar = $('.detail-bar');
        const detailBarIsClosed = $.contains(document.documentElement, $detailBar[0]) && $detailBar.hasClass('closed');
        if (contentWidth + sidebarWidth < 700 || detailBarIsClosed) {
            $('.sidebar').addClass('closed');
            $('.sidebar').removeClass('open');
            $('.main').addClass('expand-left');
        } else {
            $('.sidebar').addClass('open');
            $('.sidebar').removeClass('closed');
            $('.main').removeClass('expand-left');
        }

    }

    componentDidMount() {
        // update sidebar width on resize or on router change
        $(window).resize(this.resize);
        browserHistory.listen(function(e) {
            process.nextTick(function() {
                this.resize();
            }.bind(this))
        }.bind(this))
        this.resize();
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    // Accessors

    setActive() {
        $('.sidebar_expanded').addClass('active');
    }   

    setInactive() {
        $('.sidebar_expanded').removeClass('active');
    }

    // Render

    renderLoggedIn() {
        const { user, handleLogoutClick } = this.props; 
        return (
            <div className="sidebar_user-info">
                <Link to={`/u/${user.get('username')}`}><span className="sidebar_user">{user.get('username')}</span></Link>
                <a className="sidebar_logout" onClick={handleLogoutClick}>Logout</a>
            </div>
        )
    }

    renderGuest() {
        const { handleLoginClick, handleSignupClick } = this.props;
        return (
            <div className="sidebar_user-info">
                <a className="sidebar_login btn" onClick={handleLoginClick}>Login</a>
                <a className="sidebar_signup btn" onClick={handleSignupClick}>Signup</a>
            </div>
        )
    }

    renderStackItem(stack) {
        const { user } = this.props;
        return (
            <StackItem key={stack.get('id')} stack={stack} user={user} />
        )
    }

    render() {
        const { user, app } = this.props;
        return (
            <div className="sidebar">
                <div className="sidebar_expanded">
                    <div className="sidebar_collapse-icon" onClick={this.setInactive}><Icon type="chevron-left" /></div>
                    <div className="sidebar_header">
                        <span className="sidebar_logo"><Link to="/">sodosopa</Link></span>
                        { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
                        <div className="separator" />
                    </div>
                    { user.isLoggedIn() && user.isFetchingUserData() && <Spinner type="grey" /> }
                    { user.isLoggedIn() && !user.isFetchingUserData() &&
                        <div>
                            <div className="sidebar_bookmarks">
                                <h1>BOOKMARKS</h1>
                                {user.bookmarkedStacks().size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                                {user.bookmarkedStacks().map(stack => this.renderStackItem(stack))}
                            </div>
                            <div className="separator" />
                            <div className="sidebar_subscriptions">
                                <h1>SUBSCRIPTIONS</h1>
                                {user.subscriptions().size === 0 && <div className="sidebar_no-content">You have no subscriptions.</div>}
                                {user.subscriptions().map(sub => <Link key={`sub${sub.get('id')}`} to={`/u/${sub.get('username')}`} activeClassName="selected" >{sub.get('username')}</Link>)}
                            </div>
                            <div className="separator" />
                        </div>
                    }
                    <div className="sidebar_categories">
                        <h1>CATEGORIES</h1>
                        { app.get('channelsFetching') && <Spinner type="grey" />}
                        { app.channels().map(channel => <Link key={`c${channel.get('id')}`} to={`/c/${channel.get('name')}`} activeClassName="selected" >{channel.get('name')}</Link>) }
                    </div>
                </div>
                <div className="sidebar_collapsed">
                    <div onClick={this.setActive}><Icon type="menu" /></div>
                </div>
            </div>
        );
    }
}

export default Sidebar;
