import React from 'react'

import renderMessageText from './utils/renderMessageText'
import { timeString } from '../../../utils'

class SearchResultChatItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { comment } = this.props;

        return (
            <li className="chat_item chat_item-search">
                <div className="chat_item-search_jump">
                    Jump
                </div>
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

    isCreator: React.PropTypes.bool,
    handleSelect: React.PropTypes.func
}

export default SearchResultChatItem;

