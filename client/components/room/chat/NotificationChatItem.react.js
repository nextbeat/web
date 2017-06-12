import React from 'react'
import { Link } from 'react-router'

import { timeString } from '../../../utils'

class NotificationChatItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { comment, username, count, handleSelectMediaItem } = this.props;
        const url = comment.get('mediaitem_url');
        const mediaItemId = comment.get('mediaitem_id');
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-notification" onClick={() => { handleSelectMediaItem(mediaItemId) }}>
                <div className="chat_item-notification_thumb" style={{ backgroundImage: `url(${url})`}}></div>
                <div className="chat_item-notification_text">
                    <span className="chat_item_username">{username}</span> added {countStr} to the room.
                    <span className="chat_item_timestamp">{timeString(comment.get('created_at'))}</span>
                </div>
            </li>
        );
    }
}

NotificationChatItem.propTypes = {
    comment: React.PropTypes.object.isRequired,
    roomId: React.PropTypes.number.isRequired,
    username: React.PropTypes.string.isRequired,
    count: React.PropTypes.number,

    handleSelectMediaItem: React.PropTypes.func
}

NotificationChatItem.defaultProps = {
    count: 1
}

export default NotificationChatItem;
