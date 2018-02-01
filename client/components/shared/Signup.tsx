import * as React from 'react'
import { connect } from 'react-redux'

import { promptModal } from '@actions/app'
import { signup } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import Modal from '@components/shared/Modal'
import { State, DispatchProps } from '@types'

interface Props {
    signupError: string
}

type AllProps = Props & DispatchProps

class Signup extends React.Component<AllProps> {

    private _signupEmail: HTMLInputElement
    private _signupUsername: HTMLInputElement
    private _signupPassword: HTMLInputElement

    constructor(props: AllProps) {
        super(props)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this)
        this.handleLoginClick = this.handleLoginClick.bind(this)
    }

    // Events

    handleKeyPress(e: React.KeyboardEvent<HTMLElement>) {
        if (e.charCode === 13) {
            this.handleSignupSubmit(e)
        }
    }

    handleSignupSubmit(e: React.FormEvent<HTMLElement>) {
        e.preventDefault();
        const email = this._signupEmail.value
        const username = this._signupUsername.value
        const password = this._signupPassword.value
        this.props.dispatch(signup({ email, username, password }));
    }   

    handleLoginClick(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
        this.props.dispatch(promptModal('login'))
    }


    // Render

    render() {
        const { signupError } = this.props;
        return (
            <Modal name="signup" className="modal-auth">
                <form className="modal_form" id="signup-form" onKeyPress={this.handleKeyPress} >
                    <input style={{display: "none"}} type="text" name="somefakename" />
                    <input style={{display: "none"}} type="password" name="anotherfakename" />
                    <div className="modal_input-wrapper">
                        <input type="text" ref={(c) => { if (c) { this._signupEmail = c } }} name="signup_email" placeholder="Email" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input type="text" autoComplete="off" ref={(c) => { if (c) { this._signupUsername = c } }} name="signup_username" placeholder="Username" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input type="password" autoComplete="new-password" ref={(c) => { if (c) { this._signupPassword = c } }} name="signup_password" placeholder="Password" />
                    </div>
                    <div className="modal_input-description">
                        By signing up, you indicate that you agree with our <a>Terms of Service</a> and <a>Privacy Policy</a>.
                    </div>
                    <div className="modal_input-wrapper modal_input-wrapper-submit">
                        <a className="btn modal_form_submit" onClick={this.handleSignupSubmit}>Sign Up</a>
                    </div>
                    { !!signupError && <div className="modal-auth_error">{signupError}</div> }
                </form>
                <div className="modal_extra">Already have an account? <a onClick={this.handleLoginClick}>Log in!</a></div>
            </Modal>
        )
    }
}

function mapStateToProps(state: State): Props {
    return {
        signupError: CurrentUser.get(state, 'signupError')
    }
}

export default connect(mapStateToProps)(Signup);
