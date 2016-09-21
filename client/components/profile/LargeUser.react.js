import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { secureUrl } from '../../utils'
import { CurrentUser, App } from '../../models'
import { promptModal } from '../../actions'

import Subscribe from '../shared/Subscribe.react'
import Icon from '../shared/Icon.react'

class LargeUser extends React.Component {

    constructor(props) {
        super(props)
    }

    handleEdit() {
        this.props.dispatch(promptModal('edit-profile'))
    }

    render() {
        const { user, currentUser } = this.props 

        let profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        let profpicStyle = { backgroundImage: profpic_url ? `url(${profpic_url})` : ''}

        let userHasInfo = user.get('website_url') || user.get('full_name') || user.get('description')
        let isCurrentUser = currentUser.get('id') === user.get('id') && currentUser.get('id') > 0
        let secureWebsiteUrl = secureUrl(user.get('website_url'))

        return (
            <div className="user-large">
                <div className="user_profpic user-large_profpic" style={profpicStyle}>
                    { !profpic_url && <Icon type="person" /> }
                </div>
                <div className="user-large_right">
                    <div className="user-large_username">
                        { user.get('username') } { isCurrentUser ? <Link className="btn btn-gray btn-edit-profile" to="/edit-profile">Edit Profile</Link> : <Subscribe user={user} /> }
                    </div>
                    { userHasInfo && 
                        <div className="user-large_info">
                            <div className="user-large_separator"></div>
                            { user.get('full_name') && 
                                <div className="user-large_full-name">
                                    {user.get('full_name')}
                                </div> 
                            }
                            { (user.get('website_url') || user.get('description')) &&
                                <div className="user-large_description">
                                    {user.get('description')} <a href={secureWebsiteUrl}>{user.get('website_url')}</a>
                                </div>
                            }
                        </div>
                    }
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

export default connect(mapStateToProps)(LargeUser);
