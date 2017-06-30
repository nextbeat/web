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
            imageLoaded: false,
            gridClass: ''
        }
    }

    resize() {
        const node = $(this._node);
        const parent = node.parent();

        let gridClass = '';
        if (!this.props.static) {
            if (parent.width() > 1480) {
                gridClass = 'six-across';
            } else if (parent.width() > 1180) {
                gridClass = 'five-across';
            } else if (parent.width() > 880) {
                gridClass = 'four-across';
            } else if (parent.width() > 580) {
                gridClass = 'three-across';
            } else if (parent.width() > 280) {
                gridClass = 'two-across';
            } else {
                gridClass = 'one-across';
            }
        }

        this.setState({ gridClass });
    }

    componentDidMount() {
        $(window).resize(this.resize);
        this.resize();

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
            || this.props.static !== nextProps.static 
            || this.state.imageLoaded !== nextState.imageLoaded
            || this.state.gridClass !== nextState.gridClass
    }

    render() {
        const { stack, static: staticNum } = this.props;
        const { gridClass, imageLoaded } = this.state;

        const author = stack.author();
        const bookmarkType = stack.get('bookmarked') ? "bookmark" : "bookmark-outline";
        const itemWidth = isNumber(staticNum) ? staticNum + "px" : null;

        const imageLoadedClass = imageLoaded ? 'loaded' : '';
        const imageUrl = stack.thumbnail('medium').get('url');

        return (
            <div className={`item_container item-room-large_container ${gridClass}`} ref={(c) => this._node = c} style={itemWidth && {width: itemWidth}}>
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
    },
    static: React.PropTypes.number
}

export default LargeStackItem;
