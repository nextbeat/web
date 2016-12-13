import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { parse } from 'querystring'
import get from 'lodash/get'

import { Support } from '../../../models'
import { validatePasswordResetToken, resetPassword } from '../../../actions'

class PasswordReset extends React.Component {

    constructor(props) {
        super(props);

        this.getToken = this.getToken.bind(this);
        this.submitReset = this.submitReset.bind(this);
        this.renderInvalidToken = this.renderInvalidToken.bind(this);
        this.renderPasswordResetForm = this.renderPasswordResetForm.bind(this);
    }

    getToken() {
        const queryString = this.props.location.search.substring(1);
        return get(parse(queryString), 'token', '')
    }

    componentDidMount() {
        this.props.dispatch(validatePasswordResetToken(this.getToken()))
    }

    submitReset(e) {
        e.preventDefault();
        const password = findDOMNode(this.refs.password).value;
        const passwordConfirm = findDOMNode(this.refs.passwordConfirm).value;
        const token = this.getToken();
        this.props.dispatch(resetPassword(password, passwordConfirm, token));
    }

    renderInvalidToken() {
        const { support } = this.props;
        return (
            <div>
                { support.has('tokenError') && 
                <div>
                <p className="has-error">This password reset link has expired. Each link may be used only once and expires after four hours.</p>
                <p><Link to="/support/password-reset-request" className="btn">Request a new password reset link.</Link></p>
                </div>
                }
            </div>

        );
    }

    renderPasswordResetForm() {
        const { support } = this.props;
        return (
            <div>
                <p>We recommend a password with 6 or more characters, containing a combination of uppercase letters, lowercase letters, numbers, and symbols.</p>
                { support.has('passwordResetError') && <p className="has-error">{support.get('passwordResetError')}</p> }
                <p>Username: <em>{support.get('tokenUsername')}</em></p>
                <form>
                    <input type="password" ref="password" name="password" placeholder="Enter new password" />
                    <input type="password" ref="passwordConfirm" name="passwordConfirm" placeholder="Confirm new password" />
                    <div className="support_submit"><a className="btn" onClick={this.submitReset}>Submit</a></div>
                </form>
            </div>
        );
    }

    renderSuccess() {
        return <div><p>Your password has been updated!</p></div>
    }

    render() {
        const { support } = this.props;
        return (
            <div className="support content">
                <div className="content_inner">
                    <div className="content_header">
                        Reset Your Password
                    </div>
                    { support.get('tokenValidated') ? 
                        ( support.get('passwordReset') ? this.renderSuccess() : this.renderPasswordResetForm() )
                        : this.renderInvalidToken() }
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

export default connect(mapStateToProps)(PasswordReset);
