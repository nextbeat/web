import { Map } from 'immutable'
import ObjectModel from './base'

interface CommentAuthorProps {
    badge: string
    id: number
    username: string
}

export class CommentAuthor extends ObjectModel<CommentAuthorProps> {
    isBot(): boolean {
        return this.get('badge') === 'bot'
    }
}

interface CommentProps {
    message: string
    submit_status: string
    subtype: string
    temporary_id: string
    type: string
    username: string   
    badge: string 

    // for compatibility
    id?: any
    created_at?: any
    is_referenced_by?: any
    result_indices?: any
    user_mentions?: any
}

export default class Comment extends ObjectModel<CommentProps> {

    __no_header__?: boolean    
    
    author(): CommentAuthor {
        return new CommentAuthor(Map({ 
            username: this.get('username'), 
            badge: this.get('badge') 
        }))
    }

}