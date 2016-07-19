import React from 'react'
import { fromJS } from 'immutable'

import Video from './Video.react'
import Photo from './Photo.react'
import Counter from './Counter.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'

const SAMPLE_PHOTO = fromJS({ 
    url: 'http://localhost:3000/images/p9.jpg',
    decoration: {
        caption_text: 'Foobar',
        caption_offset: 0
    } 
})
const SAMPLE_VIDEO = fromJS({ 
    url: 'http://localhost:3000/images/ot5.m4v', 
    firstframe_url: 'http://localhost:3000/images/p9.jpg',
    decoration: {
        caption_text: 'Foobar',
        caption_offset: 0
    } 
})

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
        const mediaHeight = Math.min(500, roomHeight-150);
        $('.player_media').height(mediaHeight);
    }

    // Navigation

    handleKeyDown(e) {
        const { stack, handleBackward, handleForward } = this.props;

        if (['textarea', 'input'].indexOf(e.target.tagName.toLowerCase()) !== -1) {
            // don't navigate if inside text field
            return;
        }

        if (e.keyCode === 37) { // left arrow
            if (stack.indexOfSelectedMediaItem() !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            handleBackward();
        } else if (e.keyCode === 39) {
            if (stack.indexOfSelectedMediaItem() !== stack.mediaItemsSize()-1) {
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
        const rightDisabledClass = stack.indexOfSelectedMediaItem() === stack.mediaItemsSize()-1 ? 'disabled' : ''; 
        return (
        <div className="player_main">
            <Counter stack={stack} />
            {/* <div className="player_hover-button player_chat-button" onClick={this.handleChat}>Chat</div> */}
            <div className="player_media">
                <div className="player_media-inner" id="player_media-inner">
                { stack.mediaItems().size == 0 && !stack.get('mediaItemsError') && <Spinner type="large grey"/> }
                { <Video item={SAMPLE_VIDEO} processed={false} /> }
                { /* !item.isEmpty() && (item.get('type') === "video" ? <Video item={item} /> : <Photo item={item} processed={item.get('processed', false)} /> ) */}
                </div>
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
