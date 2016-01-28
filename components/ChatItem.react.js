import React from 'react';

class ChatItem extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'ChatItem';
    }

    render() {
        return <li><strong>{this.props.comment.author.username}</strong> {this.props.comment.message}</li>;
    }
}

export default ChatItem;
