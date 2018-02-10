import * as React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { List } from 'immutable'

import CurrentUser from '@models/state/currentUser'
import App from '@models/state/app'
import Stack from '@models/entities/stack'
import User from '@models/entities/user'
import { selectSidebar, closeSidebar } from '@actions/app'
import { State, DispatchProps } from '@types'
import { secureUrl } from '@utils'

import StackItem from '@components/shared/StackItem'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Badge from '@components/shared/Badge'

interface Props {
    isLoggedIn: boolean
    isPartner: boolean
    username: string
    profilePictureUrl: string
    isSidebarDataLoaded: boolean

    activeOverlay: string
    isSidebarAnimating: boolean

    openBookmarkedStacks: List<Stack>
    subscriptions: List<User>
}

type AllProps = Props & DispatchProps

class Sidebar extends React.Component<AllProps> {

    constructor(props: AllProps) {
        super(props);

        this.renderStackItem = this.renderStackItem.bind(this);
    }

    componentDidMount() {
        $('.sidebar').on('click', null, (e) => {
            const $section = $(e.target).closest('.sidebar_section')
            if ($section.hasClass('sidebar_bookmarks') || $section.hasClass('sidebar_subscriptions') 
                || $section.hasClass('sidebar_categories') || $section.hasClass('sidebar_topnav')) 
            {
                this.props.dispatch(closeSidebar())
            }  
        })
    }

    componentWillUnmount() {
        $('.sidebar').off('click');
    } 

    // Render

    renderStackItem(stack: Stack) {
        return (
            <StackItem key={`bk${stack.get('id')}`} stack={stack} static={true} showBadge={true} />
        )
    }

    renderSubscription(sub: User) {
        const url = sub.thumbnail('small').get('url')
        const iconStyle = url ? { backgroundImage: `url(${secureUrl(url)})`} : {}
        return (
            <Link key={`sub${sub.get('id')}`} to={`/u/${sub.get('username')}`} activeClassName="selected" className="sidebar_item">
                <div className="sidebar_icon" style={iconStyle}>{ !url && <Icon type="person" /> }</div>
                { sub.get('username') }
                { sub.get('open_stacks') > 0 && <Badge elementType="sidebar" type="open" /> }
            </Link>
        )
    }

    render() {
        const { isLoggedIn, isPartner, activeOverlay, isSidebarAnimating, isSidebarDataLoaded,
                username, profilePictureUrl, openBookmarkedStacks, subscriptions } = this.props;

        // hide sidebar if user is not logged in
        const guestClass = isLoggedIn ? '' : 'no-sidebar'

        // display sidebar if selected
        const activeClass = activeOverlay === 'sidebar' ? 'active' : ''
        const animatingClass = isSidebarAnimating ? 'animating' : ''

        // set style for displaying profile picture
        const profileStyle = { backgroundImage: profilePictureUrl ? `url(${profilePictureUrl})` : ''}

        return (
            <div className={`sidebar ${activeClass} ${guestClass} ${animatingClass}`} id='sidebar'>
                { isSidebarDataLoaded &&
                <div>
                    <div className="sidebar_section sidebar_topnav">
                        <Link to="/" activeClassName="selected" className="sidebar_item">
                            <div className="sidebar_icon"><Icon type="home" /></div>Home
                        </Link>
                        <Link to={`/u/${username}`} activeClassName="selected" className="sidebar_item">
                            <div className="sidebar_icon" style={profileStyle}>{ !profilePictureUrl && <Icon type="person" /> }</div>
                            My Profile
                        </Link>
                        { isPartner &&
                            <Link to="/studio" activeClassName="selected" className="sidebar_item">
                                My Campaigns
                            </Link>
                        }
                    </div>
                    <div className="sidebar_bookmarks sidebar_section">
                        <Link to="/bookmarks" className="sidebar_header">BOOKMARKS</Link>
                        {openBookmarkedStacks.size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                        {openBookmarkedStacks.map(stack => this.renderStackItem(stack))}
                    </div>
                    <div className="sidebar_subscriptions sidebar_section">
                        <Link to="/subscriptions" className="sidebar_header">SUBSCRIPTIONS</Link>
                        {subscriptions.size === 0 && <div className="sidebar_no-content">You have no subscriptions.</div>}
                        {subscriptions.map(sub => this.renderSubscription(sub))}
                    </div>
                    <div className="sidebar_company sidebar_section sidebar_section-last">
                        <Link to="/company/about">About</Link>
                        <a href="https://medium.com/nextbeat">Blog</a>
                        <Link to="/company/contact">Contact</Link>
                        <Link to="/company/legal">Legal</Link>
                    </div>
                </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state: State): Props {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isPartner: CurrentUser.isPartner(state),
        username: CurrentUser.entity(state).get('username'),
        profilePictureUrl: CurrentUser.profileThumbnailUrl(state),
        isSidebarDataLoaded: CurrentUser.isSidebarDataLoaded(state),

        activeOverlay: App.get(state, 'activeOverlay'),
        isSidebarAnimating: App.get(state, 'sidebarAnimating'),

        openBookmarkedStacks: CurrentUser.openBookmarkedStacks(state),
        subscriptions: CurrentUser.subscriptions(state)
    }
}

export default connect(mapStateToProps)(Sidebar);
