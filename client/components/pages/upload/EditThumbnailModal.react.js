import React from 'react'
import { connect } from 'react-redux'

import Modal from '../../shared/Modal.react'
import { uploadThumbnail, clearFileUpload, closeModal, UploadTypes } from '../../../actions'
import { generateUuid } from '../../../utils'


class EditThumbnailModal extends React.Component {

    constructor(props) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleCustomClick = this.handleCustomClick.bind(this)
        this.handleDefaultClick = this.handleDefaultClick.bind(this)
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            if (['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1) {
                // todo: show alert
                this.props.dispatch(uploadThumbnail(file))
                this.props.dispatch(closeModal())
            }
        }
    }

    handleCustomClick() {
        $('#upload_edit-thumbnail_file-select').click();
    }

    handleDefaultClick() {
        const { dispatch, defaultFn } = this.props
        dispatch(clearFileUpload(UploadTypes.THUMBNAIL))
        dispatch(closeModal())
        
        if (typeof defaultFn === "function") {
            defaultFn();
        }
    }

    render() {
        return (
            <Modal name="edit-thumbnail" className="modal-action">
                <input type="file" id="upload_edit-thumbnail_file-select" className="upload_file-input" onChange={this.handleInputChange} accept="image/jpeg,image/png,image/gif" />
                <div className="modal_header">
                    Edit thumbnail
                </div>
                <div className="modal-action_btn btn" onClick={this.handleCustomClick}>
                    Upload custom thumbnail
                </div>
                <div className="modal-action_btn btn btn-gray" onClick={this.handleDefaultClick}>
                    Use default thumbnail
                </div>
            </Modal>
        );
    }
}

EditThumbnailModal.propTypes = {
    defaultFn: React.PropTypes.func // function called when selecting 'use default thumbnail'
}

export default connect()(EditThumbnailModal);
