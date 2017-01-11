import React from 'react';

class CounterInner extends React.Component {

    render() {
        const { room } = this.props;
        if (room.mediaItemsSize() > 0) {
            var index = room.indexOfSelectedMediaItem() + 1;
            var total = room.mediaItemsSize()
        } else {
            var index = 1
            var total = room.get('mediaitem_count')
        }

        return (
            <div>
                <span className="selected">{index}</span><span className="player_counter-separator">/</span>{total} 
            </div>
        )
    }
}

export default CounterInner;
