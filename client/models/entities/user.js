import EntityModel from './base'

export default class User extends EntityModel {

    constructor(id, entities) {
        super(id, entities);
        this.entityName = "users";
    }

}