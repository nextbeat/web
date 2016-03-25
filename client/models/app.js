import { List } from 'immutable'
import ModelBase from './base'

const KEY_MAP = {
    // tags
    'tagsFetching': ['app', 'tags', 'isFetching'],
    'tagsError': ['app', 'tags', 'error'],
    'tagsIds': ['app', 'tags', 'ids'],
    // authError
    'authError': ['app', 'authError']
}

export default class App extends ModelBase {

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

}