import { List, Set } from 'immutable'
import StateModel from './base'

const KEY_MAP = {
    // tags
    'tagsFetching': ['app', 'tags', 'isFetching'],
    'tagsError': ['app', 'tags', 'error'],
    'tagsIds': ['app', 'tags', 'ids'],
    // authError
    'authError': ['app', 'authError'],
    // environment
    'environment': ['app', 'environment'],
    // user-agent
    'os': ['app', 'ua', 'os', 'name'],
    'device': ['app', 'ua', 'device', 'name'],
    'browser': ['app', 'ua', 'browser', 'name'],
    'version': ['app', 'ua', 'browser', 'major'],
    // facebook
    'facebookAppId': ['app', 'facebookAppId'],
    // state
    'activeModal': ['app', 'state', 'modal'],
    'activeOverlay': ['app', 'state', 'overlay'],
    'activeDropdowns': ['app', 'state', 'dropdowns'],
    'volume': ['app', 'state', 'volume'],
    'width': ['app', 'state', 'width']
}

export default class App extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "app";
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

    isActiveDropdown(type) {
        return this.get('activeDropdowns', Set()).includes(type)
    }

}