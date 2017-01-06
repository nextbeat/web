import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'

import { promptModal, login } from '../../actions'
import { CurrentUser } from '../../models'
import Modal from './Modal.react'

class Login extends React.Component {

    constructor(props) {
        super(props)

        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this)
        this.handleSignupClick = this.handleSignupClick.bind(this)
    }


    // Events

    handleKeyPress(e) {
        if (e.charCode === 13) {
            this.handleLoginSubmit(e)
        }
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const username = findDOMNode(this.refs.login_username).value;
        const password = findDOMNode(this.refs.login_password).value;
        this.props.dispatch(login(username, password));
    }

    handleSignupClick(e) {
        e.preventDefault();
        this.props.dispatch(promptModal('signup'))
    }


    // Render

    render() {
        const { currentUser } = this.props;
        return (
            <Modal name="login" className="modal-auth">
                <form className="modal_form" id="login-form" onKeyPress={this.handleKeyPress}>
                    <div className="modal_input-wrapper">
                        <input type="text" ref="login_username" name="login_username" placeholder="Username" />
                    </div>
                    <div className="modal_input-wrapper">
                        <input className="modal-login_password" type="password" ref="login_password" name="login_password" placeholder="Password" />
                    </div>
                    <div className="modal_input-description">
                        <a href="/support/password-reset-request">Forgot your password?</a>
                    </div>
                    <div className="modal_input-wrapper modal_input-wrapper-submit">
                        <a className="btn modal_form_submit" onClick={this.handleLoginSubmit}>Log In</a>
                    </div>
                    { currentUser.has('loginError') && <div className="modal-auth_error">{currentUser.get('loginError')}</div> }
                </form>
                <div className="modal_extra">Don't have an account? <a onClick={this.handleSignupClick}>Sign up!</a></div>
            </Modal>
        )
    }

  
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(Login);
