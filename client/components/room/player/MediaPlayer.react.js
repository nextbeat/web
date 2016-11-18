import React from 'react'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'

import { selectDetailSection } from '../../../actions'

import Video from './Video.react'
import Photo from './Photo.react'
import Counter from './Counter.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'


class MediaPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChat = this.handleChat.bind(this);
        this.handleActivity = this.handleActivity.bind(this);
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

    handleChat() {
        this.props.dispatch(selectDetailSection('chat'))
    }

    handleActivity() {
        this.props.dispatch(selectDetailSection('activity'))
    }


    // Render

    render() {
        const { stack, app, handleForward, handleBackward } = this.props;

        const item = stack.selectedMediaItem()
        const leftDisabledClass = stack.indexOfSelectedMediaItem() === 0 ? 'disabled' : '';
        const rightDisabledClass = stack.indexOfSelectedMediaItem() === stack.mediaItemsSize()-1 ? 'disabled' : ''; 

        const activeDetailButtons = app.get('width') === 'small' || app.get('width') === 'medium'

        return (
        <div className="player_main">
            <Counter stack={stack} active={activeDetailButtons} handleClick={this.handleActivity} />
            { activeDetailButtons && <div className="player_hover-button player_chat-button" onClick={this.handleChat}>Chat</div> }
            <div className="player_media">
                <div className="player_media-inner" id="player_media-inner">
                { stack.mediaItems().size == 0 && !stack.get('mediaItemsError') && <Spinner type="large grey"/> }
                { !item.isEmpty() && (item.isVideo() ? 
                    <Video video={item.video('mp4')} decoration={item.get('decoration')} mediaItemId={item.get('id')} /> : 
                    <Photo image={item.image()} decoration={item.get('decoration')} /> ) 
                }
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

export default connect()(MediaPlayer);
