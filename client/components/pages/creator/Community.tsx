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
                                    <p>Moderators are chosen members of your community who can help you to manage your chat — they shut down trolls so you don't have to! We recommend choosing friends or trusted community members who have been consistent, positive contributors to the chat.</p>
                                </div>
                            </div>
                            <Moderators />
                        </div>
                        <div className="creator_section">
                            <div className="creator_section_title">
                                Custom Emoji
                                <div className="creator_section_description">
                                    <p>Encourage your followers to subscribe by offering subscriber-only custom emoji! Upload up to 12 custom emoji to give your community a fun, unique way to react and interact in your rooms. Use images of your face, your squad, your cat — anything your fans would get a kick out of spamming in chat!</p>
                                    <p>Each emote must be 60 x 60 pixels, saved in a .png format, with a name of 12 characters or less (letters and numbers only please). You can use image manipulation software like <a href="https://www.adobe.com/Photoshop" target="_blank">Adobe Photoshop</a> or <a href="https://www.gimp.org" target="_blank">GIMP</a> (free) to create your emotes. They will appear in the order you upload them, so be sure to upload your favorites first!</p>
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