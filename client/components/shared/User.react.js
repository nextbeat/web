import React from 'react'
import { Link } from 'react-router'

class User extends React.Component {

    render() {
        const { user, style } = this.props;
        const profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        const styleClass = style ? `user-${style}` : "";
        return (
            <div className={`user ${styleClass}`}>
                <div className="user_profpic"><Link to={`/u/${user.get('username')}`}><img src={profpic_url} /></Link></div>
                <Link to={`/u/${user.get('username')}`}><span className="user_username">{ user.get('username') }</span></Link>
                <a className="btn btn-light user_subscribe" href="#">Subscribe</a>
            </div>
        );
    }
}

export default User;
