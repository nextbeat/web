import React from 'react';
import ActivityItem from './ActivityItem.react'

class Activity extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollHeight: 0,
            displayNewItem: false
        }
        this.handleScroll = this.handleScroll.bind(this);
        this.setScrollState = this.setScrollState.bind(this);
        this.isScrolledToBottom = this.isScrolledToBottom.bind(this);
        this.scrollToBottomIfNeeded = this.scrollToBottomIfNeeded.bind(this);
        this.handleNewMediaClick = this.handleNewMediaClick.bind(this);
    }

    // Lifecycle methods

    componentDidMount() {
        $('#activity-inner').on('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        $('#activity-inner').off('scroll', this.handleScroll);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            if (!this.isScrolledToBottom()) {
                this.setState({
                    displayNewItem: true
                })
            }
        }
        this.setScrollState();
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
                const pos = selected.position().top;
                activity.animate({ scrollTop: pos}, 100);
            }

            this.setScrollState();
        }

        if (prevProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            this.scrollToBottomIfNeeded();
            this.setScrollState();
        }
    }

    // Scroll logic

    handleScroll() {
        const activity = document.getElementById('activity-inner');
        // we don't use isScrolledToBottom() here because that uses old scroll positions stored in state
        let isAtBottom = activity.scrollHeight - activity.clientHeight <= activity.scrollTop + 1;
        if (isAtBottom) {
            this.setState({
                displayNewItem: false
            });
        }
    }

    setScrollState() {
        const activity = document.getElementById('activity-inner');
        this.setState({
            scrollTop: activity.scrollTop,
            scrollHeight: activity.scrollHeight
        });
    }

    isScrolledToBottom() {
        const activity = document.getElementById('activity-inner');
        return this.state.scrollHeight - activity.clientHeight <= this.state.scrollTop + 1;
    }

    scrollToBottomIfNeeded() {
        const activity = document.getElementById('activity-inner');
        if (this.isScrolledToBottom()) {
            activity.scrollTop = activity.scrollHeight - activity.clientHeight;
        }
    }

    // Button handlers
    handleNewMediaClick() {
        this.props.selectNewestLiveItem();
        this.setState({
            displayNewItem: false
        });

    }

    // Render

    render() {
        const { mediaItems, liveMediaItems } = this.props;
        const { displayNewItem } = this.state;
        return (
        <section id="activity">
            <div id="activity-inner">
                {mediaItems.map(mediaItem => {
                    var selected = (mediaItem.get('id') === this.props.selectedItem.get('id'));
                    return <ActivityItem key={mediaItem.get('id')} mediaItem={mediaItem} selected={selected} handleClick={this.props.handleClick}/>
                })}
                {liveMediaItems.map(mediaItem => {
                    var selected = (mediaItem.get('id') === this.props.selectedItem.get('id'));
                    return <ActivityItem key={mediaItem.get('id')} mediaItem={mediaItem} selected={selected} live={true} handleClick={this.props.handleClick}/>
                })}
            </div>
            { displayNewItem && <button onClick={this.handleNewMediaClick}>New media added!</button> }
        </section>
        );
    }
}

export default Activity;
