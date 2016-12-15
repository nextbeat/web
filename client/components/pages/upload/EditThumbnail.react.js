import React from 'react'
import { connect } from 'react-redux'

import Modal from '../../shared/Modal.react'
import { uploadThumbnail, clearThumbnail, closeModal } from '../../../actions'
import { generateUuid } from '../../../utils'


class EditThumbnail extends React.Component {

    constructor(props) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleCustomClick = this.handleCustomClick.bind(this)
        this.handleDefaultClick = this.handleDefaultClick.bind(this)
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            const ext = file.name.split('.')[file.name.split('.').length-1]
            const key = `thumbnails/${generateUuid()}.${ext}`

            if (['image/jpeg', 'image/png', 'image/gif'].indexOf(file.type) !== -1) {
                // todo: show alert
                this.props.dispatch(uploadThumbnail(file, key))
                this.props.dispatch(closeModal())
            }
        }
    }

    handleCustomClick() {
        $('#upload_edit-thumbnail_file-select').click();
    }

    handleDefaultClick() {
        this.props.dispatch(clearThumbnail())
        this.props.dispatch(closeModal())
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

export default connect()(EditThumbnail);
