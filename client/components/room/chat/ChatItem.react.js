import React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'

import renderMessageText from './utils/renderMessageText'

class ChatItem extends React.Component {

    constructor(props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
        this.renderBotComment = this.renderBotComment.bind(this)
        this.renderUserComment = this.renderUserComment.bind(this)
        this.renderTemporaryComment = this.renderTemporaryComment.bind(this)
    }


    // Component lifecycle

    componentDidMount() {
        if (this.props.isCollapsed) {
            $(this.refs.chat).dotdotdot({
                height: 45, 
                watch: true
            })
        }
    }

    shouldComponentUpdate(nextProps) {
        return !(typeof this.props.comment.isEqual === "function" && this.props.comment.isEqual(nextProps.comment)) 
                || this.props.isCollapsed !== nextProps.isCollapsed
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isCollapsed && !prevProps.comment.isEqual(this.props.comment)) {
            $(this.refs.chat).trigger('update.dot')
        }

        if (prevProps.isCollapsed && !this.props.isCollapsed) {
            $(this.refs.chat).trigger('destroy.dot')
        }
    }


    // Render

    renderMessage(includeLinks=false) {
        const { comment, handleSelectUsername } = this.props 

        let forceMentions = !comment.has('user_mentions')
        return renderMessageText(comment, { onClick: handleSelectUsername, includeLinks, forceMentions })
    }

    renderBotComment() {
        const { comment } = this.props;

        const isPrivate = comment.get('subtype') === 'private'
        const username = comment.author().get('username')

        return (
            <li className="chat_item chat_item-chatbot">
                <div className="chat_item-chatbot_header">
                    <img className="chat_item_emoji" src={robot} />
                    <span className="chat_item-chatbot_username">{username}</span>
                    { isPrivate && <span className="chat_item-chatbot_private">only visible to you</span> }
                </div>
                <div className={`chat_item-chatbot_body ${privateClass}`}>
                    {this.renderMessage(true)}
                </div>
            </li>
        );
    }

    renderUserComment() {
        const { comment, isCreator, handleSelectUsername } = this.props;

        // Currently only bot comments can be private,
        // so we don't bother with private comment styling
        // on user comments

        const creatorClass = isCreator ? "chat_item_creator" : ""
        const username = comment.author().get('username')
        
        return (
            <li className="chat_item" ref="chat">
                <strong className={`chat_item-username ${creatorClass}`}>
                    <a onClick={ () => { handleSelectUsername(username) } }>{username} </a>
                </strong>
                {this.renderMessage(false)}
            </li>
        );
    }

    renderTemporaryComment() {
        const { comment, isCreator, handleSelectUsername, submitStatus } = this.props

        const submitClass = `chat_item-${submitStatus}`
        const creatorClass = isCreator ? "chat_item_creator" : ""
        const username = comment.get('username')

        return (
            <li className={`chat_item ${submitClass}`} ref="chat">
                <strong className={`chat_item-username ${creatorClass}`}>
                    <a onClick={ () => { handleSelectUsername(username) } }>{username} </a>
                </strong>
                {this.renderMessage(false)}
            </li>
        );
    }

    render() {
        const { comment } = this.props;

        if (typeof comment.author !== "function") {
            // temporary comment; in process of submission
            return this.renderTemporaryComment()
        }

        const isBot = comment.author().get('is_bot')
        return isBot ? this.renderBotComment() : this.renderUserComment()
    }
}

ChatItem.propTypes = {
    comment: React.PropTypes.object.isRequired,

    isCreator: React.PropTypes.bool,
    isCollapsed: React.PropTypes.bool,
    handleSelectUsername: React.PropTypes.func,
    submitStatus: React.PropTypes.string,
}

ChatItem.defaultProps = {
    submitStatus: "submitted",
    isCollapsed: false
}

export default ChatItem;
