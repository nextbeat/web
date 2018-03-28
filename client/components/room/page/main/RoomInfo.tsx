import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as format from 'date-fns/format'

import User from '@components/shared/User'
import Icon from '@components/shared/Icon'
import Bookmark from './Bookmark'
import Share from './Share'
import Badge from '@components/shared/Badge'

import UserEntity from '@models/entities/user'
import Room from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import { State } from '@types'
import { timeLeftString } from '@utils'

interface ConnectProps {
    id: number
    closed: boolean
    createdAt: string
    expires: string
    description?: string
    privacyStatus: string
    tags: List<string>
    views: number
}

type Props = ConnectProps 

class RoomInfo extends React.Component<Props> {

    render() {
        const { id, closed, description, privacyStatus, 
                createdAt, expires, tags, views } = this.props 

        return (
            <section className="room-info">
                <div className="room-info_main">
                    <div className="room-info_left">
                        <div className="room-info_description">
                            <div className="room-info_title">{ description || "No description." }</div>
                            <div className="room-info_badges">
                                { !closed && <Badge elementType="room-info" type="open" /> } 
                                { privacyStatus === 'unlisted' && <Badge elementType="room-info" type="unlisted" /> }
                            </div>
                        </div>
                        <div className="room-info_views">
                            { `${views} visit${views !== 1 ? 's' : ''}` }
                        </div>
                    </div>
                    <div className="room-info_right">
                        <div className="room-info_time">
                            { closed && format(createdAt, 'MMMM D, YYYY') }
                            { !closed && timeLeftString(expires) }
                        </div>
                    </div>
                </div>
                <div className="room-info_bottom">
                    <div className="room-info_tags">
                        {tags.map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="room-info_tag">{tag}</Link>)}
                    </div>
                    <div className="room-info_buttons">
                        <div className="room-info_button"><Bookmark /></div>
                        <div className="room-info_button"><Share /></div>
                    </div>
                </div>
            </section>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const id = RoomPage.get(state, 'id')
    return {
        id,
        closed: Room.entity(state, id).get('closed'),
        createdAt: Room.entity(state, id).get('created_at'),
        expires: Room.entity(state, id).get('expires'),
        description: Room.entity(state, id).get('description'),
        privacyStatus: Room.entity(state, id).get('privacy_status'),
        tags: Room.entity(state, id).get('tags', List()),
        views: Room.entity(state, id).get('views')
    }
}

export default connect(mapStateToProps)(RoomInfo);
