import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { List } from 'immutable'

import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'

import CurrentUser from '@models/state/currentUser'
import CommunityModel from '@models/state/pages/creator/community'
import User from '@models/entities/user'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    username: string

    isFetching: boolean
    hasFetched: boolean
    error?: string
    moderators: List<User>

    isAdding: boolean
    addError?: string

    isRemoving: boolean
    removeError?: string
}

type Props = ConnectProps & DispatchProps

class CommunityComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
    }

    handleBackClick() {
        browserHistory.push(`/u/${this.props.username}`)
    }

    render() {
        const { isFetching } = this.props

        return (
            <div className="community content">
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div>Community
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        username: CurrentUser.entity(state).get('username'),

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