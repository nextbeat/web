import { AnalyticsTypes, ANALYTICS } from '../actions'
import { createFunctionWithTimeout } from '../utils'
import { assign, get } from 'lodash'
import { parse } from 'querystring'
import fetch from 'isomorphic-fetch'

const CAMPAIGN_MAP = {
    'e1': {
        'campaignName': 'july16_followup',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e2': {
        'campaignName': 'july16_forceful_outreach',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e3': {
        'campaignName': 'july16_outreach',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'e4': {
        'campaignName': 'aug16_vlogreachout',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email',
    }
}

function parseQuery(queryString) {
    // search query string for campaign-related parameters
    const source = get(parse(queryString), 's', '')
    if (source in CAMPAIGN_MAP) {
        let fields = CAMPAIGN_MAP[source]
        // set campaign-related parameters
        for (let field in fields) {
            ga('set', field, fields[field])
        }
    }
    
}

function handleIdentify(data) {
    const user = data.user
    ga('set', 'userId', user.get('id'))
}

function handlePage(data) {
    ga('set', 'page', document.location.pathname)

    if (document.location.search.length > 0) {
        parseQuery(document.location.search.substring(1))
    }

    ga('send', 'pageview')
}

function handleEvent(data) {
    let eventData = {
        eventCategory: data.category,
        eventAction: data.action,
        eventLabel: data.label,
        transport: 'beacon'
    }

    if (data.callback) {
        eventData.hitCallback = createFunctionWithTimeout(data.callback);
    }

    ga('send', 'event', eventData)
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
        case AnalyticsTypes.EVENT:
            return handleEvent(data)
    }
}