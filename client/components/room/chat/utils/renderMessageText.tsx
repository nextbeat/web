import * as React from 'react'
import inRange from 'lodash-es/inRange'
import assign from 'lodash-es/assign'
import { List } from 'immutable'

import Comment from '@models/entities/comment'
import TemporaryComment from '@models/entities/temporary/comment'
import { hashCode } from '@utils'

type AnnotationType = 'link' | 'hashtag' | 'mention' | 'highlight'

interface GenericAnnotation {
    type: AnnotationType
    start: number
    end: number
}

interface LinkAnnotation extends GenericAnnotation {
    type: 'link'
    displayText: string
    url: string
}

interface MentionAnnotation extends GenericAnnotation {
    type: 'mention'
    username: string
}

interface HashtagAnnotation extends GenericAnnotation {
    type: 'hashtag'
    text: string
}

interface HighlightAnnotation extends GenericAnnotation {
    type: 'highlight'
}

type Annotation = LinkAnnotation | MentionAnnotation | HashtagAnnotation | HighlightAnnotation

function getLinkData(comment: Comment | TemporaryComment): List<LinkAnnotation> {
    var re = /\[(.+)\]\((.+)\)/g 

    let links = List<LinkAnnotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        links.push({ type: 'link', start: result.index, end: result.index+result[0].length, displayText: result[1], url: result[2] })
    }

    return links
}

function getHashtagData(comment: Comment | TemporaryComment): List<Annotation> {
    var re = /(^|\s)#(\w+)/g

    let hashtags = List<Annotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        let start = result[0].indexOf('#')+result.index
        hashtags.push({ type: 'hashtag', start: start, end: start+result[2].length+1, text: `#${result[2]}`})
    }

    return hashtags
}

function preprocessAnnotations(comment: Comment | TemporaryComment, options: RenderMessageOptions): List<Annotation> {
    let mentions = comment.get('user_mentions') || List();
    let highlights = comment.get('result_indices') || List();
    let links = options.includeLinks ? getLinkData(comment) : List<LinkAnnotation>();
    let hashtags = getHashtagData(comment);

    let annotations = List<Annotation>();
    mentions.forEach(m => {
        annotations = annotations.push({ type: 'mention', start: m.get('indices').get(0), end: m.get('indices').get(1), username: m.get('username') })
    })
    highlights.forEach(h => {
        annotations = annotations.push({ type: 'highlight', start: h.get(0) as number, end: h.get(1) as number })
    })
    links.forEach(l => {
        annotations = annotations.push(l)
    })
    hashtags.forEach(h => {
        annotations = annotations.push(h)
    })
    
    return annotations.sort((a1, a2) => a1.start - a2.start || a2.end - a1.end)
}

function elementForAnnotation(annotation: Annotation, annotations: List<Annotation>, message: string, options: RenderMessageOptions): React.ReactElement<any> {
    let type = '';
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

interface RecursiveElementArray {
    [index: number]: string | React.ReactElement<any> | RecursiveElementArray
}
function recursiveCreateElement(start: number, end: number, annotations: List<Annotation>, message: string, options: RenderMessageOptions): RecursiveElementArray | string {

    if (annotations.size === 0) {
        return message.substring(start, end);
    }

    let annotation = annotations.get(0) as Annotation;
    annotations = annotations.shift();

    return [
        recursiveCreateElement(start, annotation.start, List(), message, options),
        elementForAnnotation(annotation, annotations, message, options),
        recursiveCreateElement(annotation.end, end, annotations.filter(a => a.start >= annotation.end), message, options)
    ]
}  

function doRenderMessageText(comment: Comment | TemporaryComment, options: RenderMessageOptions): JSX.Element {
    let annotations = preprocessAnnotations(comment, options)
    let message     = comment.get('message')
    return <span>{recursiveCreateElement(0, message.length, annotations, message, options)}</span>
}

let cache: {[key: number]: JSX.Element} = {}

function memoizedRenderMessageText(comment: Comment | TemporaryComment, options: RenderMessageOptions) {
    let key = hashCode(comment.get('message') + JSON.stringify(comment.get('user_mentions')) + JSON.stringify(comment.get('result_indices')) + JSON.stringify(options))
    if (!cache[key]) {
        cache[key] = doRenderMessageText(comment, options);
    }
    return cache[key]
}

interface RenderMessageOptions {
    onMentionClick?: (username: string) => void
    onHashtagClick?: (text: string) => void
    includeLinks?: boolean
}

export default function renderMessageText(comment: Comment | TemporaryComment, options?: RenderMessageOptions) {
    if (!comment.get('message')) {
        return null;
    }
    
    return memoizedRenderMessageText(comment, options || {})
}