import React from 'react'

import MediaPlayer from './player/MediaPlayer.react'
import Info from './player/Info.react'
import More from './player/More.react'
import Spinner from '../shared/Spinner.react'

class Player extends React.Component {

    render() {
        const { stack } = this.props;
        return (
            <section className="player-container">
                <section className="player content" id="player">
                    {/* we only display once the stack has loaded */}
                    { stack.isFetchingDeep() &&  <Spinner type="large grey player" />}
                    { stack.get('error') && <p>Could not load room.</p>}
                    { !stack.isFetchingDeep() && !stack.get('error') &&
                    <div>
                        <MediaPlayer {...this.props} />
                        <Info {...this.props} />
                        <More stack={stack} />
                    </div>
                    }
                </section>
            </section>
        );
    }
}

export default Player;