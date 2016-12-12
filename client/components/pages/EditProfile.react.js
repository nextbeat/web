import React from 'react'
import { connect } from 'react-redux'

import EditProfilePicture from '../edit/EditProfilePicture.react'
import Icon from '../shared/Icon.react'
import Spinner from '../shared/Spinner.react'
import { CurrentUser, App } from '../../models'
import { triggerAuthError, updateUser, clearEditProfile, promptModal } from '../../actions'

class EditProfile extends React.Component {

    constructor(props) {
        super(props)

        this.updateState = this.updateState.bind(this)
        this.clearState = this.clearState.bind(this)

        this.handleProfpicClick = this.handleProfpicClick.bind(this)
        this.handleFullNameChange = this.handleFullNameChange.bind(this)
        this.handleWebsiteChange = this.handleWebsiteChange.bind(this)
        this.handleBioChange = this.handleBioChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.state = {
            fullName: '',
            website: '',
            bio: ''
        }
    }


    // Component lifecycle

    componentDidMount() {
        if (this.props.currentUser.get('hasUpdatedEntity')) {
            this.updateState(this.props)
        } 
    }   

    componentWillReceiveProps(nextProps) {
        if (!this.props.currentUser.get('hasUpdatedEntity') && nextProps.currentUser.get('hasUpdatedEntity')) {
            this.updateState(nextProps)
        }

        if (!this.props.currentUser.isLoggedIn() && !this.props.currentUser.get('isLoggingIn') && !this.props.app.hasAuthError()) {
            this.props.dispatch(triggerAuthError())
            this.clearState()
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearEditProfile())
    }

    updateState(props) {
        const { currentUser } = props
        this.setState({
            fullName: currentUser.get('full_name'),
            website: currentUser.get('website_url'),
            bio: currentUser.get('description')
        })
    }

    clearState() {
        this.setState({
            fullName: '',
            website: '',
            bio: ''
        })
    }


    // Event handlers

    handleProfpicClick(e) {
        this.props.dispatch(promptModal('edit-profile-picture'))
    }

    handleFullNameChange(e) {
        this.setState({ fullName: e.target.value.substring(0, 50) })
    }

    handleWebsiteChange(e) {
        this.setState({ website: e.target.value.substring(0, 100) })
    }

    handleBioChange(e) {        
        this.setState({ bio: e.target.value.substring(0, 120) })
    }

    handleSubmit() {
        const { dispatch, currentUser } = this.props 

        let userObj = {
            full_name: this.state.fullName,
            website_url: this.state.website,
            description: this.state.bio
        }

        // add profile picture if it's been updated
        if (currentUser.get('updatedProfilePictureUrl') && currentUser.get('hasUpdatedProfilePicture')) {
            userObj['profpic_url'] = currentUser.get('updatedProfilePictureUrl')
        }

        this.props.dispatch(updateUser(userObj))
    }

    // Render

    render() {
        const { app, currentUser } = this.props 
        const { fullName, website, bio } = this.state

        // TODO: yuck
        
        let profpic_url = currentUser.get('updatedProfilePictureUrl') 
                            || currentUser.get('profpic_thumbnail_url') 
                            || currentUser.get('profpic_url');

        let profpicStyle = {
            backgroundImage: !currentUser.get('isUpdatingProfilePicture') ? `url(${profpic_url})` : ''
        }

        return (
            <div className="edit-profile content">
                <EditProfilePicture />
                <div className="content_inner">
                    <div className="content_header">
                        Edit Profile
                    </div>
                    <div className="edit-profile_user">
                        <div className="edit-profile_profpic" onClick={this.handleProfpicClick} >
                            <div className="edit-profile_profpic-inner" style={profpicStyle}>
                                { currentUser.get('isUpdatingProfilePicture') &&  <Spinner type="grey small" /> }
                                { !currentUser.get('isUpdatingProfilePicture') && !profpic_url && <Icon type="person" /> }
                            </div>
                        </div>
                        <div className="edit-profile_username">{currentUser.get('username')}</div>
                    </div>
                    <div className="edit-profile_form">
                        <div className="edit-profile_form-item">
                            <label>Full Name</label><input type="text" onChange={this.handleFullNameChange} value={fullName} />
                        </div>
                        <div className="edit-profile_form-item">
                            <label>Website</label><input type="text" onChange={this.handleWebsiteChange} value={website} />
                        </div>
                        <div className="edit-profile_form-item">
                            <label>Bio</label><textarea onChange={this.handleBioChange} value={bio} />
                        </div>
                        <div className="edit-profile_separator"></div>
                        <div className="edit-profile_submit">
                            <div className="edit-profile_submit-btn"><a className="btn" onClick={this.handleSubmit}>Submit</a></div>
                            <div className="edit-profile_submit-result">
                                { currentUser.get('isUpdatingUser') && <Spinner type="grey small" /> } 
                                { currentUser.get('hasUpdatedUser') && "Changes saved." }
                                { currentUser.get('updateUserError') && <div className="error">{currentUser.get('updateUserError')}</div> }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        app: new App(state),
        currentUser: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(EditProfile);
