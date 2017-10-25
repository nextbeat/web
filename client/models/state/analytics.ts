import { List, Map } from 'immutable'
import { StateModelFactory } from '@models/state/base'
import { AnalyticsType, AnalyticsSessionType } from '@actions/types'

interface AnalyticsProps {
    userId: number
    activeSessions: List<any>
    chatTimeoutId: number
}

const keyMap = {
    'userId': ['userId'],
    'activeSessions': ['activeSessions'],
    'chatTimeoutId': ['chatTimeoutId']
}

const keyMapPrefix = ['analytics']

export default class Analytics extends StateModelFactory<AnalyticsProps>(keyMap, keyMapPrefix) {}