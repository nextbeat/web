import React from 'react';

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { message, username, isCreator } = this.props;
        const creatorClass = isCreator ? "creator" : "";
        return <li className="chat_item"><strong className={creatorClass}>{username}</strong> {message}</li>;
    }
}

export default ChatItem;
