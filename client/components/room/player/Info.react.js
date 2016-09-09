import React from 'react'
import { Link } from 'react-router'
import { List } from 'immutable'

import User from '../../shared/User.react'
import Icon from '../../shared/Icon.react'
import Bookmark from './Bookmark.react'
import Share from './Share.react'
import Badge from '../../shared/Badge.react'

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack } = this.props;
        const profpic_url = stack.author().get('profpic_thumbnail_url') || stack.author().get('profpic_url');
        const closed = stack.get('closed');
        return (
            <section className="player_info">
            <div className="player_description"><span>{ stack.get('description') || "No description." } { !closed && <Badge elementType="player" type="open" /> } { stack.get('privacy_status') === 'unlisted' && <Badge elementType="player" type="unlisted" /> }</span></div>
                <div className="player_tags">
                    {stack.get('tags', List()).map(tag => <Link to={`/t/${tag}`} key={`t-${tag}`} className="player_tag">{tag}</Link>)}
                </div>
                <div className="player_info-data">
                    <User user={stack.author()} style="small" />
                     <div className="player_info-views">
                        <span className="player_info-view-count">{stack.get('views', 0)}</span> view{stack.get('views') !== 1 && 's'}
                    </div>
                </div>
                <div className="separator separator-player_info" />
                <div className="player_buttons">
                    <div className="player_button"><Bookmark {...this.props} /></div>
                    <div className="player_button"><Share stack={stack} /></div>
                </div>
            </section>
        );
    }
}

export default Info;
