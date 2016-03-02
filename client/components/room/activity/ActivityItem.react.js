import React from 'react';
import moment from 'moment';

class ActivityItem extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'ActivityItem';
    }

    url(mediaItem) {
        if (mediaItem.get('type') === 'video') {
            return mediaItem.get('thumbnail_url') ? mediaItem.get('thumbnail_url') : mediaItem.get('firstframe_url');
        } else {
            return mediaItem.get('thumbnail_url') ? mediaItem.get('thumbnail_url') : mediaItem.get('url');
        }
    }

    render() {
        const { mediaItem, selected, live, handleClick } = this.props;
        const url = this.url(mediaItem);
        const selectedClass = selected ? "selected" : "";
        const liveClass = live ? "live" : "";
        const videoClass = mediaItem.get('type') === 'video' ? "video" : "";
        return (
            <div className={`item item-activity ${selectedClass} ${liveClass}`} onClick={handleClick.bind(this, mediaItem.get('id'))}>
                <div className={`item_thumb ${videoClass}`}>
                    <img className="thumb_pixel" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                    <div className="thumb_img-container">
                        <img className="thumb_img" src={url} />
                        { mediaItem.get('type') === 'video' && <img className="item-activity_video" src="/images/video.png" /> }
                    </div>
                </div>
                <div className="item-activity_time"><span>{moment(this.props.mediaItem.get('created_at')).fromNow()}</span></div>
            </div>
        );
    }
}

export default ActivityItem;
