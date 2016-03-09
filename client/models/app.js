import { List } from 'immutable'
import ModelBase from './base'

const KEY_MAP = {
    // channels
    'channelsFetching': ['app', 'channels', 'isFetching'],
    'channelsError': ['app', 'channels', 'error'],
    'channelsIds': ['app', 'channels', 'ids']
}

export default class Profile extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "app";
    }

    channels() {
        return this.get('channelsIds', List()).map(id => this.__getEntity(id, 'channels'))
    }

}