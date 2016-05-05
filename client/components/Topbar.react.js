import React from 'react'
import { Link } from 'react-router'

import Icon from './shared/Icon.react'
import Logo from './shared/Logo.react'

class Topbar extends React.Component {

    constructor(props) {
        super(props);

        this.renderLoggedIn = this.renderLoggedIn.bind(this);
        this.renderGuest = this.renderGuest.bind(this);
    }

    renderLoggedIn() {
        const { user, handleLogoutClick } = this.props;
        return (
            <div className="topbar_user">
                <Link className="topbar_username">{ user.get('username') }</Link>
                <a className="topbar_logout" onClick={handleLogoutClick}>Log Out</a>
            </div>
        )
    }

    renderGuest() {
        const { user, handleLoginClick, handleSignupClick } = this.props;
        return (
            <div className="topbar_user">
                <a className="btn topbar_login" onClick={handleLoginClick}>Log In</a>
                <a className="btn btn-secondary topbar_signup" onClick={handleSignupClick}>Sign Up</a>
            </div>
        )
    }

    render() {
        const { user } = this.props;
        return (
            <div className="topbar">
                <div className="topbar_logo-container"><span className="topbar_logo"><Link to="/"><Logo /></Link></span></div>
                <div className="topbar_search">
                    <input className="topbar_search-bar" type="text" placeholder="Search" /><Icon type="search" />
                </div>
                { user.isLoggedIn() ? this.renderLoggedIn() : this.renderGuest() }
            </div>
        );
    }
}

export default Topbar;
