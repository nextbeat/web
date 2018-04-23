import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import * as format from 'date-fns/format'

import Spinner from '@components/shared/Spinner'
import Icon from '@components/shared/Icon'

import { triggerAuthError } from '@actions/app'
import { loadStats, clearStats } from '@actions/pages/creator/stats'
import CurrentUser from '@models/state/currentUser'
import StatsModel from '@models/state/pages/creator/stats'
import StatsUser from '@models/entities/statsUser'
import StatsStack from '@models/entities/statsStack'
import { State, DispatchProps } from '@types'
import { formatNumber, formatDuration } from '@utils'

interface ConnectProps {
    isLoggedIn: boolean
    username: string

    isFetching: boolean
    hasFetched: boolean
    error: string
    stats: StatsUser
}

type Props = ConnectProps & DispatchProps 

class StatsComponent extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.handleBackClick = this.handleBackClick.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(loadStats())
    }

    componentDidUpdate(prevProps: Props) {
        const { isLoggedIn, dispatch } = this.props

        if (isLoggedIn !== prevProps.isLoggedIn) {
            if (!isLoggedIn) {
                dispatch(triggerAuthError())
            } else {
                dispatch(loadStats())
            }
        }
    }

    componentWillUnmount() {
        this.props.dispatch(clearStats());
    }

    handleBackClick() {
        browserHistory.push(`/u/${this.props.username}`)
    }

    handleStackClick(stack: StatsStack) {
        browserHistory.push(`/creator/stats/${stack.get('hid')}`)
    }

    renderStatsStack(stack: StatsStack) {
        return (
            <tr key={stack.get('id')} onClick={this.handleStackClick.bind(this, stack)}>
                <td className="stats_table_detail">{format(stack.get('created_at'), 'MMM D, YYYY')}</td>
                <td className="stats_table_link">{stack.get('description')}</td>
                <td>{stack.get('views').toLocaleString()}</td>
                <td>{stack.get('total_watch_session_count').toLocaleString()}</td>
            </tr>
        )
    }

    render() {
        const { stats, isFetching, hasFetched, error } = this.props
        return (
            <div className="creator stats stats-user content">
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div>Stats
                    </div>
                    { isFetching && <Spinner styles={["grey"]} /> }
                    { hasFetched && 
                        <div className="creator_main stats_main">
                            <div className="creator_section">
                                <div className="stats_items">   
                                    <div className="stats_item">
                                        <div className="stats_item_value">{formatNumber(stats.get('views'))}</div>
                                        <div className="stats_item_description">Total visits</div>
                                    </div>
                                    <div className="stats_item">
                                        <div className="stats_item_value">{formatNumber(stats.get('total_watch_session_count'))}</div>
                                        <div className="stats_item_description">Total video views</div>
                                    </div>
                                    <div className="stats_item">
                                        <div className="stats_item_value">{Math.floor(stats.get('views')/Math.max(1, stats.stacks().size))}</div>
                                        <div className="stats_item_description">Average visits per room</div>
                                    </div>
                                    <div className="stats_item">
                                        <div className="stats_item_value">{formatDuration(stats.get('total_watch_duration'), false)}</div>
                                        <div className="stats_item_description">Total hours watched</div>
                                    </div>
                                </div>
                            </div>
                            <div className="creator_section"> 
                                <div className="creator_section_title">
                                    Rooms
                                    <div className="creator_section_description">
                                        Select a room for more information, including average viewer session time and views per video.
                                    </div>
                                </div>
                                {stats.stacks().size > 0 && 
                                <table className="stats_table stats-user_table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Title</th>
                                            <th>Visits</th>
                                            <th>Video views</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.stacks().map((statsStack) => this.renderStatsStack(statsStack))}
                                    </tbody>
                                </table>
                                }
                                {stats.stacks().size === 0 &&
                                <div className="creator_section_not-found">
                                    Create a room to see its stats!
                                </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isLoggedIn: CurrentUser.isLoggedIn(state),
        username: CurrentUser.entity(state).get('username'),

        isFetching: StatsModel.get(state, 'userIsFetching'),
        hasFetched: StatsModel.get(state, 'userHasFetched'),
        error: StatsModel.get(state, 'userError'),
        stats: StatsModel.user(state)
    }
}

export default connect(mapStateToProps)(StatsComponent)