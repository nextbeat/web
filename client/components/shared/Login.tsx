import * as React from 'react'
import { connect } from 'react-redux'

import { promptModal } from '@actions/app'
import { login } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import Modal from '@components/shared/Modal'
import { State, DispatchProps } from '@types'

interface Props {
    loginError: string
}

type AllProps = Props & DispatchProps

class Login extends React.Component<AllProps> {

    private _loginUsername: HTMLInputElement
    private _loginPassword: HTMLInputElement

    constructor(props: AllProps) {
        super(props)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this)
        this.handleSignupClick = this.handleSignupClick.bind(this)
    }


    // Events

    handleKeyPress(e: React.KeyboardEvent<HTMLElement>) {
        if (e.charCode === 13) {
            this.handleLoginSubmit(e)
        }
    }

    handleLoginSubmit(e: React.FormEvent<HTMLElement>) {
        e.preventDefault();
        const username = this._loginUsername.value
        const password = this._loginPassword.value
        this.props.dispatch(login(username, password));
    }

    handleSignupClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.props.dispatch(promptModal('signup'))
    }


    // Render

    render() {
        const { loginError } = this.props;
        return (
            <Modal name="login" className="modal-auth">
                <form className="modal_form" id="login-form" onKeyPress={this.handleKeyPress}>
                    <div className="modal_input-wrapper">
                        <input type="text" ref={(c) => { if (c) { this._loginUsername = c } }} name="login_username" placeholder="Username" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input className="modal-login_password" type="password" ref={(c) => { if (c) { this._loginPassword = c } }} name="login_password" placeholder="Password" />
                    </div>
                    <div className="modal_input-description">
                        <a href="/support/password-reset-request">Forgot your password?</a>
                    </div>
                    <div className="modal_input-wrapper modal_input-wrapper-submit">
                        <a className="btn modal_form_submit" onClick={this.handleLoginSubmit}>Log In</a>
                    </div>
                    { !!loginError && <div className="modal-auth_error">{loginError}</div> }
                </form>
                <div className="modal_extra">Don't have an account? <a onClick={this.handleSignupClick}>Sign up!</a></div>
            </Modal>
        )
    }

  
}

function mapStateToProps(state: State): Props {
    return {
        loginError: CurrentUser.get(state, 'loginError')
    }
}

export default connect(mapStateToProps)(Login);
