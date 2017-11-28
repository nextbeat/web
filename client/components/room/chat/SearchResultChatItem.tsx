import * as React from 'react'
import { connect } from 'react-redux'

import renderMessageText from './utils/renderMessageText'
import Icon from '@components/shared/Icon'
import { jumpToComment } from '@actions/room'
import { hideSearchChatResults } from '@actions/pages/room'
import SearchResultComment from '@models/entities/searchResultComment'
import { DispatchProps } from '@types'
import { timeOfDayString } from '@utils'

interface Props {
    comment: SearchResultComment
    roomId: number

    isCreator: boolean
    showOptions: boolean
    handleSelectMediaItem: (id: number) => void
}

class SearchResultChatItem extends React.Component<Props & DispatchProps> {

    constructor(props: Props & DispatchProps) {
        super(props);

        this.handleJumpClick = this.handleJumpClick.bind(this);
    }

    handleJumpClick() {
        const { dispatch, comment, roomId } = this.props;
        dispatch(hideSearchChatResults());
        dispatch(jumpToComment(roomId, comment));
    }

    render() {
        const { comment, showOptions, handleSelectMediaItem } = this.props;

        const isReferenced = !!comment.get('is_referenced_by')
        const highlightClass = isReferenced ? "chat_item-highlighted" : ""
        const showOptionsClass = showOptions ? "show-options" : ""

        return (
            <li className={`chat_item chat_item-search ${highlightClass} ${showOptionsClass}`}>
                <div className="chat_item-search_jump" onClick={this.handleJumpClick}>
                    Jump
                </div>

                { isReferenced &&
                    <div className="chat_item_referenced" onClick={() => { handleSelectMediaItem(comment.get('is_referenced_by')) }}>
                        <Icon type="reply" /> See response
                    </div>
                }
                <div className="chat_item-search_inner">
                    <div className="chat_item-search_header">
                        <span className="chat_item-search_username">
                            {comment.author().get('username')}
                        </span>
                        <span className="chat_item-search_time">
                            at {timeOfDayString(comment.get('created_at'))}
                        </span>
                    </div>
                    <div className="chat_item-search_body">
                        { renderMessageText(comment) }
                    </div>
                </div>
            </li>
        )
    }
}

export default connect()(SearchResultChatItem);

