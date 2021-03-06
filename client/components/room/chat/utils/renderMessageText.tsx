import * as React from 'react'
import inRange from 'lodash-es/inRange'
import assign from 'lodash-es/assign'
import { List, Map } from 'immutable'

import Comment from '@models/entities/comment'
import ObjectComment from '@models/objects/comment'
import Emoji from '@models/objects/emoji'
import { hashCode } from '@utils'

type AnnotationType = 'link' | 'hashtag' | 'mention' | 'highlight' | 'emoji' | 'emphasis' | 'subscribe'

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

interface EmojiAnnotation extends GenericAnnotation {
    type: 'emoji'
    emoji: Emoji
}

interface HashtagAnnotation extends GenericAnnotation {
    type: 'hashtag'
    text: string
}

interface HighlightAnnotation extends GenericAnnotation {
    type: 'highlight'
}

interface EmphasisAnnotation extends GenericAnnotation {
    type: 'emphasis'
    text: string
}

interface SubscribeAnnotation extends GenericAnnotation {
    type: 'subscribe'
}

type Annotation = 
    LinkAnnotation | 
    MentionAnnotation | 
    HashtagAnnotation | 
    HighlightAnnotation |
    EmojiAnnotation |
    EmphasisAnnotation |
    SubscribeAnnotation

function getLinkData(comment: Comment | ObjectComment): List<LinkAnnotation> {
    var re = /\[(.+)\]\((.+)\)/g 

    let links = List<LinkAnnotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        links = links.push({ type: 'link', start: result.index, end: result.index+result[0].length, displayText: result[1], url: result[2] })
    }

    return links
}

function getEmphasisData(comment: Comment | ObjectComment): List<EmphasisAnnotation> {
    var re = /\*(\w+)\*/g

    let emphases = List<EmphasisAnnotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        emphases = emphases.push({ type: 'emphasis', start: result.index, end: result.index+result[0].length, text: result[1] })
    }

    return emphases
}

function getHashtagData(comment: Comment | ObjectComment): List<HashtagAnnotation> {
    var re = /(^|\s)#(\w+)/g

    let hashtags = List<HashtagAnnotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        let start = result[0].indexOf('#')+result.index
        hashtags = hashtags.push({ type: 'hashtag', start: start, end: start+result[2].length+1, text: `#${result[2]}`})
    }

    return hashtags
}

function getSubscribeData(comment: Comment | ObjectComment): List<SubscribeAnnotation> {
    var re = /subscribed?/gi

    let data = List<SubscribeAnnotation>()
    let result

    while (result = re.exec(comment.get('message'))) {
        let start = result.index
        data = data.push({ type: 'subscribe', start: start, end: start+result[0].length })
    }

    return data
}

function preprocessAnnotations(comment: Comment | ObjectComment, options: RenderMessageOptions): List<Annotation> {
    let mentions = comment.get('user_mentions') || List();
    let emojis = comment.get('emojis') || List();
    let highlights = comment.get('result_indices') || List();
    let links = options.includeMarkdown ? getLinkData(comment) : List<LinkAnnotation>();
    let emphases = options.includeMarkdown ? getEmphasisData(comment): List<EmphasisAnnotation>();
    let subscribes = options.includeSubscribeHighlight ? getSubscribeData(comment) : List<SubscribeAnnotation>();
    let hashtags = getHashtagData(comment);

    let annotations = List<Annotation>();
    mentions.forEach((m: any) => {
        annotations = annotations.push({ type: 'mention', start: m.get('indices').get(0), end: m.get('indices').get(1), username: m.get('username') })
    })
    emojis.forEach((e: any) => {
        annotations = annotations.push({ type: 'emoji', start: e.get('indices').get(0), end: e.get('indices').get(1), emoji: new Emoji(e)})
    })
    highlights.forEach((h: any) => {
        annotations = annotations.push({ type: 'highlight', start: h.get(0) as number, end: h.get(1) as number })
    })
    links.forEach((l: any) => {
        annotations = annotations.push(l)
    })
    emphases.forEach((e: any) => {
        annotations = annotations.push(e)
    })
    subscribes.forEach((s: any) => {
        annotations = annotations.push(s)
    })
    hashtags.forEach((h: any) => {
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

    const noop = () => {}
    let onMentionClick = options.onMentionClick || noop
    let onHashtagClick = options.onHashtagClick || noop
    let onSubscribeClick = options.onSubscribeClick || noop

    if (annotation.type === 'mention') {
        type = 'a';
        assign(props, { onClick: onMentionClick.bind(this, annotation.username) });
    } else if (annotation.type === 'emoji') {
        type = 'img';
        assign(props, {
            src: annotation.emoji.url(),
            alt: annotation.emoji.get('name')
        })
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
    } else if (annotation.type === 'emphasis') {
        type = 'strong';
        textStart = textStart+1
        textEnd = textEnd-1
    } else if (annotation.type === 'subscribe') {
        type = 'a'
        assign(props, { onClick: onSubscribeClick });
    }
    
    if (type === 'img') {
        // img is a void element, so React throws an error
        // if it is assigned any children
        return React.createElement(type, props)
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

function doRenderMessageText(comment: Comment | ObjectComment, options: RenderMessageOptions): JSX.Element {
    let annotations = preprocessAnnotations(comment, options)
    let message     = comment.get('message')

    return <span>{recursiveCreateElement(0, message.length, annotations, message, options)}</span>
}

let cache: {[key: number]: JSX.Element} = {}

function memoizedRenderMessageText(comment: Comment | ObjectComment, options: RenderMessageOptions) {
    let key = hashCode(comment.get('message') + JSON.stringify(comment.get('user_mentions')) + JSON.stringify(comment.get('emojis')) + JSON.stringify(comment.get('result_indices')) + JSON.stringify(options))
    if (!cache[key]) {
        cache[key] = doRenderMessageText(comment, options);
    }
    return cache[key]
}

interface RenderMessageOptions {
    onMentionClick?: (username: string) => void
    onHashtagClick?: (text: string) => void
    includeMarkdown?: boolean

    includeSubscribeHighlight?: boolean
    onSubscribeClick?: () => void
}

export default function renderMessageText(comment: Comment | ObjectComment, options?: RenderMessageOptions) {
    if (!comment.get('message')) {
        return null;
    }
    
    return memoizedRenderMessageText(comment, options || {})
}