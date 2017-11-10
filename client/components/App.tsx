import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import Sidebar from '@components/Sidebar'
import Topbar from '@components/Topbar'
import SplashTopbar from '@components/SplashTopbar'
import AppBanner from '@components/shared/AppBanner'
import Login from '@components/shared/Login'
import Signup from '@components/shared/Signup'

import { 
    loadTags,
    promptModal,
    closeModal,
    clearApp,
    resizeWindow,
    onBeforeUnload,
    cleanCache,
    hasNavigated,
    closeSidebar
} from '@actions/app'
import { connectEddy } from '@actions/eddy'
import { pushInitialize } from '@actions/push'
import { postLogin } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import AppModel from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isLoggingIn: boolean
    isLoggedIn: boolean
    isPartner: boolean

    isSplashTopbarCollapsed: boolean
    hasAuthError: boolean
    activeOverlay: string
    width: string
    environment: string
    facebookAppId: string
    roomUnreadCount: number
}

type Props = ConnectProps & DispatchProps & RouteProps<{}>

class App extends React.Component<Props> {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.isInRoom = this.isInRoom.bind(this);

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleTouchstart = this.handleTouchstart.bind(this);
        this.handleMousedown = this.handleMousedown.bind(this);
        this.resize = this.resize.bind(this);

        this.setTitle = this.setTitle.bind(this);
    }


    // Component lifecycle

    componentDidMount() {
        const { dispatch, isLoggedIn } = this.props;
        dispatch(connectEddy());
        dispatch(loadTags());
        dispatch(cleanCache());

        if (isLoggedIn) {
            dispatch(postLogin());
        }

        this.resize();

        window.addEventListener('resize', this.resize);        
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        document.addEventListener('touchstart', this.handleTouchstart);
        document.addEventListener('touchstart', this.handleMousedown);
        document.addEventListener('mousedown', this.handleMousedown);

    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.isLoggingIn && this.props.isLoggedIn) {
            this.props.dispatch(closeModal())
        }

        if (this.props.hasAuthError) {
            this.props.dispatch(promptModal('login'))
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.location !== nextProps.location) {
            this.props.dispatch(hasNavigated(this.props.location))
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);        
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('touchstart', this.handleTouchstart);
        document.removeEventListener('touchstart', this.handleMousedown);
        document.removeEventListener('mousedown', this.handleMousedown);

        this.props.dispatch(clearApp());
    }


    // Queries
    
    isInRoom() {
        const { router } = this.context
        const pathname = router.location.pathname
        return router.isActive('/r') && !/\/(upload|edit)/.test(pathname)
    }


    // Events

    resize() {
        const width = $('#app-container').width() as number;
        this.props.dispatch(resizeWindow(width));
    }

    handleBeforeUnload() {
        this.props.dispatch(onBeforeUnload())
    }

    handleTouchstart(e: Event) {
        // Dismiss input focus if tap outside of the input element
        let isTextInput = (node: Element) => ['INPUT', 'TEXTAREA'].indexOf(node.nodeName) !== -1
        if (!isTextInput(e.target as Element) && isTextInput(document.activeElement)) {
            (document.activeElement as any).blur()
        }
    }

    handleMousedown(e: Event) {
        // Hide sidebar if tapping outside of it or topbar on small screens
        const sidebar = document.getElementById('sidebar') as HTMLElement
        const topbar = document.getElementById('topbar') as HTMLElement
        const { activeOverlay, width, dispatch } = this.props

        if (activeOverlay === 'sidebar' 
            && !sidebar.contains(e.target as Node) 
            && !topbar.contains(e.target as Node) 
            && width === 'small') 
        {
            // e.preventDefault()
            dispatch(closeSidebar())
        }
    }

    // Render

    setTitle() {
        const { environment, facebookAppId, roomUnreadCount } = this.props;

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
        if (this.isInRoom() && roomUnreadCount > 0) {
            badge = `(${roomUnreadCount}) `
        }

        let description = "Nextbeat lets you do anything with an audience. Open a room, check in with photos and videos, chat with people hanging out, and build a community that goes where you go."
        let meta = [
            {"property": "og:site_name", "content": "Nextbeat"},
            {"property": "og:description", "content": description},
            {"property": "fb:app_id", "content": facebookAppId},
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
        const { isLoggedIn, isPartner, isSplashTopbarCollapsed, activeOverlay, children } = this.props
        const { router } = this.context
        const pathname = router.location.pathname

        const inHome = router.isActive('/', true)
        const inStudio = router.isActive('/studio') && isPartner
        const showSplashTopbar = inHome && !isLoggedIn

        const inRoomClass = this.isInRoom() ? 'app-container-room' : ''
        const guestClass = isLoggedIn ? '' : 'no-sidebar'
        const splashClass = showSplashTopbar ? (isSplashTopbarCollapsed ? 'splash splash-collapsed' : 'splash splash-expanded') : ''
        const studioClass = inStudio ? 'with-studio-banner' : ''
        const sidebarActiveClass = activeOverlay === 'sidebar' ? 'app-container-sidebar-active' : ''

        return (
            <section className={`app-container ${inRoomClass} ${sidebarActiveClass}`} id="app-container">
                { inHome && <AppBanner /> /* prevents issues with fixed positioning on home page */ }
                {this.setTitle()}
                <Login />
                <Signup />
                { showSplashTopbar ? <SplashTopbar /> : <Topbar {...this.props} /> }
                <div className={`main-container ${splashClass} ${studioClass}`}>
                    { inStudio && <div className="studio_banner">PARTNER STUDIO</div> }
                    <Sidebar />
                    <div className={`main ${guestClass}`}>
                        {children}
                    </div>
                </div>
            </section>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isLoggingIn: CurrentUser.get(state, 'isLoggingIn'),
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isPartner: CurrentUser.isPartner(state),

        isSplashTopbarCollapsed: !!AppModel.get(state, 'splashTopbarCollapsed'),
        hasAuthError: AppModel.hasAuthError(state),
        activeOverlay: AppModel.get(state, 'activeOverlay'),
        width: AppModel.get(state, 'width'),
        environment: AppModel.get(state, 'environment'),
        facebookAppId: AppModel.get(state, 'facebookAppId'),
        roomUnreadCount: RoomPage.get(state, 'unreadCount', 0)
    }
}

export default connect(mapStateToProps)(App);