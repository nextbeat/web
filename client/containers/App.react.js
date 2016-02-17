import React from 'react'
import { connect } from 'react-redux'

import Header from '../components/Header.react'

import { connectToXMPP, login, logout } from '../actions'

class App extends React.Component {

    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(connectToXMPP());
    }

    componentWillUnmount() {
        // todo: disconnect from xmpp
    }

    handleLogin(username, password) {
        this.props.dispatch(login(username, password));
    }

    handleLogout() {
        this.props.dispatch(logout())
    }

    render() {
        const { user, connected, children } = this.props
        return (
        <section>
            <Header user={user} handleLogin={this.handleLogin} handleLogout={this.handleLogout} />
            {React.cloneElement(children, { user, connected })}
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    const user = state.get('user');
    const connected = state.getIn(['live', 'connected'], false);

    return {
        user,
        connected
    }
}

export default connect(mapStateToProps)(App);
