import React from 'react';
import Video from './Video.react';

class MediaPlayer extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'MediaPlayer';
    }

    render() {

        return (
        <div id="player">
            {this.props.item.type === "video" 
                ? <Video item={this.props.item} />
                : <img src={this.props.item.url} />}
        </div>
        );
    }
}

export default MediaPlayer;
