import React from 'react'
import { connect } from 'react-redux'

import EditThumbnailModal from './EditThumbnailModal.react'
import CreateRoomThumbnail from './CreateRoomThumbnail.react'
import Icon from '../../shared/Icon.react'
import Select from '../../shared/Select.react'
import TagsInput from '../../room/edit/TagsInput.react'

import { selectStackForUpload, updateNewStack, promptModal, UploadTypes } from '../../../actions'

class CreateRoom extends React.Component {

    constructor(props) {
        super(props)

        this.handleClose = this.handleClose.bind(this)
        this.updateTags = this.updateTags.bind(this)

        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleEditThumbnailClick = this.handleEditThumbnailClick.bind(this)
    }


    // Event handlers

    updateTags(tags) {
        this.props.dispatch(updateNewStack({ tags }))
    }

    handleClose() {
        // deselects new stack item
        this.props.dispatch(selectStackForUpload(null))
    }

    handleTitleChange(e) {
        this.props.dispatch(updateNewStack({ 
            title: e.target.value.substring(0, 60)
        }))
    }

    handleStatusChange(value) {
        this.props.dispatch(updateNewStack({
            privacyStatus: value
        }))
    }

    handleEditThumbnailClick(e) {
        this.props.dispatch(promptModal('edit-thumbnail'))
    }


    // Render

    render() {
        const { upload, stacks } = this.props

        const newStack = upload.get('newStack')

        return (
            <div className="upload_create-room">
                <EditThumbnailModal />
                <div className="upload_subheader">
                    Make new room
                    { stacks.size > 0 && <div onClick={this.handleClose}><Icon type="close" /></div> }
                </div>
                <div className="upload_create-room_form">
                    <div className="upload_create-room_left">
                        <div className="upload_create-room_thumb">
                            <CreateRoomThumbnail upload={upload} file={upload.get(UploadTypes.MEDIA_ITEM, 'file')} />
                            <div className="upload_create-room_thumb_prompt" onClick={this.handleEditThumbnailClick}>
                                Edit thumbnail
                            </div>
                        </div>
                    </div>
                    <div className="upload_create-room_main">
                        <input className="upload_create-room_input" type="text" value={newStack.get('title')} onChange={this.handleTitleChange} placeholder="Title" />
                        <TagsInput tags={newStack.get('tags')} onChange={this.updateTags} />
                    </div>
                    <div className="upload_create-room_right">
                        <Select selected={newStack.get('privacyStatus')} values={['public', 'unlisted']} onChange={this.handleStatusChange} />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect()(CreateRoom);
