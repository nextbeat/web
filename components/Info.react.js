import React from 'react';

class Info extends React.Component {

    constructor(props) {
        super(props);
        this.displayName = 'Info';
    }

    render() {
        var username = this.props.stack.author ? this.props.stack.author.username : "";
        return (
            <section id="info">
                <span className="username">{username}</span>
                <span className="bookmarks">{this.props.stack.bookmark_count} bookmarks</span>
                <div className="clear"></div>
                <span className="description">{this.props.stack.description}</span>
            </section>
        );
    }
}

export default Info;
