import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import FileSelect from './upload/FileSelect.react'
import UploadBar from './upload/UploadBar.react'
import AddToRoom from './upload/AddToRoom.react'
import CreateRoom from './upload/CreateRoom.react'
import Spinner from './shared/Spinner.react'
import { Upload as UploadModel, CurrentUser } from '../models'

import { submitStackRequest, clearUpload, selectStackForUpload } from '../actions'

class Upload extends React.Component {

    constructor(props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
    }

    // Component lifecycle

    componentWillReceiveProps(nextProps) {
        if (this.props.user.get('stacksFetching') 
            && !nextProps.user.get('stacksFetching') 
            && nextProps.user.openStacks().size === 0)
        {
            // user has no open stacks, so
            // we automatically trigger new stack selection
            this.props.dispatch(selectStackForUpload(-1))
        }
    }
    componentWillUnmount() {
        this.props.dispatch(clearUpload())
    }


    // Event handlers

    handleSubmit() {
        const { upload, dispatch } = this.props 
        if (upload.isSubmittable()) {
            dispatch(submitStackRequest())
        }
    }


    // Render

    renderSubmitForms() {
        const { upload, user } = this.props
        return (
            <div className="upload_submit-forms">
                { user.get('stacksFetching') && <Spinner type="grey large" /> }
                { user.openStacks().size > 0 && <AddToRoom upload={upload} stacks={user.openStacks()} /> }
                { upload.hasSelectedNewStack() && <CreateRoom upload={upload} stacks={user.openStacks()} /> }
                <div className="upload_submit-container">
                    <a className={`btn ${upload.isSubmittable() ? '' : 'btn-inactive'} upload_submit`} onClick={this.handleSubmit}>Submit</a>
                </div>
            </div>
        )
    } 

    renderSubmitRequested() {
        const { upload } = this.props
        return (
            <div className="upload_submit-requested">
                { upload.get('submitStackRequested') && 
                    <div>
                        Your {upload.fileType()} is still processing. Please leave this page open until it finishes.
                    </div>
                }
                { upload.get('isSubmittingStack') && <Spinner type="grey large" /> }
                { upload.get('stackSubmitted') && <div>Success!</div> }
                { upload.get('submitStackError') && <div>There was an error :(</div> }
            </div>
        )
    }

    render() {
        const { upload } = this.props 

        const defaultDragFn = e => { e.preventDefault() }
        const dragEvents = {
            onDragEnter: defaultDragFn,
            onDragOver: defaultDragFn,
            onDragExit: defaultDragFn,
            onDragLeave: defaultDragFn,
            onDrop: defaultDragFn,
            onDragStart: defaultDragFn,
            onDragEnd: defaultDragFn,
            onDrag: defaultDragFn
        }

        return (
            <div className="upload content" {...dragEvents} >
                <Helmet title="Upload"/>
                <div className="upload_header">
                    Upload file
                </div>
                <FileSelect upload={upload} />
                { upload.hasFile() && 
                    <div className="upload_post-upload">
                        <UploadBar upload={upload} /> 
                        { upload.isInSubmitProcess() ? this.renderSubmitRequested() : this.renderSubmitForms() }
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        upload: new UploadModel(state),
        user: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(Upload);
