import React from 'react';
import moment from 'moment';

class NotificationChatItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { comment, username } = this.props;
        const [ count, url ] = [ 
            comment.get('notification_count'), 
            comment.get('notification_url')
        ];
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-notification">
                <div className="chat_item-notification_thumb" style={{ backgroundImage: `url(${url})`}}></div>
                <span className="chat_item-notification_text"><strong>{username}</strong> added {countStr} to the room.</span>
            </li>
        );
    }
}

export default NotificationChatItem;
