import React from 'react'
import Icon from '../../shared/Icon.react'

class Bookmark extends React.Component {

    constructor(props) {
        super(props);

        this.renderBookmarked = this.renderBookmarked.bind(this);
        this.renderUnbookmarked = this.renderUnbookmarked.bind(this);

        this.state = {
            hover: false
        }
    }



    renderBookmarked() {
        const { stack, handleUnbookmark } = this.props;
        return (
            <div className="btn btn-secondary btn-inactive" onClick={handleUnbookmark} onMouseOver={() => this.setState({hover: true})} onMouseOut={() => this.setState({hover: false})}>
                <Icon type={"bookmark"} /><span className="btn-bookmark_text">{ this.state.hover ? "Unbookmark" : "Bookmarked" }</span>
            </div>
        )
    }

    renderUnbookmarked() {
        const { stack, handleBookmark } = this.props;
        return (
            <div className="btn btn-secondary" onClick={handleBookmark} >
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
