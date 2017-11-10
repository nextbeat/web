import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'
import Upload, { UploadType } from '@models/state/upload'
import CurrentUser from '@models/state/currentUser'
import { promptModal } from '@actions/app'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    profilePictureUrl?: string
    isUploading: boolean
}

type Props = ConnectProps & DispatchProps

class EditProfilePicture extends React.Component<Props> {
    
    constructor(props: Props) {
        super(props)

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.dispatch(promptModal('edit-profile-picture'))
    }

    render() {
        const { profilePictureUrl, isUploading } = this.props 

        let profpicStyle = {
            backgroundImage: !isUploading ? `url(${profilePictureUrl})` : ''
        }

        return (
            <div className="edit-profile_profpic" onClick={this.handleClick} >
                <div className="edit-profile_profpic-inner" style={profpicStyle}>
                    { isUploading &&  <Spinner styles={["grey", "small"]} /> }
                    { !isUploading && !profilePictureUrl && <Icon type="person" /> }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        profilePictureUrl: Upload.getInFile(state, UploadType.ProfilePicture, 'url') || CurrentUser.profileThumbnailUrl(state),
        isUploading: Upload.isUploading(state, UploadType.ProfilePicture)
    }
}

export default connect(mapStateToProps)(EditProfilePicture)