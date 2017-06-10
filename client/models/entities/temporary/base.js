import EntityModel from '../base'

/**
 * Subclass of EntityModel used for instantiating objects
 * which we want to have the same function signature as
 * entity objects but which aren't stored in the entities
 * subtree, so don't require setting the entire state.
 * Used for temporary comments (before an id is
 * established).
 */
export default class TemporaryEntityModel extends EntityModel {

    constructor(temporaryEntity) {
        super();
        this.temporaryEntity = temporaryEntity;
    }

    __entity() {
        return this.temporaryEntity;
    }

}