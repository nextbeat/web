import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import Ad from '@models/entities/ad'
import { goBackward, goForward } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'

import RoomPlayer from '../player/RoomPlayer'
import RoomInfo from './main/RoomInfo'
import CreatorInfo from './main/CreatorInfo'
import BannerAd from '../ads/BannerAd'

import { State, DispatchProps } from '@types'
import { isFullScreen } from '@utils'

interface ConnectProps {
    roomId: number
    hid: string
    authorUsername: string
    indexOfSelectedMediaItem: number
    mediaItemsSize: number
    bannerAd: Ad | null

    isLoadedDeep: boolean
    shouldDisplayPrerollAd: boolean

    width: string
    isLoggedIn: boolean
}

type Props = ConnectProps & DispatchProps

interface ComponentState {
    containerPadding: number
    playerWidth: number
    playerHeight: number
    isFullScreen: boolean
}


/* When rendering the room page directly from the
 * server, we want the media player to display at the
 * proper ratio when the page is first presented,
 * before the server HTML is replaced by the React-generated
 * DOM. In order to do this, we insert this function
 * into a script tag so that it runs immediately upon
 * the first DOM load. It's hacky but it works.
 */

function getContainerPadding() {
    var height = function(elem: HTMLElement) { return parseInt(window.getComputedStyle(elem).height || '0', 10) }
    var width = function(elem: HTMLElement) { return parseInt(window.getComputedStyle(elem).width || '0', 10) }

    var container = document.getElementById('room_main') as HTMLElement
    var navigation = document.getElementById('player_navigation') as HTMLElement
    var creatorInfo = document.getElementById('creator-info_main') as HTMLElement

    var currentExtraHeight = height(container) - width(container)*(9/16)
    var neededExtraHeight = creatorInfo.getBoundingClientRect().top - navigation.getBoundingClientRect().top + 66
    neededExtraHeight = Math.min(neededExtraHeight, height(container) - 250)

    var delta = neededExtraHeight - currentExtraHeight

    // Need to decrease height of media player by delta px
    var containerPadding = Math.floor((16/9)*delta/2)

    return containerPadding;
}

function getResizeOnLoadScript() {
    let fnText = `(function() {
        var containerWidth = (${getContainerPadding.toString()})();
        document.getElementById('player').style.padding = '0 ' + containerWidth + 'px';
    })()`
    return { __html: fnText }
}

const fullScreenEvents = 'fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange'

class RoomMain extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props);
        
        this.handleChat = this.handleChat.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        this.state = {
            containerPadding: 0,
            playerWidth: 0,
            playerHeight: 0,
            isFullScreen: false
        }
    }

    componentDidMount() {
        $(document).on('keydown', this.handleKeyDown);
        $(window).on('resize', this.handleResize);       
        $(window).on(fullScreenEvents, this.handleFullScreen);
        this.handleResize();
    }

    componentDidUpdate(prevProps: Props, prevState: ComponentState) {
        if (this.props.isLoggedIn !== prevProps.isLoggedIn) {
            // recalculate sizes to account for sidebar
            this.handleResize();
        }

        if (prevState.containerPadding !== this.state.containerPadding || prevState.isFullScreen !== this.state.isFullScreen) {
            this.setState({
                playerWidth: parseInt($('.player_media-inner').css('width')),
                playerHeight: parseInt($('.player_media-inner').css('height'))
            })
        }
    }

    componentWillUnmount() {
        $(window).off('resize', this.handleResize);
        $(document).off('keydown', this.handleKeyDown);
        $(window).off(fullScreenEvents, this.handleFullScreen);
    }

    handleFullScreen() {
        this.setState({ isFullScreen: isFullScreen() })
    }

    handleResize() {
        let containerPadding = getContainerPadding()
        this.setState({ 
            containerPadding          
        })
    }

    handleKeyDown(e: JQueryKeyEventObject) {
        const { dispatch, roomId, indexOfSelectedMediaItem, mediaItemsSize, shouldDisplayPrerollAd} = this.props 

        if (['textarea', 'input'].indexOf((e.target as any).tagName.toLowerCase()) !== -1) {
            // don't navigate if inside text field
            return;
        }

        // Disable navigation if ad is playing
        if (shouldDisplayPrerollAd) {
            return; 
        }

        if (e.keyCode === 37) { // left arrow
            if (indexOfSelectedMediaItem !== 0) {
                $('.player_nav-backward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-backward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goBackward(roomId));  
        } else if (e.keyCode === 39) { // right arrow
            if (indexOfSelectedMediaItem !== mediaItemsSize-1) {
                $('.player_nav-forward').removeClass('player_nav-button-flash');
                process.nextTick(() => {
                    $('.player_nav-forward').addClass('player_nav-button-flash');
                })
            }
            dispatch(goForward(roomId));
        }

    }

    handleChat() {
        this.props.dispatch(selectDetailSection('chat'));
    }

    render() {
        const { roomId, isLoadedDeep, hid, width,
                authorUsername, bannerAd } = this.props;

        const { containerPadding, playerWidth, playerHeight } = this.state;

        return (
            <section className="room_main" id="room_main">
                <section className="player content" id="player" style={{ padding: containerPadding > 0 ? `0 ${containerPadding}px`: 'auto' }}>
                    {/* we only display once the room has loaded */}
                    { isLoadedDeep &&
                    <div className="player_inner">
                        { bannerAd && <BannerAd ad={bannerAd} roomId={roomId} />}
                        <RoomPlayer roomId={roomId} playerWidth={playerWidth} playerHeight={playerHeight} />
                        <RoomInfo /> 
                        <CreatorInfo />
                    </div>
                    }
                </section>
                <script dangerouslySetInnerHTML={getResizeOnLoadScript()} />
            </section>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    const roomId = RoomPage.get(state, 'id')
    return {
        roomId,
        hid: RoomPage.entity(state).get('hid'),
        authorUsername: RoomPage.entity(state).author().get('username'),
        indexOfSelectedMediaItem: RoomPage.indexOfSelectedMediaItem(state),
        mediaItemsSize: RoomPage.mediaItemsSize(state),
        bannerAd: RoomPage.ad(state, 'banner'),

        isLoadedDeep: RoomPage.isLoadedDeep(state),
        shouldDisplayPrerollAd: RoomPage.shouldDisplayPrerollAd(state),

        width: App.get(state, 'width'),
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

export default connect(mapStateToProps)(RoomMain);