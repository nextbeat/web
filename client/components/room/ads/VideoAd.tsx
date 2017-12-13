import * as React from 'react'
import { connect } from 'react-redux'

import Video from '@components/room/player/Video'

import { didFinishVideoAd } from '@actions/room'
import Room from '@models/state/room'
import Ad from '@models/entities/ad'
import { State, DispatchProps } from '@types'

interface OwnProps {
    ad: Ad
    roomId: number
    containerWidth: number
    containerHeight: number
}

interface ConnectProps {
    authorUsername: string
}

type Props = OwnProps & ConnectProps & DispatchProps

class VideoAd extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.didEnd = this.didEnd.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        video.addEventListener('ended', this.didEnd);
    }

    componentWillUnmount() {
        const video = document.getElementById('video_player') as HTMLVideoElement;
        video.removeEventListener('ended', this.didEnd);
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

    render() {
        const { ad, authorUsername } = this.props
        const clickableClass = ad.get('link_url') ? "ad-video-clickable" : ""
        return (
            <div className={`ad-video ${clickableClass}`} onClick={this.handleClick}>
                <Video video={ad.video()} {...this.props} isScrubbable={false} />
                <div className="ad-video_sponsor">This ad sponsors { authorUsername }</div>
            </div>
        )
    }

}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        authorUsername: Room.author(state, ownProps.roomId).get('username')
    }
}
export default connect(mapStateToProps)(VideoAd);