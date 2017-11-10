import * as React from 'react'
import { connect } from 'react-redux'

import { uploadProfilePicture } from '@actions/upload'
import { closeModal } from '@actions/app'
import Modal from '@components/shared/Modal'
import { DispatchProps } from '@types'

class EditProfilePictureModal extends React.Component<DispatchProps> {

    constructor(props: DispatchProps) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleUploadClick = this.handleUploadClick.bind(this)
        this.handleCancelClick = this.handleCancelClick.bind(this)
    }

    handleInputChange(e: React.FormEvent<HTMLInputElement>) {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const file = e.currentTarget.files[0]
            if (['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1) {
                // todo: show alert
                this.props.dispatch(uploadProfilePicture(file))
                this.props.dispatch(closeModal())
            }
        }
    }

    handleUploadClick() {
        $("#edit-profile_edit-profpic_file-select").click();
    }

    handleCancelClick() {
        this.props.dispatch(closeModal())
    }


    render() {
        return (
            <Modal name="edit-profile-picture" className="modal-action">
                <input type="file" id="edit-profile_edit-profpic_file-select" className="upload_file-input" onChange={this.handleInputChange} accept="image/jpeg,image/png,image/gif" />
                <div className="modal_header">
                    Edit profile picture
                </div>
                <div className="modal-action_btn btn" onClick={this.handleUploadClick}>
                    Upload photo
                </div>
                <div className="modal-action_btn btn btn-gray" onClick={this.handleCancelClick}>
                    Cancel
                </div>
            </Modal>
        )
    }
}

export default connect()(EditProfilePictureModal);
