import * as React from 'react'
import { connect } from 'react-redux'

import UserEntity, { UserSocial } from '@models/entities/user'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    count: number
    youtube?: UserSocial
    instagram?: UserSocial
    twitter?: UserSocial
}

type Props = ConnectProps

class CreatorSocial extends React.Component<Props> {

    renderField(social: UserSocial) {
        const platform = social.get('platform')
        const url = social.get('channel_url')

        let onClick = () => {
            // todo: log event
            window.open(url, '_blank')
        }
        
        return (
            <li className={`creator-info_social_field creator-info_social_field-${platform}`} onClick={onClick}>
                <div className="creator-info_social_icon" />
                {social.get('channel_name')}
            </li>
        )
    }

    render() {
        const { count, youtube, instagram, twitter } = this.props

        if (count === 0) {
            return null;
        }

        return (
            <div className="creator-info_social">
                <ul className="creator-info_social_fields">
                    { youtube && this.renderField(youtube) }
                    { twitter && this.renderField(twitter) }
                    { instagram && this.renderField(instagram) }
                </ul>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const user = RoomPage.author(state)
    return {
        count: user.get('social').size,
        youtube: user.social('google'),
        instagram: user.social('instagram'),
        twitter: user.social('twitter')
    }
}

export default connect(mapStateToProps)(CreatorSocial)