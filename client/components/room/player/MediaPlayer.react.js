import React from 'react'
import Video from './Video.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'

class MediaPlayer extends React.Component {

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


    render() {
        const { stack, handleForward, handleBackward } = this.props;
        const item = stack.selectedMediaItem()
        return (
        <div className="player_main">
            { stack.mediaItems().size > 0 &&
            <div className="player_counter">
                <span className="selected">{ stack.indexOfSelectedMediaItem() + 1 }</span> &#8725; { stack.mediaItems().size } 
            </div>
            }
            <div className="player_media">
                {stack.mediaItems().size == 0 && !stack.get('mediaItemsError') && <Spinner type="large grey"/>}
                {!item.isEmpty() && (item.get('type') === "video" 
                    ? <Video item={item} />
                    : <img src={item.get('url')} />)}
            </div>
            <div className="player_navigation">
                <div className="player_nav-button player_nav-backward" onClick={handleBackward}><Icon type={"chevron-left"} /></div>
                <div className="player_nav-button player_nav-forward" onClick={handleForward}><Icon type={"chevron-right"} /></div>
            </div>
        </div>
        );
    }
}

export default MediaPlayer;
