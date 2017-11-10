import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Icon from '@components/shared/Icon'
import Room from '@models/state/room'
import User from '@models/entities/user'
import { fromNowString, secureUrl } from '@utils'
import { State } from '@types'

interface OwnProps {
    id: number
}

interface ConnectProps {
    author: User
    description: string
    hid: string
    most_recent_post_at: string
    views: number
    indexOfSelectedMediaItem: number
}

class RoomCardHeader extends React.Component<OwnProps & ConnectProps> {

    render() {
        const { author, description, hid, most_recent_post_at, views, indexOfSelectedMediaItem } = this.props;
        let thumbUrl = author.thumbnail('medium').get('url')
        let thumbStyle = { backgroundImage: thumbUrl ? `url(${secureUrl(thumbUrl)})` : '' }
        let index = indexOfSelectedMediaItem + 1

        return (
            <Link to={`/r/${hid}/${index}`} className="room-card_header">
                <div className="room-card_visits">
                    { `${views} visit${views !== 1 ? 's' : ''}` }
                </div>
                <div className="room-card_info-top">
                    <div className="room-card_user">
                        <div className="room-card_profpic" style={thumbStyle}>{ !thumbUrl && <Icon type="person" /> }</div>
                        <div className="room-card_user-info">
                            <div className="room-card_username">{ author.get('username') }</div>
                            <div className="room-card_time">{ `${fromNowString(most_recent_post_at)} ago` }</div>
                        </div>
                    </div>
                </div>
                <div className="room-card_title">{ description }</div>
            </Link>
        )
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        author: Room.author(state, ownProps.id),
        description: Room.entity(state, ownProps.id).get('description'),
        hid: Room.entity(state, ownProps.id).get('hid'),
        most_recent_post_at: Room.entity(state, ownProps.id).get('most_recent_post_at'),
        views: Room.entity(state, ownProps.id).get('views'),
        indexOfSelectedMediaItem: Room.indexOfSelectedMediaItem(state, ownProps.id)
    }
}

export default connect(mapStateToProps)(RoomCardHeader);

