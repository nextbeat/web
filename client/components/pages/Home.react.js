import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { loadHome, clearHome } from '../../actions'
import { Home, App, CurrentUser } from '../../models'

import HomeSection from './home/HomeSection.react'
import HomeSplash from './home/HomeSplash.react'
import RoomCard from '../room/RoomCard.react'
import Spinner from '../shared/Spinner.react'
import AppBanner from '../shared/AppBanner.react'

class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { home, dispatch } = this.props 
        if (!home.isLoaded()) {
            this.props.dispatch(loadHome())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearHome())
    }

    render() {
        const { home, currentUser } = this.props

        return (
            <div className="home content">
                {home.isLoaded() && 
                    <div className="content_inner">
                        { !currentUser.isLoggedIn() && <RoomCard id={home.get('mainCardId')} title="FEATURED ROOM" /> }
                        <div className="home_sections">
                            {home.get('sections', List()).map((section, idx) => 
                                <HomeSection key={`sec${idx}`} stacks={home.stacks(idx)} section={section} index={idx} />
                            )}
                        </div>
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        home: new Home(state), // 🌮
        app: new App(state),
        currentUser: new CurrentUser(state),
    }
}

// HomeComponent.fetchData = (store, params) => {
//     return new Promise((resolve, reject) => {

//         const unsubscribe = store.subscribe(() => {
//             const home = new Home(store.getState())
//                 if (home.isLoaded()) {
//                     unsubscribe()
//                     resolve(store)
//                 }
//                 if (home.get('sectionsError')) {
//                     unsubscribe()
//                     reject(new Error('Unable to fetch home page.'))
//                 }
//             })
//         store.dispatch(loadHome())
//     })
// }

export default connect(mapStateToProps)(HomeComponent)
