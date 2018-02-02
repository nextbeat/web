import * as React from 'react'
import { connect } from 'react-redux'

import App from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import Ad from '@models/entities/ad'
import { goBackward, goForward } from '@actions/room'
import { selectDetailSection } from '@actions/pages/room'

import RoomPlayer from '../player/RoomPlayer'
import Counter from '../counter/Counter'
import ActivityCounter from '../counter/ActivityCounter'
import SmallChat from './chat/SmallChat'
import Info from './main/Info'
import More from './main/More'
import BannerAd from '../ads/BannerAd'
import AppBanner from '@components/shared/AppBanner'

import { State, DispatchProps } from '@types'

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
}

type Props = ConnectProps & DispatchProps

class RoomMain extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        
        this.handleChat = this.handleChat.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        $(document).on('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        $(document).off('keydown', this.handleKeyDown);
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

        return (
            <section className="player-container">
                <section className="player content" id="player">
                    <AppBanner url={`nextbeat://rooms/${hid}`} />
                    {/* we only display once the room has loaded */}
                    { isLoadedDeep &&
                    <div className="player_inner">
                        { bannerAd && <BannerAd ad={bannerAd} roomId={roomId} />}
                        <RoomPlayer roomId={roomId} />
                        <SmallChat />
                        <Info />
                        <More />
                    </div>
                    }
                </section>
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

        width: App.get(state, 'width')
    }
}

export default connect(mapStateToProps)(RoomMain);