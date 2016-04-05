import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { Support } from '../../models'
import { sendPasswordResetRequest } from '../../actions'

class PasswordResetRequest extends React.Component {

    constructor(props) {
        super(props);
        
        this.submitRequest = this.submitRequest.bind(this);
        this.renderRequest = this.renderRequest.bind(this);
    }

    // Actions

    submitRequest(e) {
        e.preventDefault();
        const email = findDOMNode(this.refs.email).value;
        this.props.dispatch(sendPasswordResetRequest(email))
    }

    // Render

    renderRequestSent() {
        return <p>Instructions to reset your password have been sent. If you do not receive an email shortly, please check your spam folder.</p>
    }

    renderRequest() {
        const { support } = this.props;
        return (
            <div>
                <p>Please enter the email address associated with your account. You will be sent an email with instructions on how to reset your password.</p>
                { support.get('resetRequestError') === "Email not found." && <p className="has-error">We were unable to find a Nextbeat account associated with that email address. Please try again.</p>}
                { support.get('resetRequestError') === "Invalid email." && <p className="has-error">Please enter a valid email address.</p>}
                <form>
                    <input type="email" ref="email" name="email" placeholder="Email address" />
                    <a className="btn" onClick={this.submitRequest}>Submit</a>
                </form>
            </div>
        );
    }

    render() {
        const { support } = this.props;
        return (
            <div className="password-reset">
                <h1>Reset Password Request</h1>
                { support.get('resetRequestSent') ? this.renderRequestSent() : this.renderRequest() }
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
