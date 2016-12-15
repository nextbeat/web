import React from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

import User from '../../../shared/User.react'
import Icon from '../../../shared/Icon.react'
import Bookmark from './Bookmark.react'
import Share from './Share.react'
import Badge from '../../../shared/Badge.react'

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { roomPage } = this.props;
        const profpic_url = roomPage.author().get('profpic_thumbnail_url') || roomPage.author().get('profpic_url');
        const closed = roomPage.get('closed');
        return (
            <section className="player_info">
            <div className="player_description"><span>{ roomPage.get('description') || "No description." } { !closed && <Badge elementType="player" type="open" /> } { roomPage.get('privacy_status') === 'unlisted' && <Badge elementType="player" type="unlisted" /> }</span></div>
                <div className="player_tags">
                    {roomPage.get('tags', List()).map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_tag">{tag}</Link>)}
                </div>
                <div className="player_info-data">
                    <User user={roomPage.author()} style="small" />
                     <div className="player_info-views">
                        <span className="player_info-view-count">{roomPage.get('views', 0)}</span> view{roomPage.get('views') !== 1 && 's'}
                    </div>
                </div>
                <div className="separator separator-player_info" />
                <div className="player_buttons">
                    <div className="player_button"><Bookmark roomPage={roomPage} /></div>
                    <div className="player_button"><Share roomPage={roomPage} /></div>
                </div>
            </section>
        );
    }
}

export default Info;
