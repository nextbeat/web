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
            const { params, dispatch } = this.props
            dispatch(clearStack())
            const id = parseInt(params.stack_id)
            dispatch(loadStack(id))
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

    const { isFetching=false, error } = state.getIn(['stack', 'meta'], Map()).toJS();

    const room = state.getIn(['stack', 'live', 'room']);

    return {
        stack,
        author,
        isFetching,
        error,
        room
    }
}

export default connect(mapStateToProps)(Theater);
