import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import FileSelect from './upload/FileSelect.react'
import { Upload as UploadModel } from '../models'

class Upload extends React.Component {

    constructor(props) {
        super(props)
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
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        upload: new UploadModel(state)
    }
}

export default connect(mapStateToProps)(Upload);
