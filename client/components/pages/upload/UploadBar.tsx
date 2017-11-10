import * as React from 'react'
import { connect } from 'react-redux'

import { clearFileUpload } from '@actions/upload'
import { State, DispatchProps } from '@types'
import Upload, { UploadType } from '@models/state/upload'

interface ConnectProps {
    uploadProgress: number
    processingProgress: number
    stage: 'upload' | 'process'
    isInSubmitProcess: boolean
}

type Props = ConnectProps & DispatchProps

class UploadBar extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel() {
        this.props.dispatch(clearFileUpload(UploadType.MediaItem))
    }

    render() {
        const { uploadProgress, processingProgress, stage, isInSubmitProcess } = this.props

        return (
            <div className="upload_progress-bar_container">
                <div className="upload_progress-bar_data">
                    { stage !== 'upload' && 
                        <span>PROCESSING <span className="upload_progress-bar_percent">{`${Math.floor(processingProgress*100)}%`}</span></span> 
                    }
                    { stage === 'upload' && 
                        <span>UPLOADING <span className="upload_progress-bar_percent">{`${Math.floor(uploadProgress*100)}%`}</span></span> 
                    }
                </div>
                <div className="upload_progress-bar">
                    <div className="upload_progress-bar_progress upload_progress-bar_progress-upload" style={{ transform: `scaleX(${uploadProgress})` }}></div>
                    <div className="upload_progress-bar_progress upload_progress-bar_progress-process" style={{ transform: `scaleX(${processingProgress})` }}></div>
                </div>
                { !isInSubmitProcess &&
                    <div className="upload_progress-bar_cancel">
                        <a className="btn upload_progress-bar_cancel-btn" onClick={this.handleCancel}>Cancel upload</a>
                    </div>
                }
            </div>
        );
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        uploadProgress: Upload.getInFile(state, UploadType.MediaItem, 'uploadProgress'),
        processingProgress: Upload.getInFile(state, UploadType.MediaItem, 'processingProgress'),
        stage: Upload.stage(state, UploadType.MediaItem),
        isInSubmitProcess: Upload.isInSubmitProcess(state)
    }
}

export default connect(mapStateToProps)(UploadBar);
