import { List, Map } from 'immutable'
import ModelBase from './base'

const KEY_MAP = {
    // meta
    'isFetching': ['section', 'meta', 'isFetching'],
    'error': ['section', 'meta', 'error'],
    'name': ['section', 'meta', 'name'],
    'slug': ['section', 'meta', 'slug'],
    'description': ['section', 'meta', 'description'],
    // stacks
    'stacksFetching': ['section', 'pagination', 'stacks', 'isFetching'],
    'stacksError': ['section', 'pagination', 'stacks', 'error'],
    'stackIds': ['section', 'pagination', 'stacks', 'ids']
}

export default class Section extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "section";
    }

    stacks() {
        return this.__getPaginatedEntities('stacks')
    }

}