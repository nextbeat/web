import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import HomeSection from './home/HomeSection'
import HomeSplash from './home/HomeSplash'
import RoomCard from '@components/room/RoomCard'
import Spinner from '@components/shared/Spinner'
import AppBanner from '@components/shared/AppBanner'

import { loadHome, clearHome } from '@actions/pages/home'
import Home from '@models/state/pages/home'
import CurrentUser from '@models/state/currentUser'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    isLoggedIn: boolean
    isLoaded: boolean
    sections: List<State>
    mainCardId: number
}

type Props = ConnectProps & DispatchProps

class HomeComponent extends React.Component<Props> {

    componentDidMount() {
        const { isLoaded, dispatch } = this.props 
        if (isLoaded) {
            dispatch(loadHome())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearHome())
    }

    render() {
        const { isLoaded, isLoggedIn, sections, mainCardId } = this.props

        return (
            <div className="home content">
                {isLoaded && 
                    <div className="content_inner">
                        { !isLoggedIn && <RoomCard id={mainCardId} title="FEATURED ROOM" /> }
                        <div className="home_sections">
                            {sections.map((section, idx) => 
                                <HomeSection key={`sec${idx}`} index={idx} />
                            )}
                        </div>
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isLoaded: Home.isLoaded(state),
        sections: Home.get(state, 'sections', List()),
        mainCardId: Home.get(state, 'mainCardId')
    }
}

export default connect(mapStateToProps)(HomeComponent)
