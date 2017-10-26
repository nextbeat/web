import { Map } from 'immutable'
import TemporaryEntityModel from './base'

interface TemporaryCommentProps {
    message: string
    submit_status: string
    temporary_id: string
    username: string    
}

export default class TemporaryComment extends TemporaryEntityModel<TemporaryCommentProps> {

    __no_header__?: boolean    
    
    author() {
        return Map({ username: this.get('username'), is_bot: false })
    }

    stack() { /* unused */
        return null;
    }

}