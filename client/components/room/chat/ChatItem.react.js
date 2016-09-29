import React from 'react'
import { Link } from 'react-router'

class ChatItem extends React.Component {

    constructor(props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
    }

    shouldComponentUpdate(nextProps) {
        return this.props.comment !== nextProps.comment
    }

    renderMessage() {
        const { comment, handleSelectUsername } = this.props 

        const id        = comment.get('id')
        const message   = comment.get('message')
        const mentions  = comment.get('user_mentions') || []

        // construct an array of <span>s using index data in mentions
        let elems   = [] 
        let idx     = 0 // keeps track of current index of string

        mentions.forEach(m => {
            const [start, end] = m.get('indices').toJS()
            const spanKey = `@${id},${idx},${start}`
            elems.push(<span key={spanKey}>{ message.substring(idx, start) }</span>)

            const mentionKey = `@${id},${start},${end}`
            const url = `/u/${m.get('username')}`
            elems.push(
                <a key={mentionKey} className="chat_mention" onClick={ () => { handleSelectUsername(m.get('username')) } }>
                    { message.substring(start, end) }
                </a>
            )

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
        const { comment, username, isCreator, handleSelectUsername } = this.props;
        const creatorClass = isCreator ? "creator" : "";
        return (
            <li className="chat_item">
                <strong className={creatorClass}>
                    <a onClick={ () => { handleSelectUsername(username) } }>{username}</a>
                </strong>&nbsp;
                {this.renderMessage()}
            </li>
        );
    }
}

export default ChatItem;
