import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import Sidebar from '../components/Sidebar.react'
import Topbar from '../components/Topbar.react'
import AppBanner from '../components/shared/AppBanner.react'
import Login from '../components/shared/Login.react'
import Signup from '../components/shared/Signup.react'

import { connectToXMPP, postLogin, loadTags, promptModal, closeModal, clearApp, resizeWindow, onBeforeUnload, pushInitialize } from '../actions'
import { CurrentUser, App as AppModel } from '../models'

class App extends React.Component {

    constructor(props) {
        super(props);

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.resize = this.resize.bind(this);

        this.setTitle = this.setTitle.bind(this);
    }

    // Component lifecycle

    componentDidMount() {
        const { user, dispatch } = this.props;
        dispatch(connectToXMPP());
        dispatch(loadTags());

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
        const { app, user } = this.props;
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
        let count = user.totalUnreadNotificationCount(true);
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
        const { user, app, connected, children, routes } = this.props;
        const barProps = {
            user,
            app,
            routes
        }

        const inRoom = routes[routes.length-1].path.substring(0, 3) === '/r/'
        const expandLeftClass = app.get('width') === 'small' 
                                || app.get('width') === 'medium'
                                || (app.get('width') === 'room-medium' && inRoom) 
                                    ? 'expand-left' : ''

        return (
            <section className="app-container" id="app-container">
                {this.setTitle()}
                <Login />
                <Signup />
                <Topbar {...barProps} />
                <div className="main-container">
                    <Sidebar {...barProps} />
                    <div className={`main ${expandLeftClass}`}>
                        {React.cloneElement(children, { user, connected })}
                    </div>
                </div>
            </section>
        );
    }
}

function mapStateToProps(state, props) {
    const user = new CurrentUser(state)
    const app = new AppModel(state)

    return {
        user,
        app,
        connected: user.get('connected')
    }
}

export default connect(mapStateToProps)(App);
