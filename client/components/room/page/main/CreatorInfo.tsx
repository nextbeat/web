import * as React from 'react'
import { connect } from 'react-redux'

import CreatorSocial from './CreatorSocial'
import Icon from '@components/shared/Icon'
import Subscribe from '@components/shared/Subscribe'

import UserEntity from '@models/entities/user'
import Room from '@models/state/room'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'
import { baseUrl, secureUrl } from '@utils'

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

        let profpicUrl = author.thumbnail('small').get('url')
        let profpicStyle = profpicUrl ? { backgroundImage: `url(${secureUrl(profpicUrl)})`} : {}

        return (
            <section className="creator-info">
                <div className="creator-info_left">
                    <div className="creator-info_profpic" style={profpicStyle}>{ !profpicUrl && <Icon type="person" /> }</div>
                </div>
                <div className="creator-info_main">
                    <div className="creator-info_username">{author.get('username')}</div>
                    <Subscribe user={author} />
                    <CreatorSocial />
                </div>
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
