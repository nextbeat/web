import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router'
import { Map } from 'immutable'
import without from 'lodash/without'

import Badge from './Badge.react'
import { EntityModel } from '../../models'
import { fromNowString } from '../../utils'

class StackItem extends React.Component {

    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);

        this.state = {
            width: 0,
            gridClass: '',
            imageLoaded: false
        };
    }

    resize() {
        var parent = $(this._node).parent;

        let gridClass = '';
        if (!this.props.static) {
            if (parent.width() > 800) {
                gridClass = 'three-across';
            } else if (parent.width() > 500) {
                gridClass = 'two-across';
            } else {
                gridClass = 'one-across';
            }
        }

        // resize thumbnail
        const height = $(this._node).find('.item-room_thumb').height();
        const width = Math.floor(height*4/3);

        this.setState({ gridClass, width });
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

    componentWillReceiveProps() {
        this.resize();
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    render() {
        const { stack, showBadge } = this.props;
        const { gridClass, width, imageLoaded  } = this.state

        const author = stack.author()
        const unreadCount = stack.get('unread_count', 0);

        const imageLoadedClass = imageLoaded ? 'loaded' : '';
        const imageUrl = stack.thumbnail('small').get('url');

        return (
            <div className={`item_container ${gridClass}`} ref={(c) => this._node = c} >
            <Link to={`/r/${stack.get('hid')}`} className="item-room" activeClassName="selected">
                    <div className={`item-room_thumb ${imageLoadedClass}`} style={{ width: `${width}px` }}>
                        <img className="item-room_thumb_image" ref={(c) => this._image = c} src={imageUrl} />
                    </div>
                    <div className="item-room_main">
                            <div className="item-room_description">{stack.get('description') || "No description."}</div>
                            <div className="item-room_details">
                                <span className="item-room_detail item-room_author">{ author.get('username') }</span>
                            </div>
                    </div>
                    {!stack.get('closed') && <Badge elementType="item-room" type="open" />}
                    {showBadge && unreadCount > 0 && <Badge elementType="item-room" type="new">NEW</Badge>}
            </Link>
            </div>
        );
    }
}

StackItem.propTypes = {
    stack: (props, propName) => {
        if (!(props[propName] instanceof EntityModel)) {
            return new Error('Invalid stack prop supplied to StackItem.')   
        }
    },
    showBadge: PropTypes.bool,
    static: PropTypes.bool
}

StackItem.defaultProps = {
    showBadge: false,
    static: false
}

export default StackItem;
