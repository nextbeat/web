import React from 'react';

class CounterInner extends React.Component {

    render() {
        const { room } = this.props;
        if (room.mediaItemsSize() > 0) {
            return (
                <div>
                    <span className="selected">{ room.indexOfSelectedMediaItem() + 1 }</span><span className="player_counter-separator">/</span>{ room.mediaItemsSize() } 
                </div>
            )
        } else {
            return null;
        }
    }
}

export default CounterInner;
