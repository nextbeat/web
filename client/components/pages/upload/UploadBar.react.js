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
        const progress = upload.get('progress', 0)

        return (
            <div className="upload_progress-bar_container">
                <div className="upload_progress-bar_data">
                    UPLOADING <span className="upload_progress-bar_percent">{`${Math.floor(progress*100)}%`}</span>
                </div>
                <div className="upload_progress-bar">
                    <div className="upload_progress-bar_progress" style={{ transform: `scaleX(${progress})` }}></div>
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
