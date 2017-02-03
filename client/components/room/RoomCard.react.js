import React from 'react'
import { connect } from 'react-redux'

import RoomPlayer from './player/RoomPlayer.react'
import ChatHistory from './chat/ChatHistory.react'
import Counter from './counter/Counter.react'
import RoomCardHeader from './card/RoomCardHeader.react'

import { loadRoom, clearRoom, selectMediaItem, goForward, goBackward } from '../../actions'
import { Room, CurrentUser } from '../../models'
import { isFullScreen } from '../../utils'
import { Link } from 'react-router'

class RoomCard extends React.Component {

    constructor(props) {
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

    componentDidUpdate(prevProps) {
        const { dispatch, room, id: roomId } = this.props

        if (prevProps.room.mediaItems().size === 0 && room.mediaItems().size > 0) {
            // Always select the first media item
            let id = room.mediaItems().first().get('id')
            dispatch(selectMediaItem(roomId, id))
        }

        if (!prevProps.room.get('videoDidPlay') && !!room.get('videoDidPlay')) {
            // If the user has already played a video, we want to enable autoplay
            this.setState({
                shouldAutoplayVideo: true
            })
        }

        if (this.props.currentUser.isLoggedIn() !== prevProps.currentUser.isLoggedIn()) {
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

    handleFullScreenChange(e) {
        if (isFullScreen()) {
            $(document).on('keydown', this.handleKeyDown)
        } else {
            $(document).off('keydown', this.handleKeyDown)
        }
    }

    handleKeyDown(e) {
        const { room, dispatch } = this.props 

        if (e.keyCode === 37) { // left arrow
            if (room.indexOfSelectedMediaItem() !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goBackward(room.get('id')));  
        } else if (e.keyCode === 39) { // right arrow
            if (room.indexOfSelectedMediaItem() !== room.mediaItemsSize()-1) {
                $('.player_nav-forward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-forward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goForward(room.get('id')));
        }
    }

    handleResize() {
        let parent = $(this._node).parent()
        let parentWidth = parent.width()

        this.setState({
            collapsed: parentWidth <= 800
        })
    }

    render() {
        const { room, showAuthor, title } = this.props 
        const { shouldAutoplayVideo, collapsed } = this.state 

        let hideAuthorClass = showAuthor ? '' : 'room-card-hide-author'
        let collapsedClass = collapsed ? 'room-card-collapsed' : ''
        let index = room.indexOfSelectedMediaItem() + 1

        return (
            <div className={`room-card ${hideAuthorClass} ${collapsedClass}`} ref={c => this._node = c}>
                { title &&
                <Link to={`/r/${room.get('hid')}/${index}`} className="room-card_main-title">
                    { title }
                </Link>
                }
                <RoomCardHeader room={room} />
                <div className="room-card_main">
                    <RoomPlayer room={room} shouldAutoplayVideo={shouldAutoplayVideo} isRoomCard={true} />
                    <ChatHistory room={room} scrollable={true} style='compact' />
                </div>
                <Link to={`/r/${room.get('hid')}/${index}`} className="room-card_prompt">
                    Enter Room
                </Link>
            </div>
        )
    }
}

RoomCard.propTypes = {
    id: React.PropTypes.number.isRequired,
    showAuthor: React.PropTypes.bool
}

RoomCard.defaultProps = {
    showAuthor: true
}

function mapStateToProps(state, props) {
    return {
        room: new Room(props.id, state),
        currentUser: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(RoomCard);
