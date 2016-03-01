import React from 'react';

class User extends React.Component {

    render() {
        const { user } = this.props;
        const profpic_url = user.get('profpic_thumbnail_url') || user.get('profpic_url');
        return (
            <div className="user">
                <div className="user__profpic"><img src={profpic_url} /></div>
                <Link to={`/u/${user.get('username')}`}>{ user.get('username') }</Link>
                <a className="btn btn--light" href="#">Subscribe</a>
            </div>
        );
    }
}

export default User;
