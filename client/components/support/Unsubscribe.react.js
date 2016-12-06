import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { parse } from 'querystring'
import { get } from 'lodash-es'

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

    renderRequestError(error) {
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
                <div className="support_submit"><a className="btn" onClick={this.submitRequest}>Unsubscribe</a></div>
            </div>
        );
    }

    render() {
        const { support } = this.props;
        return (
            <div className="support content">
                <div className="content_inner">
                    <div className="content_header">
                        Unsubscribe
                    </div>
                { support.get('unsubscribeRequestSent') ? this.renderRequestSent() : 
                    ( support.get('unsubscribeRequestError') ? this.renderRequestError() : this.renderRequest() ) 
                }
                </div>
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
