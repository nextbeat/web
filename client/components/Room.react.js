import React from 'react'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'

import Player from './room/Player.react'
import DetailBar from './room/DetailBar.react'

import { loadStack, joinRoom, clearStack, bookmark, unbookmark, selectMediaItem, goForward, goBackward } from '../actions'
import { Stack } from '../models'

class Theater extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectMediaItem = this.handleSelectMediaItem.bind(this);
        this.handleBookmark = this.handleBookmark.bind(this);
        this.handleUnbookmark = this.handleUnbookmark.bind(this);
    }

    // LIFECYCLE

    componentDidMount() {
        const { params, dispatch } = this.props
        dispatch(loadStack(params.stack_id))
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());
    }

    componentDidUpdate(prevProps) {
        const { params, dispatch, stack } = this.props
        if (prevProps.params.stack_id !== params.stack_id) {
            // new stack, reload
            dispatch(clearStack())
            dispatch(loadStack(params.stack_id))
        }

        if (prevProps.stack.mediaItems().size === 0 && stack.mediaItems().size > 0) {
            // first page of media items has loaded, select the first
            const id = stack.mediaItems().first().get('id')
            this.props.dispatch(selectMediaItem(id))
        }
    }

    // SELECT MEDIA ITEM

    handleSelectMediaItem(id) {
        this.props.dispatch(selectMediaItem(id))
    }

    handleForward() {
        this.props.dispatch(goForward())
    }

    handleBackward() {
        this.props.dispatch(goBackward())
    }

    // BOOKMARK

    handleBookmark() {
        this.props.dispatch(bookmark())
    }

    handleUnbookmark() {
        this.props.dispatch(unbookmark())
    }

    // RENDER

    render() {
        const { stack } = this.props;
        const playerProps = { 
            stack, 
            handleBookmark: this.handleBookmark, 
            handleUnbookmark: this.handleUnbookmark, 
            handleForward: this.handleForward, 
            handleBackward: this.handleBackward
        }
        const detailBarProps = { 
            stack, 
            handleSelectMediaItem: this.handleSelectMediaItem
        }
        return (
        <section className="room">
            <Player {...playerProps} />
            <DetailBar {...detailBarProps} />
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        stack: new Stack(state)
    }
}

export default connect(mapStateToProps)(Theater);
