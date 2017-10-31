import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import User from '@components/shared/User'
import Icon from '@components/shared/Icon'
import Bookmark from './Bookmark'
import Share from './Share'
import Badge from '@components/shared/Badge'
import ActionsDropdown from '@components/room/page/ActionsDropdown'

import { toggleDropdown } from '@actions/app'
import UserEntity from '@models/entities/user'
import Room from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'

interface Props {
    id: number
    author: UserEntity
    closed: boolean
    description?: string
    isCurrentUserAuthor: boolean
    privacyStatus: string
    tags: List<string>
    views: number
}

type AllProps = Props & DispatchProps

class Info extends React.Component<AllProps> {

    constructor(props: AllProps) {
        super(props);

        this.renderLarge = this.renderLarge.bind(this);
        this.renderSmall = this.renderSmall.bind(this);

        this.handleActionsClick = this.handleActionsClick.bind(this);
    }

    handleActionsClick() {
        this.props.dispatch(toggleDropdown('stack-actions-info'))
    }

    renderSmall() {
        const { author, views, description, privacyStatus, isCurrentUserAuthor, tags } = this.props 

        return (
            <section className="player_info-small">
                <div className="player_info-small_top">
                    <div className="player_info-small_description">
                        <div className="player_info-small_title">{ description || "No description." }</div>
                        <div className="player_info_badges">
                            { !closed && <Badge elementType="player_info" type="open" /> } 
                            { privacyStatus === 'unlisted' && <Badge elementType="player_info" type="unlisted" /> }
                        </div>
                    </div>
                    <div className="player_info-small_actions">
                        <ActionsDropdown type="info" />
                        { isCurrentUserAuthor && <div className="player_info-small_action" onClick={this.handleActionsClick}><Icon type="more-vert" /></div> }
                        <div className="player_info-small_action"><Share /></div>
                    </div>
                </div>
                <div className="player_info-small_user">
                    <User user={author} style="small" />
                </div>
                <div className="player_info-small_bottom">
                    <div className="player_info-small_views">
                        { `${views} visit${views !== 1 ? 's' : ''}` }
                    </div>
                    <Bookmark type="small" />
                </div>
                <div className="player_info-small_tags">
                    {tags.map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_info-small_tag">{tag}</Link>)}
                </div>

            </section>
        )
    }

    renderLarge() {
        const { id, closed, description, privacyStatus, isCurrentUserAuthor, author, tags, views } = this.props 

        return (
            <section className="player_info">
                <div className="player_info_top">
                    <div className="player_info_description">
                        <div className="player_info_title">{ description || "No description." }</div>
                        <div className="player_info_badges">
                            { !closed && <Badge elementType="player_info" type="open" /> } 
                            { privacyStatus === 'unlisted' && <Badge elementType="player_info" type="unlisted" /> }
                        </div>
                    </div>
                    <div className="player_info_views">
                        <ActionsDropdown type="info" />
                        { `${views} visit${views !== 1 ? 's' : ''}` }
                        { isCurrentUserAuthor && <div className="player_info_more player_info-small_action" onClick={this.handleActionsClick}><Icon type="more-vert" /></div> }
                    </div>
                </div>
                <div className="player_info_user">
                    <User user={author} />
                </div>
                <div className="player_info_bottom">
                    <div className="player_info_tags">
                        {tags.map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_info_tag">{tag}</Link>)}
                    </div>
                    <div className="player_info_buttons">
                        <div className="player_info_button"><Bookmark /></div>
                        <div className="player_info_button"><Share /></div>
                    </div>
                </div>
            </section>
        )
    }

    render() {
        return (
            <div>
                { this.renderLarge() }
                { this.renderSmall() }
            </div>
        )
    }
}

function mapStateToProps(state: State): Props {
    const id = RoomPage.get(state, 'id')
    return {
        id,
        author: Room.author(state, id),
        closed: Room.entity(state, id).get('closed'),
        description: Room.entity(state, id).get('description'),
        isCurrentUserAuthor: Room.isCurrentUserAuthor(state, id),        
        privacyStatus: Room.entity(state, id).get('privacy_status'),
        tags: Room.entity(state, id).get('tags', List()),
        views: Room.entity(state, id).get('views')
    }
}

export default connect(mapStateToProps)(Info);
