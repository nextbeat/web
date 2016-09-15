import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { loadHome, clearHome } from '../actions'
import { Home, App } from '../models'
import HomeSection from './home/HomeSection.react'
import HomeSplash from './home/HomeSplash.react'
import Spinner from './shared/Spinner.react'
import AppBanner from './shared/AppBanner.react'

class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(loadHome())
    }

    componentWillUnmount() {
        this.props.dispatch(clearHome())
    }

    render() {
        const { home, app } = this.props
        return (
            <div className="home content">
                <AppBanner />
                <HomeSplash />
                {home.get('sectionsFetching') && <Spinner type="grey large home" />}
                <div className="home_sections">
                    {home.get('sections', List()).map((section, idx) => 
                        <HomeSection key={`sec${idx}`} stacks={home.stacks(idx)} section={section} app={app} index={idx} />
                    )}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        home: new Home(state), // 🌮 
        app: new App(state)
    }
}

export default connect(mapStateToProps)(HomeComponent)
