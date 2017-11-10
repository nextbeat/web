import * as React from 'react'
import { connect } from 'react-redux'

import Support from '@models/state/pages/support'
import { sendPasswordResetRequest } from '@actions/pages/support'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    resetRequestError: string
    resetRequestSent: boolean
}

type Props = ConnectProps & DispatchProps

class PasswordResetRequest extends React.Component<Props> {

    private _email: HTMLInputElement

    constructor(props: Props) {
        super(props);
        
        this.submitRequest = this.submitRequest.bind(this);
        this.renderRequest = this.renderRequest.bind(this);
    }

    // Actions

    submitRequest(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const email = this._email.value;
        this.props.dispatch(sendPasswordResetRequest(email))
    }

    // Render

    renderRequestSent() {
        return <p>Instructions to reset your password have been sent. If you do not receive an email shortly, please check your spam folder.</p>
    }

    renderRequest() {
        const { resetRequestError } = this.props;
        return (
            <div>
                <p>Please enter the email address associated with your account. You will be sent an email with instructions on how to reset your password.</p>
                { resetRequestError === "Email not found." && <p className="has-error">We were unable to find a Nextbeat account associated with that email address. Please try again.</p>}
                { resetRequestError === "Invalid email." && <p className="has-error">Please enter a valid email address.</p>}
                <form>
                    <input type="email" ref={(c) => { if (c) { this._email = c } }} name="email" placeholder="Email address" />
                    <div className="support_submit"><a className="btn" onClick={this.submitRequest}>Submit</a></div>
                </form>
            </div>
        );
    }

    render() {
        const { resetRequestSent } = this.props;
        return (
            <div className="support content">
                <div className="content_inner">
                    <div className="content_header">
                        Reset Password Request
                    </div>
                    { resetRequestSent ? this.renderRequestSent() : this.renderRequest() }
                </div>

            </div>
        );
    }

}

function mapStateToProps(state: State): ConnectProps {
    return {
        resetRequestError: Support.get(state, 'resetRequestError'),
        resetRequestSent: Support.get(state, 'resetRequestSent')
    }
}

export default connect(mapStateToProps)(PasswordResetRequest);
