import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'

import Modal from '@components/shared/Modal'
import Spinner from '@components/shared/Spinner'
import { closeModal } from '@actions/app'
import { closeStack, deleteStack } from '@actions/pages/room'
import CurrentUser from '@models/state/currentUser'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'

interface Props {
    hasDeleted: boolean
    isDeleting: boolean
    deleteError: string
    hasClosed: boolean
    isClosing: boolean
    closeError: string
    username: string
}

type AllProps = Props & DispatchProps

class StackActions extends React.Component<AllProps> {

    constructor(props: AllProps) {
        super(props)

        this.renderCloseModal = this.renderCloseModal.bind(this)
        this.renderDeleteModal = this.renderDeleteModal.bind(this)
    }

    componentWillReceiveProps(nextProps: AllProps) {
        if (!this.props.hasDeleted && nextProps.hasDeleted) {
            // successfully deleted; navigate to profile
            this.props.dispatch(closeModal())
            browserHistory.push(`/u/${this.props.username}`)
        }

        if (!this.props.hasClosed && nextProps.hasClosed) {
            this.props.dispatch(closeModal())
        }
    }

    renderCloseModal() {
        const { isClosing, closeError, dispatch } = this.props
        return (
            <Modal name="close-room" className="modal-alert">
                <div className="modal_header">
                    Close room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to close this room? <b>This action cannot be reversed.</b>
                </div>
                { closeError && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(closeStack())}}>
                    { isClosing ? <Spinner styles={["white"]} /> : 'Close room' }
                </a>
                <a className="modal-alert_btn btn btn-gray" onClick={() => {dispatch(closeModal())}}>
                    Cancel
                </a>
            </Modal>
        )
    }

    renderDeleteModal() {
        const { isDeleting, deleteError, dispatch } = this.props
        return (
            <Modal name="delete-room" className="modal-alert">
                <div className="modal_header">
                    Delete room
                </div>
                <div className="modal-alert_text">
                    Are you sure you want to delete this room? <b>This action cannot be reversed.</b>
                </div>
                { deleteError && 
                    <div className="modal-alert_error">There was an error processing your request. Please try again.</div>
                }
                <a className="modal-alert_btn btn" onClick={() => {dispatch(deleteStack())}}>
                    { isDeleting ? <Spinner styles={["white"]} /> : 'Delete room' }
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

function mapStateToProps(state: State): Props {
    return {
        hasDeleted: RoomPage.get(state, 'hasDeleted'),
        isDeleting: RoomPage.get(state, 'isDeleting'),
        deleteError: RoomPage.get(state, 'deleteError'),
        hasClosed: RoomPage.get(state, 'hasClosed'),
        isClosing: RoomPage.get(state, 'isClosing'),
        closeError: RoomPage.get(state, 'closeError'),
        username: CurrentUser.entity(state).get('username')
    }
}

export default connect(mapStateToProps)(StackActions);
