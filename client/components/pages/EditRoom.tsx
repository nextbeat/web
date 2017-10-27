import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { List } from 'immutable'
import Helmet from 'react-helmet'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import TagsInput from '@components/room/edit/TagsInput'
import Select from '@components/shared/Select'
import EditThumbnailModal from './upload/EditThumbnailModal'
import EditRoomThumbnail from './edit/EditRoomThumbnail'

import EditRoomModel from '@models/state/pages/editRoom'
import { loadEditRoom, clearEditRoom, updateEditRoom, submitEditRoom, useDefaultThumbnail } from '@actions/pages/editRoom'
import { clearFileUpload } from '@actions/upload'
import { UploadType } from '@upload'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    roomFields: State

    isLoaded: boolean
    isAuthorized: boolean

    canSubmit: boolean
    isSubmitting: boolean
    hasSubmitted: boolean
    submitError: string
}

interface Params {
    hid: string
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

class EditRoom extends React.Component<Props> {

    constructor(props: Props) {
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
        this.props.dispatch(clearFileUpload(UploadType.Thumbnail))
    }

    // Events

    handleBackClick() {
        const { params } = this.props
        browserHistory.push(`/r/${params.hid}`)
    }

    handleTitleChange(e: React.FormEvent<HTMLInputElement>) {
        this.props.dispatch(updateEditRoom({ description: e.currentTarget.value.substring(0, 60) }))
    }

    handleTagsChange(tags: List<string>) {
        this.props.dispatch(updateEditRoom({ tags }))
    }

    handleStatusChange(status: string) {
        this.props.dispatch(updateEditRoom({ privacy_status: status }))
    }

    handleSubmit() {
        const { dispatch, canSubmit } = this.props
        if (canSubmit) {
            this.props.dispatch(submitEditRoom())
        }
    }

    thumbnailDefaultFn() {
        this.props.dispatch(useDefaultThumbnail())
    }


    // Render

    render() {
        const { roomFields, isAuthorized, isLoaded, canSubmit,
                isSubmitting, hasSubmitted, submitError } = this.props 

        return (
            <div className="edit edit-room content">
                <Helmet title="Edit Room" />
                <EditThumbnailModal defaultFn={this.thumbnailDefaultFn} />
                <div className="content_inner">
                    <div className="content_header">
                         <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div> Edit Room
                    </div>
                    { isAuthorized &&
                    <div className="edit_form">
                        <EditRoomThumbnail />
                        <div className="edit_form-item">
                            <label>Title</label><input type="text" onChange={this.handleTitleChange} value={roomFields.get('description')} />
                        </div>
                        <div className="edit_form-item">
                            <label>Tags</label>
                            <div className="edit-room_tags-container">
                                <TagsInput tags={roomFields.get('tags', List())} onChange={this.handleTagsChange} />
                            </div>
                        </div>
                        <div className="edit_form-item">
                            <label>Status</label>
                            <Select 
                                className="edit_select"
                                selected={roomFields.get('privacy_status')} 
                                values={['public', 'unlisted']} 
                                onChange={this.handleStatusChange} 
                            />
                        </div>
                        <div className="edit_separator"></div>
                        <div className="edit_submit">
                            <div className="edit_submit-btn"><a className={`btn ${!canSubmit ? 'btn-gray btn-disabled' : ''}`} onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit_submit-result">
                                { isSubmitting && <Spinner styles={["grey", "small"]} /> } 
                                { hasSubmitted && "Changes saved." }
                                { submitError && <div className="error">Unknown error. Please try again.</div> }
                            </div>
                        </div>
                    </div>
                    }
                    { isAuthorized) && !isAuthorized &&
                    <div className="edit-room_error">
                        You do not have permission to edit this room.
                    </div>
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        roomFields: EditRoomModel.get(state, 'roomFields'),
        isLoaded: EditRoomModel.isLoaded(state),
        isAuthorized: EditRoomModel.isAuthorized(state),
        canSubmit: EditRoomModel.canSubmit(state),
        isSubmitting: EditRoomModel.isSubmitting(state),
        hasSubmitted: EditRoomModel.hasSubmitted(state),
        submitError: EditRoomModel.submitError(state)
    }
}

export default connect(mapStateToProps)(EditRoom);
