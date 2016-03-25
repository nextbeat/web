import { join } from 'path'
import { assign, isEmpty } from 'lodash'
import fetch from 'isomorphic-fetch'
import Promise from 'bluebird'
import moment from 'moment'
import { stringify } from 'querystring'
import { normalize } from 'normalizr'
import { Status, API_CALL } from '../actions'
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
        body={}
    } = options
    method = method.toUpperCase()
    return {
        method,
        body: ["GET", "HEAD"].indexOf(method) === -1 ? JSON.stringify(body) : undefined, 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin' 
    }
}

function callApi(options, store, action) {
    const { endpoint, schema, pagination, authenticated, queries, cancelOn } = options;
    const url = urlWithParams(endpoint, pagination, queries);
    const currentUser = new CurrentUser(store.getState());

    if (authenticated && !currentUser.isLoggedIn()) {
        return Promise.reject(new Error("User is not logged in."));
    }

    // we wrap in a bluebird promise to give access to bluebird methods (e.g. delay)
    return Promise.resolve().then(function() {
            return fetch(url, fetchOptions(options, store))
        }).then(response => response.json().then(json => ({ json, response })))
        // .delay(1000) // FOR DEBUG
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

// A Redux middleware function which looks for actions
// which call the API server and fetches the data
export default store => next => action => {

    const apiCall = action[API_CALL];
    if (typeof apiCall === 'undefined') {
        return next(action);
    }

    const { pagination, onSuccess, onSuccessImmediate } = apiCall;

    // call api server with the given endpoint, then
    // dispatch action depending on success of the call
    const fetchPromise = callApi(apiCall, store, action)

    function actionWith(data) {
        var newAction = assign({}, action, data, { fetchPromise });
        delete newAction[API_CALL];
        return newAction;
    }

    fetchPromise.then(response => {

            // success callback which runs after reducer 
            if (typeof onSuccess === 'function') {
                process.nextTick(() => {
                    onSuccess(store, next, action, response);
                })
            }

            // success callback which runs before reducer
            if (typeof onSuccessImmediate === 'function') {
                onSuccessImmediate(store, next, action, response);
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

    // dispatch action which asserts request is being made
    // include fetch promise so we can cancel it if need be
    let requestData = { status: Status.REQUESTING }
    if (pagination) requestData.pagination = pagination
    next(actionWith(requestData));
    

}