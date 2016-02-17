import React from 'react';

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

        return <li><span className="notification"><strong>{username}</strong> added {addedStr} to the room.</span></li>;
    }
}

export default NotificationChatItem;
