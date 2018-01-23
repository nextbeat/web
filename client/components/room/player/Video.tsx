import * as React from 'react'
import { connect } from 'react-redux'
import debounce from 'lodash-es/debounce'
import { toggleFullScreen, isFullScreen } from '../../../utils'

import Decoration from './Decoration'
import VideoControls from './VideoControls'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import { setVideoVolume } from '@actions/app'
import { logVideoImpression, gaEvent } from '@actions/ga'
import { didPlayVideo, playbackDidStart, playbackDidEnd, setContinuousPlay } from '@actions/room'
import App from '@models/state/app'
import Room from '@models/state/room'
import Ad from '@models/entities/ad'
import { State, DispatchProps } from '@types'

const START_IMPRESSION_WAIT_TIME = 500;

interface OwnProps {
    video: State
    decoration?: State

    roomId?: number
    itemId?: number
    itemType?: 'ad' | 'mediaItem'
    itemUrl?: string
    posterUrl?: string 

    shouldAutoplay?: boolean

    containerWidth: number
    containerHeight: number
}

interface ConnectProps {
    isIOS: boolean
    isMobile: boolean
    browser: string
    version: string

    volume: number
    isContinuousPlayEnabled: boolean

    authorUsername: string
}

type Props = OwnProps & ConnectProps & DispatchProps

enum LoadState {
    Unavailable = 'UNAVAILABLE',
    Loading = 'LOADING',
    Playing = 'PLAYING',
    Paused = 'PAUSED',
    WaitingToPlay = 'WAITING_TO_PLAY'
}

interface VideoState {
    currentTime: number
    loadedDuration: number
    duration: number
    storedVolume: number
    loadState: LoadState
    shouldDisplayControls: boolean
    isFullScreen: boolean
    timeIntervalId: number
    hoverTimeoutId: number
    impressionStartTime: number
    width: number
    height: number
    scale: number
}

class Video extends React.Component<Props, VideoState> {

    static defaultProps = {
        shouldAutoplay: true
    }

    private _controls: VideoControls
    private _videoElem: HTMLVideoElement
    private _videoContainerElem: HTMLDivElement

    constructor(props: Props) {
        super(props);

        this.shouldForceVideoRotation = this.shouldForceVideoRotation.bind(this);
        this.shouldForceVideoResizing = this.shouldForceVideoResizing.bind(this);
        this.calculateDimensions = this.calculateDimensions.bind(this);

        this.didLoadMetadata = this.didLoadMetadata.bind(this);
        this.didUpdateTime = this.didUpdateTime.bind(this);
        this.isPlaying = this.isPlaying.bind(this);
        this.didPause = this.didPause.bind(this);
        this.didEnd = this.didEnd.bind(this);
        this.isWaiting = this.isWaiting.bind(this);
        this.didProgressDownload = this.didProgressDownload.bind(this);

        this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
        this.handleOnMouseMove = this.handleOnMouseMove.bind(this);
        this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleOnPointerUp = this.handleOnPointerUp.bind(this);
        this.handleFullScreenChange = this.handleFullScreenChange.bind(this);

        this.handleAdContainerClick = this.handleAdContainerClick.bind(this);
        this.handleAdClick = this.handleAdClick.bind(this);

        this.loadVideo = this.loadVideo.bind(this);
        this.startPlayback = this.startPlayback.bind(this);
        this.setLoadState = this.setLoadState.bind(this);
        this.unloadVideo = this.unloadVideo.bind(this);
        this.playPause = this.playPause.bind(this);
        this.seek = this.seek.bind(this);
        this.adjustVolume = this.adjustVolume.bind(this);
        this.mute = this.mute.bind(this);
        this.fullScreen = this.fullScreen.bind(this);
        this.toggleContinuousPlay = this.toggleContinuousPlay.bind(this);
        this.hideControlsAfterDelay = this.hideControlsAfterDelay.bind(this);

        this.startNewImpression = debounce(this.startNewImpression.bind(this), START_IMPRESSION_WAIT_TIME);
        this.logImpression = this.logImpression.bind(this);

        this.videoStyle = this.videoStyle.bind(this);

        this.state = {
            currentTime: 0,
            loadedDuration: 0,
            duration: 0.5, // not zero to avoid divide by zero bugs
            storedVolume: 1, // stores last set volume when volume = 0 due to muting
            loadState: LoadState.Unavailable,
            shouldDisplayControls: true,
            isFullScreen: false,
            timeIntervalId: -1,
            hoverTimeoutId: -1,
            impressionStartTime: -1,
            width: 0,
            height: 0,
            scale: 1
        };
    }

    // Component lifecycle

    componentDidMount() {
        this._videoElem.addEventListener('loadedmetadata', this.didLoadMetadata);
        this._videoElem.addEventListener('play', this.isPlaying);
        this._videoElem.addEventListener('pause', this.didPause);
        this._videoElem.addEventListener('waiting', this.isWaiting);
        this._videoElem.addEventListener('progress', this.didProgressDownload);
        this._videoElem.addEventListener('ended', this.didEnd);
        this._videoContainerElem.addEventListener('pointerup', this.handleOnPointerUp);

        this.loadVideo();

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }

    componentWillUnmount() {        
        this._videoElem.removeEventListener('loadedmetadata', this.didLoadMetadata);
        this._videoElem.removeEventListener('playing', this.isPlaying);
        this._videoElem.removeEventListener('pause', this.didPause);
        this._videoElem.removeEventListener('waiting', this.isWaiting);
        this._videoElem.removeEventListener('progress', this.didProgressDownload);
        this._videoElem.removeEventListener('ended', this.didEnd);
        this._videoContainerElem.removeEventListener('pointerup', this.handleOnPointerUp);

        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);

        this.unloadVideo();
        this.logImpression(false); 

        $(window).off('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.video !== this.props.video) 
        {
            this.logImpression();
            this.loadVideo();

            if (this.props.video.isEmpty()) {
                // Video element is empty, meaning the next media item is 
                // an image. On iOS devices, we need to manually exit
                // out of fullscreen in this case.
                const videoPlayer = document.getElementById('video_player') as HTMLVideoElement;
                if (videoPlayer.webkitDisplayingFullscreen) {
                    videoPlayer.webkitExitFullscreen();
                }
            }
        }

        if (prevProps.containerWidth !== this.props.containerWidth
            || prevProps.containerHeight !== this.props.containerHeight) 
        {
            this.calculateDimensions();
        }   
    }

    // Queries

    shouldForceVideoRotation() {
        const { browser, version } = this.props;
        return browser === 'Firefox' || (browser === 'IE' && parseInt(version) === 10)
    }

    shouldForceVideoResizing() {
        const { browser, version } = this.props;
        return browser === 'Chrome' && parseInt(version) === 52;
    }

    posterUrl() : string | undefined {
        return this.props.posterUrl || this.props.video.get('poster_url')
    }

    // Events 

    handleFullScreenChange() {
        this.setState({
            isFullScreen: isFullScreen()
        })
    }

    calculateDimensions() {
        const { containerWidth, containerHeight, video } = this.props

        const videoRatio = video.get('width')/video.get('height')
        const containerRatio = containerWidth/containerHeight

        if (videoRatio > containerRatio) {
            this.setState({
                width: containerWidth,
                height: Math.floor(containerWidth/videoRatio)
            })
        } else {
            this.setState({
                width: Math.floor(containerHeight*videoRatio),
                height: containerHeight
            })
        }

        this.setState({
            scale: containerRatio
        })
    }

    didLoadMetadata() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        this.setState({
            duration: video.duration
        });

        this.startPlayback();
    }

    didUpdateTime() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        this.setState({
            currentTime: video.currentTime
        });
    }

    isPlaying() {
        process.nextTick(() => {
            clearInterval(this.state.timeIntervalId);
            const timeIntervalId = window.setInterval(this.didUpdateTime, 500);
    
            this.startNewImpression()

            this.setState({
                currentTime: this._videoElem.currentTime,
                timeIntervalId,
                loadState: LoadState.Playing
            });

            const { dispatch, roomId, itemId, itemType } = this.props
    
            if (this._videoElem.currentTime === 0) {
                this.hideControlsAfterDelay();
                this.setState({
                    shouldDisplayControls: true
                })
                if (roomId && itemId && itemType) {
                    dispatch(playbackDidStart(roomId, itemId, itemType))
                }
            } 
    
            // record that video has been played if in room
            if (roomId) {
                dispatch(didPlayVideo(roomId))
            }
        })

    }

    didPause() {
        clearInterval(this.state.timeIntervalId);

        if (this.state.loadState === LoadState.WaitingToPlay) {
            return;
        }

        // record video impression if one is active
        this.logImpression();

        this.setState({
            currentTime: this._videoElem.currentTime,
            loadState: LoadState.Paused,
            shouldDisplayControls: true
        });
    }

    didEnd() {
        const { roomId, itemType, itemId, dispatch } = this.props
        if (roomId && itemId && itemType) {
            dispatch(playbackDidEnd(roomId, itemId, itemType))
        }
    }

    isWaiting() {
        this.setState({
            loadState: LoadState.Paused
        })
    }

    didProgressDownload() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        if (video.buffered.length >= 1) {
            this.setState({
                loadedDuration: video.buffered.end(0),
                // sometimes, duration will change between loadedmetadata and this event call
                duration: video.duration
            })
        }
    }

    // Actions

    loadVideo() {
        const { video } = this.props

        this.unloadVideo();

        this._videoElem.src = video.get('url')
        if (video.get('type') === 'objectURL') {
            this._videoElem.addEventListener('loadeddata', () => {
                URL.revokeObjectURL(video.get('url'))
            })
        }

        this._videoElem.volume = this.props.volume
        this.calculateDimensions();

        this.setState({
            loadState: LoadState.Loading
        })

        this._videoElem.load();
    }

    startPlayback() {
        let videoPlayer = document.getElementById('video_player') as HTMLVideoElement;

        if (this.props.shouldAutoplay) {
            const playPromise = videoPlayer.play()
            // This method returns a promise in Chrome and Safari.
            // This can be used to determine whether or not autoplay
            // is supported (it is not on most mobile devices).
            if (typeof playPromise !== 'undefined') {
                playPromise
                .then(() => {
                    this.setLoadState(true)
                })
                .catch((e) => {
                    // Cannot autoplay
                    this.setLoadState(false)
                })
            } else {
                this.setLoadState(true)
            }
        } else {
            // Require user to manually start playback
            this.setLoadState(false)
        }
    }    

    setLoadState(canAutoplay: boolean) {
        const currentLoadState = this.state.loadState
        const loadState = canAutoplay ? (currentLoadState === LoadState.Playing ? LoadState.Playing : LoadState.Loading) : LoadState.WaitingToPlay
        
        this.setState({ loadState })
    }

    unloadVideo() {
        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);
        this.setState({ 
            currentTime: 0,
            duration: 0.5,
            loadedDuration: 0,
            loadState: LoadState.Unavailable
        })
    }

    playPause() {
        const { loadState } = this.state
        if (loadState === LoadState.Playing) {
            this._videoElem.pause();
        } else {
            this._videoElem.play();
        }
    }

    seek(time: number) {
        this._videoElem.currentTime = time;
        this.setState({
            currentTime: this._videoElem.currentTime
        });
    }

    adjustVolume(volume: number) {
        if (volume < 0.05) {
            volume = 0;
        }
        if (volume > 0.95) {
            volume = 1;
        }
        this._videoElem.volume = volume;
        this.props.dispatch(setVideoVolume(volume))
    }

    mute() {
        const { storedVolume } = this.state
        const volume = this.props.volume

        if (volume > 0) {
            // mute and store previous volume
            this.adjustVolume(0)
            this.setState({
                storedVolume: volume
            })
        } else {
            // unmute and reset stored volume
            this.adjustVolume(storedVolume)
            this.setState({
                storedVolume: 1
            })
        }
    }

    fullScreen() {
        const { isIOS } = this.props
        if (isIOS) {
            if (this._videoElem.webkitDisplayingFullscreen) {
                this._videoElem.webkitExitFullscreen();
            } else {
                this._videoElem.webkitEnterFullscreen();
            }
        } else {
            toggleFullScreen(document.getElementById('player_media-inner'));
        }
    }

    toggleContinuousPlay() {
        const { dispatch, roomId, isContinuousPlayEnabled } = this.props
        if (!roomId) {
            return
        }

        dispatch(setContinuousPlay(roomId, !isContinuousPlayEnabled))
    }

    hideControlsAfterDelay(delay=2500) {
        clearTimeout(this.state.hoverTimeoutId);
        const hoverTimeoutId = window.setTimeout(() => {
            if (this.state.loadState === LoadState.Playing) {
                this.setState({
                    shouldDisplayControls: false
                })
            }
        }, delay);

        this.setState({
            hoverTimeoutId
        });
    }


    // Analytics

    logImpression(reset=true) {
        const { impressionStartTime } = this.state
        const { itemId, itemType, dispatch } = this.props
        // only log impression if one has began and video is associated with a media item
        if (impressionStartTime < 0 || itemType !== 'mediaItem' || !itemId) {
            return;
        }

        dispatch(logVideoImpression(itemId, impressionStartTime, this._videoElem.currentTime))

        this.setState({
            impressionStartTime: -1
        })
    }

    startNewImpression() {
        // debounced function, so called START_IMPRESSION_WAIT_TIME msecs after play begins
        if (this._videoElem) {
            this.setState({
                impressionStartTime: Math.max(0, this._videoElem.currentTime - START_IMPRESSION_WAIT_TIME/1000)
            })
        }

    }

    // Video container events

    handleOnMouseOver() {
        this.setState({
            shouldDisplayControls: true
        })
        this.hideControlsAfterDelay()

    }

    handleOnMouseOut() {
        console.log('on mouse out')
        if (this.state.loadState === LoadState.Playing) {
            this.setState({
                shouldDisplayControls: false
            })
        }
    }

    handleOnMouseMove(e: React.MouseEvent<HTMLElement>) {
        this.setState({
            shouldDisplayControls: true,
        });
        this.hideControlsAfterDelay()

        // call event handler on child component
        this._controls.handleOnMouseMove(e)
    }

    handleOnMouseUp(e: React.MouseEvent<HTMLElement>) {
        const { isMobile } = this.props 
        const { shouldDisplayControls, loadState } = this.state
        if (isMobile && shouldDisplayControls && loadState === LoadState.Playing) {
            this.setState({ shouldDisplayControls: false })
        }

        // call event handler on child component
        this._controls.handleOnMouseUp(e)
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLElement>) {
        if (e.charCode === 32) { // spacebar
            e.preventDefault();
            this.playPause();
        }
    }

    handleOnPointerUp(e: PointerEvent) {
        // Chrome for Android uses pointer events, not mouse events
        // See https://developers.google.com/web/updates/2016/10/pointer-events
        const { isMobile } = this.props 
        const { shouldDisplayControls, loadState } = this.state
        if (!isMobile) {
            return;
        }

        if (shouldDisplayControls && loadState === LoadState.Playing) {
            console.log('hiding')
            this.setState({ shouldDisplayControls: false })
        } else {
            console.log('showing')
            this.setState({
                shouldDisplayControls: true
            })
            this.hideControlsAfterDelay()
        }
    }

    handleAdContainerClick(e: React.MouseEvent<HTMLElement>) {
        if (this.props.isMobile) {
            return;
        }
        this.handleAdClick(e);
    }

    handleAdClick(e: React.MouseEvent<HTMLElement>) {
        const { itemUrl, itemId, dispatch } = this.props
        if (!itemUrl) {
            return;
        }

        e.preventDefault();

        dispatch(gaEvent({
            category: 'ad',
            action: 'click',
            label: itemId
        }, () => {
            window.open(itemUrl, '_blank')
        }))

        this._videoElem.pause();
    }

    // Render

    videoStyle(video: State) {
        const { scale, width, height, loadState } = this.state
        const { isIOS } = this.props
        
        // let style: any = { display: isLoading && !isIOS ? 'none' : 'block' }
        let style: any = {}
        if (this.shouldForceVideoRotation()) {
            // need to manually rotate video if in Firefox or IE 10 
            if (video.get('orientation') === 90) {
                style.transform = `translate(-50%, -50%) rotate(90deg) scale(${1/scale}) `
            } else if (video.get('orientation') === 270) {
                style.transform = `translate(-50%, -50%) rotate(-90deg) scale(${1/scale})`
            }
        } else if (this.shouldForceVideoResizing()) {
            // need to manually rescale video if in Chrome 52
            if (video.get('orientation') === 90 || video.get('orientation') === 270) {
                const videoRatio = video.get('width')/video.get('height')
                if (videoRatio > 1) {
                    style.transform = `translate(-50%, -50%) scaleX(${videoRatio*scale}) scaleY(${1/videoRatio*scale})`
                } else {
                    style.transform = `translate(-50%, -50%) scaleX(${videoRatio*1/scale}) scaleY(${1/videoRatio*1/scale})`
                }
            }
        }
        return style
    }

    render() {
        const { video, decoration, volume, isIOS, isMobile,
                authorUsername, itemType } = this.props;
        const { shouldDisplayControls, loadState, width, height } = this.state;

        const videoContainerStyle = {
            display: video.isEmpty() ? 'none' : 'block',
            cursor: shouldDisplayControls ? 'auto' : 'none'
        }

        const videoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut,
            onMouseMove: this.handleOnMouseMove,
            onMouseUp: this.handleOnMouseUp,
            onKeyPress: this.handleKeyPress
        }

        const videoControlsProps = {
            currentTime: this.state.currentTime,
            duration: this.state.duration,
            loadedDuration: this.state.loadedDuration,
            volume: volume,
            shouldDisplayControls: this.state.shouldDisplayControls,
            isPlaying: this.state.loadState === LoadState.Playing,
            isFullScreen: this.state.isFullScreen,
            isContinuousPlayEnabled: this.props.isContinuousPlayEnabled,
            adjustVolume: this.adjustVolume,
            mute: this.mute,
            playPause: this.playPause,
            seek: this.seek,
            fullScreen: this.fullScreen,
            toggleContinuousPlay: this.toggleContinuousPlay,
            isScrubbable: itemType === 'mediaItem',
            shouldDisplayContinuousPlay: itemType === 'mediaItem'
        }

        let videoAttributes: any = {
            preload: "none",
            playsInline: true,
            controls: false
        }

        const adClass = itemType === 'ad' ? 'video_container-ad' : ''
        const mobileClass = isMobile ? 'video_container-mobile' : ''
        const hasPlayed = [LoadState.Playing, LoadState.Paused].indexOf(loadState) > -1

        const thumbnailStyle = {
            backgroundImage: `url(${this.posterUrl()})`,
            display: loadState === LoadState.WaitingToPlay ? 'block' : 'none'
        }

        return (
            <div className={`video_container ${adClass} ${mobileClass}`} id="video_container" tabIndex={-1} style={videoContainerStyle} {...videoContainerEvents} ref={(c) => { if (c) { this._videoContainerElem = c } }}>
                <div className="video_player-container">
                    <video id="video_player" className="video_player" {...videoAttributes} style={this.videoStyle(video)} ref={(c) => { if (c) { this._videoElem = c } }} />
                    { decoration && <Decoration decoration={decoration} width={width} height={height} barHeight={70} /> }
                    { loadState === LoadState.Loading && <Spinner styles={['white', 'large', 'faded']} /> }
                </div>
                <VideoControls ref={(c) => { if (c) { this._controls = c } }} {...videoControlsProps} />
                { itemType === 'ad' && hasPlayed && <div className="ad-video_click-box" onClick={this.handleAdContainerClick} />}
                { itemType === 'ad' && hasPlayed && <div className="ad-video_sponsor">This ad sponsors { authorUsername }</div> }
                { itemType === 'ad' && hasPlayed && isMobile && <div className="ad-video_visit" onClick={this.handleAdClick}>Visit Advertiser</div> }
                <div className="video_player_thumbnail" style={thumbnailStyle} onClick={this.playPause}>
                    <div className="video_player_thumbnail_play"><Icon type="play" /></div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isIOS: App.isIOS(state),
        isMobile: App.isMobile(state),
        browser: App.get(state, 'browser'),
        version: App.get(state, 'version'),
        volume: App.get(state, 'volume', 1),

        isContinuousPlayEnabled: ownProps.roomId ? Room.get(state, ownProps.roomId, 'isContinuousPlayEnabled', false) : false,
        authorUsername: ownProps.roomId ? Room.author(state, ownProps.roomId).get('username') : ''
    }
}

export default connect(mapStateToProps)(Video)
