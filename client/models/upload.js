import ModelBase from './base'

const KEY_MAP = {
    'fileName': ['upload', 'fileName']
}

export default class Upload extends ModelBase {

    constructor(state) {
        super(state);
        this.keyMap = KEY_MAP;
        this.name = "upload";
    }

    

}