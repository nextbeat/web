import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { parse } from 'querystring'
import get from 'lodash-es/get'

import Support from '@models/state/pages/support'
import { sendEmailUnsubscribeRequest } from '@actions/pages/support'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    unsubscribeRequestSent: boolean
    unsubscribeRequestError: string
}

type Props = ConnectProps & DispatchProps & RouteProps<{}>

class PasswordResetRequest extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        
        this.submitRequest = this.submitRequest.bind(this);
        this.renderRequest = this.renderRequest.bind(this);
    }

    // Actions

    submitRequest() {
        const queryString = this.props.location.search.substring(1);
        const uuid = get(parse(queryString), 'uuid', '') as string
        const signature = get(parse(queryString), 'sig', '') as string

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
        return (
            <div>
                <p>Click the button below to unsubscribe from all Nextbeat email notifications.</p>
                <div className="support_submit"><a className="btn" onClick={this.submitRequest}>Unsubscribe</a></div>
            </div>
        );
    }

    render() {
        const { unsubscribeRequestError, unsubscribeRequestSent } = this.props;
        return (
            <div className="support content">
                <div className="content_inner">
                    <div className="content_header">
                        Unsubscribe
                    </div>
                { unsubscribeRequestSent ? this.renderRequestSent() : 
                    ( unsubscribeRequestError ? this.renderRequestError() : this.renderRequest() ) 
                }
                </div>
            </div>
        );
    }

}

function mapStateToProps(state: State): ConnectProps {
    return {
        unsubscribeRequestError: Support.get(state, 'unsubscribeRequestError'),
        unsubscribeRequestSent: Support.get(state, 'unsubscribeRequestSent')
    }
}

export default connect(mapStateToProps)(PasswordResetRequest);
