import React from 'react'
import { Link } from 'react-router'
import renderWithMentions from './utils/renderWithMentions'

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
        // over xmpp without going to the backend (NOTE: no longer true; we use eddy now)
        // we render @mentions for live chat items differently; we highlight ALL
        // @mentions (even if they refer to invalid usernames). This is probably
        // not a permanent design decision.
        const { comment, handleSelectUsername } = this.props 
        return renderWithMentions(comment, { onClick: handleSelectUsername, forceMentions: true })
    }

    render() {
        const { comment, isCreator, handleSelectUsername, type } = this.props
        const username = comment.get('username')
        const usernameClass = isCreator ? "chat_item_username chat_item_creator" : "chat_item_username";

        return (
            <li className={`chat_item chat_item-${type}`} ref="chat">
                <strong className={usernameClass}>
                    <a onClick={() => {handleSelectUsername(username)}}>{username}</a>
                </strong>
                {this.renderMessage(comment)}
            </li>
        );
    }
}

LiveChatItem.defaultProps = {
    type: "submitted",
    collapsed: false
}

export default LiveChatItem;
