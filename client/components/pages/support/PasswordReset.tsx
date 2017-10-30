import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { parse } from 'querystring'
import get from 'lodash-es/get'

import Support from '@models/state/pages/support'
import { validatePasswordResetToken, resetPassword } from '@actions/pages/support'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    tokenValidated: boolean
    tokenUsername: string
    tokenError: string

    passwordReset: boolean
    passwordResetError: string
}

type Props = ConnectProps & DispatchProps & RouteProps<{}>

class PasswordReset extends React.Component<Props> {

    private _password: HTMLInputElement
    private _passwordConfirm: HTMLInputElement

    constructor(props: Props) {
        super(props);

        this.getToken = this.getToken.bind(this);
        this.submitReset = this.submitReset.bind(this);
        this.renderInvalidToken = this.renderInvalidToken.bind(this);
        this.renderPasswordResetForm = this.renderPasswordResetForm.bind(this);
    }

    getToken() {
        const queryString = this.props.location.search.substring(1);
        return get(parse(queryString), 'token', '') as string
    }

    componentDidMount() {
        this.props.dispatch(validatePasswordResetToken(this.getToken()))
    }

    submitReset(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        const password = this._password.value;
        const passwordConfirm = this._passwordConfirm.value;
        const token = this.getToken();
        this.props.dispatch(resetPassword(password, passwordConfirm, token));
    }

    renderInvalidToken() {
        const { tokenError } = this.props;
        return (
            <div>
                { tokenError && 
                <div>
                <p className="has-error">This password reset link has expired. Each link may be used only once and expires after four hours.</p>
                <p><Link to="/support/password-reset-request" className="btn">Request a new password reset link.</Link></p>
                </div>
                }
            </div>

        );
    }

    renderPasswordResetForm() {
        const { passwordResetError, tokenUsername } = this.props;
        return (
            <div>
                <p>We recommend a password with 6 or more characters, containing a combination of uppercase letters, lowercase letters, numbers, and symbols.</p>
                { passwordResetError && <p className="has-error">{passwordResetError}</p> }
                <p>Username: <em>{tokenUsername}</em></p>
                <form>
                    <input type="password" ref={(c) => { if (c) { this._password = c } }} name="password" placeholder="Enter new password" />
                    <input type="password" ref={(c) => { if (c) { this._passwordConfirm = c } }} name="passwordConfirm" placeholder="Confirm new password" />
                    <div className="support_submit"><a className="btn" onClick={this.submitReset}>Submit</a></div>
                </form>
            </div>
        );
    }

    renderSuccess() {
        return <div><p>Your password has been updated!</p></div>
    }

    render() {
        const { tokenValidated, passwordReset } = this.props;
        return (
            <div className="support content">
                <div className="content_inner">
                    <div className="content_header">
                        Reset Your Password
                    </div>
                    { tokenValidated ? 
                        ( passwordReset ? this.renderSuccess() : this.renderPasswordResetForm() )
                        : this.renderInvalidToken() }
                </div>
            </div> 
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        tokenValidated: Support.get(state, 'tokenValidated'),
        tokenUsername: Support.get(state, 'tokenUsername'),
        tokenError: Support.get(state, 'tokenError'),

        passwordReset: Support.get(state, 'passwordReset'),
        passwordResetError: Support.get(state, 'passwordResetError')
    }
}

export default connect(mapStateToProps)(PasswordReset);
