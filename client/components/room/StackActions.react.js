import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import Modal from '../shared/Modal.react'
import Spinner from '../shared/Spinner.react'
import { closeModal, closeStack, deleteStack } from '../../actions'
import { CurrentUser } from '../../models'

class StackActions extends React.Component {

    constructor(props) {
        super(props)

        this.renderCloseModal = this.renderCloseModal.bind(this)
        this.renderDeleteModal = this.renderDeleteModal.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.stack.get('hasDeleted') && nextProps.stack.get('hasDeleted')) {
            // successfully deleted; navigate to profile
            this.props.dispatch(closeModal())
            browserHistory.push(`/u/${this.props.user.get('username')}`)
        }

        if (!this.props.stack.get('hasClosed') && nextProps.stack.get('hasClosed')) {
            this.props.dispatch(closeModal())
        }
    }

    renderCloseModal() {
        const { stack, dispatch } = this.props
        return (
            <Modal name="close-room" className="modal-alert">
                <div className="modal_header">
                    Close room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to close this room? <b>This action cannot be reversed.</b>
                </div>
                { stack.get('closeError') && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(closeStack())}}>
                    { stack.get('isClosing') ? <Spinner type="white" /> : 'Close room' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    renderDeleteModal() {
        const { stack, dispatch } = this.props
        return (
            <Modal name="delete-room" className="modal-alert">
                <div className="modal_header">
                    Delete room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to delete this room? <b>This action cannot be reversed.</b>
                </div>
                { stack.get('deleteError') && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(deleteStack())}}>
                    { stack.get('isDeleting') ? <Spinner type="white" /> : 'Delete room' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    render() {
        return (
            <div>
                {this.renderCloseModal()}
                {this.renderDeleteModal()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(StackActions);
