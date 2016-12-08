import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Map } from 'immutable'
import without from 'lodash/without'

import Badge from './Badge.react'
import { Notifications, CurrentUser, EntityModel } from '../../models'
import { fromNowString } from '../../utils'

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
        const thumb = node.find('.item-room_thumb');
        thumb.width(thumb.height()*4/3);
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
        const { stack, currentUser, notifications } = this.props;

        const author = stack.author()
        const unreadNotificationCount = currentUser.isLoggedIn() && notifications.unreadMediaItemCount(stack.get('id'))

        return (
            <div className="item_container" ref={(c) => this._node = c} >
            <Link to={`/r/${stack.get('hid')}`} className="item-room" activeClassName="selected">
                    <div className="item-room_thumb" style={{backgroundImage: `url(${stack.thumbnail('small').get('url')})`}}></div>
                    <div className="item-room_main">
                            <div className="item-room_description">{stack.get('description') || "No description."}</div>
                            <div className="item-room_details">
                                <span className="item-room_detail item-room_author">{ author.get('username') }</span>
                            </div>
                    </div>
                    {!stack.get('closed') && <Badge elementType="item-room" type="open" />}
                    {currentUser.isLoggedIn() && unreadNotificationCount > 0 && <Badge elementType="item-room" type="new">{unreadNotificationCount}</Badge>}
            </Link>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { 
        notifications: new Notifications(state),
        currentUser: new CurrentUser(state)
    }
}

StackItem.propTypes = {
    stack: (props, propName) => {
        if (!(props[propName] instanceof EntityModel)) {
            return new Error('Invalid stack prop supplied to StackCard.')   
        }
    }
}

export default connect(mapStateToProps)(StackItem);
