import React from 'react'
import { connect } from 'react-redux'

import { uploadCoverImage, closeModal } from '../../../actions'
import Modal from '../../shared/Modal.react'

class EditCoverImageModal extends React.Component {

    constructor(props) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleUploadClick = this.handleUploadClick.bind(this)
        this.handleCancelClick = this.handleCancelClick.bind(this)
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            if (['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1) {
                // todo: show alert
                this.props.dispatch(uploadCoverImage(file))
                this.props.dispatch(closeModal())
            }
        }
    }

    handleUploadClick() {
        $("#edit-profile_edit-cover_image_file-select").click();
    }

    handleCancelClick() {
        this.props.dispatch(closeModal())
    }

    render() {
        return (
            <Modal name="edit-cover-image" className="modal-action">
                <input type="file" id="edit-profile_edit-cover_image_file-select" className="upload_file-input" onChange={this.handleInputChange} accept="image/jpeg,image/png,image/gif" />
                <div className="modal_header">
                    Edit cover photo
                </div>
                <div className="modal-action_btn btn" onClick={this.handleUploadClick}>
                    Upload photo
                </div>
                <div className="modal-action_btn btn btn-gray" onClick={this.handleCancelClick}>
                    Cancel
                </div>
                <div className="modal-action_extra">
                    For best results, images should be 2000x400 and under 3MB.
                </div>
            </Modal>
        )
    }
}

export default connect()(EditCoverImageModal);
