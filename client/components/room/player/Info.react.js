import React from 'react'
import User from '../../shared/User.react'
import Icon from '../../shared/Icon.react'
import Bookmark from './Bookmark.react'

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
                <User user={stack.author()} style={"right"} />
                <div className="player_description"><span>{ stack.get('description') || "No description." } { !closed && <span className="player_open">OPEN</span> } </span></div>
                <div className="separator separator-player_info" />
                <div className="player_buttons">
                    <div className="player_button"><Bookmark {...this.props} /></div>
                    <div className="player_button player_button-share"><Icon type="share" /><span>Share</span></div>
                </div>
            </section>
        );
    }
}

export default Info;
