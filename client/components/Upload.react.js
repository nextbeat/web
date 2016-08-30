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

import { syncStacks, clearUpload } from '../actions'

class Upload extends React.Component {

    constructor(props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentWillUnmount() {
        this.props.dispatch(clearUpload())
    }

    handleSubmit() {
        const { upload, dispatch } = this.props 
        if (upload.isSubmittable()) {
            dispatch(syncStacks('open', true, upload.stackForSubmission()))
        }
    }

    render() {
        const { upload, user } = this.props 

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
                        { user.get('stacksFetching') && <Spinner type="grey large" /> }
                        { user.openStacks().size > 0 && <AddToRoom upload={upload} stacks={user.openStacks()} /> }
                        { upload.hasSelectedNewStack() && <CreateRoom upload={upload} /> }
                        <div className="upload_submit-container">
                            <a className={`btn ${upload.isSubmittable() ? '' : 'btn-inactive'} upload_submit`} onClick={this.handleSubmit}>Submit</a>
                        </div>
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
