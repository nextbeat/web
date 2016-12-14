import React from 'react'
import { Link } from 'react-router'

import Icon from '../../shared/Icon.react'
import { fromNowString } from '../../../utils'

class RoomCardHeader extends React.Component {

    render() {
        const { room } = this.props;
        let thumbUrl = room.author().thumbnail('medium').get('url')
        let thumbStyle = { backgroundImage: thumbUrl ? `url(${thumbUrl})` : '' }

        return (
            <Link to={`/r/${room.get('hid')}`} className="room-card_header">
                <div className="room-card_info-top">
                    <div className="room-card_user">
                        <div className="room-card_profpic" style={thumbStyle}>{ !thumbUrl && <Icon type="person" /> }</div>
                        <div className="room-card_user-info">
                            <div className="room-card_username">{ room.author().get('username') }</div>
                            <div className="room-card_time">{ `${fromNowString(room.get('most_recent_post_at'))} ago` }</div>
                        </div>
                    </div>
                    <div className="room-card_visits">
                        { `${room.get('views')} view${room.get('views') !== 1 ? 's' : ''}` }
                    </div>
                </div>
                <div className="room-card_title">{ room.get('description') }</div>
            </Link>
        )
    }
}

RoomCardHeader.propTypes = {
    room: React.PropTypes.object
}

export default RoomCardHeader;
