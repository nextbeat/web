import { EntityModel } from './base'
import User from './user'
import Stack from './stack'

import { State } from '@types'

interface CommentProps {
    author: number
    created_at: string
    is_referenced_by: boolean
    id: number
    message: string
    stack: number
    subtype: string
    type: string
}

export default class Comment extends EntityModel<CommentProps> {

    entityName = "comments"

    author(): User {
        return new User(this.get('author', 0), this.entities)
    }

    stack(): Stack {
        return new Stack(this.get('stack', 0), this.entities)
    }

}