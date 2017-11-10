import * as React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { List } from 'immutable'

import PageError from '@components/shared/PageError'
import User from '@components/shared/User'
import Badge from '@components/shared/Badge'
import CurrentUser from '@models/state/currentUser'
import UserModel from '@models/entities/user'
import { State } from '@types'

interface Props {
    isLoggedIn: boolean
    subscriptionsFetching: boolean
    subscriptions: List<UserModel>
}

class Subscriptions extends React.Component<Props> {

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
                        { subscriptions.size > 0 && 
                            subscriptions.map(u => 
                                <div key={u.get('id')} className="search_result search_result-user">
                                    <User user={u} showSubscribe={false} />
                                    { u.get('open_stacks', 0) > 0 && <Badge type="open" elementType="search_result-user">OPEN ROOM</Badge> }
                                </div>
                            )
                        }
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