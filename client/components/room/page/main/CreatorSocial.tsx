import * as React from 'react'
import { connect } from 'react-redux'

import Icon from '@components/shared/Icon'
import YoutubePlayer, { PlayerState as YoutubePlayerState } from '@components/shared/YoutubePlayer'
import TwitterTimeline from '@components/shared/TwitterTimeline'

import { gaEvent } from '@actions/ga'
import { Dimensions } from '@analytics/definitions'
import UserEntity, { UserSocial } from '@models/entities/user'
import RoomPage from '@models/state/pages/room'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    roomId: number
    authorId: number

    count: number
    youtube?: UserSocial
    instagram?: UserSocial
    twitter?: UserSocial
}

type Props = ConnectProps & DispatchProps

interface ComponentState {
    selectedPlatform?: string
}

class CreatorSocial extends React.PureComponent<Props, ComponentState> {

    constructor(props: Props) {
        super(props)

        this.handleOutgoingClick = this.handleOutgoingClick.bind(this)
        this.handleYoutubePlayerStateChange = this.handleYoutubePlayerStateChange.bind(this)

        this.renderField = this.renderField.bind(this)
        this.renderYoutube = this.renderYoutube.bind(this)
        this.renderTwitter = this.renderTwitter.bind(this)

        this.state = {
            selectedPlatform: this.defaultSelectedPlatform(this.props)
        }
    }

    defaultSelectedPlatform(props: Props): string | undefined {
        if (this.props.youtube) {
            return 'google'
        } else if (this.props.twitter) {
            return 'twitter'
        } else if (this.props.instagram) {
            return 'instagram'
        }
    }

    componentWillReceiveProps(newProps: Props) {
        if (!this.state.selectedPlatform) {
            this.setState({
                selectedPlatform: this.defaultSelectedPlatform(newProps)
            })
        }
    }

    handleOutgoingClick(social: UserSocial) {
        const { dispatch, roomId, authorId } = this.props

        dispatch(gaEvent({
            category: 'social',
            action: 'click',
            label: social.get('channel_id'),
            [Dimensions.STACK_ID]: roomId,
            [Dimensions.AUTHOR_ID]: authorId
        }, () => {
            window.open(social.get('channel_url'), '_blank')
        }))
    }

    handleYoutubePlayerStateChange(player: any, playerState: YoutubePlayerState) {
        if (playerState === YoutubePlayerState.PLAYING) {
            const { dispatch, roomId, authorId, youtube } = this.props
            dispatch(gaEvent({
                category: 'social',
                action: 'play',
                label: youtube!.get('post_id'),
                [Dimensions.STACK_ID]: roomId,
                [Dimensions.AUTHOR_ID]: authorId
            }))
        }
    }

    renderField(social: UserSocial) {
        const platform = social.get('platform')
        const url = social.get('channel_url')
        const selectedClass = this.state.selectedPlatform === platform ? 'selected' : ''

        let onClick = () => {
            this.setState({ selectedPlatform: platform })
        }
        
        return (
            <li className={`creator-info_social_field creator-info_social_field-${platform} ${selectedClass}`} onClick={onClick}>
                <div className="creator-info_social_icon" />
                {social.get('channel_name')}
            </li>
        )
    }

    renderYoutube(display: boolean) {
        const youtube = this.props.youtube!
        const opts = {
            width: '100%',
            height: '100%',
            playerVars: {},
        }

        return (
            <div className="creator-info_social_content_inner" style={{ display: display ? 'block' : 'none' }}>
                <div className="creator-info_social_content_outgoing" onClick={this.handleOutgoingClick.bind(this, youtube)}>Go to channel <Icon type="exit-to-app" /></div>
                <YoutubePlayer 
                    videoId={youtube.get('post_id')!} 
                    opts={opts} 
                    className="creator-info_social_youtube" 
                    onPlayerStateChange={this.handleYoutubePlayerStateChange} 
                />
            </div>
        )
    }

    renderTwitter(display: boolean) {
        const twitter = this.props.twitter!

        return (
            <div className="creator-info_social_content_inner" style={{ display: display ? 'block' : 'none' }}>
                <div className="creator-info_social_content_outgoing" onClick={this.handleOutgoingClick.bind(this, twitter)}>Go to profile <Icon type="exit-to-app" /></div>
                <TwitterTimeline username={twitter.get('channel_name')!} className="creator-info_social_twitter" />
            </div>
        )
    }

    render() {
        const { count, youtube, instagram, twitter } = this.props
        const { selectedPlatform } = this.state

        if (count === 0) {
            return null;
        }

        // TODO: display toggle instead of adding to dom every time

        return (
            <div className="creator-info_social">
                <ul className="creator-info_social_fields">
                    { youtube && this.renderField(youtube) }
                    { twitter && this.renderField(twitter) }
                    { instagram && this.renderField(instagram) }
                </ul>
                <div className="creator-info_social_content">
                    { this.renderYoutube(selectedPlatform === "google") }
                    { this.renderTwitter(selectedPlatform === "twitter") }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    const user = RoomPage.author(state)
    return {
        roomId: RoomPage.get(state, 'id'),
        authorId: RoomPage.author(state).get('id'),
        count: user.get('social').size,
        youtube: user.social('google'),
        instagram: user.social('instagram'),
        twitter: user.social('twitter')
    }
}

export default connect(mapStateToProps)(CreatorSocial)