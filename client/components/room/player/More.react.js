import React from 'react';
import LargeStackItem from '../../shared/LargeStackItem.react'

class More extends React.Component {

    render() {
        return (
            <div className="player_more">
                <div className="player_header">MORE LIKE THIS</div>
                <div className="player_rooms">
                { this.props.stack.moreStacks().map(stack => <LargeStackItem key={`m${stack.get('id')}`} stack={stack} />) }
                </div>
            </div>
        );
    }
}

export default More;
