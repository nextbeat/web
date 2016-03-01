import React from 'react'
import moment from 'moment'

class StackItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack, user } = this.props;
        return (
            <div className="room-item">
                <div className="room-item__inner">
                <div className="room-item__thumb">
                    <img className="thumb__pixel" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                    <div className="thumb__img-container">
                        <img className="thumb__img" src={stack.get('thumbnail_url')} />
                    </div>
                </div>
                <div className="room-item__main">
                    <div className="description">{stack.get('description')}</div>
                    <div className="details">
                        <span className="channel">{stack.getIn(['channel', 'name'])}</span>
                        <span className="time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                    </div>
                </div>
                <div className="room-item__right">
                    {stack.get('bookmark_count')}<img src="/images/bookmark.png"/>
                </div>
                {!stack.get('closed') && <span className="open">OPEN</span>}
                {user && user.hasUnreadNotificationsForStack(stack.get('id')) && <span className="notification">NEW</span>}
                </div>
            </div>
        );
    }
}

export default StackItem;
