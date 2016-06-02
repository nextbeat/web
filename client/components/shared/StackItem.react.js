import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Map } from 'immutable'
import { without } from 'lodash'
import moment from 'moment'
import { secureUrl } from '../../utils'

import Badge from './Badge.react'

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
    }

    componentDidMount() {
        const node = $(this._node);
        const parent = node.parent();
        $(window).resize(this.resize.bind(this, node, parent));
        this.resize(node, parent);
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    render() {
        const { stack, user, users } = this.props;
        const author = users.get(stack.get('author_id').toString(), Map())
        return (
            <div className="item_container" ref={(c) => this._node = c} >
            <Link to={`/r/${stack.get('hid')}`} className="item-room item" activeClassName="selected">
                <div className="item_inner">
                    <div className="item_thumb">
                        <img className="thumb_img" src={secureUrl(stack.get('thumbnail_url'))} />
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
                    {user && user.hasUnreadNotificationsForStack(stack.get('id')) && <Badge elementType="item-room" type="new" />}
                </div>
            </Link>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { 
        users: state.getIn(['entities', 'users'])
    }
}

export default connect(mapStateToProps)(StackItem);
