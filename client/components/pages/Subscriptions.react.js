import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import PageError from '../shared/PageError.react'
import User from '../shared/User.react'
import Badge from '../shared/Badge.react'
import { CurrentUser } from '../../models'

class Subscriptions extends React.Component {

    render() {
        const { currentUser } = this.props
        let subscriptions = currentUser.subscriptions()

        return (
            <div className="subscriptions">
                <Helmet title="Subscriptions" />
                { !currentUser.isLoggedIn() && <PageError>Must be logged in.</PageError> }
                { currentUser.isLoggedIn() && 
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
                        { subscriptions.size === 0 && !currentUser.get('subscriptionsFetching') && 
                            <span className="search_no-content">You have not subscribed to any people.</span>
                        }
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: new CurrentUser(state)
    }
}

export default connect(mapStateToProps)(Subscriptions)