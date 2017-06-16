import React from 'react'
import { connect } from 'react-redux'

import Icon from '../../shared/Icon.react'
import renderMessageText from './utils/renderMessageText'
import { timeString } from '../../../utils'
import { jumpToComment, hideSearchChatResults } from '../../../actions'

class SearchResultChatItem extends React.Component {

    constructor(props) {
        super(props);

        this.handleJumpClick = this.handleJumpClick.bind(this);
    }

    handleJumpClick() {
        const { dispatch, comment, roomId } = this.props;
        dispatch(hideSearchChatResults());
        dispatch(jumpToComment(roomId, comment));
    }

    render() {
        const { comment, showOptions } = this.props;

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
                            at {timeString(comment.get('created_at'))}
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

SearchResultChatItem.propTypes = {
    comment: React.PropTypes.object.isRequired,
    roomId: React.PropTypes.number.isRequired,

    isCreator: React.PropTypes.bool,
    showOptions: React.PropTypes.bool
}

export default connect()(SearchResultChatItem);

