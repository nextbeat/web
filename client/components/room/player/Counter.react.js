import React from 'react';

class Counter extends React.Component {

    render() {
        const { stack, active, handleClick } = this.props;

        let divProps = active ? { onClick: handleClick } : {}
        let divActiveClass = active ? 'active' : ''
        return (
            <div className={`player_hover-button player_counter ${divActiveClass}`} {...divProps}>
                { stack.mediaItemsSize() > 0 && 
                    <div>
                        <span className="selected">{ stack.indexOfSelectedMediaItem() + 1 }</span><span className="player_counter-separator">/</span>{ stack.mediaItemsSize() } 
                    </div>
                }
            </div>
        )
    }
}

export default Counter;
