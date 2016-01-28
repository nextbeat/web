import React from 'react';

class Video extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Video';
    }

    render() {
        return (
            <video id="video-player" className="video-js vjs-default-skin" controls autoplay autoload preload="auto" poster={this.props.item.firstframe_url} >
                <source src={this.props.item.url} type="video/mp4" />
            </video>
        );
    }
}

export default Video;
