import { List, Map } from 'immutable'

import StateModel from '../base'
import StackEntity from '../../entities/stack'

const KEY_MAP = {
    // meta
    'isFetching': ['meta', 'isFetching'],
    'error': ['meta', 'error'],
    'name': ['meta', 'name'],
    'slug': ['meta', 'slug'],
    'description': ['meta', 'description'],
    // stacks
    'stacksFetching': ['pagination', 'stacks', 'isFetching'],
    'stacksError': ['pagination', 'stacks', 'error'],
    'stackIds': ['pagination', 'stacks', 'ids']
}

export default class Section extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'section'];
    }

    stacks() {
        return this.__getPaginatedEntities('stacks', { entityClass: StackEntity })
    }

    isLoaded() {
        return this.get('name', null) !== null;
    }

}