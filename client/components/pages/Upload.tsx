import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'
import { List } from 'immutable'
import * as TransitionGroup from 'react-transition-group/TransitionGroup'
import * as CSSTransition from 'react-transition-group/CSSTransition'

import FileSelect from './upload/FileSelect'
import UploadBar from './upload/UploadBar'
import AddToRoom from './upload/AddToRoom'
import CreateRoom from './upload/CreateRoom'
import AddTitle from './upload/AddTitle'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'
import PageError from '@components/shared/PageError'

import { submitStackRequest, clearUpload, selectStackForUpload } from '@actions/upload'
import { triggerAuthError } from '@actions/app'
import UploadModel, { UploadType } from '@models/state/upload'
import App from '@models/state/app'
import CurrentUser from '@models/state/currentUser'
import Stack from '@models/entities/stack'
import { baseUrl } from '@utils'
import { State, DispatchProps } from '@types'


interface ConnectProps {
    openStacks: List<Stack>
    stacksFetching: boolean
    isLoggedIn: boolean
    isLoggingIn: boolean
    hasAuthError: boolean

    browser: string
    version: string

    hasFile: boolean
    file?: File
    fileType: 'image' | 'video' | null
    error?: string

    isInSubmitProcess: boolean
    hasSelectedNewStack: boolean
    isSubmittable: boolean
    selectedStack: Stack
    selectedStackId: number
    submitStackRequested: boolean
    isSubmittingStack: boolean
    stackSubmitted: boolean
    submitStackError: string
}

type Props = ConnectProps & DispatchProps

const UploadComponentTransition: React.SFC<{}> = (props: any) => (
    <CSSTransition {...props} timeout={{ enter: 300, exit: 150 }} classNames="upload" />
)

class Upload extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleRestart = this.handleRestart.bind(this)

        this.renderSubmitForms = this.renderSubmitForms.bind(this)
        this.renderSubmitRequested = this.renderSubmitRequested.bind(this)
    }

    // Component lifecycle

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.stacksFetching 
            && !nextProps.stacksFetching
            && nextProps.openStacks.size === 0)
        {
            // user has no open stacks, so
            // we automatically trigger new stack selection
            this.props.dispatch(selectStackForUpload(-1))
        }

        if (!this.props.isLoggedIn && !this.props.isLoggingIn && !this.props.hasAuthError) {
            this.props.dispatch(triggerAuthError())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearUpload())
    }


    // Event handlers

    handleSubmit() {
        const { isSubmittable, dispatch } = this.props 
        if (isSubmittable) {
            dispatch(submitStackRequest())
        }
    }

    handleRestart() {
        this.props.dispatch(clearUpload())
    }


    // Render

    renderSubmitForms() {
        const { stacksFetching, openStacks, hasSelectedNewStack, isSubmittable } = this.props
        return (
            <div className="upload_submit-forms">
                { stacksFetching && <Spinner styles={["grey"]} type="upload-stacks" /> }
                <TransitionGroup>
                { openStacks.size > 0 && 
                    <UploadComponentTransition>
                        <AddToRoom key='add-to-room' />
                    </UploadComponentTransition> 
                }
                { hasSelectedNewStack && 
                    <UploadComponentTransition>
                        <CreateRoom key='create-room' />
                    </UploadComponentTransition> 
                }
                <UploadComponentTransition>
                    <AddTitle key='add-title' />
                </UploadComponentTransition>
                </TransitionGroup>
                <div className="upload_submit-container">
                    <a className={`btn ${isSubmittable ? '' : 'btn-inactive'} upload_submit`} onClick={this.handleSubmit}>Submit</a>
                </div>
            </div>
        )
    } 

    renderSubmitRequested() {
        const { selectedStackId, selectedStack,  submitStackRequested, 
                isSubmittingStack, stackSubmitted, submitStackError, fileType } = this.props
        
        let stackUrl = ''
        let fullStackUrl = ''
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
                { isSubmittingStack && <Spinner type="upload-submit" styles={["grey", "large"]} /> }
                { stackSubmitted && 
                    <div>
                        <Icon type="check" />
                        <div className="upload_success-message">
                            Your {fileType} has been submitted! See it live at <Link to={stackUrl}>{fullStackUrl}</Link>
                        </div>
                        <div><a className="btn upload_restart" onClick={this.handleRestart}>Upload another file</a></div>
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

    renderIncompatibleBrowser() {
        return (
            <PageError>Your browser isn't modern enough for our high-tech, envelope-pushing upload process. Please consider upgrading.</PageError>
        )
    }

    render() {
        const { browser, version, file, error, hasFile, isInSubmitProcess } = this.props 

        if (browser === 'IE' && parseInt(version) < 10) {
            return this.renderIncompatibleBrowser()
        }

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
            <div className="upload content" {...dragEvents} >
                <div>
                    <Helmet title="Upload"/>
                    <div className="content_header">
                        Upload file
                    </div>
                    <FileSelect file={file} />
                    { error && 
                        <div className="upload_error">
                            {error}
                        </div>
                    }
                    { hasFile && 
                        <div className="upload_post-upload">
                            <UploadBar /> 
                            { isInSubmitProcess ? this.renderSubmitRequested() : this.renderSubmitForms() }
                        </div>
                    }
                </div>
            </div>
        );
    }
}
 
function mapStateToProps(state: State): ConnectProps {
    return {
       openStacks: CurrentUser.openStacks(state),
       stacksFetching: CurrentUser.get(state, 'stacksFetching'),
       isLoggedIn: CurrentUser.isLoggedIn(state),
       isLoggingIn: CurrentUser.get(state, 'isLoggingIn'),
       hasAuthError: App.hasAuthError(state),

       browser: App.get(state, 'browser'),
       version: App.get(state, 'version'),

       hasFile: UploadModel.hasFile(state, UploadType.MediaItem),
       file: UploadModel.getInFile(state, UploadType.MediaItem, 'file'),
       fileType: UploadModel.fileType(state, UploadType.MediaItem),
       error: UploadModel.getInFile(state, UploadType.MediaItem, 'error'),

       isInSubmitProcess: UploadModel.isInSubmitProcess(state),
       hasSelectedNewStack: UploadModel.hasSelectedNewStack(state),
       isSubmittable: UploadModel.isSubmittable(state),
       selectedStack: UploadModel.selectedStack(state),
       selectedStackId: UploadModel.get(state, 'selectedStackId'),
       submitStackRequested: UploadModel.get(state, 'submitStackRequested'),
       isSubmittingStack: UploadModel.get(state, 'isSubmittingStack'),
       stackSubmitted: UploadModel.get(state, 'stackSubmitted'),
       submitStackError: UploadModel.get(state, 'submitStackError')
    }
}

export default connect(mapStateToProps)(Upload);
