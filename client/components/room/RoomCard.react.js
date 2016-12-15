import React from 'react'
import { connect } from 'react-redux'

import RoomPlayer from './player/RoomPlayer.react'
import ChatHistory from './chat/ChatHistory.react'
import Counter from './counter/Counter.react'
import RoomCardHeader from './card/RoomCardHeader.react'

import { loadRoom, clearRoom, selectMediaItem } from '../../actions'
import { Room } from '../../models'
import { Link } from 'react-router'

class RoomCard extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch, id } = this.props 
        dispatch(loadRoom(id))
    }

    componentDidUpdate(prevProps) {
        const { dispatch, room } = this.props

        if (prevProps.room.mediaItems().size === 0 && room.mediaItems().size > 0) {
            // Always select the first media item
            let id = room.mediaItems().first().get('id')
            dispatch(selectMediaItem(room.get('id'), id))
        }

    }

    componentWillUnmount() {
        const { dispatch, id } = this.props 
        dispatch(clearRoom(id))
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