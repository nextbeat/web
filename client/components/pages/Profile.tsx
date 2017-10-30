import * as React from 'react'
import * as Promise from 'bluebird'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import ScrollComponent, { ScrollComponentProps } from '@components/utils/ScrollComponent'
import ProfileHeader from './profile/ProfileHeader'
import RoomCard from '@components/room/RoomCard'
import LargeStackItem from '@components/shared/LargeStackItem'
import Spinner from '@components/shared/Spinner'
import PageError from '@components/shared/PageError'
import AppBanner from '@components/shared/AppBanner'

import { loadProfile, clearProfile, loadStacksForUser } from '@actions/pages/profile'
import Profile from '@models/state/pages/profile'
import CurrentUser from '@models/state/currentUser'
import Stack from '@models/entities/stack'
import User from '@models/entities/user'
import { baseUrl } from '@utils'
import { State, DispatchProps, RouteProps, Store, ServerRenderingComponent, staticImplements } from '@types'

interface ConnectProps {
    isLoggedIn: boolean
    isCurrentUser: boolean

    isLoaded: boolean
    error: string
    user: User
    stacks: List<Stack>
    stacksFetching: boolean
    stacksHasFetched: boolean
}

interface Params {
    username: string
}

type Props = ConnectProps & DispatchProps & RouteProps<Params> & ScrollComponentProps

@staticImplements<ServerRenderingComponent>()
class ProfileComponent extends React.Component<Props> {

    static fetchData(store: Store, params: Params) {
        return new Promise((resolve, reject) => {
    
            const unsubscribe = store.subscribe(() => {
                const state = store.getState()
                if (Profile.isLoaded(state)) {
                    unsubscribe()
                    resolve(store)
                }
                if (Profile.get(state, 'error')) {
                    unsubscribe()
                    reject(new Error('Profile does not exist.'))
                }
            })
            store.dispatch(loadProfile(params.username))
        })
    }

    constructor(props: Props) {
        super(props);

        this.renderProfile = this.renderProfile.bind(this);
    }

    componentDidMount() {
        const { params: { username }, dispatch } = this.props
        dispatch(loadProfile(username));
    }

    componentWillUnmount() {
        this.props.dispatch(clearProfile());
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.params.username !== this.props.params.username) {
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }

        if (prevProps.isLoggedIn !== this.props.isLoggedIn
            && (prevProps.isCurrentUser || this.props.isCurrentUser)) {
            // we want to reload on log out to hide/show any unlisted rooms belonging to the user 
            this.props.dispatch(clearProfile())
            this.props.dispatch(loadProfile(this.props.params.username))
        }
    }

    renderDocumentHead(user: User) {
        let description = ''
        let creator = user.get('full_name') ? `${user.get('full_name')} (@${user.get('username')})` : user.get('username')

        if (user.get('description')) {
            description = user.get('description')
        } else {
            description = `See rooms made on Nextbeat by ${creator})`
        }

        let meta = [
            {"property": "al:ios:url", "content": `nextbeat://users/${user.get('username')}`},
            {"property": "og:title", "content": `${creator} - Nextbeat`},
            {"property": "og:description", "content": description},
            {"property": "og:url", "content": `${baseUrl()}/u/${user.get('username')}`},
            {"name": "description", "content": description}
        ]

        if (user.thumbnail('medium').get('url')) {
            meta.push({"property": "og:image", "content": user.thumbnail('medium').get('url')})
        }

        return  (
            <Helmet 
                title={creator} 
                meta={meta}
            />
        );
    }

    renderProfile() {
        const { stacks, stacksHasFetched, stacksFetching, user } = this.props

        let openStacks = stacks.filter(s => !s.get('closed'))
        let closedStacks = stacks.filter(s => s.get('closed'))

        let shouldDisplayNoContent = stacks.size === 0 && stacksHasFetched

        return (
            <section>  
                { this.renderDocumentHead(user) }
                <ProfileHeader user={user} />
                <div className="content_inner">
                    { openStacks.size > 0 && 
                        <div>
                            <div className="rooms-list_header">OPEN</div>
                            <div className="rooms-list_rooms">
                                { openStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                            </div>
                        </div>
                    }
                    { closedStacks.size > 0 && 
                        <div>
                            <div className="rooms-list_header">PREVIOUS</div>
                            <div className="rooms-list_rooms">
                                { closedStacks.map(stack => <LargeStackItem key={stack.get('id')} stack={stack} />)}
                            </div>
                        </div>
                    }

                    { stacksFetching && <Spinner type="grey rooms-list" /> }
                    { shouldDisplayNoContent && 
                        <div className="profile_no-content">There's nothing here.</div>
                    }
                </div>
            </section>
        )
    }

    render() {
        const { params: { username }, error, isLoaded } = this.props;
        return (
            <div className="profile content" id="profile">
                <AppBanner url={`nextbeat://users/${username}`} />
                { error && error.length > 0 && <PageError>User not found.</PageError> }
                { isLoaded && this.renderProfile() }
            </div>
        );
    }
}

function mapStateToProps(state: State, ownProps: RouteProps<Params>): ConnectProps {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        isCurrentUser: ownProps.params.username === CurrentUser.entity(state).get('username'),

        isLoaded: Profile.isLoaded(state),
        error: Profile.get(state, 'error'),
        user: Profile.user(state),
        stacks: Profile.stacks(state),
        stacksFetching: Profile.get(state, 'stacksFetching'),
        stacksHasFetched: Profile.get(state, 'stacksHasFetched')
    }
}

const scrollOptions = {

     onScrollToBottom: function() {
        const { profile, dispatch } = this.props 
        if (!profile.get('stacksFetching') && profile.stacks().size > 0) {
            dispatch(loadStacksForUser())
        }
     }  
}

export default connect(mapStateToProps)(ScrollComponent('profile', scrollOptions)(ProfileComponent));
