import React from 'react';
import Video from './Video.react';

class MediaPlayer extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'MediaPlayer';
    }

    render() {
        const { stack, handleForward, handleBackward } = this.props;
        const item = stack.selectedMediaItem()
        return (
        <div className="player_main">
            <div className="player_media">
                {item.get('type') === "video" 
                    ? <Video item={item} />
                    : <img src={item.get('url')} />}
            </div>
            <div className="player_navigation">
                <div className="player_nav-button player_nav-backward" onClick={handleBackward}></div>
                <div className="player_nav-button player_nav-forward" onClick={handleForward}></div>
            </div>
        </div>
        );
    }
}

export default MediaPlayer;
