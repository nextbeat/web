import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { List } from 'immutable'

import Moderators from '@components/pages/creator/community/Moderators'
import Emojis from '@components/pages/creator/community/Emojis'
import Icon from '@components/shared/Icon'

import { clearCommunity } from '@actions/pages/creator/community'
import CurrentUser from '@models/state/currentUser'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    currentUserUsername: string
}

type Props = ConnectProps & DispatchProps

class CommunityComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.handleBackClick = this.handleBackClick.bind(this)
    }

    componentWillUnmount() {
        this.props.dispatch(clearCommunity())
    }

    handleBackClick() {
        browserHistory.push(`/u/${this.props.currentUserUsername}`)
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
                            <Moderators />
                        </div>
                        <div className="creator_section">
                            <div className="creator_section_title">
                                Custom Emoji
                                <div className="creator_section_description">
                                    Add and remove custom emoji.
                                </div>
                            </div>
                            <Emojis />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        currentUserUsername: CurrentUser.entity(state).get('username')
    }
}

export default connect(mapStateToProps)(CommunityComponent)