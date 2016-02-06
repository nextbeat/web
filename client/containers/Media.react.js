import React from 'react'
import { connect } from 'react-redux'
import { List, Map } from 'immutable'

import Activity from '../components/Activity.react'
import MediaPlayer from '../components/MediaPlayer.react'

import { loadMediaItems, selectMediaItem, goBackward, goForward } from '../actions'
import { getPaginatedEntities, getLiveEntities, getEntity } from '../utils'

class Media extends React.Component {

    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.selectNewestLiveItem = this.selectNewestLiveItem.bind(this);
    }

    // Lifecycle

    componentDidMount() {
        $(document.body).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.stack.get('id') !== this.props.stack.get('id')) {
            // stack has loaded
            this.props.dispatch(loadMediaItems());
        }
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
            this.props.dispatch(goBackward());
        } else if (e.keyCode === 39) {
            this.props.dispatch(goForward()); // right arrow
        }
    }

    selectNewestLiveItem() {
        const newestLiveItem = this.props.liveMediaItems.last();
        if (newestLiveItem) {
            this.props.dispatch(selectMediaItem(newestLiveItem.get('id')));
        }
    }

    // Render

    render() {
        const { mediaItems, liveMediaItems, selectedMediaItem } = this.props;
        return (
            <section>
                <Activity mediaItems={mediaItems} liveMediaItems={liveMediaItems} selectedItem={selectedMediaItem} handleClick={this.handleClick} selectNewestLiveItem={this.selectNewestLiveItem}/>
                <MediaPlayer item={selectedMediaItem} />
                <div className="clear" />
            </section>
        );
    }
}

function mapStateToProps(state, props) {    
    const mediaItems = getPaginatedEntities(state, 'mediaItems');

    const selectedId = state.getIn(['mediaItems', 'selected'], -1);
    const selectedMediaItem = getEntity(state, 'mediaItems', selectedId);

    const liveMediaItems = getLiveEntities(state, 'mediaItems');

    return {
        mediaItems,
        selectedMediaItem,
        liveMediaItems
    }
}

export default connect(mapStateToProps)(Media);
