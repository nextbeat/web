import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import User from '../../../shared/User.react'
import Icon from '../../../shared/Icon.react'
import Bookmark from './Bookmark.react'
import Share from './Share.react'
import Badge from '../../../shared/Badge.react'
import ActionsDropdown from '../ActionsDropdown.react'

import { toggleDropdown } from '../../../../actions'

class Info extends React.Component {

    constructor(props) {
        super(props);

        this.renderLarge = this.renderLarge.bind(this);
        this.renderSmall = this.renderSmall.bind(this);

        this.handleActionsClick = this.handleActionsClick.bind(this);
    }

    handleActionsClick() {
        this.props.dispatch(toggleDropdown('stack-actions-info'))
    }

    renderSmall() {
        const { roomPage } = this.props 
        const views = roomPage.get('views')

        return (
            <section className="player_info-small">
                <div className="player_info-small_top">
                    <div className="player_info-small_description">
                        <div className="player_info-small_title">{ roomPage.get('description') || "No description." }</div>
                        <div className="player_info_badges">
                            { !roomPage.get('closed') && <Badge elementType="player_info" type="open" /> } 
                            { roomPage.get('privacy_status') === 'unlisted' && <Badge elementType="player_info" type="unlisted" /> }
                        </div>
                    </div>
                    <div className="player_info-small_actions">
                        <ActionsDropdown type="info" />
                        { roomPage.currentUserIsAuthor() && <div className="player_info-small_action" onClick={this.handleActionsClick}><Icon type="more-vert" /></div> }
                        <div className="player_info-small_action"><Share roomPage={roomPage} /></div>
                    </div>
                </div>
                <div className="player_info-small_user">
                    <User user={roomPage.author()} style="small" />
                </div>
                <div className="player_info-small_bottom">
                    <div className="player_info-small_views">
                        { `${views} view${views !== 1 ? 's' : ''}` }
                    </div>
                    <Bookmark roomPage={roomPage} type="small" />
                </div>
                <div className="player_info-small_tags">
                    {roomPage.get('tags', List()).map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_info-small_tag">{tag}</Link>)}
                </div>

            </section>
        )
    }

    renderLarge() {
        const { roomPage, app } = this.props 
        const views = roomPage.get('views')

        return (
            <section className="player_info">
                <div className="player_info_top">
                    <div className="player_info_description">
                        <div className="player_info_title">{ roomPage.get('description') || "No description." }</div>
                        <div className="player_info_badges">
                            { !roomPage.get('closed') && <Badge elementType="player_info" type="open" /> } 
                            { roomPage.get('privacy_status') === 'unlisted' && <Badge elementType="player_info" type="unlisted" /> }
                        </div>
                    </div>
                    <div className="player_info_views">
                        <ActionsDropdown type="info" />
                        { `${views} view${views !== 1 ? 's' : ''}` }
                        { roomPage.currentUserIsAuthor() && <div className="player_info_more player_info-small_action" onClick={this.handleActionsClick}><Icon type="more-vert" /></div> }
                    </div>
                </div>
                <div className="player_info_user">
                    <User user={roomPage.author()} />
                </div>
                <div className="player_info_bottom">
                    <div className="player_info_tags">
                        {roomPage.get('tags', List()).map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_info_tag">{tag}</Link>)}
                    </div>
                    <div className="player_info_buttons">
                        <div className="player_info_button"><Bookmark roomPage={roomPage} /></div>
                        <div className="player_info_button"><Share roomPage={roomPage} /></div>
                    </div>
                </div>
            </section>
        )
    }

    render() {
        const { roomPage } = this.props;
        const closed = roomPage.get('closed');

        return (
            <div>
                { this.renderLarge() }
                { this.renderSmall() }
            </div>
        )
    }
}

export default connect()(Info);
