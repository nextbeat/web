import EntityModel from './base'
import User from './user'
import Stack from './stack'

export default class Comment extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "comments";
    }

    author() {
        return new User(this.__entity().get('author_id', 0), this.entities)
    }

    stack() {
        return new Stack(this.__entity().get('stack_id', 0), this.entities)
    }

    authorIsCreator() {
        return this.author().get('id') === this.stack().author().get('id')
    }

}