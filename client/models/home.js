import { List, Map } from 'immutable'
import ModelBase from './base'

const KEY_MAP = {
    // sections
    'sectionsFetching': ['home', 'isFetching'],
    'sectionsError': ['home', 'error'],
    'sections': ['home', 'sections']
}

export default class Home extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "home";
    }

    stacks(idx) {
        const stackIds = this.get('sections', List()).get(idx, Map()).get('stacks', List());
        return stackIds.map(id => this.__getEntity(id, "stacks"))
    }

}