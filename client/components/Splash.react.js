import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { CurrentUser } from '../models'
import { login, signup, clearLogin, clearSignup } from '../actions'

class Splash extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showLogin: true
        }

        this.showLogin = this.showLogin.bind(this);
        this.showSignup = this.showSignup.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.renderSignup = this.renderSignup.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user.isLoggedIn()) {
            this.context.router.push(`/u/${nextProps.user.get('username')}`)
        }
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

    showLogin() {
        this.props.dispatch(clearSignup())
        this.setState({ showLogin: true })
    }

    showSignup() {
        this.props.dispatch(clearLogin())
        this.setState({ showLogin: false })
    }

    renderLogin() {
        const { user } = this.props;
        return (
            <div>
                <div className="splash_form-container">
                    <form id="splash-login-form" autocomplete="off">
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input className="input-hack" type="password" name="anotherfakename" />
                        <div>
                            <input type="text" autocomplete="off" ref="login_username" name="login_username" placeholder="Username"/>
                        </div>
                        <div>
                            <input type="password" autocomplete="off" ref="login_password" name="login_password" placeholder="Password"/>
                        </div>
                        <div>
                            <a className="btn" onClick={this.handleLoginSubmit}>Log In</a>
                        </div>
                    </form>
                    {user.has('loginError') && <span className="splash_error">{user.get('loginError')}</span>}
                </div>
                <div className="splash_options">
                    <p>Don't have an account? <a onClick={this.showSignup}>Sign up</a></p>
                    <p className="splash_forgot"><Link to="/support/password-reset-request">Forgot your password?</Link></p>
                </div>
            </div>
        );
    }

    renderSignup() {
        const { user } = this.props;
        return (
            <div>
                <div className="splash_form-container">
                    <form id="splash-signup-form" autocomplete="off">
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input style={{display: "none"}} type="password" name="anotherfakename" />
                        <div>
                            <input type="text" autocomplete="off" ref="signup_email" name="signup_email" placeholder="Email"/>
                        </div>
                        <div>
                            <input type="text" autocomplete="off" ref="signup_username" name="signup_username" placeholder="Username"/>
                        </div>
                        <div>
                            <input type="password" autocomplete="off" ref="signup_password" name="signup_password" placeholder="Password"/>
                        </div>
                        <div>
                            <a className="btn" onClick={this.handleSignupSubmit}>Sign Up</a>
                        </div>
                    </form>
                    {user.has('signupError') && <span className="splash_error">{user.get('signupError')}</span>}
                </div>
                <div className="splash_options">
                    Have an account already? <a onClick={this.showLogin}>Log in</a>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="splash">
                <div className="splash_main">
                    <div className="splash_logo">SODOSOPA</div>
                    <div className="splash_description">Transforming South Park's lower-income neighborhoods into vibrant cultural hubs... <br />so you don't have to.</div>
                </div>
                <div className="splash_auth-container">
                    { this.state.showLogin ? this.renderLogin() : this.renderSignup() }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: new CurrentUser(state)
    }
}

Splash.contextTypes = {
  router: React.PropTypes.object
};

export default connect(mapStateToProps)(Splash)
