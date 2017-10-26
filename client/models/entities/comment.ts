import { List } from 'immutable'

import { EntityModel } from './base'
import User from './user'
import Stack from './stack'

import { State } from '@types'

interface CommentProps {
    author: number
    created_at: string
    is_referenced_by: number
    id: number
    mediaitem_id: number
    mediaitem_url: string
    message: string
    result_indices: List<List<number>>
    stack: number
    subtype: string
    temporary_id: string
    type: string
    user_mentions: List<State>
}

export default class Comment extends EntityModel<CommentProps> {

    __count__?: number
    __no_header__?: boolean

    entityName = "comments"

    author(): User {
        return new User(this.get('author', 0), this.entities)
    }

    stack(): Stack {
        return new Stack(this.get('stack', 0), this.entities)
    }

}