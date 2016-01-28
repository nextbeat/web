import React from 'react';
import moment from 'moment';

class ActivityItem extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'ActivityItem';
    }

    render() {
        var url = this.props.mediaItem.thumbnail_url ? this.props.mediaItem.thumbnail_url : this.props.mediaItem.url;
        var selected = this.props.selected ? "selected" : "";
        return (
            <div className={"activity-item " + selected} onClick={this.props.handleClick.bind(this, this.props.mediaItem)}>
                <div><img src={url}/></div>
                <span>{moment(this.props.mediaItem.created_at).fromNow()}</span>
            </div>
        );
    }
}

export default ActivityItem;
