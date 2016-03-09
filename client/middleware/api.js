import { join } from 'path'
import { assign, isEmpty } from 'lodash'
import fetch from 'isomorphic-fetch'
import Promise from 'bluebird'
import moment from 'moment'
import { stringify } from 'querystring'
import { normalize } from 'normalizr'
import { Status, selectMediaItem } from '../actions'
import { CurrentUser } from '../models'

const API_ROOT = '/api/';

function urlWithParams(endpoint, pagination, queries) {
    let url = join(API_ROOT, endpoint);
    queries = queries || {};

    if (typeof pagination !== 'undefined') {
        queries = assign({}, queries, { 
            page: pagination.page,
            limit: pagination.limit,
            before: moment(pagination.before).format()
        })
    }

    if (!isEmpty(queries)) {
        url += "?" + stringify(queries);
    }

    return url;
}

function fetchOptions(options, store) {
    let { 
        method="GET", 
        body={},
        authenticated
    } = options
    method = method.toUpperCase()
    return {
        method,
        body: ["GET", "HEAD"].indexOf(method) === -1 ? JSON.stringify(body) : undefined, 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: authenticated ? 'same-origin' : 'omit'
    }
}

function callApi(options, store) {
    const { endpoint, schema, pagination, authenticated, queries } = options;
    const url = urlWithParams(endpoint, pagination, queries);
    const currentUser = new CurrentUser(store.getState());

    if (authenticated && !currentUser.isLoggedIn()) {
        return Promise.reject(new Error("User is not logged in."));
    }

    return fetch(url, fetchOptions(options, store))
        .then(response => response.json().then(json => ({ json, response })))
        .then(({ json, response }) => {
            if (!response.ok) {
                return Promise.reject(new Error(json.error));
            }
            if (typeof pagination !== 'undefined') {
                return assign({}, normalize(json.objects, schema), json.meta);
            } else if (typeof schema !== 'undefined') {
                return normalize(json, schema);
            } else {
                return json;
            }
        })
}

export const API_CALL = Symbol('API_CALL');

// A Redux middleware function which looks for actions
// which call the API server and fetches the data
export default store => next => action => {

    const apiCall = action[API_CALL];
    if (typeof apiCall === 'undefined') {
        return next(action);
    }

    const { pagination, onSuccess } = apiCall;

    function actionWith(data) {
        var newAction = assign({}, action, data);
        delete newAction[API_CALL];
        return newAction;
    }

    // dispatch action which asserts request is being made
    let requestData = { status: Status.REQUESTING }
    if (pagination) requestData.pagination = pagination
    next(actionWith(requestData));

    // call api server with the given endpoint, then
    // dispatch action depending on success of the call
    callApi(apiCall, store)
        .then(response => {
            if (typeof onSuccess === 'function') {
                process.nextTick(() => {
                    onSuccess(store, next, action, response);
                })
            }
            return next(actionWith({
                status: Status.SUCCESS,
                response
            }))
        })
        .catch(error => next(actionWith({
            status: Status.FAILURE,
            error: error.message
        })));
    

}