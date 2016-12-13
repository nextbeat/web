import React from 'react'
import { Link } from 'react-router'

import { fromString } from '../../../utils'
import Icon from '../../shared/Icon.react'

class NotificationItem extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            mountDate: null
        }
    }

    componentDidMount() {
        // Fix date at mount so that fromNow() doesn't recalculate when component re-renders
        this.setState({
            mountDate: new Date()
        });
    }

    url(notification) {
        switch (notification.type) {
            case 'new_stack':
            case 'mentions':
            case 'bookmarks':
            case 'new_mediaitem':
                return `/r/${notification.stack.hid}`
            case 'subscriptions':
                return `/u/${notification.user.username}`
            default:
                return null;
        }
    }

    renderMessage(notification) {
        if (notification.type === 'new_stack') {
            return <span><strong>{notification.user.username}</strong>{` opened a new room: ${notification.stack.description}`}</span>
        } else if (notification.type === 'new_mediaitem') {
            return <span><strong>{notification.user.username}</strong>{` added a new post to: ${notification.stack.description}`}</span>
        } else if (notification.type === 'mentions') {
            return <span><strong>{notification.user.username}</strong>{` mentioned you in a comment: ${notification.comment.message}`}</span>
        } else if (notification.type === 'bookmarks') {
            return <span><strong>{notification.user.username}</strong>{` bookmarked your room: ${notification.stack.description}`}</span>
        } else if (notification.type === 'subscriptions') {
            return <span><strong>{notification.user.username}</strong>{` subscribed to you.`}</span>
        }
        return null;
    }

    render() {
        const notification = this.props.notification.toJS()
        const thumbStyle = { backgroundImage: notification.thumbnail_url ? `url(${notification.thumbnail_url})` : '' }
        return (
            <Link className="notification-item" to={this.url(notification)}> 
                <div className="notification-item_thumbnail" style={thumbStyle}> 
                    { !notification.thumbnail_url && <Icon type="person" /> }
                </div>
                <div className="notification-item_main">
                    <span className="notification-item_text">{this.renderMessage(notification)}</span>
                    <span className="notification-item_timestamp">{fromString(notification.timestamp*1000, this.state.mountDate, { format: 'short' })}</span>
                </div>
            </Link>
        );
    }
}

export default NotificationItem;
