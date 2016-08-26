import fetch from 'isomorphic-fetch'
import Promise from 'bluebird'
import { assign, find } from 'lodash'

import { ActionTypes, Status } from '../actions'
import { App } from '../models'

function bucketUrl(state) {
    var app = new App(state)
    if (app.get('environment') === 'production') {
        return 'http://nextbeat.media.s3.amazonaws.com/'
    } else {
        return 'http://nextbeat.dev.media.s3.amazonaws.com/'
    }
}

function uploadFile(store, next, action, policy) {
    let xhr = new XMLHttpRequest()
    let fd = new FormData()
    let file = action.file

    function getCondition(key) {
        let condition = find(policy.policy.conditions, c => key in c)
        return condition[key]
    }

    // construct FormData object (todo: content-type)

    fd.append('key', `uploadtest/${file.name}`)
    fd.append('x-amz-algorithm', getCondition('x-amz-algorithm'))
    fd.append('x-amz-credential', getCondition('x-amz-credential'))
    fd.append('x-amz-date', getCondition('x-amz-date'))
    fd.append('policy', btoa(JSON.stringify(policy.policy)))
    fd.append('x-amz-signature', policy.signature)
    fd.append('file', file)

    // construct and send XMLHttpRequest

    return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", e => {
            next(assign({}, action, {
                status: Status.REQUESTING,
                progress: e.loaded / e.total
            }))
        })

        xhr.addEventListener("load", e => {
            resolve();
        })

        xhr.addEventListener("error", e => {
            reject(new Error("Error during S3 upload."))
        })

        xhr.open("POST", bucketUrl(store.getState()), true)
        xhr.send(fd)

    })

    
}

function getPolicy() {
    const fetchOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin'   
    }

    return Promise.resolve()
    .then(() => {
        return fetch('/api/mediaitems/policy', fetchOptions)
    })
    .then(response => response.json().then(json => ({ response, json })))
    .then(({ response, json }) => {
        if (!response.ok) {
            return Promise.reject(new Error('Could not fetch policy from server.'))
        }
        return json;
    })
}

// Middleware function which handles 
// the upload process to S3
export default store => next => action => {

    if (action.type !== ActionTypes.UPLOAD_FILE) {
        return next(action)
    }

    function actionWith(data) {
        return assign({}, action, data)
    }

    next(actionWith({
        status: Status.REQUESTING,
        progress: 0
    }))

    // Retrieve S3 POST policy from server
    getPolicy()
    .then(policy => {
        return uploadFile(store, next, action, policy)
    })
    .then(() => {
        next(actionWith({
            status: Status.SUCCESS
        }))
    })
    .catch(error => {
        next(actionWith({
            status: Status.FAILURE,
            error: error
        }))
    })
}