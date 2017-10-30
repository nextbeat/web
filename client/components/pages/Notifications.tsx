import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'

import NotificationsModel from '@models/state/notifications'
import { loadActivity, clearNotifications } from '@actions/notifications'
import Spinner from '@components/shared/Spinner' 
import NotificationItem from './notifications/NotificationItem'
import { State, DispatchProps } from '@types'

interface ConnectProps {
    activity: List<State>
    isFetching: boolean
}

type Props = ConnectProps & DispatchProps

class Notifications extends React.Component<Props> {

    componentDidMount() {
        this.props.dispatch(loadActivity())
    }

    componentWillUnmount() {
        this.props.dispatch(clearNotifications())
    }

    render() {
        const { activity, isFetching } = this.props 

        return (
            <div className="notifications content" id="notifications">
                <div className="content_inner">
                    { isFetching && <Spinner styles={["grey"]} /> }
                    { !isFetching &&
                        <div className="notifications_list">
                            { activity.map((notification, idx) => 
                                <NotificationItem key={idx} notification={notification} />
                            )}
                            { activity.size === 0 &&
                                <div className="notifications_not-found">
                                    Check back later to see notifications about people you've subscribed to and rooms you've bookmarked.
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State) {
    return {
        activity: NotificationsModel.activity(state),
        isFetching: NotificationsModel.get(state, 'isFetching')
    }
}

export default connect(mapStateToProps)(Notifications)