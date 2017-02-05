import React from 'react'
import Promise from 'bluebird'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import assign from 'lodash/assign'
import isEmpty from 'lodash/isEmpty'

import RoomMain from '../room/page/RoomMain.react'
import DetailBar from '../room/page/DetailBar.react'
import StackActions from '../room/page/StackActions.react'
import WelcomeBanner from '../shared/WelcomeBanner.react'

import { loadRoomPage, clearRoomPage, closeDetailSection, selectDetailSection, selectMediaItem } from '../../actions'
import { RoomPage as RoomPageModel, App } from '../../models'
import { baseUrl, getStorageItem } from '../../utils'

class RoomPage extends React.Component {

    constructor(props) {
        super(props);

        this.renderDocumentHead = this.renderDocumentHead.bind(this);
    }

    // LIFECYCLE

    componentDidMount() {
        const { params, dispatch, roomPage, location } = this.props
        if (!roomPage.isLoaded()) {
            dispatch(loadRoomPage(params.hid))
        }

        let detailSection = location.query.detail
        if (detailSection === 'activity') {
            dispatch(selectDetailSection('activity'))
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearRoomPage());
    }

    componentDidUpdate(prevProps) {
        const { params, dispatch, roomPage } = this.props
        if (prevProps.params.hid !== params.hid) {
            // new room, reload
            dispatch(clearRoomPage())
            dispatch(loadRoomPage(params.hid))
        }

        if (prevProps.roomPage.get('mediaItemsFetching') && roomPage.mediaItems().size > 0) {
            // first page of media items has loaded, select the first
            let id = roomPage.mediaItems().first().get('id')

            // unless last seen media item id stored in localStorage
            const mediaItemId = parseInt(getStorageItem(roomPage.get('hid')), 10)
            if (mediaItemId && roomPage.indexOfMediaItem(mediaItemId) >= 0) {
                id = mediaItemId
            }

            // or if index is specified
            if (params.index) {
                if (params.index === 'latest') {
                    id = roomPage.mediaItems().get(roomPage.mediaItems().size-1).get('id')
                } else {
                    const idx = parseInt(params.index) - 1
                    if (idx >= 0 && idx < roomPage.mediaItems().size) {
                        id = roomPage.mediaItems().get(idx).get('id')
                    }
                }
            }

            dispatch(selectMediaItem(roomPage.get('id'), id, { shouldReplaceHistory: true }))
            dispatch(closeDetailSection())
        }

        // if we're navigating by updating the url (i.e. using 
        // the back button) we want to make sure that select media item
        // is still being fired. note that currently this means that
        // the select media item action is often being fired twice,
        // which isn't ideal, but since the action is idempotent is
        // doesn't really affect anything
        let prevIndex = parseInt(prevProps.params.index)
        let currIndex = parseInt(this.props.params.index)
        if (prevIndex > 0 && currIndex > 0 && prevIndex !== currIndex) {
            let id = roomPage.mediaItems().get(currIndex-1).get('id')
            dispatch(selectMediaItem(roomPage.get('id'), id, { shouldUpdateHistory: false }))
        }
    }

    // RENDER

    renderDocumentHead(roomPage) {
        const url = `${baseUrl()}${this.props.location.pathname}`
        let meta = [
            {"property": "og:url", "content": url},
            {"property": "twitter:site", "content": "@nextbeatblog"},
            {"property": "al:ios:url", "content": `nextbeat://rooms/${roomPage.get('hid')}`},
        ]
        if (!roomPage.get('error')) {
            let creator = roomPage.author().get('full_name') || roomPage.author().get('username')
            const description = `Hang out in this room and chat with ${creator}. Watch updates live and be there while it happens!`

            meta.push.apply(meta, [
                {"property": "og:title", "content": roomPage.get('description')},
                {"property": "og:description", "content": description},
                {"property": "og:image", "content": roomPage.thumbnail('large').get('url')},
                {"property": "og:image:width", "content": 1200},
                {"property": "og:image:height", "content": 900},
                {"property": "twitter:card", "content": "summary_large_image"},
                {"property": "twitter:title", "content": roomPage.get('description')},
                {"property": "twitter:description", "content": description},
                {"property": "twitter:image", "content": roomPage.thumbnail('large').get('url')},
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
                title={roomPage.get('description')}
                meta={meta}
            />
        )

    }

    render() {
        const { roomPage, app } = this.props;

        return (
        <section className="room">
            {this.renderDocumentHead(roomPage)}
            <StackActions />
            <div className="room_inner"> 
                <RoomMain />
                <DetailBar />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        roomPage: new RoomPageModel(state),
        app: new App(state)
    }
}

RoomPage.fetchData = (store, params) => {
    return new Promise((resolve, reject) => {

        const unsubscribe = store.subscribe(() => {
            const roomPage = new RoomPageModel(store.getState())
            if (roomPage.isLoaded()) {
                unsubscribe()
                resolve(store)
            }
            if (roomPage.get('error')) {
                unsubscribe()
                reject(new Error('Room does not exist.'))
            }
        })
        store.dispatch(loadRoomPage(params.hid))
    })
}

export default connect(mapStateToProps)(RoomPage);
