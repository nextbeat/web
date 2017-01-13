import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { secureUrl } from '../../../utils'
import { CurrentUser, App } from '../../../models'

import Subscribe from '../../shared/Subscribe.react'
import Icon from '../../shared/Icon.react'

class ProfileHeader extends React.Component {

    constructor(props) {
        super(props)
    }

    renderBio(user) {
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

    render() {
        const { user, currentUser } = this.props 

        let profpicUrl = user.thumbnail('large').get('url')
        let profpicStyle = { backgroundImage: profpicUrl ? `url(${profpicUrl})` : ''}

        let coverUrl = user.coverImage('large').get('url')
        if (coverUrl) {
            var coverStyle = {
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
                            { user.get('username') } { currentUser.isUser(user) ? <Link className="btn btn-gray btn-edit-profile" to="/edit-profile">Edit Profile</Link> : <Subscribe user={user} /> }
                        </div>
                        <div className="profile_subscribers profile_info-item">
                            <span className="profile_subscriber-count">{`${user.get('subscriber_count')}`}</span> {`subscriber${user.get('subscriber_count') !== 1 ? 's' : ''}` } 
                        </div>
                        { this.renderBio(user) }
                    </div>

                </div> 
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(ProfileHeader);
