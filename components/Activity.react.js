import React from 'react';
import ActivityItem from './ActivityItem.react'

class Activity extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const mediaItems = this.props.mediaItems || [];
        return (
        <section id="activity">
            <div id="activity-inner">
                {mediaItems.map(mediaItem => {
                    var selected = (mediaItem.get('id') === this.props.selectedItem.get('id'));
                    return <ActivityItem key={mediaItem.get('id')} mediaItem={mediaItem} selected={selected} handleClick={this.props.handleClick}/>
                })}
            </div>
        </section>
        );
    }
}

export default Activity;
