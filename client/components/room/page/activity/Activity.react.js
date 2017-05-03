import React from 'react'
import { connect } from 'react-redux'
import format from 'date-fns/format'
import { timeLeftString } from '../../../../utils'

import { RoomPage } from '../../../../models'
import { selectMediaItem, closeDetailSection } from '../../../../actions'
import ScrollComponent from '../../../utils/ScrollComponent.react'
import ActivityItem from './ActivityItem.react'
import Spinner from '../../../shared/Spinner.react'

class Activity extends React.Component {

    constructor(props) {
        super(props);

        this.handleNewMediaClick = this.handleNewMediaClick.bind(this);

        this.state = {
            displayNewItem: false
        }
    }

    // Button handlers

    handleNewMediaClick() {
        const { roomPage, dispatch } = this.props;

        const newestLiveItem = roomPage.liveMediaItems().last();
        if (newestLiveItem) {
            dispatch(selectMediaItem(newestLiveItem.get('id')));
            dispatch(closeDetailSection())
        }

        this.setState({
            displayNewItem: false
        });
    }


    // Render

    render() {
        const { roomPage, display } = this.props;
        const { displayNewItem } = this.state;
        let selectedItem = roomPage.selectedMediaItem();

        return (
        <section className="activity" style={{ display: (display ? "block" : "none") }}>
            <div className="activity_time">
                { roomPage.get('closed') && format(roomPage.get('created_at'), 'MMMM D, YYYY') }
                { !roomPage.get('closed') && timeLeftString(roomPage.get('expires')) }
            </div>
            <div className="activity_inner" id="activity-inner">
                {roomPage.get('mediaItemsFetching') && <Spinner type="grey" />}
                {roomPage.mediaItems().map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        index={idx} 
                    />
                })}
                {roomPage.liveMediaItems().map((mediaItem, idx) => {
                    var selected = (mediaItem.get('id') === selectedItem.get('id'));
                    var unseen = roomPage.isUnseen(mediaItem.get('id'));
                    return <ActivityItem 
                        key={mediaItem.get('id')} 
                        mediaItem={mediaItem} 
                        live={true} 
                        index={idx+roomPage.mediaItems().size} 
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
        if (nextProps.roomPage.liveMediaItems().size !== this.props.roomPage.liveMediaItems().size) {
            if (!scrollComponent.isScrolledToBottom()) {
                this.setState({
                    displayNewItem: true
                })
            }
        }
    },

    onComponentDidUpdate: function(scrollComponent, prevProps) {
        if (prevProps.roomPage.get('id') !== this.props.roomPage.get('id')) {
            // changed roomPage selection, this does not apply
            return;
        }
        
        if (prevProps.roomPage.selectedMediaItem().get('id') !== this.props.roomPage.selectedMediaItem().get('id')) {
            const [ selected, activity ] = [ $('.item-activity.selected'), $('#activity-inner') ];
            let selectedOffset = selected.position().top + activity.scrollTop()

            // adjust position to keep selected element at bottom of view
            if (selectedOffset + selected.outerHeight() > activity.scrollTop() + activity.height()) {
                const pos = selected.position().top + activity.scrollTop() + selected.outerHeight() - activity.height();
                activity.animate({ scrollTop: pos }, 100);
            }
        
            // similar logic for selected element at top of view
            if (activity.scrollTop() > selectedOffset) {
                activity.animate({ scrollTop: selectedOffset }, 100);
            }

            scrollComponent.setScrollState();
        }

        if (prevProps.roomPage.liveMediaItems().size !== this.props.roomPage.liveMediaItems().size) {
            scrollComponent.scrollToBottomIfPreviouslyAtBottom();
        }
    }
}

function mapStateToProps(state) {
    return {
        roomPage: new RoomPage(state)
    }
}

export default connect(mapStateToProps)(ScrollComponent('activity-inner', scrollOptions)(Activity));
