import React from 'react'
import { Link } from 'react-router'

import StackItem from '../components/StackItem.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { user, handleLoginClick, handleLogoutClick } = this.props;
        return (
            <div id="sidebar">
                <div className="header">
                    <span className="logo">sodosopa</span>
                    <div className="separator" />
                    { user.isLoggedIn()
                    ? <span className="user">{user.get('username')} / <a onClick={handleLogoutClick} href="#">logout</a></span>
                    : <a className="user" onClick={handleLoginClick} href="#">login</a> } 
                </div>
                {user.isLoggedIn() && 
                    <div>
                        <div className="separator" />
                        <div className="bookmarks">
                            <div className="title">BOOKMARKS</div>
                            {user.bookmarkedStacks().size === 0 && <div className="no-content">You have no open bookmarks.</div>}
                            {user.bookmarkedStacks().map(stack => <Link key={stack.get('id')} to={`/r/${stack.get('id')}`}><StackItem stack={stack} /></Link>)}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Sidebar;
