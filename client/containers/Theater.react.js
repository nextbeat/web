import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import Media from '../containers/Media.react'
import Chat from '../containers/Chat.react'
import Info from '../components/Info.react'

import { loadStack, joinRoom, clearStack } from '../actions'
import { Stack } from '../models'

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
    const stack = new Stack(state)

    return {
        stack: stack.entity(),
        author: stack.author(),
        isFetching: stack.get('isFetching', false),
        error: stack.get('error'),
        room: stack.get('room'),
    }
}

export default connect(mapStateToProps)(Theater);
