import * as React from 'react'
import Icon from '@components/shared/Icon'

function padNumber(num: number) {
    const str = num.toString();
    return ('00'+str).substring(str.length);
}

function timeStr(time: number) {
    return `${padNumber(Math.floor(time/60.0))}:${padNumber(Math.floor(time % 60))}`
}

interface Props {
    currentTime: number
    duration: number
    loadedDuration: number
    volume: number
    shouldDisplayControls: boolean
    isPlaying: boolean
    isFullScreen: boolean
    isScrubbable: boolean

    adjustVolume: (volume: number) => void
    mute: () => void
    playPause: () => void
    seek: (time: number) => void
    fullScreen: () => void
}

interface State {
    isDraggingVolume: boolean
    isDraggingProgressBar: boolean
}

class VideoControls extends React.Component<Props, State> {

    constructor(props: Props) {
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

    handleVolume(e: React.MouseEvent<HTMLElement>) {
        const offset: number = e.pageX - ($('.video_volume-slider-container').offset() as any).left;
        const width = $('.video_volume-slider-container').width() as number
        let volume = offset/width;
        this.props.adjustVolume(volume);
    }

    handleSeek(e: React.MouseEvent<HTMLElement>) {
        const offset: number = e.pageX - ($('.video_progress-bar').offset() as any).left;
        const width = $('.video_progress-bar').width() as number;
        this.props.seek(offset/width * this.props.duration);
    }


    // Container events

    handleOnMouseMove(e: React.MouseEvent<HTMLElement>) {
        if (this.state.isDraggingProgressBar) {
            this.handleSeek(e);
        }
    }

    handleOnMouseUp(e: React.MouseEvent<HTMLElement>) {
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

    handleProgressBarOnMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.handleSeek(e);
        this.setState({
            isDraggingProgressBar: true
        });
    }


    // Volume events

    handleVolumeOnMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: true
        })
    }

    handleVolumeOnMouseMove(e: React.MouseEvent<HTMLElement>) {
        if (this.state.isDraggingVolume) {
            this.handleVolume(e);
        }
    }

    handleVolumeOnMouseUp(e: React.MouseEvent<HTMLElement>) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: false
        })
    }

    handleVolumeOnMouseOut(e: React.MouseEvent<HTMLElement>) {
        this.setState({
            isDraggingVolume: false
        })
    }

    render() {

        const { currentTime, duration, loadedDuration, volume,
                shouldDisplayControls, isPlaying, isFullScreen,
                isScrubbable, mute, playPause, fullScreen } = this.props

        const progressBarEvents = !isScrubbable ? {} : {
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

        const notScrubbableClass = isScrubbable ? "" : "not-scrubbable";
        const displayControlsClass = shouldDisplayControls ? "display-controls" : "";
        const displayControlsVideoStyle = shouldDisplayControls ? { cursor: 'auto' } : { cursor: 'none' };
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";

        return (
            <div className={`video_bottom ${displayControlsClass} ${notScrubbableClass}`}>
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

export default VideoControls
