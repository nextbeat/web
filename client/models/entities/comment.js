import EntityModel from './base'
import User from './user'
import Stack from './stack'

export default class Comment extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "comments";
    }

    author() {
        return new User(this.__entity().get('author', 0), this.entities)
    }

    stack() {
        const stackId = this.__entity().get('stack', 0) || this.__entity().get('stack_id', 0)
        return new Stack(stackId, this.entities)
    }

}