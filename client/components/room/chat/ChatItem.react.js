import React from 'react'
import { Link } from 'react-router'

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { message, username, isCreator } = this.props;
        const creatorClass = isCreator ? "creator" : "";
        return <li className="chat_item"><strong className={creatorClass}><Link to={`/u/${username}`}>{username}</Link></strong> {message}</li>;
    }
}

export default ChatItem;
