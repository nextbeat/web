import React from 'react'
import { connect } from 'react-redux'
import { assign } from 'lodash'
import Promise from 'bluebird'
import Hls from 'hls.js'
import { toggleFullScreen, isIOSDevice } from '../../../utils'

import Decoration from './Decoration.react'
import VideoControls from './VideoControls.react'
import { App } from '../../../models'
import { setVideoVolume } from '../../../actions'


class Video extends React.Component {

    constructor(props) {
        super(props);

        this.shouldForceVideoRotation = this.shouldForceVideoRotation.bind(this);
        this.shouldForceVideoResizing = this.shouldForceVideoResizing.bind(this);
        this.resize = this.resize.bind(this);

        this.didLoadMetadata = this.didLoadMetadata.bind(this);
        this.didUpdateTime = this.didUpdateTime.bind(this);
        this.isPlaying = this.isPlaying.bind(this);
        this.didPause = this.didPause.bind(this);
        this.isWaiting = this.isWaiting.bind(this);
        this.didProgressDownload = this.didProgressDownload.bind(this);

        this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
        this.handleOnMouseMove = this.handleOnMouseMove.bind(this);
        this.handleOnMouseUp = this.handleOnMouseUp.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        this.loadVideo = this.loadVideo.bind(this);
        this.playPause = this.playPause.bind(this);
        this.seek = this.seek.bind(this);
        this.adjustVolume = this.adjustVolume.bind(this);
        this.mute = this.mute.bind(this);
        this.fullScreen = this.fullScreen.bind(this);
        this.hideControlsAfterDelay = this.hideControlsAfterDelay.bind(this);

        this.videoStyle = this.videoStyle.bind(this);

        this.state = {
            currentTime: 0,
            loadedDuration: 0,
            duration: 0.5, // not zero to avoid divide by zero bugs
            storedVolume: 1, // stores last set volume when volume = 0 due to muting
            isPlaying: true,
            shouldDisplayControls: true,
            isFullScreen: false,
            isIOSDevice: false,
            timeIntervalId: -1,
            hoverTimeoutId: -1,
            width: 0,
            height: 0,
            scale: 1
        };
    }

    // Component lifecycle

    componentDidMount() {
        const video = document.getElementById('video_player');

        video.addEventListener('loadedmetadata', this.didLoadMetadata);
        video.addEventListener('playing', this.isPlaying);
        video.addEventListener('pause', this.didPause);
        video.addEventListener('waiting', this.isWaiting);
        video.addEventListener('progress', this.didProgressDownload);

        this.loadVideo(this.props.video);
        window.addEventListener('resize', this.resize)
        this.resize()

        // iOS does not do custom controls well
        this.setState({
            isIOSDevice: isIOSDevice(),
            isPlaying: this.props.autoplay !== false
        })
    }

    componentWillUnmount() {
        const video = document.getElementById('video_player');

        video.removeEventListener('loadedmetadata', this.didLoadMetadata);
        video.removeEventListener('playing', this.isPlaying);
        video.removeEventListener('pause', this.didPause);
        video.removeEventListener('waiting', this.isWaiting);
        video.removeEventListener('progress', this.didProgressDownload);

        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);

        window.removeEventListener('resize', this.resize);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.video !== this.props.video) {
            this.loadVideo(this.props.video);
        }
    }

    // Queries

    shouldForceVideoRotation() {
        const { app } = this.props;
        return app.get('browser') === 'Firefox' || (app.get('browser') === 'IE' && parseInt(app.get('version')) === 10)
    }

    shouldForceVideoResizing() {
        const { app } = this.props;
        return app.get('browser') === 'Chrome' && parseInt(app.get('version')) >= 52;
    }

    // Events 

    resize() {
        const { video } = this.props

        const containerWidth = $('.player_media-inner').width()
        const containerHeight = $('.player_media-inner').height()
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
        const video = document.getElementById('video_player');
        this.setState({
            duration: video.duration
        });
    }

    didUpdateTime() {
        const video = document.getElementById('video_player');
        this.setState({
            currentTime: video.currentTime
        });
    }

    isPlaying() {
        const video = document.getElementById('video_player');

        clearInterval(this.state.timeIntervalId);
        const timeIntervalId = setInterval(this.didUpdateTime, 500);

        this.setState({
            currentTime: video.currentTime,
            timeIntervalId,
            isPlaying: true
        });

        if (video.currentTime === 0) {
            this.hideControlsAfterDelay();
            this.setState({
                shouldDisplayControls: true
            })
        } 
    }

    didPause() {
        const video = document.getElementById('video_player');
        clearInterval(this.state.timeIntervalId);

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
        const video = document.getElementById('video_player');
        if (video.buffered.length >= 1) {
            this.setState({
                loadedDuration: video.buffered.end(0)
            })
        }
    }

    // Actions

    loadVideo(video) {
        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);

        const videoPlayer = document.getElementById('video_player');

        if (video.get('type') === 'hls') {
            var hls = new Hls();
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                console.log("video and hls.js are now bound together !");
                hls.loadSource(video.get('url'));
                hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                    console.log("manifest loaded, found " + data.levels.length + " quality levels");
                    video.play();
                });
            });
        } else {
            videoPlayer.src = video.get('url')
        }

        if (video.get('type') === 'objectURL') {
            videoPlayer.addEventListener('loadeddata', () => {
                URL.revokeObjectURL(video.get('url'))
            })
        }

        videoPlayer.volume = this.props.app.get('volume', 1)
        this.resize()

        this.setState({
            currentTime: 0,
            duration: 0.5,
            loadedDuration: 0
        });
    }

    playPause() {
        const video = document.getElementById('video_player');
        if (this.state.isPlaying === false) {
            video.play();
        } else {
            video.pause();
        }
    }

    seek(time) {
        const video = document.getElementById('video_player');
        video.currentTime = time;
        this.setState({
            currentTime: video.currentTime
        });
    }

    adjustVolume(volume) {
        const video = document.getElementById('video_player');
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
        const video = document.getElementById('video_player');
        const { storedVolume } = this.state
        const volume = this.props.app.get('volume', 1)

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
        toggleFullScreen(document.getElementById('player_media-inner'), (isFullScreen) => {
            this.setState({ isFullScreen })
        });
    }

    hideControlsAfterDelay(delay=2500) {
        clearTimeout(this.state.hoverTimeoutId);
        const hoverTimeoutId = setTimeout(() => {
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

    handleOnMouseMove(e) {
        this.setState({
            shouldDisplayControls: true,
        });
        this.hideControlsAfterDelay()

        // call event handler on child component
        this.refs.controls.handleOnMouseMove(e)
    }

    handleOnMouseUp(e) {
        // call event handler on child component
        this.refs.controls.handleOnMouseUp(e)
    }

    handleKeyPress(e) {
        if (e.charCode === 32) { // spacebar
            e.preventDefault();
            this.playPause();
        }
    }

    // Render

    videoStyle(video, state) {
        const { scale } = state
        
        let style = {}
        if (this.shouldForceVideoRotation()) {
            // need to manually rotate video if in Firefox or IE 10 
            if (video.get('orientation') === 90) {
                style.transform = `rotate(90deg) scale(${scale})`
                style.left = 0
                style.top = 0
            } else if (video.get('orientation') === 270) {
                style.transform = `rotate(-90deg) scale(${scale})`
                style.left = 0
                style.top = 0
            }
        } else if (this.shouldForceVideoResizing()) {
            // need to manually rescale video if in Chrome 52
            if (video.get('orientation') === 90 || video.get('orientation') === 270) {
                const videoRatio = video.get('width')/video.get('height')
                style.transform = `scaleX(${videoRatio*scale}) scaleY(${1/videoRatio*scale})`
                style.left = 0
                style.top = 0
            }
        }
        return style
    }

    captionStyle(state) {
        const { width, height } = state 
        return {
            width: `${width}px`, 
            height: `${height}px`
        }
    }

    render() {
        const { video, decoration, app, autoplay } = this.props;
        const { isIOSDevice, shouldDisplayControls } = this.state;

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
            volume: app.get('volume', 1),
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
            autoload: true,
            controls: isIOSDevice,
            autoPlay: autoplay !== false && !isIOSDevice // by default, autoplay is undefined 
        }


        return (
            <div className="video_container" id="video_container" tabIndex="-1" style={displayControlsVideoStyle} {...videoContainerEvents}>
                <div className="video_player-container">
                    <div className="video_player-background" style={{ backgroundImage: `url(${video.get('poster_url')})`}}></div>
                    <video id="video_player" className="video_player" {...videoAttributes} style={this.videoStyle(video, this.state)}></video>
                    { decoration && 
                        <div className="video_player-decoration" style={this.captionStyle(this.state)}>
                            <Decoration decoration={decoration} />
                        </div>
                    }
                </div>
                { !isIOSDevice && <VideoControls ref="controls" {...videoControlsProps} /> }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Video)
