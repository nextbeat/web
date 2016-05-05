import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ScrollComponent from './utils/ScrollComponent.react'

import LargeStackItem from './shared/LargeStackItem.react'
import User from './shared/User.react'
import Spinner from './shared/Spinner.react'
import PageError from './shared/PageError.react'

import { loadBookmarkedStacks, clearClosedBookmarkedStacks } from '../actions'
import { CurrentUser } from '../models'

class Bookmarks extends React.Component {

    constructor(props) {
        super(props);
        this.renderBookmarks = this.renderBookmarks.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props
        // open stacks should already be loaded
        dispatch(loadBookmarkedStacks('closed'));
    }

    componentWillUnmount() {
        this.props.dispatch(clearClosedBookmarkedStacks());
    }

    renderBookmarks() {
        const { openStacks, closedStacks, closedFetching } = this.props;
        return (
            <section>  
                <h1>BOOKMARKS</h1>
                { openStacks.size > 0 && 
                <div>
                    <div className="rooms-list_header">OPEN</div>
                    <div className="rooms-list_rooms">
                        { openStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                    </div>
                </div>
                }

                { /* Show no-content history only if there are no open bookmarks */ }
                { (closedStacks.size > 0 || (openStacks.size === 0 && !closedFetching)) && 
                <div>
                    <div className="rooms-list_header">HISTORY</div>
                    <div className="rooms-list_rooms">
                        { closedStacks.size === 0 && !closedFetching && <div className="rooms-list_no-content">You haven't bookmarked any rooms!</div> }
                        { closedStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                    </div>
                </div>
                }

                { closedFetching && <Spinner type="grey rooms-list" /> }
            </section>
        )
    }

    render() {
        const { user } = this.props;
        return (
            <div className="bookmarks content" id="bookmarks">
                <Helmet title="Bookmarks" />
                { !user.isLoggedIn() && <PageError>Must be logged in.</PageError> }
                { this.renderBookmarks() }
            </div>
        );
    }
}

function mapStateToProps(state, props) {
    // we don't retrieve state here, we just destructure the user
    // object for easier access to its properties
    const { user } = props;

    return {
        closedFetching: user.get('closedBookmarksFetching'),
        closedError: user.get('closedBookmarksError'),
        openStacks: user.openBookmarkedStacks(),
        closedStacks: user.closedBookmarkedStacks()
    }
}

const scrollOptions = {

     onScrollToBottom: function() {
        const { dispatch, closedStacks, closedFetching } = this.props 
        if (!closedFetching && closedStacks.size > 0) {
            dispatch(loadBookmarkedStacks('closed'))
        }
     }  
}

export default connect(mapStateToProps)(ScrollComponent('bookmarks', scrollOptions)(Bookmarks));
