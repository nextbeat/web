import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import Sidebar from '../components/Sidebar.react'
import Topbar from '../components/Topbar.react'
import AppBanner from '../components/shared/AppBanner.react'

import { connectToXMPP, disconnectXMPP, login, logout, signup, clearLogin, clearSignup, postLogin, loadTags, clearApp, onBeforeUnload } from '../actions'
import { CurrentUser, App as AppModel } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);

        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleSignupClick = this.handleSignupClick.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.setTitle = this.setTitle.bind(this);

        this.renderLogin = this.renderLogin.bind(this);
        this.renderSignup = this.renderSignup.bind(this);
        this.dismissLogin = this.dismissLogin.bind(this);
        this.dismissSignup = this.dismissSignup.bind(this);

        this.state = {
            showLoginModal: false,
            showSignupModal: false
        }
    }

    // Component lifecycle

    componentDidMount() {
        const { user, dispatch } = this.props;
        dispatch(connectToXMPP());
        dispatch(loadTags());
        if (user.isLoggedIn()) {
            dispatch(postLogin());
        }

        $(window).on('beforeunload', this.handleBeforeUnload);
    }

    componentWillUnmount() {
        $(window).off('beforeunload', this.handleBeforeUnload);
        this.props.dispatch(clearApp());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.get('isLoggingIn') && this.props.user.isLoggedIn()) {
            this.setState({
                showLoginModal: false,
                showSignupModal: false
            })
        }

        if (this.props.app.hasAuthError()) {
            this.setState({
                showLoginModal: true,
                showSignupModal: false
            })
        }
    }

    // Events

    handleBeforeUnload() {
        this.props.dispatch(onBeforeUnload())
    }

    // Login

    handleLoginClick(e) {
        e.preventDefault();
        this.setState({
            showLoginModal: true,
            showSignupModal: false
        })
    }

    handleLogoutClick(e) {
        e.preventDefault();
        this.props.dispatch(logout());
    }

    handleSignupClick(e) {
        e.preventDefault();
        this.setState({
            showLoginModal: false,
            showSignupModal: true
        })
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
        this.setState({
            showLoginModal: false
        })
    }

    dismissSignup(e) {
        e.preventDefault();
        this.props.dispatch(clearSignup());
        this.setState({
            showSignupModal: false
        })
    }

    handleKeyPress(fn, e) {
        if (e.charCode === 13) { // enter
            fn(e)
        }
    }

    // Render

    setTitle() {
        const { app, user } = this.props;
        const environment = app.get('environment', 'development');
        const fbAppId = app.get('facebookAppId');

        let envLabel = '';
        switch (environment) {
            case 'development':
                envLabel = '[DEV] ';
                break;
            case 'local':
                envLabel = '[LOCAL] ';
                break;
            case 'mac':
                envLabel = '[MAC] ';
                break;
            case 'production':
            default:
                break;
        }

        let badge = '';
        let count = user.totalUnreadNotificationCount(true);
        if (count > 0) {
            badge = `(${count}) `
        }

        return (
            <Helmet
                defaultTitle = {`${badge}${envLabel}Nextbeat`}
                titleTemplate = {`${badge}${envLabel}%s - Nextbeat`}
                meta={[
                    {"property": "og:site_name", "content": "Nextbeat"},
                    {"property": "fb:app_id", "content": fbAppId},
                    {"property": "al:ios:url", "content": "nextbeat://"},
                    {"property": "al:ios:app_store_id", "content": "1101932727"},
                    {"property": "al:ios:app_name", "content": "Nextbeat"}
                ]}
            />
        );
    }

    renderLogin() {
        const { user } = this.props;
        const { showLoginModal } = this.state;
        return (
            <div id="login-container" className="modal-container" style={{ display: (showLoginModal ? 'block' : 'none') }}>
                <div id="login" className="modal modal-auth">
                    <div className="modal_close" onClick={this.dismissLogin} />
                    <form className="modal_form" id="login-form" onKeyPress={this.handleKeyPress.bind(this, this.handleLoginSubmit)}>
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
                    <div className="modal_extra">Don't have an account? <a onClick={this.handleSignupClick}>Sign up!</a></div>
                    { user.has('loginError') && <div className="modal-auth_error">{user.get('loginError')}</div> }
                </div>
            </div>
        )
    }

    renderSignup() {
        const { user } = this.props;
        const { showSignupModal } = this.state;
        return (
            <div id="signup-container" className="modal-container" style={{ display: (showSignupModal ? 'block' : 'none') }}>
                <div id="signup" className="modal modal-auth">
                    <div className="modal_close" onClick={this.dismissSignup} />
                    <form className="modal_form" id="signup-form" onKeyPress={this.handleKeyPress.bind(this, this.handleSignupSubmit)} >
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input style={{display: "none"}} type="password" name="anotherfakename" />
                        <div className="modal_input-wrapper">
                            <input type="text" ref="signup_email" name="signup_email" placeholder="Email" />
                        </div>
                        <div className="modal_input-wrapper">
                            <input type="text" autoComplete="off" ref="signup_username" name="signup_username" placeholder="Username" />
                        </div>
                        <div className="modal_input-wrapper">
                            <input type="password" autoComplete="new-password" ref="signup_password" name="signup_password" placeholder="Password" />
                        </div>
                        <div className="modal_input-wrapper">
                            <a className="btn btn-secondary modal_form_submit" onClick={this.handleSignupSubmit}>Sign Up</a>
                        </div>
                    </form>
                    { user.has('signupError') && <div className="modal-auth_error">{user.get('signupError')}</div> }
                </div>
            </div>
        )
    }

    render() {
        const { user, app, connected, children } = this.props;
        const barProps = {
            user,
            app,
            handleLoginClick: this.handleLoginClick,
            handleLogoutClick: this.handleLogoutClick,
            handleSignupClick: this.handleSignupClick
        }
        return (
            <section className="app-container">
                {this.setTitle()}
                {this.renderLogin()}
                {this.renderSignup()}
                <Topbar {...barProps} />
                <div className="main-container">
                    <Sidebar {...barProps} />
                    <div className="main">
                        {React.cloneElement(children, { user, connected })}
                    </div>
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
