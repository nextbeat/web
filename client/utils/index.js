import { List, Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { CurrentUser } from '../models'

export function getPaginatedEntities(state, page, key, entityKey) {
    entityKey = entityKey || key;
    return state.getIn([page, 'pagination', key, 'ids'], List())
        .map(id => getEntity(state, entityKey, id));
}

export function getLiveEntities(state, page, key) {
    return state.getIn([page, 'live', key], List())
        .map(id => getEntity(state, key, id));
}

export function getEntity(state, key, id) {
    if (typeof id === "number") {
        id = id.toString();
    }
    return state.getIn(['entities', key, id], Map());
}

export function componentWithUser(Component) {
    class UserContainer extends React.Component {
        render() {
            return <Component {...this.props} />
        }
    }

    function mapStateToProps(state) {
        return { 
            user: new CurrentUser(state)
        }   
    }

    return connect(mapStateToProps)(UserContainer);
}