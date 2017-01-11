import React from 'react'
import { connect } from 'react-redux'

import RoomPlayer from './player/RoomPlayer.react'
import ChatHistory from './chat/ChatHistory.react'
import Counter from './counter/Counter.react'
import RoomCardHeader from './card/RoomCardHeader.react'

import { loadRoom, clearRoom, selectMediaItem, goForward, goBackward } from '../../actions'
import { Room } from '../../models'
import { isFullScreen } from '../../utils'
import { Link } from 'react-router'

class RoomCard extends React.Component {

    constructor(props) {
        super(props)

        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleFullScreenChange = this.handleFullScreenChange.bind(this)
    }

    componentDidMount() {
        const { dispatch, id } = this.props 
        dispatch(loadRoom(id))

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }

    componentDidUpdate(prevProps) {
        const { dispatch, room, id: roomId } = this.props

        if (prevProps.room.mediaItems().size === 0 && room.mediaItems().size > 0) {
            // Always select the first media item
            let id = room.mediaItems().first().get('id')
            dispatch(selectMediaItem(roomId, id))
        }

    }

    componentWillUnmount() {
        const { dispatch, id } = this.props 
        dispatch(clearRoom(id))

        $(window).off('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
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

    render() {
        const { room } = this.props 
        return (
            <div className="room-card">
                <RoomCardHeader room={room} />
                <div className="room-card_main">
                    <RoomPlayer room={room}>
                        <Counter room={room} />
                    </RoomPlayer>
                    <ChatHistory room={room} />
                </div>
                <Link to={`/r/${room.get('hid')}`} className="room-card_prompt">
                    Enter Room
                </Link>
            </div>
        )
    }
}

RoomCard.propTypes = {
    id: React.PropTypes.number.isRequired
}

function mapStateToProps(state, props) {
    return {
        room: new Room(props.id, state)
    }
}

export default connect(mapStateToProps)(RoomCard);
