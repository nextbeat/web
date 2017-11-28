import * as React from 'react'
import { Link } from 'react-router'

import Comment from '@models/entities/comment'
import { timeOfDayString } from '@utils'

interface Props {
    comment: Comment
    username: string
    count?: number

    handleSelectMediaItem?: (id: number) => void
}

class NotificationChatItem extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        count: 1
    }

    render() {
        const { comment, username, count, handleSelectMediaItem } = this.props;
        const url = comment.get('mediaitem_url');
        const mediaItemId = comment.get('mediaitem_id');
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-highlighted chat_item-notification" onClick={() => { handleSelectMediaItem && handleSelectMediaItem(mediaItemId) }}>
                <div className="chat_item-notification_thumb" style={{ backgroundImage: `url(${url})`}}></div>
                <div className="chat_item-notification_text">
                    <span className="chat_item_username">{username}</span> added {countStr} to the room.
                    <span className="chat_item_timestamp">{timeOfDayString(comment.get('created_at'))}</span>
                </div>
            </li>
        );
    }
}

export default NotificationChatItem;
