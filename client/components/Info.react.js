import React from 'react';
import { Link } from 'react-router';

class Info extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { stack, author, isBookmarked, handleBookmark, handleUnbookmark } = this.props;
        const profpic_url = author.get('profpic_thumbnail_url') || author.get('profpic_url');
        const closed = stack.get('closed');
        const handleClick = isBookmarked ? handleUnbookmark : handleBookmark;
        const bookmarkSrc = isBookmarked ? "/images/bookmark.png" : "/images/bookmark_outline.png";
        return (
            <section id="info">
                <span className="username">
                    <div className="profile"><img src={profpic_url} /></div>
                    <Link to={`/u/${author.get('username')}`}>{author.get('username')}</Link>
                    {!closed && <span className="live">OPEN</span>}
                </span>
                <span className="bookmarks">{stack.get('bookmark_count')}<img src={bookmarkSrc} onClick={handleClick}/></span>
                <div className="clear"></div>
                <span className="description">{stack.get('description')}</span>
            </section>
        );
    }
}

export default Info;
