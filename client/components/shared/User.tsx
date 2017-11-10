import * as React from 'react'
import { Link } from 'react-router'

import UserEntity from '@models/entities/user'
import Icon from '@components/shared/Icon'
import Subscribe from '@components/shared/Subscribe'
import { secureUrl } from '@utils'

interface Props {
    user: UserEntity
    style?: string
    showSubscribe?: boolean
}

class User extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        showSubscribe: true
    }

    render() {
        const { user, style, showSubscribe } = this.props;

        let profpicUrl = user.thumbnail('small').get('url')
        let profpicStyle = profpicUrl ? { backgroundImage: `url(${secureUrl(profpicUrl)})`} : {}

        const styleClass = style ? `user-${style}` : "";
        const subscriberCount = user.get('subscriber_count', 0)
        const showSubscribeClass = showSubscribe ? '' : `user-no-subscribe`

        return (
            <div className={`user ${styleClass} ${showSubscribeClass}`}>
                <Link to={`/u/${user.get('username')}`}>
                    <div className="user_profpic" style={profpicStyle}>{ !profpicUrl && <Icon type="person" /> }</div>
                </Link>
                <div className="user_info">
                    <div className="user_username"><Link to={`/u/${user.get('username')}`}>{ user.get('username') }</Link></div>
                    <span className="user_separator">•</span>
                    { showSubscribe ? 
                        <Subscribe user={user} /> : 
                        <div className="user_subscriber-count">{`${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}</div>
                    }
                </div>
            </div>
        );
    }
}

export default User;