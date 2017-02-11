import React from 'react'

import { storageAvailable } from '../../../../utils'
import Icon from '../../../shared/Icon.react'

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

        const { username } = this.props
        
        return (
            <div className="chat_welcome-banner">
                <div className="chat_welcome-banner_close" onClick={this.handleClose} >
                    <Icon type="close" />
                </div>
                <div className="chat_welcome-banner_prompt">
                    <h1>Welcome to Nextbeat!</h1>
                    <p>
                        Chat and follow along with {username} in real time. 
                        <a target="_blank" rel="nofollow" href="https://medium.com/@TeamNextbeat/welcome-to-nextbeat-831d25524a4d">Learn more about Nextbeat.</a>
                    </p>
                </div>
            </div>
        );
    }
}

export default WelcomeBanner;
