import React from 'react'
import Promise from 'bluebird'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { isEmpty, assign } from 'lodash'

import Player from './room/Player.react'
import DetailBar from './room/DetailBar.react'

import { loadStack, joinRoom, clearStack, bookmark, unbookmark, selectMediaItem, goForward, goBackward } from '../actions'
import { Stack } from '../models'
import { baseUrl, storageAvailable } from '../utils'

class Room extends React.Component {

    constructor(props) {
        super(props);

        this.handleSelectMediaItem = this.handleSelectMediaItem.bind(this);
        this.handleSelectNewestLiveItem = this.handleSelectNewestLiveItem.bind(this);
        this.handleForward = this.handleForward.bind(this);
        this.handleBackward = this.handleBackward.bind(this);
        this.handleBookmark = this.handleBookmark.bind(this);
        this.handleUnbookmark = this.handleUnbookmark.bind(this);

        this.renderDocumentHead = this.renderDocumentHead.bind(this);
    }

    // LIFECYCLE

    componentDidMount() {
        const { params, dispatch } = this.props
        dispatch(loadStack(params.hid))

        $(window).resize(this.resize)
        this.resize();
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());

        $(window).off("resize", this.resize);
        $('.sidebar').removeClass('collapsed');
        $('.main').removeClass('expand-left');
        $('.topbar_menu-icon').removeClass('active');
    }

    componentDidUpdate(prevProps) {
        const { params, dispatch, stack } = this.props
        if (prevProps.params.hid !== params.hid) {
            // new stack, reload
            dispatch(clearStack())
            dispatch(loadStack(params.hid))
        }

        if (prevProps.stack.mediaItems().size === 0 && stack.mediaItems().size > 0) {
            // first page of media items has loaded, select the first
            let id = stack.mediaItems().first().get('id')

            // unless last seen media item id stored in sessionStorage
            if (storageAvailable('sessionStorage')) {
                const mediaItemId = parseInt(sessionStorage.getItem(stack.get('hid')), 10)
                if (mediaItemId && stack.indexOfMediaItem(mediaItemId) >= 0) {
                    id = mediaItemId
                }
            }

            this.props.dispatch(selectMediaItem(id))
        }
    }

    // EVENTS

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

    renderDocumentHead(stack) {
        const url = `${baseUrl()}${this.props.location.pathname}`
        let meta = [
            {"property": "og:url", "content": url},
            {"property": "twitter:site", "content": "@nextbeatTV"},
            {"property": "al:ios:url", "content": `nextbeat://rooms/${stack.get('hid')}`},
        ]
        if (!stack.get('error')) {
            const description = `Check out this room created by ${stack.author().get('username')}!`
            const thumb_url = stack.get('fb_thumbnail_url') || stack.get('thumbnail_url') || ''
            meta.push.apply(meta, [
                {"property": "og:title", "content": stack.get('description')},
                {"property": "og:description", "content": description},
                {"property": "og:image", "content": thumb_url},
                {"property": "og:image:width", "content": 1200},
                {"property": "og:image:height", "content": 900},
                {"property": "twitter:card", "content": "summary_large_image"},
                {"property": "twitter:title", "content": stack.get('description')},
                {"property": "twitter:description", "content": description},
                {"property": "twitter:image", "content": thumb_url}
            ])
        } else {
            const description = "This room does not exist or has been deleted by its owner."
            meta.push.apply(meta, [
                {"property": "og:title", "content": "Room Not Found"},
                {"property": "og:description", "content": description},
                {"property": "twitter:card", "content": "summary"},
                {"property": "twitter:title", "content": "Room Not Found"},
                {"property": "twitter:description", "content": description}
            ])
        }

        return (
            <Helmet 
                title={stack.get('description')}
                meta={meta}
            />
        )

    }

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
            {this.renderDocumentHead(stack)}
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

Room.fetchData = (store, params) => {
    return new Promise((resolve, reject) => {

        const unsubscribe = store.subscribe(() => {
            const stack = new Stack(store.getState())
                if (stack.isLoaded()) {
                    unsubscribe()
                    resolve(store)
                }
                if (stack.get('error')) {
                    unsubscribe()
                    reject(new Error('Stack does not exist.'))
                }
            })
        store.dispatch(loadStack(params.hid))
    })
}

export default connect(mapStateToProps)(Room);
