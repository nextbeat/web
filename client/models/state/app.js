import { List, Set } from 'immutable'
import StateModel from './base'

const KEY_MAP = {
    // tags
    'tagsFetching': ['tags', 'isFetching'],
    'tagsError': ['tags', 'error'],
    'tagsIds': ['tags', 'ids'],
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
    // facebook
    'facebookAppId': ['facebookAppId'],
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

export default class App extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['app'];
    }

    tags() {
        return this.get('tagsIds', List()).map(id => this.__getEntity(id, 'tags'))
    }

    hasAuthError() {
        return this.get('authError', true)
    }

    isIOS() {
        return this.get('os') === 'iOS'
    }

    isAndroid() {
        return this.get('os') === 'Android'
    }

    isMobile() {
        return this.get('deviceType') === 'mobile'
    }

    isActiveDropdown(type) {
        return this.get('activeDropdowns', Set()).includes(type)
    }

    hasNavigated() {
        return this.get('location') !== null
    }

    deviceData() {
        var data = {};
        if (this.get('os')) data.os = this.get('os');
        if (this.get('osVersion')) data.os_version = this.get('osVersion');
        if (this.get('device')) data.device = this.get('device');
        if (this.get('browser')) data.browser_name = this.get('browser');
        if (this.get('version')) data.browser_version = this.get('version');
        return data
    }

}