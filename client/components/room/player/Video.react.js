import React from 'react'
import { toggleFullScreen, isIOSDevice, secureUrl } from '../../../utils'

import Decoration from './Decoration.react'
import Icon from '../../shared/Icon.react'


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

        this.handleProgressBarOnMouseOver = this.handleProgressBarOnMouseOver.bind(this);
        this.handleProgressBarOnMouseOut = this.handleProgressBarOnMouseOut.bind(this);
        this.handleProgressBarOnMouseDown = this.handleProgressBarOnMouseDown.bind(this);

        this.handleVolumeOnMouseDown = this.handleVolumeOnMouseDown.bind(this);
        this.handleVolumeOnMouseMove = this.handleVolumeOnMouseMove.bind(this);
        this.handleVolumeOnMouseUp = this.handleVolumeOnMouseUp.bind(this);
        this.handleVolumeOnMouseOut = this.handleVolumeOnMouseOut.bind(this);

        this.playPause = this.playPause.bind(this);
        this.seek = this.seek.bind(this);
        this.adjustVolume = this.adjustVolume.bind(this);
        this.fullScreen = this.fullScreen.bind(this);
        this.hideControlsAfterDelay = this.hideControlsAfterDelay.bind(this);

        this.state = {
            currentTime: 0,
            loadedDuration: 0,
            duration: 0.5, // not zero to avoid divide by zero bugs
            volume: 1,
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
            firstFrameHeight: 0
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

        this.loadVideo(this.props.item);

        // display first frame image once fully loaded
        this.state.firstFrameImage.addEventListener('load', () => {
            this.setState({ firstFrameUrl: this.props.item.get('firstframe_url') })
            this.resize()
        })
        this.state.firstFrameImage.src = this.props.item.get('firstframe_url')

        window.addEventListener('resize', this.resize)

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

            this.setState({ firstFrameUrl: '' })
            this.state.firstFrameImage.src = this.props.item.get('firstframe_url')
        }
    }

    // Events 

    resize() {
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
        video.load();

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
        this.setState({ volume });
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

    render() {
        const { item } = this.props;
        const { currentTime, duration, loadedDuration, volume, isPlaying, 
                displayControls, isFullScreen, isIOSDevice, 
                firstFrameImage, firstFrameHeight, firstFrameWidth, firstFrameUrl } = this.state;

        const displayControlsClass = displayControls ? "display-controls" : "";
        const displayControlsVideoStyle = displayControls ? { cursor: 'auto' } : { cursor: 'none' };
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";

        const videoContainerEvents = {
            onMouseOver: this.handleOnMouseOver,
            onMouseOut: this.handleOnMouseOut,
            onMouseMove: this.handleOnMouseMove,
            onMouseUp: this.handleOnMouseUp
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

        return (
            <div className="video_container" id="video_container" style={displayControlsVideoStyle} {...videoContainerEvents}>
                { window.MSStream }
                <div className="video_player-container">
                    <div className="video_player-background" style={{ backgroundImage: `url(${secureUrl(firstFrameUrl)})`}}></div>
                    { isIOSDevice && 
                        <video id="video_player" className="video_player" autoload controls preload="auto">
                            <source src={secureUrl(item.get('url'))} type="video/mp4" />
                        </video>
                    }
                    { !isIOSDevice && 
                        <video id="video_player" className="video_player" autoPlay autoload preload="auto">
                            <source src={secureUrl(item.get('url'))} type="video/mp4" />
                        </video>
                    }
                    { firstFrameUrl.length > 0 && item.get('decoration') && 
                        <div className="video_player-decoration" style={{width: `${firstFrameWidth}px`, height: `${firstFrameHeight}px`}}>
                            <Decoration decoration={item.get('decoration')} />
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
                                    <span className="video_volume-icon"><Icon type={volumeIcon} /></span>
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

export default Video;
