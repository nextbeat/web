import * as React from 'react'
import * as Promise from 'bluebird'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import Transition from 'react-transition-group/Transition'
import * as CSSTransition from 'react-transition-group/CSSTransition'


import WelcomeBanner from '@components/room/page/WelcomeBanner'
import RoomMain from '@components/room/page/RoomMain'
import DetailBar from '@components/room/page/DetailBar'
import StackActions from '@components/room/page/StackActions'
import Spinner from '@components/shared/Spinner'
import PageError from '@components/shared/PageError'

import { loadRoomPage, clearRoomPage, closeDetailSection, selectDetailSection } from '@actions/pages/room'
import { selectMediaItem, getRoomInfo } from '@actions/room'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import User from '@models/entities/user'
import { baseUrl, getStorageItem, storageAvailable } from '@utils'
import { Store, DispatchProps, State, RouteProps, staticImplements, ServerRenderingComponent } from '@types'

interface Params {
    hid: string
    index?: string
}

interface ConnectProps {
    id: number
    isFetchingDeep: boolean
    isLoadedDeep: boolean
    hasErrorDeep: boolean

    hid: string
    author: User
    description: string
    isClosed: boolean
    thumbnailUrl: string
    mediaItemsFetching: boolean
    mediaItems: List<MediaItem>

    lastSeenMediaItemId?: number
    mediaItemIdAtParamIndex?: number
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

interface ComponentState {
    hideWelcomeBanner: boolean
}

@staticImplements<ServerRenderingComponent>()
class RoomPageComponent extends React.Component<Props, ComponentState> {

    static fetchData(store: Store, params: Params) {
        return new Promise((resolve, reject) => {
    
            const unsubscribe = store.subscribe(() => {
                const state = store.getState()
                if (RoomPage.isLoadedDeep(state)) {
                    unsubscribe()
                    resolve(store)
                }
                if (RoomPage.hasErrorDeep(state)) {
                    unsubscribe()
                    reject(new Error('Room does not exist.'))
                }
                if (RoomPage.isLoaded(state) && RoomPage.entity(state).get('closed')) {
                    // Select activity section by default for closed rooms
                    if (RoomPage.get(state, 'selectedDetailSection') !== 'activity') {
                        store.dispatch(selectDetailSection('activity'))
                    }
                }
            })
            store.dispatch(loadRoomPage(params.hid))
        })
    }
    

    constructor(props: Props) {
        super(props);

        this.loadRoom = this.loadRoom.bind(this)
        this.selectMediaItemOnLoad = this.selectMediaItemOnLoad.bind(this)
        this.handleWelcomeBannerClose = this.handleWelcomeBannerClose.bind(this);
        this.renderDocumentHead = this.renderDocumentHead.bind(this);

        this.state = {
            hideWelcomeBanner: true
        }
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
        const { dispatch, location, isLoadedDeep } = this.props
        this.loadRoom()

        if (isLoadedDeep) {
            this.selectMediaItemOnLoad()
            this.selectDetailSectionOnLoad()
        }

        if (storageAvailable('localStorage')) {
            this.setState({
                hideWelcomeBanner: JSON.parse(localStorage.getItem('hideWelcomeBanner') || 'false') 
            })
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearRoomPage());

        // Prevent banner from being seen again
        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideWelcomeBanner', 'true')
        }
    }

    componentDidUpdate(prevProps: Props) {
        const { params, dispatch, mediaItems, id: roomId, 
                mediaItemIdAtParamIndex, isLoadedDeep } = this.props

        if (prevProps.params.hid !== params.hid) {
            // new room, reload
            dispatch(clearRoomPage())
            this.loadRoom()
        }

        if (!prevProps.isLoadedDeep && isLoadedDeep) {
            // first page of media items has loaded, select the first
            this.selectMediaItemOnLoad()
            // select chat or activity conditionally
            this.selectDetailSectionOnLoad()
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
            console.log(prevIndex, currIndex, mediaItemIdAtParamIndex)
            dispatch(selectMediaItem(roomId, mediaItemIdAtParamIndex, { shouldUpdateHistory: false }))
        }
    }

    // ACTIONS

    handleWelcomeBannerClose(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault()

        this.setState({
            hideWelcomeBanner: true
        })

        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideWelcomeBanner', 'true')
        }
    }

    // SELECTION

    selectMediaItemOnLoad() {
        const { mediaItems, lastSeenMediaItemId, params, id: roomId, dispatch } = this.props

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

    selectDetailSectionOnLoad() {
        // const { isClosed, dispatch } = this.props
        // const detailSection = isClosed ? 'activity' : 'chat'
        // dispatch(selectDetailSection(detailSection))
    }   

    // RENDER

    renderDocumentHead() {
        const { hid, hasErrorDeep, author, description: title, thumbnailUrl } = this.props
        const url = `${baseUrl()}${this.props.location.pathname}`
        let meta = [
            {"property": "og:url", "content": url},
            {"property": "twitter:site", "content": "@nextbeatblog"},
            {"property": "al:ios:url", "content": `nextbeat://rooms/${hid}`},
        ]
        if (!hasErrorDeep) {
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
        const { isLoadedDeep, isFetchingDeep, hasErrorDeep } = this.props 
        const { hideWelcomeBanner } = this.state

        return (
        <section className="room">
            {this.renderDocumentHead()}
            <StackActions />
            { isFetchingDeep && <Spinner styles={["grey", "large"]} /> }
            { hasErrorDeep && <PageError>The room could not be found, or it has been deleted by its owner.</PageError> }
            { isLoadedDeep && 
                <TransitionGroup className="room_transition_group">
                    { !hideWelcomeBanner && 
                        <CSSTransition classNames="room_welcome-banner" timeout={{ enter: 0, exit: 150 }}>
                            <WelcomeBanner handleClose={this.handleWelcomeBannerClose} />
                        </CSSTransition>
                    }
                    <Transition timeout={0}> 
                        <div className="room_inner">
                            <RoomMain />
                            <DetailBar />
                        </div>
                    </Transition>
                </TransitionGroup>
            }
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

    let currIndex = parseInt(ownProps.params.index || "0");
    if (currIndex > 0) {
        let mediaItem = RoomPage.allMediaItems(state).get(currIndex-1)
        if (mediaItem) {
            mediaItemIdAtParamIndex = mediaItem.get('id')
        }        
    }

    return {
        id,
        hasErrorDeep: RoomPage.hasErrorDeep(state),
        isLoadedDeep: RoomPage.isLoadedDeep(state),
        isFetchingDeep: RoomPage.isFetchingDeep(state),

        hid: RoomPage.entity(state).get('hid'),
        author: RoomPage.author(state),
        description: RoomPage.entity(state).get('description'),
        isClosed: RoomPage.entity(state).get('closed', false),
        thumbnailUrl: RoomPage.thumbnail(state, 'large').get('url'),
        mediaItemsFetching: Room.get(state, id, 'mediaItemsFetching'),
        mediaItems: RoomPage.mediaItems(state),

        lastSeenMediaItemId,
        mediaItemIdAtParamIndex
    }
}

export default connect(mapStateToProps)(RoomPageComponent);
