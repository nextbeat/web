import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { parse } from 'querystring'
import { get } from 'lodash'

import { Support } from '../../models'
import { sendEmailUnsubscribeRequest } from '../../actions'

class PasswordResetRequest extends React.Component {

    constructor(props) {
        super(props);
        
        this.submitRequest = this.submitRequest.bind(this);
        this.renderRequest = this.renderRequest.bind(this);
    }

    // Actions

    submitRequest(e) {
        const queryString = this.props.location.search.substring(1);
        const uuid = get(parse(queryString), 'uuid', '')
        const signature = get(parse(queryString), 'sig', '')

        this.props.dispatch(sendEmailUnsubscribeRequest(uuid, signature))
    }

    // Render

    renderRequestError() {
        return <p className="has-error">There was an error processing your request. Please try again in a few minutes.</p>
    }

    renderRequestSent() {
        return <p>You will no longer receive email notifications from Nextbeat. You may re-enable email notifications at any time by accessing your account settings in our mobile app.</p>
    }

    renderRequest() {
        const { support } = this.props;
        return (
            <div>
                <p>Click the button below to unsubscribe from all Nextbeat email notifications.</p>
                <a className="btn" onClick={this.submitRequest}>Unsubscribe</a>
            </div>
        );
    }

    render() {
        const { support } = this.props;
        return (
            <div className="support">
                <h1>Unsubscribe</h1>
                { support.get('unsubscribeRequestSent') ? this.renderRequestSent() : 
                    ( support.get('unsubscribeRequestError') ? this.renderRequestError() : this.renderRequest() ) 
                }
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        support: new Support(state)
    }
}

export default connect(mapStateToProps)(PasswordResetRequest);
