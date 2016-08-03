import React from 'react'
import { connect } from 'react-redux'
import { assign } from 'lodash'
import Promise from 'bluebird'
import Hls from 'hls.js'
import { toggleFullScreen, isIOSDevice, getOrientationFromFile } from '../../../utils'

import Decoration from './Decoration.react'
import Icon from '../../shared/Icon.react'
import { App } from '../../../models'

function getImageOrientation(url) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                // get binary data as a response
                var blob = this.response;
                getOrientationFromFile(blob, o => { resolve(o) })
            } else {
                reject();
            }
        };
        xhr.send();
    })
}

function padNumber(num) {
    const str = num.toString();
    return ('00'+str).substring(str.length);
}

function timeStr(time) {
    return `${padNumber(Math.floor(time/60.0))}:${padNumber(Math.floor(time % 60))}`
}

class Video extends React.Component {

    constructor(props) {
        super(props);

        this.shouldForceVideoRotation = this.shouldForceVideoRotation.bind(this);

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

        this.handleProgressBarOnMouseOver = this.handleProgressBarOnMouseOver.bind(this);
        this.handleProgressBarOnMouseOut = this.handleProgressBarOnMouseOut.bind(this);
        this.handleProgressBarOnMouseDown = this.handleProgressBarOnMouseDown.bind(this);

        this.handleVolumeOnMouseDown = this.handleVolumeOnMouseDown.bind(this);
        this.handleVolumeOnMouseMove = this.handleVolumeOnMouseMove.bind(this);
        this.handleVolumeOnMouseUp = this.handleVolumeOnMouseUp.bind(this);
        this.handleVolumeOnMouseOut = this.handleVolumeOnMouseOut.bind(this);

        this.loadVideo = this.loadVideo.bind(this);
        this.loadFirstFrame = this.loadFirstFrame.bind(this);
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
            displayControls: true,
            isMouseOver: false,
            isDraggingProgressBar: false,
            isDraggingVolume: false,
            isFullScreen: false,
            isIOSDevice: false,
            timeIntervalId: -1,
            hoverTimeoutId: -1,
            firstFrameImage: new Image(),
            firstFrameUrl: '',
            firstFrameWidth: 0,
            firstFrameHeight: 0,
            orientation: -1,
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

        // if we need to force video rotation, we don't want to load
        // the video until the orientation
        if (!this.shouldForceVideoRotation()) {
            this.loadVideo(this.props.item);
        }

        // display first frame image once fully loaded
        this.state.firstFrameImage.addEventListener('load', () => {
            this.setState({ firstFrameUrl: this.props.item.get('firstframe_url') })
            this.resize()
        })
        window.addEventListener('resize', this.resize)

        this.loadFirstFrame(this.props);


        // iOS does not do custom controls well
        this.setState({
            isIOSDevice: isIOSDevice()
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
        if (prevProps.item !== this.props.item) {
            this.loadVideo(this.props.item);
            this.loadFirstFrame(this.props);
        }
    }

    // Queries

    shouldForceVideoRotation() {
        const { app, processed } = this.props;
        return !processed && (app.get('browser') === 'Firefox' || (app.get('browser') === 'IE' && parseInt(app.get('version')) === 10))
    }

    // Events 

    resize() {
        const { processed } = this.props

        const { firstFrameImage } = this.state 
        const containerWidth = $('.player_media-inner').width()
        const containerHeight = $('.player_media-inner').height()
        const imageRatio = firstFrameImage.width/firstFrameImage.height
        const containerRatio = containerWidth/containerHeight

        if (imageRatio > containerRatio) {
            this.setState({
                firstFrameWidth: containerWidth,
                firstFrameHeight: Math.floor(containerWidth/imageRatio)
            })
        } else {
            this.setState({
                firstFrameWidth: Math.floor(containerHeight*imageRatio),
                firstFrameHeight: containerHeight
            })
        }

        const node = $(this._node)
        this.setState({
            scale: node.width()/node.height()
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
                displayControls: true
            })
        } 
    }

    didPause() {
        const video = document.getElementById('video_player');
        clearInterval(this.state.timeIntervalId);

        this.setState({
            currentTime: video.currentTime,
            isPlaying: false,
            displayControls: true
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

    loadVideo(item) {
        clearInterval(this.state.timeIntervalId);
        clearInterval(this.state.hoverTimeoutId);

        const video = document.getElementById('video_player');

        // video.load();

        var hls = new Hls();
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            console.log("video and hls.js are now bound together !");
            hls.loadSource("https://media.dev.nextbeat.co/videos/052F2EE6-82AD-4988-978E-67B34F14CBF0/master.m3u8");
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                console.log("manifest loaded, found " + data.levels.length + " quality levels");
                video.play();
            });
        });


        video.volume = this.props.volume;

        this.setState({
            currentTime: 0,
            duration: 0.5,
            loadedDuration: 0
        });
    }

    loadFirstFrame(props) {
        const { processed, item } = props
        if (processed) {
            // we are guaranteed a proper orientation, so we don't have to explicitly load the image blob to check
            this.setState({ firstFrameUrl: '' })
            this.state.firstFrameImage.src = item.get('firstframe_url')
        } else {
            getImageOrientation(item.get('firstframe_url')).bind(this).then(function(o) {
                this.setState({
                    orientation: o
                })
                // load image once orientation is known
                this.state.firstFrameImage.src = item.get('firstframe_url')
                // once we have the orientation, we can load the video if we need to force the rotation
                if (this.shouldForceVideoRotation()) {
                    this.loadVideo(item)
                }
            })
        }
    }

    playPause() {
        const video = document.getElementById('video_player');
        if (this.state.isPlaying === false) {
            video.play();
        } else {
            video.pause();
        }
    }

    seek(e) {
        const video = document.getElementById('video_player');
        const offset = e.pageX - $('.video_progress-bar').offset().left;
        const width = $('.video_progress-bar').width();
        video.currentTime = offset/width * video.duration;
        this.setState({
            currentTime: video.currentTime
        });
    }

    adjustVolume(e) {
        const video = document.getElementById('video_player');
        const offset = e.pageX - $('.video_volume-slider-container').offset().left;
        const width = $('.video_volume-slider-container').width();
        let volume = offset/width;
        if (volume < 0.05) {
            volume = 0;
        }
        if (volume > 0.95) {
            volume = 1;
        }
        video.volume = volume;
        this.props.changeVolume(volume);
    }

    mute(e) {
        const video = document.getElementById('video_player');
        const { storedVolume } = this.state
        const { volume } = this.props
        if (volume > 0) {
            // mute and store previous volume
            video.volume = 0;
            this.props.changeVolume(0);
            this.setState({
                storedVolume: volume
            })
        } else {
            // unmute and reset stored volume
            video.volume = storedVolume;
            this.props.changeVolume(storedVolume);
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
                    displayControls: false
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
            displayControls: true,
            isMouseOver: true
        })
        this.hideControlsAfterDelay()
    }

    handleOnMouseOut() {
        this.setState({
            isMouseOver: false
        })
        if (this.state.isPlaying) {
            this.setState({
                displayControls: false
            })
        }
    }

    handleOnMouseMove(e) {
        if (this.state.isDraggingProgressBar) {
            this.seek(e);
        }
        this.setState({
            displayControls: true
        });
        this.hideControlsAfterDelay()
    }

    handleOnMouseUp(e) {
        if (this.state.isDraggingProgressBar) {
            this.seek(e);
            this.setState({
                isDraggingProgressBar: false
            });
            $('.video_progress-scrubber').removeClass('active');
            $('.video_progress-bar').removeClass('active');
        }
    }

    handleKeyPress(e) {
        if (e.charCode === 32) { // spacebar
            e.preventDefault();
            this.playPause();
        }
    }

    // Progress bar events

    handleProgressBarOnMouseOver() {
        $('.video_progress-scrubber').addClass('active');
        $('.video_progress-bar').addClass('active');
    }

    handleProgressBarOnMouseOut() {
        if (!this.state.isDraggingProgressBar) {
            $('.video_progress-scrubber').removeClass('active');
            $('.video_progress-bar').removeClass('active');
        }
    }

    handleProgressBarOnMouseDown(e) {
        this.seek(e);
        this.setState({
            isDraggingProgressBar: true
        });
    }

    // Volume events

    handleVolumeOnMouseDown(e) {
        this.adjustVolume(e);
        this.setState({
            isDraggingVolume: true
        })
    }

    handleVolumeOnMouseMove(e) {
        if (this.state.isDraggingVolume) {
            this.adjustVolume(e);
        }
    }

    handleVolumeOnMouseUp(e) {
        this.adjustVolume(e);
        this.setState({
            isDraggingVolume: false
        })
    }

    handleVolumeOnMouseOut(e) {
        this.setState({
            isDraggingVolume: false
        })
    }

    // Render

    firstFrameStyle(state) {
        const { orientation, scale, firstFrameUrl } = state

        let style = { backgroundImage: `url(${firstFrameUrl})` }
        if (orientation === 8) {
            style.transform = `rotate(-90deg) scale(${scale})`
        } else if (orientation === 6) {
            style.transform = `rotate(90deg) scale(${scale})`
        }
        return style;
    }

    videoStyle(state) {
        const { orientation, scale } = state
        
        // need to manually rotate video if in Firefox or IE 10 and unprocessed
        let style = {}
        if (this.shouldForceVideoRotation()) {
            if (orientation === 8) {
                style.transform = `rotate(-90deg) scale(${scale})`
                style.left = 0
                style.top = 0
            } else if (orientation === 6) {
                style.transform = `rotate(90deg) scale(${scale})`
                style.left = 0
                style.top = 0
            }
        }
        return style
    }

    captionStyle(state) {
        const { orientation, firstFrameWidth, firstFrameHeight } = state 
        if (orientation === 6 || orientation === 8) {
            const containerWidth = $('.player_media-inner').width()
            const containerHeight = $('.player_media-inner').height()
            return {width: `${containerWidth}px`, height: `${containerHeight}px`}
        } else {
            return {width: `${firstFrameWidth}px`, height: `${firstFrameHeight}px`}
        }
    }

    render() {
        const { item, volume } = this.props;
        const { currentTime, duration, loadedDuration, isPlaying, 
                displayControls, isFullScreen, isIOSDevice, 
                firstFrameImage, firstFrameHeight, firstFrameWidth, firstFrameUrl, 
                orientation, processed } = this.state;

        const displayControlsClass = displayControls ? "display-controls" : "";
        const displayControlsVideoStyle = displayControls ? { cursor: 'auto' } : { cursor: 'none' };
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";

        const videoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut,
            onMouseMove: this.handleOnMouseMove,
            onMouseUp: this.handleOnMouseUp,
            onKeyPress: this.handleKeyPress,
        }
        const progressBarEvents = {
            onMouseOver: this.handleProgressBarOnMouseOver,
            onMouseOut: this.handleProgressBarOnMouseOut,
            onMouseDown: this.handleProgressBarOnMouseDown,
        }
        const volumeEvents = {
            onMouseDown: this.handleVolumeOnMouseDown,
            onMouseMove: this.handleVolumeOnMouseMove,
            onMouseUp: this.handleVolumeOnMouseUp,
            onMouseOut: this.handleVolumeOnMouseOut
        }

        let decoration = item.get('decoration')
        if (!processed && decoration && orientation > 0) {
            // WORK AROUND until we can include width and height in response to simplify things
            decoration = decoration.set('caption_offset', 0.5)
        }

        return (
            <div className="video_container" id="video_container" tabIndex="-1" style={displayControlsVideoStyle} {...videoContainerEvents}>
                <div className="video_player-container">
                    <div ref={(c) => this._node = c} className="video_player-background" style={this.firstFrameStyle(this.state)}></div>
                    { isIOSDevice && 
                        <video id="video_player" className="video_player" autoload controls preload="auto">
                            { /* !(this.shouldForceVideoRotation() && firstFrameUrl.length === 0) && <source src={item.get('url')} type="video/mp4" /> */ }
                        </video>
                    }
                    { !isIOSDevice && 
                        <video id="video_player" className="video_player" autoPlay autoload preload="auto" style={this.videoStyle(this.state, this.props)} >
                            <source src={item.get('url')} type="video/mp4" />
                        </video>
                    }
                    { firstFrameUrl.length > 0 && decoration && 
                        <div className="video_player-decoration" style={this.captionStyle(this.state)}>
                            <Decoration decoration={decoration} />
                        </div>
                    }
                </div>
                { !isIOSDevice &&
                    <div className={`video_bottom ${displayControlsClass}`}>
                        <div className="video_gradient-bottom"></div>
                        <div className="video_progress-bar-container">
                            <div className="video_progress-bar-padding" {...progressBarEvents}></div>
                            <div className="video_progress-scrubber" style={{ left: `${ currentTime/duration*100 }%` }} ></div>
                            <div className="video_progress-bar">
                                <div className="video_progress-play" style={{ transform: `scaleX(${ currentTime/duration })` }}></div>
                                <div className="video_progress-buffer" style={{ transform: `scaleX(${ loadedDuration/duration })` }}></div>
                                <div className="video_progress-hover"></div>
                            </div>
                        </div>
                        <div className="video_controls">
                            <div className="video_controls-left">
                                <a className="video_control video_control-play-pause" onClick={this.playPause}>
                                    { isPlaying ? <Icon type="pause" /> : <Icon type="play" /> }
                                </a>
                                <div className="video_control video_control-time">
                                    <span className="video_time-current">{timeStr(currentTime)}</span>
                                    <span className="video_time-separator">/</span>
                                    <span className="video_time-duration">{timeStr(duration)}</span>
                                </div>
                            </div>
                            <div className="video_controls-right">
                                <a className="video_control video_control-fullscreen" onClick={this.fullScreen}><Icon type={fullScreenIcon} /></a>
                                <div className="video_control video_control-volume">
                                    <span className="video_volume-icon" onClick={this.mute}><Icon type={volumeIcon} /></span>
                                    <div className="video_volume-slider-container" {...volumeEvents} >
                                        <div className="video_volume-slider" style={{ transform: `translateY(-50%) scaleX(${volume})`}}></div>
                                        <div className="video_volume-slider-backdrop"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
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
