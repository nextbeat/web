import { List, Map } from 'immutable'

import StackEntity from '../../entities/stack'
import StateModel from '../base'

const KEY_MAP = {
    // sections
    'sectionsFetching': ['isFetching'],
    'sectionsError': ['error'],
    'sections': ['sections'],
    // main card
    'mainCardId': ['mainCardId']
}

export default class Home extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['pages', 'home'];
    }

    stacks(idx) {
        const stackIds = this.get('sections', List()).get(idx, Map()).get('stacks', List());
        return stackIds.map(id => new StackEntity(id, this.state.get('entities')))
    }

    mainCardStack() {
        return new StackEntity(this.get('mainCardId'), this.state.get('entities'))
    }

    isLoaded() {
        return this.get('sections', List()).size > 0
    }

}