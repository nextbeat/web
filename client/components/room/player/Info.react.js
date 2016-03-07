import React from 'react'
import User from '../../shared/User.react'

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack } = this.props;
        const profpic_url = stack.author().get('profpic_thumbnail_url') || stack.author().get('profpic_url');
        const closed = stack.get('closed');
        return (
            <section className="player_info">
                <User user={stack.author()} style={"right"} />
                <div className="player_description"><span>{ stack.get('description') } { !closed && <span className="player_open">OPEN</span> } </span></div>
                <div className="separator" />
            </section>
        );
    }
}

export default Info;
