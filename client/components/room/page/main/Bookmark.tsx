import * as React from 'react'
import { connect } from 'react-redux'

import { bookmark, unbookmark } from '@actions/room'
import RoomPage from '@models/state/pages/room'
import Room from '@models/state/room'
import Icon from '@components/shared/Icon'
import { State, DispatchProps } from '@types'
import { formatNumber } from '@utils'

interface OwnProps {
    type?: string
}

interface ConnectProps {
    roomId: number
    bookmarkCount: number
    isBookmarked: boolean
}

type Props = OwnProps & ConnectProps & DispatchProps

interface BookmarkState {
    hover: boolean
}

class Bookmark extends React.Component<Props, BookmarkState> {

    constructor(props: Props) {
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
        const { dispatch, roomId } = this.props 
        dispatch(bookmark(roomId))
    }   

    handleUnbookmark() {
        const { dispatch, roomId } = this.props 
        dispatch(unbookmark(roomId))
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
        const { bookmarkCount, isBookmarked, type } = this.props;
        const typeClass = type ? `btn-bookmark-${type}` : ''
        const bookmarkedClass = isBookmarked ? 'bookmarked' : 'unbookmarked';

        return (
            <div className={`btn-bookmark ${typeClass} ${bookmarkedClass}`}>
                <div className="btn-bookmark_count">{ formatNumber(bookmarkCount) }</div>
                { isBookmarked ? this.renderBookmarked() : this.renderUnbookmarked() }
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    const roomId = RoomPage.get(state, 'id')
    return {
        roomId,
        bookmarkCount: Room.entity(state, roomId).get('bookmark_count'),
        isBookmarked: Room.isBookmarked(state, roomId)
    }
}

export default connect(mapStateToProps)(Bookmark);
