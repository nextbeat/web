import React from 'react'
import { Link, browserHistory } from 'react-router'
import { connect } from 'react-redux'

import { CurrentUser, App } from '../models'
import { selectSidebar, closeSidebar } from '../actions'

import StackItem from './shared/StackItem.react'
import Icon from './shared/Icon.react'
import Spinner from './shared/Spinner.react'
import Logo from './shared/Logo.react'
import Badge from './shared/Badge.react'

class Sidebar extends React.Component {

    constructor(props) {
        super(props);

        this.renderStackItem = this.renderStackItem.bind(this);
    }

    componentDidMount() {
        $('.sidebar').on('click', (e) => {
            const $section = $(e.target.closest('.sidebar_section'))
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

    renderStackItem(stack) {
        const { user } = this.props;
        return (
            <StackItem key={`bk${stack.get('id')}`} stack={stack} user={user} static={true} />
        )
    }

    renderSubscription(sub) {
        const url = sub.get('profpic_thumbnail_url') || sub.get('profpic_url');
        return (
            <Link key={`sub${sub.get('id')}`} to={`/u/${sub.get('username')}`} activeClassName="selected" className="sidebar_item">
                <div className="sidebar_icon">{ url ? <img src={url} /> : <Icon type="person" /> }</div>
                { sub.get('username') }
                { sub.get('open_stacks') > 0 && <Badge elementType="sidebar" type="open" /> }
            </Link>
        )
    }

    render() {
        const { user, app } = this.props;

        // hide sidebar if user is not logged in
        const guestClass = user.isLoggedIn() ? '' : 'no-sidebar'

        // display sidebar if selected
        const activeClass = app.get('activeOverlay') === 'sidebar' ? 'active' : ''
        const animatingClass = app.get('sidebarAnimating') ? 'animating' : ''

        // set style for displaying profile picture
        const profileStyle = { backgroundImage: user.profileThumbnailUrl() ? `url(${user.profileThumbnailUrl()})` : ''}

        return (
            <div className={`sidebar ${activeClass} ${guestClass} ${animatingClass}`}>
                <div className="sidebar_section sidebar_topnav">
                    <Link to="/" activeClassName="selected" className="sidebar_item">
                        <div className="sidebar_icon"><Icon type="home" /></div>Home
                    </Link>
                    { user.isLoggedIn() && 
                        <Link to={`/u/${user.get('username')}`} activeClassName="selected" className="sidebar_item">
                            <div className="sidebar_icon" style={profileStyle}>{ !user.profileThumbnailUrl() && <Icon type="person" /> }</div>
                            My Profile
                        </Link>
                    }
                </div>
                { user.isLoggedIn() && user.isFetchingUserData() && <Spinner type="grey" /> }
                { user.isLoggedIn() && !user.isFetchingUserData() &&
                    <div>
                        <div className="sidebar_bookmarks sidebar_section">
                            <h1>BOOKMARKS</h1>
                            {user.openBookmarkedStacks().size === 0 && <div className="sidebar_no-content">You have no open bookmarks.</div>}
                            {user.openBookmarkedStacks().map(stack => this.renderStackItem(stack))}
                        </div>
                        <div className="sidebar_subscriptions sidebar_section">
                            <h1>SUBSCRIPTIONS</h1>
                            {user.subscriptions().size === 0 && <div className="sidebar_no-content">You have no subscriptions.</div>}
                            {user.subscriptions().map(sub => this.renderSubscription(sub))}
                        </div>
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: new CurrentUser(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Sidebar);
