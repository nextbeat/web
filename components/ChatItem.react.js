import React from 'react';

class ChatItem extends React.Component {

    render() {
        const { comment, author } = this.props;
        return <li><strong>{author.get('username')}</strong> {comment.get('message')}</li>;
    }
}

export default ChatItem;
