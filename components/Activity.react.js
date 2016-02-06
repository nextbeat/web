import React from 'react';
import ActivityItem from './ActivityItem.react'

class Activity extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedItem !== this.props.selectedItem) {
            const [ selected, activity ] = [ $('.selected'), $('#activity-inner') ];

            // adjust position to keep selected element at bottom of view
            if (selected.position().top + selected.outerHeight() > activity.scrollTop() + activity.height()) {
                const pos = selected.position().top + selected.outerHeight() - activity.height();
                activity.animate({ scrollTop: pos}, 100);
            }
        
            // similar logic for selected element at top of view
            if (activity.scrollTop() > selected.position().top) {
                const pos = selected.position().top
                activity.animate({ scrollTop: pos}, 100);
            }
        }
    }

    render() {
        const { mediaItems, liveMediaItems } = this.props;
        return (
        <section id="activity">
            <div id="activity-inner">
                {mediaItems.map(mediaItem => {
                    var selected = (mediaItem.get('id') === this.props.selectedItem.get('id'));
                    return <ActivityItem key={mediaItem.get('id')} mediaItem={mediaItem} selected={selected} handleClick={this.props.handleClick}/>
                })}
                {liveMediaItems.map(mediaItem => {
                    var selected = (mediaItem.get('id') === this.props.selectedItem.get('id'));
                    return <ActivityItem key={mediaItem.get('id')} mediaItem={mediaItem} selected={selected} handleClick={this.props.handleClick}/>
                })}
            </div>
        </section>
        );
    }
}

export default Activity;
