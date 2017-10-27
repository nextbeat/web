import * as PropTypes from 'prop-types'
import * as React from 'react'
import { List, fromJS } from 'immutable'
import { connect } from 'react-redux'

import Video from './Video'
import Image from './Image'
import ItemReference from './ItemReference'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import CounterInner from '@components/room/counter/CounterInne'

import { goBackward, goForward } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
    isRoomCard?: boolean
    shouldAutoplayVideo?: boolean
}

interface ConnectProps {
    hid: string
    mediaItems: List<MediaItem>
    mediaItemsError?: string
    mediaItemsSize: number
    selectedMediaItem: MediaItem
    indexOfSelectedMediaItem: number
}

type Props = OwnProps & ConnectProps & DispatchProps 

interface RoomPlayerState {
    playerWidth: number
    playerHeight: number
}

class RoomPlayer extends React.Component<Props, RoomPlayerState> {

    static defaultProps = {
        isRoomCard: false,
        shouldAutoplayVideo: true
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.handleBackward = this.handleBackward.bind(this)
        this.handleForward = this.handleForward.bind(this)
        this.handleCounterClick = this.handleCounterClick.bind(this)
        
        this.resize = this.resize.bind(this)

        this.state = {
            playerWidth: 0,
            playerHeight: 0
        }
    }

    // Lifecycle

    componentDidMount() {
        $(window).on('resize', this.resize);

        this.setState({
            playerWidth: parseInt($('.player_main').css('width')),
            playerHeight: parseInt($('.player_main').css('height'))
        }); 
       
        this.resize();
    }

    componentWillUnmount() {
        $(window).off("resize", this.resize);
    }


    // Resize

    resize() {
        const playerWidth = parseInt($('.player_main').css('width'));
        const playerHeight = Math.min(500, Math.floor(playerWidth * 9 / 16));
        this.setState({
            playerWidth,
            playerHeight
        })
    }


    // Navigation

    handleBackward() {
        const { dispatch, roomId } = this.props
        dispatch(goBackward(roomId))
    }

    handleForward() {
        const { dispatch, roomId } = this.props
        dispatch(goForward(roomId))
    }

    handleCounterClick() {
        const { indexOfSelectedMediaItem, hid, isRoomCard, dispatch } = this.props 
        const { router } = this.context

        if (isRoomCard) {
            router.push({ pathname: `/r/${hid}/${indexOfSelectedMediaItem}`, query: { detail: 'activity' }})
        } else {
            dispatch(selectDetailSection('activity'))
        }
    }

    // Render

    render() {
        const { roomId, mediaItems, mediaItemsError, mediaItemsSize,
                selectedMediaItem: item, indexOfSelectedMediaItem,
                shouldAutoplayVideo, children } = this.props;
        const { playerWidth, playerHeight } = this.state

        const leftDisabledClass = indexOfSelectedMediaItem === 0 ? 'disabled' : '';
        const rightDisabledClass = indexOfSelectedMediaItem === mediaItemsSize - 1 ? 'disabled' : ''; 

        let containerProps = {
            containerWidth: playerWidth,
            containerHeight: playerHeight
        }

        return (
            <div className="player_main">
                { children }
                <div className="player_media" style={{ height: `${playerHeight}px` }}>
                    <div className="player_media-inner" id="player_media-inner">
                    { mediaItemsSize && !mediaItemsError && <Spinner styles={["large", "grey"]}/> }
                    { item.hasReference() && <ItemReference roomId={roomId} {...containerProps} /> }
                    { !item.isEmpty() && (item.isVideo() ? 
                        <Video 
                            video={item.video('mp4')}
                            alternateVideo={item.video('mp4')}
                            decoration={item.get('decoration')} 
                            roomId={roomId} 
                            autoplay={shouldAutoplayVideo} 
                            {...containerProps} /> : 
                        <Image 
                            image={item.image()} 
                            decoration={item.get('decoration')} 
                            {...containerProps} /> ) 
                    }
                    </div>
                </div>
                <div className="player_navigation">
                    <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                        <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={this.handleBackward}><Icon type="arrow-back" /></div>
                        <div className="player_nav-counter" onClick={this.handleCounterClick}><CounterInner room={room} /></div>
                        <div className={`player_nav-button player_nav-forward ${rightDisabledClass}`} onClick={this.handleForward}><Icon type="arrow-forward" /></div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        hid: Room.entity(state, ownProps.roomId).get('hid'),
        mediaItems: Room.mediaItems(state, ownProps.roomId),
        mediaItemsError: Room.get(state, ownProps.roomId, 'mediaItemsError'),
        mediaItemsSize: Room.mediaItemsSize(state, ownProps.roomId),
        selectedMediaItem: Room.selectedMediaItem(state, ownProps.roomId),
        indexOfSelectedMediaItem: Room.indexOfSelectedMediaItem(state, ownProps.roomId)
    }
}

export default connect(mapStateToProps)(RoomPlayer);
