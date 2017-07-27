import React from 'react'
import inRange from 'lodash/inRange'
import assign from 'lodash/assign'
import { List } from 'immutable'
import { hashCode } from '../../../../utils'

function getLinkData(comment) {
    var re = /\[(.+)\]\((.+)\)/g 

    let links = []
    let result

    while (result = re.exec(comment.get('message'))) {
        links.push({ type: 'link', start: result.index, end: result.index+result[0].length, displayText: result[1], url: result[2] })
    }

    return links
}

function getHashtagData(comment) {
    var re = /(^|\s)#(\w+)/g

    let hashtags = []
    let result

    while (result = re.exec(comment.get('message'))) {
        let start = result[0].indexOf('#')+result.index
        hashtags.push({ type: 'hashtag', start: start, end: start+result[2].length+1, text: `#${result[2]}`})
    }

    return hashtags
}

function preprocessAnnotations(comment, { includeLinks=false }) {
    let mentions = comment.get('user_mentions') || List();
    let highlights = comment.get('result_indices') || List();
    let links = includeLinks ? getLinkData(comment) : List();
    let hashtags = getHashtagData(comment);

    let annotations = List();
    mentions.forEach(m => {
        annotations = annotations.push({ type: 'mention', start: m.get('indices').get(0), end: m.get('indices').get(1), username: m.get('username') })
    })
    highlights.forEach(h => {
        annotations = annotations.push({ type: 'highlight', start: h.get(0), end: h.get(1) })
    })
    links.forEach(l => {
        annotations = annotations.push(l)
    })
    hashtags.forEach(h => {
        annotations = annotations.push(h)
    })
    
    return annotations.sort((a1, a2) => a1.start - a2.start || a2.end - a1.end)
}

function elementForAnnotation(annotation, annotations, message, options) {
    let type;
    let props = { 
        className: `chat_item_${annotation.type}`, 
        key: `${annotation.type},${annotation.start},${annotation.end}`
    };
    let textStart = annotation.start;
    let textEnd = annotation.end;

    let onMentionClick = options.onMentionClick || (() => {})
    let onHashtagClick = options.onHashtagClick || (() => {})

    if (annotation.type === 'mention') {
        type = 'a';
        assign(props, { onClick: onMentionClick.bind(this, annotation.username) });
    } else if (annotation.type === 'hashtag') {
        type = 'a';
        assign(props, { onClick: onHashtagClick.bind(this, annotation.text) })
    } else if (annotation.type === 'highlight') {
        type = 'span';
    } else if (annotation.type === 'link') {
        type = 'a';
        assign(props, { 
            target: "_blank",
            rel: "nofollow",
            href: annotation.url
        })
        textStart = textStart+1
        textEnd = textStart+annotation.displayText.length
    }

    return React.createElement(
        type, 
        props, 
        recursiveCreateElement(textStart, textEnd, annotations.filter(a => a.start >= textStart && a.end <= textEnd), message, options)
    );
}

function recursiveCreateElement(start, end, annotations, message, options) {

    if (annotations.size === 0) {
        return message.substring(start, end);
    }

    let annotation = annotations.get(0);
    annotations = annotations.shift();

    return [
        recursiveCreateElement(start, annotation.start, List(), message, options),
        elementForAnnotation(annotation, annotations, message, options),
        recursiveCreateElement(annotation.end, end, annotations.filter(a => a.start >= annotation.end), message, options)
    ]
}  

function doRenderMessageText(comment, options) {
    let annotations = preprocessAnnotations(comment, options)
    let message     = comment.get('message')
    return <span>{recursiveCreateElement(0, message.length, annotations, message, options)}</span>
}

let cache = {}
function memoizedRenderMessageText(comment, options) {
    let key = hashCode(comment.get('message') + JSON.stringify(comment.get('user_mentions')) + JSON.stringify(comment.get('result_indices')) + JSON.stringify(options))
    if (!cache[key]) {
        cache[key] = doRenderMessageText(comment, options);
    }
    return cache[key]
}

export default function renderMessageText(comment, options={}) {
    if (!comment.get('message')) {
        return null;
    }
    
    return memoizedRenderMessageText(comment, options)
}