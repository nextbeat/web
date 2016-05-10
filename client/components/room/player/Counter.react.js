import React from 'react';

class Counter extends React.Component {

    render() {
        const { stack } = this.props;
        return (
            <div className="room_counter">
                { stack.mediaItems().size > 0 && 
                    <div>
                        <span className="selected">{ stack.indexOfSelectedMediaItem() + 1 }</span><span className="room_counter-separator">/</span>{ stack.mediaItems().size } 
                    </div>
                }
            </div>
        )
    }
}

export default Counter;
