import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Sidebar from '@components/Sidebar'
import Topbar from '@components/Topbar'
import SplashTopbar from '@components/SplashTopbar'
import AppBanner from '@components/shared/AppBanner'

import {  loadTags, closeSidebar } from '@actions/app'
import CurrentUser from '@models/state/currentUser'
import AppModel from '@models/state/app'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    isLoggedIn: boolean
    isAdvertiser: boolean

    isSplashTopbarCollapsed: boolean
    hasAuthError: boolean
    activeOverlay: string
    width: string
}

type Props = ConnectProps & DispatchProps & RouteProps<{}>

class Main extends React.Component<Props> {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
        super(props);

        this.isInRoom = this.isInRoom.bind(this);
        this.handleMousedown = this.handleMousedown.bind(this);
    }


    // Component lifecycle

    componentDidMount() {
        this.props.dispatch(loadTags());

        document.addEventListener('touchstart', this.handleMousedown);
        document.addEventListener('mousedown', this.handleMousedown);

    }

    componentWillUnmount() {
        document.removeEventListener('touchstart', this.handleMousedown);
        document.removeEventListener('mousedown', this.handleMousedown);
    }


    // Queries
    
    isInRoom() {
        const { router } = this.context
        const pathname = router.location.pathname
        return router.isActive('/r') && !/\/(upload|edit)/.test(pathname)
    }


    // Events

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

    render() {
        const { isLoggedIn, isAdvertiser, isSplashTopbarCollapsed, activeOverlay, children } = this.props
        const { router } = this.context
        const pathname = router.location.pathname

        const inHome = router.isActive('/', true)
        const inStudio = router.isActive('/studio') && isAdvertiser
        const showSplashTopbar = inHome && !isLoggedIn

        const inRoomClass = this.isInRoom() ? 'main-container-room' : ''
        const guestClass = isLoggedIn ? '' : 'no-sidebar'
        const splashClass = showSplashTopbar ? (isSplashTopbarCollapsed ? 'splash splash-collapsed' : 'splash splash-expanded') : ''
        const studioClass = inStudio ? 'with-studio-banner' : ''
        const sidebarActiveClass = activeOverlay === 'sidebar' ? 'main-container-sidebar-active' : ''

        return (
            <section className={`main-container ${inRoomClass} ${sidebarActiveClass}`}>
                { inHome && <AppBanner /> /* prevents issues with fixed positioning on home page */ }
                { showSplashTopbar ? <SplashTopbar /> : <Topbar {...this.props} /> }
                <div className={`main-and-sidebar ${splashClass} ${studioClass}`}>
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
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isAdvertiser: CurrentUser.isAdvertiser(state),

        isSplashTopbarCollapsed: !!AppModel.get(state, 'splashTopbarCollapsed'),
        hasAuthError: AppModel.hasAuthError(state),
        activeOverlay: AppModel.get(state, 'activeOverlay'),
        width: AppModel.get(state, 'width'),
    }
}

export default connect(mapStateToProps)(Main);