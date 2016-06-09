import React from 'react'
import { Link } from 'react-router' 
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { without, isNumber } from 'lodash'
import moment from 'moment'

import Icon from './Icon.react'
import Badge from './Badge.react'

class LargeStackItem extends React.Component {

    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);
    }

    resize(node, parent) {

        // resize room items
        function switchClass(klass) {
            const klasses = ['one-across', 'two-across', 'three-across', 'four-across', 'five-across', 'six-across'];
            const klassesToRemove = without(klasses, klass);
            node.removeClass(klassesToRemove.join(" "));
            node.addClass(klass);
        }

        if (!this.props.static) {
            if (parent.width() > 1480) {
                switchClass('six-across');
            } else if (parent.width() > 1180) {
                switchClass('five-across');
            } else if (parent.width() > 880) {
                switchClass('four-across');
            } else if (parent.width() > 580) {
                switchClass('three-across');
            } else if (parent.width() > 280) {
                switchClass('two-across');
            } else {
                switchClass('one-across');
            }
        }

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

    fancyThumbnailUrl(stack) {
        if (stack.get('fb_thumbnail_url')) {
            return stack.get('fb_thumbnail_url');
        }

        let url = stack.get('thumbnail_url', '');
        const suffix = '_200px.jpg';
        if (url.substring(url.length-suffix.length) === suffix) {
            url = url.substring(0, url.length-suffix.length) + '.jpg';
        }
        return url;
    }

    render() {
        const { stack, user, users, static: staticNum } = this.props;
        const author = users.get(stack.get('author_id').toString(), Map())
        const bookmarkType = stack.get('bookmarked') ? "bookmark" : "bookmark-outline";
        const itemWidth = isNumber(staticNum) ? staticNum + "px" : null

        return (
            <div className="item_container item-room-large_container" ref={(c) => this._node = c} style={itemWidth && {width: itemWidth}}>
                <Link to={`/r/${stack.get('hid')}`}>
                <div className="item-room-large item">
                    <div className="item_inner item-room-large_inner">
                        { !stack.get('closed') && <Badge elementType="item-room-large" type="open" /> }
                        <div className="item_thumb item-room-large_thumb">
                            <img className="thumb_img" src={this.fancyThumbnailUrl(stack)} />
                            <div className="item-room-large_bookmarks">
                                <span className="item-room-large_bookmark-count">{stack.get('bookmark_count')}</span><Icon type={bookmarkType} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="item-room-large_info">
                    <div className="item-room-large_description">{stack.get('description')}</div>
                    <div className="item-room-large_details">
                        <span className="item-room-large_author">{author.get('username')}</span>
                        <span className="item-room-large_time">{moment(stack.get('most_recent_post_at')).fromNow()}</span>
                    </div>
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

export default connect(mapStateToProps)(LargeStackItem);
