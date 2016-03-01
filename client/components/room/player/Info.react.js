import React from 'react';
import { Link } from 'react-router';

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack } = this.props;
        const profpic_url = stack.author().get('profpic_thumbnail_url') || stack.author().get('profpic_url');
        const closed = stack.get('closed');
        return (
            <section id="info">
                <span className="username">
                    <div className="profile"><img src={profpic_url} /></div>
                    <Link to={`/u/${stack.author().get('username')}`}>{ stack.author().get('username') }</Link>
                    {!closed && <span className="live">OPEN</span>}
                </span>
                <span className="description">{ stack.get('description') }</span>
            </section>
        );
    }
}

export default Info;
