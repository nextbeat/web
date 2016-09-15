import React from 'react'

import { storageAvailable } from '../../utils'
import Icon from './Icon.react'

class WelcomeBanner extends React.Component {

    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)

        this.state = {
            hideBanner: false
        }
    }

    componentDidMount() {
        if (storageAvailable('localStorage')) {
            this.setState({
                hideBanner: JSON.parse(localStorage.getItem('hideWelcomeBanner')) 
            })
        }
    }

    handleClose(e) {
        this.setState({
            hideBanner: true
        })
        if (storageAvailable('localStorage')) {
            localStorage.setItem('hideWelcomeBanner', true)
        }
    }

    render() {
        if (this.state.hideBanner) {
            return null
        }
        
        return (
            <div className="app-banner welcome-banner">
                <div className="app-banner_prompt">
                    { this.props.children }
                </div>
                <div className="app-banner_close" onClick={this.handleClose} >
                    <Icon type="close" />
                </div>
            </div>
        );
    }
}

export default WelcomeBanner;
