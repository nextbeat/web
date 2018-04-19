import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Map } from 'immutable'

import EditCoverImage from '../edit/EditCoverImage'
import EditCoverImageModal from '../edit/EditCoverImageModal'
import EditProfilePicture from '../edit/EditProfilePicture'
import EditProfilePictureModal from '../edit/EditProfilePictureModal'
import ConnectSocial from '../edit/ConnectSocial'
import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'

import CurrentUser from '@models/state/currentUser'
import EditProfileModel from '@models/state/pages/creator/editProfile'
import App from '@models/state/app'
import { triggerAuthError } from '@actions/app'
import { loadEditProfile, updateEditProfile, submitEditProfile, clearEditProfile } from '@actions/pages/creator/editProfile' 
import { clearFileUpload } from '@actions/upload'
import { State, DispatchProps } from '@types'
import { UploadType } from '@upload'

interface Props {
    isLoggedIn: boolean
    isLoggingIn: boolean
    hasAuthError: boolean
    username: string
    
    hasChanged: boolean
    profileFields: State
    isUpdatingUser: boolean
    hasUpdatedUser: boolean
    updateUserError: string
}

type AllProps = Props & DispatchProps

class EditProfile extends React.Component<AllProps> {

    constructor(props: AllProps) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
        this.handleFullNameChange = this.handleFullNameChange.bind(this)
        this.handleWebsiteChange = this.handleWebsiteChange.bind(this)
        this.handleBioChange = this.handleBioChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    // Component lifecycle

    componentDidMount() {
        this.props.dispatch(loadEditProfile())
    }   

    componentWillReceiveProps(nextProps: AllProps) {
        if (!this.props.isLoggedIn && !this.props.isLoggingIn && !this.props.hasAuthError) {
            this.props.dispatch(triggerAuthError())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearEditProfile())
        this.props.dispatch(clearFileUpload(UploadType.ProfilePicture))
        this.props.dispatch(clearFileUpload(UploadType.CoverImage))
    }

    // Event handlers

    handleBackClick() {
        const { username } = this.props
        browserHistory.push(`/u/${username}`)
    }   

    handleFullNameChange(e: React.FormEvent<HTMLInputElement>) {
        this.props.dispatch(updateEditProfile({ fullName: e.currentTarget.value.substring(0, 50) }))
    }

    handleWebsiteChange(e: React.FormEvent<HTMLInputElement>) {
        this.props.dispatch(updateEditProfile({ website: e.currentTarget.value.substring(0, 100) }))
    }

    handleBioChange(e: React.FormEvent<HTMLTextAreaElement>) {        
        this.props.dispatch(updateEditProfile({ bio: e.currentTarget.value.substring(0, 120) }))
    }

    handleSubmit() {
        const { dispatch, hasChanged } = this.props
        if (hasChanged) {
            dispatch(submitEditProfile())
        }
    }

    // Render

    render() {
        const { hasChanged, profileFields, username,
                isUpdatingUser, hasUpdatedUser, updateUserError } = this.props 

        let shouldDisableSubmit = !hasChanged

        return (
            <div className="edit edit-profile content">
                <EditProfilePictureModal />
                <EditCoverImageModal />
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div> Edit Profile
                    </div>
                    <EditCoverImage />
                    <div className="edit-profile_user">
                        <EditProfilePicture />
                        <div className="edit-profile_username">{username}</div>
                    </div>
                    <div className="edit_form">
                        <div className="edit_form-item">
                            <label>Full Name</label><input type="text" onChange={this.handleFullNameChange} value={profileFields.get('fullName', '') || ''} />
                        </div>
                        <div className="edit_form-item">
                            <label>Website</label><input type="text" onChange={this.handleWebsiteChange} value={profileFields.get('website', '') || ''} />
                        </div>
                        <div className="edit_form-item">
                            <label>Bio</label><textarea onChange={this.handleBioChange} value={profileFields.get('bio', '') || ''} />
                        </div>
                        <ConnectSocial platform="google" displayName="YouTube" />
                        <ConnectSocial platform="twitter" displayName="Twitter" />
                        <div className="edit_separator"></div>
                        <div className="edit_submit">
                            <div className="edit_submit-btn"><a className={`btn ${shouldDisableSubmit ? 'btn-gray btn-disabled' : ''}`} onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit_submit-result">
                                { isUpdatingUser && <Spinner styles={["grey", "small"]} /> } 
                                { hasUpdatedUser && "Changes saved." }
                                { updateUserError && <div className="error">{updateUserError}</div> }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function mapStateToProps(state: State): Props {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isLoggingIn: CurrentUser.get(state, 'isLoggingIn'),
        hasAuthError: App.hasAuthError(state),
        username: CurrentUser.entity(state).get('username'),
        
        hasChanged: EditProfileModel.get(state, 'hasChanged'),
        profileFields: EditProfileModel.get(state, 'fields', Map()),
        isUpdatingUser: EditProfileModel.get(state, 'isUpdatingUser'),
        hasUpdatedUser: EditProfileModel.get(state, 'hasUpdatedUser'),
        updateUserError: EditProfileModel.get(state, 'updateUserError')
    }
}

export default connect(mapStateToProps)(EditProfile);
