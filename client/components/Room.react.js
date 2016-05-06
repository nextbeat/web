import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
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
        this.resize();
        $('.topbar').addClass('topbar-in-room');
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());

        $(window).off("resize", this.resize);
        $('.sidebar').removeClass('collapsed');
        $('.main').removeClass('expand-left');
        $('.topbar_menu-icon').removeClass('active');
        $('.topbar').removeClass('topbar-in-room');
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

        if ($('.app-container').width() < 1100 && !Modernizr.mq('(max-width:800px)')) {
            $('.sidebar').addClass('collapsed');
            $('.main').addClass('expand-left');
            $('.topbar_menu-icon').addClass('active');
        } else {
            $('.sidebar').removeClass('collapsed');
            $('.main').removeClass('expand-left');
            $('.topbar_menu-icon').removeClass('active');
        }

    }

    // SELECT MEDIA ITEM

    handleSelectMediaItem(id) {
        this.props.dispatch(selectMediaItem(id))
        $('.detail-bar').removeClass('active');
    }

    handleSelectNewestLiveItem() {
        const newestLiveItem = this.props.stack.liveMediaItems().last();
        if (newestLiveItem) {
            this.props.dispatch(selectMediaItem(newestLiveItem.get('id')));
            $('.detail-bar').removeClass('active');
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
            <Helmet title={stack.get('description')} />
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
