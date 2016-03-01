import React from 'react'

import MediaPlayer from './player/MediaPlayer.react'
import Info from './player/Info.react'

class Player extends React.Component {

    constructor(props) {
        super(props);

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // Lifecycle

    componentDidMount() {
        $(document.body).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document.body).off('keydown', this.handleKeyDown);
    }

    // Navigation

    handleKeyDown(e) {
        if (e.keyCode === 37) { // left arrow
            this.props.handleBackward();
        } else if (e.keyCode === 39) {
            this.props.handleForward(); // right arrow
        }
    }

    // Render

    render() {
        const { stack } = this.props;
        return (
            <section className="player-container">
                <section className="player">
                    <Info stack={stack} />
                    <MediaPlayer {...this.props} />
                </section>
            </section>
        );
    }
}

export default Player;