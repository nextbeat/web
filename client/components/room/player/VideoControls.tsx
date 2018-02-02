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
    shouldDisplayContinuousPlay: boolean
    isContinuousPlayEnabled: boolean

    adjustVolume: (volume: number) => void
    mute: () => void
    playPause: () => void
    seek: (time: number) => void
    fullScreen: () => void
    toggleContinuousPlay: () => void
}

interface State {
    isDraggingVolume: boolean
    isVolumeActive: boolean
    isDraggingProgressBar: boolean
    isProgressBarActive: boolean
}

class VideoControls extends React.Component<Props, State> {

    private _progressBar: HTMLDivElement
    private _volumeSliderContainer: HTMLDivElement

    constructor(props: Props) {
        super(props);

        this.handleProgressBarOnMouseOver = this.handleProgressBarOnMouseOver.bind(this);
        this.handleProgressBarOnMouseOut = this.handleProgressBarOnMouseOut.bind(this);
        this.handleProgressBarOnMouseDown = this.handleProgressBarOnMouseDown.bind(this);

        this.handleVolumeOnMouseOver = this.handleVolumeOnMouseOver.bind(this);
        this.handleVolumeOnMouseOut = this.handleVolumeOnMouseOut.bind(this);

        this.handleVolumeSliderOnMouseDown = this.handleVolumeSliderOnMouseDown.bind(this);
        this.handleVolumeSliderOnMouseMove = this.handleVolumeSliderOnMouseMove.bind(this);
        this.handleVolumeSliderOnMouseUp = this.handleVolumeSliderOnMouseUp.bind(this);
        this.handleVolumeSliderOnMouseOut = this.handleVolumeSliderOnMouseOut.bind(this);

        this.state = {
            isDraggingVolume: false,
            isVolumeActive: false,
            isDraggingProgressBar: false,
            isProgressBarActive: false
        }
    }


    // Actions

    handleVolume(e: React.MouseEvent<HTMLElement>) {
        const offset: number = e.pageX - (this._volumeSliderContainer.getBoundingClientRect().left + document.documentElement.scrollLeft)
        const width = this._volumeSliderContainer.clientWidth
        this.props.adjustVolume(offset/width);
    }

    handleSeek(e: React.MouseEvent<HTMLElement>) {
        const offset: number = e.pageX - (this._progressBar.getBoundingClientRect().left + document.documentElement.scrollLeft)
        const width = this._progressBar.clientWidth
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
                isDraggingProgressBar: false,
                isProgressBarActive: false
            });
        }
    }


    // Progress bar events

    handleProgressBarOnMouseOver() {
        this.setState({ isProgressBarActive: true })
    }

    handleProgressBarOnMouseOut() {
        if (!this.state.isDraggingProgressBar) {
            this.setState({ isProgressBarActive: false })
        }
    }

    handleProgressBarOnMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.handleSeek(e);
        this.setState({
            isDraggingProgressBar: true,
            isProgressBarActive: true
        });
    }


    // Volume events

    handleVolumeOnMouseOver() {
        this.setState({ isVolumeActive: true })
    }

    handleVolumeOnMouseOut() {
        this.setState({ isVolumeActive: false })
    }

    handleVolumeSliderOnMouseDown(e: React.MouseEvent<HTMLElement>) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: true
        })
    }

    handleVolumeSliderOnMouseMove(e: React.MouseEvent<HTMLElement>) {
        if (this.state.isDraggingVolume) {
            this.handleVolume(e);
        }
    }

    handleVolumeSliderOnMouseUp(e: React.MouseEvent<HTMLElement>) {
        this.handleVolume(e);
        this.setState({
            isDraggingVolume: false
        })
    }

    handleVolumeSliderOnMouseOut(e: React.MouseEvent<HTMLElement>) {
        this.setState({
            isDraggingVolume: false
        })
    }

    render() {

        const { currentTime, duration, loadedDuration, volume,
                shouldDisplayControls, isPlaying, isFullScreen,
                isContinuousPlayEnabled, toggleContinuousPlay,
                shouldDisplayContinuousPlay,
                isScrubbable, mute, playPause, fullScreen } = this.props

        const { isProgressBarActive, isVolumeActive } = this.state

        const progressBarEvents = !isScrubbable ? {} : {
            onMouseOver: this.handleProgressBarOnMouseOver,
            onMouseOut: this.handleProgressBarOnMouseOut,
            onMouseDown: this.handleProgressBarOnMouseDown,
        }

        const volumeEvents = {
            onMouseOver: this.handleVolumeOnMouseOver,
            onMouseOut: this.handleVolumeOnMouseOut
        }

        const volumeSliderEvents = {
            onMouseDown: this.handleVolumeSliderOnMouseDown,
            onMouseMove: this.handleVolumeSliderOnMouseMove,
            onMouseUp: this.handleVolumeSliderOnMouseUp,
            onMouseOut: this.handleVolumeSliderOnMouseOut
        }

        const notScrubbableClass = isScrubbable ? "" : "not-scrubbable";
        const displayControlsClass = shouldDisplayControls ? "display-controls-video" : "";
        const displayControlsVideoStyle = shouldDisplayControls ? { cursor: 'auto' } : { cursor: 'none' };
        const volumeIcon = volume === 0 ? "volume-mute" : (volume < 0.4 ? "volume-down" : "volume-up");
        const fullScreenIcon = isFullScreen ? "fullscreen-exit" : "fullscreen";
        const autoplaySelectedClass = isContinuousPlayEnabled ? "player_control-autoplay-selected" : "";
        const progressBarActiveClass = isProgressBarActive ? "active" : "";
        const volumeActiveClass = isVolumeActive ? "active" : "";

        return (
            <div className={`player_bottom player_bottom-video 
            ${displayControlsClass} ${notScrubbableClass}`} onClick={(e: React.MouseEvent<HTMLElement>) => {e.stopPropagation()}}>
                <div className="player_gradient-bottom"></div>
                <div className="player_progress-bar-container">
                    <div className="player_progress-bar-padding" {...progressBarEvents}></div>
                    <div className={`player_progress-scrubber ${progressBarActiveClass}`} style={{ left: `${ currentTime/duration*100 }%` }} ></div>
                    <div className={`player_progress-bar ${progressBarActiveClass}`} ref={c => { if (c) { this._progressBar = c } }} >
                        <div className="player_progress-play" style={{ transform: `scaleX(${ currentTime/duration })` }}></div>
                        <div className="player_progress-buffer" style={{ transform: `scaleX(${ loadedDuration/duration })` }}></div>
                        <div className="player_progress-hover"></div>
                    </div>
                </div>
                <div className="player_controls" id="player_controls">
                    <div className="player_controls-left">
                        <a className="player_control player_control-play-pause" onClick={playPause}>
                            { isPlaying ? <Icon type="pause" /> : <Icon type="play" /> }
                        </a>
                        <div className={`player_control player_control-volume ${volumeActiveClass}`} {...volumeEvents}>
                            <span className="player_volume-icon" onClick={mute}><Icon type={volumeIcon} /></span>
                            <div className="player_volume-slider-container" ref={c => { if (c) { this._volumeSliderContainer = c } }} {...volumeSliderEvents} >
                                <div className="player_volume-slider_scrubber" style={{ left: `${volume}%` }}></div>
                                <div className="player_volume-slider" style={{ transform: `translateY(-50%) scaleX(${volume})`}}></div>
                                <div className="player_volume-slider-backdrop"></div>
                            </div>
                        </div>
                        <div className="player_control player_control-time">
                            <span className="player_time-current">{timeStr(currentTime)}</span>
                            <span className="player_time-separator">/</span>
                            <span className="player_time-duration">{timeStr(duration)}</span>
                        </div>
                    </div>
                    <div className="player_controls-right">
                    <a className="player_control player_control-fullscreen" onClick={fullScreen}>
                            <Icon type={fullScreenIcon} />
                            <div className="player_tooltip">Fullscreen</div>
                        </a>
                        { shouldDisplayContinuousPlay && <a className={`player_control player_control-autoplay ${autoplaySelectedClass}`} onClick={toggleContinuousPlay}>
                            <Icon type="autoplay" />
                            <div className="player_tooltip">Autoplay</div>
                        </a> }
                    </div>
                </div>
            </div>
        );
    }

}

export default VideoControls
