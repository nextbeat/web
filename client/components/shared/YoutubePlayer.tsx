import * as React from 'react'
import Player from 'youtube-player'

enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    VIDEO_CUED = 5
}

interface PlayerVars {
    autoplay: 0 | 1
    cc_load_policy: 1
    color: 'red' | 'white'
    controls: 0 | 1 | 2
    disablekb: 0 | 1
    enablejsapi: 0 | 1
    end: number
    fs: 0 | 1
    hl: string
    iv_load_policy: 1 | 3
    list: string
    listType: 'playlist' | 'search' | 'user_uploads'
    loop: 0 | 1
    modestbranding: 0 | 1
    origin: string
    playlist: string
    playsinline: 0 | 1
    rel: 0 | 1
    showinfo: 0 | 1
    start: number
}

interface PlayerOpts {
    width: string
    height: string
    playerVars: Partial<PlayerVars>
}

interface Props {
    videoId: string
    opts?: PlayerOpts
    onPlayerStateChange?: (player: any, state: PlayerState) => void

    className?: string
}

class YoutubePlayer extends React.Component<Props> {

    private playerRef: HTMLElement
    private player: any

    static defaultProps: Partial<Props> = {
        onPlayerStateChange: () => {}
    }

    constructor(props: Props) {
        super(props)
    }

    componentDidMount() {
        const { opts, videoId, onPlayerStateChange } = this.props

        this.player = Player(this.playerRef, {
            ...opts,
            videoId
        })

        this.player.on('stateChange', (event: any) => {
            if (onPlayerStateChange) {
                onPlayerStateChange(event.target, event.data)
            }
        })
    }

    componentWillUnmount() {
        this.player.destroy();
    }

    render() {
        const className = this.props.className || ''
        return (
            <div className={className}>
                <div className="youtube-player_container">
                    <div className="youtube-player_inner">
                        <div ref={(c) => { if (c) this.playerRef = c }} />
                    </div>
                </div>
            </div>
        )
    }

}

export default YoutubePlayer;