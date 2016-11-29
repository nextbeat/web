import React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import { Notifications as NotificationsModel } from '../models'
import { loadNotifications, clearNotifications } from '../actions'
import Spinner from './shared/Spinner.react' 
import NotificationItem from './notifications/NotificationItem.react'

class Notifications extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.dispatch(loadNotifications())
    }

    componentWillUnmount() {
        this.props.dispatch(clearNotifications())
    }

    render() {
        const { notifications } = this.props 
        const notificationsList = notifications.get('allNotifications', List())

        return (
            <div className="notifications content" id="notifications">
                { notifications.get('isFetching') && <Spinner type="grey" /> }
                { !notifications.get('isFetching') &&
                    <div className="notifications_list">
                        { notificationsList.map((notification, idx) => 
                            <NotificationItem key={idx} notification={notification} />
                        )}
                        { notificationsList.size === 0 &&
                            <div className="notifications_not-found">
                                Check back later to see notifications about people you've subscribed to and rooms you've bookmarked.
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        notifications: new NotificationsModel(state)
    }
}

export default connect(mapStateToProps)(Notifications)