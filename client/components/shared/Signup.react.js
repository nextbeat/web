import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { promptModal, signup } from '../../actions'
import { CurrentUser } from '../../models'
import Modal from './Modal.react'

class Signup extends React.Component {

    constructor(props) {
        super(props)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleSignupSubmit = this.handleSignupSubmit.bind(this)
        this.handleLoginClick = this.handleLoginClick.bind(this)
    }


    // Events

    handleKeyPress(e) {
        if (e.charCode === 13) {
            this.handleSignupSubmit(e)
        }
    }

    handleSignupSubmit(e) {
        e.preventDefault();
        const email = findDOMNode(this.refs.signup_email).value;
        const username = findDOMNode(this.refs.signup_username).value;
        const password = findDOMNode(this.refs.signup_password).value;
        this.props.dispatch(signup({ email, username, password }));
    }   

    handleLoginClick(e) {
        e.preventDefault();
        this.props.dispatch(promptModal('login'))
    }


    // Render

    render() {
        const { currentUser } = this.props;
        return (
            <Modal name="signup" className="modal-auth">
                <form className="modal_form" id="signup-form" onKeyPress={this.handleKeyPress} >
                    <input style={{display: "none"}} type="text" name="somefakename" />
                    <input style={{display: "none"}} type="password" name="anotherfakename" />
                    <div className="modal_input-wrapper">
                        <input type="text" ref="signup_email" name="signup_email" placeholder="Email" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input type="text" autoComplete="off" ref="signup_username" name="signup_username" placeholder="Username" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input type="password" autoComplete="new-password" ref="signup_password" name="signup_password" placeholder="Password" />
                    </div>
                    <div className="modal_input-description">
                        By signing up, you indicate that you agree with our <a>Terms of Service</a> and <a>Privacy Policy</a>.
                    </div>
                    <div className="modal_input-wrapper modal_input-wrapper-submit">
                        <a className="btn modal_form_submit" onClick={this.handleSignupSubmit}>Sign Up</a>
                    </div>
                    { currentUser.has('signupError') && <div className="modal-auth_error">{currentUser.get('signupError')}</div> }
                </form>
                <div className="modal_extra">Already have an account? <a onClick={this.handleLoginClick}>Log in!</a></div>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(Signup);
