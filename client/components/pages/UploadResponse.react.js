import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import FileSelect from './upload/FileSelect.react'
import UploadBar from './upload/UploadBar.react'

import Icon from '../shared/Icon.react'
import Spinner from '../shared/Spinner.react'
import PageError from '../shared/PageError.react'
import { timeString, baseUrl } from '../../utils'
import renderMessageText from '../room/chat/utils/renderMessageText'

import { Upload, App } from '../../models'
import { UploadTypes, loadReferencedComment, submitStackRequest, clearUpload, clearFileUpload } from '../../actions'

class UploadResponse extends React.Component {

    constructor(props) {
        super(props);
        
        this.handleBackClick = this.handleBackClick.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.renderBody = this.renderBody.bind(this)
        this.renderComment = this.renderComment.bind(this)
        this.renderSubmitForms = this.renderSubmitForms.bind(this)
        this.renderSubmitRequested = this.renderSubmitRequested.bind(this)
    }

    componentDidMount() {
        const { dispatch, params } = this.props
        dispatch(loadReferencedComment(params.comment))
    }

    componentWillUnmount() {
        this.props.dispatch(clearUpload())
    }


    // Actions

    handleBackClick() {
        const { params } = this.props
        this.context.router.push(`/r/${params.hid}`)
    }

    handleSubmit() {
        this.props.dispatch(submitStackRequest())
    }

    handleRestart() {
        this.props.dispatch(clearFileUpload(UploadTypes.MEDIA_ITEM))
    }


    // Render
    
    renderNoComment(message) {
        return (
            <div className="upload-response_comment_container">
                <PageError>
                    {message}
                </PageError>
            </div>
        )
    }

    renderComment() {
        const { upload } = this.props;

        const comment = upload.referencedComment()
        const isCreator = comment.stack().author().get('username') === comment.author().get('username')
        const isCreatorClass = isCreator ? "creator" : ""

        return (
            <div className="upload-response_comment_container">
                <div className="upload-response_comment_header">
                    Responding to
                </div>
                <div className="upload-response_comment">
                    <div className="upload-response_comment_inner">
                        <div className="upload-response_comment_info">
                            <span className={`upload-response_comment_username ${isCreatorClass}`}>
                                { comment.author().get('username') }
                            </span>
                            <span className="upload-response_comment_timestamp">
                                { timeString(comment.get('created_at')) }
                            </span>
                        </div>
                        <div className="upload-response_comment_body">
                            { renderMessageText(comment) }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderSubmitForms() {
        return (
            <div className="upload_submit-container">
                <a className="btn upload_submit" onClick={this.handleSubmit}>Submit</a>
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

    renderBody() {
        const { upload, app, params } = this.props 

        try {
            upload.checkReferencedCommentValidity({ hid: params.hid })
        } catch (e) {
            return this.renderNoComment(e.message);
        }

        return (
            <div>
                { this.renderComment() }
                <FileSelect upload={upload} app={app} file={upload.get(UploadTypes.MEDIA_ITEM, 'file')} />
                { upload.hasFile(UploadTypes.MEDIA_ITEM) && 
                    <div className="upload_post-upload">
                        <UploadBar upload={upload} /> 
                        { upload.isInSubmitProcess() ? this.renderSubmitRequested() : this.renderSubmitForms() }
                    </div>
                }
            </div>
        )
    }

    render() {
        const { upload } = this.props 
        const hasLoadedComment = upload.referencedCommentIsLoaded()

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
            <div className="upload upload-response content" {...dragEvents}>
                <Helmet title="Upload Response" />
                <div className="content_header has-info">
                     <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div> 
                     <div className="content_header_main">
                         <div className="content_header_title">Upload response</div>
                         <div className="content_header_info">The chat message below will appear in the top left of your image or video.</div>
                     </div>
                </div>
                { hasLoadedComment && this.renderBody() }
            </div>
        )
    }

}

UploadResponse.contextTypes = {
    router: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        upload: new Upload(state),
        app: new App(state)
    }
}

export default connect(mapStateToProps)(UploadResponse);