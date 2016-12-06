import React from 'react'
import Promise from 'bluebird'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { isEmpty, assign } from 'lodash-es'

import Player from './room/Player.react'
import DetailBar from './room/DetailBar.react'
import WelcomeBanner from './shared/WelcomeBanner.react'

import { loadStack, joinRoom, clearStack, bookmark, unbookmark, selectMediaItem, goForward, goBackward, selectDetailSection, closeDetailSection } from '../actions'
import { Stack, App } from '../models'
import { baseUrl, getStorageItem } from '../utils'

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
    }

    componentWillUnmount() {
        this.props.dispatch(clearStack());
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

            // unless last seen media item id stored in localStorage
            const mediaItemId = parseInt(getStorageItem(stack.get('hid')), 10)
            if (mediaItemId && stack.indexOfMediaItem(mediaItemId) >= 0) {
                id = mediaItemId
            }

            // or if index is specified
            if (params.index) {
                if (params.index === 'latest') {
                    id = stack.mediaItems().get(stack.mediaItems().size-1).get('id')
                } else {
                    const idx = parseInt(params.index)-1
                    if (idx > 0 && idx < stack.mediaItems().size) {
                        id = stack.mediaItems().get(idx).get('id')
                    }
                }
            }


            this.handleSelectMediaItem(id)
        }
    }

    // SELECT MEDIA ITEM

    handleSelectMediaItem(id) {
        const { params, dispatch, stack } = this.props

        this.props.dispatch(selectMediaItem(id))
        this.props.dispatch(closeDetailSection())
    }

    handleSelectNewestLiveItem() {
        const newestLiveItem = this.props.stack.liveMediaItems().last();
        if (newestLiveItem) {
            this.props.dispatch(selectMediaItem(newestLiveItem.get('id')));
            this.props.dispatch(closeDetailSection())
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
            {"property": "twitter:site", "content": "@nextbeatblog"},
            {"property": "al:ios:url", "content": `nextbeat://rooms/${stack.get('hid')}`},
        ]
        if (!stack.get('error')) {
            let creator = stack.author().get('full_name') || stack.author().get('username')
            const description = `Hang out in this room and chat with ${creator}. Watch updates live and be there while it happens!`

            meta.push.apply(meta, [
                {"property": "og:title", "content": stack.get('description')},
                {"property": "og:description", "content": description},
                {"property": "og:image", "content": stack.thumbnail('large').get('url')},
                {"property": "og:image:width", "content": 1200},
                {"property": "og:image:height", "content": 900},
                {"property": "twitter:card", "content": "summary_large_image"},
                {"property": "twitter:title", "content": stack.get('description')},
                {"property": "twitter:description", "content": description},
                {"property": "twitter:image", "content": stack.thumbnail('large').get('url')},
                {"name": "description", "content": description}
            ])
        } else {
            const description = "This room does not exist or has been deleted by its owner."
            meta.push.apply(meta, [
                {"property": "og:title", "content": "Room Not Found"},
                {"property": "og:description", "content": description},
                {"property": "twitter:card", "content": "summary"},
                {"property": "twitter:title", "content": "Room Not Found"},
                {"property": "twitter:description", "content": description},
                {"name": "description", "content": description}
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
        const { stack, app } = this.props;
        const playerProps = { 
            stack, 
            app,
            handleBookmark: this.handleBookmark, 
            handleUnbookmark: this.handleUnbookmark, 
            handleForward: this.handleForward, 
            handleBackward: this.handleBackward
        }
        const detailBarProps = { 
            stack, 
            app,
            handleSelectMediaItem: this.handleSelectMediaItem,
            handleSelectNewestLiveItem: this.handleSelectNewestLiveItem
        }

        const shouldDisplayBanner = app.get('width') !== 'small' && stack.author().get('username') === 'safiya'

        return (
        <section className="room">
            {this.renderDocumentHead(stack)}
            { shouldDisplayBanner && 
                <WelcomeBanner>
                    Welcome to Safiya's room! Chat and follow along in real time. <a target="_black" rel="nofollow" href="https://medium.com/@TeamNextbeat/welcome-to-nextbeat-831d25524a4d">Learn more about Nextbeat.</a>
                </WelcomeBanner>
            }
            <div className="room_inner">
                <Player {...playerProps} />
                <DetailBar {...detailBarProps} />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        stack: new Stack(state),
        app: new App(state)
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
