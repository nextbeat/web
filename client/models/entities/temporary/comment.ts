import { Map } from 'immutable'
import TemporaryEntityModel from './base'

interface TemporaryCommentProps {
    username: string
    message: string
    temporary_id: string
}

export default class TemporaryComment extends TemporaryEntityModel<TemporaryCommentProps> {
    
    author() {
        return Map({ username: this.get('username'), is_bot: false })
    }

    stack() { /* unused */
        return null;
    }

}