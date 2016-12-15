import React from 'react'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'

import { goBackward, goForward } from '../../../actions'
import Video from './Video.react'
import Photo from './Photo.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'

class RoomPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.handleBackward = this.handleBackward.bind(this)
        this.handleForward = this.handleForward.bind(this)
    }

    // Lifecycle

    componentDidMount() {
        $(document.body).on('resize', this.resize);
        this.resize();
    }

    componentWillUnmount() {
        $(window).off("resize", this.resize);
    }


    // Resize

    resize() {
        // TODO: rewrite
        if (!$('.player_main').parent().hasClass('.room-card_main')) {
            const roomHeight = parseInt($('.room').css('height'));
            const mediaHeight = Math.min(500, roomHeight-150);
            $('.player_media').height(mediaHeight);
        }

    }


    // Navigation

    handleBackward() {
        const { dispatch, room } = this.props
        dispatch(goBackward(room.get('id')))
    }

    handleForward() {
        const { dispatch, room } = this.props
        dispatch(goForward(room.get('id')))
    }

    // Render

    render() {
        const { room, children } = this.props;

        const item = room.selectedMediaItem()
        const leftDisabledClass = room.indexOfSelectedMediaItem() === 0 ? 'disabled' : '';
        const rightDisabledClass = room.indexOfSelectedMediaItem() === room.mediaItemsSize() - 1 ? 'disabled' : ''; 

        return (
            <div className="player_main">
                { children }
                <div className="player_media">
                    <div className="player_media-inner" id="player_media-inner">
                    { room.mediaItems().size == 0 && !room.get('mediaItemsError') && <Spinner type="large grey"/> }
                    { !item.isEmpty() && (item.isVideo() ? 
                        <Video video={item.video('mp4')} decoration={item.get('decoration')} mediaItemId={item.get('id')} /> : 
                        <Photo image={item.image()} decoration={item.get('decoration')} /> ) 
                    }
                    </div>
                </div>
                <div className="player_navigation">
                    <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={this.handleBackward}><Icon type="arrow-back" /></div>
                    <div className={`player_nav-button player_nav-forward ${rightDisabledClass}`} onClick={this.handleForward}><Icon type="arrow-forward" /></div>
                </div>
            </div>
        );
    }
}

RoomPlayer.propTypes = {
    room: React.PropTypes.object.isRequired
}

export default connect()(RoomPlayer);