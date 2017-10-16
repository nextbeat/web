import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'
import { List } from 'immutable'
import TransitionGroup from 'react-transition-group/TransitionGroup'
import CSSTransition from 'react-transition-group/CSSTransition'

import FileSelect from './upload/FileSelect.react'
import UploadBar from './upload/UploadBar.react'
import AddToRoom from './upload/AddToRoom.react'
import CreateRoom from './upload/CreateRoom.react'
import Spinner from '../shared/Spinner.react'
import Icon from '../shared/Icon.react'
import PageError from '../shared/PageError.react'
import { Upload as UploadModel, CurrentUser, App } from '../../models'
import { baseUrl } from '../../utils'

import { UploadTypes, submitStackRequest, clearUpload, selectStackForUpload, triggerAuthError } from '../../actions'

const UploadComponentTransition = (props) => (
    <CSSTransition {...props} timeout={{ enter: 300, exit: 150 }} classNames="upload" />
)

class Upload extends React.Component {

    constructor(props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleRestart = this.handleRestart.bind(this)

        this.renderSubmitForms = this.renderSubmitForms.bind(this)
        this.renderSubmitRequested = this.renderSubmitRequested.bind(this)
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

        if (!this.props.user.isLoggedIn() && !this.props.user.get('isLoggingIn') && !this.props.app.hasAuthError()) {
            this.props.dispatch(triggerAuthError())
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

    handleRestart() {
        this.props.dispatch(clearUpload())
    }


    // Render

    renderSubmitForms() {
        const { upload, user } = this.props
        return (
            <div className="upload_submit-forms">
                { user.get('stacksFetching') && <Spinner type="grey upload-stacks" /> }
                <TransitionGroup>
                { user.openStacks().size > 0 && 
                    <UploadComponentTransition>
                        <AddToRoom key='add-to-room' upload={upload} stacks={user.openStacks()} />
                    </UploadComponentTransition> 
                }
                { upload.hasSelectedNewStack() && 
                    <UploadComponentTransition>
                        <CreateRoom key='create-room' upload={upload} stacks={user.openStacks()} />
                    </UploadComponentTransition> 
                }
                </TransitionGroup>
                <div className="upload_submit-container">
                    <a className={`btn ${upload.isSubmittable() ? '' : 'btn-inactive'} upload_submit`} onClick={this.handleSubmit}>Submit</a>
                </div>
            </div>
        )
    } 

    renderSubmitRequested() {
        const { upload } = this.props

        if (upload.get('selectedStackId') > 0) {
            var fullStackUrl = `${baseUrl()}/r/${upload.selectedStack().get('hid')}/latest`
            var stackUrl = `/r/${upload.selectedStack().get('hid')}/latest`
        }

        return (
            <div className="upload_submit-requested">
                { upload.get('submitStackRequested') && 
                    <div>
                        Your { upload.fileType() } is still uploading. Please leave this page open until it finishes.
                    </div>
                }
                { upload.get('isSubmittingStack') && <Spinner type="grey large upload-submit" /> }
                { upload.get('stackSubmitted') && 
                    <div>
                        <Icon type="check" />
                        <div className="upload_success-message">
                            Your {upload.fileType()} has been submitted! See it live at <Link to={stackUrl}>{fullStackUrl}</Link>
                        </div>
                        <div><a className="btn upload_restart" onClick={this.handleRestart}>Upload another file</a></div>
                    </div> 
                }
                { upload.get('submitStackError') && 
                    <div>
                        There was an error submitting your {upload.fileType()}. Please try again.
                        <div><a className="btn upload_restart" onClick={this.handleRestart}>Upload another file</a></div>
                    </div> }
            </div>
        )
    }

    renderIncompatibleBrowser() {
        return (
            <PageError>Your browser isn't modern enough for our high-tech, envelope-pushing upload process. Please consider upgrading.</PageError>
        )
    }

    render() {
        const { upload, app } = this.props 

        if (app.get('browser') === 'IE' && parseInt(app.get('version')) < 10) {
            return this.renderIncompatibleBrowser()
        }

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
                <div>
                    <Helmet title="Upload"/>
                    <div className="content_header">
                        Upload file
                    </div>
                    <FileSelect upload={upload} app={app} file={upload.get(UploadTypes.MEDIA_ITEM, 'file')} />
                    { upload.has('error') && 
                        <div className="upload_error">
                            {upload.get('error')}
                        </div>
                    }
                    { upload.hasFile(UploadTypes.MEDIA_ITEM) && 
                        <div className="upload_post-upload">
                            <UploadBar upload={upload} /> 
                            { upload.isInSubmitProcess() ? this.renderSubmitRequested() : this.renderSubmitForms() }
                        </div>
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        upload: new UploadModel(state),
        user: new CurrentUser(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(Upload);
