import { List, Map } from 'immutable'

import { EntityModel } from './base'
import User from './user'
import Stack from './stack'

import { State } from '@types'

interface CommentAuthorProps {
    badge: string
    id: number
    username: string
}

export class CommentAuthor extends EntityModel<CommentAuthorProps> {
    constructor(public _entity: State) {
        super(0, Map())
    }

    entity(): State {
        return this._entity;
    }

    isBot(): boolean {
        return this.get('badge') === 'bot'
    }
}

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