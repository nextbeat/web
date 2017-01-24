import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import ScrollComponent from '../utils/ScrollComponent.react'

import LargeStackItem from '../shared/LargeStackItem.react'
import User from '../shared/User.react'
import Spinner from '../shared/Spinner.react'
import PageError from '../shared/PageError.react'
import AppBanner from '../shared/AppBanner.react'

import { loadBookmarkedStacks, clearClosedBookmarkedStacks } from '../../actions'
import { CurrentUser } from '../../models'

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
        const { currentUser } = this.props 
        const stacks = currentUser.openBookmarkedStacks().concat(currentUser.closedBookmarkedStacks())

        return (
            <section className="content_inner">  
                <div className="content_header">
                    Bookmarks
                </div>

                <div className="bookmarks_rooms">
                    { stacks.size > 0 && 
                        <div className="rooms-list_rooms">
                            { stacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                        </div>
                    }
                    { stacks.size === 0 && !currentUser.bookmarksFetching()  &&
                        <div className="rooms-list_no-content">You haven't bookmarked any rooms!</div>
                    }
                </div>
            </section>
        )
    }

    render() {
        const { currentUser } = this.props
        return (
            <div className="bookmarks content" id="bookmarks">
                <AppBanner url="nextbeat://bookmarks"/>
                <Helmet 
                    title="Bookmarks"
                    meta={[
                        {"property": "al:ios:url", "content": "nextbeat://bookmarks"}
                    ]} 
                />
                { !currentUser.isLoggedIn() && <PageError>Must be logged in.</PageError> }
                { this.renderBookmarks() }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state)
    }
}

const scrollOptions = {

     onScrollToBottom: function() {
        const { dispatch, currentUser } = this.props 

        if (!currentUser.get('closedBookmarksFetching') && currentUser.closedBookmarkedStacks().size > 0) {
            dispatch(loadBookmarkedStacks('closed'))
        }
     }  
}

export default connect(mapStateToProps)(ScrollComponent('bookmarks', scrollOptions)(Bookmarks));
