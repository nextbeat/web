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
        const { roomId, dispatch } = this.props
        dispatch(selectMediaItem(roomId, mediaitem_id));
        dispatch(closeDetailSection())
    }

    renderNewMediaItemNotification() {
        const { comment, username, count } = this.props;
        const url = comment.get('mediaitem_url');
        const mediaItemID = comment.get('mediaitem_id');
        const countStr = count === 1 ? "a post" : `${count} posts`;

        return (
            <li className="chat_item chat_item-notification chat_item-notification-mediaitem" onClick={this.handleSelectMediaItem.bind(this, mediaItemID)}>
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
        switch (this.props.comment.get('subtype')) {
            case 'close':
                return this.renderCloseNotification();
            case 'mediaitem':
                return this.renderNewMediaItemNotification();
        }
        return null;
    }
}

NotificationChatItem.propTypes = {
    comment: React.PropTypes.object.isRequired,
    roomId: React.PropTypes.number.isRequired,
    username: React.PropTypes.string.isRequired,
    count: React.PropTypes.number,
}

NotificationChatItem.defaultProps = {
    count: 1
}

export default connect()(NotificationChatItem);
