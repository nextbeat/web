import React from 'react'
import moment from 'moment'
import { secureUrl } from '../../../utils'

class NotificationChatItem extends React.Component {

    constructor(props) {
        super(props);

        this.renderNewMediaItemNotification = this.renderNewMediaItemNotification.bind(this);
    }

    renderNewMediaItemNotification() {
        const { comment, username } = this.props;
        const [ count, url ] = [ 
            comment.get('notification_count'), 
            comment.get('notification_url')
        ];
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-notification">
                <div className="chat_item-notification_thumb" style={{ backgroundImage: `url(${secureUrl(url)})`}}></div>
                <span className="chat_item-notification_text"><strong>{username}</strong> added {countStr} to the room.</span>
            </li>
        );
    }

    renderCloseNotification() {
        return (
            <li className="chat_item chat_item-notification chat_item-notification-close">
                <span className="chat_item-notification_text">This room is no longer open.</span>
            </li>
        );
    }

    render() {
        return this.props.comment.get('notification_type', 'mediaitem') === 'mediaitem' ? 
            this.renderNewMediaItemNotification() : this.renderCloseNotification()
    }
}

export default NotificationChatItem;
