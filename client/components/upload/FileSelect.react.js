import React from 'react'

import Icon from '../shared/Icon.react'

class FileSelect extends React.Component {

    constructor(props) {
        super(props)

        this.handleDragEvent = this.handleDragEvent.bind(this)
        this.handleDragEnter = this.handleDragEnter.bind(this)
        this.handleDragLeave = this.handleDragLeave.bind(this)
        this.handleDrop = this.handleDrop.bind(this)

        this.handleClick = this.handleClick.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)

        this.state = {
            isDragging: false,
            files: null
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
            this.setState({
                file: e.nativeEvent.dataTransfer.files[0]
            })
        }
    }


    // Other events

    handleClick(e) {
        $('#file-input').click()
    }

    handleInputChange(e) {
        if (e.target.files.length > 0) {
            this.setState({
                file: e.target.files[0]
            })
        }
        
    }


    // Render

    render() {
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
}

export default FileSelect;
