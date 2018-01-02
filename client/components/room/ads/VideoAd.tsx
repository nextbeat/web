import * as React from 'react'
import { connect } from 'react-redux'

import Video from '@components/room/player/Video'

import { didFinishVideoAd } from '@actions/room'
import Room from '@models/state/room'
import App from '@models/state/app'
import Ad from '@models/entities/ad'
import { State, DispatchProps } from '@types'

interface OwnProps {
    ad: Ad
    posterUrl?: string // If autoplay is not set, this image will be displayed before the video plays
    shouldAutoplay?: boolean
    roomId: number
    containerWidth: number
    containerHeight: number
}

interface ConnectProps {
    authorUsername: string
    isIOS: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

interface ComponentState {
    hasPlayed: boolean
}

class VideoAd extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.didEnd = this.didEnd.bind(this)
        this.isPlaying = this.isPlaying.bind(this)

        this.handleClick = this.handleClick.bind(this)

        this.state = {
            hasPlayed: false
        }
    }

    componentDidMount() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        video.addEventListener('ended', this.didEnd);
        video.addEventListener('playing', this.isPlaying);
    }

    componentWillUnmount() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        video.removeEventListener('ended', this.didEnd);
        video.removeEventListener('playing', this.isPlaying);
    }

    handleClick() {
        const { ad } = this.props
        if (!ad.get('link_url')) {
            return
        }

        window.open(ad.get('link_url'), '_blank')
    }

    didEnd() {
        const { roomId, ad, dispatch } = this.props
        dispatch(didFinishVideoAd(roomId, ad.get('id')));
    }

    isPlaying() {
        this.setState({ hasPlayed: true })
    }

    render() {
        const { ad, authorUsername, shouldAutoplay, isIOS } = this.props
        const { hasPlayed } = this.state
        const clickableClass = ad.get('link_url') ? "ad-video-clickable" : ""

        // If the video is NOT autoplaying (i.e. if !shouldAutoplay or isIOS)
        // then we should not display the ad text until the ad has started
        // to play, as we will be displaying the selected item's poster image
        // instead of the ad's poster image
        const isDisplayingAdText = !((!shouldAutoplay || isIOS) && !hasPlayed)

        return (
            <div className={`ad-video ${clickableClass}`} onClick={this.handleClick}>
                <Video video={ad.video()} {...this.props} isScrubbable={false} />
                { isDisplayingAdText && <div className="ad-video_sponsor">This ad sponsors { authorUsername }</div> }
            </div>
        )
    }

}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        authorUsername: Room.author(state, ownProps.roomId).get('username'),
        isIOS: App.isIOS(state)
    }
}
export default connect(mapStateToProps)(VideoAd);