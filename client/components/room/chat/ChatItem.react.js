import React from 'react'
import { Link } from 'react-router'

class ChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    renderMessage(comment) {
        const id        = comment.get('id')
        const message   = comment.get('message')
        const mentions  = comment.get('user_mentions') || []

        // construct an array of <span>s using index data in mentions
        let elems   = [] 
        let idx     = 0 // keeps track of current index of string

        mentions.forEach(m => {
            const [start, end] = m.get('indices').toJS()
            const spanKey = `@${id},${idx},${start}`
            elems.push(<span key={spanKey}>{ message.substring(0, start) }</span>)

            const mentionKey = `@${id},${start},${end}`
            const url = `/u/${m.get('username')}`
            elems.push(<Link key={mentionKey} to={url} className="chat_mention">{ message.substring(start, end) }</Link>)

            idx = end
        })
        elems.push(<span key={`@${id},${idx}`}>{ message.substring(idx) }</span>)

        return (
            <span>
                { elems }
            </span>
        )
    }

    render() {
        const { comment, username, isCreator } = this.props;
        const creatorClass = isCreator ? "creator" : "";
        return <li className="chat_item"><strong className={creatorClass}><Link to={`/u/${username}`}>{username}</Link></strong> {this.renderMessage(comment)}</li>;
    }
}

export default ChatItem;
