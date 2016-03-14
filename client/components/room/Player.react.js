import React from 'react'

import MediaPlayer from './player/MediaPlayer.react'
import Info from './player/Info.react'
import More from './player/More.react'

class Player extends React.Component {

    render() {
        const { stack } = this.props;
        return (
            <section className="player-container">
                <section className="player content" id="player">
                    <MediaPlayer {...this.props} />
                    <Info {...this.props} />
                    <More stack={stack} />
                </section>
            </section>
        );
    }
}

export default Player;