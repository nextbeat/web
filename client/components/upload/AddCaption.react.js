import React from 'react'
import { Map } from 'immutable'

import Video from '../room/player/Video.react'
import Photo from '../room/player/Photo.react'

class AddCaption extends React.Component {

    constructor(props) {
        super(props)

        this.resourceObject = this.resourceObject.bind(this)
    }


    resourceObject() {
        const { width, height, upload } = this.props 
        return Map({
            url: URL.createObjectURL(upload.get('file')),
            type: 'objectURL',
            width,
            height
        })
    }

    render() {
        const { app, upload } = this.props 

        const shouldDisplay = app.get('activeModal') === 'add-caption'
        const isVideo = upload.fileType() === 'video'
        const isPhoto = upload.fileType() === 'image'

        return (
            <div className="modal-container" style={{ display: (shouldDisplay ? 'block' : 'none') }}>
                <div className="modal upload_add-caption">
                    <div className="upload_add-caption_media-container">
                        <div className="player_media-inner">
                           { isPhoto && <Photo image={this.resourceObject()} /> }
                            { isVideo && <Video video={this.resourceObject()} /> }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddCaption;
