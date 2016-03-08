import React from 'react'
import Icon from '../../shared/Icon.react'

class Bookmark extends React.Component {

    constructor(props) {
        super(props);

        this.renderBookmarked = this.renderBookmarked.bind(this);
        this.renderUnbookmarked = this.renderUnbookmarked.bind(this);
    }

    renderBookmarked() {
        const { stack, handleUnbookmark } = this.props;
        return (
            <div className="btn btn-bookmark_main" onClick={handleUnbookmark} >
                <Icon type={"bookmark"} /><span className="btn-bookmark_text">Bookmarked</span>
            </div>
        )
    }

    renderUnbookmarked() {
        const { stack, handleBookmark } = this.props;
        return (
            <div className="btn btn-bookmark_main" onClick={handleBookmark} >
                <Icon type={"bookmark-outline"} /><span className="btn-bookmark_text">Bookmark</span>
            </div>
        )
    }

    render() {
        const { stack } = this.props;
        return (
            <div className="btn-bookmark">
                <div className="btn-bookmark_inner">
                    <div className="btn-bookmark_count">{ stack.get('bookmark_count') }</div>
                    { stack.isBookmarked() ? this.renderBookmarked() : this.renderUnbookmarked() }
                </div>
            </div>
        );
    }
}

export default Bookmark;
