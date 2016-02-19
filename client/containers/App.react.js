import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import Header from '../components/Header.react'
import Sidebar from '../containers/Sidebar.react'

import { connectToXMPP, disconnectXMPP, login, logout, loadBookmarkedStacks } from '../actions'
import { CurrentUser } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleLogoutClick = this.handleLogoutClick.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
    }

    // Component lifecycle

    componentDidMount() {
        const { user, dispatch } = this.props;
        dispatch(connectToXMPP());
        if (user.isLoggedIn()) {
            dispatch(loadBookmarkedStacks());
        }

    }

    componentWillUnmount() {
        this.props.dispatch(disconnectXMPP());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.get('isLoggingIn') && this.props.user.isLoggedIn()) {
            $('#login-container').hide();
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

    handleSubmit(e) {
        e.preventDefault();
        const username = findDOMNode(this.refs.username).value;
        const password = findDOMNode(this.refs.password).value;
        this.props.dispatch(login(username, password));
    }

    dismissLogin(e) {
        e.preventDefault();
        $('#login-container').hide();
    }

    // Render

    renderLogin() {
        const { user } = this.props;
        return (
            <div id="login-container">
                <div id="login">
                    <a onClick={this.dismissLogin}>X</a>
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
                    { user.has('error') && <div><span className="error">{user.get('error')}</span></div> }
                </div>
            </div>
        )
    }

    render() {
        const { user, connected, children } = this.props
        return (
            <section id="container">
                {this.renderLogin()}
                <Sidebar user={user} handleLoginClick={this.handleLoginClick} handleLogoutClick={this.handleLogoutClick} />
                <div id="content">
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
