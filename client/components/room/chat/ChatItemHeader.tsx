import * as React from 'react'

import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'
import { timeOfDayString } from '@utils'

interface Props {
    comment: Comment | TemporaryComment
    handleSelectUsername?: (username: string) => void
}

class ChatItemHeader extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        const { handleSelectUsername, comment } = this.props
        if (comment.author().isBot()) {
            return
        }

        if (handleSelectUsername) {
            handleSelectUsername(comment.author().get('username'))
        }
    }

    render() {
        const { comment } = this.props
        const badge = comment.author().get('badge') || 'user'
        const username = comment.author().get('username')
        const timestamp = timeOfDayString(comment.get('created_at'))
        const isPrivate = comment.get('subtype') === 'private'

        return (
            <div className={`chat_item_header chat_item_header-${badge}`}>
                <div className={`chat_item_badge chat_item_badge-${badge}`} />
                <div className="chat_item_header_info">
                    <span onClick={this.handleClick} className="chat_item_username">{username}</span>
                    <span className="chat_item_timestamp">{timestamp}</span>
                    { isPrivate && <span className="chat_item_private">only visible to you</span> }
                </div>
            </div>
        )
    }
}

export default ChatItemHeader;