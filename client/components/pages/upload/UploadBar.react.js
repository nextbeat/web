import React from 'react'
import { connect } from 'react-redux'

import { clearUpload } from '../../../actions'

class UploadBar extends React.Component {

    constructor(props) {
        super(props)

        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel() {
        this.props.dispatch(clearUpload())
    }

    render() {
        const { upload } = this.props 
        const uploadProgress = upload.get('uploadProgress', 0)
        const processingProgress = upload.get('processingProgress', 0)
        const stage = upload.get('stage')

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
                { !upload.isInSubmitProcess() &&
                    <div className="upload_progress-bar_cancel">
                        <a className="btn upload_progress-bar_cancel-btn" onClick={this.handleCancel}>Cancel upload</a>
                    </div>
                }
            </div>
        );
    }
}

export default connect()(UploadBar);
