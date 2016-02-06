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
        let { mediaItem, selected, live } = this.props;
        const url = this.url(mediaItem);
        selected = selected ? "selected" : "";
        live = live ? "live" : "";
        return (
            <div className={`activity-item ${selected} ${live}`} onClick={this.props.handleClick.bind(this, this.props.mediaItem)}>
                <div><img src={url}/></div>
                <span>{moment(this.props.mediaItem.get('created_at')).fromNow()}</span>
            </div>
        );
    }
}

export default ActivityItem;
