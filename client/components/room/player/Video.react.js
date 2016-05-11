import React from 'react'

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

        this.state = {
            currentTime: 0,
            loadedDuration: 0,
            duration: 0.5, // not zero to avoid divide by zero bugs
            volume: 1,
            isPlaying: true,
            timeIntervalId: -1,
            displayControls: true,
            isMouseOver: false,
            isDraggingProgressBar: false,
            isDraggingVolume: false,
        };
    }

    // Component lifecycle

    componentDidMount() {
        const video = document.getElementById('video_player');

        video.addEventListener('loadedmetadata', this.didLoadMetadata);
        video.addEventListener('timeupdate', this.didUpdateTime);
        video.addEventListener('playing', this.isPlaying);
        video.addEventListener('pause', this.didPause);
        video.addEventListener('waiting', this.isWaiting);
        video.addEventListener('progress', this.didProgressDownload);
    }

    componentWillUnmount() {
        const video = document.getElementById('video_player');

        video.removeEventListener('loadedmetadata', this.didLoadMetadata);
        video.removeEventListener('timeupdate', this.didUpdateTime);
        video.removeEventListener('playing', this.isPlaying);
        video.removeEventListener('pause', this.didPause);
        video.removeEventListener('waiting', this.isWaiting);
        video.removeEventListener('progress', this.didProgressDownload);

        clearInterval(this.state.timeIntervalId);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            this.loadVideo(item);
        }
    }

    // Events 

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
        const timeIntervalId = setInterval(this.didUpdateTime, 50);

        this.setState({
            timeIntervalId,
            isPlaying: true
        });

        if (video.currentTime === 0) {
            this.setState({
                displayControls: true
            })
            setTimeout(() => {
                if (this.state.isPlaying && !this.state.isMouseOver) {
                    this.setState({
                        displayControls: false
                    })
                }
            }, 2500);
        } else if (!this.state.isMouseOver) {
            this.setState({
                displayControls: false
            })
        }

    }

    didPause() {
        const video = document.getElementById('video_player');
        clearInterval(this.state.timeIntervalId);

        this.setState({
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
        const video = document.getElementById('video_player');
        video.load();
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

    // Video container eventd

    handleOnMouseOver() {
        this.setState({
            displayControls: true,
            isMouseOver: true
        })
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
    }

    handleOnMouseUp(e) {
        if (this.state.isDraggingProgressBar) {
            this.seek(e);
            this.setState({
                isDraggingProgressBar: false
            });
            $('.video_progress-scrubber').removeClass('active');
        }
    }

    // Progress bar events

    handleProgressBarOnMouseOver() {
        $('.video_progress-scrubber').addClass('active');
    }

    handleProgressBarOnMouseOut() {
        if (!this.state.isDraggingProgressBar) {
            $('.video_progress-scrubber').removeClass('active');
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
        const { currentTime, duration, loadedDuration, volume, isPlaying, displayControls } = this.state;
        const displayControlsClass = displayControls ? "display-controls" : "";
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
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
            <div className="video_container" {...videoContainerEvents}>
                <div className="video_player-container">
                    <video id="video_player" className="video_player" autoPlay autoload preload="auto" poster={item.get('firstframe_url')} >
                        <source src={item.get('url')} type="video/mp4" />
                    </video>
                </div>
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
                            { /* <a className="video_control video_control-fullscreen"><Icon type="fullscreen" /></a> */ }
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

            </div>
        );
    }
}

export default Video;
