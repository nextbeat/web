import * as React from 'react'
import { connect } from 'react-redux'
import debounce from 'lodash-es/debounce'
import * as Hls from 'hls.js'
import { toggleFullScreen, isFullScreen } from '../../../utils'


import Decoration from './Decoration'
import VideoControls from './VideoControls'
import Spinner from '@components/shared/Spinner'
import { setVideoVolume } from '@actions/app'
import { logVideoImpression } from '@actions/ga'
import { didPlayVideo } from '@actions/room'
import App from '@models/state/app'
import Room from '@models/state/room'
import { State, DispatchProps } from '@types'

const START_IMPRESSION_WAIT_TIME = 500;

function canPlayHlsNative(videoElem: HTMLVideoElement) {
    return videoElem.canPlayType && !!videoElem.canPlayType('application/vnd.apple.mpegURL')
}

interface OwnProps {
    video: State
    autoplay?: boolean
    roomId?: number
    decoration?: State
    alternateVideo?: State

    containerWidth: number
    containerHeight: number
}

interface ConnectProps {
    isIOS: boolean
    isAndroid: boolean
    browser: string
    version: string
    volume: number

    selectedMediaItemId?: number
}

type Props = OwnProps & ConnectProps & DispatchProps

interface VideoState {
    currentTime: number
    loadedDuration: number
    duration: number
    storedVolume: number
    isPlaying: boolean
    isLoading: boolean
    shouldDisplayControls: boolean
    isFullScreen: boolean
    isIOSDevice: boolean
    timeIntervalId: number
    hoverTimeoutId: number
    impressionStartTime: number
    width: number
    height: number
    scale: number
    hls?: Hls
}

class Video extends React.Component<Props, VideoState> {

    static defaultProps = {
        autoplay: true
    }

    private _controls: VideoControls

    constructor(props: Props) {
        super(props);

        this.shouldForceVideoRotation = this.shouldForceVideoRotation.bind(this);
        this.shouldForceVideoResizing = this.shouldForceVideoResizing.bind(this);
        this.calculateDimensions = this.calculateDimensions.bind(this);

        this.didLoadMetadata = this.didLoadMetadata.bind(this);
        this.didUpdateTime = this.didUpdateTime.bind(this);
        this.isPlaying = this.isPlaying.bind(this);
        this.canPlay = this.canPlay.bind(this);
        this.didPause = this.didPause.bind(this);
        this.isWaiting = this.isWaiting.bind(this);
        this.didProgressDownload = this.didProgressDownload.bind(this);

        this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
        this.handleOnMouseMove = this.handleOnMouseMove.bind(this);
        this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleFullScreenChange = this.handleFullScreenChange.bind(this);

        this.loadVideo = this.loadVideo.bind(this);
        this.unloadVideo = this.unloadVideo.bind(this);
        this.playPause = this.playPause.bind(this);
        this.seek = this.seek.bind(this);
        this.adjustVolume = this.adjustVolume.bind(this);
        this.mute = this.mute.bind(this);
        this.fullScreen = this.fullScreen.bind(this);
        this.hideControlsAfterDelay = this.hideControlsAfterDelay.bind(this);

        this.startNewImpression = debounce(this.startNewImpression.bind(this), START_IMPRESSION_WAIT_TIME);
        this.logImpression = this.logImpression.bind(this);

        this.videoStyle = this.videoStyle.bind(this);

        this.state = {
            currentTime: 0,
            loadedDuration: 0,
            duration: 0.5, // not zero to avoid divide by zero bugs
            storedVolume: 1, // stores last set volume when volume = 0 due to muting
            isPlaying: true,
            isLoading: true,
            shouldDisplayControls: true,
            isFullScreen: false,
            isIOSDevice: false,
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
        const video = document.getElementById('video_player') as HTMLVideoElement;

        video.addEventListener('loadedmetadata', this.didLoadMetadata);
        video.addEventListener('canplay', this.canPlay);
        video.addEventListener('playing', this.isPlaying);
        video.addEventListener('pause', this.didPause);
        video.addEventListener('waiting', this.isWaiting);
        video.addEventListener('progress', this.didProgressDownload);

        this.loadVideo();

        $(window).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', this.handleFullScreenChange)

        const { isIOS, isAndroid, browser, autoplay } = this.props

        // iOS does not do custom controls well
        this.setState({
            isIOSDevice: isIOS,
            isPlaying: (autoplay && !(isAndroid && browser === 'Chrome')) || false,
        })
    }

    componentWillUnmount() {        
        const video = document.getElementById('video_player') as HTMLVideoElement;

        video.removeEventListener('loadedmetadata', this.didLoadMetadata);
        video.removeEventListener('canplay', this.canPlay);
        video.removeEventListener('playing', this.isPlaying);
        video.removeEventListener('pause', this.didPause);
        video.removeEventListener('waiting', this.isWaiting);
        video.removeEventListener('progress', this.didProgressDownload);

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

    // Events 

    handleFullScreenChange() {
        this.setState({
            isFullScreen: isFullScreen()
        })
    }

    calculateDimensions() {
        const { video, containerWidth, containerHeight } = this.props

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
    }

    didUpdateTime() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        this.setState({
            currentTime: video.currentTime
        });
    }

    canPlay() {
        this.setState({
            isLoading: false
        })
    }

    isPlaying() {
        const video = document.getElementById('video_player') as HTMLVideoElement;

        clearInterval(this.state.timeIntervalId);
        const timeIntervalId = window.setInterval(this.didUpdateTime, 500);

        this.startNewImpression()

        this.setState({
            currentTime: video.currentTime,
            timeIntervalId,
            isPlaying: true,
        });

        if (video.currentTime === 0) {
            this.hideControlsAfterDelay();
            this.setState({
                shouldDisplayControls: true
            })
        } 

        // record that video has been played if in room
        const { roomId, dispatch } = this.props
        if (roomId) {
            dispatch(didPlayVideo(roomId))
        }
    }

    didPause() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        clearInterval(this.state.timeIntervalId);

        // record video impression if one is active
        this.logImpression();

        this.setState({
            currentTime: video.currentTime,
            isPlaying: false,
            shouldDisplayControls: true
        });
    }

    isWaiting() {
        const video = document.getElementById('video_player');
        clearInterval(this.state.timeIntervalId);

        this.setState({
            isPlaying: false
        });
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
        const { video, alternateVideo } = this.props;

        this.unloadVideo();

        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);

        let videoPlayer = document.getElementById('video_player') as HTMLVideoElement;

        if (video.get('type') === 'hls') 
        {
            if (canPlayHlsNative(videoPlayer)) 
            {
                videoPlayer.src = video.get('url'); 
            } 
            else if (Hls.isSupported()) 
            {
                // use hls.js player
                var hls = new Hls();
                hls.attachMedia(videoPlayer);
                hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(video.get('url'));
                    hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                        videoPlayer.play();
                    });
                });
                this.setState({ hls })
            } 
            else if (alternateVideo)
            {
                // degrade to alternate mp4 video
                videoPlayer.src = alternateVideo.get('url')
            }  
        } 
        else 
        {
            videoPlayer.src = video.get('url')
        }

        if (video.get('type') === 'objectURL') {
            videoPlayer.addEventListener('loadeddata', () => {
                URL.revokeObjectURL(video.get('url'))
            })
        }

        videoPlayer.volume = this.props.volume

        this.calculateDimensions();

        this.setState({
            currentTime: 0,
            duration: 0.5,
            loadedDuration: 0
        });

        window.setTimeout(() => {
            let videoPlayer = document.getElementById('video_player') as HTMLVideoElement;
            if (videoPlayer.readyState < 4) {
                this.setState({ isLoading: true })
            }
        }, 100)
    }

    unloadVideo() {
        const { hls } = this.state;
        if (hls) {
            hls.destroy();
            this.setState({ hls: undefined });
        }
    }

    playPause() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        if (!this.state.isPlaying) {
            video.play();
        } else {
            video.pause();
            if (this.state.isLoading) {
                this.setState({ isPlaying: false })
            }
        }
    }

    seek(time: number) {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        video.currentTime = time;
        this.setState({
            currentTime: video.currentTime
        });
    }

    adjustVolume(volume: number) {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        if (volume < 0.05) {
            volume = 0;
        }
        if (volume > 0.95) {
            volume = 1;
        }
        video.volume = volume;
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
        toggleFullScreen(document.getElementById('player_media-inner'));
    }

    hideControlsAfterDelay(delay=2500) {
        clearTimeout(this.state.hoverTimeoutId);
        const hoverTimeoutId = window.setTimeout(() => {
            if (this.state.isPlaying) {
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
        const { selectedMediaItemId, dispatch } = this.props
        // only log impression if one has began and video is associated with a media item
        if (impressionStartTime < 0 || !selectedMediaItemId) {
            return;
        }

        const video = document.getElementById('video_player') as HTMLVideoElement
        dispatch(logVideoImpression(selectedMediaItemId, impressionStartTime, video.currentTime))

        this.setState({
            impressionStartTime: -1
        })
    }

    startNewImpression() {
        // debounced function, so called START_IMPRESSION_WAIT_TIME msecs after play begins
        const video = document.getElementById('video_player') as HTMLVideoElement
        if (video) {
            this.setState({
                impressionStartTime: Math.max(0, video.currentTime - START_IMPRESSION_WAIT_TIME/1000)
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
        if (this.state.isPlaying) {
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
        // call event handler on child component
        this._controls.handleOnMouseUp(e)
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLElement>) {
        if (e.charCode === 32) { // spacebar
            e.preventDefault();
            this.playPause();
        }
    }

    // Render

    videoStyle(video: State, state: VideoState) {
        const { scale, width, height, isLoading, isIOSDevice } = state
        
        let style: any = { display: isLoading && !isIOSDevice ? 'none' : 'block' }
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
        const { video, decoration, autoplay, volume } = this.props;
        const { isIOSDevice, shouldDisplayControls, isLoading, width, height } = this.state;

        const displayControlsVideoStyle = shouldDisplayControls ? { cursor: 'auto' } : { cursor: 'none' };

        const videoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut,
            onMouseMove: this.handleOnMouseMove,
            onMouseUp: this.handleOnMouseUp,
            onKeyPress: this.handleKeyPress,
        }

        const videoControlsProps = {
            currentTime: this.state.currentTime,
            duration: this.state.duration,
            loadedDuration: this.state.loadedDuration,
            volume: volume,
            shouldDisplayControls: this.state.shouldDisplayControls,
            isPlaying: this.state.isPlaying,
            isFullScreen: this.state.isFullScreen,
            adjustVolume: this.adjustVolume,
            mute: this.mute,
            playPause: this.playPause,
            seek: this.seek,
            fullScreen: this.fullScreen
        }

        let videoAttributes = {
            preload: "auto",
            controls: isIOSDevice,
            autoPlay: autoplay !== false && !isIOSDevice // by default, autoplay is undefined 
        }

        return (
            <div className="video_container" id="video_container" tabIndex={-1} style={displayControlsVideoStyle} {...videoContainerEvents}>
                <div className="video_player-container">
                    <div className="video_player-background" style={{ backgroundImage: `url(${video.get('poster_url')})`}}></div>
                    <video id="video_player" className="video_player" {...videoAttributes} style={this.videoStyle(video, this.state)}></video>
                    { decoration && <Decoration decoration={decoration} width={width} height={height} barHeight={70} /> }
                    { isLoading && !isIOSDevice && <Spinner styles={['white', 'large', 'faded']} /> }
                </div>
                { !isIOSDevice && <VideoControls ref={(c) => { if (c) { this._controls = c } }} {...videoControlsProps} /> }
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isIOS: App.isIOS(state),
        isAndroid: App.isAndroid(state),
        browser: App.get(state, 'browser'),
        version: App.get(state, 'version'),
        volume: App.get(state, 'volume', 1),
        selectedMediaItemId: ownProps.roomId && Room.get(state, ownProps.roomId, 'selectedMediaItemId')
    }
}

export default connect(mapStateToProps)(Video)
