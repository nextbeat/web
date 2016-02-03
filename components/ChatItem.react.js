import React from 'react';

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
        this.message = this.message.bind(this);
        this.notification = this.notification.bind(this);
    }

    message() {
        const { comment, author } = this.props;
        return <span><strong>{author.get('username')}</strong> {comment.get('message')}</span>;
    }

    notification() {
        const { comment, author } = this.props;
        const [ count, type, url ] = [ 
            comment.get('notification_count'), 
            comment.get('notification_type'), 
            comment.get('notification_url')
        ];
        const plural = count > 0 ? 's' : '';
        const addedStr = `${count} ${type}${plural}`;

        return <span className="notification"><strong>{author.get('username')}</strong> added {addedStr} to their bbb.</span>;
    }

    render() {
        const { comment } = this.props;
        return <li>{ comment.get('type') === 'message' ? this.message() : this.notification() }</li>;
    }
}

export default ChatItem;
