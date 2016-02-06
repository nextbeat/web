import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { Map, List } from 'immutable'

import Media from '../containers/Media.react'
import Chat from '../containers/Chat.react'
import Header from '../components/Header.react'
import Info from '../components/Info.react'

import { loadStack, connectToXMPP, joinRoom } from '../actions'

class Theater extends React.Component {

    constructor(props) {
        super(props);
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

    render() {
        const { isFetching, error, stack, author } = this.props
        return (
        <section>
            <Header/>
            {isFetching && <p>Loading...</p>}
            {error && error.length > 0 && <p>Could not load stack.</p>}
            <div id="theater">
                <section id="theater-main">
                    <Media stack={stack}/>
                    <Info stack={stack} author={author} />
                </section>
                <Chat stack={stack} />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    const stack = state.getIn(['entities', 'stacks', props.id], Map())
    const author = state.getIn(['entities', 'users', stack.get('author', 0).toString()], Map())

    const isFetching = state.getIn(['stack', 'isFetching'], false)
    const error = state.getIn(['stack', 'error'])

    const connected = state.getIn(['live', 'connected'], false);
    const roomJoined = state.getIn(['live', 'roomJoined'], false);

    return {
        stack,
        author,
        isFetching,
        error,
        connected,
        roomJoined
    }
}

export default connect(mapStateToProps)(Theater);
