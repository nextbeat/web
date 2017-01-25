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

import { connectToXMPP, postLogin, loadTags, promptModal, closeModal, clearApp, resizeWindow, onBeforeUnload, pushInitialize, startNewSession, cleanCache, sendPendingEvents } from '../actions'
import { CurrentUser, App as AppModel, Notifications } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
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
    }

    componentWillUnmount() {
        $(window).off('beforeunload', this.handleBeforeUnload);
        $(window).off('resize', this.resize);
        this.props.dispatch(clearApp());
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.get('isLoggingIn') && this.props.user.isLoggedIn()) {
            this.props.dispatch(closeModal())
        }

        if (this.props.app.hasAuthError()) {
            this.props.dispatch(promptModal('login'))
        }
    }


    // Events

    resize(e) {
        const width = $('#app-container').width();
        this.props.dispatch(resizeWindow(width));
    }

    handleBeforeUnload() {
        this.props.dispatch(onBeforeUnload())
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
        const { user, app, connected, children, routes, router } = this.props;
        const barProps = {
            user,
            app,
            routes,
            router
        }

        const inRoom = routes[routes.length-1].path.substring(0, 2) === 'r/'
        const inHome = router.isActive('/', true)
        const showSplashTopbar = inHome && !user.isLoggedIn()

        const inRoomClass = inRoom ? 'main-container-room' : ''
        const guestClass = user.isLoggedIn() ? '' : 'no-sidebar'
        const collapsedClass = !!app.get('splashTopbarCollapsed') ? 'collapsed' : ''
        const animatableClass = showSplashTopbar ? 'animatable' : ''

        return (
            <section className="app-container" id="app-container">
                {this.setTitle()}
                <Login />
                <Signup />
                { showSplashTopbar ? <SplashTopbar {...barProps} /> : <Topbar {...barProps} /> }
                <div className={`main-container ${inRoomClass} ${collapsedClass} ${animatableClass}`}>
                    <Sidebar {...barProps} />
                    <div className={`main ${guestClass}`}>
                        {React.cloneElement(children, { user, connected })}
                    </div>
                </div>
            </section>
        );
    }
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
