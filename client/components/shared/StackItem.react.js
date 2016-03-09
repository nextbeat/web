import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Map } from 'immutable'
import moment from 'moment'

class StackItem extends React.Component {

    render() {
        const { stack, user, users } = this.props;
        const author = users.get(stack.get('author_id').toString(), Map())
        return (
            <Link to={`/r/${stack.get('id')}`} className="item-room item" activeClassName="selected">
                <div className="item_inner">
                    <div className="item_thumb">
                        <img className="thumb_pixel" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                        <div className="thumb_img-container">
                            <img className="thumb_img" src={stack.get('thumbnail_url')} />
                        </div>
                    </div>
                    <div className="item_main">
                        <div className="item-room_info">
                            <div className="item-room_description">{stack.get('description') || "No description."}</div>
                            <div className="item-room_details">
                                <span className="item-room_detail item-room_author">{ author.get('username') }</span>
                                <span className="item-room_detail item-room_channel">{stack.getIn(['channel', 'name'])}</span>
                                <span className="item-room_detail item-room_time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                            </div>
                        </div>
                        <div className="item-room_right">
                            {stack.get('bookmark_count')}<img className="item-room_bookmark" src="/images/bookmark.png"/>
                        </div>
                    </div>
                    {!stack.get('closed') && <span className="item-room_open">OPEN</span>}
                    {user && user.hasUnreadNotificationsForStack(stack.get('id')) && <span className="item-room_notification">NEW</span>}
                </div>
            </Link>
        );
    }
}

function mapStateToProps(state) {
    return { 
        users: state.getIn(['entities', 'users'])
    }
}

export default connect(mapStateToProps)(StackItem);
