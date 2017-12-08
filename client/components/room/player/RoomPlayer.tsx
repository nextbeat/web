import * as PropTypes from 'prop-types'
import * as React from 'react'
import { List, fromJS } from 'immutable'
import { connect } from 'react-redux'

import Video from './Video'
import Image from './Image'
import ItemReference from './ItemReference'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import CounterInner from '@components/room/counter/CounterInner'
import VideoAd from '@components/room/ads/VideoAd'

import { goBackward, goForward } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'
import Room from '@models/state/room'
import MediaItem from '@models/entities/mediaItem'
import Ad from '@models/entities/ad'
import { State, DispatchProps } from '@types'

interface OwnProps {
    roomId: number
    isRoomCard?: boolean
    shouldAutoplayVideo?: boolean
}

interface ConnectProps {
    hid: string
    mediaItemsSize: number
    selectedMediaItem: MediaItem
    indexOfSelectedMediaItem: number

    prerollAd: Ad | null
    hasPlayedPrerollAd: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps 

interface RoomPlayerState {
    playerWidth: number
    playerHeight: number
}

/* When rendering the room page directly from the
 * server, we want the media player to display at the
 * proper ratio when the page is first presented,
 * before the server HTML is replaced by the React-generated
 * DOM. In order to do this, we insert this function
 * into a script tag so that it runs immediately upon
 * the first DOM load. It's hacky but it works.
 */
function resizePlayerOnLoad() {
    var elems = document.getElementsByClassName('player_media')
    if  (elems.length > 0) {
        var player = elems[0] as HTMLElement
        var width = parseInt(window.getComputedStyle(player).width || '0', 10)
        var height = Math.min(500, Math.floor(width * 9 / 16))
        player.style.height = `${height}px`
    }
}

function getScript(fn: Function) {
    let fnText = `(${fn.toString()})()`
    return { __html: fnText }
}

class RoomPlayer extends React.Component<Props, RoomPlayerState> {

    static defaultProps = {
        isRoomCard: false,
        shouldAutoplayVideo: true
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.handleBackward = this.handleBackward.bind(this)
        this.handleForward = this.handleForward.bind(this)
        this.handleCounterClick = this.handleCounterClick.bind(this)
        
        this.resize = this.resize.bind(this)

        this.renderItem = this.renderItem.bind(this)

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
        const playerWidth = parseInt($('.player_main').css('width'));
        const playerHeight = Math.min(500, Math.floor(playerWidth * 9 / 16))

        this.setState({
            playerWidth,
            playerHeight
        })
    }


    // Navigation

    handleBackward() {
        const { dispatch, roomId } = this.props
        dispatch(goBackward(roomId))
    }

    handleForward() {
        const { dispatch, roomId } = this.props
        dispatch(goForward(roomId))
    }

    handleCounterClick() {
        const { indexOfSelectedMediaItem, hid, isRoomCard, dispatch } = this.props 
        const { router } = this.context

        if (isRoomCard) {
            router.push({ pathname: `/r/${hid}/${indexOfSelectedMediaItem}`, query: { detail: 'activity' }})
        } else {
            dispatch(selectDetailSection('activity'))
        }
    }

    // Render

    renderItem() {
        const { selectedMediaItem: item, roomId, shouldAutoplayVideo  } = this.props
        const { playerWidth, playerHeight } = this.state

        let containerProps = {
            containerWidth: playerWidth,
            containerHeight: playerHeight
        }

        return (
            <div style={{ width: '100%', height: '100%' }}>
                { item.hasReference() && <ItemReference roomId={roomId} {...containerProps} /> }
                { !item.isEmpty() && (item.isVideo() ? 
                    <Video 
                        video={item.video('mp4')}
                        alternateVideo={item.video('mp4')}
                        decoration={item.get('decoration')} 
                        roomId={roomId} 
                        autoplay={shouldAutoplayVideo} 
                        {...containerProps} /> : 
                    <Image 
                        image={item.image()} 
                        decoration={item.get('decoration')} 
                        {...containerProps} /> ) 
                }
            </div>
        )
    }

    render() {
        const { children, roomId, mediaItemsSize, 
                indexOfSelectedMediaItem: index,
                prerollAd, hasPlayedPrerollAd } = this.props;
        const { playerWidth, playerHeight } = this.state

        const leftDisabledClass = index === 0 || index === -1 ? 'disabled' : '';
        const rightDisabledClass = index === mediaItemsSize - 1 || index === -1
         ? 'disabled' : ''; 

        let containerProps = {
            containerWidth: playerWidth,
            containerHeight: playerHeight
        }

        let playerStyle = playerHeight > 0 ? { height: `${playerHeight}px` } : {}

        return (
            <div className="player_main">
                { children }
                <div className="player_media" style={playerStyle}>
                    <div className="player_media-inner" id="player_media-inner">
                        { prerollAd && !hasPlayedPrerollAd ? 
                            <VideoAd ad={prerollAd} roomId={roomId} {...containerProps} /> :
                            this.renderItem()
                        }
                    </div>
                </div>
                <div className="player_navigation">
                    <div style={{ display: 'flex', width: '100%', alignItems: 'stretch' }}>
                        <div className={`player_nav-button player_nav-backward ${leftDisabledClass}`} onClick={this.handleBackward}><Icon type="arrow-back" /></div>
                        <div className="player_nav-counter" onClick={this.handleCounterClick}><CounterInner roomId={roomId} /></div>
                        <div className={`player_nav-button player_nav-forward ${rightDisabledClass}`} onClick={this.handleForward}><Icon type="arrow-forward" /></div>
                    </div>
                </div>
                <script dangerouslySetInnerHTML={getScript(resizePlayerOnLoad)} />
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        hid: Room.entity(state, ownProps.roomId).get('hid'),
        mediaItemsSize: Room.mediaItemsSize(state, ownProps.roomId),
        selectedMediaItem: Room.selectedMediaItem(state, ownProps.roomId),
        indexOfSelectedMediaItem: Room.indexOfSelectedMediaItem(state, ownProps.roomId),
        prerollAd: Room.ad(state, ownProps.roomId, 'preroll'),
        hasPlayedPrerollAd: Room.get(state, ownProps.roomId, 'hasPlayedPrerollAd')
    }
}

export default connect(mapStateToProps)(RoomPlayer);
