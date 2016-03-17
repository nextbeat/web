import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Sidebar from '../components/Sidebar.react'

import { connectToXMPP, disconnectXMPP, login, logout, signup, clearLogin, clearSignup, postLogin, loadTags, clearApp } from '../actions'
import { CurrentUser, App as AppModel } from '../models'

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
        dispatch(loadTags());
        if (user.isLoggedIn()) {
            dispatch(postLogin());
        }

    }

    componentWillUnmount() {
        this.props.dispatch(disconnectXMPP());
        this.props.dispatch(clearApp());
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
                <div id="login" className="modal modal-auth">
                    <div className="modal_close" onClick={this.dismissLogin} />
                    <form className="modal_form" id="login-form">
                        <div className="modal_input-wrapper">
                            <input type="text" ref="login_username" name="login_username" placeholder="Username" />
                        </div>
                        <div className="modal_input-wrapper">
                            <input className="modal-login_password" type="password" ref="login_password" name="login_password" placeholder="Password" />
                            <a href="/support/password-reset-request" className="modal-login_forgot">Forgot?</a>
                        </div>
                        <div className="modal_input-wrapper">
                            <a className="btn modal_form_submit" onClick={this.handleLoginSubmit}>Log In</a>
                        </div>
                    </form>
                    { user.has('loginError') && <div className="modal-auth_error">{user.get('loginError')}</div> }
                </div>
            </div>
        )
    }

    renderSignup() {
        const { user } = this.props;
        return (
            <div id="signup-container" className="modal-container">
                <div id="signup" className="modal modal-auth">
                    <div className="modal_close" onClick={this.dismissSignup} />
                    <form className="modal_form" id="signup-form" >
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input style={{display: "none"}} type="password" name="anotherfakename" />
                        <div className="modal_input-wrapper">
                            <input type="text" ref="signup_email" name="signup_email" placeholder="Email" />
                        </div>
                        <div className="modal_input-wrapper">
                            <input type="text" autocomplete="off" ref="signup_username" name="signup_username" placeholder="Username" />
                        </div>
                        <div className="modal_input-wrapper">
                            <input type="password" autocomplete="new-password" ref="signup_password" name="signup_password" placeholder="Password" />
                        </div>
                        <div className="modal_input-wrapper">
                            <a className="btn modal_form_submit" onClick={this.handleSignupSubmit}>Sign Up</a>
                        </div>
                    </form>
                    { user.has('signupError') && <div className="modal-auth_error">{user.get('signupError')}</div> }
                </div>
            </div>
        )
    }

    render() {
        const { user, app, connected, children } = this.props;
        const sidebarProps = {
            user,
            app,
            handleLoginClick: this.handleLoginClick,
            handleLogoutClick: this.handleLogoutClick,
            handleSignupClick: this.handleSignupClick
        }
        return (
            <section className="app-container">
                {this.renderLogin()}
                {this.renderSignup()}
                <Sidebar {...sidebarProps} />
                <div className="main">
                    {React.cloneElement(children, { user, connected })}
                </div>
            </section>
        );
    }
}

function mapStateToProps(state, props) {
    const user = new CurrentUser(state)
    const app = new AppModel(state)

    return {
        user,
        app,
        connected: user.get('connected')
    }
}

export default connect(mapStateToProps)(App);
