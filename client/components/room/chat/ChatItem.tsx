import * as React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { timeOfDayString } from '@utils'

import renderMessageText from './utils/renderMessageText'
import ChatItemHeader from './ChatItemHeader'
import Icon from '@components/shared/Icon'
import Dropdown from '@components/shared/Dropdown'
import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'

interface Props {
    id?: string
    comment: Comment | TemporaryComment

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
        showOptions: false
    }

    constructor(props: Props) {
        super(props)

        this.renderMessage = this.renderMessage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
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


    // Events


    // Render

    renderMessage(includeLinks=false) {
        const { comment, handleSelectUsername, handleSelectHashtag } = this.props 

        return renderMessageText(comment, { onMentionClick: handleSelectUsername, onHashtagClick: handleSelectHashtag, includeLinks })
    }

    renderHeader() {
        const { comment, isSearchResult, handleJump, handleSelectUsername, handleSelectMediaItem } = this.props;

        const username      = comment.author().get('username')
        const timestamp     = timeOfDayString(comment.get('created_at'))
        const isReferenced  = !!comment.get('is_referenced_by')

        return (
            <div className="chat_item_header_container">
                <ChatItemHeader comment={comment} handleSelectUsername={handleSelectUsername} />
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

    render() {
        const { id, comment, isSelected, isDropdownActive, isSearchResult, 
                handleSelectOptions, handleResend, handleRespond,
                showHeader, showOptions } = this.props;


        const isReferenced      = !!comment.get('is_referenced_by')
        const referencedClass   = isReferenced ? "chat_item-is-referenced" : ""
        const isHighlighted     = isReferenced || isSelected
        const highlightedClass  = isHighlighted ? "chat_item-highlighted" : ""
        const searchResultClass = isSearchResult ? "chat_item-search" : ""
        
        const isPrivate         = comment.get('subtype') === 'private'
        const isBot             = comment.author().isBot()
        const headerClass       = showHeader ? "" : "chat_item-no-header"
        const privateClass      = isPrivate ? 'chat_item_body-private' : ''
        const badgeClass        = `chat_item-${comment.author().get('badge') || 'user'}`

        const submitStatus      = comment instanceof TemporaryComment ? comment.get('submit_status') : ""
        const submitClass       = submitStatus ? `chat_item-${submitStatus}` : ''

        const showOptionsClass  = showOptions && !isBot && !isReferenced ? "show-options" : ""

        const chatItemClasses = `${highlightedClass} ${referencedClass} ${headerClass} ${submitClass} ${badgeClass} ${showOptionsClass} ${searchResultClass}`
        
        return (
            <li className={`chat_item ${chatItemClasses}`} ref="chat" id={id}>
                <div className="chat_item_inner">
                    { showHeader && this.renderHeader() }
                    <div className={`chat_item_body ${privateClass}`}>
                        {this.renderMessage(isBot)}
                        { submitStatus === "failed" && comment instanceof TemporaryComment && 
                            <a className="btn chat_item-failed_retry" onClick={ () => { handleResend && handleResend(comment) } }>Retry</a>
                        }
                        { comment instanceof Comment && handleRespond && 
                            <div className="chat_item_options" onClick={() => { handleRespond(comment) }}>
                                <Icon type="reply" />
                                <div className="chat_item_tooltip chat_item_tooltip-options">Respond to this message</div>
                            </div>
                        }
                    </div>
                </div>
            </li>
        );
    }
}

export default ChatItem;
