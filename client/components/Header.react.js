import React from 'react';
import { findDOMNode } from 'react-dom';
import { login } from '../actions';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user && nextProps.user.getIn(['meta', 'error']) !== undefined) {
            $('#login').show();
        }
        if (this.props.user.getIn(['meta', 'isLoggingIn']) && nextProps.user.hasIn(['meta', 'id'])) {
            // user has successfully logged in
            $('#login').hide();
        }
    }

    handleLoginClick(e) {
        e.preventDefault();
        $('#login').toggle();
    }

    handleLogoutClick(e) {
        e.preventDefault();
        this.props.handleLogout();
    }

    handleSubmit(e) {
        e.preventDefault();
        const username = findDOMNode(this.refs.username).value;
        const password = findDOMNode(this.refs.password).value;
        this.props.handleLogin(username, password);
    }

    render() {
        const { user } = this.props;
        return (
            <section id="header">
                <span className="logo">sodosopa</span>
                { user.hasIn(['meta', 'id'])
                    ? <span className="right">{user.getIn(['meta', 'username'])} / <a onClick={this.handleLogoutClick} href="#">logout</a></span>
                    : <a className="right" onClick={this.handleLoginClick} href="#">login</a> } 
                <div id="login">
                    <form id="login-form" onSubmit={this.handleSubmit}>
                        <div>
                            <label>Username: </label>
                            <input type="text" ref="username" name="username"/>
                        </div>
                        <div>
                            <label>Password: </label>
                            <input type="password" ref="password" name="password"/>
                        </div>
                        <div>
                            <input type="submit" value="Log In"/>
                        </div>
                    </form>
                    { user.hasIn(['meta', 'error']) && <div><span className="error">{user.getIn(['meta', 'error'])}</span></div> }
                </div>
            </section>
        );
    }
    
}

export default Header;
