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
        <div id="media-player">
            <a className="nav-button" onClick={handleBackward} href="#">&lt;</a>
            <div>
                {item.get('type') === "video" 
                    ? <Video item={item} />
                    : <img src={item.get('url')} />}
            </div>
            <a className="nav-button" onClick={handleForward} href="#">&gt;</a>
        </div>
        );
    }
}

export default MediaPlayer;
