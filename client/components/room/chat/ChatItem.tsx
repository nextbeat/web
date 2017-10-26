import * as React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { timeString } from '@utils'

import renderMessageText from './utils/renderMessageText'
import Icon from '@components/shared/Icon'
import Dropdown from '@components/shared/Dropdown'
import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'

if (typeof window !== 'undefined') {
    var robot = require('../../../public/images/robot_64px.png');
}

interface Props {
    id?: string
    comment: Comment | TemporaryComment
    isCreator: boolean

    isCollapsed?: boolean
    isSelected?: boolean
    isSearchResult?: boolean
    isDropdownActive?: boolean
    showHeader?: boolean
    showOptions?: boolean

    handleSelectUsername?: (username: string) => void
    handleSelectHashtag?: (hashtag: string) => void
    handleResend?: (comment: TemporaryComment) => void
    handleSelectMediaItem?: (id: number) => void
    handleRespond?: (comment: Comment) => void
    handleSelectOptions?: (componentId: string) => void
    handleJump?: (comment: Comment) => void
}

class ChatItem extends React.PureComponent<Props> {

    static defaultProps: Partial<Props> = {
        isCollapsed: false,
        isSelected: false,
        isSearchResult: false,
        isDropdownActive: false,
        showHeader: true,
        showOptions: true
    }

    constructor(props: Props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.renderDropdown = this.renderDropdown.bind(this)
    }


    // Component lifecycle

    componentDidMount() {
        if (this.props.isCollapsed) {
            ($(this.refs.chat) as any).dotdotdot({
                height: 45, 
                watch: true
            })
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.isCollapsed && prevProps.comment !== this.props.comment) {
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
        const username      = comment instanceof Comment ? comment.author().get('username') as string : comment.author().get('username') as string
        const timestamp     = timeString(comment.get('created_at'))
        const isBot         = comment instanceof Comment ? !!comment.author().get('is_bot'): !!comment.author().get('username')
        const isPrivate     = comment.get('subtype') === 'private'
        const isReferenced  = !!comment.get('is_referenced_by')

        return (
            <div className="chat_item_header">
                <div className="chat_item_header_main">
                    { isBot && <img className="chat_item_emoji" src={robot} /> }
                    <div className="chat_item_header_info">
                        <span 
                            onClick={() => { !isBot && handleSelectUsername && handleSelectUsername(username) }} 
                            className={`chat_item_username ${creatorClass}`}>
                            {username}
                        </span>
                        <span className="chat_item_timestamp">{timestamp}</span>
                        { isPrivate && <span className="chat_item_private">only visible to you</span> }
                    </div>
                </div>
                <div className="chat_item_header_right">
                    { isReferenced && 
                        <div className="chat_item_referenced" onClick={() => { handleSelectMediaItem && handleSelectMediaItem(comment.get('is_referenced_by')) }}>
                        { isSearchResult ? 
                            <span className="chat_item_referenced_inner">Response</span> : 
                            <span className="chat_item_referenced_inner"><Icon type="reply" />See response</span> }
                        </div>
                    }
                    { isReferenced && isSearchResult && <span className="chat_item_header_right_divider">•</span>}
                    { isSearchResult && comment instanceof Comment && typeof handleJump === 'function' &&
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

        if (comment instanceof TemporaryComment) {
            return null
        }

        return (
            <Dropdown type={`${id}-options`} triangleMargin={-1}>
                <a className="dropdown-option" onClick={() => { handleRespond && handleRespond(comment) }}>Respond</a>
            </Dropdown>
        )
    }

    render() {
        const { id, comment, isCreator, isSelected, isDropdownActive, isSearchResult, 
                handleSelectOptions, handleResend, showHeader, showOptions } = this.props;


        const isReferenced      = !!comment.get('is_referenced_by')
        const referencedClass   = isReferenced ? "chat_item-is-referenced" : ""
        const isHighlighted     = isReferenced || isSelected
        const highlightedClass  = isHighlighted ? "chat_item-highlighted" : ""
        const searchResultClass = isSearchResult ? "chat_item-search" : ""

        const headerClass       = showHeader ? "" : "chat_item-no-header"
        const isPrivate         = comment.get('subtype') === 'private'
        const privateClass      = isPrivate ? 'chat_item_body-private' : ''
        const isBot             = comment instanceof Comment ? !!comment.author().get('is_bot') : !!comment.author().get('is_bot') // Typescript wackiness
        const isBotClass        = isBot ? 'chat_item-chatbot' : ''

        const submitStatus      = comment instanceof TemporaryComment ? comment.get('submit_status') : ""
        const submitClass       = submitStatus ? `chat_item-${submitStatus}` : ''

        const showOptionsClass  = showOptions && !isBot && !isReferenced ? "show-options" : ""
        const dropdownActiveClass = isDropdownActive ? "dropdown-active" : ""

        const chatItemClasses = `${highlightedClass} ${referencedClass} ${headerClass} ${submitClass} ${isBotClass} ${showOptionsClass} ${searchResultClass}`
        
        return (
            <li className={`chat_item ${chatItemClasses}`} ref="chat" id={id}>
                <div className="chat_item_inner">
                    { this.renderDropdown() }
                    { showHeader && this.renderHeader() }
                    <div className={`chat_item_options ${dropdownActiveClass}`} onClick={() => { id && handleSelectOptions && handleSelectOptions(id) }}>
                        <Icon type="more-vert" />
                    </div>
                    <div className={`chat_item_body ${privateClass}`}>
                        {this.renderMessage(isBot)}
                        { submitStatus === "failed" && comment instanceof TemporaryComment && 
                            <a className="btn chat_item-failed_retry" onClick={ () => { handleResend && handleResend(comment) } }>Retry</a>
                        }
                    </div>
                </div>
            </li>
        );
    }
}

export default ChatItem;
