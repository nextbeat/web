import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'
import * as format from 'date-fns/format'

import Icon from '@components/shared/Icon'
import Bookmark from '../main/Bookmark'
import Share from '../main/Share'
import Badge from '@components/shared/Badge'
import ActionsDropdown from '@components/room/page/ActionsDropdown'

import { toggleDropdown } from '@actions/app'
import UserEntity from '@models/entities/user'
import Room from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'
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

type Props = ConnectProps & DispatchProps

class ActivityInfo extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleActionsClick = this.handleActionsClick.bind(this);
    }

    handleActionsClick() {
        this.props.dispatch(toggleDropdown('stack-actions-info'))
    }

    render() {
        const { id, closed, description, privacyStatus, 
                createdAt, expires, tags, views } = this.props 

        return (
            <section className="activity_info">
                <div className="activity_info_top">
                    <div className="activity_info_description">
                        <div className="activity_info_title">{ description || "No description." }</div>
                        <div className="activity_info_badges">
                            { !closed && <Badge elementType="player_info" type="open" /> } 
                            { privacyStatus === 'unlisted' && <Badge elementType="player_info" type="unlisted" /> }
                        </div>
                    </div>
                    <div className="activity_info_button-share"><Share /></div>
                </div>
                <div className="activity_info_middle">
                    <div className="activity_info_details">
                        <span className="activity_info_time">
                            { closed && format(createdAt, 'MMMM D, YYYY') }
                            { !closed && timeLeftString(expires) }
                        </span>
                        <span className="activity_info_separator">{'\u00b7'}</span>
                        <span className="activity_info_views">
                            { `${views} visit${views !== 1 ? 's' : ''}` }
                        </span>
                    </div>
                    <div className="activity_info_button-bookmark"><Bookmark type="small" /></div>
                </div>
                <div className="activity_info_bottom">
                    <div className="activity_info_tags">
                        {tags.map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="activity_info_tag">{tag}</Link>)}
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

export default connect(mapStateToProps)(ActivityInfo);
