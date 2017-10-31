import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory, LinkProps } from 'react-router'
import { Location } from 'history'
import omit from 'lodash-es/omit'

import App from '@models/state/app'
import { State, DispatchProps } from '@types'

interface OwnProps extends LinkProps {
    disableToggle?: boolean
    onlyActiveOnIndex?: boolean
}

interface ConnectProps {
    hasNavigated: boolean
}

type AllProps = OwnProps & ConnectProps & DispatchProps

function resolveToLocation(to: any, router: any) {
    return typeof to === 'function' ? to(router.location) : to
}

class ToggleLink extends React.Component<AllProps> {

    static defaultProps = {
        disableToggle: false,
        onlyActiveOnIndex: false
    }

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    private _child: Link

    constructor(props: AllProps) {
        super(props);
        
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e: React.MouseEvent<HTMLSpanElement>) {
        // If the route is active, we want to 
        // navigate back to the previous page
        const { to, disableToggle, onlyActiveOnIndex, hasNavigated } = this.props
        const { router } = this.context

        let toLocation = resolveToLocation(to, router)
        if (!disableToggle && router.isActive(toLocation, onlyActiveOnIndex) && hasNavigated) {
            router.goBack();
        } else {
            // send to Link component
            (this._child as any).handleClick(e)
        }
    }

    render() {
        let linkProps = {
            to: this.props.to,
            onlyActiveOnIndex: this.props.onlyActiveOnIndex
        }
        return <span onClick={this.handleClick}><Link {...linkProps} ref={(c: any) => { if (c) { this._child = c } }} /></span>
    }
}

function mapStateToProps(state: State) {
    return {
        hasNavigated: App.hasNavigated(state)
    }
}

export default connect(mapStateToProps)(ToggleLink)