import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { Map, List } from 'immutable'

import Media from '../containers/Media.react'
import Chat from '../containers/Chat.react'
import Header from '../components/Header.react'
import Info from '../components/Info.react'

import { loadStack, connectToXMPP, joinRoom, login, logout } from '../actions'
import { getEntity } from '../utils'

class Theater extends React.Component {

    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentDidMount() {
        const { id, dispatch } = this.props
        dispatch(loadStack(id))
        dispatch(connectToXMPP());
    }


    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') > 0 && nextProps.connected && !nextProps.roomJoined) {
            // stack is loaded and xmpp is connected
            this.props.dispatch(joinRoom(nextProps.stack));
        }
    }

    handleLogin(username, password) {
        this.props.dispatch(login(username, password));
    }

    handleLogout() {
        this.props.dispatch(logout())
    }

    render() {
        const { isFetching, error, stack, author, user } = this.props
        return (
        <section>
            <Header user={user} handleLogin={this.handleLogin} handleLogout={this.handleLogout} />
            {isFetching && <p>Loading...</p>}
            {error && error.length > 0 && <p>Could not load stack.</p>}
            <div id="theater">
                <section id="theater-main">
                    <Media stack={stack}/>
                    <Info stack={stack} author={author} />
                </section>
                <Chat stack={stack} user={user} />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    const stack = getEntity(state, 'stacks', props.id);
    const author = getEntity(state, 'users', stack.get('author', 0));
    const user = state.get('user');

    const isFetching = state.getIn(['stack', 'isFetching'], false)
    const error = state.getIn(['stack', 'error'])

    const connected = state.getIn(['live', 'connected'], false);
    const roomJoined = state.getIn(['live', 'roomJoined'], false);

    return {
        stack,
        author,
        user,
        isFetching,
        error,
        connected,
        roomJoined
    }
}

export default connect(mapStateToProps)(Theater);
