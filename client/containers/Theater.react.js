import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
import { Map, List } from 'immutable'

import Media from '../containers/Media.react'
import Chat from '../containers/Chat.react'
import Info from '../components/Info.react'

import { loadStack, joinRoom, clearStack } from '../actions'
import { getEntity } from '../utils'

class Theater extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { params, dispatch } = this.props
        const id = parseInt(params.stack_id)
        dispatch(loadStack(id))
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.params.stack_id !== this.props.params.stack_id) {
            this.props.dispatch(clearStack())
            const id = parseInt(this.props.params.stack_id)
            this.props.dispatch(loadStack(id))
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') > 0 && nextProps.connected && !nextProps.roomJoined) {
            // stack is loaded and xmpp is connected
            const nickname = nextProps.user.get('username'); // undefined if user is not logged in
            this.props.dispatch(joinRoom(nextProps.stack, nickname));
        }
    }

    render() {
        const { isFetching, error, stack, author, user } = this.props
        return (
        <section>
            <div id="theater">
            {isFetching && <p>Loading...</p>}
            {error && error.length > 0 && <p>Could not load stack.</p>}
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
    const stack = getEntity(state, 'stacks', parseInt(props.params.stack_id));
    const author = getEntity(state, 'users', stack.get('author', 0));

    const isFetching = state.getIn(['stack', 'isFetching'], false)
    const error = state.getIn(['stack', 'error'])

    const roomJoined = state.getIn(['live', 'roomJoined'], false);

    return {
        stack,
        author,
        isFetching,
        error,
        roomJoined
    }
}

export default connect(mapStateToProps)(Theater);
