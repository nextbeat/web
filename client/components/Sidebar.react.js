import React from 'react'
import { Link } from 'react-router'

import StackItem from './shared/StackItem.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
        this.renderStackItem = this.renderStackItem.bind(this);
    }

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
                <div className="sidebar_header">
                    <span className="sidebar_logo"><Link to="/">sodosopa</Link></span>
                    { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
                    <div className="separator" />
                </div>
                { user.isLoggedIn() && 
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
                    </div>
                }
                <div className="sidebar_categories">
                    <h1>CATEGORIES</h1>
                    { app.channels().map(channel => <Link key={`c${channel.get('id')}`} to={`/c/${channel.get('name')}`} activeClassName="selected" >{channel.get('name')}</Link>) }
                </div>
            </div>
        );
    }
}

export default Sidebar;
