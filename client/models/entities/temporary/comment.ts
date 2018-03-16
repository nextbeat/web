import { Map } from 'immutable'
import TemporaryEntityModel from './base'
import { CommentAuthor } from '../comment'

interface TemporaryCommentProps {
    message: string
    submit_status: string
    subtype: string
    temporary_id: string
    type: string
    username: string    
}

export default class TemporaryComment extends TemporaryEntityModel<TemporaryCommentProps> {

    __no_header__?: boolean    
    
    author(): CommentAuthor {
        return new CommentAuthor(Map({ username: this.get('username') }))
    }

}