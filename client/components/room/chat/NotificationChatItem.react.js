import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { selectMediaItem, closeDetailSection } from '../../../actions'

class NotificationChatItem extends React.Component {

    constructor(props) {
        super(props);

        this.renderNewMediaItemNotification = this.renderNewMediaItemNotification.bind(this);
    }

    handleSelectMediaItem(mediaitem_id) {
        const { room, dispatch } = this.props
        dispatch(selectMediaItem(room.get('id'), mediaitem_id));
        dispatch(closeDetailSection())
    }

    renderNewMediaItemNotification() {
        const { comment, username } = this.props;
        const [ count, url, mediaitem_id ] = [ 
            comment.get('notification_count'), 
            comment.get('notification_url'),
            comment.get('mediaitem_id')
        ];
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-notification chat_item-notification-mediaitem" onClick={this.handleSelectMediaItem.bind(this, mediaitem_id)}>
                <div className="chat_item-notification_thumb" style={{ backgroundImage: `url(${url})`}}></div>
                <span className="chat_item-notification_text"><strong>{username}</strong> added {countStr} to the room.</span>
            </li>
        );
    }

    renderCloseNotification() {
        return (
            <li className="chat_item chat_item-notification chat_item-notification-close">
                <span className="chat_item-notification_text">This room is no longer open.</span>
            </li>
        );
    }

    render() {
        return this.props.comment.get('notification_type', 'close') === 'close' ? 
           this.renderCloseNotification() : this.renderNewMediaItemNotification()
    }
}

// no mapStateToProps since we just need this.props.dispatch
export default connect()(NotificationChatItem);
