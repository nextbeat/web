import * as React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { List, Map } from 'immutable'
import * as format from 'date-fns/format'

import Icon from '@components/shared/Icon'
import Spinner from '@components/shared/Spinner'

import { loadRoomStats, clearStats } from '@actions/pages/creator/stats'
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

    componentWillUnmount() {
        this.props.dispatch(clearStats());
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
                <td>{mediaItem.get('session_count').toLocaleString()}</td>
                <td>{formatDuration(mediaItem.get('total_watch_duration'))}</td>
            </tr>
        )
    }

    render() {
        const { stats, isFetching, hasFetched, error } = this.props
        const videoCount = stats.mediaItems().filter(item => item.get('type') === 'video').size
        const roomThumbnail = stats.thumbnail('small')

        return (
            <div className="creator stats stats-room content">
                <div className="content_inner">
                    <div className="content_header">
                        <div className="content_back" onClick={this.handleBackClick}><Icon type="arrow-back" /></div>Stats
                    </div>
                    { isFetching && <Spinner styles={["grey"]} /> }
                    { hasFetched && 
                        <div className="creator_main stats_main">
                            <div className="stats_room">
                                <div className="stats_room_thumbnail" style={{ backgroundImage: `url(${roomThumbnail.get('url')})`}} />
                                <div className="stats_room_main">
                                    <div className="stats_room_title">{ stats.get('description') }</div>
                                    <div className="stats_room_date">{ format(stats.get('created_at'), 'MMM D, YYYY') }</div>
                                </div>
                                <Link className="stats_room_link" to={`/r/${stats.get('hid')}`}>Go to room</Link>
                            </div>
                            <div className="creator_section">
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
                            <div className="creator_section"> 
                                <div className="creator_section_title">Videos</div>
                                { videoCount > 0 && 
                                <table className="stats_table stats-room_table">
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
                                }
                                { videoCount === 0 &&
                                    <div className="creator_section_not-found">
                                        No video posts in room.
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
        isFetching: Stats.get(state, 'roomIsFetching'),
        hasFetched: Stats.get(state, 'roomHasFetched'),
        error: Stats.get(state, 'roomError'),
        stats: Stats.room(state)
    }
}

export default connect(mapStateToProps)(StatsRoom)