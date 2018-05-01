import { List, Map } from 'immutable'

import { EntityModel } from './base'
import User from './user'
import Stack from './stack'
import { CommentAuthor } from '@models/objects/comment'

import { State } from '@types'

interface CommentProps {
    author: State
    created_at: string
    is_referenced_by: number
    id: number
    mediaitem_id: number
    mediaitem_url: string
    message: string
    result_indices: List<List<number>>
    stack: number
    stack_id: number
    subtype: string
    temporary_id: string
    type: string
    user_mentions: List<State>
}

export default class Comment extends EntityModel<CommentProps> {

    __count__?: number
    __no_header__?: boolean

    entityName = "comments"

    author(): CommentAuthor {
        return new CommentAuthor(this.get('author'))
    }

    stack(): Stack {
        return new Stack(this.get('stack', 0), this.entities)
    }

}