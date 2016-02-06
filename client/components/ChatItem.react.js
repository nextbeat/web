import React from 'react';

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { message, username } = this.props;
        return <li><span><strong>{username}</strong> {message}</span></li>;
    }
}

export default ChatItem;
