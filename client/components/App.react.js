import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import Sidebar from '../components/Sidebar.react'
import Topbar from '../components/Topbar.react'
import SplashTopbar from '../components/SplashTopbar.react'
import AppBanner from '../components/shared/AppBanner.react'
import Login from '../components/shared/Login.react'
import Signup from '../components/shared/Signup.react'

import { connectToXMPP, postLogin, loadTags, promptModal, 
        closeModal, clearApp, resizeWindow, onBeforeUnload, 
        pushInitialize, startNewSession, cleanCache, 
        sendPendingEvents, hasNavigated, closeSidebar } from '../actions'
import { CurrentUser, App as AppModel, Notifications } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleTouchstart = this.handleTouchstart.bind(this);
        this.handleMousedown = this.handleMousedown.bind(this);
        this.resize = this.resize.bind(this);

        this.setTitle = this.setTitle.bind(this);
    }

    // Component lifecycle

    componentWillMount() {
        if (typeof window !== 'undefined') {
            // client only
            this.props.dispatch(sendPendingEvents());
            this.props.dispatch(startNewSession())
        }
    }

    componentDidMount() {
        const { user, dispatch } = this.props;
        dispatch(connectToXMPP());
        dispatch(loadTags());
        dispatch(cleanCache());

        if (user.isLoggedIn()) {
            dispatch(postLogin());
        }

        $(window).resize(this.resize);
        this.resize();

        $(window).on('beforeunload', this.handleBeforeUnload);
        $(document).on('touchstart', this.handleTouchstart);
        $(document).on('mousedown touchstart', this.handleMousedown);

    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.get('isLoggingIn') && this.props.user.isLoggedIn()) {
            this.props.dispatch(closeModal())
        }

        if (this.props.app.hasAuthError()) {
            this.props.dispatch(promptModal('login'))
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location !== nextProps.location) {
            this.props.dispatch(hasNavigated(this.props.location))
        }
    }

    componentWillUnmount() {
        $(window).off('beforeunload', this.handleBeforeUnload);
        $(window).off('resize', this.resize);
        $(document).off('touchstart', this.handleTouchstart);
        $(document).off('mousedown touchstart', this.handleMousedown);

        this.props.dispatch(clearApp());
    }

    // Events

    resize(e) {
        const width = $('#app-container').width();
        this.props.dispatch(resizeWindow(width));
    }

    handleBeforeUnload() {
        this.props.dispatch(onBeforeUnload())
    }

    handleTouchstart(e) {
        // Dismiss input focus if tap outside of the input element
        let isTextInput = node => ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1
        if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
            document.activeElement.blur()
        }
    }

    handleMousedown(e) {
        // Hide sidebar if tapping outside of it or topbar on small screens
        const sidebar = document.getElementById('sidebar')
        const topbar = document.getElementById('topbar')
        const { app, dispatch } = this.props

        if (app.get('activeOverlay') === 'sidebar' 
            && !sidebar.contains(e.target) 
            && !topbar.contains(e.target) 
            && app.get('width') === 'small') 
        {
            // e.preventDefault()
            dispatch(closeSidebar())
        }
    }

    // Render

    setTitle() {
        const { app, user, notifications } = this.props;
        const environment = app.get('environment', 'development');
        const fbAppId = app.get('facebookAppId');

        let envLabel = '';
        switch (environment) {
            case 'development':
                envLabel = '[DEV] ';
                break;
            case 'local':
                envLabel = '[LOCAL] ';
                break;
            case 'mac':
                envLabel = '[MAC] ';
                break;
            case 'mac-dev':
                envLabel = '[MACDEV] ';
                break;
            case 'production':
            default:
                break;
        }

        let badge = '';
        let count = notifications.totalUnreadCount(true);
        if (count > 0) {
            badge = `(${count}) `
        }

        let description = "Open a door to your world and bring your audience with you. Open rooms to check into over the course of the day. Live chat with audiences on the go."
        let meta = [
            {"property": "og:site_name", "content": "Nextbeat"},
            {"property": "og:description", "content": description},
            {"property": "fb:app_id", "content": fbAppId},
            {"property": "al:ios:url", "content": "nextbeat://"},
            {"property": "al:ios:app_store_id", "content": "1101932727"},
            {"property": "al:ios:app_name", "content": "Nextbeat"},
            {"name": "description", "content": description}
        ]

        if (environment === 'development') {
            // Prevent search crawlers from indexing
            meta.push({"name": "robots", "content": "noindex"})
        }

        return (
            <Helmet
                defaultTitle = {`${badge}${envLabel}Nextbeat`}
                titleTemplate = {`${badge}${envLabel}%s - Nextbeat`}
                meta={meta}
            />
        );
    }

    render() {
        const { user, app, connected, children } = this.props
        const { router } = this.context

        const inRoom = router.isActive('/r')
        const inHome = router.isActive('/', true)
        const showSplashTopbar = inHome && !user.isLoggedIn()

        const inRoomClass = inRoom ? 'app-container-room' : ''
        const guestClass = user.isLoggedIn() ? '' : 'no-sidebar'
        const splashClass = showSplashTopbar ? (!!app.get('splashTopbarCollapsed') ? 'splash splash-collapsed' : 'splash splash-expanded') : ''
        const sidebarActiveClass = app.get('activeOverlay') === 'sidebar' ? 'app-container-sidebar-active' : ''

        return (
            <section className={`app-container ${inRoomClass} ${sidebarActiveClass}`} id="app-container">
                { inHome && <AppBanner /> /* prevents issues with fixed positioning on home page */ }
                {this.setTitle()}
                <Login />
                <Signup />
                { showSplashTopbar ? <SplashTopbar /> : <Topbar /> }
                <div className={`main-container ${splashClass}`}>
                    <Sidebar />
                    <div className={`main ${guestClass}`}>
                        {React.cloneElement(children, { user, connected })}
                    </div>
                </div>
            </section>
        );
    }
}

App.contextTypes = {
    router: React.PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    const user = new CurrentUser(state)
    const notifications = new Notifications(state)
    const app = new AppModel(state)

    return {
        user,
        notifications,
        app,
        connected: user.get('connected')
    }
}

export default connect(mapStateToProps)(App);
