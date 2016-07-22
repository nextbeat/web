import React from 'react'
import moment from 'moment'

import ScrollComponent from '../../utils/ScrollComponent.react'
import ActivityItem from './ActivityItem.react'
import Spinner from '../../shared/Spinner.react'

function fromNow(date) {
    var hours = moment(date).diff(moment(), 'hours');
    if (hours >= 1) {
        return `${hours} hour${hours > 1 && 's'} left`
    } else {
        var minutes = Math.max(1, moment(date).diff(moment(), 'minutes'));
        return `${minutes} minute${minutes > 1 && 's'} left` 
    }
}

class Activity extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            displayNewItem: false
        }
        this.handleNewMediaClick = this.handleNewMediaClick.bind(this);
    }

    // Button handlers
    handleNewMediaClick() {
        this.props.handleSelectNewestLiveItem();
        this.setState({
            displayNewItem: false
        });

    }

    // Render

    render() {
        const { mediaItems, liveMediaItems, selectedItem, handleSelectMediaItem, stack, display } = this.props;
        const { displayNewItem } = this.state;
        return (
        <section className="activity" style={{ display: (display ? "block" : "none") }}>
            <div className="activity_time">
                { stack.get('closed') && moment(stack.get('created_at')).format('MMMM D, YYYY') }
                { !stack.get('closed') && fromNow(stack.get('expires')) }
            </div>
            <div className="activity_inner" id="activity-inner">
                {stack.get('mediaItemsFetching') && <Spinner type="grey" />}
                {mediaItems.map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        selected={selected} 
                        index={idx} 
                        handleClick={handleSelectMediaItem}
                    />
                })}
                {liveMediaItems.map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedItem.get('id'));
                    var unseen = stack.isUnseen(mediaItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        selected={selected} 
                        live={true} 
                        unseen={unseen}
                        index={idx+mediaItems.size} 
                        handleClick={handleSelectMediaItem}
                    />
                })}
            </div>
            { displayNewItem && <div className="activity_new-media" onClick={this.handleNewMediaClick} >New media added!</div> }
        </section>
        );
    }
}

const scrollOptions = {

    onScrollToBottom: function() {
        this.setState({
            displayNewItem: false
        });
    },

    onComponentWillReceiveProps: function(scrollComponent, nextProps) {
        if (nextProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            if (!scrollComponent.isScrolledToBottom()) {
                this.setState({
                    displayNewItem: true
                })
            }
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        if (prevProps.stack.get('id') !== this.props.stack.get('id')) {
            // changed stack selection, this does not apply
            return;
        }
        
        if (prevProps.selectedItem !== this.props.selectedItem) {
            const [ selected, activity ] = [ $('.item-activity.selected'), $('#activity-inner') ];

            // adjust position to keep selected element at bottom of view
            if (selected.position().top + selected.outerHeight() > activity.scrollTop() + activity.height()) {
                const pos = selected.position().top + selected.outerHeight() - activity.height();
                activity.animate({ scrollTop: pos}, 100);
            }
        
            // similar logic for selected element at top of view
            if (activity.scrollTop() > selected.position().top) {
                const pos = selected.position().top;
                activity.animate({ scrollTop: pos}, 100);
            }

            scrollComponent.setScrollState();
        }

        if (prevProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom();
            scrollComponent.setScrollState();
        }
    }
}

export default ScrollComponent('activity-inner', scrollOptions)(Activity);
