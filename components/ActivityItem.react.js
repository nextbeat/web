import React from 'react';
import moment from 'moment';

class ActivityItem extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'ActivityItem';
    }

    render() {
        let { mediaItem, selected } = this.props;
        const url = mediaItem.get('thumbnail_url') ? mediaItem.get('thumbnail_url') : mediaItem.get('url');
        selected = selected ? "selected" : "";
        return (
            <div className={"activity-item " + selected} onClick={this.props.handleClick.bind(this, this.props.mediaItem)}>
                <div><img src={url}/></div>
                <span>{moment(this.props.mediaItem.get('created_at')).fromNow()}</span>
            </div>
        );
    }
}

export default ActivityItem;
