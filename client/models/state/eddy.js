import StateModel from './base'

const KEY_MAP = {
    'client': ['client'],
    'hasLostConnection': ['hasLostConnection'],
}

export default class Eddy extends StateModel {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.keyMapPrefix = ['eddy'];

        Object.defineProperty(this, 'client', {
            get: () => { return this.get('client') }
        });
    }

    isConnected() {
        return this.client && this.client.isConnected()
    }

}

