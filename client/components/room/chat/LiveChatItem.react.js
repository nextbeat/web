import React from 'react'
import { Link } from 'react-router'

class LiveChatItem extends React.Component {

    constructor(props) {
        super(props)
    }

    renderMessage(comment) {
        // We handle rendering live chat items differently from remote chat items.
        // Since we do a bit of work on the backend to isolate @mentions which 
        // refer to existing users, and we want to serve room members chat messages
        // over xmpp without going to the backend (this is subject to change)
        // we render @mentions for live chat items differently, without links to
        // the profile pages. This does not seem like a permanent design decision.
        const message   = comment.get('message')
        const regex = /(@\w+)/
        const elems = message.split(regex).map((str, idx) => {
            const key = `@${idx}`
            const klass = str.charAt(0) === '@' ? "chat_live-mention" : ""
            return <span key={key} className={klass}>{str}</span>
        })

        return (
            <span>
                { elems }
            </span>
        )
    }

    render() {
        const { comment, isCreator } = this.props
        const username = comment.get('username')
        const creatorClass = isCreator ? "creator" : "";
        return <li className="chat_item"><strong className={creatorClass}><Link to={`/u/${username}`}>{username}</Link></strong> {this.renderMessage(comment)}</li>;
    }
}

export default LiveChatItem;