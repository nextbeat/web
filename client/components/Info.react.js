import React from 'react';

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack, author } = this.props
        const profpic_url = author.get('profpic_thumbnail_url') || author.get('profpic_url');
        return (
            <section id="info">
                <span className="username"><img src={profpic_url} /> {author.get('username')}</span>
                <span className="bookmarks">{stack.get('bookmark_count')}<img src="/images/bookmark.png" /></span>
                <div className="clear"></div>
                <span className="description">{stack.get('description')}</span>
            </section>
        );
    }
}

export default Info;
