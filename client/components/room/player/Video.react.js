import React from 'react'

import Icon from '../../shared/Icon.react'

function padNumber(num) {
    const str = num.toString();
    return ('00'+str).substring(str.length);
}

class Video extends React.Component {

    constructor(props) {
        super(props);

        this.didLoadMetadata = this.didLoadMetadata.bind(this);
        this.didUpdateTime = this.didUpdateTime.bind(this);
        this.isPlaying = this.isPlaying.bind(this);
        this.didPause = this.didPause.bind(this);
        this.isWaiting = this.isWaiting.bind(this);
        this.playPause = this.playPause.bind(this);

        this.state = {
            currentTime: 0,
            duration: 0,
            isPlaying: true
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
    }

    componentWillUnmount() {
        const video = document.getElementById('video_player');

        video.removeEventListener('loadedmetadata', this.didLoadMetadata);
        video.removeEventListener('timeupdate', this.didUpdateTime);
        video.removeEventListener('playing', this.isPlaying);
        video.removeEventListener('pause', this.didPause);
        video.removeEventListener('waiting', this.isWaiting);

    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            this.loadVideo(item);
        }
    }

    // Events 

    didLoadMetadata(e) {
        const video = e.target;
        this.setState({
            duration: video.duration
        });
    }

    didUpdateTime(e) {
        const video = e.target;
        this.setState({
            currentTime: video.currentTime
        });
    }

    isPlaying(e) {
        console.log('playing');
        const video = e.target;
        this.setState({
            isPlaying: true
        });
    }

    didPause(e) {
        console.log('paused');
        const video = e.target;
        this.setState({
            isPlaying: false
        });
    }

    isWaiting(e) {
        console.log('is waiting');
        const video = e.target;
        this.setState({
            isPlaying: false
        });
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

    // Render

    render() {
        const { item } = this.props;
        const { currentTime, duration, isPlaying } = this.state;
        const timeStr = time => `${padNumber(Math.floor(time/60.0))}:${padNumber(Math.floor(time % 60))}`
        return (
            <div className="video_container">
                <div className="video_player-container">
                    <video id="video_player" className="video_player" autoPlay autoload preload="auto" poster={item.get('firstframe_url')} >
                        <source src={item.get('url')} type="video/mp4" />
                    </video>
                </div>
                <div className="video_bottom">
                    <div className="video_gradient-bottom"></div>
                    <div className="video_progress-bar-container">
                        <div className="video_progress-scrubber"></div>
                        <div className="video_progress-bar">
                            <div className="video_progress-play"></div>
                            <div className="video_progress-buffer"></div>
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
                            <a className="video_control video_control-fullscreen"><Icon type="fullscreen" /></a>
                            <div className="video_control video_control-volume">
                                <span className="video_volume-icon"><Icon type="volume-up" /></span>
                                <div className="video_volume-slider-container">
                                    <div className="video_volume-slider"></div>
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
