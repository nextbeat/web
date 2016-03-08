import React from 'react'

import MediaPlayer from './player/MediaPlayer.react'
import Info from './player/Info.react'

class Player extends React.Component {

    render() {
        const { stack } = this.props;
        return (
            <section className="player-container">
                <section className="player">
                    <MediaPlayer {...this.props} />
                    <Info {...this.props} />
                </section>
            </section>
        );
    }
}

export default Player;