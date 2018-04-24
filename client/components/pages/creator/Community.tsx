import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'

import { loadModerators, clearModerators } from '@actions/pages/creator/community'
import { mod, unmod } from '@actions/user'
import CurrentUser from '@models/state/currentUser'
import CommunityModel from '@models/state/pages/creator/community'
import User from '@models/entities/user'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    currentUserUsername: string
    currentUserId: number

    isFetching: boolean
    hasFetched: boolean
    error?: string
    moderators: List<User>

    isAdding: boolean
    addError?: string

    isRemoving: boolean
    removeError?: string
}

interface ComponentState {
    username: string
}

type Props = ConnectProps & DispatchProps

class CommunityComponent extends React.Component<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
        this.handleRemoveClick = this.handleRemoveClick.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.renderUser = this.renderUser.bind(this)
        this.renderModerators = this.renderModerators.bind(this)

        this.state = {
            username: ''
        }
    }

    componentDidMount() {
        this.props.dispatch(loadModerators())
    }

    componentDidUpdate(prevProps: Props) {
        const { isAdding, isRemoving, addError, removeError, dispatch } = this.props

        if ((prevProps.isAdding && !isAdding && !addError)
            || (prevProps.isRemoving && !isRemoving && !removeError)) 
        {
            dispatch(loadModerators())
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearModerators())
    }

    handleBackClick() {
        browserHistory.push(`/u/${this.props.currentUserUsername}`)
    }

    handleRemoveClick(username: string) {
        const { dispatch, currentUserId } = this.props
        dispatch(unmod(currentUserId, username))
    }

    handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        const { dispatch } = this.props
        if (e.charCode === 13) { // enter
            this.handleSubmit(e)
        }
    }

    handleChange(e: React.FormEvent<HTMLInputElement>) {
        this.setState({ username: e.currentTarget.value })
    }

    handleSubmit(e: React.FormEvent<HTMLInputElement>) {
        const { dispatch, currentUserId } = this.props
        const { username } = this.state
        if (username && username.trim().length > 0) {
            dispatch(mod(currentUserId, username.trim()))
            this.setState({ username: '' })
        }
    }

    renderUser(user: User) {
        return (
            <div className="community_moderators_user" key={user.get('id')}>
                <div 
                    className="community_moderators_user_thumbnail" 
                    style={{backgroundImage: `url(${user.thumbnail('small').get('url')})`}}
                />
                <div className="community_moderators_user_username">{ user.get('username') }</div>
                <div className="community_moderators_user_remove" onClick={this.handleRemoveClick.bind(this, user.get('username'))}>Remove</div>
            </div>
        )
    }

    renderModerators() {
        const { isFetching, isAdding, isRemoving, 
                error, addError, removeError, moderators } = this.props
        const { username } = this.state

        const isProcessing = isFetching || isAdding || isRemoving
        return (
            <div className="community_moderators">
                <div className="community_moderators_list">
                    { isProcessing && <Spinner styles={["grey"]} /> }
                    { !isProcessing && moderators.map(mod => this.renderUser(mod)) }
                </div>
                <div className="community_moderators_submit_container">
                    { addError && <div className="community_moderators_submit_error">Error adding user. Please try again.</div> }
                    <div className="community_moderators_submit_fields">
                        <input 
                            placeholder="Add a moderator"
                            className="community_moderators_input"
                            onKeyPress={this.handleKeyPress} 
                            onChange={this.handleChange}
                            value={username}
                        />
                        <input type="submit" 
                            className="community_moderators_submit"
                            value="Add" 
                            disabled={username.trim().length === 0} 
                            onClick={this.handleSubmit} 
                        />
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="creator community content">
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div>Community
                    </div>
                    <div className="creator_main community_main">
                        <div className="creator_section">
                            <div className="creator_section_title">
                                Moderators
                                <div className="creator_section_description">
                                    Moderators are chosen members of your community who can help you to manage your chat — they shut down trolls so you don't have to! We recommend choosing friends or trusted community members who have been consistent, positive contributors to the chat.
                                </div>
                            </div>
                            { this.renderModerators() }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        currentUserUsername: CurrentUser.entity(state).get('username'),
        currentUserId: CurrentUser.get(state, 'id'),

        isFetching: CommunityModel.get(state, 'isFetchingModerators'),
        hasFetched: CommunityModel.get(state, 'hasFetchedModerators'),
        error: CommunityModel.get(state, 'moderatorsError'),
        moderators: CommunityModel.moderators(state),

        isAdding: CommunityModel.get(state, 'isAddingModerator'),
        addError: CommunityModel.get(state, 'addModeratorError'),
        
        isRemoving: CommunityModel.get(state, 'isRemovingModerator'),
        removeError: CommunityModel.get(state, 'removeModeratorError')
    }
}

export default connect(mapStateToProps)(CommunityComponent)