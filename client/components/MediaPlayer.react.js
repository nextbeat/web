import React from 'react';
import Video from './Video.react';

class MediaPlayer extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'MediaPlayer';
    }

    render() {
        const item = this.props.item || {};
        return (
        <div id="player">
            {item.get('type') === "video" 
                ? <Video item={item} />
                : <img src={item.get('url')} />}
        </div>
        );
    }
}

export default MediaPlayer;
