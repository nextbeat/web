import * as React from 'react'
import { connect } from 'react-redux'

import YoutubePlayer from '@components/shared/YoutubePlayer'
import TwitterTimeline from '@components/shared/TwitterTimeline'

import UserEntity from '@models/entities/user'
import Room from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'
import { baseUrl } from '@utils'

interface ConnectProps {
    id: number
    author: UserEntity
}

type Props = ConnectProps & DispatchProps

class CreatorInfo extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
    }

    render() {
        const { id, author } = this.props 

        const youtubeOpts = {
            width: '100%',
            height: '100%',
            playerVars: {
                disablekb: 1 as 1, // lol typescript
                enablejsapi: 1 as 1,
                origin: baseUrl(),
                playsinline: 1 as 1,
                rel: 0 as 0,
            }
        }

        return (
            <section className="creator-info">
                {/* <YoutubePlayer className="creator-info_youtube" videoId="PHLY4a5fTjU" opts={youtubeOpts}/> */}
                <TwitterTimeline className="creator-info_twitter" username="safiyajn" />
            </section>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const id = RoomPage.get(state, 'id')
    return {
        id,
        author: Room.author(state, id),
    }
}

export default connect(mapStateToProps)(CreatorInfo);
