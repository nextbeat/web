import React from 'react';

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack, author } = this.props
        return (
            <section id="info">
                <span className="username">{author.get('username')}</span>
                <span className="bookmarks">{stack.get('bookmark_count')} bookmarks</span>
                <div className="clear"></div>
                <span className="description">{stack.get('description')}</span>
            </section>
        );
    }
}

export default Info;
