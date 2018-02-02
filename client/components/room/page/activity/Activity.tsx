import * as React from 'react'
import { connect } from 'react-redux'
import { List, Set } from 'immutable'

import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import App from '@models/state/app'
import { selectMediaItem } from '@actions/room'
import { closeDetailSection } from '@actions/pages/room'
import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import ActivityItem from './ActivityItem'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import MediaItem from '@models/entities/mediaItem'
import { State, DispatchProps } from '@types'

interface OwnProps {
    display: boolean
}

interface ConnectProps {
    roomId: number

    mediaItemsFetching: boolean
    mediaItems: List<MediaItem>
    liveMediaItems: List<MediaItem>
    selectedMediaItem: MediaItem
}

type Props = OwnProps & ConnectProps & DispatchProps & ScrollComponentProps

interface ActivityState {
    displayNewItem: boolean
}

class Activity extends React.Component<Props, ActivityState> {

    constructor(props: Props) {
        super(props);

        this.handleNewMediaClick = this.handleNewMediaClick.bind(this);

        this.state = {
            displayNewItem: false
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            if (!this.props.isScrolledToBottom()) {
                this.setState({
                    displayNewItem: true
                })
            }
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.roomId !== this.props.roomId) {
            // changed roomPage selection, this does not apply
            return;
        }
        
        if (prevProps.selectedMediaItem.get('id') !== this.props.selectedMediaItem.get('id')) {
            const [ selected, activity ] = [ $('.activity-item.selected'), $('#activity-inner') ];
            let activityScrollTop = activity.scrollTop() || 0
            let selectedOffset = selected.position().top + activityScrollTop
            let selectedOuterHeight = selected.outerHeight() || 0
            let activityHeight = activity.height() || 0

            // adjust position to keep selected element at bottom of view
            if (selectedOffset + selectedOuterHeight > activityScrollTop + activityHeight) {
                const pos = selected.position().top + activityScrollTop + selectedOuterHeight - activityHeight;
                activity.animate({ scrollTop: pos }, 100);
            }
        
            // similar logic for selected element at top of view
            if (activityScrollTop > selectedOffset) {
                activity.animate({ scrollTop: selectedOffset }, 100);
            }

            this.props.setScrollState();
        }

        if (prevProps.liveMediaItems.size !== this.props.liveMediaItems.size) {
            this.props.scrollToBottomIfPreviouslyAtBottom();
        }
    }

    // Button handlers

    handleNewMediaClick() {
        const { roomId, liveMediaItems, dispatch } = this.props;

        const newestLiveItem = liveMediaItems.last();
        if (newestLiveItem) {
            dispatch(selectMediaItem(roomId, newestLiveItem.get('id')));
            dispatch(closeDetailSection())
        }

        this.setState({
            displayNewItem: false
        });
    }


    // Render

    render() {
        const { display, mediaItemsFetching,
                selectedMediaItem, mediaItems, 
                liveMediaItems } = this.props;
        const { displayNewItem } = this.state;

        return (
        <section className="activity" style={{ display: (display ? "flex" : "none") }}>
            <div className="activity_inner" id="activity-inner">
                {mediaItemsFetching && <Spinner styles={["grey"]} />}
                {mediaItems.map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedMediaItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        index={idx} 
                    />
                })}
                {liveMediaItems.map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedMediaItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        live={true} 
                        index={idx+mediaItems.size} 
                    />
                })}
            </div>
            { displayNewItem && <div className="activity_new-media" onClick={this.handleNewMediaClick} >New media added!</div> }
        </section>
        );
    }
}

const scrollOptions = {

    onScrollToBottom: function(this: Activity) {
        this.setState({
            displayNewItem: false
        });
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    const roomId = RoomPage.get(state, 'id')
    return {
        roomId,

        mediaItemsFetching: Room.get(state, roomId, 'mediaItemsFetching'),
        mediaItems: RoomPage.mediaItems(state),
        liveMediaItems: RoomPage.liveMediaItems(state),
        selectedMediaItem: RoomPage.selectedMediaItem(state)
    }
}

export default connect(mapStateToProps)(ScrollComponent('activity-inner', scrollOptions)(Activity));
