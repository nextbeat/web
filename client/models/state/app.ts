import { List, Set } from 'immutable'
import { Location } from 'history'

import { StateModelFactory } from '@models/state/base'
import { createEntityListSelector } from '@models/utils'
import { State } from '@types'

interface AppProps {
    tagsFetching: boolean
    tagsError: string
    tagIds: List<number>

    authError: string

    environment: string

    os: string
    osVersion: string
    device: string
    deviceType: string
    browser: string
    version: string

    facebookAppId: string
    googleAnalyticsId: string

    activeModal: string
    activeOverlay: string
    activeDropdowns: Set<string>
    sidebarAnimating: boolean
    splashTopbarCollapsed: boolean
    volume: number
    width: 'small' | 'medium' | 'room-medium' | 'large'

    location: Location
}

const keyMap = {
    // tags
    'tagsFetching': ['tags', 'isFetching'],
    'tagsError': ['tags', 'error'],
    'tagIds': ['tags', 'ids'],
    // authError
    'authError': ['authError'],
    // environment
    'environment': ['environment'],
    // user-agent
    'os': ['ua', 'os', 'name'],
    'osVersion': ['ua', 'os', 'version'],
    'device': ['ua', 'device', 'name'],
    'deviceType': ['ua', 'device', 'type'],
    'browser': ['ua', 'browser', 'name'],
    'version': ['ua', 'browser', 'major'],
    // third party ids
    'facebookAppId': ['facebookAppId'],
    'googleAnalyticsId': ['googleAnalyticsId'],
    // state
    'activeModal': ['state', 'modal'],
    'activeOverlay': ['state', 'overlay'],
    'activeDropdowns': ['state', 'dropdowns'],
    'sidebarAnimating': ['state', 'sidebarAnimating'],
    'splashTopbarCollapsed': ['state', 'splashTopbarCollapsed'],
    'volume': ['state', 'volume'],
    'width': ['state', 'width'],
    // location
    'location': ['location']
}

interface DeviceData {
    os: string
    os_version: string
    device: string
    browser_name: string
    browser_version: string
}

const keyMapPrefix = ['app']

export default class App extends StateModelFactory<AppProps>(keyMap, keyMapPrefix) {

    static tags = createEntityListSelector(App, 'tagIds', 'tags')

    static hasAuthError(state: State) {
        return !!this.get(state, 'authError')
    }

    static isIOS(state: State) {
        return this.get(state, 'os') === 'iOS'
    }

    static isAndroid(state: State) {
        return this.get(state, 'os') === 'Android'
    }

    static isMobile(state: State) {
        return ['mobile', 'tablet'].indexOf(this.get(state, 'deviceType')) > -1
    }

    static isActiveDropdown(state: State, type: string) {
        return this.get(state, 'activeDropdowns', Set()).includes(type)
    }

    static hasNavigated(state: State) {
        return this.get(state, 'location') !== null
    }

    static deviceData(state: State): Partial<DeviceData> {
        var data: Partial<DeviceData> = {};
        if (this.get(state, 'os')) data.os = this.get(state, 'os');
        if (this.get(state, 'osVersion')) data.os_version = this.get(state, 'osVersion');
        if (this.get(state, 'device')) data.device = this.get(state, 'device');
        if (this.get(state, 'browser')) data.browser_name = this.get(state, 'browser');
        if (this.get(state, 'version')) data.browser_version = this.get(state, 'version');
        return data
    }

}