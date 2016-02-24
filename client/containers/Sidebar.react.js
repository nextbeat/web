import React from 'react'
import { Link } from 'react-router'

import StackItem from '../components/StackItem.react'

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
            <div className="user-info">
                <Link to={`/u/${user.get('username')}`}><span className="user">{user.get('username')}</span></Link>
                <input type="submit" className="logout" onClick={handleLogoutClick} value="Logout" />
            </div>
        )
    }

    renderGuest() {
        const { handleLoginClick, handleSignupClick } = this.props;
        return (
            <div className="user-info">
                <input type="submit" className="login" onClick={handleLoginClick} value="Login" />
                <input type="submit" className="signup" onClick={handleSignupClick} value="Signup" />
            </div>
        )
    }

    renderStackItem(stack) {
        const { user } = this.props;
        return (
            <Link key={stack.get('id')} to={`/r/${stack.get('id')}`} activeClassName="active"><StackItem stack={stack} user={user} /></Link>
        )
    }

    render() {
        const { user } = this.props;
        return (
            <div id="sidebar">
                <div className="header">
                    <span className="logo">sodosopa</span>
                    <div className="separator" />
                    { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
                </div>
                { user.isLoggedIn() && 
                    <div>
                        <div className="separator" />
                        <div className="bookmarks">
                            <div className="title">BOOKMARKS</div>
                            {user.bookmarkedStacks().size === 0 && <div className="no-content">You have no open bookmarks.</div>}
                            {user.bookmarkedStacks().map(stack => this.renderStackItem(stack))}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Sidebar;
