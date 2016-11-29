import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { without } from 'lodash'
import moment from 'moment'

import Badge from './Badge.react'
import { Notifications } from '../../models'

class StackItem extends React.Component {

    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);
    }

    resize(node, parent) {

        // resize room items
        function switchClass(klass) {
            const klasses = ['one-across', 'two-across', 'three-across'];
            const klassesToRemove = without(klasses, klass);
            node.removeClass(klassesToRemove.join(" "));
            node.addClass(klass);
        }

        if (!this.props.static) {
            if (parent.width() > 800) {
                switchClass('three-across');
            } else if (parent.width() > 500) {
                switchClass('two-across');
            } else {
                switchClass('one-across');
            }
        }

        // resize thumbnail
        const thumb = node.find('.item_thumb');
        thumb.width(thumb.height());

        // resize text
        const $description = node.find('.item-room_description');
        const height = $description.height();
        let fontSize =  parseInt($description.css('font-size'));
        while ($description.prop('scrollHeight') > height) {
            $description.css('font-size', --fontSize)
        }
    }

    componentDidMount() {
        const node = $(this._node);
        const parent = node.parent();
        $(window).resize(this.resize.bind(this, node, parent));
    }

    componentDidUpdate() {
        this.resize($(this._node))
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    render() {
        const { stack, user, users } = this.props;
        const author = users.get(stack.get('author_id').toString(), Map())
        const unreadNotificationCount = user.isLoggedIn() && notifications.unreadCountForStack(stack.get('id'))
        const thumbnailUrl = stack.get('thumbnail_small_url') || stack.get('thumbnail_url', '')
        return (
            <div className="item_container" ref={(c) => this._node = c} >
            <Link to={`/r/${stack.get('hid')}`} className="item-room item" activeClassName="selected">
                <div className="item_inner">
                    <div className="item_thumb" style={{backgroundImage: `url(${thumbnailUrl})`}}>
                    </div>
                    <div className="item_main">
                        <div className="item-room_info">
                            <div className="item-room_description">{stack.get('description') || "No description."}</div>
                            <div className="item-room_details">
                                <span className="item-room_detail item-room_author">{ author.get('username') }</span>
                                <span className="item-room_detail item-room_tag">{stack.getIn(['tag', 'name'])}</span>
                                <span className="item-room_detail item-room_time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                            </div>
                        </div>
                        <div className="item-room_right">
                            <div className="item-room_right-inner">
                                {stack.get('bookmark_count')}<img className="item-room_bookmark" src="/images/bookmark.png"/>
                            </div>
                        </div>
                    </div>
                    {!stack.get('closed') && <Badge elementType="item-room" type="open" />}
                    {user.isLoggedIn() && unreadNotificationCount > 0 && <Badge elementType="item-room" type="new">{unreadNotificationCount}</Badge>}
                </div>
            </Link>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { 
        users: state.getIn(['entities', 'users']),
        notifications: new Notifications(state)
    }
}

export default connect(mapStateToProps)(StackItem);
