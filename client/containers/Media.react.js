import React from 'react'
import { connect } from 'react-redux'

import Activity from '../components/Activity.react'
import MediaPlayer from '../components/MediaPlayer.react'

import { loadMediaItems, selectMediaItem, goBackward, goForward } from '../actions'
import { Stack } from '../models'

class Media extends React.Component {

    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleForward = this.handleForward.bind(this);
        this.handleBackward = this.handleBackward.bind(this);
        this.selectNewestLiveItem = this.selectNewestLiveItem.bind(this);
    }

    // Lifecycle

    componentDidMount() {
        $(document.body).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown);
    }

    componentDidUpdate(prevProps) {
        if (this.props.mediaItems.size > 0 && prevProps.mediaItems.size === 0) {
            // first page of media items has loaded
            const id = this.props.mediaItems.first().get('id');
            this.props.dispatch(selectMediaItem(id));
        }
    }

    // Navigation

    handleClick(mediaItem) {
        this.props.dispatch(selectMediaItem(mediaItem.get('id')));
    }

    handleKeyDown(e) {
        if (e.keyCode === 37) { // left arrow
            this.handleBackward();
        } else if (e.keyCode === 39) {
            this.handleForward(); // right arrow
        }
    }

    handleForward() {
        this.props.dispatch(goForward());
    }

    handleBackward() {
        this.props.dispatch(goBackward());
    }

    selectNewestLiveItem() {
        const newestLiveItem = this.props.liveMediaItems.last();
        if (newestLiveItem) {
            this.props.dispatch(selectMediaItem(newestLiveItem.get('id')));
        }
    }

    // Render

    render() {
        const { stack, mediaItems, liveMediaItems, selectedMediaItem } = this.props;
        return (
            <section>
                <Activity stack={stack} mediaItems={mediaItems} liveMediaItems={liveMediaItems} selectedItem={selectedMediaItem} handleClick={this.handleClick} selectNewestLiveItem={this.selectNewestLiveItem}/>
                <MediaPlayer item={selectedMediaItem} handleForward={this.handleForward} handleBackward={this.handleBackward} />
                <div className="clear" />
            </section>
        );
    }
}

function mapStateToProps(state, props) {    
    const stack = new Stack(state)

    return {
        mediaItems: stack.mediaItems(),
        selectedMediaItem: stack.selectedMediaItem(),
        liveMediaItems: stack.liveMediaItems()
    }
}

export default connect(mapStateToProps)(Media);
