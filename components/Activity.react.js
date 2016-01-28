import React from 'react';
import ActivityItem from './ActivityItem.react'

class Activity extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Activity';
    }

    render() {
        return (
        <section id="activity">
            <div id="activity-inner">
                {this.props.mediaItems.map(mediaItem => {
                    var selected = (mediaItem.id === this.props.selectedItem.id);
                    return <ActivityItem mediaItem={mediaItem} selected={selected} handleClick={this.props.handleClick}/>
                })}
            </div>
        </section>
        );
    }
}

export default Activity;
