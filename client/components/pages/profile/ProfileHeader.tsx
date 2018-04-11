import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { List } from 'immutable'

import Subscribe from '@components/shared/Subscribe'
import Icon from '@components/shared/Icon'

import CurrentUser from '@models/state/currentUser'
import App from '@models/state/app'
import User from '@models/entities/user'
import { secureUrl } from '@utils'
import { State } from '@types'

interface OwnProps {
    user: User
}

interface ConnectProps {
    isCurrentUser: boolean
}

type Props = OwnProps & ConnectProps

class ProfileHeader extends React.Component<Props> {

    renderBio(user: User) {
        let userHasInfo = user.get('website_url') || user.get('full_name') || user.get('description')
        let secureWebsiteUrl = secureUrl(user.get('website_url'))

        if (!userHasInfo) {
            return null;
        }

        return (
            <div className="profile_bio profile_info-item">
                { user.get('full_name') && <span className="profile_full-name">{user.get('full_name')}</span> }
                { user.get('description') && <span className="profile_description">{user.get('description')}</span> }
                { user.get('website_url') && <a className="profile_website" href={secureWebsiteUrl}>{user.get('website_url')}</a>}
            </div>
        )
    }

    renderSocial(user: User) {
        if (user.get('social', List()).size === 0) {
            return null
        }

        let socialItem = (platform: string) => 
            <a 
                className={`profile_social_item profile_social_item-${platform}`} 
                href={user.social(platform)!.get('channel_url')} 
                target="_blank" 
                rel="nofollow" 
            />

        return (
            <div className="profile_social profile_info-item">
                { user.social('google') && socialItem('google') }
                { user.social('twitter') && socialItem('twitter')}
            </div>
        )
    }

    render() {
        const { user, isCurrentUser } = this.props 

        let profpicUrl = user.thumbnail('large').get('url')
        let profpicStyle = { backgroundImage: profpicUrl ? `url(${profpicUrl})` : ''}

        let coverUrl = user.coverImage('large').get('url')
        let coverStyle: any = {}
        if (coverUrl) {
            coverStyle = {
                background: `url(${coverUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }
        }

        return (
            <div className="profile_header">
                <div className="profile_cover" style={coverStyle}>
                </div>
                <div className="profile_user">
                    <div className="profile_profpic" style={profpicStyle}>
                        { !profpicUrl && <Icon type="person" /> }
                    </div>

                    <div className="profile_info">
                        <div className="profile_username profile_info-item">
                            { user.get('username') } { isCurrentUser ? <Link className="btn btn-gray btn-edit-profile" to="/edit-profile">Edit Profile</Link> : <Subscribe user={user} /> }
                        </div>
                        <div className="profile_subscribers profile_info-item">
                            <span className="profile_subscriber-count">{user.get('subscriber_count', 0).toLocaleString()}</span> {`subscriber${user.get('subscriber_count') !== 1 ? 's' : ''}` } 
                        </div>
                        { this.renderBio(user) }
                        { this.renderSocial(user) }
                    </div>

                </div> 
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: OwnProps): ConnectProps {
    return {
        isCurrentUser: CurrentUser.isUser(state, ownProps.user)
    }
}

export default connect(mapStateToProps)(ProfileHeader);
