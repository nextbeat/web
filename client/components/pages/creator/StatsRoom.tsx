import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { List, Map } from 'immutable'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'

import { loadRoomStats } from '@actions/pages/creator/stats'
import Stats from '@models/state/pages/creator/stats'
import StatsStack, { StatsMediaItem } from '@models/entities/statsStack'
import { State, DispatchProps, RouteProps } from '@types'
import { formatNumber, formatDuration } from '@utils'

interface ConnectProps {
    isFetching: boolean
    hasFetched: boolean
    error: string
    stats: StatsStack
}

interface Params {
    hid: string
}

type Props = ConnectProps & DispatchProps & RouteProps<Params>

class StatsRoom extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch, params } = this.props
        dispatch(loadRoomStats(params.hid))
    }

    handleBackClick() {
        browserHistory.push(`/creator/stats`)
    }

    renderStatsMediaItem(mediaItem: StatsMediaItem, idx: number) {
        if (mediaItem.get('type') === 'photo') {
            return null;
        }

        let titleElem = <span className="stats-room_media-item-no-title">n/a</span>
        if (mediaItem.get('title')) {
            titleElem = <span className="stats-room_media-item-title">{mediaItem.get('title')}</span>
        } else if (mediaItem.get('references')) {
            titleElem = <span className='stats-room_media-item-references'><Icon type="reply" />{mediaItem.get('references')}</span>
        }

        return (
            <tr key={mediaItem.get('id')}>
                <td>{idx}</td>
                <td>{titleElem}</td>
                <td>{mediaItem.get('session_count')}</td>
                <td>{mediaItem.get('total_watch_duration')}</td>
            </tr>
        )
    }

    render() {
        const { stats, isFetching, hasFetched, error } = this.props
        return (
            <div className="stats stats-room content">
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div>Stats
                    </div>
                    <div className="stats_room">
                        { stats.get('description') }
                    </div>
                    <div className="stats_section">
                        <div className="stats_items">   
                            <div className="stats_item">
                                <div className="stats_item_value">{formatDuration(stats.get('session_duration')/Math.max(1, stats.get('session_count')))}</div>
                                <div className="stats_item_description">Average session time</div>
                            </div>
                            <div className="stats_item">
                                <div className="stats_item_value">{formatDuration(stats.get('high_activity_session_duration')/Math.max(1, stats.get('high_activity_session_count')))}</div>
                                <div className="stats_item_description">Top 10% session time</div>
                            </div>
                            <div className="stats_item">
                                <div className="stats_item_value">{formatNumber(stats.get('views'))}</div>
                                <div className="stats_item_description">Total visits</div>
                            </div>
                            <div className="stats_item">
                                <div className="stats_item_value">{formatNumber(stats.get('total_watch_session_count'))}</div>
                                <div className="stats_item_description">Total video views</div>
                            </div>
                        </div>
                    </div>
                    <div className="stats_section"> 
                        <div className="stats_section_title">Rooms</div>
                        <div className="stats_section_description">
                            Select a room for more information, including average viewer session time and views per video.
                        </div>
                        <table className="stats_table">
                            <thead>
                                <tr>
                                    <th>Post #</th>
                                    <th>Title</th>
                                    <th>Views</th>
                                    <th>Total time watched</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.mediaItems().map((item, idx) => this.renderStatsMediaItem(item, idx))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: State): ConnectProps {
    return {
        isFetching: Stats.get(state, 'userIsFetching'),
        hasFetched: Stats.get(state, 'userHasFetched'),
        error: Stats.get(state, 'userError'),
        stats: Stats.room(state)
    }
}

export default connect(mapStateToProps)(StatsRoom)