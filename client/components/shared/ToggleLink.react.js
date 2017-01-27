import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'

import { App } from '../../models'

function resolveToLocation(to, router) {
    return typeof to === 'function' ? to(router.location) : to
}

class ToggleLink extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        // If the route is active, we want to 
        // navigate back to the previous page
        const { to, disableToggle, onlyActiveOnIndex, app } = this.props
        const { router } = this.context

        let toLocation = resolveToLocation(to, router)
        if (!disableToggle && router.isActive(toLocation, onlyActiveOnIndex) && app.hasNavigated()) {
            router.goBack();
        } else {
            // send to Link component
            this._child.handleClick(e)
        }
    }

    render() {
        return <span onClick={this.handleClick}><Link {...this.props} ref={c => this._child = c} /></span>
    }
}

ToggleLink.defaultProps = {
    disableToggle: false
}

ToggleLink.contextTypes = {
    router: React.PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        app: new App(state)
    }
}

export default connect(mapStateToProps)(ToggleLink)