import React from 'react'

import Subscribe from '../shared/Subscribe.react'
import { secureUrl } from '../../utils'

class LargeUser extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { user } = this.props 
        let profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        let userHasInfo = user.get('website_url') || user.get('full_name') || user.get('description')
        let secureWebsiteUrl = secureUrl(user.get('website_url'))

        return (
            <div className="user-large">
                <div className="user_profpic user-large_profpic">{ profpic_url ? <img src={profpic_url} /> : <Icon type="person" /> }</div>
                <div className="user-large_right">
                    <div className="user-large_username">
                        { user.get('username') } <Subscribe user={user} />
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

export default LargeUser;
