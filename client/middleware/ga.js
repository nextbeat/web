import { GATypes, GA } from '../actions'
import { createFunctionWithTimeout } from '../utils'
import assign from 'lodash/assign'
import get from 'lodash/get'
import { parse } from 'querystring'
import fetch from 'isomorphic-fetch'

/**
 * Middleware which handles Google Analytics session tracking.
 * Custom first-party analytics is handled in a separate 
 * function in analytics.js.
 */

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
    },
    'es': {
        'campaignName': 'email_subscription',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'email'
    },
    'pw': {
        'campaignName': 'web_push',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'push'
    },
    'ps': {
        'campaignName': 'safari_push',
        'campaignSource': 'nextbeat',
        'campaignMedium': 'push'
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

    const data = action[GA]
    if (typeof data === 'undefined') {
        return next(action)
    }

    // send the action without the GA attribute
    let newAction = assign({}, action)
    delete newAction[GA];
    next(newAction);

    // trigger the analytics call based on the type
    switch (data.type) {
        case GATypes.IDENTIFY:
            return handleIdentify(data)
        case GATypes.PAGE:
            return handlePage(data)
        case GATypes.EVENT:
            return handleEvent(data)
    }
}