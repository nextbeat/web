import { AnalyticsTypes, ANALYTICS } from '../actions'
import { assign } from 'lodash'
import fetch from 'isomorphic-fetch'

function handleIdentify(data) {
    const user = data.user
    ga('set', 'userId', user.get('id'))
}

function handlePage(data) {
    ga('set', 'page', document.location.pathname)
    ga('send', 'pageview')
}

export default store => next => action => {

    const data = action[ANALYTICS]
    if (typeof data === 'undefined') {
        return next(action)
    }

    // send the action without the ANALYTICS attribute
    let newAction = assign({}, action)
    delete newAction[ANALYTICS];
    next(newAction);

    // trigger the analytics call based on the type
    switch (data.type) {
        case AnalyticsTypes.IDENTIFY:
            return handleIdentify(data)
        case AnalyticsTypes.PAGE:
            return handlePage(data)
    }
}