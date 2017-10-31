import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Upload, { UploadType } from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
import { promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    coverImageUrl?: string
    isUploading: boolean
}

type Props = ConnectProps & DispatchProps

class EditCoverImage extends React.Component<Props> {
    
    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-cover-image'))
    }

    render() {
        const { coverImageUrl, isUploading } = this.props 

        let coverStyle: any = {}
        if (coverImageUrl && !isUploading) {
            coverStyle = {
                background: `url(${coverImageUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }
        }
        let promptText = coverImageUrl ? 'Edit cover photo' : 'Add cover photo'

        return (
            <div className="edit-profile_cover-image">
                <div className="edit-profile_cover-image_inner" onClick={this.handleClick} style={coverStyle}>
                    { isUploading && <Spinner styles={["grey"]} /> }
                    <div className="edit-profile_cover-image_prompt">{ promptText }</div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        coverImageUrl: Upload.getInFile(state, UploadType.CoverImage, 'url') || CurrentUser.coverImageUrl(state, 'small'),
        isUploading: Upload.isUploading(state, UploadType.CoverImage)
    }
}

export default connect(mapStateToProps)(EditCoverImage)