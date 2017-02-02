import React from 'react'
import { Link } from 'react-router'

class LiveChatItem extends React.Component {

    constructor(props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
    }

    componentDidMount() {
        if (this.props.collapsed) {
            $(this.refs.chat).dotdotdot({
                height: 45,
                watch: true
            })
        }
    }

    shouldComponentUpdate(nextProps) {
        return this.props.comment !== nextProps.comment || this.props.collapsed !== nextProps.collapsed
    }

    componentDidUpdate(prevProps) {
        if (prevProps.comment !== this.props.comment) {
            $(this.refs.chat).trigger('update.dot')
        }

        if (prevProps.collapsed && !this.props.collapsed) {
            $(this.refs.chat).trigger('destroy.dot')
        }
    }

    renderMessage() {
        // We handle rendering live chat items differently from remote chat items.
        // Since we do a bit of work on the backend to isolate @mentions which 
        // refer to existing users, and we want to serve room members chat messages
        // over xmpp without going to the backend (this is subject to change)
        // we render @mentions for live chat items differently; we highlight ALL
        // @mentions (even if they refer to invalid usernames). This is probably
        // not a permanent design decision
        const { comment, handleSelectUsername } = this.props 

        const message   = comment.get('message')
        const regex = /(@\w+)/
        const elems = message.split(regex).map((str, idx) => {
            const key = `@${idx}`
            if (str.charAt(0) === '@') {
                const username = str.substring(1)
                return <a key={key} className="chat_mention" onClick={() => {handleSelectUsername(username)}}>{str}</a>
            }
            return <span key={key}>{str}</span>
        })

        return (
            <span>
                { elems }
            </span>
        )
    }

    render() {
        const { comment, isCreator, handleSelectUsername } = this.props
        const username = comment.get('username')
        const usernameClass = isCreator ? "chat_item_username chat_item_creator" : "chat_item_username";

        return (
            <li className="chat_item" ref="chat">
                <strong className={usernameClass}>
                    <a onClick={() => {handleSelectUsername(username)}}>{username}</a>
                </strong>
                {this.renderMessage(comment)}
            </li>
        );
    }
}

export default LiveChatItem;
