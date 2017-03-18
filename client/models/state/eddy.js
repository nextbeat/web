import StateModel from './base'

const KEY_MAP = {
    'client': ['client']
}

export default class Eddy extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['eddy'];
    }

}