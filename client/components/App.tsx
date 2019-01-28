import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import Login from '@components/shared/Login'
import Signup from '@components/shared/Signup'

import { 
    promptModal,
    closeModal,
    clearApp,
    resizeWindow,
    onBeforeUnload,
    cleanCache,
    hasNavigated
} from '@actions/app'
import { connectEddy } from '@actions/eddy'
import { postLogin } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import AppModel from '@models/state/app'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isLoggingIn: boolean
    isLoggedIn: boolean
    hasAuthError: boolean

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

        this.isInRoom = this.isInRoom.bind(this)

        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleTouchstart = this.handleTouchstart.bind(this);
        this.resize = this.resize.bind(this);

        this.setTitle = this.setTitle.bind(this);
    }


    // Component lifecycle

    componentWillMount() {
        if (typeof window !== 'undefined') {
            this.props.dispatch(connectEddy());            
        }
    }

    componentDidMount() {
        const { dispatch, isLoggedIn } = this.props;
        dispatch(cleanCache());

        if (isLoggedIn) {
            dispatch(postLogin());
        }

        this.resize();

        window.addEventListener('resize', this.resize);        
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        document.addEventListener('touchstart', this.handleTouchstart);

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
        const { environment } = this.props

        return (
            <div className={`app-container app-${environment}`} id="app-container">
                <div className="goodbye">
                    Nextbeat is leaving forever. Thanks for playing!
                </div>
                { this.setTitle() }
                <Login />
                <Signup />
                { this.props.children }
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isLoggingIn: CurrentUser.get(state, 'isLoggingIn'),
        isLoggedIn: CurrentUser.isLoggedIn(state),
        hasAuthError: AppModel.hasAuthError(state),
        environment: AppModel.get(state, 'environment'),
        facebookAppId: AppModel.get(state, 'facebookAppId'),
        roomUnreadCount: RoomPage.get(state, 'unreadCount', 0)
    }
}

export default connect(mapStateToProps)(App);