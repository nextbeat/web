import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import Modal from '../../shared/Modal.react'
import Spinner from '../../shared/Spinner.react'
import { closeModal, closeStack, deleteStack } from '../../../actions'
import { CurrentUser, RoomPage } from '../../../models'

class StackActions extends React.Component {

    constructor(props) {
        super(props)

        this.renderCloseModal = this.renderCloseModal.bind(this)
        this.renderDeleteModal = this.renderDeleteModal.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.roomPage.get('hasDeleted') && nextProps.roomPage.get('hasDeleted')) {
            // successfully deleted; navigate to profile
            this.props.dispatch(closeModal())
            browserHistory.push(`/u/${this.props.user.get('username')}`)
        }

        if (!this.props.roomPage.get('hasClosed') && nextProps.roomPage.get('hasClosed')) {
            this.props.dispatch(closeModal())
        }
    }

    renderCloseModal() {
        const { roomPage, dispatch } = this.props
        return (
            <Modal name="close-room" className="modal-alert">
                <div className="modal_header">
                    Close room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to close this room? <b>This action cannot be reversed.</b>
                </div>
                { roomPage.get('closeError') && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(closeStack())}}>
                    { roomPage.get('isClosing') ? <Spinner type="white" /> : 'Close room' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    renderDeleteModal() {
        const { roomPage, dispatch } = this.props
        return (
            <Modal name="delete-room" className="modal-alert">
                <div className="modal_header">
                    Delete room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to delete this room? <b>This action cannot be reversed.</b>
                </div>
                { roomPage.get('deleteError') && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(deleteStack())}}>
                    { roomPage.get('isDeleting') ? <Spinner type="white" /> : 'Delete room' }
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
        user: new CurrentUser(state),
        roomPage: new RoomPage(state)
    }
}

export default connect(mapStateToProps)(StackActions);
