import React from 'react';

class Video extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Video';
    }

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            const player = $("#video-player");
            player.load();
        }
    }

    render() {
        const { item } = this.props;
        return (
            <video id="video-player" className="video-js vjs-default-skin" controls autoPlay autoload preload="auto" poster={item.get('firstframe_url')} >
                <source src={item.get('url')} type="video/mp4" />
            </video>
        );
    }
}

export default Video;
