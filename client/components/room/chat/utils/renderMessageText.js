import React from 'react'
import inRange from 'lodash/inRange'
import { List } from 'immutable'

function renderWithRegexMentions(message, { start, end, onMentionClick }) {
    const re = /(@\w+)/

    return message.substring(start, end).split(re).map((str, idx) => {
        const key = `@${idx}`
        if (str.charAt(0) === '@') {
            const username = str.substring(1)
            return <a key={key} className="chat_mention" onClick={onMentionClick.bind(this, username)}>{str}</a>
        }
        return <span key={key}>{str}</span>
    })
}

function renderWithMentions(comment, { start, end, onMentionClick, forceMentions=false }) {
    if (!comment.get('message')) {
        return null
    }
    
    let message = comment.get('message')
    start = start || 0
    end = end || message.length
    onMentionClick = onMentionClick || (() => {})

    if (forceMentions) {
        // if specified, render as a mention any word starting with the @ symbol
        // and ignore the user_mentions data
        return renderWithRegexMentions(message, { start, end, onMentionClick })
    }

    let mentions = comment.get('user_mentions') || List()
    let inclusiveMentions = mentions.filter(m => inRange(m.get('indices').get(0), start, end))

    // construct an array of <span>s using index data in mentions
    let elems   = [] 
    let idx     = start // keeps track of current index of string
    inclusiveMentions.forEach(m => {
        const [mStart, mEnd] = m.get('indices').toJS()
        elems.push(<span key={`${idx},${mStart}`}>{ message.substring(idx, mStart) }</span>)

        const mentionKey = `${mStart},${mEnd}`
        const url = `/u/${m.get('username')}`
        elems.push(
            <a key={mentionKey} className="chat_mention" onClick={onMentionClick.bind(this, m.get('username'))}>
                { message.substring(mStart, mEnd) }
            </a>
        )

        idx = mEnd
    })
    elems.push(<span key={`${idx},${end}`}>{ message.substring(idx, end) }</span>)

    return elems
}


export default function renderMessageText(comment, { onMentionClick, forceMentions=false, includeLinks=false } = {}) {
    if (!includeLinks) {
        return renderWithMentions(comment, { onMentionClick, forceMentions })
    }

    // if includeLinks is true, format URLs using Markdown format [display](url)
    var re = /\[(.+)\]\((.+)\)/g 

    let elems = []
    let key = 0
    let lastIndex = 0
    let result

    while (result = re.exec(comment.get('message'))) {
        elems.push(<span key={key}>{renderWithMentions(comment, { start: lastIndex, end: result.index, onMentionClick, forceMentions })}</span>)

        let displayText = result[1]
        let url = result[2]
        elems.push(<a target="_blank" rel="nofollow" href={url} key={key+1}>{displayText}</a>)

        key += 2
        lastIndex = re.lastIndex
    }

    elems.push(<span key={key}>{renderWithMentions(comment, { start: lastIndex, onMentionClick, forceMentions })}</span>)

    return elems

}