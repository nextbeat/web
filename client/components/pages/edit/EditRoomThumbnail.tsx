import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Upload, { UploadType } from '@models/state/upload'
import EditRoom from '@models/state/pages/editRoom'
import { promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    thumbnailUrl: string
    isProcessingThumbnail: boolean
}

type Props = ConnectProps & DispatchProps

class EditRoomThumbnail extends React.Component<Props> {
    
    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-thumbnail'))
    }

    render() {
        const { thumbnailUrl, isProcessingThumbnail } = this.props 
 
        let thumbnailStyle = {
            backgroundImage: !isProcessingThumbnail ? `url(${thumbnailUrl})` : ''
        }

        return (
            <div className="edit-room_thumbnail" onClick={this.handleClick} >
                <div className="edit-room_thumbnail-inner" style={thumbnailStyle}>
                    { isProcessingThumbnail && <Spinner styles={["grey", "small"]} /> }
                </div>
                <div className="edit-room_thumbnail-prompt">Edit thumbnail</div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        thumbnailUrl: Upload.getInFile(state, UploadType.Thumbnail, 'url') || EditRoom.thumbnail(state).get('url'),
        isProcessingThumbnail: EditRoom.isProcessingThumbnail(state)
    }
}

export default connect(mapStateToProps)(EditRoomThumbnail)