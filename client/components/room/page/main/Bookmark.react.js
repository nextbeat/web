import React from 'react'
import { connect } from 'react-redux'

import { bookmark, unbookmark } from '../../../../actions'
import Icon from '../../../shared/Icon.react'

class Bookmark extends React.Component {

    constructor(props) {
        super(props);

        this.handleBookmark = this.handleBookmark.bind(this);
        this.handleUnbookmark = this.handleUnbookmark.bind(this);

        this.renderBookmarked = this.renderBookmarked.bind(this);
        this.renderUnbookmarked = this.renderUnbookmarked.bind(this);

        this.state = {
            hover: false
        }
    }

    handleBookmark() {
        const { dispatch, roomPage } = this.props 
        dispatch(bookmark(roomPage.get('id')))
    }   

    handleUnbookmark() {
        const { dispatch, roomPage } = this.props 
        dispatch(unbookmark(roomPage.get('id')))
    }

    renderBookmarked() {
        return (
            <div className="btn btn-secondary btn-inactive" onClick={this.handleUnbookmark} onMouseOver={() => this.setState({hover: true})} onMouseOut={() => this.setState({hover: false})}>
                <Icon type={"bookmark"} /><span className="btn-bookmark_text">{ this.state.hover ? "Unbookmark" : "Bookmarked" }</span>
            </div>
        )
    }

    renderUnbookmarked() {
        return (
            <div className="btn btn-secondary" onClick={this.handleBookmark} >
                <Icon type={"bookmark-outline"} /><span className="btn-bookmark_text">Bookmark</span>
            </div>
        )
    }

    render() {
        const { roomPage } = this.props;
        return (
            <div className="btn-bookmark">
                <div className="btn-bookmark_inner">
                    <div className="btn-bookmark_count">{ roomPage.get('bookmark_count') }</div>
                    { roomPage.isBookmarked() ? this.renderBookmarked() : this.renderUnbookmarked() }
                </div>
            </div>
        );
    }
}

export default connect()(Bookmark);
