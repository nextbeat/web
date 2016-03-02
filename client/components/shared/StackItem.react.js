import React from 'react'
import moment from 'moment'

class StackItem extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack, user } = this.props;
        return (
            <div className="item-room item">
                <div className="item_inner">
                    <div className="item_thumb">
                        <img className="thumb_pixel" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                        <div className="thumb_img-container">
                            <img className="thumb_img" src={stack.get('thumbnail_url')} />
                        </div>
                    </div>
                    <div className="item-room_main">
                        <div className="description">{stack.get('description')}</div>
                        <div className="details">
                            <span className="channel">{stack.getIn(['channel', 'name'])}</span>
                            <span className="time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                        </div>
                    </div>
                    <div className="item-room_right">
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
