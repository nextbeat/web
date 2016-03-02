import React from 'react';
import moment from 'moment';

class NotificationChatItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { comment, username } = this.props;
        const [ count, type, url ] = [ 
            comment.get('notification_count'), 
            comment.get('notification_type'), 
            comment.get('notification_url')
        ];
        const plural = count !== 1 ? 's' : '';
        const addedStr = `${count} ${type}${plural}`;

        return <li className="chat_item chat_item-notification"><strong>{username}</strong> added {addedStr} to the room.</li>;
    }
}

export default NotificationChatItem;
