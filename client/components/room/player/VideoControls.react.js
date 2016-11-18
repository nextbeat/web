import React from 'react'

import Icon from '../../shared/Icon.react'

function padNumber(num) {
    const str = num.toString();
    return ('00'+str).substring(str.length);
}

function timeStr(time) {
    return `${padNumber(Math.floor(time/60.0))}:${padNumber(Math.floor(time % 60))}`
}

class VideoControls extends React.Component {

    constructor(props) {
        super(props);

        this.handleProgressBarOnMouseOver = this.handleProgressBarOnMouseOver.bind(this);
        this.handleProgressBarOnMouseOut = this.handleProgressBarOnMouseOut.bind(this);
        this.handleProgressBarOnMouseDown = this.handleProgressBarOnMouseDown.bind(this);

        this.handleVolumeOnMouseDown = this.handleVolumeOnMouseDown.bind(this);
        this.handleVolumeOnMouseMove = this.handleVolumeOnMouseMove.bind(this);
        this.handleVolumeOnMouseUp = this.handleVolumeOnMouseUp.bind(this);
        this.handleVolumeOnMouseOut = this.handleVolumeOnMouseOut.bind(this);

        this.state = {
            isDraggingVolume: false,
            isDraggingProgressBar: false
        }
    }


    // Actions

    handleVolume(e) {
        const offset = e.pageX - $('.video_volume-slider-container').offset().left;
        const width = $('.video_volume-slider-container').width();
        let volume = offset/width;
        this.props.adjustVolume(volume);
    }

    handleSeek(e) {
        const offset = e.pageX - $('.video_progress-bar').offset().left;
        const width = $('.video_progress-bar').width();
        this.props.seek(offset/width * this.props.duration);
    }


    // Container events

    handleOnMouseMove(e) {
        if (this.state.isDraggingProgressBar) {
            this.handleSeek(e);
        }
    }

    handleOnMouseUp(e) {
        if (this.state.isDraggingProgressBar) {
            this.handleSeek(e);
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
        this.handleSeek(e);
        this.setState({
            isDraggingProgressBar: true
        });
    }


    // Volume events

    handleVolumeOnMouseDown(e) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: true
        })
    }

    handleVolumeOnMouseMove(e) {
        if (this.state.isDraggingVolume) {
            this.handleVolume(e);
        }
    }

    handleVolumeOnMouseUp(e) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: false
        })
    }

    handleVolumeOnMouseOut(e) {
        this.setState({
            isDraggingVolume: false
        })
    }

    render() {

        const { currentTime, duration, loadedDuration, volume,
                shouldDisplayControls, isPlaying, isFullScreen,
                mute, playPause, fullScreen } = this.props

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

        const displayControlsClass = shouldDisplayControls ? "display-controls" : "";
        const displayControlsVideoStyle = shouldDisplayControls ? { cursor: 'auto' } : { cursor: 'none' };
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";


        return (
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
                <div className="video_controls" id="video_controls">
                    <div className="video_controls-left">
                        <a className="video_control video_control-play-pause" onClick={playPause}>
                            { isPlaying ? <Icon type="pause" /> : <Icon type="play" /> }
                        </a>
                        <div className="video_control video_control-time">
                            <span className="video_time-current">{timeStr(currentTime)}</span>
                            <span className="video_time-separator">/</span>
                            <span className="video_time-duration">{timeStr(duration)}</span>
                        </div>
                    </div>
                    <div className="video_controls-right">
                        <a className="video_control video_control-fullscreen" onClick={fullScreen}><Icon type={fullScreenIcon} /></a>
                        <div className="video_control video_control-volume">
                            <span className="video_volume-icon" onClick={mute}><Icon type={volumeIcon} /></span>
                            <div className="video_volume-slider-container" {...volumeEvents} >
                                <div className="video_volume-slider" style={{ transform: `translateY(-50%) scaleX(${volume})`}}></div>
                                <div className="video_volume-slider-backdrop"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

VideoControls.propTypes = {
    // Constants
    currentTime: React.PropTypes.number,
    duration: React.PropTypes.number,
    loadedDuration: React.PropTypes.number,
    volume: React.PropTypes.number,
    shouldDisplayControls: React.PropTypes.bool,
    isPlaying: React.PropTypes.bool,
    isFullScreen: React.PropTypes.bool,

    // Functions
    adjustVolume: React.PropTypes.func,
    mute: React.PropTypes.func,
    playPause: React.PropTypes.func,
    seek: React.PropTypes.func,
    fullScreen: React.PropTypes.func

}

export default VideoControls
