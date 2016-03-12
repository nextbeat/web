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
        this.handleSelectNewestLiveItem = this.handleSelectNewestLiveItem.bind(this);
        this.handleForward = this.handleForward.bind(this);
        this.handleBackward = this.handleBackward.bind(this);
        this.handleBookmark = this.handleBookmark.bind(this);
        this.handleUnbookmark = this.handleUnbookmark.bind(this);
    }

    // LIFECYCLE

    componentDidMount() {
        const { params, dispatch } = this.props
        dispatch(loadStack(params.stack_id))

        $(window).resize(this.resize)
        $(window).resize();
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());

        $(window).off("resize", this.resize);
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

    // RESIZING

    resize() {

        if (Modernizr.mq('(max-width: 1000px')) {
            $('.sidebar').addClass('closed');
            $('.sidebar').removeClass('open');
            $('.main').addClass('expand-left');
        } else {
            $('.sidebar').addClass('open');
            $('.sidebar').removeClass('closed');
            $('.main').removeClass('expand-left');
        }

        if (Modernizr.mq('(max-width: 810px')) {
            $('.detail-bar').addClass('closed');
            $('.detail-bar').removeClass('open');
            $('.player-container').addClass('expand-right');
            $('.detail-bar_main').removeClass('active');
        } else {
            $('.detail-bar').addClass('open');
            $('.detail-bar').removeClass('closed');
            $('.player-container').removeClass('expand-right');
        }

    }

    // SELECT MEDIA ITEM

    handleSelectMediaItem(id) {
        this.props.dispatch(selectMediaItem(id))
    }

    handleSelectNewestLiveItem() {
        const newestLiveItem = this.props.liveMediaItems.last();
        if (newestLiveItem) {
            this.props.dispatch(selectMediaItem(newestLiveItem.get('id')));
        }
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
            handleSelectMediaItem: this.handleSelectMediaItem,
            handleSelectNewestLiveItem: this.handleSelectNewestLiveItem
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
