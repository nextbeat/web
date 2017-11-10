import { Map } from 'immutable'
import { EntityModel } from '../base'
import { State } from '@types'

/**
 * Subclass of EntityModel used for instantiating objects
 * which we want to have the same function signature as
 * entity objects but which aren't stored in the entities
 * subtree, so don't require setting the entire state.
 * Used for temporary comments (before an id is
 * established).
 */
export default class TemporaryEntityModel<Props> extends EntityModel<Props> {

    constructor(public temporaryEntity: State) {
        super(0, Map());
        this.temporaryEntity = temporaryEntity;
    }

    entity() {
        return this.temporaryEntity;
    }

}