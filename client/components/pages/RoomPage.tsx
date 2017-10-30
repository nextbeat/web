import * as React from 'react'
import * as Promise from 'bluebird'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import RoomMain from '@components/room/page/RoomMain'
import DetailBar from '@components/room/page/DetailBar'
import StackActions from '@components/room/page/StackActions'

import { loadRoomPage, clearRoomPage, closeDetailSection, selectDetailSection } from '@actions/pages/room'
import { selectMediaItem, getRoomInfo } from '@actions/room'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import User from '@models/entities/user'
import { baseUrl, getStorageItem } from '@utils'
import { Store, DispatchProps, State, RouteProps, staticImplements, ServerRenderingComponent } from '@types'

interface Params {
    hid: string
    index?: string
}

interface ConnectProps {
    isLoaded: boolean
    id: number
    error: string

    hid: string
    author: User
    description: string
    thumbnailUrl: string
    mediaItemsFetching: boolean
    mediaItems: List<MediaItem>

    lastSeenMediaItemId?: number
    mediaItemIdAtParamIndex?: number
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

@staticImplements<ServerRenderingComponent>()
class RoomPageComponent extends React.Component<Props> {

    static fetchData(store: Store, params: Params) {
        return new Promise((resolve, reject) => {
    
            const unsubscribe = store.subscribe(() => {
                const state = store.getState()
                if (RoomPage.isLoaded(state)) {
                    unsubscribe()
                    resolve(store)
                }
                if (RoomPage.get(state, 'error')) {
                    unsubscribe()
                    reject(new Error('Room does not exist.'))
                }
            })
            store.dispatch(loadRoomPage(params.hid))
        })
    }
    

    constructor(props: Props) {
        super(props);

        this.loadRoom = this.loadRoom.bind(this)
        this.renderDocumentHead = this.renderDocumentHead.bind(this);
    }

    // LIFECYCLE
    
    loadRoom() {
        const { params, dispatch, location } = this.props
        let comment = location.query.comment;
        if (comment && comment.length > 0 && /^\d+$/.test(comment)) {
            let jumpToCommentAtDate = parseInt(comment, 10)/1000
            dispatch(loadRoomPage(params.hid, jumpToCommentAtDate))
        } else {
            dispatch(loadRoomPage(params.hid))
        }
    }

    componentDidMount() {
        const { dispatch, location, isLoaded } = this.props
        if (!isLoaded) {
              this.loadRoom()
        }

        let detailSection = location.query.detail
        if (detailSection === 'activity') {
            dispatch(selectDetailSection('activity'))
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearRoomPage());
    }

    componentDidUpdate(prevProps: Props) {
        const { params, dispatch, mediaItems, id: roomId, 
               lastSeenMediaItemId, mediaItemIdAtParamIndex } = this.props

        if (prevProps.params.hid !== params.hid) {
            // new room, reload
            dispatch(clearRoomPage())
            this.loadRoom()
        }

        if (prevProps.mediaItemsFetching && mediaItems.size > 0) {
            // first page of media items has loaded, select the first
            let id = (mediaItems.first() as MediaItem).get('id')

            // unless last seen media item id stored in localStorage
            if (lastSeenMediaItemId) {
                id = lastSeenMediaItemId
            }

            // or if index is specified
            if (params.index) {
                if (params.index === 'latest') {
                    id = (mediaItems.get(mediaItems.size-1) as MediaItem).get('id')
                } else {
                    const idx = parseInt(params.index) - 1
                    if (idx >= 0 && idx < mediaItems.size) {
                        id = (mediaItems.get(idx) as MediaItem).get('id')
                    }
                }
            }

            dispatch(selectMediaItem(roomId, id, { shouldReplaceHistory: true }))
            dispatch(closeDetailSection())
        }

        // if we're navigating by updating the url (i.e. using 
        // the back button) we want to make sure that select media item
        // is still being fired. note that currently this means that
        // the select media item action is often being fired twice,
        // which isn't ideal, but since the action is idempotent is
        // doesn't really affect anything
        let prevIndex = parseInt(prevProps.params.index || "0")
        let currIndex = parseInt(this.props.params.index || "0")
        if (prevIndex > 0 && currIndex > 0 && prevIndex !== currIndex && mediaItemIdAtParamIndex ) {
            dispatch(selectMediaItem(roomId, mediaItemIdAtParamIndex, { shouldUpdateHistory: false }))
        }
    }

    // RENDER

    renderDocumentHead() {
        const { hid, error, author, description: title, thumbnailUrl } = this.props
        const url = `${baseUrl()}${this.props.location.pathname}`
        let meta = [
            {"property": "og:url", "content": url},
            {"property": "twitter:site", "content": "@nextbeatblog"},
            {"property": "al:ios:url", "content": `nextbeat://rooms/${hid}`},
        ]
        if (!error) {
            let creator = author.get('full_name') || author.get('username')
            const description = `Hang out in this room and chat with ${creator}. Watch updates live and be there while it happens!`

            meta.push.apply(meta, [
                {"property": "og:title", "content": title},
                {"property": "og:description", "content": description},
                {"property": "og:image", "content": thumbnailUrl},
                {"property": "og:image:width", "content": 1200},
                {"property": "og:image:height", "content": 900},
                {"property": "twitter:card", "content": "summary_large_image"},
                {"property": "twitter:title", "content": title},
                {"property": "twitter:description", "content": description},
                {"property": "twitter:image", "content": thumbnailUrl},
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
                title={title}
                meta={meta}
            />
        )

    }

    render() {
        return (
        <section className="room">
            {this.renderDocumentHead()}
            <StackActions />
            <div className="room_inner"> 
                <RoomMain />
                <DetailBar />
            </div>
        </section>
        );
    }
}

function mapStateToProps(state: State, ownProps: RouteProps<Params>): ConnectProps {
    let lastSeenMediaItemId;
    let mediaItemIdAtParamIndex;
    let id = RoomPage.get(state, 'id')

    const mediaItemId = parseInt(getStorageItem(RoomPage.entity(state).get('hid')), 10)
    if (mediaItemId && RoomPage.indexOfMediaItemId(state, mediaItemId) >= 0) {
        lastSeenMediaItemId = mediaItemId
    }

    let currIndex = parseInt(this.props.params.index || "0");
    if (currIndex > 0) {
        let mediaItem = RoomPage.allMediaItems(state).get(currIndex-1)
        if (mediaItem) {
            mediaItemIdAtParamIndex = mediaItem.get('id')
        }        
    }

    return {
        isLoaded: RoomPage.isLoaded(state),
        id,
        error: RoomPage.get(state, 'error'),

        hid: RoomPage.entity(state).get('hid'),
        author: RoomPage.author(state),
        description: RoomPage.entity(state).get('description'),
        thumbnailUrl: RoomPage.thumbnail(state, 'large').get('url'),
        mediaItemsFetching: Room.get(state, id, 'mediaItemsFetching'),
        mediaItems: RoomPage.mediaItems(state),

        lastSeenMediaItemId,
        mediaItemIdAtParamIndex
    }
}

export default connect(mapStateToProps)(RoomPageComponent);