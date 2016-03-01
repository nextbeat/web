import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Sidebar from '../components/Sidebar.react'

import { connectToXMPP, disconnectXMPP, login, logout, signup, clearLogin, clearSignup, postLogin } from '../actions'
import { CurrentUser } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.renderSignup = this.renderSignup.bind(this);
        this.dismissLogin = this.dismissLogin.bind(this);
        this.dismissSignup = this.dismissSignup.bind(this);
    }

    // Component lifecycle

    componentDidMount() {
        const { user, dispatch } = this.props;
        dispatch(connectToXMPP());
        if (user.isLoggedIn()) {
            dispatch(postLogin());
        }

    }

    componentWillUnmount() {
        this.props.dispatch(disconnectXMPP());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.get('isLoggingIn') && this.props.user.isLoggedIn()) {
            $('#login-container').hide();
            $('#signup-container').hide();
        }
    }

    // Login

    handleLoginClick(e) {
        e.preventDefault();
        $('#login-container').toggle();
    }

    handleLogoutClick(e) {
        e.preventDefault();
        this.props.dispatch(logout());
    }

    handleSignupClick(e) {
        e.preventDefault();
        $('#signup-container').toggle();
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const username = findDOMNode(this.refs.login_username).value;
        const password = findDOMNode(this.refs.login_password).value;
        this.props.dispatch(login(username, password));
    }

    handleSignupSubmit(e) {
        e.preventDefault();
        const email = findDOMNode(this.refs.signup_email).value;
        const username = findDOMNode(this.refs.signup_username).value;
        const password = findDOMNode(this.refs.signup_password).value;
        this.props.dispatch(signup({ email, username, password }));
    }   

    dismissLogin(e) {
        e.preventDefault();
        this.props.dispatch(clearLogin());
        $('#login-container').hide();
    }

    dismissSignup(e) {
        e.preventDefault();
        this.props.dispatch(clearSignup());
        $('#signup-container').hide();
    }

    // Render

    renderLogin() {
        const { user } = this.props;
        return (
            <div id="login-container" className="modal-container">
                <div id="login" className="modal-login">
                    <a className="close" onClick={this.dismissLogin}>X</a>
                    <form id="login-form" onSubmit={this.handleLoginSubmit}>
                        <div>
                            <input type="text" ref="login_username" name="login_username" placeholder="Username" />
                        </div>
                        <div>
                            <input type="password" ref="login_password" name="login_password" placeholder="Password" />
                        </div>
                        <div>
                            <input type="submit" value="Log In"/>
                        </div>
                    </form>
                    { user.has('loginError') && <div><span className="error">{user.get('loginError')}</span></div> }
                    <p><Link to="/support/password-reset-request">Forgot your password?</Link></p>
                </div>
            </div>
        )
    }

    renderSignup() {
        const { user } = this.props;
        return (
            <div id="signup-container" className="modal-container">
                <div id="signup" className="modal-login">
                    <a className="close" onClick={this.dismissSignup}>X</a>
                    <form id="signup-form" onSubmit={this.handleSignupSubmit} >
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input style={{display: "none"}} type="password" name="anotherfakename" />
                        <div>
                            <input type="text" ref="signup_email" name="signup_email" placeholder="Email" />
                        </div>
                        <div>
                            <input type="text" autocomplete="off" ref="signup_username" name="signup_username" placeholder="Username" />
                        </div>
                        <div>
                            <input type="password" autocomplete="new-password" ref="signup_password" name="signup_password" placeholder="Password" />
                        </div>
                        <div>
                            <input type="submit" value="Sign Up"/>
                        </div>
                    </form>
                    { user.has('signupError') && <div><span className="error">{user.get('signupError')}</span></div> }
                </div>
            </div>
        )
    }

    render() {
        const { user, connected, children } = this.props;
        return (
            <section className="app-container">
                {this.renderLogin()}
                {this.renderSignup()}
                <Sidebar user={user} handleLoginClick={this.handleLoginClick} handleLogoutClick={this.handleLogoutClick} handleSignupClick={this.handleSignupClick} />
                <div className="main">
                    {React.cloneElement(children, { user, connected })}
                </div>
            </section>
        );
    }
}

function mapStateToProps(state, props) {
    const user = new CurrentUser(state)

    return {
        user,
        connected: user.get('connected')
    }
}

export default connect(mapStateToProps)(App);
