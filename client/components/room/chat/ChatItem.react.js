import React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { timeString } from '../../../utils'

import renderMessageText from './utils/renderMessageText'
import Icon from '../../shared/Icon.react'
import Dropdown from '../../shared/Dropdown.react'

if (typeof window !== 'undefined') {
    var robot = require('../../../public/images/robot_64px.png');
} 

class ChatItem extends React.Component {

    constructor(props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.renderDropdown = this.renderDropdown.bind(this)
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
                || this.props.isDropdownActive !== nextProps.isDropdownActive
                || this.props.showOptions !== nextProps.showOptions
                || this.props.isSelected !== nextProps.isSelected
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
        const { comment, handleSelectUsername, handleSelectHashtag } = this.props 

        return renderMessageText(comment, { onMentionClick: handleSelectUsername, onHashtagClick: handleSelectHashtag, includeLinks })
    }

    renderHeader() {
        const { comment, isCreator, isSearchResult,
                handleJump, handleSelectUsername, handleSelectMediaItem } = this.props;

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
                            onClick={() => { !isBot && handleSelectUsername(username) }} 
                            className={`chat_item_username ${creatorClass}`}>
                            {username}
                        </span>
                        <span className="chat_item_timestamp">{timestamp}</span>
                        { isPrivate && <span className="chat_item_private">only visible to you</span> }
                    </div>
                </div>
                <div className="chat_item_header_right">
                    { isReferenced && 
                        <div className="chat_item_referenced" onClick={() => { handleSelectMediaItem(comment.get('is_referenced_by')) }}>
                        { isSearchResult ? 
                            <span className="chat_item_referenced_inner">Response</span> : 
                            <span className="chat_item_referenced_inner"><Icon type="reply" />See response</span> }
                        </div>
                    }
                    { isReferenced && isSearchResult && <span className="chat_item_header_right_divider">•</span>}
                    { isSearchResult &&
                        <div className="chat_item-search_jump" onClick={() => { handleJump(comment) }}>
                            Jump
                        </div>
                    }
                </div>
            </div>
        );
    }

    renderDropdown() {
        const { id, handleRespond, comment } = this.props;

        return (
            <Dropdown type={`${id}-options`} triangleMargin={-1}>
                <a className="dropdown-option" onClick={() => { handleRespond(comment) }}>Respond</a>
            </Dropdown>
        )
    }

    render() {
        const { id, comment, isCreator, isSelected, isDropdownActive, isSearchResult, 
                handleSelectOptions, showHeader, showOptions } = this.props;


        const isReferenced      = !!comment.get('is_referenced_by')
        const referencedClass   = isReferenced ? "chat_item-is-referenced" : ""
        const isHighlighted     = isReferenced || isSelected
        const highlightedClass  = isHighlighted ? "chat_item-highlighted" : ""
        const searchResultClass = isSearchResult ? "chat_item-search" : ""

        const headerClass       = showHeader ? "" : "chat_item-no-header"
        const isPrivate         = comment.get('subtype') === 'private'
        const privateClass      = isPrivate ? 'chat_item_body-private' : ''
        const isBot             = comment.author().get('is_bot')
        const isBotClass        = isBot ? 'chat_item-chatbot' : ''

        const submitStatus      = comment.get('submit_status')
        const submitClass       = submitStatus ? `chat_item-${submitStatus}` : ''

        const showOptionsClass  = showOptions && !isBot && !isReferenced ? "show-options" : ""
        const dropdownActiveClass = isDropdownActive ? "dropdown-active" : ""

        const chatItemClasses = `${highlightedClass} ${referencedClass} ${headerClass} ${submitClass} ${isBotClass} ${showOptionsClass} ${searchResultClass}`
        
        return (
            <li className={`chat_item ${chatItemClasses}`} ref="chat" id={id}>
                <div className="chat_item_inner">
                    { this.renderDropdown() }
                    { showHeader && this.renderHeader() }
                    <div className={`chat_item_options ${dropdownActiveClass}`} onClick={() => { handleSelectOptions(id) }}>
                        <Icon type="more-vert" />
                    </div>
                    <div className={`chat_item_body ${privateClass}`}>
                        {this.renderMessage(isBot)}
                        { submitStatus === "failed" && 
                            <a className="btn chat_item-failed_retry" onClick={ () => { handleResend(comment) } }>Retry</a>
                        }
                    </div>
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
    isSearchResult: React.PropTypes.bool,
    handleSelectUsername: React.PropTypes.func,
    handleSelectHashtag: React.PropTypes.func,
    handleResend: React.PropTypes.func,
    handleSelectMediaItem: React.PropTypes.func,
    handleRespond: React.PropTypes.func,
    handleSelectOptions: React.PropTypes.func,
    handleJump: React.PropTypes.func,
    showHeader: React.PropTypes.bool,
    showOptions: React.PropTypes.bool,
    isDropdownActive: React.PropTypes.bool
}

ChatItem.defaultProps = {
    isCollapsed: false,
    isSelected: false,
    showHeader: true,
    showOptions: false,
    isDropdownActive: false,
    isSearchResult: false,
    isSelected: false
}

export default ChatItem;
