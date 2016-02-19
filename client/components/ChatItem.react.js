import React from 'react';

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { message, username, isCreator } = this.props;
        const creatorClass = isCreator ? "creator" : "";
        return <li><span><strong className={creatorClass}>{username}</strong> {message}</span></li>;
    }
}

export default ChatItem;
