import * as PropTypes from 'prop-types'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'

import FileSelect from './upload/FileSelect'
import UploadBar from './upload/UploadBar'
import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import PageError from '@components/shared/PageError'
import renderMessageText from '@components/room/chat/utils/renderMessageText'

import { loadReferencedComment, submitStackRequest, clearUpload, clearFileUpload } from '@actions/upload'
import Upload, { UploadType } from '@models/state/upload'
import App from '@models/state/app'
import Comment from '@models/entities/comment'
import Stack from '@models/entities/stack'
import { timeString, baseUrl } from '@utils'
import { State, DispatchProps, RouteProps } from '@types'

interface ConnectProps {
    referencedComment: Comment
    hasLoadedComment: boolean
    isCommentValid: boolean
    invalidCommentError: string

    hasFile: boolean
    file?: File
    fileType: 'image' | 'video' | null

    selectedStack: Stack
    selectedStackId: number
    isInSubmitProcess: boolean
    submitStackRequested: boolean
    isSubmittingStack: boolean
    stackSubmitted: boolean
    submitStackError: string
}

interface Params {
    hid: string
    comment: number
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

class UploadResponse extends React.Component<Props> {

    static contextTypes = {
        router: PropTypes.object.isRequired
    }

    constructor(props: Props) {
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
        this.props.dispatch(clearFileUpload(UploadType.MediaItem))
    }


    // Render
    
    renderNoComment(message: string) {
        return (
            <div className="upload-response_comment_container">
                <PageError>
                    {message}
                </PageError>
            </div>
        )
    }

    renderComment() {
        const { referencedComment: comment } = this.props;

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
        const { selectedStackId, selectedStack, submitStackRequested, 
                isSubmittingStack, stackSubmitted, submitStackError, fileType } = this.props

        let fullStackUrl = ''
        let stackUrl = ''
        if (selectedStackId > 0) {
            fullStackUrl = `${baseUrl()}/r/${selectedStack.get('hid')}/latest`
            stackUrl = `/r/${selectedStack.get('hid')}/latest`
        }

        return (
            <div className="upload_submit-requested">
                { submitStackRequested && 
                    <div>
                        Your {fileType} is still uploading. Please leave this page open until it finishes.
                    </div>
                }
                { isSubmittingStack && <Spinner styles={["grey", "large"]} type="upload-submit" /> }
                { stackSubmitted && 
                    <div>
                        <Icon type="check" />
                        <div className="upload_success-message">
                            Your {fileType} has been submitted! See it live at <Link to={stackUrl}>{fullStackUrl}</Link>
                        </div>
                    </div> 
                }
                { submitStackError && 
                    <div>
                        There was an error submitting your {fileType}. Please try again.
                        <div><a className="btn upload_restart" onClick={this.handleRestart}>Upload another file</a></div>
                    </div> }
            </div>
        )
    }

    renderBody() {
        const { isCommentValid, invalidCommentError, hasFile, file, isInSubmitProcess } = this.props 

        

        if (!isCommentValid) {
            return this.renderNoComment(invalidCommentError)
        }

        return (
            <div>
                { this.renderComment() }
                <FileSelect file={file} />
                { hasFile&& 
                    <div className="upload_post-upload">
                        <UploadBar /> 
                        { isInSubmitProcess ? this.renderSubmitRequested() : this.renderSubmitForms() }
                    </div>
                }
            </div>
        )
    }

    render() {
        const { hasLoadedComment } = this.props 

        const defaultDragFn = (e: React.DragEvent<HTMLElement>) => { e.preventDefault() }
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

function mapStateToProps(state: State, ownProps: RouteProps<Params>): ConnectProps {
    let isCommentValid = true
    let invalidCommentError = ''
    try {
        Upload.checkReferencedCommentValidity(state, ownProps.params.hid)
    } catch (e) {
        isCommentValid = false
        invalidCommentError = e.messge
    }

    return {
        referencedComment: Upload.referencedComment(state),
        hasLoadedComment: Upload.referencedCommentIsLoaded(state),
        isCommentValid,
        invalidCommentError,

        hasFile: Upload.hasFile(state, UploadType.MediaItem),
        file: Upload.getInFile(state, UploadType.MediaItem, 'file'),
        fileType: Upload.fileType(state, UploadType.MediaItem),
 
        isInSubmitProcess: Upload.isInSubmitProcess(state),
        selectedStack: Upload.selectedStack(state),
        selectedStackId: Upload.get(state, 'selectedStackId'),
        submitStackRequested: Upload.get(state, 'submitStackRequested'),
        isSubmittingStack: Upload.get(state, 'isSubmittingStack'),
        stackSubmitted: Upload.get(state, 'stackSubmitted'),
        submitStackError: Upload.get(state, 'submitStackError')
    }
}

export default connect(mapStateToProps)(UploadResponse);