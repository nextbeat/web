import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import PageError from '@components/shared/PageError'
import Badge from '@components/shared/Badge'
import CurrentUser from '@models/state/currentUser'
import UserEntity from '@models/entities/user'
import { State } from '@types'
import { secureUrl } from '@utils'

interface Props {
    isLoggedIn: boolean
    subscriptionsFetching: boolean
    subscriptions: List<UserEntity>
}

class Subscriptions extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        this.renderUser = this.renderUser.bind(this)
    }

    renderUser(user: UserEntity) {
        let profpicUrl = user.thumbnail('small').get('url')
        let profpicStyle = profpicUrl ? { backgroundImage: `url(${secureUrl(profpicUrl)})`} : {}
        const plural = user.get('subscriber_count') === 1 ? '' : 's'

        return (
            <div key={user.get('id')} className="subscriptions_user">
                <div className="subscriptions_user_profpic" style={profpicStyle} />
                <div className="subscriptions_user_info">
                    <Link className="subscriptions_user_username" to={`/u/${user.get('username')}`}>{user.get('username')}</Link>
                    <div className="subscriptions_user_subscribers">{`${user.get('subscriber_count')} subscriber${plural}`}</div>
                </div>
                { user.get('open_stacks', 0) > 0 && <Badge type="open" elementType="subscriptions_user">OPEN ROOM</Badge> }
            </div>
        )
    }

    render() {
        const { subscriptions, subscriptionsFetching, isLoggedIn } = this.props

        return (
            <div className="subscriptions">
                <Helmet title="Subscriptions" />
                { !isLoggedIn && <PageError>Must be logged in.</PageError> }
                { isLoggedIn && 
                    <div className="content_inner">
                        <div className="content_header">
                            Subscriptions
                        </div>
                        { subscriptions.size > 0 && subscriptions.map(u => this.renderUser(u)) }
                        { subscriptions.size === 0 && !subscriptionsFetching && 
                            <span className="search_no-content">You have not subscribed to any people.</span>
                        }
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state: State): Props {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        subscriptionsFetching: CurrentUser.get(state, 'subscriptionsFetching'),
        subscriptions: CurrentUser.subscriptions(state)
    }
}

export default connect(mapStateToProps)(Subscriptions)