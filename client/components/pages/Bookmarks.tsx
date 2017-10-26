import * as React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import LargeStackItem from '@components/shared/LargeStackItem'
import User from '@components/shared/User'
import Spinner from '@components/shared/Spinner'
import PageError from '@components/shared/PageError'
import AppBanner from '@components/shared/AppBanner'

import { loadBookmarkedStacks, clearClosedBookmarkedStacks } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import Stack from '@models/entities/stack'
import { State, DispatchProps } from '@types'

interface Props {
    openBookmarkedStacks: List<Stack>
    closedBookmarkedStacks: List<Stack>

    closedBookmarksFetching: boolean
    bookmarksFetching: boolean
    isLoggedIn: boolean
}

type AllProps = Props & DispatchProps & ScrollComponentProps

class Bookmarks extends React.Component<AllProps> {

    constructor(props: AllProps) {
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
        const { openBookmarkedStacks, closedBookmarkedStacks, bookmarksFetching } = this.props 
        const stacks = openBookmarkedStacks.concat(openBookmarkedStacks)

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
                    { stacks.size === 0 && !bookmarksFetching  &&
                        <div className="rooms-list_no-content">You haven't bookmarked any rooms!</div>
                    }
                </div>
            </section>
        )
    }

    render() {
        const { isLoggedIn } = this.props
        return (
            <div className="bookmarks content" id="bookmarks">
                <AppBanner url="nextbeat://bookmarks"/>
                <Helmet 
                    title="Bookmarks"
                    meta={[
                        {"property": "al:ios:url", "content": "nextbeat://bookmarks"}
                    ]} 
                />
                { !isLoggedIn && <PageError>Must be logged in.</PageError> }
                { this.renderBookmarks() }
            </div>
        );
    }
}

function mapStateToProps(state: State): Props {
    return {
        openBookmarkedStacks: CurrentUser.openBookmarkedStacks(state),
        closedBookmarkedStacks: CurrentUser.closedBookmarkedStacks(state),
        closedBookmarksFetching: CurrentUser.get(state, 'closedBookmarksFetching'),
        bookmarksFetching: CurrentUser.isBookmarksFetching(state),
        isLoggedIn: CurrentUser.isLoggedIn(state)
    }
}

const scrollOptions = {
    onScrollToBottom: function(this: Bookmarks) {
        const { dispatch, closedBookmarkedStacks, closedBookmarksFetching } = this.props 

        if (!closedBookmarksFetching && closedBookmarkedStacks.size > 0) {
            dispatch(loadBookmarkedStacks('closed'))
        }
    }  
}

export default connect(mapStateToProps)(ScrollComponent('bookmarks', scrollOptions)(Bookmarks));
