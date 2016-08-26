import ModelBase from './base'
import { Status } from '../actions'

const KEY_MAP = {
    'fileName': ['upload', 'fileName'],
    'status': ['upload', 'atatus']
}

export default class Upload extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "upload";
    }

    isUploading() {
        return this.get('status') === Status.REQUESTING
    }

}