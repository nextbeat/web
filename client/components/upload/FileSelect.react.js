import React from 'react'
import { connect } from 'react-redux' 

import Icon from '../shared/Icon.react'
import { uploadFile } from '../../actions'

class FileSelect extends React.Component {

    constructor(props) {
        super(props)

        this.handleDragEvent = this.handleDragEvent.bind(this)
        this.handleDragEnter = this.handleDragEnter.bind(this)
        this.handleDragLeave = this.handleDragLeave.bind(this)
        this.handleDrop = this.handleDrop.bind(this)

        this.handleClick = this.handleClick.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)

        this.renderUploadPrompt = this.renderUploadPrompt.bind(this)
        this.renderUploadProgress = this.renderUploadProgress.bind(this)

        this.state = {
            isDragging: false
        }
    }


    // Drag events

    handleDragEvent(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragEnter(e) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: true
        })
    }

    handleDragLeave(e) {
        this.handleDragEvent(e)
        this.setState({
            isDragging: false
        })
    }

    handleDrop(e) {
        this.handleDragLeave(e)
        if (e.nativeEvent.dataTransfer.files.length > 0) {
            const file = e.nativeEvent.dataTransfer.files[0]
            this.props.dispatch(uploadFile(file))
        }
    }


    // Other events

    handleClick(e) {
        $('#file-input').click()
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0]
            this.props.dispatch(uploadFile(file))
        }
        
    }


    // Render

    renderUploadPrompt(upload) {
        const { isDragging } = this.state

        const dragEvents = {
            onDragEnter: this.handleDragEnter,
            onDragOver: this.handleDragEnter,
            onDragExit: this.handleDragLeave,
            onDragLeave: this.handleDragLeave,
            onDrop: this.handleDrop,
            onDragStart: this.handleDragEvent,
            onDragEnd: this.handleDragEvent,
            onDrag: this.handleDragEvent
        }

        const dragClass = isDragging ? 'dragging' : ''

        return (
            <div className={`upload_file-select ${dragClass}`} {...dragEvents} >
                <input type="file" id="file-input" className="upload_file-input" onChange={this.handleInputChange} />
                <Icon type="file-upload" />
                <div className="upload_select-label" onClick={this.handleClick}>Select file to upload.</div>
                <div className="upload_drag-label">Or drag it here.</div>
            </div>
        );
    }

    renderUploadProgress(upload) {
        return (
            <div className="upload_file-select">
                <div className="upload_file-name-label">{ upload.get('fileName') }</div>
            </div>
        );
    }

    render() {
        const { upload } = this.props 
        return upload.isUploading() ? this.renderUploadProgress(upload) : this.renderUploadPrompt(upload)
    }
}

export default connect()(FileSelect);
