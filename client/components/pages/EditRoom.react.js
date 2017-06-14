import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { List } from 'immutable'
import Helmet from 'react-helmet'

import Icon from '../shared/Icon.react'
import Spinner from '../shared/Spinner.react'
import TagsInput from '../room/edit/TagsInput.react'
import Select from '../shared/Select.react'
import EditThumbnailModal from './upload/EditThumbnailModal.react'
import EditRoomThumbnail from './edit/EditRoomThumbnail.react'

import { EditRoom as EditRoomModel } from '../../models'
import { loadEditRoom, clearEditRoom, updateEditRoom, submitEditRoom, useDefaultThumbnail, clearFileUpload, UploadTypes } from '../../actions'

class EditRoom extends React.Component {

    constructor(props) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
        this.handleTitleChange = this.handleTitleChange.bind(this)
        this.handleTagsChange = this.handleTagsChange.bind(this)
        this.handleStatusChange = this.handleStatusChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.thumbnailDefaultFn = this.thumbnailDefaultFn.bind(this)
    }

    componentDidMount() {
        const { params, dispatch } = this.props
        dispatch(loadEditRoom(params.hid))
    }

    componentWillUnmount() {
        this.props.dispatch(clearEditRoom())
        this.props.dispatch(clearFileUpload(UploadTypes.THUMBNAIL))
    }

    // Events

    handleBackClick() {
        const { params } = this.props
        browserHistory.push(`/r/${params.hid}`)
    }

    handleTitleChange(e) {
        this.props.dispatch(updateEditRoom({ description: e.target.value.substring(0, 60) }))
    }

    handleTagsChange(tags) {
        this.props.dispatch(updateEditRoom({ tags }))
    }

    handleStatusChange(status) {
        this.props.dispatch(updateEditRoom({ privacy_status: status }))
    }

    handleSubmit() {
        const { dispatch, editRoom } = this.props
        if (editRoom.canSubmit()) {
            this.props.dispatch(submitEditRoom())
        }
    }

    thumbnailDefaultFn() {
        this.props.dispatch(useDefaultThumbnail())
    }


    // Render

    render() {
        const { editRoom } = this.props 
        let room = editRoom.get('roomFields')

        // todo: error message if not authorized
        return (
            <div className="edit edit-room content">
                <Helmet title="Edit Room" />
                <EditThumbnailModal defaultFn={this.thumbnailDefaultFn} />
                <div className="content_inner">
                    <div className="content_header">
                         <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div> Edit Room
                    </div>
                    { editRoom.isAuthorized() &&
                    <div className="edit_form">
                        <EditRoomThumbnail />
                        <div className="edit_form-item">
                            <label>Title</label><input type="text" onChange={this.handleTitleChange} value={room.get('description')} />
                        </div>
                        <div className="edit_form-item">
                            <label>Tags</label>
                            <div className="edit-room_tags-container">
                                <TagsInput tags={room.get('tags', List())} onChange={this.handleTagsChange} />
                            </div>
                        </div>
                        <div className="edit_form-item">
                            <label>Status</label>
                            <Select 
                                className="edit_select"
                                selected={room.get('privacy_status')} 
                                values={['public', 'unlisted']} 
                                onChange={this.handleStatusChange} 
                            />
                        </div>
                        <div className="edit_separator"></div>
                        <div className="edit_submit">
                            <div className="edit_submit-btn"><a className={`btn ${!editRoom.canSubmit() ? 'btn-gray btn-disabled' : ''}`} onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit_submit-result">
                                { editRoom.isSubmitting() && <Spinner type="grey small" /> } 
                                { editRoom.hasSubmitted() && "Changes saved." }
                                { editRoom.submitError() && <div className="error">Unknown error. Please try again.</div> }
                            </div>
                        </div>
                    </div>
                    }
                    { editRoom.isLoaded() && !editRoom.isAuthorized() &&
                    <div className="edit-room_error">
                        You do not have permission to edit this room.
                    </div>
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        editRoom: new EditRoomModel(state)
    }
}

export default connect(mapStateToProps)(EditRoom);
