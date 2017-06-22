import TemporaryEntityModel from './base'
import { Map } from 'immutable'

export default class TemporaryComment extends TemporaryEntityModel {
    
    author() {
        return Map({ username: this.get('username'), is_bot: false })
    }

    stack() { /* unused */
        return null;
    }

}