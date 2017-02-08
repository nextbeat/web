import React from 'react'
import { Link } from 'react-router' 
import { connect } from 'react-redux'
import { Map } from 'immutable'
import without from 'lodash/without'
import isNumber from 'lodash/isNumber'

import { fromNowString } from '../../utils'
import { EntityModel } from '../../models'
import Icon from './Icon.react'
import Badge from './Badge.react'

class LargeStackItem extends React.Component {

    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);

        this.state = {
            imageLoaded: false
        }
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

        $(this._image).one('load', () => {
            this.setState({ imageLoaded: true })
        })

        if (this._image.complete) {
            this.setState({ imageLoaded: true })
        }
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !this.props.stack.isEqual(nextProps.stack)
    }

    render() {
        const { stack, static: staticNum } = this.props;

        const author = stack.author();
        const bookmarkType = stack.get('bookmarked') ? "bookmark" : "bookmark-outline";
        const itemWidth = isNumber(staticNum) ? staticNum + "px" : null;

        const imageLoadedClass = this.state.imageLoaded ? 'loaded' : '';
        const imageUrl = stack.thumbnail('medium').get('url');

        return (
            <div className="item_container item-room-large_container" ref={(c) => this._node = c} style={itemWidth && {width: itemWidth}}>
                <Link to={`/r/${stack.get('hid')}`}>
                <div className="item-room-large item">
                    <div className="item_inner item-room-large_inner">
                        { !stack.get('closed') && <Badge elementType="item-room-large" type="open" /> }
                        { stack.get('privacy_status') === 'unlisted' && 
                            <Badge elementType="item-room-large_unlisted" type="unlisted right">UNLISTED</Badge>
                        }
                        <div className="item_thumb item-room-large_thumb">
                            <div className={`item-room-large_thumb_image-container ${imageLoadedClass}`}>
                                <img className="item-room-large_thumb_image" ref={(c) => this._image = c } src={imageUrl} />
                            </div>
                            <div className="item-room-large_views">
                                <span className="item-room-large_view-count">{stack.get('views', 0)}</span> visit{stack.get('views') !== 1 && 's'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="item-room-large_info">
                    <div className="item-room-large_description">{stack.get('description')}</div>
                    <div className="item-room-large_details">
                        <span className="item-room-large_author">{author.get('username')}</span>
                        <span className="item-room-large_time">{fromNowString(stack.get('most_recent_post_at'))}</span>
                    </div>
                </div>
                </Link>
            </div>
        );
    }
}

LargeStackItem.propTypes = {
    stack: (props, propName) => {
        if (!(props[propName] instanceof EntityModel)) {
            return new Error('Invalid stack prop supplied to LargeStackItem.')   
        }
    }
}

export default LargeStackItem;
