import React from 'react'
import format from 'date-fns/format'

import { secureUrl } from '../../../utils'

class ActivityItem extends React.Component {

     constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);
    }

    resize(node) {
        // resize thumbnail
        const thumb = node.find('.item_thumb');
        thumb.width(thumb.height()*4.0/3.0);
    }

    componentDidMount() {
        const node = $(this._node);
        $(window).resize(this.resize.bind(this, node, parent));
    }

    componentDidUpdate() {
        this.resize($(this._node))
    }

    componentWillUnmount() {
        $(window).off('resize', this.resize);
    }

    url(mediaItem) {
        if (mediaItem.get('type') === 'video') {
            return mediaItem.get('thumbnail_url') ? mediaItem.get('thumbnail_url') : mediaItem.get('firstframe_url');
        } else {
            return mediaItem.get('thumbnail_url') ? mediaItem.get('thumbnail_url') : mediaItem.get('url');
        }
    }

    render() {
        const { mediaItem, selected, live, unseen, handleClick, index } = this.props;
        const url = secureUrl(this.url(mediaItem));
        const selectedClass = selected ? "selected" : "";
        const liveClass = live && unseen ? "live" : "";
        const videoClass = mediaItem.get('type') === 'video' ? "item-activity_video-wrapper" : "";
        
        return (
            <div className={`item item-activity ${selectedClass} ${liveClass}`} onClick={handleClick.bind(this, mediaItem.get('id'))} ref={(c) => this._node = c}>
                <div className="item_inner">
                    <div className="item_thumb" style={{ backgroundImage: `url(${url})`}}>
                        { mediaItem.get('type') === 'video' && <img className="item-activity_video" src="/images/video.png" /> }
                    </div>
                    <div className="item_main">
                        <div className="item-activity_index"><span>{index+1}</span></div>
                        <div className="item-activity_time"><span>{format(this.props.mediaItem.get('user_created_at'), 'h:mm a')}</span></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ActivityItem;
