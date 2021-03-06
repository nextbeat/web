import * as PropTypes from 'prop-types'
import * as React from 'react'
import { List, fromJS } from 'immutable'
import { connect } from 'react-redux'

import Video from './Video'
import Image from './Image'
import ItemAnnotation from './ItemAnnotation'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Switch from '@components/shared/Switch'
import Counter from '@components/room/counter/Counter'
import CounterInner from '@components/room/counter/CounterInner'

import { goBackward, goForward, setContinuousPlay } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'
import Room from '@models/state/room'
import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import MediaItem from '@models/entities/mediaItem'
import Ad from '@models/entities/ad'
import { State, DispatchProps } from '@types'
import { isFullScreen, storageAvailable } from '@utils'

interface OwnProps {
    roomId: number

    playerWidth: number
    playerHeight: number

    isRoomCard?: boolean
    shouldAutoplayVideo?: boolean
}

interface ConnectProps {
    hid: string
    mediaItemsSize: number
    selectedMediaItem: MediaItem
    indexOfSelectedMediaItem: number
    isMobile: boolean

    prerollAd: Ad | null
    shouldDisplayPrerollAd: boolean
    isContinuousPlayEnabled: boolean

    isLoggedIn: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps 

interface RoomPlayerState {
    isFullScreen: boolean
    isDisplayingFullScreenTooltip: boolean
    tooltipShowTimeoutId: number
    tooltipHideTimeoutId: number
}

const fullScreenEvents = 'fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange'

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
        this.handleFullScreenBackward = this.handleFullScreenBackward.bind(this)
        this.handleFullScreenForward = this.handleFullScreenForward.bind(this)
        this.handleCounterClick = this.handleCounterClick.bind(this)
        this.toggleContinuousPlay = this.toggleContinuousPlay.bind(this)
        
        this.handleFullScreen = this.handleFullScreen.bind(this)
        this.dismissFullScreenTooltip = this.dismissFullScreenTooltip.bind(this)

        this.renderItem = this.renderItem.bind(this)

        this.state = {
            isFullScreen: false,
            isDisplayingFullScreenTooltip: false,
            tooltipShowTimeoutId: -1,
            tooltipHideTimeoutId: -1
        }
    }

    // Lifecycle

    componentDidMount() {
        $(window).on(fullScreenEvents, this.handleFullScreen)
    }

    componentWillUnmount() {
        $(window).off(fullScreenEvents, this.handleFullScreen)

        this.dismissFullScreenTooltip()
    }


    // Queries

    isFullScreenInteractive() {
        return this.state.isFullScreen && this.props.isMobile
    }


    // Full screen

    handleFullScreen() {
        this.setState({ isFullScreen: isFullScreen() })

        if (isFullScreen() && storageAvailable('localStorage')) {
            const isDisplayingFullScreenTooltip = !JSON.parse(localStorage.getItem('hideFullScreenTooltip') || 'false')
            if (isDisplayingFullScreenTooltip) {

                const tooltipHideTimeoutId = window.setTimeout(() => {
                    this.setState({ isDisplayingFullScreenTooltip: false })
                }, 5500)

                localStorage.setItem('hideFullScreenTooltip', 'true')

                const tooltipShowTimeoutId = window.setTimeout(() => {
                    this.setState({ isDisplayingFullScreenTooltip: true })
                }, 500)
                
                this.setState({
                    tooltipHideTimeoutId,
                    tooltipShowTimeoutId
                })
            }
        } else {
            this.dismissFullScreenTooltip()
        }
    }

    dismissFullScreenTooltip() {
        this.setState({ isDisplayingFullScreenTooltip: false })
        const { tooltipHideTimeoutId, tooltipShowTimeoutId } = this.state
        window.clearTimeout(tooltipHideTimeoutId)
        window.clearTimeout(tooltipShowTimeoutId)
    }


    // Navigation

    handleBackward() {
        if (this.props.shouldDisplayPrerollAd) {
            return
        }
        
        const { dispatch, roomId } = this.props
        dispatch(goBackward(roomId))
    }

    handleForward() {
        if (this.props.shouldDisplayPrerollAd) {
            return
        }

        const { dispatch, roomId } = this.props
        dispatch(goForward(roomId))
    }

    handleFullScreenBackward() {
        if (!this.isFullScreenInteractive()) {
            return
        }
        this.handleBackward()
    }
    
    handleFullScreenForward() {
        if (!this.isFullScreenInteractive()) {
            return
        }
        this.handleForward()
    }

    handleCounterClick() {
        const { indexOfSelectedMediaItem, hid, isRoomCard, dispatch } = this.props 
        const { router } = this.context

        if (isRoomCard) {
            router.push({ pathname: `/r/${hid}/${indexOfSelectedMediaItem}`, query: { detail: 'activity' }})
        }
    }

    toggleContinuousPlay() {
        const { dispatch, isContinuousPlayEnabled, roomId } = this.props
        dispatch(setContinuousPlay(roomId, !isContinuousPlayEnabled));
    }

    // Render

    renderItem() {
        const { selectedMediaItem: item, roomId, shouldAutoplayVideo, 
                playerWidth, playerHeight,
                prerollAd, shouldDisplayPrerollAd: isAd } = this.props

        let containerProps = {
            containerWidth: playerWidth,
            containerHeight: playerHeight
        }

        let videoProps = {
            video: isAd ? (prerollAd as Ad).video('mp4') : item.video('mp4'),
            roomId: roomId,
            posterUrl: item.video('mp4').get('poster_url'),
            itemType: isAd ? 'ad' : 'mediaItem' as 'ad' | 'mediaItem',
            itemId: isAd ? (prerollAd as Ad).get('id') : item.get('id'),
            itemUrl: isAd ? (prerollAd as Ad).get('link_url') : undefined,
            shouldAutoplay: shouldAutoplayVideo,
            ...containerProps
        }

        return (
            <div style={{ width: '100%', height: '100%' }}>
                { !isAd && item.hasAnnotation() && <ItemAnnotation roomId={roomId} {...containerProps} /> } 
                <Image 
                    image={item.image()} 
                    roomId={roomId}
                    {...containerProps} />
                <Video {...videoProps} />
            </div>
        )
    }

    render() {
        const { children, roomId, mediaItemsSize, 
                indexOfSelectedMediaItem: index,
                selectedMediaItem: item, isMobile,
                prerollAd, shouldDisplayPrerollAd,
                isContinuousPlayEnabled, isRoomCard } = this.props;

        const { isFullScreen, isDisplayingFullScreenTooltip } = this.state;

        const leftDisabledClass = index === 0 || index === -1 || shouldDisplayPrerollAd
            ? 'disabled' : '';
        const rightDisabledClass = index === mediaItemsSize - 1 || index === -1 || shouldDisplayPrerollAd
            ? 'disabled' : ''; 

        let preloadedImageUrl = null
        if (item) {
            preloadedImageUrl = item.isVideo() ? item.video().get('poster_url') : item.image().get('url')
        }

        const fullScreenClass = isFullScreen ? 'player_media-fullscreen' : '';
        const tooltipClass = isDisplayingFullScreenTooltip ? 'show' : 'hide';
        const interactiveFullScreenClass = this.isFullScreenInteractive() ? 'interactive' : '';

        return (
            <div className="player_main">
                <div className={`player_media ${fullScreenClass}`}>
                    { /* Preload the first post's image to prevent load hiccup after ad closes. */ }
                { !!preloadedImageUrl && <link rel="preload" as="image" href={preloadedImageUrl} /> }
                    <div className="player_media-inner" id="player_media-inner">
                        { this.renderItem() }
                        <div className={`player_media-fullscreen_controls ${interactiveFullScreenClass}`}>
                            <div className="player_media-fullscreen_back" onClick={this.handleFullScreenBackward} />
                            <div className="player_media-fullscreen_forward" onClick={this.handleFullScreenForward} />
                            <div className={`player_media-fullscreen_tooltip ${tooltipClass}`}>
                                { this.isFullScreenInteractive() ?
                                    "Tap the screen to navigate between posts while in full screen."
                                    : "Use the arrow keys to navigate between posts while in full screen."
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`player_navigation`} id="player_navigation">
                    <div className="player_navigation_inner">
                        <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={this.handleBackward}><Icon type="arrow-back" /></div>
                        <div className="player_nav-counter" onClick={this.handleCounterClick}><CounterInner roomId={roomId} /></div>
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
        mediaItemsSize: Room.mediaItemsSize(state, ownProps.roomId),
        selectedMediaItem: Room.selectedMediaItem(state, ownProps.roomId),
        indexOfSelectedMediaItem: Room.indexOfSelectedMediaItem(state, ownProps.roomId),
        prerollAd: Room.ad(state, ownProps.roomId, 'preroll'),
        shouldDisplayPrerollAd: Room.shouldDisplayPrerollAd(state, ownProps.roomId),
        isContinuousPlayEnabled: Room.get(state, ownProps.roomId, 'isContinuousPlayEnabled', false),
        isMobile: App.isMobile(state),
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(RoomPlayer);
