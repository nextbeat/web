import React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { timeString } from '../../../utils'

import renderMessageText from './utils/renderMessageText'
import Icon from '../../shared/Icon.react'

if (typeof window !== 'undefined') {
    var robot = require('../../../public/images/robot_64px.png');
} 

class ChatItem extends React.Component {

    constructor(props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
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

        return renderMessageText(comment, { onMentionClick: handleSelectUsername, includeLinks })
    }

    renderHeader() {
        const { comment, isCreator, handleSelectUsername, handleSelectMediaItem } = this.props;

        const creatorClass  = isCreator ? "creator" : ""
        const username      = comment.author().get('username')
        const timestamp     = timeString(comment.get('created_at'))
        const isBot         = comment.author().get('is_bot')
        const isPrivate     = comment.get('subtype') === 'private'
        const isReferenced  = !!comment.get('is_referenced_by')

        return (
            <div className="chat_item_header">
                <div className="chat_item_header_main">
                    { isBot && <img className="chat_item_emoji" src={robot} /> }
                    <div className="chat_item_header_info">
                        <span 
                            onClick={() => { handleSelectUsername(username) }} 
                            className={`chat_item_username ${creatorClass}`}>
                            {username}
                        </span>
                        <span className="chat_item_timestamp">{timestamp}</span>
                        { isPrivate && <span className="chat_item_private">only visible to you</span> }
                    </div>
                </div>
                { isReferenced && 
                    <div className="chat_item_referenced" onClick={() => { handleSelectMediaItem(comment.get('is_referenced_by')) }}>
                        <Icon type="reply" /> See response
                    </div>
                }
            </div>
        );
    }

    render() {
        const { comment, isCreator, handleSelectUsername, id, showHeader, isSelected } = this.props;

        const isHighlighted     = comment.get('is_referenced_by') || isSelected
        const highlightedClass  = isHighlighted ? "chat_item-highlighted" : ""

        const headerClass       = showHeader ? "" : "chat_item-no-header"
        const isPrivate         = comment.get('subtype') === 'private'
        const privateClass      = isPrivate ? 'chat_item_body-private' : ''
        const isBot             = comment.author().get('is_bot')

        const submitStatus      = comment.get('submit_status')
        const submitClass       = submitStatus ? `chat_item-${submitStatus}` : ''
        
        return (
            <li className={`chat_item ${highlightedClass} ${headerClass} ${submitClass}`} ref="chat" id={id}>
                { showHeader && this.renderHeader() }
                <div className={`chat_item_body ${privateClass}`}>
                    {this.renderMessage(isBot)}
                    { submitStatus === "failed" && 
                        <a className="btn chat_item-failed_retry" onClick={ () => { handleResend(comment) } }>Retry</a>
                    }
                </div>
            </li>
        );
    }
}

ChatItem.propTypes = {
    comment: React.PropTypes.object.isRequired,

    isCreator: React.PropTypes.bool,
    isCollapsed: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    handleSelectUsername: React.PropTypes.func,
    handleResend: React.PropTypes.func,
    handleSelectMediaItem: React.PropTypes.func,
    showHeader: React.PropTypes.bool
}

ChatItem.defaultProps = {
    isCollapsed: false,
    isSelected: false,
    showHeader: true
}

export default ChatItem;
