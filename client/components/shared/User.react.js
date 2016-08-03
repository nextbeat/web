import React from 'react'
import { Link } from 'react-router'
import Icon from './Icon.react'
import Subscribe from './Subscribe.react'
import { secureUrl } from '../../utils'

class User extends React.Component {

    render() {
        const { user, style } = this.props;
        let profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        profpic_url = secureUrl(profpic_url)
        const styleClass = style ? `user-${style}` : "";
        return (
            <div className={`user ${styleClass}`}>
                <Link to={`/u/${user.get('username')}`}><div className="user_profpic">{ profpic_url ? <img src={profpic_url} /> : <Icon type="person" /> }</div></Link>
                <Link to={`/u/${user.get('username')}`}><span className="user_username">{ user.get('username') }</span></Link>
                <Subscribe user={user} />
            </div>
        );
    }

}

export default User;