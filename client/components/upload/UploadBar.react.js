import React from 'react'

class UploadBar extends React.Component {

    constructor(props) {
        super(props)
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
            </div>
        );
    }
}

export default UploadBar;
