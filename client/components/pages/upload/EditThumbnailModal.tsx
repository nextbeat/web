import * as React from 'react'
import { connect } from 'react-redux'

import Modal from '@components/shared/Modal'
import { uploadThumbnail, clearFileUpload } from '@actions/upload'
import { closeModal } from '@actions/app'
import Upload, { UploadType } from '@models/state/upload'
import { DispatchProps } from '@types'
import { generateUuid } from '@utils'

interface OwnProps {
    defaultFn?: () => void // function called when selecting 'use default thumbnail'
}

type Props = OwnProps & DispatchProps

class EditThumbnailModal extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleCustomClick = this.handleCustomClick.bind(this)
        this.handleDefaultClick = this.handleDefaultClick.bind(this)
    }

    handleInputChange(e: React.FormEvent<HTMLInputElement>) {
        if (e.currentTarget.files && e.currentTarget.files.length > 0) {
            const file = e.currentTarget.files[0]
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
        dispatch(clearFileUpload(UploadType.Thumbnail))
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

export default connect()(EditThumbnailModal);
