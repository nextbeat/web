import React from 'react'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'

import { goBackward, goForward } from '../../../actions'
import Video from './Video.react'
import Image from './Image.react'
import Icon from '../../shared/Icon.react'
import Spinner from '../../shared/Spinner.react'
import CounterInner from '../counter/CounterInner.react'

class RoomPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.handleBackward = this.handleBackward.bind(this)
        this.handleForward = this.handleForward.bind(this)
        this.resize = this.resize.bind(this)

        this.state = {
            playerWidth: 0,
            playerHeight: 0
        }
    }

    // Lifecycle

    componentDidMount() {
        $(window).on('resize', this.resize);

        this.setState({
            playerWidth: parseInt($('.player_main').css('width')),
            playerHeight: parseInt($('.player_main').css('height'))
        });

        this.resize();
    }

    componentWillUnmount() {
        $(window).off("resize", this.resize);
    }


    // Resize

    resize() {
        // TODO: handle room card better
        if (!$('.player_main').parent().hasClass('.room-card_main')) {
            const playerWidth = parseInt($('.player_main').css('width'));
            const playerHeight = Math.min(500, Math.floor(playerWidth * 9 / 16));
            this.setState({
                playerWidth,
                playerHeight
            })
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
        const { room, children, shouldAutoplayVideo } = this.props;
        const { playerWidth, playerHeight } = this.state

        const item = room.selectedMediaItem()
        const leftDisabledClass = room.indexOfSelectedMediaItem() === 0 ? 'disabled' : '';
        const rightDisabledClass = room.indexOfSelectedMediaItem() === room.mediaItemsSize() - 1 ? 'disabled' : ''; 

        let containerProps = {
            containerWidth: playerWidth,
            containerHeight: playerHeight
        }

        return (
            <div className="player_main">
                { children }
                <div className="player_media" style={{ height: `${playerHeight}px` }}>
                    <div className="player_media-inner" id="player_media-inner">
                    { room.mediaItems().size == 0 && !room.get('mediaItemsError') && <Spinner type="large grey"/> }
                    { !item.isEmpty() && (item.isVideo() ? 
                        <Video 
                            video={item.video('mp4')} 
                            decoration={item.get('decoration')} 
                            room={room} 
                            autoplay={shouldAutoplayVideo} 
                            {...containerProps} /> : 
                        <Image 
                            image={item.image()} 
                            decoration={item.get('decoration')} 
                            {...containerProps} /> ) 
                    }
                    </div>
                </div>
                <div className="player_navigation">
                    <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={this.handleBackward}><Icon type="arrow-back" /></div>
                    <div className="player_nav-counter"><CounterInner room={room} /></div>
                    <div className={`player_nav-button player_nav-forward ${rightDisabledClass}`} onClick={this.handleForward}><Icon type="arrow-forward" /></div>
                </div>
            </div>
        );
    }
}

RoomPlayer.propTypes = {
    room: React.PropTypes.object.isRequired,
    shouldAutoplayVideo: React.PropTypes.bool.isRequired,


}

RoomPlayer.defaultProps = {
    shouldAutoplayVideo: true
}

export default connect()(RoomPlayer);
