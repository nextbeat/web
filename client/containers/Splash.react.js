import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

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
                <div className="form-container">
                    <form id="splash-login-form" autocomplete="off" onSubmit={this.handleLoginSubmit}>
                        <input style={{display: "none"}} type="text" name="somefakename" />
                        <input className="input-hack" type="password" name="anotherfakename" />
                        <div>
                            <input type="text" autocomplete="off" ref="login_username" name="login_username" placeholder="Username"/>
                        </div>
                        <div>
                            <input type="password" autocomplete="off" ref="login_password" name="login_password" placeholder="Password"/>
                        </div>
                        <div>
                            <input type="submit" value="Log In"/>
                        </div>
                    </form>
                    {user.has('loginError') && <span className="error">{user.get('loginError')}</span>}
                </div>
                <div className="options">
                    Don't have an account? <a onClick={this.showSignup}>Sign up</a>
                </div>
            </div>
        );
    }

    renderSignup() {
        const { user } = this.props;
        return (
            <div>
                <div className="form-container">
                    <form id="splash-signup-form" autocomplete="off" onSubmit={this.handleSignupSubmit}>
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
                            <input type="submit" value="Sign Up"/>
                        </div>
                    </form>
                    {user.has('signupError') && <span className="error">{user.get('signupError')}</span>}
                </div>
                <div className="options">
                    Have an account already? <a onClick={this.showLogin}>Log in</a>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div id="splash">
                <div className="main">
                    <div className="logo">SODOSOPA</div>
                    <div className="description">Transforming South Park's lower-income neighborhoods into vibrant cultural hubs... <br />so you don't have to.</div>
                </div>
                <div className="login-container">
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
