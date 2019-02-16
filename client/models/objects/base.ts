import { Map } from 'immutable'
import { EntityModel } from '@models/entities/base'
import { State } from '@types'

/**
 * Subclass of EntityModel used for instantiating objects
 * which we want to have the same function signature as
 * entity objects but which aren't stored in the entities
 * subtree, so don't require setting the entire state.
 */
export default class ObjectModel<Props> extends EntityModel<Props> {

    constructor(public object: State) {
        super(0, Map());
    }

    entity() {
        return this.object;
    }

}