import React from 'react'
import { Link } from 'react-router'

import renderWithMentions from './utils/renderWithMentions'

class ChatItem extends React.Component {

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
        return !this.props.comment.isEqual(nextProps.comment) || this.props.collapsed !== nextProps.collapsed
    }

    componentDidUpdate(prevProps) {
        if (prevProps.collapsed && !prevProps.comment.isEqual(this.props.comment)) {
            $(this.refs.chat).trigger('update.dot')
        }

        if (prevProps.collapsed && !this.props.collapsed) {
            $(this.refs.chat).trigger('destroy.dot')
        }
    }
    renderMessage() {
        const { comment, handleSelectUsername } = this.props 
        return renderWithMentions(comment, { onClick: handleSelectUsername })
    }

    render() {
        const { comment, username, isCreator, handleSelectUsername } = this.props;
        const usernameClass = isCreator ? "chat_item_username chat_item_creator" : "chat_item_username";
        
        return (
            <li className="chat_item" ref="chat">
                <strong className={usernameClass}>
                    <a onClick={ () => { handleSelectUsername(username) } }>{username}</a>
                </strong>
                {this.renderMessage()}
            </li>
        );
    }
}

export default ChatItem;
