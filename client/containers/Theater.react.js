import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import Media from '../containers/Media.react'
import Chat from '../containers/Chat.react'
import Info from '../components/Info.react'

import { loadStack, joinRoom, clearStack, bookmark, unbookmark } from '../actions'
import { Stack } from '../models'

class Theater extends React.Component {

    constructor(props) {
        super(props);

        this.handleBookmark = this.handleBookmark.bind(this);
        this.handleUnbookmark = this.handleUnbookmark.bind(this);
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

    handleBookmark() {
        this.props.dispatch(bookmark())
    }

    handleUnbookmark() {
        this.props.dispatch(unbookmark())
    }

    render() {
        const { isFetching, error, stack, stackEntity, author, user } = this.props
        const isBookmarked = stack.isBookmarked()
        return (
        <section>
            <div id="theater">
            {isFetching && <p>Loading...</p>}
            {error && error.length > 0 && <p>Could not load stack.</p>}
                <section id="theater-main">
                    <Media stack={stackEntity}/>
                    <Info stack={stackEntity} author={author} isBookmarked={isBookmarked} handleBookmark={this.handleBookmark} handleUnbookmark={this.handleUnbookmark} />
                </section>
                <Chat stack={stackEntity} user={user} />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    const stack = new Stack(state)

    return {
        stack: stack,
        stackEntity: stack.entity(),
        author: stack.author(),
        isFetching: stack.get('isFetching', false),
        error: stack.get('error'),
        room: stack.get('room'),
    }
}

export default connect(mapStateToProps)(Theater);
