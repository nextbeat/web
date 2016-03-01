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
        const { mediaItem, selected, live } = this.props;
        const url = this.url(mediaItem);
        const selectedClass = selected ? "selected" : "";
        const liveClass = live ? "live" : "";
        const videoClass = mediaItem.get('type') === 'video' ? "video" : "";
        return (
            <div className={`activity-item ${selectedClass} ${liveClass}`} onClick={this.props.handleClick.bind(this, this.props.mediaItem)}>
                <div className={`thumb ${videoClass}`}>
                    <img className="content" src={url}/>
                    { mediaItem.get('type') === 'video' && <img className="video" src="/images/video.png" /> }
                </div>
                <div className="time"><span>{moment(this.props.mediaItem.get('created_at')).fromNow()}</span></div>
            </div>
        );
    }
}

export default ActivityItem;
