import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import RoomPlayer from './player/RoomPlayer'
import ScrollableChatHistory from './chat/ScrollableChatHistory'
import Counter from './counter/Counter'
import RoomCardHeader from './card/RoomCardHeader'

import { loadRoom, clearRoom, selectMediaItem, goForward, goBackward } from '@actions/room'
import Room from '@models/state/room'
import CurrentUser from '@models/state/currentUser'
import MediaItem from '@models/entities/mediaItem'
import { isFullScreen } from '@utils'
import { State, DispatchProps } from '@types'

interface OwnProps {
    id: number
    showAuthor?: boolean
    title?: string
}

interface ConnectProps {
    hid: string
    mediaItems: List<MediaItem>
    mediaItemsSize: number
    indexOfSelectedMediaItem: number
    videoDidPlay: boolean
    isLoggedIn: boolean
}

interface RoomCardState {
    shouldAutoplayVideo: boolean
    collapsed: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

class RoomCard extends React.Component<AllProps, RoomCardState> {

    static defaultProps: Partial<AllProps> = {
        showAuthor: true
    }

    private _node: HTMLDivElement

    constructor(props: AllProps) {
        super(props)

        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleFullScreenChange = this.handleFullScreenChange.bind(this)
        this.handleResize = this.handleResize.bind(this)

        // When first loading the room card, we want to prevent the 
        // video from autoplaying, so as to not disturb the user.
        this.state = {
            shouldAutoplayVideo: false,
            collapsed: false
        }
    }

    componentDidMount() {
        const { dispatch, id } = this.props 
        dispatch(loadRoom(id))

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
        $(window).on(`resize.room-card-${id}`, this.handleResize)

        this.handleResize()
    }

    componentDidUpdate(prevProps: AllProps) {
        const { dispatch, mediaItems, id, videoDidPlay, isLoggedIn } = this.props

        if (prevProps.mediaItems.size === 0 && mediaItems.size > 0) {
            // Always select the first media item
            let mediaItemId = (mediaItems.first() as MediaItem).get('id')
            dispatch(selectMediaItem(id, mediaItemId))
        }

        if (!prevProps.videoDidPlay && videoDidPlay) {
            // If the user has already played a video, we want to enable autoplay
            this.setState({
                shouldAutoplayVideo: true
            })
        }

        if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
            // recalculate sizes to account for sidebar
            this.handleResize();
        }
    }

    componentWillUnmount() {
        const { dispatch, id } = this.props 
        dispatch(clearRoom(id))

        $(window).off('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
        $(window).off(`resize.room-card-${id}`, this.handleResize)
    }

    handleFullScreenChange(e: JQuery.Event) {
        if (isFullScreen()) {
            $(document).on('keydown.room_card', this.handleKeyDown)
        } else {
            $(document).off('keydown.room_card', this.handleKeyDown)
        }
    }

    handleKeyDown(e: JQuery.Event) {
        const { indexOfSelectedMediaItem, mediaItemsSize, id, dispatch } = this.props 

        if (e.keyCode === 37) { // left arrow
            if (indexOfSelectedMediaItem !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goBackward(id));  
        } else if (e.keyCode === 39) { // right arrow
            if (indexOfSelectedMediaItem !== mediaItemsSize-1) {
                $('.player_nav-forward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-forward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goForward(id));
        }
    }

    handleResize() {
        let parent = $(this._node).parent()
        let parentWidth = parent.width() as number

        this.setState({
            collapsed: parentWidth <= 800
        })
    }

    render() {
        const { id, hid, indexOfSelectedMediaItem, showAuthor, title } = this.props 
        const { shouldAutoplayVideo, collapsed } = this.state 

        let hideAuthorClass = showAuthor ? '' : 'room-card-hide-author'
        let collapsedClass = collapsed ? 'room-card-collapsed' : ''
        let index = indexOfSelectedMediaItem + 1

        return (
            <div className={`room-card ${hideAuthorClass} ${collapsedClass}`} ref={c => { if (c) { this._node = c } }}>
                { title &&
                <Link to={`/r/${hid}/${index}`} className="room-card_main-title">
                    { title }
                </Link>
                }
                <RoomCardHeader id={id} />
                <div className="room-card_main">
                    <RoomPlayer roomId={id} shouldAutoplayVideo={shouldAutoplayVideo} isRoomCard={true} />
                    <ScrollableChatHistory roomId={id} style='compact' />
                </div>
                <Link to={`/r/${hid}/${index}`} className="room-card_prompt">
                    Enter Room
                </Link>
            </div>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        hid: Room.entity(state, ownProps.id).get('hid'),
        mediaItems: Room.mediaItems(state, ownProps.id),
        mediaItemsSize: Room.mediaItemsSize(state, ownProps.id),
        indexOfSelectedMediaItem: Room.indexOfSelectedMediaItem(state, ownProps.id),
        videoDidPlay: Room.get(state, ownProps.id, 'videoDidPlay'),
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(RoomCard);
