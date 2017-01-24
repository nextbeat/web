import React from 'react'
import { Link } from 'react-router'
import Icon from './Icon.react'
import Subscribe from './Subscribe.react'
import { secureUrl } from '../../utils'

class User extends React.Component {

    render() {
        const { user, style, showSubscribe } = this.props;

        let profpicUrl = secureUrl(user.thumbnail('small').get('url'))
        const styleClass = style ? `user-${style}` : "";
        const subscriberCount = user.get('subscriber_count', 0)

        return (
            <div className={`user ${styleClass}`}>
                <Link to={`/u/${user.get('username')}`}><div className="user_profpic">{ profpicUrl ? <img src={profpicUrl} /> : <Icon type="person" /> }</div></Link>
                <Link to={`/u/${user.get('username')}`}><span className="user_username">{ user.get('username') }</span></Link>
                { showSubscribe ? <Subscribe user={user} /> : <div className="user_subscriber-count">{`${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}</div>}
            </div>
        );
    }

}

User.defaultProps = {
    showSubscribe: true
}

export default User;