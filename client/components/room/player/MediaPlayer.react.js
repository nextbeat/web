import React from 'react'
import Video from './Video.react'
import Counter from './Counter.react'
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
        $(window).resize(this.resize)
        this.resize();
    }

    componentWillUnmount() {
        $(window).off("resize", this.resize);
        $(document.body).off('keydown', this.handleKeyDown);
    }

    // Resize

    resize() {
        const roomHeight = parseInt($('.room').css('height'));
        const mediaHeight = Math.min(550, roomHeight-60);
        // const mediaWidth = mediaHeight*9/16;
        $('.player_media').height(mediaHeight);
        // $('.player_media').width(mediaWidth);
    }

    // Navigation

    handleKeyDown(e) {
        const { stack, handleBackward, handleForward } = this.props;
        if (e.keyCode === 37) { // left arrow
            if (stack.indexOfSelectedMediaItem() !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            handleBackward();
        } else if (e.keyCode === 39) {
            if (stack.indexOfSelectedMediaItem() !== stack.mediaItems().size-1) {
                $('.player_nav-forward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-forward').addClass('player_nav-button-flash');
                })
            }
            handleForward(); // right arrow
        }
    }


    render() {
        const { stack, handleForward, handleBackward } = this.props;
        const item = stack.selectedMediaItem()
        const leftDisabledClass = stack.indexOfSelectedMediaItem() === 0 ? 'disabled' : '';
        const rightDisabledClass = stack.indexOfSelectedMediaItem() === stack.mediaItems().size-1 ? 'disabled' : ''; 
        return (
        <div className="player_main">
            <Counter stack={stack} />
            <div className="player_media">
                { stack.mediaItems().size == 0 && !stack.get('mediaItemsError') && <Spinner type="large grey"/> }
                { !item.isEmpty() && (item.get('type') === "video" 
                    ? <Video item={item} />
                    : <div className="player_photo" style={{backgroundImage: `url(${item.get('url')})`}}></div>) }
            </div>
            <div className="player_navigation">
                <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={handleBackward}><Icon type="arrow-back" /></div>
                <div className={`player_nav-button player_nav-forward ${rightDisabledClass}`} onClick={handleForward}><Icon type="arrow-forward" /></div>
            </div>
        </div>
        );
    }
}

export default MediaPlayer;
